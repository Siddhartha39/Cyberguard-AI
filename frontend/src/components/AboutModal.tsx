import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Shield,
  Activity,
  Lock,
  Layers,
  GitCommit,
  Radar,
  Puzzle,
  Search,
  Sparkles,
  Globe,
  Database,
  Terminal,
  MessageSquare
} from 'lucide-react';

export interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopicId?: string;
  onAskCopilot?: (question: string) => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  initialTopicId,
  onAskCopilot
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [highlightedTopicId, setHighlightedTopicId] = useState<string | null>(null);
  const topicRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (isOpen && initialTopicId && initialTopicId !== 'all') {
      setHighlightedTopicId(initialTopicId);
      setActiveCategory('all');
      setSearchTerm('');
      setTimeout(() => {
        const el = topicRefs.current[initialTopicId];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    } else {
      setHighlightedTopicId(null);
    }
  }, [isOpen, initialTopicId]);

  if (!isOpen) return null;

  const topics = [
    {
      id: 'risk-score',
      category: 'ml',
      title: 'Multi-Signal Calibrated Risk Score (0–100)',
      icon: <Layers size={20} color="#3b82f6" />,
      shortDesc: 'Fusion of Lexical ML, WHOIS age, DOM forms & Threat Intel.',
      details: 'Fuses 5 distinct telemetry vectors: (1) Lexical Random Forest ML with Shannon entropy, (2) Live RDAP WHOIS domain registration standing (<30 days penalty), (3) Isolated Playwright password form traps, (4) Visual brand logo contradiction, and (5) Threat intelligence. Platt calibrated to output true probability (0–29 Benign, 30–69 Suspicious, 70–100 Malicious).',
      impact: 'Eliminates false alarms while giving clear, mathematically defensible evidence points.',
      copilotPrompt: 'Why does CyberGuard AI use multi-signal calibrated risk scoring instead of a single metric?'
    },
    {
      id: 'brand-engine',
      category: 'forensics',
      title: 'Brand-Domain Contradiction Engine',
      icon: <Shield size={20} color="#ef4444" />,
      shortDesc: 'Visual logo pHash matching vs domain authorization.',
      details: 'Phishing pages copy the exact visual branding, logos, and color palettes of trusted brands (e.g. Bank of America, PayPal, Microsoft, Apple) while operating on deceptive unauthorized domains (e.g. login-bofa.xyz). Our engine renders the page in an isolated headless sandbox, computes perceptual hashes (pHash), and checks if the domain is authorized for that brand.',
      impact: 'Instantly exposes visual spoofing and phishing lookalikes regardless of obfuscated HTML code.',
      copilotPrompt: 'How does the Brand Contradiction Engine catch credential harvesters using logo pHash?'
    },
    {
      id: 'security-headers',
      category: 'defense',
      title: 'Anti-Hacking, Code Injection & Posture Audit',
      icon: <Lock size={20} color="#00ff88" />,
      shortDesc: 'Clickjacking, XSS Code Injection, CSP & Server Hardening.',
      details: 'Evaluates essential defensive HTTP response headers that immunize websites against attacker exploits: (1) Content-Security-Policy (XSS script execution defense), (2) Strict-Transport-Security (HSTS downgrade & MITM protection), (3) X-Frame-Options (Clickjacking & UI framing immunity), (4) X-Content-Type-Options (MIME sniffing defense), and (5) DNS SPF & DMARC (Email spoofing resistance). Computes executive letter grades (A+ to F) with copy-paste server configurations.',
      impact: 'Gives web developers and site owners concrete, copy-paste hardening configurations for Nginx, Apache, Cloudflare, and Node.js.',
      copilotPrompt: 'How do I immunize my website against code injection and improve my security grade?'
    },
    {
      id: 'infrastructure-intel',
      category: 'telemetry',
      title: 'Real Infrastructure, TLS & DNS Intelligence',
      icon: <Globe size={20} color="#06b6d4" />,
      shortDesc: 'Live RDAP registry standing, authoritative DNS & X.509 TLS certificate.',
      details: 'Zero fake dataset guarantee: queries authoritative ICANN RDAP registries for exact domain creation dates, registrars, and registration statuses (active vs unregistered/NXDOMAIN). Connects via direct Python cryptography socket to extract real X.509 DER certificates, auditing issuers (Let\'s Encrypt, DigiCert, Sectigo) and expiry dates, plus live carrier ASN and IP geolocation.',
      impact: 'Guarantees 100% genuine cryptographic and network telemetry pulled straight from live root nameservers and certificate logs.',
      copilotPrompt: 'How does live socket TLS certificate extraction and RDAP domain age confirm authenticity?'
    },
    {
      id: 'threat-vectors',
      category: 'forensics',
      title: 'Multi-Vector Threat Attribution Radar',
      icon: <Radar size={20} color="#e11d48" />,
      shortDesc: 'Six orthogonal telemetry vectors mapped onto a normalized risk polygon.',
      details: 'Deconstructs the target profile across 6 defensive vectors: Lexical Entropy, Domain Age Penalty, TLS Handshake & Issuer Integrity, Sandboxed Form Traps, Visual Brand Contradiction, and Threat Feed Intelligence. Normalizes each vector onto a 0-100 scale.',
      impact: 'Enables security analysts to instantly pinpoint the primary attack vector without wading through raw logs.',
      copilotPrompt: 'How are the 6 Threat Vector radar scores calculated and weighted in the report?'
    },
    {
      id: 'attack-chain',
      category: 'forensics',
      title: '7-Stage Attack Chain Reconstruction',
      icon: <GitCommit size={20} color="#00f0ff" />,
      shortDesc: 'Chronological adversary lifecycle graph.',
      details: 'Assembles a forensic graph of the adversary path: Ingress URL → DNS Nameserver → HTTP Redirect Bounces → Deceptive Landing DOM → Password Forms → Exfiltration endpoints. Provides timeline timestamps and technical evidence for every node.',
      impact: 'Empowers security response teams to trace phishing infrastructure and initiate targeted domain and host takedowns.',
      copilotPrompt: 'Explain how the 7-stage attack chain reconstructs an adversary phishing campaign.'
    },
    {
      id: 'evidence-breakdown',
      category: 'forensics',
      title: 'Multi-Signal Forensic Evidence Table',
      icon: <Database size={20} color="#8b5cf6" />,
      shortDesc: 'Deterministic mathematical attribution for every contributing security indicator.',
      details: 'Every finding—from newly registered domain penalties to missing CSP headers or suspicious password input elements—is assigned an explicit mathematical weight and calibrated contribution score (positive or negative). Shows severity level, signal description, and audit status.',
      impact: 'Provides complete transparency and defendability for compliance audits and legal evidence.',
      copilotPrompt: 'How does CyberGuard AI calculate evidence signal weights and calibrated contributions?'
    },
    {
      id: 'technical-inspector',
      category: 'forensics',
      title: 'Raw Network Payloads & Telemetry Inspector',
      icon: <Terminal size={20} color="#10b981" />,
      shortDesc: 'Direct inspection of raw JSON telemetry, HTTP headers, and headless DOM logs.',
      details: 'Exposes raw diagnostic JSON payloads including DNS resource records, live TLS cipher suites and certificate chains, Playwright headless browser crawler redirection hops, and Algorand blockchain transaction hashes.',
      impact: 'Gives penetration testers and reverse engineers instant access to low-level cryptographic proofs.',
      copilotPrompt: 'What cryptographic and network telemetry is audited in the Technical Inspector?'
    },
    {
      id: 'nrd-feed',
      category: 'telemetry',
      title: 'Newly Registered Domain (NRD) Pipeline',
      icon: <Activity size={20} color="#f97316" />,
      shortDesc: 'Early-warning ingestion of domains registered < 30 days ago.',
      details: 'Over 70% of active phishing campaigns operate on newly registered domains (NRDs) that are weaponized within the first 48 hours. CyberGuard AI triages DNS zone updates and Certificate Transparency logs using sub-10ms lexical heuristics to identify high-risk candidates before attacks launch.',
      impact: 'Allows SOC analysts to escalate suspicious domains for isolated headless Playwright crawling before emails land in user inboxes.',
      copilotPrompt: 'Why are newly registered domains (NRDs) such a common vector for credential phishing?'
    },
    {
      id: 'chrome-ext',
      category: 'defense',
      title: 'Real-Time Chrome Browser Extension',
      icon: <Puzzle size={20} color="#c084fc" />,
      shortDesc: 'Manifest V3 background protection with live badge threat status.',
      details: 'Manifest V3 Chrome Extension that passively evaluates active browsing tabs. Highlights safe vs dangerous sites in the badge, triggers warning popups on phishing pages, and allows users to launch a 1-click deep investigation in CyberGuard AI.',
      impact: 'Zero-latency protection right inside the user browser.',
      copilotPrompt: 'How does the CyberGuard AI Chrome extension protect users in real-time?'
    },
    {
      id: 'cyberguard-ai',
      category: 'ml',
      title: 'CyberGuard AI Threat Insights & Hacker Perspective',
      icon: <Radar size={20} color="#f59e0b" />,
      shortDesc: 'Hacker-perspective audit & developer remediation steps.',
      details: 'Powered by advanced neural AI to analyze forensic telemetry and explain in plain English how a malicious actor would exploit the target domain, along with step-by-step mitigation instructions.',
      impact: 'Translates raw security telemetries into executive summaries and developer action plans.',
      copilotPrompt: 'How does the AI penetration explainer assess exploitability and write server hardening fixes?'
    }
  ];

  const filteredTopics = topics.filter((t) => {
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.shortDesc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '880px',
          maxHeight: '90vh',
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border-focus)',
          boxShadow: 'var(--panel-shadow)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--hero-bg)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Shield size={22} color="#070a10" />
            </div>
            <div>
              <h2 className="cyber-font" style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                CYBERGUARD AI // SECURITY &amp; RESULT GUIDE
              </h2>
              <p className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Comprehensive explanations for all scan result cards, security signals, and anti-hacking controls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '6px',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            padding: '14px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
            background: 'var(--bg-secondary)'
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: '220px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="Search features (e.g. NRD, pHash, CSP, Clickjacking, TLS, Evidence)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--code-box-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px 8px 36px',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'telemetry', 'forensics', 'ml', 'defense'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: activeCategory === cat ? 'var(--accent-cyan)' : 'transparent',
                  color: activeCategory === cat ? '#070a10' : 'var(--text-secondary)',
                  border: `1px solid ${activeCategory === cat ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Topics List */}
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {filteredTopics.map((topic) => {
            const isHighlighted = highlightedTopicId === topic.id;
            return (
              <div
                key={topic.id}
                ref={(el) => (topicRefs.current[topic.id] = el)}
                style={{
                  background: isHighlighted ? 'rgba(0, 240, 255, 0.06)' : 'var(--bg-secondary)',
                  border: isHighlighted
                    ? '2px solid var(--accent-cyan)'
                    : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '18px',
                  boxShadow: isHighlighted
                    ? '0 0 20px rgba(0, 240, 255, 0.25)'
                    : 'var(--panel-shadow)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        background: 'rgba(0, 240, 255, 0.1)',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      {topic.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {topic.title}
                      </h3>
                      <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                        {topic.shortDesc}
                      </div>
                    </div>
                  </div>

                  {onAskCopilot && (
                    <button
                      onClick={() => {
                        onAskCopilot(topic.copilotPrompt || `Explain ${topic.title}`);
                        onClose();
                      }}
                      style={{
                        background: 'rgba(0, 240, 255, 0.12)',
                        color: 'var(--accent-cyan)',
                        border: '1px solid var(--accent-cyan)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexShrink: 0
                      }}
                    >
                      <MessageSquare size={13} />
                      <span>Ask AI Copilot</span>
                    </button>
                  )}
                </div>

                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '10px' }}>
                  {topic.details}
                </p>

                <div
                  style={{
                    background: 'var(--code-box-bg)',
                    borderLeft: '3px solid var(--accent-green)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.76rem'
                  }}
                >
                  <strong style={{ color: 'var(--accent-green)' }}>Security Value: </strong>
                  <span style={{ color: 'var(--text-primary)' }}>{topic.impact}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <Sparkles size={14} color="var(--accent-cyan)" />
            <span>CyberGuard AI v2.0-SOC PRO // Zero-Trust Telemetry Engine</span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--accent-cyan)',
              color: '#070a10',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
