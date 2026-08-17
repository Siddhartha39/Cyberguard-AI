import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, GitCommit, Layers, Lock, Activity, Puzzle, ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface CyberStackDeckProps {
  onOpenExtension: () => void;
  onOpenDiscovery: () => void;
}

export const CyberStackDeck: React.FC<CyberStackDeckProps> = ({
  onOpenExtension,
  onOpenDiscovery
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const cards = [
    {
      id: 'brand-contradiction',
      step: '01',
      title: 'Brand-Domain Contradiction Engine',
      subtitle: 'Visual & Identity Verification',
      badge: 'PROPRIETARY',
      description: 'Detects when a page imitates the logos and visual identity of trusted brands (e.g. PayPal, Apple, Microsoft, Chase) while operating on an unauthorized, deceptive domain.',
      icon: <AlertTriangle size={24} color="#ef4444" />,
      color: '#ef4444',
      bgGlow: 'rgba(239, 68, 68, 0.25)',
      quote: '"Imitates Bank of America, but domain is unauthorized .xyz"'
    },
    {
      id: 'attack-chain',
      step: '02',
      title: 'Explainable Attack-Chain Reconstruction',
      subtitle: '7-Stage Forensic Path',
      badge: 'FORENSICS',
      description: 'Reconstructs a step-by-step forensic graph linking Ingress → DNS Infrastructure → Redirects → Landing DOM → Credential Forms → Exfiltration channels.',
      icon: <GitCommit size={24} color="#00f0ff" />,
      color: '#00f0ff',
      bgGlow: 'rgba(0, 240, 255, 0.25)',
      quote: 'Step 1 (Ingress) → Step 5 (Credential Hook) → Step 7 (Verdict)'
    },
    {
      id: 'risk-fusion',
      step: '03',
      title: 'Multi-Signal Calibrated Risk Fusion',
      subtitle: '0-100 Probability Vector',
      badge: 'ML CALIBRATION',
      description: 'Fuses 5 independent vectors: Lexical ML features, Domain Age & DNS, DOM password forms, Visual Brand confidence, and Threat Intel into a unified 0–100 risk score.',
      icon: <Layers size={24} color="#3b82f6" />,
      color: '#3b82f6',
      bgGlow: 'rgba(59, 130, 246, 0.25)',
      quote: 'Weighted contribution breakdown (+/- pts) for every signal'
    },
    {
      id: 'security-audit',
      step: '04',
      title: 'Website Exploitability & Security Audit',
      subtitle: 'Defensive Posture Rating',
      badge: 'WEBSITE DEFENSE',
      description: 'Website owners can check their own domain defense posture: Clickjacking immunity (X-Frame-Options), Email spoofing resistance (SPF/DMARC), CSP, and HSTS.',
      icon: <Lock size={24} color="#00ff88" />,
      color: '#00ff88',
      bgGlow: 'rgba(0, 255, 136, 0.25)',
      quote: 'Security Grades (A+ to F) + Actionable Developer Fixes'
    },
    {
      id: 'nrd-stream',
      step: '05',
      title: 'Newly Registered Domain (NRD) Stream',
      subtitle: 'High-Throughput Early-Warning',
      badge: 'STREAM FEED',
      description: 'High-throughput early-warning stream prioritizing unknown candidates hitting DNS logs and Certificate Transparency feeds before phishing campaigns go viral.',
      icon: <Activity size={24} color="#f97316" />,
      color: '#f97316',
      bgGlow: 'rgba(249, 115, 22, 0.25)',
      quote: 'Pre-indexing domains < 30 days old for rapid threat triage',
      actionText: 'Explore Discovery Stream',
      onAction: onOpenDiscovery
    },
    {
      id: 'chrome-ext',
      step: '06',
      title: 'Real-Time Browser Extension',
      subtitle: 'Manifest V3 Defense Shield',
      badge: 'ACTIVE SHIELD',
      description: 'Lightweight Manifest V3 browser extension running silent real-time threat evaluation across active tabs with active badge indicators and threat popups.',
      icon: <Puzzle size={24} color="#c084fc" />,
      color: '#c084fc',
      bgGlow: 'rgba(168, 85, 247, 0.25)',
      quote: 'Direct protection & 1-click SOC deep dive from browser',
      actionText: 'Download & Setup Extension',
      onAction: onOpenExtension
    }
  ];

  const activeCard = cards[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div style={{ margin: '30px 0', position: 'relative' }}>
      {/* Interactive Deck Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={18} color="#00f0ff" />
          <span className="cyber-font neon-cyan-glow" style={{ fontSize: '1rem', fontWeight: 800 }}>
            INTERACTIVE DEFENSE DECK [STEP 0{activeIndex + 1}/0{cards.length}]
          </span>
        </div>

        {/* Carousel Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              style={{
                width: activeIndex === i ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                background: activeIndex === i ? '#00f0ff' : 'rgba(75, 85, 99, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
            />
          ))}

          <div style={{ display: 'flex', gap: '6px', marginLeft: '10px' }}>
            <button
              onClick={handlePrev}
              style={{
                background: 'rgba(17, 24, 39, 0.8)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '8px',
                color: '#38bdf8',
                padding: '6px 10px',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              style={{
                background: 'rgba(17, 24, 39, 0.8)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '8px',
                color: '#38bdf8',
                padding: '6px 10px',
                cursor: 'pointer'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 3D Stack Container */}
      <div style={{ position: 'relative', minHeight: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCard.id}
            initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -30, rotateX: -20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '820px',
              padding: '32px',
              background: `radial-gradient(circle at 50% 0%, ${activeCard.bgGlow} 0%, rgba(13, 19, 31, 0.96) 80%)`,
              border: `1px solid ${activeCard.color}`,
              boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px ${activeCard.bgGlow}`,
              borderRadius: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: `1px solid ${activeCard.color}`,
                  padding: '12px',
                  borderRadius: '12px',
                  boxShadow: `0 0 16px ${activeCard.bgGlow}`
                }}>
                  {activeCard.icon}
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '0.75rem', color: activeCard.color, fontWeight: 800 }}>
                    MODULE {activeCard.step} // {activeCard.subtitle.toUpperCase()}
                  </div>
                  <h3 className="cyber-font" style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f3f4f6', marginTop: '2px' }}>
                    {activeCard.title}
                  </h3>
                </div>
              </div>

              <span className="mono" style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: activeCard.color,
                background: 'rgba(0,0,0,0.5)',
                border: `1px solid ${activeCard.color}`,
                padding: '4px 12px',
                borderRadius: '12px'
              }}>
                {activeCard.badge}
              </span>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#d1d5db', lineHeight: 1.6, marginBottom: '20px' }}>
              {activeCard.description}
            </p>

            <div
              className="mono"
              style={{
                fontSize: '0.82rem',
                color: '#f3f4f6',
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '12px 16px',
                borderRadius: '8px',
                borderLeft: `4px solid ${activeCard.color}`,
                marginBottom: activeCard.actionText ? '16px' : '0'
              }}
            >
              {activeCard.quote}
            </div>

            {activeCard.actionText && (
              <div
                onClick={() => activeCard.onAction && activeCard.onAction()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: activeCard.color,
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  marginTop: '14px'
                }}
              >
                <span>{activeCard.actionText}</span>
                <ArrowRight size={15} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
