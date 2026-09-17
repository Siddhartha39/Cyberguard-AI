import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, Database, Radar, Home, Puzzle, Sun, Moon, HelpCircle, Coins, History, LayoutDashboard, Terminal, Wallet, Mail, Link, BarChart2, Key, Globe, Bell } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';
import { useAlgorandWallet } from '../context/AlgorandWalletContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  caseCount: number;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onOpenAbout: () => void;
  onOpenWalletModal?: () => void;
  onLaunchScanner?: () => void;
  hasActiveReport?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  caseCount,
  theme,
  toggleTheme,
  onOpenAbout,
  onOpenWalletModal,
  onLaunchScanner,
  hasActiveReport = false
}) => {
  const { isConnected, address, balanceAlgo } = useAlgorandWallet();
  
  const TabButton = ({ tab, label, icon: Icon, onClick }: any) => {
    const isActive = activeTab === tab;
    return (
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick || (() => setActiveTab(tab))}
        style={{
          padding: '7px 12px',
          borderRadius: '8px',
          border: isActive ? '1px solid var(--accent-cyan)' : '1px solid transparent',
          background: isActive
            ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.22) 0%, rgba(59, 130, 246, 0.22) 100%)'
            : 'transparent',
          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontSize: '0.78rem',
          fontWeight: isActive ? 800 : 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          boxShadow: isActive ? '0 0 12px rgba(0, 240, 255, 0.35)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <Icon size={14} color={isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)'} />
        <span>{label}</span>
      </motion.button>
    );
  };

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
              <span className="badge-safe mono" style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                100% FREE &amp; OPEN ACCESS
              </span>
            </div>
            <p className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              [AI-POWERED WEBSITE SECURITY &amp; THREAT INTELLIGENCE]
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs-container" style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--nav-bar-bg)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
          <TabButton tab="overview" label="Overview" icon={Home} />
          
          <TabButton 
            tab="scanner" 
            label="Scanner" 
            icon={Radar} 
            onClick={() => {
              if (activeTab !== 'scanner' && onLaunchScanner) onLaunchScanner();
              else setActiveTab('scanner');
            }}
          />
          
          <TabButton tab="email-scanner" label="Email Scan" icon={Mail} />
          <TabButton tab="bulk-scanner" label="Bulk Scan" icon={Link} />
          <TabButton tab="threat-dashboard" label="Threat Intel" icon={BarChart2} />
          <TabButton tab="password-checker" label="Password" icon={Key} />
          <TabButton tab="ip-reputation" label="IP Lookup" icon={Globe} />
          <TabButton tab="watchlist" label="Watchlist" icon={Bell} />
          
          <TabButton tab="history" label={`History (${caseCount})`} icon={History} />
          
          {/* Grouped or secondary tabs */}
          {hasActiveReport && <TabButton tab="results" label="Results" icon={LayoutDashboard} />}
          <TabButton tab="extension" label="Ext" icon={Puzzle} />
          <TabButton tab="about" label="Info" icon={HelpCircle} />
        </div>

        {/* Global Controls & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab('discovery')}
            style={{
              padding: '8px 13px',
              borderRadius: '10px',
              border: '1px solid rgba(249, 115, 22, 0.35)',
              background: activeTab === 'discovery' ? 'rgba(249, 115, 22, 0.2)' : 'transparent',
              color: '#f97316',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Discovery Feed - Real-time Certificate Transparency stream"
          >
            <Activity size={14} color="#f97316" />
            <span className="hidden md:inline">Feed</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            style={{
              padding: '8px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--code-box-bg)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#00f0ff" />}
          </motion.button>
        </div>
      </div>
    </header>
  );
};
