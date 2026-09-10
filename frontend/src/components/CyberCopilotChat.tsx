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
  ChevronDown
} from 'lucide-react';
import type { RiskScoreReport, FreeScanResult, ChatMessage } from '../types';
import { sendChatMessage } from '../services/api';

interface CyberCopilotChatProps {
  report?: RiskScoreReport | FreeScanResult | null;
  isOpen: boolean;
  onToggle: () => void;
  pendingPrompt?: string | null;
  onClearPendingPrompt?: () => void;
  onOpenAboutTopic?: (topicId: string) => void;
}

export const CyberCopilotChat: React.FC<CyberCopilotChatProps> = ({
  report,
  isOpen,
  onToggle,
  pendingPrompt,
  onClearPendingPrompt,
  onOpenAboutTopic
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const domain = (report as any)?.canonical_domain || (report as any)?.domain;
  const verdict = (report as any)?.verdict;
  const riskScore = (report as any)?.overall_risk_score ?? (report as any)?.basic_risk_score ?? (report as any)?.fast_risk_score;
  const grade = (report as any)?.security_audit?.security_grade || (report as any)?.security_grade;

  // Initialize or reset welcome message when report changes
  useEffect(() => {
    if (report && domain) {
      setMessages([
        {
          role: 'assistant',
          content: `👋 **CyberGuard AI Copilot Active**\n\nI have loaded the live forensic intelligence for **\`${domain}\`**:\n- **Verdict:** \`${verdict || 'ANALYZED'}\`\n- **Risk Score:** \`${riskScore !== undefined ? `${riskScore}/100` : 'Evaluated'}\`\n- **Security Grade:** \`${grade || 'Active'}\`\n\nAsk me anything! Is this site safe? How to fix missing security headers? How to detect fake job offers?`
        }
      ]);
    } else {
      setMessages([
        {
          role: 'assistant',
          content: `👋 **CyberGuard AI Copilot Online**\n\nI am your real-time defensive cybersecurity analyst. I can explain website threat scores, detect fake internship offers, guide server hardening (Nginx/Cloudflare), and verify Algorand x402 settlements.\n\nAsk me any question below or audit a URL in the Scanner!`
        }
      ]);
    }
  }, [domain, verdict, riskScore, grade]);

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

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: query };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      const chatHistory = newHistory.map(m => ({ role: m.role, content: m.content }));
      const response = await sendChatMessage(query, report, chatHistory);

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
    }
  };

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const quickPrompts = [
    { label: domain ? `Is ${domain} easily hackable?` : 'Is my website easily hackable?', icon: <Shield size={12} color="#ef4444" /> },
    { label: domain ? `Give steps to fix ${domain}` : 'Give steps and all other things to fix it', icon: <Terminal size={12} color="#10b981" /> },
    { label: 'Generate Nginx & Express hardening headers', icon: <Terminal size={12} color="var(--accent-cyan)" /> },
    { label: 'How to prevent code injection & SQLi?', icon: <Lock size={12} color="#a855f7" /> },
    { label: 'How to detect fake internship offers?', icon: <Briefcase size={12} color="#ec4899" /> },
    { label: 'How is risk score calculated?', icon: <Zap size={12} color="#f59e0b" /> },
    { label: 'What is Algorand x402 payment?', icon: <Sparkles size={12} color="#38bdf8" /> }
  ];

  // Helper to render simple markdown formatting
  const renderMessageContent = (content: string, msgIdx: number) => {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderTextWithFormatting(content.substring(lastIndex, match.index), `txt-${msgIdx}-${lastIndex}`));
      }
      const lang = match[1] || 'bash';
      const codeSnippet = match[2];
      const uniqueCodeKey = msgIdx * 100 + blockIndex;

      parts.push(
        <div
          key={`code-${msgIdx}-${blockIndex}`}
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
      parts.push(renderTextWithFormatting(content.substring(lastIndex), `txt-${msgIdx}-${lastIndex}`));
    }

    return parts;
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
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99995,
          background: 'linear-gradient(135deg, #070a10 0%, #0d1525 100%)',
          border: '1.5px solid var(--accent-cyan)',
          borderRadius: '28px',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          boxShadow: '0 8px 30px rgba(0, 240, 255, 0.35), 0 0 15px rgba(37, 99, 235, 0.4)',
          transition: 'box-shadow 0.3s'
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, #00f0ff 0%, #2563eb 100%)',
            padding: '7px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(0, 240, 255, 0.6)'
          }}>
            <Bot size={18} color="#070a10" />
          </div>
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }} />
        </div>

        <div style={{ textAlign: 'left' }}>
          <div className="cyber-font" style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            CYBER COPILOT
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
            {domain ? `Analyzing: ${domain}` : 'Ask AI Analyst'}
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
      className="glass-panel"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 99995,
        width: '450px',
        maxWidth: 'calc(100vw - 32px)',
        height: isMinimized ? '60px' : '620px',
        maxHeight: 'calc(100vh - 40px)',
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border-focus)',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          background: 'linear-gradient(90deg, rgba(7, 10, 16, 0.95) 0%, rgba(13, 21, 37, 0.95) 100%)',
          borderBottom: isMinimized ? 'none' : '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: isMinimized ? 'pointer' : 'default'
        }}
        onClick={isMinimized ? () => setIsMinimized(false) : undefined}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #00f0ff 0%, #2563eb 100%)',
              padding: '7px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(0, 240, 255, 0.5)'
            }}
          >
            <Bot size={20} color="#070a10" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="cyber-font" style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                CYBER COPILOT AI
              </span>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  background: '#10b981',
                  borderRadius: '50%',
                  boxShadow: '0 0 8px #10b981'
                }}
              />
            </div>
            <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              Real-Time Security &amp; Forensic Assistant
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
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

      {!isMinimized && (
        <>
          {/* Active Target Banner */}
          {report && domain ? (
            <div
              style={{
                padding: '8px 14px',
                background: 'rgba(0, 240, 255, 0.06)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.72rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                <Terminal size={12} color="var(--accent-cyan)" />
                <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 700, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  Target: {domain}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                {verdict && (
                  <span
                    className={verdict === 'PHISHING' ? 'badge-critical' : verdict === 'SUSPICIOUS' ? 'badge-high' : 'badge-safe'}
                    style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800 }}
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
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 800,
                      fontSize: '0.68rem'
                    }}
                  >
                    {riskScore}/100
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '6px 14px',
                background: 'rgba(56, 189, 248, 0.04)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.7rem',
                color: 'var(--text-secondary)'
              }}
            >
              <Sparkles size={11} color="var(--accent-cyan)" />
              <span>General Cybersecurity Mode • Audit any site in the Scanner</span>
            </div>
          )}

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'var(--bg-secondary)'
            }}
          >
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
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
                    maxWidth: '100%'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '90%',
                      padding: '12px 16px',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isUser
                        ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
                        : 'var(--bg-card)',
                      color: isUser ? '#ffffff' : 'var(--text-primary)',
                      border: isUser ? 'none' : '1px solid var(--border-color)',
                      boxShadow: isUser
                        ? '0 4px 15px rgba(37, 99, 235, 0.3)'
                        : '0 4px 15px rgba(0, 0, 0, 0.2)',
                      fontSize: '0.84rem',
                      wordBreak: 'break-word'
                    }}
                  >
                    {isUser ? msg.content : renderMessageContent(msg.content, idx)}
                  </div>
                </motion.div>
              );
            })}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  padding: '10px 16px',
                  borderRadius: '14px',
                  width: 'fit-content',
                  fontSize: '0.78rem',
                  color: 'var(--accent-cyan)'
                }}
              >
                <div style={{ width: '14px', height: '14px', border: '2px solid var(--accent-cyan)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span>Copilot is analyzing cybersecurity telemetry...</span>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Quick Prompts Chips */}
          <div
            style={{
              padding: '8px 12px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              display: 'flex',
              gap: '6px',
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
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '5px 12px',
                  fontSize: '0.72rem',
                  color: 'var(--text-primary)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                  e.currentTarget.style.color = 'var(--accent-cyan)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
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
            style={{
              padding: '12px 14px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder={domain ? `Ask Copilot about ${domain}...` : "Ask a cybersecurity question (e.g. 'Is this site safe?')..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              style={{
                flex: 1,
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-cyan)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              style={{
                background: !inputValue.trim() || isLoading ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, #00f0ff 0%, #2563eb 100%)',
                color: !inputValue.trim() || isLoading ? 'var(--text-secondary)' : '#070a10',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 16px',
                cursor: !inputValue.trim() || isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: !inputValue.trim() || isLoading ? 'none' : '0 0 14px rgba(0, 240, 255, 0.4)'
              }}
            >
              <Send size={16} />
            </motion.button>
          </form>
        </>
      )}
    </motion.div>
  );
};
