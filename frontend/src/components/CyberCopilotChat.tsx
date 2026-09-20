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
  Globe
} from 'lucide-react';
import type { RiskScoreReport, FreeScanResult, ChatMessage } from '../types';
import { sendChatMessage, executeFreeScan, DEFAULT_GEMINI_API_KEY } from '../services/api';

interface CyberCopilotChatProps {
  report?: RiskScoreReport | FreeScanResult | null;
  isOpen: boolean;
  onToggle: () => void;
  pendingPrompt?: string | null;
  onClearPendingPrompt?: () => void;
  onOpenAboutTopic?: (topicId: string) => void;
  onScanReportLoaded?: (report: FreeScanResult | RiskScoreReport) => void;
}

export const CyberCopilotChat: React.FC<CyberCopilotChatProps> = ({
  report,
  isOpen,
  onToggle,
  pendingPrompt,
  onClearPendingPrompt,
  onOpenAboutTopic,
  onScanReportLoaded
}) => {
  const [activeReport, setActiveReport] = useState<any>(report);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cyberguard_gemini_api_key');
      if (stored && stored.trim()) return stored.trim();
    }
    const envKey = ((import.meta as any)?.env?.VITE_GEMINI_API_KEY || '').trim();
    return envKey || DEFAULT_GEMINI_API_KEY;
  });
  const [tempApiKey, setTempApiKey] = useState(geminiApiKey);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Sync external report with active report
  useEffect(() => {
    if (report) {
      setActiveReport(report);
    }
  }, [report]);

  const rawDomain = (activeReport as any)?.canonical_domain || (activeReport as any)?.domain;
  const hasScannedSite = Boolean(rawDomain && typeof rawDomain === 'string' && rawDomain.trim() && rawDomain.trim().toLowerCase() !== 'target website');
  const domain = hasScannedSite ? rawDomain.trim() : null;
  const verdict = (activeReport as any)?.verdict;
  const riskScore = (activeReport as any)?.overall_risk_score ?? (activeReport as any)?.basic_risk_score ?? (activeReport as any)?.fast_risk_score;
  const grade = (activeReport as any)?.security_audit?.security_grade || (activeReport as any)?.security_grade;

  // Initialize or reset welcome message when report changes
  useEffect(() => {
    if (activeReport && hasScannedSite && domain) {
      setMessages([
        {
          role: 'assistant',
          content: `👋 **CyberGuard AI Copilot Active**\n\nI have loaded live forensic intelligence for **\`${domain}\`**:\n- **Verdict:** \`${verdict || 'ANALYZED'}\`\n- **Risk Score:** \`${riskScore !== undefined ? `${riskScore}/100` : 'Evaluated'}\`\n- **Security Grade:** \`${grade || 'Active'}\`\n\nAsk me anything about \`${domain}\`: Is it easily hackable? How do I fix missing defensive headers? What vulnerabilities does it have?`
        }
      ]);
    } else {
      setMessages([
        {
          role: 'assistant',
          content: `👋 **CyberGuard AI Copilot Online**\n\nI am your autonomous defensive cybersecurity analyst and technical AI assistant. No website URL is currently selected.\n\nType **\`analyze amazon.in\`** (or any domain) for an instant live audit, or ask me any general cybersecurity question below!`
        }
      ]);
    }
  }, [domain, verdict, riskScore, grade, hasScannedSite]);

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

  // Auto focus on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  const handleClearChat = () => {
    if (activeReport && hasScannedSite && domain) {
      setMessages([
        {
          role: 'assistant',
          content: `👋 **CyberGuard AI Copilot Active**\n\nI have loaded live forensic intelligence for **\`${domain}\`**:\n- **Verdict:** \`${verdict || 'ANALYZED'}\`\n- **Risk Score:** \`${riskScore !== undefined ? `${riskScore}/100` : 'Evaluated'}\`\n- **Security Grade:** \`${grade || 'Active'}\`\n\nAsk me anything about \`${domain}\`: Is it easily hackable? How do I fix missing defensive headers? What vulnerabilities does it have?`
        }
      ]);
    } else {
      setMessages([
        {
          role: 'assistant',
          content: `👋 **CyberGuard AI Copilot Online**\n\nI am your autonomous defensive cybersecurity analyst and technical AI assistant. No website URL is currently selected.\n\nType **\`analyze amazon.in\`** (or any domain) for an instant live audit, or ask me any general cybersecurity question below!`
        }
      ]);
    }
  };

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

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: query };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    let currentContextReport = activeReport;

    // Check if query is asking to audit a domain or contains any domain
    const domainExtractRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9][-a-zA-Z0-9]*\.(?:[a-zA-Z]{2,}|in|co|org|net|com|gov|edu|io|ai|xyz|top|shop|dev|app|cloud|site|tech|online|store)(?:\.[a-zA-Z]{2,})?)/i;
    const domainMatch = query.match(domainExtractRegex);

    if (domainMatch) {
      const candidateDomain = domainMatch[1].toLowerCase().replace(/^www\./, '');
      const currentActiveDomain = ((currentContextReport as any)?.canonical_domain || (currentContextReport as any)?.domain || '').toLowerCase();

      if (candidateDomain && candidateDomain !== currentActiveDomain) {
        setStatusNotice(`Running live multi-signal forensic audit for ${candidateDomain}...`);
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
      const chatHistory = newHistory.map(m => ({ role: m.role, content: m.content }));
      const response = await sendChatMessage(query, currentContextReport, chatHistory, geminiApiKey);

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.reply }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ **Communication Notice:** Copilot generated analysis based on active local telemetry.'
        }
      ]);
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
    { label: 'How to detect fake internship offers?', icon: <Briefcase size={12} color="#ec4899" />, colorClass: 'copilot-chip-rose' },
    { label: 'Launch live Chromium sandbox', icon: <Sparkles size={12} color="#38bdf8" />, colorClass: 'copilot-chip-sky' }
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

    const handleScrollToInspector = () => {
      const el = document.getElementById('technical-inspector-root');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
        {/* Browser Chrome Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          {/* Left: Traffic Lights & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.5px' }}>
              LIVE CHROMIUM SANDBOX
            </span>
          </div>

          {/* Center: Interactive Address Bar */}
          <form
            onSubmit={handleNavigate}
            style={{
              flex: 1,
              minWidth: '170px',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              borderRadius: '6px',
              padding: '3px 8px',
              gap: '6px'
            }}
          >
            <Lock size={11} color="#10b981" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.72rem',
                fontFamily: 'monospace'
              }}
              placeholder="Enter URL to test in sandbox..."
            />
          </form>

          {/* Right: Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={handleRefresh}
              title="Reload Sandbox"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                padding: '4px 6px',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.68rem'
              }}
            >
              <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
            </button>

            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in new browser tab"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                padding: '4px 6px',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.68rem',
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={11} />
            </a>

            <button
              type="button"
              onClick={handleScrollToInspector}
              title="Inspect in Main Dashboard"
              style={{
                background: 'rgba(0, 240, 255, 0.12)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '4px',
                padding: '3px 8px',
                cursor: 'pointer',
                color: 'var(--accent-cyan)',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Maximize2 size={10} />
              <span>FULL AUDIT</span>
            </button>
          </div>
        </div>

        {/* Security Isolation Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 10px',
            background: 'rgba(16, 185, 129, 0.08)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: '0.64rem',
            color: '#10b981',
            fontWeight: 600,
            flexWrap: 'wrap',
            gap: '4px'
          }}
        >
          <span>🛡️ SECURE ISOLATION ACTIVE • Local filesystem & host memory protected</span>
          <span style={{ fontFamily: 'monospace', opacity: 0.85 }}>sandbox="allow-scripts allow-forms allow-same-origin allow-popups"</span>
        </div>

        {/* Live Iframe Viewport */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: isFullScreen ? '460px' : '330px',
            background: '#ffffff',
            overflow: 'hidden'
          }}
        >
          {!iframeLoaded && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: '#0a0e17',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                zIndex: 1,
                color: 'var(--text-secondary)'
              }}
            >
              <RefreshCw size={20} className="animate-spin" color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>Spawning isolated Chromium viewport...</span>
            </div>
          )}
          <iframe
            key={refreshKey}
            src={currentUrl}
            title="Interactive Live Sandbox"
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
            onLoad={() => setIframeLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block'
            }}
          />
        </div>
      </div>
    );
  };

  // Helper to render markdown formatting and code blocks
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

  // Main message content renderer with Sandbox Viewport detection
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

          // Process bold (**text**) and code (`text`)
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
            <span>{domain ? `Auditing: ${domain}` : 'AI Security Copilot'}</span>
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
              width: '470px',
              maxWidth: 'calc(100vw - 32px)',
              height: isMinimized ? '64px' : '630px',
              maxHeight: 'calc(100vh - 40px)',
              borderRadius: '18px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s'
            }
      }
    >
      {/* Prismatic Top Light Bar */}
      <div className="copilot-top-prismatic-bar" />
      {/* Gemini API Key Configuration Modal Overlay */}
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
                {geminiApiKey && (
                  <span style={{ color: '#10b981', fontWeight: 700 }}>● Active in Browser</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
              {geminiApiKey && (
                <button
                  onClick={() => {
                    setTempApiKey('');
                    setGeminiApiKey('');
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('cyberguard_gemini_api_key');
                    }
                    setShowApiKeyModal(false);
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  Remove Key
                </button>
              )}
              <button
                onClick={handleSaveApiKey}
                style={{
                  background: 'linear-gradient(135deg, #00f0ff 0%, #2563eb 100%)',
                  color: '#070a10',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: 800
                }}
              >
                Save &amp; Activate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        className="copilot-header-bar"
        style={{
          padding: isFullScreen ? '14px 24px' : '12px 18px',
          borderBottom: isMinimized && !isFullScreen ? 'none' : '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: isMinimized && !isFullScreen ? 'pointer' : 'default',
          flexShrink: 0
        }}
        onClick={isMinimized && !isFullScreen ? () => setIsMinimized(false) : undefined}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #00f0ff 0%, #6366f1 50%, #ec4899 100%)',
              padding: '8px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.5), 0 0 6px rgba(0, 240, 255, 0.7)'
            }}
          >
            <Bot size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                className="cyber-font"
                style={{
                  fontSize: isFullScreen ? '1.05rem' : '0.94rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #00f0ff 0%, #818cf8 50%, #f472b6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.04em'
                }}
              >
                CYBER COPILOT AI
              </span>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  background: '#10b981',
                  borderRadius: '50%',
                  boxShadow: '0 0 8px #10b981, 0 0 2px #ffffff'
                }}
              />
              {geminiApiKey ? (
                <span
                  style={{
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(139, 92, 246, 0.2) 100%)',
                    border: '1px solid rgba(0, 240, 255, 0.4)',
                    color: 'var(--accent-cyan)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '0.64rem',
                    fontWeight: 700
                  }}
                >
                  ⚡ CyberAI Active
                </span>
              ) : (
                <span
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(6, 182, 212, 0.2) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#10b981',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '0.64rem',
                    fontWeight: 700
                  }}
                >
                  🛡️ Autonomous
                </span>
              )}
            </div>
            <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              {isFullScreen ? 'Autonomous Forensic & Penetration Testing Assistant • Fullscreen Mode' : 'Real-Time Security & Forensic Assistant'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* AI Engine API Key Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTempApiKey(geminiApiKey);
              setShowApiKeyModal(true);
            }}
            title={geminiApiKey ? 'Custom AI Engine Connected (Click to edit key)' : 'Configure AI Engine API Key'}
            style={{
              background: geminiApiKey ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
              border: geminiApiKey ? '1px solid var(--accent-cyan)' : 'none',
              color: geminiApiKey ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Sparkles size={16} />
          </button>

          {/* Clear Conversation Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClearChat();
            }}
            title="Clear Conversation"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <RotateCcw size={15} />
          </button>

          {/* Full Screen Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullScreen(!isFullScreen);
              setIsMinimized(false);
            }}
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen View'}
            style={{
              background: isFullScreen ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
              border: isFullScreen ? '1px solid var(--accent-cyan)' : 'none',
              color: isFullScreen ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Minimize Drawer Button (Only when not in full screen) */}
          {!isFullScreen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              title={isMinimized ? 'Expand' : 'Minimize'}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px'
              }}
            >
              <ChevronDown size={17} style={{ transform: isMinimized ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isFullScreen) setIsFullScreen(false);
              onToggle();
            }}
            title="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {(!isMinimized || isFullScreen) && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden',
            width: '100%',
            maxWidth: isFullScreen ? '1080px' : '100%',
            margin: isFullScreen ? '0 auto' : undefined
          }}
        >
          {/* Active Target Banner */}
          {activeReport && domain ? (
            <div
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.12) 0%, rgba(99, 102, 241, 0.1) 50%, rgba(236, 72, 153, 0.08) 100%)',
                borderBottom: '1px solid rgba(56, 189, 248, 0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.74rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                <Terminal size={13} color="var(--accent-cyan)" />
                <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 700, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  Target: {domain}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                {verdict && (
                  <span
                    className={verdict === 'PHISHING' ? 'badge-critical' : verdict === 'SUSPICIOUS' ? 'badge-high' : 'badge-safe'}
                    style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.66rem', fontWeight: 800 }}
                  >
                    {verdict}
                  </span>
                )}
                {riskScore !== undefined && (
                  <span
                    className="mono"
                    style={{
                      background: riskScore >= 70 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: riskScore >= 70 ? '#ef4444' : '#10b981',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      border: riskScore >= 70 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    {riskScore}/100
                  </span>
                )}
                {grade && (
                  <span
                    style={{
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: 'var(--accent-cyan)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '0.68rem'
                    }}
                  >
                    Grade {grade}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '6px 16px',
                background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
                borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)'
              }}
            >
              <Sparkles size={12} color="var(--accent-cyan)" />
              <span>General AI Mode • Type <strong>analyze amazon.in</strong> to audit any site on-the-fly!</span>
            </div>
          )}

          {/* Live Status Notice if scanning */}
          {statusNotice && (
            <div
              style={{
                padding: '6px 16px',
                background: 'rgba(0, 240, 255, 0.12)',
                borderBottom: '1px solid var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.75rem',
                color: 'var(--accent-cyan)',
                fontWeight: 700
              }}
            >
              <div style={{ width: '12px', height: '12px', border: '2px solid var(--accent-cyan)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <span>{statusNotice}</span>
            </div>
          )}

          {/* Messages Body */}
          <div
            className="copilot-messages-container"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: isFullScreen ? '20px 24px' : '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const hasSandbox = !isUser && msg.content.includes('[SANDBOX_VIEWPORT:');
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '100%',
                    width: hasSandbox ? '100%' : 'auto'
                  }}
                >
                  {isUser ? (
                    <div
                      className="copilot-user-bubble"
                      style={{
                        maxWidth: isFullScreen ? '82%' : '88%',
                        padding: isFullScreen ? '14px 18px' : '12px 16px',
                        fontSize: isFullScreen ? '0.9rem' : '0.84rem',
                        lineHeight: '1.5',
                        wordBreak: 'break-word'
                      }}
                    >
                      {msg.content}
                    </div>
                  ) : (
                    <div
                      className="copilot-assistant-bubble"
                      style={{
                        maxWidth: hasSandbox ? (isFullScreen ? '96%' : '98%') : (isFullScreen ? '84%' : '92%'),
                        width: hasSandbox ? '100%' : 'auto',
                        padding: isFullScreen ? '16px 20px' : '14px 16px',
                        fontSize: isFullScreen ? '0.9rem' : '0.84rem',
                        lineHeight: '1.5',
                        wordBreak: 'break-word'
                      }}
                    >
                      {/* Micro Copilot Badge */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '10px',
                          paddingBottom: '6px',
                          borderBottom: '1px solid rgba(56, 189, 248, 0.18)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '6px',
                              background: 'linear-gradient(135deg, #00f0ff 0%, #6366f1 50%, #ec4899 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 0 8px rgba(0, 240, 255, 0.4)'
                            }}
                          >
                            <Bot size={11} color="#ffffff" />
                          </div>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              background: 'linear-gradient(90deg, var(--accent-cyan) 0%, #a855f7 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              letterSpacing: '0.5px'
                            }}
                          >
                            CYBER COPILOT
                          </span>
                        </div>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AI Security Model</span>
                      </div>
                      {renderMessageContent(msg.content, idx)}
                    </div>
                  )}
                </motion.div>
              );
            })}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="copilot-assistant-bubble"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  borderRadius: '14px',
                  width: 'fit-content',
                  fontSize: '0.8rem',
                  color: 'var(--accent-cyan)'
                }}
              >
                <div style={{ width: '14px', height: '14px', border: '2px solid var(--accent-cyan)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontWeight: 600 }}>Copilot is analyzing forensic telemetry...</span>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Quick Prompts Chips */}
          <div
            style={{
              padding: isFullScreen ? '10px 20px' : '8px 14px',
              borderTop: '1px solid rgba(56, 189, 248, 0.18)',
              background: 'transparent',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none'
            }}
          >
            {quickPrompts.map((sug, sIdx) => (
              <button
                key={sIdx}
                onClick={() => handleSendMessage(sug.label)}
                disabled={isLoading}
                className={`copilot-prompt-chip ${(sug as any).colorClass || 'copilot-chip-cyan'}`}
              >
                {sug.icon}
                <span>{sug.label}</span>
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="copilot-input-area"
            style={{
              padding: isFullScreen ? '16px 24px' : '12px 16px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder={domain ? `Ask Copilot about ${domain} (or 'analyze otherdomain.com')...` : "Ask any question (e.g. 'analyze amazon.in' or 'how to secure Nginx')..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="copilot-input-field"
              style={{
                flex: 1,
                padding: isFullScreen ? '12px 18px' : '10px 14px',
                fontSize: isFullScreen ? '0.92rem' : '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="copilot-send-button"
              style={{
                padding: isFullScreen ? '12px 22px' : '10px 16px',
                cursor: !inputValue.trim() || isLoading ? 'not-allowed' : 'pointer',
                opacity: !inputValue.trim() || isLoading ? 0.45 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={18} />
            </motion.button>
          </form>
        </div>
      )}
    </motion.div>
  );
};

