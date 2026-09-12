import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar,
  Terminal,
  AlertTriangle,
  GitCommit,
  Layers,
  Lock,
  Activity,
  Puzzle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Cpu,
  Coins,
  Search,
  LayoutGrid
} from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

export interface LandingPageProps {
  onLaunchScanner: () => void;
  onOpenExtension: () => void;
  onOpenDiscovery: () => void;
  onScanUrl?: (url: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchScanner,
  onOpenExtension,
  onOpenDiscovery,
  onScanUrl
}) => {
  const [quickUrl, setQuickUrl] = useState('');
  const [activePipelineStep, setActivePipelineStep] = useState<number>(0);
  const [cardViewMode, setCardViewMode] = useState<'stack' | 'grid'>('stack');

  const sampleTargets = [
    {
      url: 'campuskart.shop',
      label: 'Benign Store',
      score: '12.4',
      badge: 'SAFE',
      badgeClass: 'badge-safe',
      type: 'benign'
    },
    {
      url: 'login-paypal-security-verification.xyz',
      label: 'Phish Lookalike',
      score: '94.8',
      badge: 'MALICIOUS',
      badgeClass: 'badge-critical',
      type: 'phish'
    },
    {
      url: 'github.com',
      label: 'Hardened Tech',
      score: '2.1',
      badge: 'GRADE A+',
      badgeClass: 'badge-safe',
      type: 'hardened'
    }
  ];

  const pipelineStages = [
    {
      step: 1,
      name: 'Lexical Triage',
      badge: '< 10ms',
      color: '#00f0ff',
      summary: 'Entropy calculation, Punycode / IDN detection, hyphen clustering, and suspicious TLD classification.',
      detail: 'Instantly tokenizes the input URL across 45 lexical dimensions. Flags excessive subdomain depth, known phishing keywords ("login", "verify", "secure", "billing"), and high Shannon entropy.'
    },
    {
      step: 2,
      name: 'Google DoH & RDAP',
      badge: 'DNS / IP',
      color: '#3b82f6',
      summary: 'Direct DNS-over-HTTPS resolution, autonomous system (ASN) mapping, and registrar creation age lookup.',
      detail: 'Queries Google Cloud DoH resolvers and IANA RDAP feeds. Flags Newly Registered Domains (< 30 days) and high-risk bulletproof hosting infrastructure.'
    },
    {
      step: 3,
      name: 'SSL/TLS & Posture',
      badge: 'HARDENING',
      color: '#00ff88',
      summary: 'Certificate Transparency log validation, HSTS, CSP, X-Frame-Options, and SPF/DMARC spoofing resistance.',
      detail: 'Audits defensive header policies to compute an exploitability grade (A+ through F). Checks if the domain is vulnerable to Clickjacking or email impersonation.'
    },
    {
      step: 4,
      name: 'Playwright Sandbox',
      badge: 'DOM CRAWL',
      color: '#f59e0b',
      summary: 'Headless browser execution capturing DOM elements, password submission hooks, and redirect hops.',
      detail: 'Renders the target in an isolated sandbox. Detects credential harvesting input fields (<input type="password">), external exfiltration action URLs, and anti-analysis cloaking.'
    },
    {
      step: 5,
      name: 'pHash Brand Vision',
      badge: 'LOGO AI',
      color: '#ef4444',
      summary: 'Perceptual hashing (pHash) and visual logo matching comparing rendered page to verified brand catalog.',
      detail: 'Identifies brand visual assets (PayPal, Apple, Microsoft, Chase, Steam). Flags critical Brand-Domain Contradiction when trusted logos are hosted on unauthorized domains.'
    },
    {
      step: 6,
      name: 'Multi-Signal Fusion & x402',
      badge: '0-100 VECTOR',
      color: '#c084fc',
      summary: 'Platt-scaled calibrated probability scoring with instant on-chain Algorand Testnet x402 micropayments.',
      detail: 'Aggregates all 5 forensic vectors into a unified calibrated threat score with full attack-chain evidence, backed by sub-4s Algorand cryptographic settlement.'
    }
  ];

  const capabilityCards = [
    {
      id: 'brand-contradiction',
      step: '01',
      title: 'Brand-Domain Contradiction Engine',
      subtitle: 'Visual & Identity Verification',
      badge: 'PROPRIETARY',
      description: 'Detects when a page imitates the logos and visual identity of trusted brands (e.g. PayPal, Apple, Microsoft, Chase) while operating on an unauthorized, deceptive domain.',
      icon: <AlertTriangle size={24} color="#ef4444" />,
      iconBg: 'rgba(239, 68, 68, 0.15)',
      iconBorder: 'rgba(239, 68, 68, 0.4)',
      glowColor: 'rgba(239, 68, 68, 0.25)',
      quote: '"Imitates Bank of America, but domain is unauthorized .xyz"',
      quoteColor: '#ef4444',
      quoteBorder: '#ef4444',
      tags: ['pHash 64-bit DCT', 'Visual Logo Catalog', 'Domain Impersonation', 'Brand Spoof Guard'],
      tooltip: {
        title: 'Brand-Domain Contradiction',
        description: 'Uses perceptual hashing (pHash) and visual logo matching to compare page visuals against a verified brand catalog. Detects deceptive impersonation.',
        securityImpact: 'Stops credential harvesting pages masquerading as banks, payment processors, or cloud portals.',
        goodVsBad: 'Authorized domains match officially registered parent brands; unauthorized domains flag brand contradiction.'
      }
    },
    {
      id: 'attack-chain',
      step: '02',
      title: 'Explainable Attack-Chain Reconstruction',
      subtitle: '7-Stage Forensic Path',
      badge: 'FORENSICS',
      description: 'Reconstructs a step-by-step forensic graph linking Ingress → DNS Infrastructure → Redirects → Landing DOM → Credential Forms → Exfiltration channels.',
      icon: <GitCommit size={24} color="var(--accent-cyan)" />,
      iconBg: 'rgba(0, 240, 255, 0.15)',
      iconBorder: 'rgba(0, 240, 255, 0.4)',
      glowColor: 'rgba(0, 240, 255, 0.25)',
      quote: 'Step 1 (Ingress) → Step 5 (Credential Hook) → Step 7 (Verdict)',
      quoteColor: 'var(--accent-cyan)',
      quoteBorder: 'var(--accent-cyan)',
      tags: ['Ingress Link', 'Google DoH DNS', 'HTTP Redirect Bounces', 'Credential Form Traps'],
      tooltip: {
        title: '7-Stage Attack Chain Reconstruction',
        description: 'Maps the entire adversary lifecycle: Ingress Link, DNS Hosting, HTTP Redirect Bounces, Deceptive Landing DOM, Password Form Injection, and Data Exfiltration.',
        securityImpact: 'Gives SOC analysts explainable, actionable evidence for rapid incident response and threat takedowns.',
        goodVsBad: 'Clean sites have straightforward 2-step resolution; phishing campaigns exhibit multi-hop redirects and credential hooks.'
      }
    },
    {
      id: 'risk-fusion',
      step: '03',
      title: 'Multi-Signal Calibrated Risk Fusion',
      subtitle: '0-100 Probability Vector',
      badge: 'ML CALIBRATION',
      description: 'Fuses 5 independent vectors: Lexical ML features, Domain Age & DNS, DOM password forms, Visual Brand confidence, and Threat Intel into a unified 0–100 risk score.',
      icon: <Layers size={24} color="#3b82f6" />,
      iconBg: 'rgba(59, 130, 246, 0.15)',
      iconBorder: 'rgba(59, 130, 246, 0.4)',
      glowColor: 'rgba(59, 130, 246, 0.25)',
      quote: 'Weighted contribution breakdown (+/- pts) for every signal',
      quoteColor: 'var(--accent-green)',
      quoteBorder: 'var(--accent-green)',
      tags: ['24-D Lexical Tensor', 'Platt Scaling Calibration', 'Shannon Entropy', 'Point Scoring Breakdown'],
      tooltip: {
        title: 'Calibrated Risk Scoring (0–100)',
        description: 'Combines ML lexical probabilities with forensic evidence points. Employs Platt scaling to prevent false positives and provide calibrated probability.',
        securityImpact: 'Ensures security teams prioritize high-confidence threats without being overwhelmed by alert fatigue.',
        goodVsBad: '0–29: Benign / Safe, 30–69: Suspicious / Under Review, 70–100: Malicious Phishing Campaign.'
      }
    },
    {
      id: 'security-audit',
      step: '04',
      title: 'Website Exploitability & Security Audit',
      subtitle: 'Defensive Posture Rating',
      badge: 'WEBSITE DEFENSE',
      description: 'Website owners can check their own domain defense posture: Clickjacking immunity (X-Frame-Options), Email spoofing resistance (SPF/DMARC), CSP, and HSTS.',
      icon: <Lock size={24} color="var(--accent-green)" />,
      iconBg: 'rgba(0, 255, 136, 0.15)',
      iconBorder: 'rgba(0, 255, 136, 0.4)',
      glowColor: 'rgba(0, 255, 136, 0.25)',
      quote: 'Security Grades (A+ to F) + Actionable Developer Fixes',
      quoteColor: '#f59e0b',
      quoteBorder: '#f59e0b',
      actionText: 'Audit Your Own Domain',
      onAction: onLaunchScanner,
      tags: ['HSTS & CSP Headers', 'Clickjacking Immune', 'SPF/DMARC Spoof Defense', 'Executive Security Grade'],
      tooltip: {
        title: 'Website Exploitability Audit',
        description: 'Inspects HTTP security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options) and DNS records (SPF, DMARC) to calculate an executive security grade.',
        securityImpact: 'Prevents Clickjacking, MIME type sniffing, XSS injection, and email spoofing impersonation.',
        goodVsBad: 'Grade A+/A: Hardened security headers; Grade D/F: Highly vulnerable to injection and spoofing.'
      }
    },
    {
      id: 'nrd-stream',
      step: '05',
      title: 'Newly Registered Domain (NRD) Stream',
      subtitle: 'High-Throughput Early-Warning',
      badge: 'STREAM FEED',
      description: 'High-throughput early-warning stream prioritizing unknown candidates hitting DNS logs and Certificate Transparency feeds before phishing campaigns go viral.',
      icon: <Activity size={24} color="#f97316" />,
      iconBg: 'rgba(249, 115, 22, 0.15)',
      iconBorder: 'rgba(249, 115, 22, 0.4)',
      glowColor: 'rgba(249, 115, 22, 0.25)',
      quote: '< 10ms lexical triage + one-click escalation sandbox',
      quoteColor: '#f97316',
      quoteBorder: '#f97316',
      actionText: 'Explore NRD Stream',
      onAction: onOpenDiscovery,
      tags: ['CertStream Feed', '< 30d Quarantine', 'Sub-10ms Triage', 'Playwright Sandbox Escalation'],
      tooltip: {
        title: 'Newly Registered Domain (NRD) Pipeline',
        description: 'Ingests real-time domain creation feeds. Over 70% of zero-day attacks occur on domains under 30 days old. Filters malicious targets via sub-10ms lexical heuristics.',
        securityImpact: 'Enables SOC teams to block malicious infrastructure before phishing emails reach inboxes.',
        goodVsBad: 'Candidate domains with high lexical threat scores are escalated for instant Playwright sandbox inspection.'
      }
    },
    {
      id: 'chrome-ext',
      step: '06',
      title: 'Real-Time Chrome Browser Extension',
      subtitle: 'Endpoint Client Protection',
      badge: 'ENDPOINT AGENT',
      description: 'Manifest V3 sidecar auditing active tabs in real-time. Displays threat warning banners, visual trust gauges, and seamless 1-click inspection routing.',
      icon: <Puzzle size={24} color="#c084fc" />,
      iconBg: 'rgba(192, 132, 252, 0.15)',
      iconBorder: 'rgba(192, 132, 252, 0.4)',
      glowColor: 'rgba(192, 132, 252, 0.25)',
      quote: 'Active browser background monitoring & instant badge telemetry',
      quoteColor: '#c084fc',
      quoteBorder: '#c084fc',
      actionText: 'Download Extension',
      onAction: onOpenExtension,
      tags: ['Manifest V3 Sidecar', 'Silent Tab Audit', 'Visual Trust Gauge', 'Instant Deep-Dive Routing'],
      tooltip: {
        title: 'Real-Time Chrome Browser Extension',
        description: 'Browser sidecar that audits active tabs in real-time. Features badge alerts, threat warnings, and direct 1-click launch to the CyberGuard AI command center.',
        securityImpact: 'Endpoints receive instantaneous zero-hour protection against deceptive links.',
        goodVsBad: 'Green shield = verified safe; Red shield = malicious credential harvester intercepted.'
      }
    }
  ];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickUrl.trim()) {
      if (onScanUrl) {
        onScanUrl(quickUrl.trim());
      } else {
        onLaunchScanner();
      }
    }
  };

  const handleSampleClick = (url: string) => {
    setQuickUrl(url);
    if (onScanUrl) {
      onScanUrl(url);
    } else {
      onLaunchScanner();
    }
  };

  return (
    <div style={{ padding: '0 24px 48px 24px', maxWidth: '1360px', margin: '0 auto' }}>
      {/* 1. Live Threat Intelligence Marquee Ticker */}
      <div
        className="glass-panel"
        style={{
          marginBottom: '24px',
          padding: '10px 16px',
          overflow: 'hidden',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(13, 19, 31, 0.75)',
          border: '1px solid rgba(56, 189, 248, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span className="cyber-beacon" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
          <span className="cyber-font mono" style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>
            LIVE THREAT TELEMETRY
          </span>
        </div>

        <div style={{ overflow: 'hidden', width: '100%', position: 'relative' }}>
          <div className="ticker-track">
            {/* Ticker items loop */}
            {[1, 2].map((loopIdx) => (
              <div key={loopIdx} style={{ display: 'flex', alignItems: 'center', gap: '28px', paddingRight: '28px' }}>
                <span className="mono" style={{ fontSize: '0.74rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={13} />
                  <span>INTERCEPTED: login-paypal-security-verification.xyz (Risk: 94.8 | Phish)</span>
                </span>
                <span style={{ color: 'var(--border-color)' }}>•</span>
                <span className="mono" style={{ fontSize: '0.74rem', color: '#00ff88', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={13} />
                  <span>VERIFIED HARDENED: github.com (Score: 2.1 | A+ Posture)</span>
                </span>
                <span style={{ color: 'var(--border-color)' }}>•</span>
                <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Coins size={13} />
                  <span>ALGORAND TESTNET: Nodely + AlgoNode Multi-Node Live (x402 Active)</span>
                </span>
                <span style={{ color: 'var(--border-color)' }}>•</span>
                <span className="mono" style={{ fontSize: '0.74rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={13} />
                  <span>CERTSTREAM INGEST: 4,820 NRD candidates triaged in &lt;10ms</span>
                </span>
                <span style={{ color: 'var(--border-color)' }}>•</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Hero Section with Staggered Framer Motion Animations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass-panel"
        style={{
          padding: '48px 32px 36px 32px',
          marginBottom: '32px',
          background: 'var(--hero-bg)',
          border: '1px solid var(--border-color)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Hacker Badge with Pulsing Ping */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 240, 255, 0.12)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: '6px 18px',
            fontSize: '0.76rem',
            color: 'var(--accent-cyan)',
            fontWeight: 800,
            letterSpacing: '0.08em',
            marginBottom: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}
        >
          <span className="cyber-beacon" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-green)', display: 'inline-block' }}></span>
          <span className="mono cyber-font">CYBER COMMAND TERMINAL // CORE V2.0</span>
          <InfoTooltip
            title="Cyber Command Core V2.0"
            description="Antigravity-engineered zero-trust cybersecurity operating environment running real-time ML pipelines, live WHOIS RDAP resolvers, and x402 Algorand settlement."
            position="bottom"
          />
        </motion.div>

        {/* Main Headline with Animated Gradient Glow */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="cyber-font cyber-gradient-text"
          style={{
            fontSize: 'clamp(1.5rem, 4.2vw, 2.5rem)',
            fontWeight: 900,
            letterSpacing: '0.02em',
            lineHeight: 1.22,
            maxWidth: '960px',
            margin: '0 auto 18px auto'
          }}
        >
          AI-POWERED PHISHING INTELLIGENCE &amp; ATTACK-CHAIN FORENSICS
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            fontSize: 'clamp(0.92rem, 2vw, 1.05rem)',
            color: 'var(--text-secondary)',
            maxWidth: '780px',
            margin: '0 auto 28px auto',
            lineHeight: 1.6
          }}
        >
          Zero-trust cyber defense platform detecting brand-spoofing lookalikes, reconstructing step-by-step forensic attack paths, and auditing web infrastructure exploitability.
        </motion.p>

        {/* Interactive Quick-Audit Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.35 }}
          style={{
            maxWidth: '680px',
            margin: '0 auto 24px auto',
            background: 'var(--bg-card)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '14px',
            padding: '8px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 240, 255, 0.12)'
          }}
        >
          <form onSubmit={handleQuickSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '12px', color: 'var(--accent-cyan)' }}>
              <Search size={18} />
            </div>
            <input
              type="text"
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              placeholder="Enter domain or link (e.g. login-paypal-security-verification.xyz)"
              className="mono"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                padding: '8px 4px'
              }}
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="cyber-shimmer-btn"
              style={{
                background: 'linear-gradient(135deg, #00f0ff 0%, #0284c7 100%)',
                color: '#070a10',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 20px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)'
              }}
            >
              <Radar size={16} />
              <span className="cyber-font">AUDIT TARGET</span>
            </motion.button>
          </form>

          {/* Quick-test Sample Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', padding: '0 6px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>QUICK SAMPLES:</span>
            {sampleTargets.map((s) => (
              <motion.button
                key={s.url}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSampleClick(s.url)}
                type="button"
                style={{
                  background: 'var(--code-box-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s'
                }}
              >
                <span className="mono" style={{ fontWeight: 600 }}>{s.url}</span>
                <span className={`mono ${s.badgeClass}`} style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: '6px', fontWeight: 800 }}>
                  {s.badge}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Scan Protocol Notice */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <Coins size={12} color="var(--accent-cyan)" />
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Free Initial Triage • Full Headless Sandbox, pHash Vision &amp; Attack-Chain unlocked with <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>0.1 ALGO (x402)</span>
            </span>
          </div>
        </motion.div>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="hero-action-buttons"
          style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}
        >
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLaunchScanner}
            className="cyber-shimmer-btn"
            style={{
              background: 'linear-gradient(135deg, #00f0ff 0%, #0284c7 100%)',
              color: '#070a10',
              border: 'none',
              borderRadius: '10px',
              padding: '13px 26px',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 25px rgba(0, 240, 255, 0.4)'
            }}
          >
            <Radar size={18} />
            <span className="cyber-font" style={{ letterSpacing: '0.04em' }}>LAUNCH LIVE SCANNER</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenExtension}
            style={{
              background: 'var(--bg-card)',
              color: 'var(--accent-cyan)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '13px 24px',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--panel-shadow)'
            }}
          >
            <Puzzle size={18} color="var(--accent-cyan)" />
            <span className="cyber-font" style={{ letterSpacing: '0.04em' }}>BROWSER SHIELD EXTENSION</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenDiscovery}
            style={{
              background: 'rgba(249, 115, 22, 0.1)',
              color: '#f97316',
              border: '1px solid rgba(249, 115, 22, 0.35)',
              borderRadius: '10px',
              padding: '13px 22px',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Activity size={18} color="#f97316" />
            <span className="cyber-font" style={{ letterSpacing: '0.04em' }}>LIVE NRD FEED</span>
          </motion.button>
        </motion.div>

        {/* Telemetry Status Bar with Interactive Hover Glow */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', maxWidth: '940px', margin: '36px auto 0 auto', borderTop: '1px solid var(--border-color)', paddingTop: '22px' }}>
          <motion.div whileHover={{ y: -3, scale: 1.03 }} transition={{ duration: 0.2 }}>
            <div className="mono cyber-font neon-cyan-glow" style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span>0.0 – 100</span>
              <InfoTooltip
                title="Calibrated Risk Index"
                description="Consolidated 0–100 threat probability index fusing lexical, hosting, brand, and DOM signals."
                position="top"
              />
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>CALIBRATED RISK INDEX</div>
          </motion.div>

          <motion.div whileHover={{ y: -3, scale: 1.03 }} transition={{ duration: 0.2 }}>
            <div className="mono cyber-font neon-green-glow" style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span>7-STAGE</span>
              <InfoTooltip
                title="7-Stage Attack Graph"
                description="Chronological forensic graph linking domain ingress to credential submission forms."
                position="top"
              />
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>ATTACK-CHAIN GRAPH</div>
          </motion.div>

          <motion.div whileHover={{ y: -3, scale: 1.03 }} transition={{ duration: 0.2 }}>
            <div className="mono cyber-font" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span>&lt; 30 DAYS</span>
              <InfoTooltip
                title="Newly Registered Domains (NRD)"
                description="Domains registered in the last 30 days are automatically placed on heightened surveillance."
                position="top"
              />
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>NRD EARLY WARNING</div>
          </motion.div>

          <motion.div whileHover={{ y: -3, scale: 1.03 }} transition={{ duration: 0.2 }}>
            <div className="mono cyber-font" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span>x402 PROTOCOL</span>
              <InfoTooltip
                title="Algorand x402 Micropayments"
                description="On-chain HTTP 402 pay-per-audit integration settling on Algorand Testnet with Pera Wallet."
                position="top"
              />
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>ALGORAND SETTLEMENT</div>
          </motion.div>
        </div>
      </motion.div>

      {/* 3. Interactive 6-Stage Defense Pipeline Visualizer */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
        className="glass-panel"
        style={{
          padding: '28px',
          marginBottom: '32px',
          borderRadius: '14px',
          border: '1px solid rgba(56, 189, 248, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={22} color="var(--accent-cyan)" />
            <h2 className="cyber-font neon-cyan-glow" style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.04em' }}>
              AUTONOMOUS 6-STAGE INSPECTION PIPELINE
            </h2>
            <InfoTooltip
              title="6-Stage Autonomous Engine"
              description="Click any stage below to explore how CyberGuard AI analyzes domains from raw input string to deep cryptographic verification."
              position="bottom"
            />
          </div>
          <span className="mono badge-info" style={{ fontSize: '0.68rem', padding: '3px 10px', borderRadius: '12px' }}>
            CLICK ANY STAGE TO INSPECT
          </span>
        </div>

        {/* Pipeline Stage Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          {pipelineStages.map((stage, idx) => {
            const isSelected = activePipelineStep === idx;
            return (
              <motion.button
                key={stage.step}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePipelineStep(idx)}
                style={{
                  background: isSelected ? 'rgba(0, 240, 255, 0.16)' : 'var(--bg-card)',
                  border: isSelected ? `2px solid ${stage.color}` : '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isSelected ? `0 0 16px ${stage.color}33` : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="mono cyber-font" style={{ fontSize: '0.72rem', fontWeight: 800, color: stage.color }}>
                    STAGE 0{stage.step}
                  </span>
                  <span className="mono" style={{ fontSize: '0.6rem', color: stage.color, background: `${stage.color}1a`, padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                    {stage.badge}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                  {stage.name}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Stage Detail Drawer */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePipelineStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            style={{
              background: 'var(--code-box-bg)',
              border: `1px solid ${pipelineStages[activePipelineStep].color}55`,
              borderRadius: '10px',
              padding: '18px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={18} color={pipelineStages[activePipelineStep].color} />
              <span className="cyber-font" style={{ fontSize: '0.95rem', fontWeight: 800, color: pipelineStages[activePipelineStep].color }}>
                Stage 0{pipelineStages[activePipelineStep].step}: {pipelineStages[activePipelineStep].name}
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 600 }}>
              {pipelineStages[activePipelineStep].summary}
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              {pipelineStages[activePipelineStep].detail}
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* 4. Brand Contradiction Live Simulation Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
        className="glass-panel"
        style={{
          padding: '28px',
          marginBottom: '32px',
          borderRadius: '14px',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <AlertTriangle size={22} color="#ef4444" />
          <h2 className="cyber-font neon-red-glow" style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.04em' }}>
            WHY TRADITIONAL SECURITY FAILS: BRAND CONTRADICTION
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
          {/* Legitimate Brand Card */}
          <div style={{ background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.3)', borderRadius: '10px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span className="mono cyber-font" style={{ fontSize: '0.75rem', color: '#00ff88', fontWeight: 800 }}>AUTHORIZED OFFICIAL SITE</span>
              <span className="mono badge-safe" style={{ fontSize: '0.62rem', padding: '2px 8px', borderRadius: '6px' }}>100% MATCH</span>
            </div>
            <div className="mono" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '6px' }}>
              https://www.paypal.com/signin
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              • Rendered Visual: <strong>PayPal</strong> logo verified<br />
              • Domain Match: <strong>paypal.com</strong> (Officially Authorized)<br />
              • Verdict: <strong style={{ color: '#00ff88' }}>SAFE (Risk: 2.4/100)</strong>
            </div>
          </div>

          {/* Adversary Impersonator Card */}
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '10px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span className="mono cyber-font" style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 800 }}>ADVERSARY PHISHING HARVESTER</span>
              <span className="mono badge-critical" style={{ fontSize: '0.62rem', padding: '2px 8px', borderRadius: '6px' }}>CRITICAL CONTRADICTION</span>
            </div>
            <div className="mono" style={{ fontSize: '0.9rem', color: '#ef4444', fontWeight: 700, marginBottom: '6px' }}>
              https://login-paypal-security-verify.xyz
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              • Rendered Visual: <strong>PayPal</strong> logo matched via pHash (99.4%)<br />
              • Domain Match: <strong>login-paypal-security-verify.xyz</strong> (UNAUTHORIZED)<br />
              • Verdict: <strong style={{ color: '#ef4444' }}>BLOCKED (Risk: 96.2/100 | Phish)</strong>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 5. Cyber Defense Capabilities Header with Card View Mode Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Terminal size={22} color="var(--accent-cyan)" />
            <h2 className="cyber-font neon-cyan-glow" style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '0.04em' }}>
              CYBER DEFENSE CAPABILITY STACK
            </h2>
            <InfoTooltip
              title="Cyber Defense Capability Stack"
              description="Scroll down to peel through each modular defense layer in the zero-trust pipeline, or toggle to the expanded grid view."
              position="right"
            />
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Scroll through the 6 defensive modules or select any layer to inspect technical forensics
          </p>
        </div>

        {/* View Mode Toggle Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', padding: '4px', borderRadius: '12px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCardViewMode('stack')}
            style={{
              background: cardViewMode === 'stack' ? 'linear-gradient(135deg, #00f0ff 0%, #0284c7 100%)' : 'transparent',
              color: cardViewMode === 'stack' ? '#070a10' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '8px',
              padding: '7px 16px',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: cardViewMode === 'stack' ? '0 0 16px rgba(0, 240, 255, 0.4)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Layers size={15} />
            <span className="cyber-font">STACKED SCROLL DECK</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCardViewMode('grid')}
            style={{
              background: cardViewMode === 'grid' ? 'linear-gradient(135deg, #00f0ff 0%, #0284c7 100%)' : 'transparent',
              color: cardViewMode === 'grid' ? '#070a10' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '8px',
              padding: '7px 16px',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: cardViewMode === 'grid' ? '0 0 16px rgba(0, 240, 255, 0.4)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <LayoutGrid size={15} />
            <span className="cyber-font">EXPANDED 3D GRID</span>
          </motion.button>
        </div>
      </div>

      {/* Quick Jump Navigator Pills */}
      {cardViewMode === 'stack' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '14px', marginBottom: '24px', flexWrap: 'nowrap' }}>
          <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, flexShrink: 0 }}>
            QUICK SCROLL JUMP:
          </span>
          {capabilityCards.map((c, idx) => (
            <motion.button
              key={c.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const el = document.getElementById(`stack-card-${c.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              style={{
                background: 'var(--code-box-bg)',
                border: `1px solid ${c.iconBorder}`,
                color: c.quoteColor,
                borderRadius: '16px',
                padding: '5px 14px',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: `0 0 10px ${c.glowColor}`,
                transition: 'all 0.2s'
              }}
            >
              <span className="mono">0{idx + 1} {c.title.split(' ')[0]}</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* 6. Card Scroll Animation Stacking Deck or Grid */}
      {cardViewMode === 'stack' ? (
        <div className="card-stack-container" style={{ position: 'relative', marginTop: '10px' }}>
          {capabilityCards.map((card, index) => (
            <motion.div
              id={`stack-card-${card.id}`}
              key={card.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.04 }}
              className="glass-panel card-stack-item"
              style={{
                top: `${95 + index * 20}px`,
                zIndex: 10 + index,
                background: `radial-gradient(circle at 50% 0%, ${card.glowColor} 0%, rgba(13, 19, 31, 0.97) 85%)`,
                border: `1px solid ${card.iconBorder}`,
                borderRadius: '20px',
                padding: '32px 28px',
                marginBottom: index === capabilityCards.length - 1 ? '60px' : '40px',
                boxShadow: `0 24px 60px rgba(0, 0, 0, 0.92), 0 0 30px ${card.glowColor}`
              }}
            >
              {/* Card Header Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    background: card.iconBg,
                    border: `1px solid ${card.iconBorder}`,
                    padding: '12px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 16px ${card.glowColor}`
                  }}>
                    {card.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="mono cyber-font" style={{ fontSize: '0.78rem', color: card.quoteColor, fontWeight: 900 }}>
                        MODULE // 0{index + 1} OF 06
                      </span>
                      <span className="mono badge-info" style={{ fontSize: '0.62rem', padding: '2px 8px', borderRadius: '8px' }}>
                        {card.badge}
                      </span>
                    </div>
                    <h3 className="cyber-font" style={{ fontSize: '1.28rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {card.title}
                    </h3>
                  </div>
                </div>

                <InfoTooltip
                  title={card.tooltip.title}
                  description={card.tooltip.description}
                  securityImpact={card.tooltip.securityImpact}
                  goodVsBad={card.tooltip.goodVsBad}
                  position="bottom"
                />
              </div>

              {/* Card Body - 2 Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start' }}>
                {/* Left Side: Subtitle, Description & Tags */}
                <div>
                  <div className="mono" style={{ fontSize: '0.76rem', color: card.quoteColor, fontWeight: 800, marginBottom: '8px' }}>
                    // {card.subtitle.toUpperCase()}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '18px' }}>
                    {card.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                    {card.tags?.map((tag, tIdx) => (
                      <span key={tIdx} className="mono" style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '3px 10px',
                        fontSize: '0.68rem',
                        color: 'var(--text-primary)'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    • Status: <span style={{ color: '#00ff88', fontWeight: 700 }}>ACTIVE FORENSIC LAYER</span> // Latency: <span style={{ color: 'var(--accent-cyan)' }}>Sub-second</span>
                  </div>
                </div>

                {/* Right Side: Adversary Quote, Impact & Action */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--code-box-bg)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      THREAT INTERCEPTION CRITERIA:
                    </div>
                    <div className="mono" style={{
                      fontSize: '0.78rem',
                      color: card.quoteColor,
                      padding: '10px 14px',
                      background: 'rgba(0, 0, 0, 0.5)',
                      borderRadius: '8px',
                      borderLeft: `3px solid ${card.quoteBorder}`
                    }}>
                      {card.quote}
                    </div>
                  </div>

                  <div>
                    <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      SECURITY IMPACT:
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {card.tooltip.securityImpact}
                    </div>
                  </div>

                  {card.actionText && (
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => card.onAction && card.onAction()}
                      style={{
                        background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(2, 132, 199, 0.2) 100%)',
                        border: '1px solid var(--accent-cyan)',
                        color: 'var(--accent-cyan)',
                        borderRadius: '10px',
                        padding: '10px 18px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '4px',
                        boxShadow: '0 0 14px rgba(0, 240, 255, 0.2)'
                      }}
                    >
                      <span className="cyber-font">{card.actionText}</span>
                      <ArrowRight size={15} />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Expanded 3D Grid View */
        <div className="feature-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {capabilityCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
              className="glass-panel cyber-card-hover"
              style={{
                padding: '24px',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                {/* Card Top Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      background: card.iconBg,
                      border: `1px solid ${card.iconBorder}`,
                      padding: '9px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 0 10px ${card.glowColor}`
                    }}>
                      {card.icon}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                          {card.title}
                        </h3>
                        <InfoTooltip
                          title={card.tooltip.title}
                          description={card.tooltip.description}
                          securityImpact={card.tooltip.securityImpact}
                          goodVsBad={card.tooltip.goodVsBad}
                          position="bottom"
                        />
                      </div>
                      <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {card.subtitle}
                      </div>
                    </div>
                  </div>

                  <span className="mono badge-info" style={{
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    letterSpacing: '0.04em'
                  }}>
                    {card.badge}
                  </span>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '16px' }}>
                  {card.description}
                </p>
              </div>

              <div>
                {/* Quote */}
                <div
                  className="mono"
                  style={{
                    fontSize: '0.72rem',
                    color: card.quoteColor,
                    background: 'var(--code-box-bg)',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    borderLeft: `3px solid ${card.quoteBorder}`,
                    marginBottom: card.actionText ? '12px' : '0'
                  }}
                >
                  {card.quote}
                </div>

                {/* Action Button */}
                {card.actionText && (
                  <motion.div
                    whileHover={{ x: 4 }}
                    onClick={() => card.onAction && card.onAction()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--accent-cyan)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: '8px'
                    }}
                  >
                    <span>{card.actionText}</span>
                    <ArrowRight size={14} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
