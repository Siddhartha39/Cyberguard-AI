import React, { useState } from 'react';
import { X, Shield, Activity, Lock, Layers, GitCommit, Radar, Puzzle, Search, Sparkles } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const topics = [
    {
      id: 'nrd-feed',
      category: 'telemetry',
      title: 'Newly Registered Domain (NRD) Pipeline',
      icon: <Activity size={20} color="#f97316" />,
      shortDesc: 'Early-warning ingestion of domains registered < 30 days ago.',
      details: 'Over 70% of active phishing campaigns operate on newly registered domains (NRDs) that are weaponized within the first 48 hours. CyberGuard AI triages DNS zone updates and Certificate Transparency logs using sub-10ms lexical heuristics to identify high-risk candidates before attacks launch.',
      impact: 'Allows SOC analysts to escalate suspicious domains for isolated headless Playwright crawling before emails land in user inboxes.'
    },
    {
      id: 'brand-engine',
      category: 'forensics',
      title: 'Brand-Domain Contradiction Engine',
      icon: <Shield size={20} color="#ef4444" />,
      shortDesc: 'Visual logo pHash matching vs domain authorization.',
      details: 'Phishing pages copy the exact visual branding, logos, and color palettes of trusted brands (e.g. Bank of America, PayPal, Microsoft) while operating on deceptive unauthorized domains (e.g. login-bofa.xyz). Our engine renders the page in an isolated sandbox, computes perceptual hashes (pHash), and checks if the domain is authorized for that brand.',
      impact: 'Instantly exposes visual spoofing and phishing lookalikes regardless of obfuscated HTML code.'
    },
    {
      id: 'attack-chain',
      category: 'forensics',
      title: '7-Stage Attack Chain Reconstruction',
      icon: <GitCommit size={20} color="#00f0ff" />,
      shortDesc: 'Chronological adversary lifecycle graph.',
      details: 'Assembles a forensic graph of the adversary path: Ingress URL → DNS Nameserver → HTTP Redirect Bounces → Deceptive Landing DOM → Password Forms → Exfiltration endpoints. Provides timeline timestamps and technical evidence for every node.',
      impact: 'Empowers security response teams to trace phishing infrastructure and initiate targeted domain and host takedowns.'
    },
    {
      id: 'risk-score',
      category: 'ml',
      title: 'Multi-Signal Calibrated Risk Score (0–100)',
      icon: <Layers size={20} color="#3b82f6" />,
      shortDesc: 'Fusion of Lexical ML, WHOIS age, DOM forms & Threat Intel.',
      details: 'Fuses 5 distinct telemetry vectors: (1) Lexical Random Forest ML, (2) Live RDAP WHOIS domain age (<30 days penalty), (3) Isolated Playwright password form hooks, (4) Visual brand logo contradiction, and (5) Threat intelligence. Platt calibrated to output true probability (0–29 Benign, 30–69 Suspicious, 70–100 Malicious).',
      impact: 'Eliminates false alarms while giving clear, defensible evidence points.'
    },
    {
      id: 'security-headers',
      category: 'defense',
      title: 'Website Exploitability & Header Audit',
      icon: <Lock size={20} color="#00ff88" />,
      shortDesc: 'Clickjacking, Email spoofing & CSP defensive posture.',
      details: 'Website owners can audit their own domains. Checks: (1) X-Frame-Options (Clickjacking immunity), (2) Strict-Transport-Security (HSTS downgrade protection), (3) Content-Security-Policy (XSS immunity), (4) X-Content-Type-Options (MIME sniffing defense), and (5) DNS SPF & DMARC (Email spoofing resistance). Computes executive grades (A+ to F).',
      impact: 'Gives developers concrete, actionable configuration fixes to prevent their domains from being exploited or spoofed.'
    },
    {
      id: 'chrome-ext',
      category: 'defense',
      title: 'Real-Time Chrome Browser Extension',
      subtitle: 'Manifest V3 Endpoint Defense',
      icon: <Puzzle size={20} color="#c084fc" />,
      shortDesc: 'Background protection with live badge threat status.',
      details: 'Manifest V3 Chrome Extension that passively evaluates active browsing tabs. Highlights safe vs dangerous sites in the badge, triggers warning popups on phishing pages, and allows users to launch a 1-click deep investigation in CyberGuard AI.',
      impact: 'Zero-latency protection right inside the user browser.'
    },
    {
      id: 'gemini-ai',
      category: 'ml',
      title: 'Gemini AI Penetration & Exploit Explainer',
      icon: <Radar size={20} color="#f59e0b" />,
      shortDesc: 'Hacker-perspective audit & developer remediation steps.',
      details: 'Connected to Google Gemini AI to analyze forensic telemetry and explain in plain English how a malicious actor would exploit the target domain, along with step-by-step mitigation instructions.',
      impact: 'Translates raw security telemetries into executive summaries and developer action plans.'
    }
  ];

  const filteredTopics = topics.filter((t) => {
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.shortDesc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{
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
    }} onClick={onClose}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '860px',
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
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--hero-bg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={22} color="#070a10" />
            </div>
            <div>
              <h2 className="cyber-font" style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                CYBERGUARD AI // INTELLIGENCE &amp; FEATURE GUIDE
              </h2>
              <p className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Plain-English explanations of all security modules, signals, and threat scores
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
        <div style={{
          padding: '14px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          background: 'var(--bg-secondary)'
        }}>
          <div style={{
            flex: 1,
            minWidth: '220px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="Search features (e.g. NRD, pHash, SPF, Clickjacking)..."
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
                  color: activeCategory === cat ? '#ffffff' : 'var(--text-secondary)',
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
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '18px',
                boxShadow: 'var(--panel-shadow)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  background: 'rgba(0, 240, 255, 0.1)',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  {topic.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {topic.title}
                  </h3>
                  <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                    {topic.shortDesc}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '10px' }}>
                {topic.details}
              </p>

              <div style={{
                background: 'var(--code-box-bg)',
                borderLeft: '3px solid var(--accent-green)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem'
              }}>
                <strong style={{ color: 'var(--accent-green)' }}>Security Value: </strong>
                <span style={{ color: 'var(--text-primary)' }}>{topic.impact}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)'
        }}>
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
