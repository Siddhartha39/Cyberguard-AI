import React from 'react';
import { Radar, Terminal, AlertTriangle, GitCommit, Layers, Lock, Activity, Puzzle, ArrowRight } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface LandingPageProps {
  onLaunchScanner: () => void;
  onOpenExtension: () => void;
  onOpenDiscovery: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchScanner,
  onOpenExtension,
  onOpenDiscovery
}) => {
  const capabilityCards = [
    {
      id: 'brand-contradiction',
      title: 'Brand-Domain Contradiction Engine',
      subtitle: 'Visual & Identity Verification',
      badge: 'PROPRIETARY',
      description: 'Detects when a page imitates the logos and visual identity of trusted brands (e.g. PayPal, Apple, Microsoft, Chase) while operating on an unauthorized, deceptive domain.',
      icon: <AlertTriangle size={22} color="#ef4444" />,
      iconBg: 'rgba(239, 68, 68, 0.12)',
      iconBorder: 'rgba(239, 68, 68, 0.4)',
      quote: '"Imitates Bank of America, but domain is unauthorized .xyz"',
      quoteColor: '#ef4444',
      quoteBorder: '#ef4444',
      tooltip: {
        title: 'Brand-Domain Contradiction',
        description: 'Uses perceptual hashing (pHash) and visual logo matching to compare page visuals against a verified brand catalog. Detects deceptive impersonation.',
        securityImpact: 'Stops credential harvesting pages masquerading as banks, payment processors, or cloud portals.',
        goodVsBad: 'Authorized domains match officially registered parent brands; unauthorized domains flag brand contradiction.'
      }
    },
    {
      id: 'attack-chain',
      title: 'Explainable Attack-Chain Reconstruction',
      subtitle: '7-Stage Forensic Path',
      badge: 'FORENSICS',
      description: 'Reconstructs a step-by-step forensic graph linking Ingress → DNS Infrastructure → Redirects → Landing DOM → Credential Forms → Exfiltration channels.',
      icon: <GitCommit size={22} color="var(--accent-cyan)" />,
      iconBg: 'rgba(0, 240, 255, 0.12)',
      iconBorder: 'rgba(0, 240, 255, 0.4)',
      quote: 'Step 1 (Ingress) → Step 5 (Credential Hook) → Step 7 (Verdict)',
      quoteColor: 'var(--accent-cyan)',
      quoteBorder: 'var(--accent-cyan)',
      tooltip: {
        title: '7-Stage Attack Chain Reconstruction',
        description: 'Maps the entire adversary lifecycle: Ingress Link, DNS Hosting, HTTP Redirect Bounces, Deceptive Landing DOM, Password Form Injection, and Data Exfiltration.',
        securityImpact: 'Gives SOC analysts explainable, actionable evidence for rapid incident response and threat takedowns.',
        goodVsBad: 'Clean sites have straightforward 2-step resolution; phishing campaigns exhibit multi-hop redirects and credential hooks.'
      }
    },
    {
      id: 'risk-fusion',
      title: 'Multi-Signal Calibrated Risk Fusion',
      subtitle: '0-100 Probability Vector',
      badge: 'ML CALIBRATION',
      description: 'Fuses 5 independent vectors: Lexical ML features, Domain Age & DNS, DOM password forms, Visual Brand confidence, and Threat Intel into a unified 0–100 risk score.',
      icon: <Layers size={22} color="#3b82f6" />,
      iconBg: 'rgba(59, 130, 246, 0.12)',
      iconBorder: 'rgba(59, 130, 246, 0.4)',
      quote: 'Weighted contribution breakdown (+/- pts) for every signal',
      quoteColor: 'var(--accent-green)',
      quoteBorder: 'var(--accent-green)',
      tooltip: {
        title: 'Calibrated Risk Scoring (0–100)',
        description: 'Combines ML lexical probabilities with forensic evidence points. Employs Platt scaling to prevent false positives and provide calibrated probability.',
        securityImpact: 'Ensures security teams prioritize high-confidence threats without being overwhelmed by alert fatigue.',
        goodVsBad: '0–29: Benign / Safe, 30–69: Suspicious / Under Review, 70–100: Malicious Phishing Campaign.'
      }
    },
    {
      id: 'security-audit',
      title: 'Website Exploitability & Security Audit',
      subtitle: 'Defensive Posture Rating',
      badge: 'WEBSITE DEFENSE',
      description: 'Website owners can check their own domain defense posture: Clickjacking immunity (X-Frame-Options), Email spoofing resistance (SPF/DMARC), CSP, and HSTS.',
      icon: <Lock size={22} color="var(--accent-green)" />,
      iconBg: 'rgba(0, 255, 136, 0.12)',
      iconBorder: 'rgba(0, 255, 136, 0.4)',
      quote: 'Security Grades (A+ to F) + Actionable Developer Fixes',
      quoteColor: '#f59e0b',
      quoteBorder: '#f59e0b',
      actionText: 'Audit Your Own Domain',
      onAction: onLaunchScanner,
      tooltip: {
        title: 'Website Exploitability Audit',
        description: 'Inspects HTTP security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options) and DNS records (SPF, DMARC) to calculate an executive security grade.',
        securityImpact: 'Prevents Clickjacking, MIME type sniffing, XSS injection, and email spoofing impersonation.',
        goodVsBad: 'Grade A+/A: Hardened security headers; Grade D/F: Highly vulnerable to injection and spoofing.'
      }
    },
    {
      id: 'nrd-stream',
      title: 'Newly Registered Domain (NRD) Stream',
      subtitle: 'High-Throughput Early-Warning',
      badge: 'STREAM FEED',
      description: 'High-throughput early-warning stream prioritizing unknown candidates hitting DNS logs and Certificate Transparency feeds before phishing campaigns go viral.',
      icon: <Activity size={22} color="#f97316" />,
      iconBg: 'rgba(249, 115, 22, 0.12)',
      iconBorder: 'rgba(249, 115, 22, 0.4)',
      quote: '< 10ms lexical triage + one-click escalation sandbox',
      quoteColor: '#f97316',
      quoteBorder: '#f97316',
      actionText: 'Explore NRD Stream',
      onAction: onOpenDiscovery,
      tooltip: {
        title: 'Newly Registered Domain (NRD) Pipeline',
        description: 'Ingests real-time domain creation feeds. Over 70% of zero-day attacks occur on domains under 30 days old. Filters malicious targets via sub-10ms lexical heuristics.',
        securityImpact: 'Enables SOC teams to block malicious infrastructure before phishing emails reach inboxes.',
        goodVsBad: 'Candidate domains with high lexical threat scores are escalated for instant Playwright sandbox inspection.'
      }
    },
    {
      id: 'chrome-ext',
      title: 'Real-Time Chrome Browser Extension',
      subtitle: 'Endpoint Client Protection',
      badge: 'ENDPOINT AGENT',
      description: 'Manifest V3 sidecar auditing active tabs in real-time. Displays threat warning banners, visual trust gauges, and seamless 1-click inspection routing.',
      icon: <Puzzle size={22} color="#c084fc" />,
      iconBg: 'rgba(192, 132, 252, 0.12)',
      iconBorder: 'rgba(192, 132, 252, 0.4)',
      quote: 'Active browser background monitoring & instant badge telemetry',
      quoteColor: '#c084fc',
      quoteBorder: '#c084fc',
      actionText: 'Download Extension',
      onAction: onOpenExtension,
      tooltip: {
        title: 'Real-Time Chrome Browser Extension',
        description: 'Browser sidecar that audits active tabs in real-time. Features badge alerts, threat warnings, and direct 1-click launch to the CyberGuard AI command center.',
        securityImpact: 'Endpoints receive instantaneous zero-hour protection against deceptive links.',
        goodVsBad: 'Green shield = verified safe; Red shield = malicious credential harvester intercepted.'
      }
    }
  ];

  return (
    <div style={{ padding: '0 24px 40px 24px' }}>
      {/* Hero Section */}
      <div className="glass-panel" style={{
        padding: '44px 28px',
        marginBottom: '28px',
        background: 'var(--hero-bg)',
        border: '1px solid var(--border-color)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Hacker Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 240, 255, 0.12)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '6px 16px', fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '18px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-green)', display: 'inline-block' }}></span>
          <span className="mono cyber-font">CYBER COMMAND TERMINAL // CORE V2.0</span>
          <InfoTooltip
            title="Cyber Command Core V2.0"
            description="Antigravity-engineered zero-trust cybersecurity operating environment running real-time ML pipelines and live WHOIS RDAP resolvers."
            position="bottom"
          />
        </div>

        <h1 className="cyber-font neon-cyan-glow" style={{ fontSize: 'clamp(1.4rem, 4vw, 2.3rem)', fontWeight: 900, letterSpacing: '0.02em', lineHeight: 1.25, maxWidth: '900px', margin: '0 auto 16px auto', color: 'var(--text-primary)' }}>
          AI-POWERED PHISHING INTELLIGENCE &amp; ATTACK-CHAIN FORENSICS
        </h1>

        <p style={{ fontSize: 'clamp(0.88rem, 2vw, 1.02rem)', color: 'var(--text-secondary)', maxWidth: '740px', margin: '0 auto 26px auto', lineHeight: 1.55 }}>
          Zero-trust cyber defense platform detecting brand-spoofing lookalikes, reconstructing step-by-step forensic attack paths, and auditing web infrastructure exploitability.
        </p>

        {/* Hero CTAs */}
        <div className="hero-action-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={onLaunchScanner}
            style={{
              background: 'linear-gradient(135deg, #00f0ff 0%, #0284c7 100%)',
              color: '#070a10',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 24px',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 25px rgba(0, 240, 255, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            <Radar size={18} />
            <span className="cyber-font" style={{ letterSpacing: '0.04em' }}>LAUNCH LIVE SCANNER</span>
          </button>

          <button
            onClick={onOpenExtension}
            style={{
              background: 'var(--bg-card)',
              color: 'var(--accent-cyan)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '12px 24px',
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
            <span className="cyber-font" style={{ letterSpacing: '0.04em' }}>GET BROWSER SHIELD</span>
          </button>
        </div>

        {/* Telemetry Status Bar with Tooltips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', maxWidth: '900px', margin: '32px auto 0 auto', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <div>
            <div className="mono cyber-font neon-cyan-glow" style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span>0.0 – 100</span>
              <InfoTooltip
                title="Calibrated Risk Index"
                description="Consolidated 0–100 threat probability index fusing lexical, hosting, brand, and DOM signals."
                position="top"
              />
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>CALIBRATED RISK INDEX</div>
          </div>
          <div>
            <div className="mono cyber-font neon-green-glow" style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span>7-STAGE</span>
              <InfoTooltip
                title="7-Stage Attack Graph"
                description="Chronological forensic graph linking domain ingress to credential submission forms."
                position="top"
              />
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>ATTACK-CHAIN GRAPH</div>
          </div>
          <div>
            <div className="mono cyber-font" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span>&lt; 30 DAYS</span>
              <InfoTooltip
                title="Newly Registered Domains (NRD)"
                description="Domains registered in the last 30 days are automatically placed on heightened surveillance."
                position="top"
              />
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>NRD EARLY WARNING</div>
          </div>
          <div>
            <div className="mono cyber-font" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span>GEMINI AI</span>
              <InfoTooltip
                title="Gemini AI Exploit Explainer"
                description="Google Gemini AI auditor generating plain-language threat intelligence and developer remediation steps."
                position="top"
              />
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>EXPLOITABILITY AUDITING</div>
          </div>
        </div>
      </div>

      {/* Cyber Defense Capabilities Grid Header */}
      <h2 className="cyber-font neon-cyan-glow" style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <Terminal size={20} color="var(--accent-cyan)" />
        <span>CYBER DEFENSE &amp; INTELLIGENCE CAPABILITIES</span>
        <InfoTooltip
          title="Cyber Defense Capabilities Suite"
          description="Explore all 6 modular defense systems operating in parallel inside the CyberGuard AI core engine."
          position="right"
        />
      </h2>

      {/* Clean 6-Card Cyber Grid with Info Tooltips */}
      <div className="feature-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
        {capabilityCards.map((card) => (
          <div
            key={card.id}
            className="glass-panel"
            style={{
              padding: '22px',
              borderRadius: '12px',
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
                    padding: '8px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {card.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
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
                  padding: '2px 6px',
                  borderRadius: '8px',
                  letterSpacing: '0.04em'
                }}>
                  {card.badge}
                </span>
              </div>

              {/* Description */}
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
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
                  padding: '8px 12px',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${card.quoteBorder}`,
                  marginBottom: card.actionText ? '10px' : '0'
                }}
              >
                {card.quote}
              </div>

              {/* Action Button */}
              {card.actionText && (
                <div
                  onClick={() => card.onAction && card.onAction()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  <span>{card.actionText}</span>
                  <ArrowRight size={13} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
