import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Shield, Cpu, Lock, Sparkles } from 'lucide-react';

interface HackerTransitionOverlayProps {
  onComplete: () => void;
}

export const HackerTransitionOverlay: React.FC<HackerTransitionOverlayProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const logs = [
    { text: '[>] INITIALIZING SECURE NEURAL SANDBOX...', icon: <Cpu size={14} color="#00f0ff" /> },
    { text: '[+] CONNECTING REAL-TIME RDAP & WHOIS RESOLVERS...', icon: <Terminal size={14} color="#38bdf8" /> },
    { text: '[+] ARMING PLAYWRIGHT ISOLATED BROWSER CRAWLER...', icon: <Lock size={14} color="#00ff88" /> },
    { text: '[+] LOADING PERCEPTUAL PHASH BRAND CATALOGS...', icon: <Shield size={14} color="#f59e0b" /> },
    { text: '[+] SYNCING GEMINI AI EXPLOIT ENGINE...', icon: <Sparkles size={14} color="#c084fc" /> },
    { text: '[✓] ACCESS GRANTED // SOC LIVE SCANNER READY', icon: <Shield size={14} color="#00ff88" /> }
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
    const drops: number[] = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));

    let animId: number;
    const render = () => {
      ctx.fillStyle = 'rgba(7, 10, 16, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillStyle = Math.random() > 0.85 ? '#ffffff' : i % 2 === 0 ? '#00f0ff' : '#00ff88';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        ctx.fillText(text, x, y);
        ctx.shadowBlur = 0;

        if (y > canvas.height && Math.random() > 0.96) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Progress and Log timer
  useEffect(() => {
    const duration = 1600; // 1.6s high-speed cyber ingress
    const interval = 25;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentPct = Math.min(100, Math.round((currentStep / steps) * 100));
      setProgress(currentPct);

      const targetLog = Math.min(logs.length - 1, Math.floor((currentPct / 100) * logs.length));
      setLogIndex(targetLog);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          onComplete();
        }, 150);
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
          opacity: 0.85
        }}
      />

      {/* CRT Scanline Overlay */}
      <div className="cyber-scanlines" style={{ opacity: 0.7 }} />

      {/* Central Cyber Command Terminal Hub */}
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '90%',
          maxWidth: '680px',
          padding: '36px 32px',
          background: 'radial-gradient(circle at 50% 0%, rgba(0, 240, 255, 0.22) 0%, rgba(13, 19, 31, 0.98) 80%)',
          border: '1px solid #00f0ff',
          boxShadow: '0 0 50px rgba(0, 240, 255, 0.5), inset 0 0 30px rgba(0, 240, 255, 0.15)',
          borderRadius: '16px',
          textAlign: 'center'
        }}
      >
        {/* Terminal Header */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 240, 255, 0.15)', border: '1px solid rgba(0, 240, 255, 0.6)', padding: '6px 18px', borderRadius: '20px', marginBottom: '20px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 10px #00ff88' }} />
          <span className="mono cyber-font" style={{ fontSize: '0.85rem', color: '#00f0ff', fontWeight: 900, letterSpacing: '0.1em' }}>
            CYBERGUARD // LAUNCHING LIVE SCANNER
          </span>
        </div>

        <h2 className="cyber-font neon-cyan-glow" style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '0.04em', marginBottom: '20px', lineHeight: 1.2 }}>
          CONNECTING TO THREAT INTELLIGENCE CORE
        </h2>

        {/* Dynamic Log Stream */}
        <div
          className="mono"
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '8px',
            padding: '16px',
            minHeight: '130px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: '8px',
            textAlign: 'left',
            fontSize: '0.82rem',
            marginBottom: '24px',
            boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.9)'
          }}
        >
          {logs.slice(0, logIndex + 1).map((log, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: idx === logIndex ? '#00ff88' : '#38bdf8' }}>
              {log.icon}
              <span style={{ fontWeight: idx === logIndex ? 700 : 500 }}>{log.text}</span>
            </div>
          ))}
        </div>

        {/* Glowing Progress Bar */}
        <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.1)', height: '10px', borderRadius: '5px', overflow: 'hidden', position: 'relative', marginBottom: '12px' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00f0ff 0%, #00ff88 100%)',
              boxShadow: '0 0 16px #00f0ff',
              transition: 'width 0.05s linear'
            }}
          />
        </div>

        {/* Progress Telemetry */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#9ca3af' }} className="mono">
          <span>INITIALIZING SANDBOX ENCLAVE</span>
          <span style={{ color: '#00f0ff', fontWeight: 800 }}>{progress}% COMPLETE</span>
        </div>
      </div>
    </div>
  );
};
