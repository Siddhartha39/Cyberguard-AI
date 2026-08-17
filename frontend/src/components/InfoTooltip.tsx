import React, { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';

interface InfoTooltipProps {
  title: string;
  description: string;
  securityImpact?: string;
  goodVsBad?: string;
  position?: 'top' | 'bottom' | 'right' | 'left';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  description,
  securityImpact,
  goodVsBad,
  position = 'top'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getPositionStyle = (): React.CSSProperties => {
    switch (position) {
      case 'bottom':
        return {
          top: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)'
        };
      case 'right':
        return {
          top: '50%',
          left: 'calc(100% + 10px)',
          transform: 'translateY(-50%)'
        };
      case 'left':
        return {
          top: '50%',
          right: 'calc(100% + 10px)',
          transform: 'translateY(-50%)'
        };
      case 'top':
      default:
        return {
          bottom: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)'
        };
    }
  };

  return (
    <div
      ref={tooltipRef}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        zIndex: isOpen ? 999999 : 'auto'
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        onMouseEnter={() => setIsOpen(true)}
        title={`Click to learn about: ${title}`}
        style={{
          background: 'rgba(6, 182, 212, 0.18)',
          border: '1px solid var(--border-focus)',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--accent-cyan)',
          padding: 0,
          marginLeft: '6px',
          flexShrink: 0,
          transition: 'all 0.15s'
        }}
      >
        <Info size={11} />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseLeave={() => setIsOpen(false)}
          className="glass-panel"
          style={{
            position: 'absolute',
            ...getPositionStyle(),
            width: '310px',
            maxWidth: '85vw',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-focus)',
            borderRadius: '12px',
            padding: '14px 16px',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.75), 0 0 20px rgba(0, 240, 255, 0.25)',
            zIndex: 9999999,
            fontSize: '0.8rem',
            color: 'var(--text-primary)',
            lineHeight: 1.5,
            textAlign: 'left'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
            <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
              ℹ️ {title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.78rem' }}>{description}</p>

          {securityImpact && (
            <div style={{ background: 'var(--code-box-bg)', padding: '6px 10px', borderRadius: '6px', marginBottom: '6px', fontSize: '0.72rem', borderLeft: '3px solid #f59e0b' }}>
              <strong style={{ color: '#f59e0b' }}>Cyber Impact: </strong>
              <span style={{ color: 'var(--text-primary)' }}>{securityImpact}</span>
            </div>
          )}

          {goodVsBad && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--code-box-bg)', padding: '6px 10px', borderRadius: '6px', borderLeft: '3px solid var(--accent-green)' }}>
              <strong style={{ color: 'var(--accent-green)' }}>Verdict Guide: </strong>
              <span style={{ color: 'var(--text-primary)' }}>{goodVsBad}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
