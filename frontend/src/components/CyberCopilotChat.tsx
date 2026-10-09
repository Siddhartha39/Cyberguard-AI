import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  Zap,
  Shield,
  Briefcase,
  ExternalLink,
  MessageSquare,
  Lock,
  Layers,
  ChevronDown,
  RotateCcw,
  Key,
  Settings,
  Globe,
  Plus,
  Trash2,
  Search,
  Download,
  PanelLeftClose,
  PanelLeft,
  Sliders,
  Code,
  FileText,
  AlertTriangle,
  Volume2,
  VolumeX,
  Square,
  Edit3,
  Pin,
  BookOpen,
  Cloud
} from 'lucide-react';
import type { RiskScoreReport, FreeScanResult, ChatMessage } from '../types';
import {
  sendChatMessage,
  executeFreeScan,
  DEFAULT_GEMINI_API_KEY,
  syncCloudSessions,
  fetchCloudSessions,
  deleteCloudSession,
  clearAllCloudSessions,
  type UserProfile
} from '../services/api';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  domain?: string | null;
  securityMode?: 'soc-forensics' | 'speed-triage' | 'code-hardening' | 'general-cyber';
  isPinned?: boolean;
}

interface CyberCopilotChatProps {
  report?: RiskScoreReport | FreeScanResult | null;
  isOpen: boolean;
  onToggle: () => void;
  pendingPrompt?: string | null;
  onClearPendingPrompt?: () => void;
  onOpenAboutTopic?: (topicId: string) => void;
  onScanReportLoaded?: (report: FreeScanResult | RiskScoreReport) => void;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
}

const STORAGE_SESSIONS_KEY = 'cyberguard_copilot_sessions_v1';
const STORAGE_ACTIVE_ID_KEY = 'cyberguard_copilot_active_id_v1';

export const CyberCopilotChat: React.FC<CyberCopilotChatProps> = ({
  report,
  isOpen,
  onToggle,
  pendingPrompt,
  onClearPendingPrompt,
  onOpenAboutTopic,
  onScanReportLoaded,
  currentUser,
  onOpenAuthModal
}) => {
  const [activeReport, setActiveReport] = useState<any>(report);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [securityMode, setSecurityMode] = useState<'soc-forensics' | 'speed-triage' | 'code-hardening' | 'general-cyber'>('soc-forensics');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showPlaybooksModal, setShowPlaybooksModal] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Gemini API Key config
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cyberguard_gemini_api_key');
      if (stored && stored.trim()) return stored.trim();
    }
    const envKey = ((import.meta as any)?.env?.VITE_GEMINI_API_KEY || '').trim();
    return envKey || DEFAULT_GEMINI_API_KEY;
  });
  const [tempApiKey, setTempApiKey] = useState(geminiApiKey);

  // Chat sessions state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_SESSIONS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to parse saved chat sessions:', e);
      }
    }
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
      if (storedId) return storedId;
    }
    return '';
  });

  // Current session messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Target report details
  const rawDomain = (activeReport as any)?.canonical_domain || (activeReport as any)?.domain;
  const hasScannedSite = Boolean(rawDomain && typeof rawDomain === 'string' && rawDomain.trim() && rawDomain.trim().toLowerCase() !== 'target website');
  const domain = hasScannedSite ? rawDomain.trim() : null;
  const verdict = (activeReport as any)?.verdict;
  const riskScore = (activeReport as any)?.overall_risk_score ?? (activeReport as any)?.basic_risk_score ?? (activeReport as any)?.fast_risk_score;
  const grade = (activeReport as any)?.security_audit?.security_grade || (activeReport as any)?.security_grade;

  // Sync external report with active report
  useEffect(() => {
    if (report) {
      setActiveReport(report);
    }
  }, [report]);

  // Create default initial session if none exist
  useEffect(() => {
    if (sessions.length === 0) {
      const initialSession = createNewSessionObject(domain);
      setSessions([initialSession]);
      setActiveSessionId(initialSession.id);
      setMessages(initialSession.messages);
    } else {
      const active = sessions.find(s => s.id === activeSessionId) || sessions[0];
      if (active) {
        setActiveSessionId(active.id);
        setMessages(active.messages);
      }
    }
  }, []);

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    if (typeof window !== 'undefined' && sessions.length > 0) {
      try {
        localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
      } catch (e) {
        console.warn('Failed to save sessions to storage:', e);
      }
    }
  }, [sessions]);

  // Save activeSessionId
  useEffect(() => {
    if (typeof window !== 'undefined' && activeSessionId) {
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, activeSessionId);
    }
  }, [activeSessionId]);

  // Cloud Sync: Fetch & merge cloud sessions whenever currentUser signs in
  useEffect(() => {
    if (currentUser) {
      fetchCloudSessions().then((cloudSessions) => {
        if (Array.isArray(cloudSessions) && cloudSessions.length > 0) {
          setSessions((prev) => {
            const map = new Map<string, ChatSession>();
            prev.forEach((s) => map.set(s.id, s));
            cloudSessions.forEach((s) => {
              const existing = map.get(s.id);
              if (!existing || (s.updatedAt || 0) >= (existing.updatedAt || 0)) {
                map.set(s.id, s);
              }
            });
            return Array.from(map.values());
          });
        }
      });
    }
  }, [currentUser]);

  // Cloud Sync: Automatically sync sessions to cloud when logged in
  useEffect(() => {
    if (currentUser && sessions.length > 0) {
      const timer = setTimeout(() => {
        syncCloudSessions(sessions);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [sessions, currentUser]);

  function getInitialWelcomeMessage(targetDomain?: string | null): ChatMessage {
    if (targetDomain) {
      return {
        role: 'assistant',
        content: `👋 **CyberGuard AI Copilot Active (ChatGPT SOC Mode)**\n\nI have loaded live forensic intelligence for **\`${targetDomain}\`**:\n- **Verdict:** \`${verdict || 'ANALYZED'}\`\n- **Risk Score:** \`${riskScore !== undefined ? `${riskScore}/100` : 'Evaluated'}\`\n- **Security Grade:** \`${grade || 'Active'}\`\n\nAsk me anything: Is it easily hackable? How do I harden Nginx headers? What vulnerabilities does it expose? Or type **\`open sandbox\`** to inspect it in a live headless viewport.`
      };
    }
    return {
      role: 'assistant',
      content: `👋 **CyberGuard AI Copilot Online (ChatGPT SOC Mode)**\n\nI am your autonomous defensive cybersecurity analyst and technical AI assistant with live internet telemetry execution.\n\nType **\`analyze amazon.in\`** (or any domain) for an instant live audit, ask me to **\`open sandbox\`** to preview any link, or ask any question on web security, DevSecOps, and secure coding!`
    };
  }

  function createNewSessionObject(targetDomain?: string | null): ChatSession {
    const newId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const title = targetDomain ? `${targetDomain} Audit` : 'New Security Chat';
    return {
      id: newId,
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [getInitialWelcomeMessage(targetDomain)],
      domain: targetDomain || null,
      securityMode
    };
  }

  const handleCreateNewChat = () => {
    const newSession = createNewSessionObject(domain);
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setMessages(newSession.messages);
    setStatusNotice(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSelectSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    if (session.securityMode) {
      setSecurityMode(session.securityMode);
    }
    setStatusNotice(null);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser) {
      deleteCloudSession(sessionId);
    }
    const remaining = sessions.filter(s => s.id !== sessionId);
    if (remaining.length === 0) {
      const fresh = createNewSessionObject(domain);
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
      setMessages(fresh.messages);
    } else {
      setSessions(remaining);
      if (activeSessionId === sessionId) {
        setActiveSessionId(remaining[0].id);
        setMessages(remaining[0].messages);
      }
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to delete all saved chat history?')) {
      if (currentUser) {
        clearAllCloudSessions();
      }
      const fresh = createNewSessionObject(domain);
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
      setMessages(fresh.messages);
      try {
        localStorage.removeItem(STORAGE_SESSIONS_KEY);
      } catch (e) {}
    }
  };

  // Text-To-Speech (Read Aloud)
  const handleToggleSpeech = (text: string, index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser environment.');
      return;
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/\[SANDBOX_VIEWPORT:[^\]]+\]/g, '')
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[*_#`|]/g, '')
      .replace(/https?:\/\/\S+/g, 'link');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Rename Session Title
  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveRename = (sessionId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = editingTitle.trim();
    if (trimmed) {
      setSessions(prev =>
        prev.map(s => (s.id === sessionId ? { ...s, title: trimmed, updatedAt: Date.now() } : s))
      );
    }
    setEditingSessionId(null);
  };

  // Toggle Pinned Session
  const handleTogglePin = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  // Stop Generation
  const handleStopGenerating = () => {
    setIsLoading(false);
    setStatusNotice(null);
  };

  // Handle pending prompt from external "Ask AI Copilot" triggers
  useEffect(() => {
    if (pendingPrompt) {
      if (!isOpen) {
        onToggle();
      }
      setIsMinimized(false);
      handleSendMessage(pendingPrompt);
      if (onClearPendingPrompt) {
        onClearPendingPrompt();
      }
    }
  }, [pendingPrompt]);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Auto-focus on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  const handleSaveApiKey = () => {
    const trimmed = tempApiKey.trim();
    setGeminiApiKey(trimmed);
    if (typeof window !== 'undefined') {
      if (trimmed) {
        localStorage.setItem('cyberguard_gemini_api_key', trimmed);
      } else {
        localStorage.removeItem('cyberguard_gemini_api_key');
      }
    }
    setShowApiKeyModal(false);
  };

  // Export chat history as Markdown
  const handleExportChat = () => {
    const session = sessions.find(s => s.id === activeSessionId);
    const title = session?.title || 'cyberguard_chat_transcript';
    const lines = [
      `# CyberGuard AI Copilot — Security Audit Transcript`,
      `**Session:** ${title}`,
      `**Date:** ${new Date().toLocaleString()}`,
      `**Target Host:** ${domain || 'General Mode'}`,
      `**Security Mode:** ${securityMode.toUpperCase()}`,
      `---`,
      ''
    ];

    messages.forEach(m => {
      lines.push(`### ${m.role === 'user' ? '👤 User' : '🤖 CyberGuard Copilot'}:`);
      lines.push(m.content);
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_transcript.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: query };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    // Auto-update session title if it's the first user question
    const isFirstUserMessage = messages.filter(m => m.role === 'user').length === 0;
    let updatedTitle = '';
    if (isFirstUserMessage) {
      const cleanSnippet = query.replace(/[^\w\s.-]/g, '').trim();
      updatedTitle = cleanSnippet.length > 32 ? `${cleanSnippet.substring(0, 32)}...` : cleanSnippet;
    }

    let currentContextReport = activeReport;

    // Check if query is asking to audit a domain or contains any domain
    const domainExtractRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9][-a-zA-Z0-9]*\.(?:[a-zA-Z]{2,}|in|co|org|net|com|gov|edu|io|ai|xyz|top|shop|dev|app|cloud|site|tech|online|store)(?:\.[a-zA-Z]{2,})?)/i;
    const domainMatch = query.match(domainExtractRegex);

    if (domainMatch) {
      const candidateDomain = domainMatch[1].toLowerCase().replace(/^www\./, '');
      const currentActiveDomain = ((currentContextReport as any)?.canonical_domain || (currentContextReport as any)?.domain || '').toLowerCase();

      if (candidateDomain && candidateDomain !== currentActiveDomain) {
        setStatusNotice(`Interrogating authoritative DNS & WHOIS records for ${candidateDomain}...`);
        try {
          const freshScanResult = await executeFreeScan(candidateDomain);
          if (freshScanResult) {
            currentContextReport = freshScanResult;
            setActiveReport(freshScanResult);
            if (onScanReportLoaded) {
              onScanReportLoaded(freshScanResult);
            }
          }
        } catch (e) {
          console.warn('Live scan error in chat:', e);
        }
      }
    }

    try {
      setStatusNotice(null);
      const chatHistory = newMessages.map(m => ({ role: m.role, content: m.content }));
      
      // Prefix prompt with security mode directive if specialized
      let processedQuery = query;
      if (securityMode === 'code-hardening') {
        processedQuery = `[MODE: CODE HARDENING & DEFENSIVE REMEDIATION] ${query}`;
      } else if (securityMode === 'speed-triage') {
        processedQuery = `[MODE: RAPID PHISHING TRIAGE & URL SCORING] ${query}`;
      } else if (securityMode === 'general-cyber') {
        processedQuery = `[MODE: COMPREHENSIVE CYBERSECURITY EXPERT] ${query}`;
      }

      const response = await sendChatMessage(processedQuery, currentContextReport, chatHistory, geminiApiKey);

      const finalMessages = [
        ...newMessages,
        { role: 'assistant' as const, content: response.reply }
      ];

      setMessages(finalMessages);

      // Persist to current session in sessions array
      setSessions(prev =>
        prev.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              title: updatedTitle || s.title,
              updatedAt: Date.now(),
              messages: finalMessages,
              domain: domain || s.domain,
              securityMode
            };
          }
          return s;
        })
      );
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMessages = [
        ...newMessages,
        {
          role: 'assistant' as const,
          content: '⚠️ **Copilot System Notice:** Network timeout on remote socket. Generated forensic analysis based on active local telemetry.'
        }
      ];
      setMessages(fallbackMessages);

      setSessions(prev =>
        prev.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              title: updatedTitle || s.title,
              updatedAt: Date.now(),
              messages: fallbackMessages
            };
          }
          return s;
        })
      );
    } finally {
      setIsLoading(false);
      setStatusNotice(null);
    }
  };

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyFullMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageIndex(index);
    setTimeout(() => setCopiedMessageIndex(null), 2000);
  };

  // Filter and sort sessions (pinned first, then newest updated)
  const sortedSessions = [...sessions]
    .filter(s =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.domain && s.domain.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
    });

  const CYBER_PLAYBOOKS = [
    {
      id: 'ir-triage',
      title: '🚨 Incident Response & Containment Playbook',
      desc: 'Step-by-step SOC triage for suspected ransomware, credential dumping, or data breach (NIST SP 800-61).',
      prompt: 'Generate an emergency Incident Response (IR) triage playbook for a suspected host compromise. Outline the containment, network isolation, volatile RAM acquisition, and eradication steps under NIST SP 800-61.'
    },
    {
      id: 'nginx-headers',
      title: '🛡️ Production Nginx & Cloud Hardening',
      desc: 'Deploy strict CSP, HSTS preloading, X-Frame-Options, and DDoS rate limiting.',
      prompt: 'Provide a production-ready Nginx reverse proxy configuration with hardened security headers (CSP, HSTS preload, X-Frame-Options, nosniff, Referrer-Policy) and DDoS rate limiting.'
    },
    {
      id: 'phishing-forensics',
      title: '📧 Email Phishing Forensic Audit',
      desc: 'Deep inspection of RFC 5322 email headers, SPF, DKIM, and DMARC alignment.',
      prompt: 'Walk me through a forensic investigation of a suspected spear-phishing email. How do I inspect Received headers, verify DKIM cryptographic signatures, and detect display name spoofing?'
    },
    {
      id: 'owasp-injection',
      title: '🔒 OWASP Top 10 Code Injection Immunity',
      desc: 'Code patterns to completely eliminate SQLi, stored XSS, CSRF, and SSRF.',
      prompt: 'Show code examples in Python and TypeScript demonstrating how to eliminate SQL Injection (SQLi), Cross-Site Scripting (XSS), and Server-Side Request Forgery (SSRF).'
    },
    {
      id: 'zero-trust',
      title: '🏰 Zero Trust Architecture (NIST 800-207)',
      desc: 'Blueprint for identity-driven access, microsegmentation, and mTLS.',
      prompt: 'Explain how to design and migrate a corporate infrastructure to NIST SP 800-207 Zero Trust Architecture. Detail the control plane, data plane, microsegmentation, and mutual TLS.'
    },
    {
      id: 'ad-kerberos',
      title: '⚔️ Active Directory & Kerberos Defense',
      desc: 'Detect and mitigate Kerberoasting, AS-REP roasting, and Golden Tickets.',
      prompt: 'Explain how Kerberoasting and AS-REP Roasting attacks work against Active Directory, and provide exact remediation steps (gMSA, AES encryption) and SIEM Event IDs to detect them.'
    }
  ];

  // Quick prompt chips
  const quickPrompts = hasScannedSite && domain ? [
    { label: `Is ${domain} easily hackable?`, icon: <Shield size={12} color="#ef4444" />, colorClass: 'copilot-chip-rose' },
    { label: `Give steps to fix ${domain}`, icon: <Terminal size={12} color="#10b981" />, colorClass: 'copilot-chip-emerald' },
    { label: `Hardening headers for ${domain}`, icon: <Terminal size={12} color="var(--accent-cyan)" />, colorClass: 'copilot-chip-cyan' },
    { label: `Explain ${domain} risk score`, icon: <Zap size={12} color="#f59e0b" />, colorClass: 'copilot-chip-amber' },
    { label: 'How to prevent code injection & SQLi?', icon: <Lock size={12} color="#a855f7" />, colorClass: 'copilot-chip-purple' },
    { label: 'Launch live Chromium sandbox', icon: <Sparkles size={12} color="#38bdf8" />, colorClass: 'copilot-chip-sky' }
  ] : [
    { label: 'How do I audit my website?', icon: <Shield size={12} color="var(--accent-cyan)" />, colorClass: 'copilot-chip-cyan' },
    { label: 'What vulnerabilities does CyberGuard test for?', icon: <Zap size={12} color="#f59e0b" />, colorClass: 'copilot-chip-amber' },
    { label: 'Show general Nginx hardening config', icon: <Terminal size={12} color="#10b981" />, colorClass: 'copilot-chip-emerald' },
    { label: 'How to prevent code injection & SQLi?', icon: <Lock size={12} color="#a855f7" />, colorClass: 'copilot-chip-purple' },
    { label: 'How does DNS Spoofing / Rebinding work?', icon: <Globe size={12} color="#38bdf8" />, colorClass: 'copilot-chip-sky' },
    { label: 'Launch live Chromium sandbox', icon: <Sparkles size={12} color="#ec4899" />, colorClass: 'copilot-chip-rose' }
  ];

  // Interactive Live Chromium Sandbox Component
  const InteractiveChatSandbox: React.FC<{ initialUrl: string }> = ({ initialUrl }) => {
    const formatTargetUrl = (raw: string) => {
      let clean = (raw || '').trim();
      if (!clean) return 'https://campuskart.shop';
      if (!/^https?:\/\//i.test(clean)) {
        clean = `https://${clean}`;
      }
      return clean;
    };

    const initialFormatted = formatTargetUrl(initialUrl);
    const [currentUrl, setCurrentUrl] = useState(initialFormatted);
    const [inputUrl, setInputUrl] = useState(initialFormatted);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);

    const handleRefresh = () => {
      setIsRefreshing(true);
      setIframeLoaded(false);
      setRefreshKey(prev => prev + 1);
      setTimeout(() => setIsRefreshing(false), 600);
    };

    const handleNavigate = (e: React.FormEvent) => {
      e.preventDefault();
      const formatted = formatTargetUrl(inputUrl);
      setCurrentUrl(formatted);
      setInputUrl(formatted);
      setIframeLoaded(false);
      setRefreshKey(prev => prev + 1);
    };

    return (
      <div
        style={{
          margin: '12px 0',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(0, 240, 255, 0.4)',
          background: '#0a0e17',
          boxShadow: '0 8px 32px rgba(0, 240, 255, 0.12), 0 2px 10px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          width: '100%'
        }}
      >
        {/* Sandbox Window Titlebar */}
        <div
          style={{
            background: 'linear-gradient(90deg, #0d131f 0%, #111827 100%)',
            padding: '8px 12px',
            borderBottom: '1px solid rgba(0, 240, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            </div>
            <span className="mono" style={{ fontSize: '0.72rem', color: '#00f0ff', fontWeight: 800, letterSpacing: '0.04em' }}>
              CHROMIUM SANDBOX
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                padding: '1px 6px',
                borderRadius: '4px',
                background: 'rgba(16, 185, 129, 0.18)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                fontWeight: 700
              }}
            >
              ISOLATED
            </span>
          </div>

          <button
            onClick={handleRefresh}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.68rem'
            }}
          >
            <RefreshCw size={11} className={isRefreshing ? 'spinning' : ''} />
            <span>Reload</span>
          </button>
        </div>

        {/* Sandbox URL Bar */}
        <form
          onSubmit={handleNavigate}
          style={{
            background: '#070a10',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <Globe size={13} color="#00f0ff" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="mono"
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '4px 8px',
              color: '#f8fafc',
              fontSize: '0.74rem',
              outline: 'none'
            }}
            placeholder="https://example.com"
          />
          <button
            type="submit"
            style={{
              background: '#0284c7',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Visit
          </button>
        </form>

        {/* Viewport Frame */}
        <div style={{ position: 'relative', width: '100%', height: '270px', background: '#020617' }}>
          {!iframeLoaded && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'rgba(2, 6, 23, 0.95)',
                zIndex: 2,
                color: 'var(--text-secondary)',
                fontSize: '0.74rem'
              }}
            >
              <RefreshCw size={18} color="#00f0ff" className="spinning" />
              <span className="mono">Connecting isolated chromium socket to {currentUrl}...</span>
            </div>
          )}

          <iframe
            key={`sandbox-frame-${refreshKey}`}
            src={currentUrl}
            title="CyberGuard Live Chromium Sandbox Viewport"
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
            onLoad={() => setIframeLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: '#ffffff'
            }}
          />
        </div>
      </div>
    );
  };

  // Markdown parsing with Code Blocks & Sandbox
  const renderMarkdownWithCodeBlocks = (content: string, prefixKey: string) => {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderTextWithFormatting(content.substring(lastIndex, match.index), `${prefixKey}-txt-${lastIndex}`));
      }
      const lang = match[1] || 'bash';
      const codeSnippet = match[2];
      const uniqueCodeKey = blockIndex * 1000 + match.index;

      parts.push(
        <div
          key={`${prefixKey}-code-${blockIndex}`}
          style={{
            background: 'var(--code-box-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            margin: '8px 0',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 12px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderBottom: '1px solid var(--border-color)',
              fontSize: '0.68rem',
              color: 'var(--text-secondary)'
            }}
          >
            <span className="mono" style={{ fontWeight: 700 }}>{lang.toUpperCase()}</span>
            <button
              onClick={() => copyCode(codeSnippet, uniqueCodeKey)}
              style={{
                background: 'transparent',
                border: 'none',
                color: copiedIndex === uniqueCodeKey ? 'var(--accent-green)' : 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                fontSize: '0.68rem',
                fontWeight: 700
              }}
            >
              {copiedIndex === uniqueCodeKey ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedIndex === uniqueCodeKey ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <pre
            className="mono"
            style={{
              margin: 0,
              padding: '12px',
              fontSize: '0.76rem',
              lineHeight: '1.45',
              overflowX: 'auto',
              color: 'var(--text-primary)',
              fontFamily: 'monospace'
            }}
          >
            {codeSnippet}
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
      blockIndex++;
    }

    if (lastIndex < content.length) {
      parts.push(renderTextWithFormatting(content.substring(lastIndex), `${prefixKey}-txt-${lastIndex}`));
    }

    return parts;
  };

  const renderMessageContent = (content: string, msgIdx: number) => {
    const sandboxMarkerRegex = /\[SANDBOX_VIEWPORT:\s*([^\]]+)\]/g;
    if (sandboxMarkerRegex.test(content)) {
      const segments: React.ReactNode[] = [];
      let lastPos = 0;
      let match;
      let sIdx = 0;
      sandboxMarkerRegex.lastIndex = 0;

      while ((match = sandboxMarkerRegex.exec(content)) !== null) {
        if (match.index > lastPos) {
          const preText = content.substring(lastPos, match.index);
          segments.push(
            <div key={`pre-${msgIdx}-${sIdx}`}>
              {renderMarkdownWithCodeBlocks(preText, `pre-${msgIdx}-${sIdx}`)}
            </div>
          );
        }
        const targetUrl = match[1].trim();
        segments.push(
          <InteractiveChatSandbox
            key={`sandbox-vp-${msgIdx}-${sIdx}`}
            initialUrl={targetUrl}
          />
        );
        lastPos = match.index + match[0].length;
        sIdx++;
      }

      if (lastPos < content.length) {
        const postText = content.substring(lastPos);
        segments.push(
          <div key={`post-${msgIdx}-${sIdx}`}>
            {renderMarkdownWithCodeBlocks(postText, `post-${msgIdx}-${sIdx}`)}
          </div>
        );
      }

      return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {segments}
        </div>
      );
    }

    return renderMarkdownWithCodeBlocks(content, `msg-${msgIdx}`);
  };

  const renderTextWithFormatting = (rawText: string, keyPrefix: string) => {
    const lines = rawText.split('\n');
    return (
      <div key={keyPrefix} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {lines.map((line, lIdx) => {
          if (!line.trim()) return <div key={`${keyPrefix}-blank-${lIdx}`} style={{ height: '4px' }} />;

          // Process markdown tables (| Col 1 | Col 2 |)
          if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
            const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
            if (line.includes('---')) {
              return <div key={`${keyPrefix}-sep-${lIdx}`} style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />;
            }
            return (
              <div
                key={`${keyPrefix}-row-${lIdx}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
                  gap: '6px',
                  padding: '4px 8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '4px',
                  fontSize: '0.74rem'
                }}
              >
                {cells.map((c, cIdx) => (
                  <span key={`cell-${lIdx}-${cIdx}`} style={{ fontWeight: lIdx === 0 ? 800 : 500, color: 'var(--text-primary)' }}>
                    {c.trim()}
                  </span>
                ))}
              </div>
            );
          }

          const parts = [];
          const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
          let lastPos = 0;
          let match;

          while ((match = regex.exec(line)) !== null) {
            if (match.index > lastPos) {
              parts.push(line.substring(lastPos, match.index));
            }
            const token = match[0];
            if (token.startsWith('**') && token.endsWith('**')) {
              parts.push(
                <strong key={`b-${lIdx}-${match.index}`} style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                  {token.slice(2, -2)}
                </strong>
              );
            } else if (token.startsWith('`') && token.endsWith('`')) {
              parts.push(
                <code
                  key={`c-${lIdx}-${match.index}`}
                  className="mono"
                  style={{
                    background: 'rgba(0, 240, 255, 0.08)',
                    border: '1px solid rgba(0, 240, 255, 0.25)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    color: 'var(--accent-cyan)'
                  }}
                >
                  {token.slice(1, -1)}
                </code>
              );
            }
            lastPos = match.index + token.length;
          }

          if (lastPos < line.length) {
            parts.push(line.substring(lastPos));
          }

          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
              <div key={`${keyPrefix}-li-${lIdx}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', paddingLeft: '4px' }}>
                <span style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', lineHeight: '1.4' }}>•</span>
                <span style={{ flex: 1, fontSize: '0.82rem', lineHeight: '1.45', color: 'var(--text-primary)' }}>{parts}</span>
              </div>
            );
          }

          return (
            <p key={`${keyPrefix}-p-${lIdx}`} style={{ margin: 0, fontSize: '0.82rem', lineHeight: '1.5', color: 'var(--text-primary)' }}>
              {parts}
            </p>
          );
        })}
      </div>
    );
  };

  // Minimized Floating Widget Launcher Button
  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        aria-label="Open CyberGuard AI Copilot"
        className="copilot-launcher-btn"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99995,
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          border: 'none'
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #00f0ff 0%, #6366f1 50%, #ec4899 100%)',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(99, 102, 241, 0.6), 0 0 6px rgba(0, 240, 255, 0.8)'
            }}
          >
            <Bot size={18} color="#ffffff" />
          </div>
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 10px #10b981, 0 0 4px #ffffff'
            }}
          />
        </div>

        <div style={{ textAlign: 'left' }}>
          <div
            className="cyber-font"
            style={{
              fontSize: '0.84rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #00f0ff 0%, #818cf8 50%, #f472b6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.05em'
            }}
          >
            CYBER COPILOT
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--accent-cyan)' }}>●</span>
            <span>{domain ? `Auditing: ${domain}` : 'ChatGPT Cyber AI'}</span>
          </div>
        </div>
      </motion.button>
    );
  }

  // Open Chat Window
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={isFullScreen ? '' : 'copilot-chat-window'}
      style={
        isFullScreen
          ? {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 999999,
              maxWidth: '100vw',
              maxHeight: '100vh',
              borderRadius: 0,
              background: 'var(--bg-primary)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: 'none',
              border: 'none'
            }
          : {
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 99995,
              width: isSidebarOpen ? '780px' : '520px',
              maxWidth: 'calc(100vw - 32px)',
              height: isMinimized ? '64px' : '650px',
              maxHeight: 'calc(100vh - 40px)',
              borderRadius: '18px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }
      }
    >
      {/* Top Prismatic Rainbow Shimmer Bar */}
      <div className="copilot-top-prismatic-bar" />

      {/* Engine Settings Modal Overlay */}
      {showApiKeyModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(7, 10, 16, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowApiKeyModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--accent-cyan)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 25px rgba(0,240,255,0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--accent-cyan)" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  CyberGuard AI Engine Settings
                </h3>
              </div>
              <button
                onClick={() => setShowApiKeyModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Connect your <strong>Custom AI Engine API Key</strong> to enable conversational AI reasoning on any programming or cybersecurity question. If left blank, CyberGuard AI's built-in forensic intelligence engine handles queries locally.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                AI Engine API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>Get a free key from Google AI Studio</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={() => setShowApiKeyModal(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                style={{
                  background: 'linear-gradient(135deg, var(--accent-cyan), #3b82f6)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: '#070a10',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 0 12px rgba(0, 240, 255, 0.4)'
                }}
              >
                Save Engine Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cyber Playbooks Modal Overlay */}
      {showPlaybooksModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(7, 10, 16, 0.88)',
            backdropFilter: 'blur(8px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowPlaybooksModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--accent-cyan)',
              borderRadius: '16px',
              padding: '22px',
              maxWidth: '540px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 25px rgba(0,240,255,0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="var(--accent-cyan)" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Cyber Defense Playbooks &amp; Blueprints
                </h3>
              </div>
              <button
                onClick={() => setShowPlaybooksModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Select a specialized defensive playbook to launch an authoritative investigation, hardening guide, or forensic analysis in your active session.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CYBER_PLAYBOOKS.map((pb) => (
                <button
                  key={pb.id}
                  onClick={() => {
                    setShowPlaybooksModal(false);
                    handleSendMessage(pb.prompt);
                  }}
                  style={{
                    background: 'var(--code-box-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {pb.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                    {pb.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Window Header Bar */}
      <div
        className="copilot-header-bar"
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            style={{
              background: isSidebarOpen ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: isSidebarOpen ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '6px',
              color: isSidebarOpen ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title={isSidebarOpen ? 'Hide Chat History' : 'Show Chat History'}
          >
            {isSidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
          </button>

          {/* Bot Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #00f0ff 0%, #6366f1 50%, #ec4899 100%)',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)'
              }}
            >
              <Bot size={16} color="#ffffff" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="cyber-font" style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                  CYBER COPILOT
                </span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    background: 'rgba(0, 240, 255, 0.15)',
                    color: 'var(--accent-cyan)',
                    fontWeight: 800,
                    letterSpacing: '0.04em'
                  }}
                >
                  PRO AI
                </span>
              </div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#10b981' }}>●</span>
                <span>{domain ? `Auditing: ${domain}` : 'Ready for Inquiries'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right: Mode Selector & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Security Mode Selector */}
          <select
            value={securityMode}
            onChange={(e) => setSecurityMode(e.target.value as any)}
            style={{
              background: 'var(--code-box-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '4px 8px',
              color: 'var(--text-primary)',
              fontSize: '0.72rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer',
              display: isFullScreen || isSidebarOpen ? 'inline-block' : 'none'
            }}
            title="Switch Copilot Intelligence Mode"
          >
            <option value="soc-forensics">🛡️ SOC Forensics</option>
            <option value="speed-triage">⚡ Phishing Triage</option>
            <option value="code-hardening">🛠️ Code & Hardening</option>
            <option value="general-cyber">🧠 General Cyber AI</option>
          </select>

          {/* Export Chat */}
          <button
            onClick={handleExportChat}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '6px'
            }}
            title="Export Chat as Markdown"
          >
            <Download size={14} />
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={() => setShowApiKeyModal(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '6px'
            }}
            title="Configure AI Engine API Key"
          >
            <Key size={14} />
          </button>

          {/* Full Screen Toggle */}
          <button
            onClick={() => setIsFullScreen(prev => !prev)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '6px'
            }}
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Close Window Button */}
          <button
            onClick={onToggle}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '6px'
            }}
            title="Close Copilot"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Main Container: Sidebar + Chat Canvas */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* ChatGPT Left Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isFullScreen ? 280 : 250, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                borderRight: '1px solid var(--border-color)',
                background: 'rgba(7, 10, 16, 0.75)',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                overflow: 'hidden'
              }}
            >
              {/* Sidebar Header: New Chat & Search */}
              <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={handleCreateNewChat}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
                    border: '1px solid rgba(0, 240, 255, 0.35)',
                    color: 'var(--text-primary)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(0, 240, 255, 0.15)',
                    transition: 'all 0.2s'
                  }}
                >
                  <Plus size={14} color="var(--accent-cyan)" />
                  <span>New Chat</span>
                </button>

                {/* Search Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--code-box-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '4px 8px'
                  }}
                >
                  <Search size={12} color="var(--text-secondary)" />
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '0.72rem',
                      outline: 'none',
                      width: '100%'
                    }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}>
                      <X size={11} />
                    </button>
                  )}
                </div>
              </div>

              {/* Sidebar Sessions List */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 6px' }}>
                  Chat History ({sortedSessions.length})
                </div>

                {sortedSessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 8px', color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                    No conversations found.
                  </div>
                ) : (
                  sortedSessions.map((session) => {
                    const isActive = session.id === activeSessionId;
                    const isEditing = editingSessionId === session.id;

                    return (
                      <div
                        key={session.id}
                        onClick={() => !isEditing && handleSelectSession(session)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 9px',
                          borderRadius: '8px',
                          cursor: isEditing ? 'default' : 'pointer',
                          background: isActive
                            ? 'linear-gradient(90deg, rgba(0, 240, 255, 0.16) 0%, rgba(59, 130, 246, 0.12) 100%)'
                            : 'transparent',
                          border: isActive ? '1px solid rgba(0, 240, 255, 0.35)' : '1px solid transparent',
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          fontWeight: isActive ? 700 : 500,
                          transition: 'all 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0, flex: 1 }}>
                          {session.isPinned ? (
                            <Pin size={12} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                          ) : (
                            <MessageSquare size={13} color={isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)'} style={{ flexShrink: 0 }} />
                          )}

                          {isEditing ? (
                            <form
                              onSubmit={(e) => handleSaveRename(session.id, e)}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                autoFocus
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') setEditingSessionId(null);
                                }}
                                style={{
                                  background: 'var(--bg-primary)',
                                  border: '1px solid var(--accent-cyan)',
                                  borderRadius: '4px',
                                  padding: '2px 6px',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.72rem',
                                  width: '100%',
                                  outline: 'none'
                                }}
                              />
                              <button
                                type="submit"
                                style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: '2px' }}
                                title="Save Title"
                              >
                                <Check size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingSessionId(null)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px' }}
                                title="Cancel"
                              >
                                <X size={12} />
                              </button>
                            </form>
                          ) : (
                            <span
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: 1
                              }}
                            >
                              {session.title}
                            </span>
                          )}
                        </div>

                        {!isEditing && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {/* Pin / Unpin Button */}
                            <button
                              onClick={(e) => handleTogglePin(session.id, e)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: session.isPinned ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                opacity: session.isPinned || isActive ? 1 : 0.4
                              }}
                              title={session.isPinned ? 'Unpin Chat' : 'Pin Chat to Top'}
                            >
                              <Pin size={11} />
                            </button>

                            {/* Rename Button */}
                            <button
                              onClick={(e) => handleStartRename(session, e)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                opacity: isActive ? 0.9 : 0.4
                              }}
                              title="Rename Chat"
                            >
                              <Edit3 size={11} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={(e) => handleDeleteSession(session.id, e)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                opacity: isActive ? 0.9 : 0.4
                              }}
                              title="Delete Chat"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sidebar Footer */}
              <div
                style={{
                  padding: '10px',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                {/* Cloud Sync Status / Sign-In Button */}
                {currentUser ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '6px',
                      padding: '4px 8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Cloud Synced: {currentUser.username}
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={onOpenAuthModal}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
                      border: '1px dashed rgba(0, 240, 255, 0.4)',
                      borderRadius: '6px',
                      padding: '5px 8px',
                      color: 'var(--accent-cyan)',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    title="Sign in to sync your chats across all devices"
                  >
                    <span>☁️ Sign In to Sync Chats</span>
                  </button>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={13} color="#10b981" />
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SOC Core Online</span>
                  </div>

                  <button
                    onClick={handleClearAllHistory}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.68rem',
                      textDecoration: 'underline'
                    }}
                    title="Clear all saved conversations"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Main Chat Canvas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* Status Notice Pill if Live Scanning */}
          {statusNotice && (
            <div
              style={{
                background: 'rgba(0, 240, 255, 0.1)',
                borderBottom: '1px solid rgba(0, 240, 255, 0.25)',
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.72rem',
                color: 'var(--accent-cyan)'
              }}
            >
              <RefreshCw size={12} className="spinning" />
              <span>{statusNotice}</span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div
            className="copilot-messages-container"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: isFullScreen ? '24px 10%' : '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            {/* ChatGPT-style Welcome Hero Screen if conversation is new/empty */}
            {messages.length <= 1 && (
              <div
                style={{
                  margin: 'auto',
                  maxWidth: '560px',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '20px 0',
                  gap: '16px'
                }}
              >
                {/* Glowing Prismatic Avatar */}
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #00f0ff 0%, #6366f1 50%, #ec4899 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 24px rgba(0, 240, 255, 0.4), 0 0 40px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  <Bot size={28} color="#ffffff" />
                </div>

                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                    What security challenge can I investigate for you?
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    Equipped with live DNS probing, WHOIS domain age forensics, and isolated Chromium sandboxing.
                  </p>
                </div>

                {/* 4 ChatGPT-Style Starter Cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    width: '100%',
                    marginTop: '8px'
                  }}
                >
                  <button
                    onClick={() => handleSendMessage('analyze amazon.in')}
                    style={{
                      background: 'var(--code-box-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                      <Globe size={13} />
                      <span>Audit a Target Domain</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                      Analyze DNS, SSL, and security headers for amazon.in
                    </div>
                  </button>

                  <button
                    onClick={() => handleSendMessage('check br-icloud.com.br')}
                    style={{
                      background: 'var(--code-box-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800, color: '#f43f5e' }}>
                      <AlertTriangle size={13} />
                      <span>Investigate Phishing Trap</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                      Check if br-icloud.com.br is an authorized Apple domain
                    </div>
                  </button>

                  <button
                    onClick={() => handleSendMessage('Show general Nginx hardening config')}
                    style={{
                      background: 'var(--code-box-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800, color: '#10b981' }}>
                      <Terminal size={13} />
                      <span>Hardening Blueprint</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                      Generate Nginx CSP, HSTS, and X-Frame-Options config
                    </div>
                  </button>

                  <button
                    onClick={() => handleSendMessage('open sandbox')}
                    style={{
                      background: 'var(--code-box-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800, color: '#a855f7' }}>
                      <Sparkles size={13} />
                      <span>Launch Sandbox Viewport</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                      Safely preview suspicious websites inside live Chromium
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Rendered Conversation Messages */}
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={`msg-row-${idx}`}
                  style={{
                    display: 'flex',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                    gap: '10px',
                    alignItems: 'flex-start',
                    width: '100%'
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isUser
                        ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
                        : 'linear-gradient(135deg, #00f0ff 0%, #6366f1 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                      boxShadow: isUser ? '0 0 10px rgba(2, 132, 199, 0.4)' : '0 0 10px rgba(0, 240, 255, 0.4)'
                    }}
                  >
                    {isUser ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff' }}>U</span>
                    ) : (
                      <Bot size={15} color="#ffffff" />
                    )}
                  </div>

                  {/* Bubble Content */}
                  <div
                    style={{
                      maxWidth: '85%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div
                      className={isUser ? 'copilot-user-bubble' : 'copilot-assistant-bubble'}
                      style={{
                        padding: '12px 14px',
                        borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px'
                      }}
                    >
                      {renderMessageContent(msg.content, idx)}
                    </div>

                    {/* Action Bar for Assistant Messages (Copy / Regenerate) */}
                    {!isUser && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          paddingLeft: '4px',
                          fontSize: '0.68rem',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <button
                          onClick={() => copyFullMessage(msg.content, idx)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: copiedMessageIndex === idx ? 'var(--accent-green)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 4px',
                            fontSize: '0.68rem'
                          }}
                        >
                          {copiedMessageIndex === idx ? <Check size={11} /> : <Copy size={11} />}
                          <span>{copiedMessageIndex === idx ? 'Copied!' : 'Copy'}</span>
                        </button>

                        <button
                          onClick={() => handleToggleSpeech(msg.content, idx)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: speakingIndex === idx ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 4px',
                            fontSize: '0.68rem',
                            fontWeight: speakingIndex === idx ? 700 : 500
                          }}
                          title={speakingIndex === idx ? 'Stop Audio Readout' : 'Listen with Speech Synthesizer'}
                        >
                          {speakingIndex === idx ? <VolumeX size={12} color="var(--accent-cyan)" /> : <Volume2 size={12} />}
                          <span>{speakingIndex === idx ? 'Stop Audio' : 'Listen'}</span>
                        </button>

                        <button
                          onClick={() => {
                            const lastUser = [...messages.slice(0, idx)].reverse().find(m => m.role === 'user');
                            if (lastUser) handleSendMessage(lastUser.content);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 4px',
                            fontSize: '0.68rem'
                          }}
                        >
                          <RotateCcw size={11} />
                          <span>Regenerate</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 4px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00f0ff 0%, #6366f1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 10px rgba(0, 240, 255, 0.4)'
                  }}
                >
                  <Bot size={15} color="#ffffff" />
                </div>
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: '12px',
                    background: 'var(--code-box-bg)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.74rem'
                  }}
                >
                  <RefreshCw size={13} color="var(--accent-cyan)" className="spinning" />
                  <span className="mono">Analyzing cyber threat intelligence...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips (Horizontal Carousel) */}
          <div
            style={{
              padding: '6px 14px',
              borderTop: '1px solid var(--border-color)',
              background: 'rgba(7, 10, 16, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {quickPrompts.map((p, idx) => (
              <button
                key={`qp-${idx}`}
                onClick={() => handleSendMessage(p.label)}
                className={`copilot-prompt-chip ${p.colorClass}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '12px'
                }}
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* ChatGPT-Style Input Form */}
          <div
            className="copilot-input-area"
            style={{
              padding: isFullScreen ? '14px 10%' : '10px 14px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              flexShrink: 0
            }}
          >
            {/* Quick Tools Tray */}
            {showToolsMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '8px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '6px',
                  marginBottom: '4px'
                }}
              >
                <button
                  onClick={() => {
                    setShowToolsMenu(false);
                    setInputValue('analyze ');
                    inputRef.current?.focus();
                  }}
                  style={{
                    background: 'var(--code-box-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '6px',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Globe size={12} color="var(--accent-cyan)" />
                  <span>Scan URL</span>
                </button>

                <button
                  onClick={() => {
                    setShowToolsMenu(false);
                    setInputValue('domain age of ');
                    inputRef.current?.focus();
                  }}
                  style={{
                    background: 'var(--code-box-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '6px',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <FileText size={12} color="#10b981" />
                  <span>WHOIS Age</span>
                </button>

                <button
                  onClick={() => {
                    setShowToolsMenu(false);
                    handleSendMessage('open sandbox');
                  }}
                  style={{
                    background: 'var(--code-box-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '6px',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={12} color="#ec4899" />
                  <span>Live Sandbox</span>
                </button>

                <button
                  onClick={() => {
                    setShowToolsMenu(false);
                    handleSendMessage('Generate Nginx hardening headers');
                  }}
                  style={{
                    background: 'var(--code-box-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '6px',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Terminal size={12} color="#f59e0b" />
                  <span>Hardening</span>
                </button>

                <button
                  onClick={() => {
                    setShowToolsMenu(false);
                    setShowPlaybooksModal(true);
                  }}
                  style={{
                    background: 'var(--code-box-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '6px',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <BookOpen size={12} color="#818cf8" />
                  <span>Playbooks</span>
                </button>
              </motion.div>
            )}

            {/* Input Box Container */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-primary)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '12px',
                padding: '6px 10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}
            >
              {/* Tools Button */}
              <button
                type="button"
                onClick={() => setShowToolsMenu(prev => !prev)}
                style={{
                  background: showToolsMenu ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                  border: 'none',
                  color: showToolsMenu ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Quick Cyber Tools & Playbooks"
              >
                <Sliders size={16} />
              </button>

              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  domain
                    ? `Ask about ${domain}, request server hardening, or type 'open sandbox'...`
                    : "Ask any cybersecurity question, type 'analyze domain.com', or 'open sandbox'..."
                }
                rows={1}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: '1.4',
                  maxHeight: '120px',
                  fontFamily: 'inherit'
                }}
              />

              {/* Send or Stop Generating Button */}
              {isLoading ? (
                <button
                  type="button"
                  onClick={handleStopGenerating}
                  className="copilot-send-button"
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.35)',
                    flexShrink: 0
                  }}
                  title="Stop Generating (Cancel)"
                >
                  <Square size={13} fill="#ef4444" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="copilot-send-button"
                  style={{
                    background: inputValue.trim() && !isLoading
                      ? 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)'
                      : 'rgba(255, 255, 255, 0.08)',
                    color: inputValue.trim() && !isLoading ? '#070a10' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: inputValue.trim() && !isLoading ? 'pointer' : 'default',
                    boxShadow: inputValue.trim() && !isLoading ? '0 0 12px rgba(0, 240, 255, 0.4)' : 'none',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                  title="Send Prompt (Enter)"
                >
                  <Send size={15} />
                </button>
              )}
            </div>

            {/* Bottom Caption */}
            <div
              style={{
                fontSize: '0.64rem',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                letterSpacing: '0.02em',
                marginTop: '2px'
              }}
            >
              CyberGuard AI Copilot executes live DNS queries, WHOIS age forensics, and isolated headless sandboxing.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
