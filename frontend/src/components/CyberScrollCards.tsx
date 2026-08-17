import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useScroll, useTransform } from 'framer-motion';
import { AlertTriangle, GitCommit, Layers, Lock, Activity, Puzzle, ArrowRight, Sparkles } from 'lucide-react';

interface CyberScrollCardsProps {
  onOpenExtension: () => void;
  onOpenDiscovery: () => void;
}

interface CapabilityCardData {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGlow: string;
  borderColor: string;
  quote: string;
  actionText?: string;
  onAction?: () => void;
}

const StickyCard_003: React.FC<{ card: CapabilityCardData }> = ({ card }) => {
  const vertMargin = 10;
  const container = useRef<HTMLDivElement | null>(null);
  const [maxScrollY, setMaxScrollY] = useState(Infinity);

  const filter = useMotionValue(0);
  const negateFilter = useTransform(filter, (value) => -value);

  const { scrollY } = useScroll({
    target: container,
  });

  const scale = useTransform(scrollY, [maxScrollY, maxScrollY + 10000], [1, 0]);
  const isInView = useInView(container, {
    margin: `0px 0px -${100 - vertMargin}% 0px`,
    once: true,
  });

  scrollY.on("change", (currentY) => {
    let animationValue = 1;
    if (currentY > maxScrollY) {
      animationValue = Math.max(0, 1 - (currentY - maxScrollY) / 10000);
    }
    scale.set(animationValue);
    filter.set((1 - animationValue) * 100);
  });

  useEffect(() => {
    if (isInView) {
      setMaxScrollY(scrollY.get());
    }
  }, [isInView, scrollY]);

  return (
    <motion.div
      ref={container}
      className="sticky w-full max-w-4xl overflow-hidden glass-panel"
      style={{
        scale: scale,
        rotate: filter,
        minHeight: `${100 - 2 * vertMargin}vh`,
        top: `${vertMargin}vh`,
        borderRadius: '24px',
        border: `1px solid ${card.borderColor}`,
        background: `radial-gradient(circle at 50% 0%, ${card.bgGlow} 0%, rgba(13, 19, 31, 0.98) 75%)`,
        boxShadow: `0 24px 60px rgba(0, 0, 0, 0.85), 0 0 35px ${card.bgGlow}`,
        padding: '36px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        marginBottom: '40px'
      }}
    >
      <motion.div
        style={{
          rotate: negateFilter,
        }}
        className="w-full h-full flex flex-col justify-center"
      >
        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: `1px solid ${card.borderColor}`,
              padding: '14px',
              borderRadius: '14px',
              boxShadow: `0 0 20px ${card.bgGlow}`
            }}>
              {card.icon}
            </div>
            <div>
              <div className="mono" style={{ fontSize: '0.8rem', color: card.color, fontWeight: 800 }}>
                MODULE {card.step} // {card.subtitle.toUpperCase()}
              </div>
              <h3 className="cyber-font" style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f3f4f6', marginTop: '4px' }}>
                {card.title}
              </h3>
            </div>
          </div>

          <span className="mono" style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: card.color,
            background: 'rgba(0,0,0,0.5)',
            border: `1px solid ${card.borderColor}`,
            padding: '4px 14px',
            borderRadius: '14px'
          }}>
            {card.badge}
          </span>
        </div>

        {/* Card Description */}
        <p style={{ fontSize: '1.05rem', color: '#d1d5db', lineHeight: 1.65, marginBottom: '24px' }}>
          {card.description}
        </p>

        {/* Forensic Quote Box */}
        <div
          className="mono"
          style={{
            fontSize: '0.88rem',
            color: '#f3f4f6',
            background: 'rgba(0, 0, 0, 0.65)',
            padding: '14px 18px',
            borderRadius: '10px',
            borderLeft: `4px solid ${card.color}`,
            marginBottom: card.actionText ? '20px' : '0'
          }}
        >
          {card.quote}
        </div>

        {/* Action CTA */}
        {card.actionText && (
          <div
            onClick={() => card.onAction && card.onAction()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: card.color,
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              marginTop: '18px'
            }}
          >
            <span>{card.actionText}</span>
            <ArrowRight size={18} />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export const CyberScrollCards: React.FC<CyberScrollCardsProps> = ({
  onOpenExtension,
  onOpenDiscovery
}) => {
  const cards: CapabilityCardData[] = [
    {
      id: 'brand-contradiction',
      step: '01',
      title: 'Brand-Domain Contradiction Engine',
      subtitle: 'Visual & Identity Verification',
      badge: 'PROPRIETARY',
      description: 'Detects when a page imitates the logos and visual identity of trusted brands (e.g. PayPal, Apple, Microsoft, Chase) while operating on an unauthorized, deceptive domain.',
      icon: <AlertTriangle size={28} color="#ef4444" />,
      color: '#ef4444',
      bgGlow: 'rgba(239, 68, 68, 0.28)',
      borderColor: 'rgba(239, 68, 68, 0.6)',
      quote: '"Imitates Bank of America, but domain is unauthorized .xyz"'
    },
    {
      id: 'attack-chain',
      step: '02',
      title: 'Explainable Attack-Chain Reconstruction',
      subtitle: '7-Stage Forensic Path',
      badge: 'FORENSICS',
      description: 'Reconstructs a step-by-step forensic graph linking Ingress → DNS Infrastructure → Redirects → Landing DOM → Credential Forms → Exfiltration channels.',
      icon: <GitCommit size={28} color="#00f0ff" />,
      color: '#00f0ff',
      bgGlow: 'rgba(0, 240, 255, 0.28)',
      borderColor: 'rgba(0, 240, 255, 0.6)',
      quote: 'Step 1 (Ingress) → Step 5 (Credential Hook) → Step 7 (Verdict)'
    },
    {
      id: 'risk-fusion',
      step: '03',
      title: 'Multi-Signal Calibrated Risk Fusion',
      subtitle: '0-100 Probability Vector',
      badge: 'ML CALIBRATION',
      description: 'Fuses 5 independent vectors: Lexical ML features, Domain Age & DNS, DOM password forms, Visual Brand confidence, and Threat Intel into a unified 0–100 risk score.',
      icon: <Layers size={28} color="#3b82f6" />,
      color: '#3b82f6',
      bgGlow: 'rgba(59, 130, 246, 0.28)',
      borderColor: 'rgba(59, 130, 246, 0.6)',
      quote: 'Weighted contribution breakdown (+/- pts) for every signal'
    },
    {
      id: 'security-audit',
      step: '04',
      title: 'Website Exploitability & Security Audit',
      subtitle: 'Defensive Posture Rating',
      badge: 'WEBSITE DEFENSE',
      description: 'Website owners can check their own domain defense posture: Clickjacking immunity (X-Frame-Options), Email spoofing resistance (SPF/DMARC), CSP, and HSTS.',
      icon: <Lock size={28} color="#00ff88" />,
      color: '#00ff88',
      bgGlow: 'rgba(0, 255, 136, 0.28)',
      borderColor: 'rgba(0, 255, 136, 0.6)',
      quote: 'Security Grades (A+ to F) + Actionable Developer Fixes'
    },
    {
      id: 'nrd-stream',
      step: '05',
      title: 'Newly Registered Domain (NRD) Stream',
      subtitle: 'High-Throughput Early-Warning',
      badge: 'STREAM FEED',
      description: 'High-throughput early-warning stream prioritizing unknown candidates hitting DNS logs and Certificate Transparency feeds before phishing campaigns go viral.',
      icon: <Activity size={28} color="#f97316" />,
      color: '#f97316',
      bgGlow: 'rgba(249, 115, 22, 0.28)',
      borderColor: 'rgba(249, 115, 22, 0.6)',
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
      icon: <Puzzle size={28} color="#c084fc" />,
      color: '#c084fc',
      bgGlow: 'rgba(168, 85, 247, 0.28)',
      borderColor: 'rgba(168, 85, 247, 0.6)',
      quote: 'Direct protection & 1-click SOC deep dive from browser',
      actionText: 'Download & Setup Extension',
      onAction: onOpenExtension
    }
  ];

  return (
    <section className="relative flex w-full flex-col items-center gap-[10vh] px-4 pt-[10vh]">
      <div className="text-center mb-6">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 240, 255, 0.12)', border: '1px solid rgba(0, 240, 255, 0.4)', borderRadius: '20px', padding: '6px 16px' }}>
          <Sparkles size={16} color="#00f0ff" />
          <span className="mono text-xs uppercase tracking-widest text-cyan-400 font-bold">
            Scroll down to see effect
          </span>
        </div>
      </div>

      {cards.map((card) => (
        <StickyCard_003 key={card.id} card={card} />
      ))}
    </section>
  );
};
