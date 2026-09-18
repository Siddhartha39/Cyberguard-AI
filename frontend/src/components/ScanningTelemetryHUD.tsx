import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar,
  Terminal,
  Shield,
  Globe,
  Lock,
  Eye,
  Cpu,
  CheckCircle2,
  Loader2,
  Zap,
  Activity,
  Coins,
  Sparkles,
  Wifi,
  Server
} from 'lucide-react';

interface ScanningTelemetryHUDProps {
  targetUrl: string;
  isDeep: boolean;
}

export const ScanningTelemetryHUD: React.FC<ScanningTelemetryHUDProps> = ({ targetUrl, isDeep }) => {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeLogIndex, setActiveLogIndex] = useState(0);
  const [entropySim, setEntropySim] = useState('3.842');
  const [activeHex, setActiveHex] = useState('0x7F000001');

  const steps = [
    {
      id: 'step-1',
      title: 'DNS Resolution & RDAP Registry Query',
      detail: 'Resolving A/AAAA, MX, NS, TXT records and calculating ground-truth domain age',
      icon: Globe,
      color: '#00f0ff',
      latency: '18ms'
    },
    {
      id: 'step-2',
      title: 'URL Lexical Feature Vector & Entropy Extraction',
      detail: 'Extracting 24-dimensional feature tensor and computing Shannon entropy in <15ms',
      icon: Terminal,
      color: '#3b82f6',
      latency: '12ms'
    },
    {
      id: 'step-3',
      title: 'SSL/TLS Certificate & Transport Encryption Audit',
      detail: 'Verifying SNI chain, certificate validity, expiration, and issuer trustworthiness',
      icon: Lock,
      color: '#00ff88',
      latency: '34ms'
    },
    {
      id: 'step-4',
      title: isDeep ? 'Isolated Playwright Chromium Sandbox Crawl' : 'Fast Triage & Domain Standing Synthesis',
      detail: isDeep
        ? 'Rendering DOM, intercepting form submission targets, and inspecting obfuscated scripts'
        : 'Evaluating initial heuristic boundary and safety thresholds',
      icon: Eye,
      color: '#f59e0b',
      latency: isDeep ? '420ms' : '22ms'
    },
    {
      id: 'step-5',
      title: isDeep ? 'Visual Perceptual Hashing (pHash) Brand Match' : 'Visual Asset & Domain Alignment',
      detail: isDeep
        ? 'Comparing 64-bit DCT logo perceptual hashes against enterprise brand catalog'
        : 'Evaluating visual brand representation against authoritative DNS records',
      icon: Shield,
      color: '#ef4444',
      latency: isDeep ? '180ms' : '15ms'
    },
    {
      id: 'step-6',
      title: 'Multi-Signal Fusion & Calibrated Risk Matrix',
      detail: 'Synthesizing all independent vectors into explainable 0-100 score and threat timeline',
      icon: Cpu,
      color: '#c084fc',
      latency: '45ms'
    }
  ];

  const terminalLogs = [
    `[>] INGRESS TARGET: ${targetUrl}`,
    `[+] DISPATCHING QUERY TO GOOGLE DOH & IANA RDAP RESOLVER...`,
    `[+] EXTRACTING 24-DIMENSIONAL LEXICAL TENSOR // ENTROPY: ${entropySim} BITS`,
    `[+] VERIFYING SSL/TLS CERTIFICATE TRANSPARENCY & CIPHER SUITES...`,
    isDeep ? `[+] LAUNCHING ISOLATED PLAYWRIGHT CHROMIUM SANDBOX (NO-SANDBOX / HEADLESS)...` : `[+] EVALUATING FAST HEURISTIC BOUNDARIES...`,
    isDeep ? `[+] CAPTURING DOM TREE // INTERCEPTING PASSWORD INPUT TARGETS...` : `[+] EVALUATING SECURITY HEADERS & EXPLOIT IMMUNITY...`,
    isDeep ? `[+] COMPUTING 64-BIT DCT PERCEPTUAL HASH (pHash) VS BRAND VECTORS...` : `[+] COMPUTING TRIAGE VERDICT...`,
    `[+] EXECUTING PLATT-SCALED MULTI-SIGNAL FUSION MODEL...`,
    `[✓] CALIBRATION COMPLETE // GENERATING EXPLAINABLE FORENSIC DOSSIER`
  ];

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const diff = Date.now() - start;
      setElapsedMs(diff);

      const stepDuration = isDeep ? 620 : 700;
      const totalExpected = isDeep ? stepDuration * steps.length : stepDuration * 3;
      const stepIdx = Math.min(steps.length - 1, Math.floor(diff / stepDuration));
      setCurrentStep(stepIdx);

      const logIdx = Math.min(terminalLogs.length - 1, Math.floor(diff / (stepDuration * 0.45)));
      setActiveLogIndex(logIdx);

      // Random fluctuating entropy & memory address for dynamic cyber feel
      const simEnt = (3.5 + Math.random() * 2.2).toFixed(3);
      setEntropySim(simEnt);
      const hex = '0x' + Math.floor(Math.random() * 0xFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
      setActiveHex(hex);
    }, 50);

    return () => clearInterval(interval);
  }, [targetUrl, isDeep]);

  const stepDuration = isDeep ? 620 : 700;
  const totalExpectedMs = isDeep ? stepDuration * steps.length : stepDuration * 3;
  const progressPercent = Math.min(100, Math.round((elapsedMs / totalExpectedMs) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35 }}
      className="glass-panel"
      style={{
        padding: '28px 24px',
        margin: '0 24px 24px 24px',
        background: 'radial-gradient(circle at 50% 0%, rgba(0, 240, 255, 0.14) 0%, rgba(13, 19, 31, 0.96) 85%)',
        border: '1px solid rgba(0, 240, 255, 0.45)',
        boxShadow: '0 12px 45px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 240, 255, 0.15)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Background Animated Scanner Beam */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #00f0ff, #00ff88, #38bdf8, transparent)',
          animation: 'cyber-shimmer 2s infinite'
        }}
      />

      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Animated Pulsing Radar Spinner */}
          <div style={{
            background: 'rgba(0, 240, 255, 0.18)',
            border: '1px solid #00f0ff',
            padding: '10px',
            borderRadius: '12px',
            color: '#00f0ff',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Radar size={24} className="radar-spinner" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h3 className="cyber-font neon-cyan-glow" style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '0.03em' }}>
                ACTIVE CYBER THREAT TELEMETRY ENGINE
              </h3>
              <span className="mono" style={{
                fontSize: '0.68rem',
                background: isDeep ? 'rgba(192, 132, 252, 0.18)' : 'rgba(245, 158, 11, 0.18)',
                border: isDeep ? '1px solid rgba(192, 132, 252, 0.5)' : '1px solid rgba(245, 158, 11, 0.5)',
                color: isDeep ? '#c084fc' : '#f59e0b',
                padding: '3px 10px',
                borderRadius: '12px',
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}>
                {isDeep ? 'DEEP FORENSIC AUDIT (FREE)' : 'FAST TRIAGE SCAN'}
              </span>
            </div>

            <div className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              INSPECTING TARGET: <span style={{ color: '#00f0ff', fontWeight: 800 }}>{targetUrl}</span>
            </div>
          </div>
        </div>

        {/* Live Counters */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="mono" style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.74rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>TIME: </span>
            <span style={{ color: '#00f0ff', fontWeight: 800 }}>{(elapsedMs / 1000).toFixed(1)}s</span>
          </div>
          <div className="mono" style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.74rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>STAGE: </span>
            <span style={{ color: '#00ff88', fontWeight: 800 }}>{currentStep + 1} / {steps.length}</span>
          </div>
          <div className="mono" style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.74rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>ADDR: </span>
            <span style={{ color: '#c084fc', fontWeight: 700 }}>{activeHex}</span>
          </div>
        </div>
      </div>

      {/* Main Execution Split: Live Radar + Terminal Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {/* Radar Sonar Visualizer Card */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.65)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            minHeight: '200px',
            overflow: 'hidden'
          }}
        >
          {/* Radar Sweep SVG Animation */}
          <div style={{ position: 'relative', width: '160px', height: '160px' }}>
            <svg width="160" height="160" viewBox="0 0 160 160">
              {/* Concentric Circles */}
              <circle cx="80" cy="80" r="70" stroke="rgba(0, 240, 255, 0.2)" strokeWidth="1" fill="none" />
              <circle cx="80" cy="80" r="50" stroke="rgba(0, 240, 255, 0.25)" strokeWidth="1" fill="none" />
              <circle cx="80" cy="80" r="30" stroke="rgba(0, 240, 255, 0.3)" strokeWidth="1" fill="none" />
              <circle cx="80" cy="80" r="10" stroke="rgba(0, 240, 255, 0.4)" strokeWidth="1" fill="none" />
              
              {/* Crosshairs */}
              <line x1="10" y1="80" x2="150" y2="80" stroke="rgba(0, 240, 255, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="80" y1="10" x2="80" y2="150" stroke="rgba(0, 240, 255, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
              
              {/* Target Blip 1 */}
              <circle cx="115" cy="55" r="4" fill="#ef4444" className="cyber-beacon" />
              {/* Target Blip 2 */}
              <circle cx="45" cy="110" r="3" fill="#00ff88" className="cyber-beacon" />
              {/* Target Blip 3 */}
              <circle cx="95" cy="120" r="3" fill="#38bdf8" className="cyber-beacon" />
              
              {/* Rotating Radar Sweep Line */}
              <line
                x1="80"
                y1="80"
                x2="80"
                y2="10"
                stroke="#00f0ff"
                strokeWidth="2"
                style={{
                  transformOrigin: '80px 80px',
                  animation: 'radar-sweep 2.2s linear infinite'
                }}
              />
            </svg>
          </div>

          <div className="mono" style={{ fontSize: '0.72rem', color: '#00f0ff', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="cyber-beacon" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88' }} />
            <span>INTERCEPTOR ENCLAVE // LIVE SONAR SWEEP</span>
          </div>
        </div>

        {/* Live Terminal Log Stream */}
        <div
          className="mono"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            lineHeight: 1.5,
            minHeight: '200px',
            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.9)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '6px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 800, fontSize: '0.7rem' }}>
              &gt; CYBERGUARD EXECUTION LOG
            </span>
            <span style={{ color: '#00ff88', fontSize: '0.65rem' }}>STREAM ACTIVE</span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
            {terminalLogs.slice(0, activeLogIndex + 1).map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  color: idx === activeLogIndex ? '#00ff88' : idx > activeLogIndex - 3 ? '#38bdf8' : 'var(--text-muted)',
                  fontWeight: idx === activeLogIndex ? 700 : 400
                }}
              >
                {log}
              </motion.div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '6px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.68rem' }}>
            <span>ENTROPY: {entropySim} BITS</span>
            <span>ALGORAND TESTNET: NODELY 4160</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.08)', height: '8px', borderRadius: '4px', overflow: 'hidden', position: 'relative', marginBottom: '18px' }}>
        <motion.div
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #00f0ff 0%, #38bdf8 40%, #00ff88 100%)',
            boxShadow: '0 0 15px #00f0ff'
          }}
        />
      </div>

      {/* Progress Stage Tracker Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
        {steps.map((st, idx) => {
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;
          const IconComponent = st.icon;

          let cardBorder = 'rgba(255, 255, 255, 0.08)';
          let cardBg = 'var(--code-box-bg)';
          let iconColor = 'var(--text-muted)';
          let statusText = 'QUEUED';

          if (isDone) {
            cardBorder = 'rgba(0, 255, 136, 0.45)';
            cardBg = 'rgba(0, 255, 136, 0.08)';
            iconColor = '#00ff88';
            statusText = `DONE (${st.latency})`;
          } else if (isCurrent) {
            cardBorder = 'rgba(0, 240, 255, 0.7)';
            cardBg = 'rgba(0, 240, 255, 0.15)';
            iconColor = '#00f0ff';
            statusText = 'INSPECTION ACTIVE...';
          }

          return (
            <motion.div
              key={st.id}
              animate={{
                scale: isCurrent ? 1.02 : 1,
                borderColor: isCurrent ? '#00f0ff' : cardBorder
              }}
              transition={{ duration: 0.2 }}
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                boxShadow: isCurrent ? '0 0 18px rgba(0, 240, 255, 0.25)' : 'none'
              }}
            >
              <div style={{ marginTop: '2px', color: iconColor }}>
                {isCurrent ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : isDone ? (
                  <CheckCircle2 size={17} color="#00ff88" />
                ) : (
                  <IconComponent size={17} />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span className="mono" style={{ fontSize: '0.68rem', fontWeight: 800, color: iconColor, letterSpacing: '0.04em' }}>
                    PHASE 0{idx + 1}
                  </span>
                  <span className="mono" style={{ fontSize: '0.62rem', color: iconColor, fontWeight: 700 }}>
                    {statusText}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                  {st.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  {st.detail}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
