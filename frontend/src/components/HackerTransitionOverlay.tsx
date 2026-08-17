import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Shield, Cpu, Lock, Sparkles, Activity, Eye, Zap } from 'lucide-react';

interface HackerTransitionOverlayProps {
  onComplete: () => void;
}

export const HackerTransitionOverlay: React.FC<HackerTransitionOverlayProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [hexCode, setHexCode] = useState('0x7F...INIT');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const logs = [
    { text: '[>] BOOTING CYBERGUARD CORE V2.0 KERNEL...', icon: <Cpu size={14} color="#00f0ff" /> },
    { text: '[+] INITIALIZING SECURE NEURAL SANDBOX ENCLAVE...', icon: <Lock size={14} color="#38bdf8" /> },
    { text: '[+] ESTABLISHING REAL-TIME RDAP / WHOIS PROTOCOL...', icon: <Terminal size={14} color="#00ff88" /> },
    { text: '[+] CALIBRATING 24-DIMENSIONAL LEXICAL ML CLASSIFIER...', icon: <Activity size={14} color="#3b82f6" /> },
    { text: '[+] ARMING PLAYWRIGHT ISOLATED BROWSER (ANTI-SSRF GUARD)...`', icon: <Eye size={14} color="#f59e0b" /> },
    { text: '[+] LOADING PERCEPTUAL PHASH BRAND VISION CATALOG...', icon: <Shield size={14} color="#c084fc" /> },
    { text: '[+] SYNCING GOOGLE GEMINI AI EXPLOIT ENGINE...', icon: <Sparkles size={14} color="#00f0ff" /> },
    { text: '[+] CHECKING CLICKJACKING & DMARC SPOOFING AUDITORS...', icon: <Zap size={14} color="#f97316" /> },
    { text: '[✓] ZERO-TRUST ENCLAVE ARMED // ACCESS GRANTED', icon: <Shield size={14} color="#00ff88" /> }
  ];

  // Matrix Rain Canvas Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = '01010101ABCDEF0123456789<>/{}[];:~!@#$%&*+-=λπΨΩ';
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array.from({ length: columns }, () => Math.floor(Math.random() * -60));

    let animId: number;
    const render = () => {
      ctx.fillStyle = 'rgba(7, 10, 16, 0.14)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillStyle = Math.random() > 0.82 ? '#ffffff' : i % 2 === 0 ? '#00f0ff' : '#00ff88';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        ctx.fillText(text, x, y);
        ctx.shadowBlur = 0;

        if (y > canvas.height && Math.random() > 0.965) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Progress, Hex Generator, and Log timer
  useEffect(() => {
    const duration = 3200; // Increased to 3.2s for rich, immersive cinematic hacker transition
    const interval = 25;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentPct = Math.min(100, Math.round((currentStep / steps) * 100));
      setProgress(currentPct);

      // Random hex address animation
      const randomHex = '0x' + Math.floor(Math.random() * 0xFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
      setHexCode(randomHex);

      const targetLog = Math.min(logs.length - 1, Math.floor((currentPct / 100) * logs.length));
      setLogIndex(targetLog);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          onComplete();
        }, 200);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#070a10',
        zIndex: 9999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Matrix Canvas Layer */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.88
        }}
      />

      {/* CRT Scanline Overlay */}
      <div className="cyber-scanlines" style={{ opacity: 0.75 }} />

      {/* Central Cyber Command Terminal Hub */}
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '90%',
          maxWidth: '720px',
          padding: '38px 36px',
          background: 'radial-gradient(circle at 50% 0%, rgba(0, 240, 255, 0.25) 0%, rgba(13, 19, 31, 0.98) 80%)',
          border: '1px solid #00f0ff',
          boxShadow: '0 0 60px rgba(0, 240, 255, 0.5), inset 0 0 35px rgba(0, 240, 255, 0.18)',
          borderRadius: '18px',
          textAlign: 'center'
        }}
      >
        {/* Terminal Header */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(0, 240, 255, 0.15)', border: '1px solid rgba(0, 240, 255, 0.6)', padding: '6px 20px', borderRadius: '24px', marginBottom: '20px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 10px #00ff88' }} />
          <span className="mono cyber-font" style={{ fontSize: '0.88rem', color: '#00f0ff', fontWeight: 900, letterSpacing: '0.1em' }}>
            CYBERGUARD // LAUNCHING LIVE SCANNER
          </span>
        </div>

        <h2 className="cyber-font neon-cyan-glow" style={{ fontSize: '1.85rem', fontWeight: 900, letterSpacing: '0.04em', marginBottom: '8px', lineHeight: 1.2 }}>
          CONNECTING TO THREAT INTELLIGENCE CORE
        </h2>

        <div className="mono" style={{ fontSize: '0.78rem', color: '#38bdf8', marginBottom: '20px' }}>
          MEMORY OFFSET: <span style={{ color: '#00ff88', fontWeight: 700 }}>{hexCode}</span> // ISOLATION: <span style={{ color: '#00f0ff', fontWeight: 700 }}>ENFORCED</span>
        </div>

        {/* Dynamic Log Stream */}
        <div
          className="mono"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.45)',
            borderRadius: '10px',
            padding: '18px 20px',
            minHeight: '160px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: '8px',
            textAlign: 'left',
            fontSize: '0.82rem',
            marginBottom: '24px',
            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.95)'
          }}
        >
          {logs.slice(0, logIndex + 1).map((log, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: idx === logIndex ? '#00ff88' : '#38bdf8' }}>
              {log.icon}
              <span style={{ fontWeight: idx === logIndex ? 800 : 500 }}>{log.text}</span>
            </div>
          ))}
        </div>

        {/* Glowing Progress Bar */}
        <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.12)', height: '12px', borderRadius: '6px', overflow: 'hidden', position: 'relative', marginBottom: '12px' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00f0ff 0%, #0284c7 50%, #00ff88 100%)',
              boxShadow: '0 0 20px #00f0ff',
              transition: 'width 0.05s linear'
            }}
          />
        </div>

        {/* Progress Telemetry */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#9ca3af' }} className="mono">
          <span>INITIALIZING SANDBOX ENCLAVE</span>
          <span style={{ color: '#00f0ff', fontWeight: 900 }}>{progress}% COMPLETE</span>
        </div>
      </div>
    </div>
  );
};
