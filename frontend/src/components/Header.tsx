import React from 'react';
import { Shield, Activity, Database, Radar, Home, Puzzle, Sun, Moon, HelpCircle } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  caseCount: number;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onOpenAbout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  caseCount,
  theme,
  toggleTheme,
  onOpenAbout
}) => {
  return (
    <header className="glass-panel" style={{ margin: '16px 24px', padding: '16px 20px', position: 'relative', zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        {/* Brand & Project Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('overview')}>
          <div style={{
            background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0, 240, 255, 0.4)'
          }}>
            <Shield size={24} color="#070a10" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <h1 className="cyber-font cyber-glitch neon-cyan-glow" style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '0.04em' }}>
                CYBERGUARD AI
              </h1>
              <span className="badge-info mono" style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 800 }}>
                v2.0-SOC PRO
              </span>
              <InfoTooltip
                title="CyberGuard AI Platform"
                description="Zero-trust autonomous threat intelligence system that reconstructs full phishing attack chains, detects brand lookalikes, and audits web infrastructure exploitability."
                securityImpact="Protects enterprise employees and consumers against credential harvesting and malicious brand spoofs."
                goodVsBad="Green scores (<30) indicate verified safety; high scores (>70) indicate malicious attack campaigns."
                position="bottom"
              />
            </div>
            <p className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              [CYBER THREAT INTELLIGENCE &amp; VULNERABILITY AUDITOR]
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Mobile Horizontally Scrollable) */}
        <div className="nav-tabs-container" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--nav-bar-bg)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)', flexWrap: 'nowrap', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'overview' ? '#0284c7' : 'transparent',
              color: activeTab === 'overview' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s'
            }}
          >
            <Home size={14} /> Overview
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'scanner' ? '#0284c7' : 'transparent',
              color: activeTab === 'scanner' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s'
            }}
          >
            <Radar size={14} /> Live Scanner
          </button>

          <button
            onClick={() => setActiveTab('discovery')}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'discovery' ? '#0284c7' : 'transparent',
              color: activeTab === 'discovery' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s'
            }}
          >
            <Activity size={14} /> NRD Feed
          </button>

          <button
            onClick={() => setActiveTab('extension')}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'extension' ? '#0284c7' : 'transparent',
              color: activeTab === 'extension' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s'
            }}
          >
            <Puzzle size={14} /> Extension
          </button>

          <button
            onClick={() => setActiveTab('cases')}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'cases' ? '#0284c7' : 'transparent',
              color: activeTab === 'cases' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s'
            }}
          >
            <Database size={14} /> Cases ({caseCount})
          </button>
        </div>

        {/* Live System Status Badges, About Guide & Light/Dark Theme Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* About & Guide Modal Button */}
          <button
            onClick={onOpenAbout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              border: `1px solid var(--border-focus)`,
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Open Feature & Telemetry Guide"
          >
            <HelpCircle size={14} />
            <span className="mono">ABOUT</span>
          </button>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: theme === 'light' ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)',
              color: theme === 'light' ? '#0f172a' : '#f3f4f6',
              border: `1px solid var(--border-color)`,
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={14} color="#f59e0b" />
                <span className="mono">LIGHT</span>
              </>
            ) : (
              <>
                <Moon size={14} color="#0284c7" />
                <span className="mono">DARK</span>
              </>
            )}
          </button>

          {/* SOC Online Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: theme === 'light' ? '#16a34a' : '#00ff88', background: theme === 'light' ? '#dcfce7' : 'rgba(0, 255, 136, 0.12)', padding: '5px 10px', borderRadius: '8px', border: `1px solid ${theme === 'light' ? '#86efac' : 'rgba(0, 255, 136, 0.3)'}` }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: theme === 'light' ? '#16a34a' : '#00ff88', display: 'inline-block', boxShadow: '0 0 6px #00ff88' }}></span>
            <span className="mono" style={{ fontWeight: 700 }}>SOC: ON</span>
          </div>
        </div>
      </div>
    </header>
  );
};
