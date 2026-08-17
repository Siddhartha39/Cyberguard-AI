import React, { useEffect, useRef, useState } from 'react';

interface MatrixBackgroundProps {
  theme?: 'green' | 'cyan' | 'mixed';
  opacity?: number;
  themeMode?: 'dark' | 'light';
}

export const MatrixBackground: React.FC<MatrixBackgroundProps> = ({
  theme = 'mixed',
  opacity = 0.28,
  themeMode = 'dark'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTheme, setActiveTheme] = useState<'green' | 'cyan' | 'mixed'>(theme);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Characters: Binary, Hex, Cyber symbols, Katakana-like cyber runes
    const characters = '0101010101010101ABCDEF0123456789<>/{}[];:~!@#$%&*+-=λπΨΩ';
    const charArray = characters.split('');

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];

    // Initialize drops with random offsets
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -100);
    }

    let lastTime = 0;
    const fpsInterval = 1000 / 30; // 30 FPS for buttery smooth retro-terminal feel

    const render = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(render);

      if (!isRunning) return;

      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = currentTime - (elapsed % fpsInterval);

      // Semi-transparent fade layer to create cascading trails
      ctx.fillStyle = themeMode === 'light' ? 'rgba(248, 250, 252, 0.18)' : 'rgba(11, 15, 23, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (themeMode === 'light') {
          // Soft slate / cyan digital drops in light mode
          ctx.fillStyle = i % 2 === 0 ? 'rgba(2, 132, 199, 0.45)' : 'rgba(100, 116, 139, 0.35)';
        } else {
          // Dark Cyber Matrix
          if (activeTheme === 'green') {
            if (Math.random() > 0.85) {
              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = '#00ff66';
              ctx.shadowBlur = 8;
            } else {
              ctx.fillStyle = '#00ff66';
              ctx.shadowColor = '#00ff66';
              ctx.shadowBlur = 4;
            }
          } else if (activeTheme === 'cyan') {
            if (Math.random() > 0.85) {
              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = '#00f0ff';
              ctx.shadowBlur = 8;
            } else {
              ctx.fillStyle = '#00f0ff';
              ctx.shadowColor = '#00f0ff';
              ctx.shadowBlur = 4;
            }
          } else {
            if (Math.random() > 0.9) {
              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = '#38bdf8';
              ctx.shadowBlur = 8;
            } else if (i % 3 === 0) {
              ctx.fillStyle = '#00ff88';
              ctx.shadowColor = '#00ff88';
              ctx.shadowBlur = 4;
            } else if (i % 3 === 1) {
              ctx.fillStyle = '#00e5ff';
              ctx.shadowColor = '#00e5ff';
              ctx.shadowBlur = 4;
            } else {
              ctx.fillStyle = '#3b82f6';
              ctx.shadowColor = '#3b82f6';
              ctx.shadowBlur = 3;
            }
          }
        }

        ctx.fillText(text, x, y);
        ctx.shadowBlur = 0; // Reset shadow

        // Reset drop to top once it falls past screen bottom
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeTheme, isRunning, themeMode]);

  return (
    <>
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: themeMode === 'light' ? 0.16 : opacity
        }}
      />

      {/* Cyber Scanline Scan Overlay (Dark theme only) */}
      <div className="cyber-scanlines" />

      {/* Subtle Hacker HUD Floating Switcher in bottom right */}
      {themeMode === 'dark' && (
        <div style={{
          position: 'fixed',
          bottom: '16px',
          right: '20px',
          zIndex: 999,
          background: 'rgba(11, 15, 23, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '20px',
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.68rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.6)'
        }}>
          <span className="mono" style={{ color: '#9ca3af', fontWeight: 600 }}>MATRIX:</span>
          <button
            onClick={() => setActiveTheme('mixed')}
            style={{
              background: activeTheme === 'mixed' ? '#0284c7' : 'transparent',
              color: activeTheme === 'mixed' ? '#ffffff' : '#38bdf8',
              border: 'none',
              borderRadius: '12px',
              padding: '2px 8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.68rem'
            }}
          >
            CYAN
          </button>
          <button
            onClick={() => setActiveTheme('green')}
            style={{
              background: activeTheme === 'green' ? '#10b981' : 'transparent',
              color: activeTheme === 'green' ? '#ffffff' : '#34d399',
              border: 'none',
              borderRadius: '12px',
              padding: '2px 8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.68rem'
            }}
          >
            GREEN
          </button>
          <button
            onClick={() => setIsRunning(!isRunning)}
            style={{
              background: isRunning ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: isRunning ? '#f87171' : '#34d399',
              border: '1px solid rgba(75, 85, 99, 0.4)',
              borderRadius: '12px',
              padding: '2px 8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.68rem'
            }}
          >
            {isRunning ? 'PAUSE' : 'PLAY'}
          </button>
        </div>
      )}
    </>
  );
};
