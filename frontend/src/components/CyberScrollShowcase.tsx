import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { Shield, Lock, Terminal, Cpu, Eye, Zap, Database, Cloud, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

type CharacterProps = {
  char: string;
  index: number;
  centerIndex: number;
  scrollYProgress: MotionValue<number>;
};

const CharacterV1: React.FC<CharacterProps> = ({
  char,
  index,
  centerIndex,
  scrollYProgress,
}) => {
  const isSpace = char === ' ';
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(
    scrollYProgress,
    [0, 0.6],
    [distanceFromCenter * 45, 0]
  );
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.6],
    [distanceFromCenter * 35, 0]
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.6],
    [0.3, 0.8, 1]
  );

  return (
    <motion.span
      className={cn(
        'inline-block font-black tracking-tight',
        isSpace && 'w-3 md:w-5'
      )}
      style={{
        x,
        rotateX,
        opacity,
        color: index % 2 === 0 ? 'var(--accent-cyan)' : 'var(--text-primary)',
        textShadow: index % 2 === 0 ? '0 0 25px rgba(0, 240, 255, 0.5)' : 'none',
      }}
    >
      {char}
    </motion.span>
  );
};

interface TechBadgeProps {
  icon: React.ReactNode;
  name: string;
  index: number;
  centerIndex: number;
  scrollYProgress: MotionValue<number>;
}

const TechBadge: React.FC<TechBadgeProps> = ({
  icon,
  name,
  index,
  centerIndex,
  scrollYProgress,
}) => {
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(
    scrollYProgress,
    [0, 0.65],
    [distanceFromCenter * 70, 0]
  );
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.65],
    [distanceFromCenter * 25, 0]
  );
  const y = useTransform(
    scrollYProgress,
    [0, 0.65],
    [Math.abs(distanceFromCenter) * 30, 0]
  );
  const scale = useTransform(scrollYProgress, [0, 0.65], [0.75, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.65], [0.2, 0.7, 1]);

  return (
    <motion.div
      className="glass-panel"
      style={{
        x,
        y,
        rotate,
        scale,
        opacity,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 18px',
        borderRadius: '14px',
        border: '1px solid var(--border-focus)',
        background: 'var(--bg-card)',
        boxShadow: 'var(--panel-shadow)',
        margin: '6px',
        userSelect: 'none',
      }}
    >
      <span style={{ color: 'var(--accent-cyan)' }}>{icon}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        {name}
      </span>
    </motion.div>
  );
};

export const CyberScrollShowcase: React.FC<{ onLaunchScanner: () => void }> = ({
  onLaunchScanner,
}) => {
  const targetRef1 = useRef<HTMLDivElement | null>(null);
  const targetRef2 = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress: scroll1 } = useScroll({
    target: targetRef1,
    offset: ['start end', 'end start'],
  });

  const { scrollYProgress: scroll2 } = useScroll({
    target: targetRef2,
    offset: ['start end', 'end start'],
  });

  const text1 = 'ZERO-DAY THREAT RADAR';
  const characters1 = text1.split('');
  const centerIndex1 = Math.floor(characters1.length / 2);

  const techStack = [
    { name: 'Playwright Sandbox', icon: <Terminal size={16} /> },
    { name: 'Random Forest ML', icon: <Cpu size={16} /> },
    { name: 'Authoritative RDAP', icon: <Globe size={16} /> },
    { name: 'Google DNS (DoH)', icon: <Database size={16} /> },
    { name: 'Visual pHash Vision', icon: <Eye size={16} /> },
    { name: 'Manifest V3 Extension', icon: <Zap size={16} /> },
    { name: 'Gemini AI Insights', icon: <Lock size={16} /> },
  ];
  const centerIndexTech = Math.floor(techStack.length / 2);

  return (
    <section style={{ width: '100%', overflow: 'hidden', padding: '40px 0' }}>
      {/* 3D Character Explosion Section */}
      <div
        ref={targetRef1}
        style={{
          position: 'relative',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          perspective: '1000px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.15em',
              color: 'var(--accent-cyan)',
              textTransform: 'uppercase',
              background: 'rgba(6, 182, 212, 0.15)',
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid var(--border-focus)',
            }}
          >
            ✦ SCROLL TO EXPERIENCE 3D THREAT TELEMETRY
          </span>
        </div>

        <div
          style={{
            textAlign: 'center',
            fontSize: 'clamp(2rem, 5.5vw, 4.5rem)',
            lineHeight: 1.15,
            perspective: '600px',
          }}
        >
          {characters1.map((char, index) => (
            <CharacterV1
              key={index}
              char={char}
              index={index}
              centerIndex={centerIndex1}
              scrollYProgress={scroll1}
            />
          ))}
        </div>

        <p
          style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            maxWidth: '580px',
            textAlign: 'center',
            marginTop: '16px',
            lineHeight: 1.6,
          }}
        >
          Multi-modal intelligence pipeline analyzing unknown links across 24 lexical features, visual brand hashes, and live registrar telemetry in under 15ms.
        </p>
      </div>

      {/* Tech Stack Convergence Section */}
      <div
        ref={targetRef2}
        style={{
          position: 'relative',
          minHeight: '65vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Bracket />
          <h3
            style={{
              fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Integrated Threat Defense Matrix
          </h3>
          <Bracket flip />
        </div>

        <div
          style={{
            maxWidth: '900px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            perspective: '700px',
            padding: '10px',
          }}
        >
          {techStack.map((item, index) => (
            <TechBadge
              key={index}
              name={item.name}
              icon={item.icon}
              index={index}
              centerIndex={centerIndexTech}
              scrollYProgress={scroll2}
            />
          ))}
        </div>

        <div style={{ marginTop: '28px' }}>
          <button
            onClick={onLaunchScanner}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 32px',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 0 25px rgba(2, 132, 199, 0.5)',
              transition: 'all 0.2s',
            }}
          >
            <Shield size={18} />
            <span>Launch Live Security Scanner</span>
          </button>
        </div>
      </div>
    </section>
  );
};

const Bracket = ({ flip = false }: { flip?: boolean }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 27 78"
      style={{
        height: '32px',
        transform: flip ? 'scaleX(-1)' : 'none',
        color: 'var(--accent-cyan)',
      }}
    >
      <path
        fill="currentColor"
        d="M26.52 77.21h-5.75c-6.83 0-12.38-5.56-12.38-12.38V48.38C8.39 43.76 4.63 40 .01 40v-4c4.62 0 8.38-3.76 8.38-8.38V12.4C8.38 5.56 13.94 0 20.77 0h5.75v4h-5.75c-4.62 0-8.38 3.76-8.38 8.38V27.6c0 4.34-2.25 8.17-5.64 10.38 3.39 2.21 5.64 6.04 5.64 10.38v16.45c0 4.62 3.76 8.38 8.38 8.38h5.75v4.02Z"
      />
    </svg>
  );
};
