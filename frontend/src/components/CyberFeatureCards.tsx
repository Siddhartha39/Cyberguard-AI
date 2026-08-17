import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, GitCommit, Layers, Lock, Activity, Puzzle, ArrowRight } from 'lucide-react';

interface CyberFeatureCardsProps {
  onOpenExtension: () => void;
  onOpenDiscovery: () => void;
}

interface FeatureCardData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  glowColor: string;
  quote: string;
  quoteColor: string;
  quoteBorder: string;
  actionText?: string;
  onAction?: () => void;
  badge: string;
}

export const CyberFeatureCards: React.FC<CyberFeatureCardsProps> = ({
  onOpenExtension,
  onOpenDiscovery
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const cards: FeatureCardData[] = [
    {
      id: 'brand-contradiction',
      title: 'Brand-Domain Contradiction Engine',
      subtitle: 'Visual & Identity Verification',
      badge: 'PROPRIETARY',
      description: 'Detects when a page imitates the logos and visual identity of trusted brands (e.g. PayPal, Apple, Microsoft, Chase) while operating on an unauthorized, deceptive domain.',
      icon: <AlertTriangle size={22} color="#ef4444" />,
      iconBg: 'rgba(239, 68, 68, 0.15)',
      iconBorder: 'rgba(239, 68, 68, 0.4)',
      glowColor: 'rgba(239, 68, 68, 0.25)',
      quote: '"Imitates Bank of America, but domain is unauthorized .xyz"',
      quoteColor: '#fca5a5',
      quoteBorder: '#ef4444'
    },
    {
      id: 'attack-chain',
      title: 'Explainable Attack-Chain Reconstruction',
      subtitle: '7-Stage Forensic Path',
      badge: 'FORENSICS',
      description: 'Reconstructs a step-by-step forensic graph linking Ingress → DNS Infrastructure → Redirects → Landing DOM → Credential Forms → Exfiltration channels.',
      icon: <GitCommit size={22} color="#00f0ff" />,
      iconBg: 'rgba(0, 240, 255, 0.15)',
      iconBorder: 'rgba(0, 240, 255, 0.4)',
      glowColor: 'rgba(0, 240, 255, 0.25)',
      quote: 'Step 1 (Ingress) → Step 5 (Credential Hook) → Step 7 (Verdict)',
      quoteColor: '#38bdf8',
      quoteBorder: '#00f0ff'
    },
    {
      id: 'risk-fusion',
      title: 'Multi-Signal Calibrated Risk Fusion',
      subtitle: '0-100 Probability Vector',
      badge: 'ML CALIBRATION',
      description: 'Fuses 5 independent vectors: Lexical ML features, Domain Age & DNS, DOM password forms, Visual Brand confidence, and Threat Intel into a unified 0–100 risk score.',
      icon: <Layers size={22} color="#3b82f6" />,
      iconBg: 'rgba(59, 130, 246, 0.15)',
      iconBorder: 'rgba(59, 130, 246, 0.4)',
      glowColor: 'rgba(59, 130, 246, 0.25)',
      quote: 'Weighted contribution breakdown (+/- pts) for every signal',
      quoteColor: '#34d399',
      quoteBorder: '#00ff88'
    },
    {
      id: 'security-audit',
      title: 'Website Exploitability & Security Audit',
      subtitle: 'Defensive Posture Rating',
      badge: 'WEBSITE DEFENSE',
      description: 'Website owners can check their own domain defense posture: Clickjacking immunity (X-Frame-Options), Email spoofing resistance (SPF/DMARC), CSP, and HSTS.',
      icon: <Lock size={22} color="#00ff88" />,
      iconBg: 'rgba(0, 255, 136, 0.15)',
      iconBorder: 'rgba(0, 255, 136, 0.4)',
      glowColor: 'rgba(0, 255, 136, 0.25)',
      quote: 'Security Grades (A+ to F) + Actionable Developer Fixes',
      quoteColor: '#fcd34d',
      quoteBorder: '#f59e0b'
    },
    {
      id: 'nrd-stream',
      title: 'Newly Registered Domain (NRD) Stream',
      subtitle: 'High-Throughput Early-Warning',
      badge: 'STREAM FEED',
      description: 'High-throughput early-warning stream prioritizing unknown candidates hitting DNS logs and Certificate Transparency feeds before phishing campaigns go viral.',
      icon: <Activity size={22} color="#f97316" />,
      iconBg: 'rgba(249, 115, 22, 0.15)',
      iconBorder: 'rgba(249, 115, 22, 0.4)',
      glowColor: 'rgba(249, 115, 22, 0.25)',
      quote: 'Pre-indexing domains < 30 days old for rapid threat triage',
      quoteColor: '#fdba74',
      quoteBorder: '#f97316',
      actionText: 'Explore Discovery Stream',
      onAction: onOpenDiscovery
    },
    {
      id: 'chrome-ext',
      title: 'Real-Time Browser Extension',
      subtitle: 'Manifest V3 Defense Shield',
      badge: 'ACTIVE SHIELD',
      description: 'Lightweight Manifest V3 browser extension running silent real-time threat evaluation across active tabs with active badge indicators and threat popups.',
      icon: <Puzzle size={22} color="#c084fc" />,
      iconBg: 'rgba(168, 85, 247, 0.15)',
      iconBorder: 'rgba(168, 85, 247, 0.4)',
      glowColor: 'rgba(168, 85, 247, 0.25)',
      quote: 'Direct protection & 1-click SOC deep dive from browser',
      quoteColor: '#e9d5ff',
      quoteBorder: '#c084fc',
      actionText: 'Download & Setup Extension',
      onAction: onOpenExtension
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
      {cards.map((card, index) => {
        const isHovered = hoveredCard === card.id;

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            whileHover={{
              y: -8,
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
            className="glass-panel"
            style={{
              padding: '24px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              background: isHovered
                ? `radial-gradient(circle at 50% 0%, ${card.glowColor} 0%, rgba(13, 19, 31, 0.95) 75%)`
                : 'rgba(13, 19, 31, 0.82)',
              border: isHovered
                ? `1px solid ${card.iconBorder}`
                : '1px solid rgba(56, 189, 248, 0.25)',
              boxShadow: isHovered
                ? `0 16px 40px rgba(0, 0, 0, 0.8), 0 0 25px ${card.glowColor}`
                : '0 8px 24px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Top Badge & Icon Row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: card.iconBg,
                  border: `1px solid ${card.iconBorder}`,
                  padding: '10px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 12px ${card.glowColor}`
                }}>
                  {card.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f3f4f6', lineHeight: 1.3 }}>
                    {card.title}
                  </h3>
                  <div className="mono" style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>
                    {card.subtitle}
                  </div>
                </div>
              </div>

              <span className="mono" style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                color: '#38bdf8',
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                padding: '2px 8px',
                borderRadius: '10px',
                letterSpacing: '0.05em'
              }}>
                {card.badge}
              </span>
            </div>

            {/* Description */}
            <p style={{ fontSize: '0.83rem', color: '#9ca3af', lineHeight: 1.55, marginBottom: '16px' }}>
              {card.description}
            </p>

            {/* Forensic Quote Box */}
            <div
              className="mono"
              style={{
                fontSize: '0.73rem',
                color: card.quoteColor,
                background: 'rgba(0, 0, 0, 0.55)',
                padding: '8px 12px',
                borderRadius: '6px',
                borderLeft: `3px solid ${card.quoteBorder}`,
                marginBottom: card.actionText ? '14px' : '0'
              }}
            >
              {card.quote}
            </div>

            {/* Action CTA Link */}
            {card.actionText && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (card.onAction) card.onAction();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#00f0ff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '10px',
                  transition: 'gap 0.2s ease'
                }}
              >
                <span>{card.actionText}</span>
                <ArrowRight size={13} />
              </div>
            )}

            {/* Cyber Grid Corner Accent */}
            <div style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: '24px',
              height: '24px',
              borderRight: `2px solid ${card.iconBorder}`,
              borderBottom: `2px solid ${card.iconBorder}`,
              opacity: isHovered ? 1 : 0.4
            }} />
          </motion.div>
        );
      })}
    </div>
  );
};
