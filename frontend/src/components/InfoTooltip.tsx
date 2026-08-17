import React, { useState } from 'react';
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
  position = 'bottom'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return {
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px'
        };
      case 'right':
        return {
          top: '50%',
          left: '100%',
          transform: 'translateY(-50%)',
          marginLeft: '8px'
        };
      case 'left':
        return {
          top: '50%',
          right: '100%',
          transform: 'translateY(-50%)',
          marginRight: '8px'
        };
      case 'bottom':
      default:
        return {
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '8px'
        };
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        title={`Click to learn about: ${title}`}
        style={{
          background: 'rgba(6, 182, 212, 0.15)',
          border: '1px solid var(--border-color)',
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
          transition: 'all 0.15s'
        }}
      >
        <Info size={11} />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseLeave={() => setIsOpen(false)}
          style={{
            position: 'absolute',
            ...getPositionStyle(),
            width: '290px',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-focus)',
            borderRadius: '10px',
            padding: '12px 14px',
            boxShadow: 'var(--panel-shadow)',
            zIndex: 99999,
            fontSize: '0.78rem',
            color: 'var(--text-primary)',
            lineHeight: 1.45,
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
            <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
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

          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>{description}</p>

          {securityImpact && (
            <div style={{ background: 'var(--code-box-bg)', padding: '6px 8px', borderRadius: '6px', marginBottom: '6px', fontSize: '0.72rem' }}>
              <strong style={{ color: '#f59e0b' }}>Cyber Impact: </strong>
              <span style={{ color: 'var(--text-primary)' }}>{securityImpact}</span>
            </div>
          )}

          {goodVsBad && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--accent-green)' }}>Verdict Guide: </strong>
              <span>{goodVsBad}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
