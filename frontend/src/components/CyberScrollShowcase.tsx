import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Lock, Terminal, Cpu, Eye, Zap, Database, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

type CharacterProps = {
  char: string;
  index: number;
  centerIndex: number;
  scrollYProgress: any;
  colorClass?: string;
};

const CharacterV1 = ({
  char,
  index,
  centerIndex,
  scrollYProgress,
  colorClass = 'text-orange-500',
}: CharacterProps) => {
  const isSpace = char === ' ';
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0]
  );
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0]
  );

  return (
    <motion.span
      className={cn(
        'inline-block font-black uppercase transition-colors',
        colorClass,
        isSpace && 'w-3 md:w-6'
      )}
      style={{
        x,
        rotateX,
        color: '#f97316', // Vibrant Orange from screenshot
        textShadow: '0 0 30px rgba(249, 115, 22, 0.45)',
      }}
    >
      {char}
    </motion.span>
  );
};

const CharacterV3 = ({
  icon,
  label,
  index,
  centerIndex,
  scrollYProgress,
}: {
  icon: React.ReactNode;
  label: string;
  index: number;
  centerIndex: number;
  scrollYProgress: any;
}) => {
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 90, 0]
  );
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 45, 0]
  );
  const y = useTransform(
    scrollYProgress,
    [0, 0.5],
    [-Math.abs(distanceFromCenter) * 25, 0]
  );
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.75, 1]);

  return (
    <motion.div
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-slate-900/80 backdrop-blur-md shadow-lg shadow-cyan-500/10 mx-2 my-1.5"
      style={{
        x,
        rotate,
        y,
        scale,
        transformOrigin: 'center',
      }}
    >
      <span className="text-cyan-400">{icon}</span>
      <span className="text-xs md:text-sm font-bold text-slate-100 uppercase tracking-wider">
        {label}
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
  });

  const { scrollYProgress: scroll2 } = useScroll({
    target: targetRef2,
  });

  const text = 'ZERO-DAY THREAT RADAR';
  const characters = text.split('');
  const centerIndex = Math.floor(characters.length / 2);

  const secStack = [
    { label: 'Playwright Sandbox', icon: <Terminal size={18} /> },
    { label: 'Random Forest ML', icon: <Cpu size={18} /> },
    { label: 'Authoritative RDAP', icon: <Globe size={18} /> },
    { label: 'Google DNS (DoH)', icon: <Database size={18} /> },
    { label: 'Visual pHash Vision', icon: <Eye size={18} /> },
    { label: 'Manifest V3 Shield', icon: <Zap size={18} /> },
    { label: 'Gemini AI Insights', icon: <Lock size={18} /> },
  ];
  const iconCenterIndex = Math.floor(secStack.length / 2);

  return (
    <div className="w-full relative select-none">
      {/* Indicator Prompt */}
      <div className="text-center pt-8 pb-4">
        <span className="inline-block text-xs uppercase font-extrabold tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/30 px-4 py-1.5 rounded-full">
          ↓ Scroll down to trigger 3D kinetic text distortion
        </span>
      </div>

      {/* Section 1: 3D Character Transform Animation (Exact Skiper31 implementation) */}
      <div
        ref={targetRef1}
        className="relative box-border flex h-[180vh] items-start justify-center overflow-hidden p-[2vw]"
      >
        <div
          className="sticky top-1/2 -translate-y-1/2 w-full max-w-6xl text-center text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tighter"
          style={{
            perspective: '500px',
          }}
        >
          {characters.map((char, index) => (
            <CharacterV1
              key={index}
              char={char}
              index={index}
              centerIndex={centerIndex}
              scrollYProgress={scroll1}
            />
          ))}
        </div>
      </div>

      {/* Section 2: Security Stack Convergence */}
      <div
        ref={targetRef2}
        className="relative -mt-[60vh] box-border flex h-[180vh] flex-col items-center justify-start overflow-hidden p-[2vw]"
      >
        <div className="sticky top-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full max-w-5xl text-center">
          <p className="flex items-center justify-center gap-3 text-lg md:text-2xl font-bold tracking-tight text-white mb-8">
            <Bracket className="h-10 md:h-12 text-orange-500" />
            <span className="font-bold tracking-wide uppercase text-slate-100">
              INTEGRATE WITH YOUR CYBER DEFENSE STACK
            </span>
            <Bracket className="h-10 md:h-12 scale-x-[-1] text-orange-500" />
          </p>

          <div
            className="w-full flex flex-wrap justify-center items-center max-w-4xl"
            style={{
              perspective: '500px',
            }}
          >
            {secStack.map((item, index) => (
              <CharacterV3
                key={index}
                icon={item.icon}
                label={item.label}
                index={index}
                centerIndex={iconCenterIndex}
                scrollYProgress={scroll2}
              />
            ))}
          </div>

          <div className="mt-10">
            <button
              onClick={onLaunchScanner}
              style={{
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 32px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 0 30px rgba(234, 88, 12, 0.5)',
                transition: 'all 0.2s',
              }}
            >
              <Shield size={18} />
              <span>Launch Live Security Scanner</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Bracket = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 27 78"
      className={className}
      style={{ display: 'inline-block' }}
    >
      <path
        fill="currentColor"
        d="M26.52 77.21h-5.75c-6.83 0-12.38-5.56-12.38-12.38V48.38C8.39 43.76 4.63 40 .01 40v-4c4.62 0 8.38-3.76 8.38-8.38V12.4C8.38 5.56 13.94 0 20.77 0h5.75v4h-5.75c-4.62 0-8.38 3.76-8.38 8.38V27.6c0 4.34-2.25 8.17-5.64 10.38 3.39 2.21 5.64 6.04 5.64 10.38v16.45c0 4.62 3.76 8.38 8.38 8.38h5.75v4.02Z"
      />
    </svg>
  );
};
