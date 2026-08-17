import React, { useEffect, useState } from 'react';
import { Terminal, Shield, Cpu, Lock, Radar, Activity, Sparkles, Eye, Zap } from 'lucide-react';

interface HackerScanTerminalProps {
  targetUrl: string;
}

export const HackerScanTerminal: React.FC<HackerScanTerminalProps> = ({ targetUrl }) => {
  const [logIndex, setLogIndex] = useState(0);
  const [hexDump, setHexDump] = useState<string[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);

  const scanStages = [
    { text: `[>>] TARGET ACQUIRED: ${targetUrl || 'TARGET DOMAIN'}`, icon: <Radar size={15} color="#00f0ff" /> },
    { text: `[0x01] DNS INGRESS: Resolving NS, A/AAAA, MX, and TXT DNS records...`, icon: <Terminal size={15} color="#38bdf8" /> },
    { text: `[0x02] RDAP WHOIS: Connecting live port 43 socket & calculating domain age...`, icon: <Activity size={15} color="#00ff88" /> },
    { text: `[0x03] SSRF SHIELD: Verifying private IP & loopback isolation guards...`, icon: <Lock size={15} color="#f59e0b" /> },
    { text: `[0x04] HEADLESS PLAYWRIGHT: Chromium sandbox rendering DOM & form hooks...`, icon: <Eye size={15} color="#c084fc" /> },
    { text: `[0x05] PERCEPTUAL PHASH: Computing 64-bit logo image hashes vs brand catalog...`, icon: <Shield size={15} color="#00f0ff" /> },
    { text: `[0x06] DEFENSE HEADERS: Auditing X-Frame-Options, HSTS, CSP & SPF/DMARC...`, icon: <Zap size={15} color="#f97316" /> },
    { text: `[0x07] GEMINI AI: Invoking neural threat explainer & exploitability audit...`, icon: <Sparkles size={15} color="#a855f7" /> },
    { text: `[0x08] FUSION ENGINE: Calibrating 0–100 risk score & assembling attack chain...`, icon: <Cpu size={15} color="#00ff88" /> }
  ];

  // Timer & stage progression
  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedMs(elapsed);

      // Advance through stages every 350ms
      const currentStage = Math.min(scanStages.length - 1, Math.floor(elapsed / 350));
      setLogIndex(currentStage);

      // Generate random hex dumps
      const randomHexes = Array.from({ length: 4 }, () =>
        '0x' + Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0') +
        ' ' + Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0')
      );
      setHexDump(randomHexes);
    }, 60);

    return () => clearInterval(timer);
  }, [targetUrl]);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        margin: '0 24px 20px 24px',
        background: 'radial-gradient(circle at 50% 0%, rgba(0, 240, 255, 0.12) 0%, rgba(13, 19, 31, 0.98) 75%)',
        border: '1px solid #00f0ff',
        boxShadow: '0 0 35px rgba(0, 240, 255, 0.35), inset 0 0 20px rgba(0, 240, 255, 0.1)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Scan HUD Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'rgba(0, 240, 255, 0.15)',
            border: '1px solid #00f0ff',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px #00f0ff'
          }}>
            <Radar size={20} color="#00f0ff" className="radar-spinner" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="cyber-font neon-cyan-glow" style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.04em' }}>
                HACKER TELEMETRY // ACTIVE INFILTRATION SCAN
              </h3>
              <span className="badge-critical mono" style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                AUDIT IN PROGRESS
              </span>
            </div>
            <p className="mono" style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
              TARGET: <span style={{ color: '#00ff88', fontWeight: 700 }}>{targetUrl || 'INSPECTING TARGET'}</span>
            </p>
          </div>
        </div>

        {/* Real-Time Telemetry Stats */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(0, 0, 0, 0.6)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px 12px', fontSize: '0.72rem' }} className="mono">
            <span style={{ color: '#9ca3af' }}>EXECUTION: </span>
            <span style={{ color: '#00f0ff', fontWeight: 700 }}>{(elapsedMs / 1000).toFixed(1)}s</span>
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.6)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px 12px', fontSize: '0.72rem' }} className="mono">
            <span style={{ color: '#9ca3af' }}>STAGE: </span>
            <span style={{ color: '#00ff88', fontWeight: 700 }}>{logIndex + 1}/9</span>
          </div>
        </div>
      </div>

      {/* Main Terminal Window & Live Hex Streams */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '16px' }}>
        {/* Terminal Log Console */}
        <div
          className="mono"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '10px',
            padding: '16px',
            minHeight: '210px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: '8px',
            fontSize: '0.8rem',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.9)'
          }}
        >
          {scanStages.slice(0, logIndex + 1).map((stage, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: idx === logIndex ? '#00ff88' : '#38bdf8',
                fontWeight: idx === logIndex ? 800 : 500,
                textShadow: idx === logIndex ? '0 0 10px rgba(0, 255, 136, 0.6)' : 'none'
              }}
            >
              {stage.icon}
              <span>{stage.text}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00f0ff', marginTop: '4px' }}>
            <span style={{ width: '8px', height: '14px', background: '#00f0ff', display: 'inline-block', animation: 'blink 0.8s infinite' }} />
          </div>
        </div>

        {/* Live Decrypting Hex Stream Sidebar */}
        <div
          className="mono"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: '10px',
            padding: '14px',
            fontSize: '0.72rem',
            color: '#34d399',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.9)'
          }}
        >
          <div>
            <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.68rem', marginBottom: '8px', borderBottom: '1px solid rgba(75, 85, 99, 0.4)', paddingBottom: '4px' }}>
              MEMORY TELEMETRY DUMP
            </div>
            {hexDump.map((hex, i) => (
              <div key={i} style={{ color: i === 0 ? '#ffffff' : 'rgba(0, 255, 136, 0.7)', lineHeight: 1.6 }}>
                {hex}
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(75, 85, 99, 0.4)', paddingTop: '6px', fontSize: '0.65rem', color: '#9ca3af' }}>
            STATUS: <span style={{ color: '#00ff88', fontWeight: 700 }}>NEURAL REASONING</span>
          </div>
        </div>
      </div>
    </div>
  );
};
