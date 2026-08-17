import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "../lib/utils";

type CharacterProps = {
  char: string;
  index: number;
  centerIndex: number;
  scrollYProgress: any;
};

export const CharacterV1 = ({
  char,
  index,
  centerIndex,
  scrollYProgress,
}: CharacterProps) => {
  const isSpace = char === " ";
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0],
  );
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0],
  );

  return (
    <motion.span
      className={cn("inline-block", isSpace ? "w-4" : "")}
      style={{
        x,
        rotateX,
        color: "#00f0ff",
        textShadow: "0 0 16px rgba(0, 240, 255, 0.8)"
      }}
    >
      {char}
    </motion.span>
  );
};

export const CharacterV2 = ({
  char,
  index,
  centerIndex,
  scrollYProgress,
}: CharacterProps) => {
  const isSpace = char === " ";
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0],
  );
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.75, 1]);

  const y = useTransform(
    scrollYProgress,
    [0, 0.5],
    [Math.abs(distanceFromCenter) * 50, 0],
  );

  return (
    <motion.div
      className={cn("inline-flex items-center justify-center p-3 rounded-xl mx-2 glass-panel", isSpace && "w-4")}
      style={{
        x,
        scale,
        y,
        transformOrigin: "center",
        border: "1px solid rgba(0, 255, 136, 0.4)",
        boxShadow: "0 0 20px rgba(0, 255, 136, 0.2)"
      }}
    >
      <span className="mono font-bold text-sm" style={{ color: "#00ff88" }}>{char}</span>
    </motion.div>
  );
};

export const CharacterV3 = ({
  char,
  index,
  centerIndex,
  scrollYProgress,
}: CharacterProps) => {
  const isSpace = char === " ";
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 90, 0],
  );
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0],
  );

  const y = useTransform(
    scrollYProgress,
    [0, 0.5],
    [-Math.abs(distanceFromCenter) * 20, 0],
  );
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.75, 1]);

  return (
    <motion.div
      className={cn("inline-flex items-center justify-center p-3 rounded-xl mx-2 glass-panel", isSpace && "w-4")}
      style={{
        x,
        rotate,
        y,
        scale,
        transformOrigin: "center",
        border: "1px solid rgba(192, 132, 252, 0.4)",
        boxShadow: "0 0 20px rgba(192, 132, 252, 0.2)"
      }}
    >
      <span className="mono font-bold text-sm" style={{ color: "#c084fc" }}>{char}</span>
    </motion.div>
  );
};

export const Bracket = ({ className, color = "#00f0ff" }: { className?: string; color?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 27 78"
      style={{ height: '36px', width: 'auto', display: 'inline-block' }}
      className={className}
    >
      <path
        fill={color}
        d="M26.52 77.21h-5.75c-6.83 0-12.38-5.56-12.38-12.38V48.38C8.39 43.76 4.63 40 .01 40v-4c4.62 0 8.38-3.76 8.38-8.38V12.4C8.38 5.56 13.94 0 20.77 0h5.75v4h-5.75c-4.62 0-8.38 3.76-8.38 8.38V27.6c0 4.34-2.25 8.17-5.64 10.38 3.39 2.21 5.64 6.04 5.64 10.38v16.45c0 4.62 3.76 8.38 8.38 8.38h5.75v4.02Z"
      />
    </svg>
  );
};

export const CyberScrollText = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const targetRef2 = useRef<HTMLDivElement | null>(null);
  const targetRef3 = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });
  const { scrollYProgress: scrollYProgress2 } = useScroll({
    target: targetRef2,
    offset: ["start end", "end start"]
  });
  const { scrollYProgress: scrollYProgress3 } = useScroll({
    target: targetRef3,
    offset: ["start end", "end start"]
  });

  const text = "ZERO TRUST PHISHING FORENSICS";
  const characters = text.split("");
  const centerIndex = Math.floor(characters.length / 2);

  const cyberTechStack = [
    "RandomForest ML",
    "Playwright Sandbox",
    "pHash Visuals",
    "RDAP Registry",
    "SPF & DMARC",
    "HSTS & CSP",
    "Gemini AI",
    "Chrome Shield",
  ];
  const iconCenterIndex = Math.floor(cyberTechStack.length / 2);

  return (
    <div className="w-full relative my-10">
      {/* 1. CharacterV1 Scroll Section */}
      <div
        ref={targetRef}
        className="relative box-border flex min-h-[140vh] items-center justify-center gap-[2vw] overflow-hidden glass-panel p-8 mb-12"
        style={{
          background: "radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, rgba(13, 19, 31, 0.96) 80%)",
          border: "1px solid rgba(0, 240, 255, 0.4)"
        }}
      >
        <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center">
          <span className="mono text-xs uppercase tracking-widest text-cyan-400 opacity-70">
            Scroll to decrypt telemetry
          </span>
        </div>

        <div
          className="cyber-font w-full max-w-5xl text-center font-bold uppercase tracking-tight"
          style={{
            perspective: "500px",
            fontSize: "clamp(1.5rem, 4.5vw, 3rem)",
            lineHeight: 1.3
          }}
        >
          {characters.map((char, index) => (
            <CharacterV1
              key={index}
              char={char}
              index={index}
              centerIndex={centerIndex}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>

      {/* 2. CharacterV2 Section */}
      <div
        ref={targetRef2}
        className="relative box-border flex min-h-[140vh] flex-col items-center justify-center gap-[2vw] overflow-hidden glass-panel p-8 mb-12"
        style={{
          background: "radial-gradient(circle, rgba(0, 255, 136, 0.08) 0%, rgba(13, 19, 31, 0.96) 80%)",
          border: "1px solid rgba(0, 255, 136, 0.4)"
        }}
      >
        <p className="cyber-font flex items-center justify-center gap-3 text-lg md:text-xl font-bold tracking-tight text-white mb-6">
          <Bracket color="#00ff88" />
          <span className="text-emerald-400">
            INTEGRATED CYBER DEFENSE STACK
          </span>
          <Bracket className="scale-x-[-1]" color="#00ff88" />
        </p>
        <div className="flex flex-wrap items-center justify-center max-w-5xl">
          {cyberTechStack.map((tech, index) => (
            <CharacterV2
              key={index}
              char={tech}
              index={index}
              centerIndex={iconCenterIndex}
              scrollYProgress={scrollYProgress2}
            />
          ))}
        </div>
      </div>

      {/* 3. CharacterV3 Section */}
      <div
        ref={targetRef3}
        className="relative box-border flex min-h-[140vh] flex-col items-center justify-center gap-[2vw] overflow-hidden glass-panel p-8 mb-12"
        style={{
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, rgba(13, 19, 31, 0.96) 80%)",
          border: "1px solid rgba(168, 85, 247, 0.4)"
        }}
      >
        <p className="cyber-font flex items-center justify-center gap-3 text-lg md:text-xl font-bold tracking-tight text-white mb-6">
          <Bracket color="#c084fc" />
          <span className="text-purple-400">
            AUTONOMOUS THREAT INTELLIGENCE
          </span>
          <Bracket className="scale-x-[-1]" color="#c084fc" />
        </p>
        <div
          className="flex flex-wrap items-center justify-center max-w-5xl"
          style={{
            perspective: "500px",
          }}
        >
          {cyberTechStack.map((tech, index) => (
            <CharacterV3
              key={index}
              char={tech}
              index={index}
              centerIndex={iconCenterIndex}
              scrollYProgress={scrollYProgress3}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
