import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Play, RefreshCw, Zap, Shield, Sparkles } from 'lucide-react';
import type { BenchmarkSample } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface ScannerProps {
  onScan: (url: string, deep: boolean, forceRefresh: boolean) => void;
  isLoading: boolean;
  benchmarkSamples: BenchmarkSample[];
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, isLoading, benchmarkSamples }) => {
  const [url, setUrl] = useState('');
  const [scanMode, setScanMode] = useState<'free' | 'deep'>('free');
  const [forceRefresh, setForceRefresh] = useState(false);
  const [selectedSample, setSelectedSample] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [scannerFocus, setScannerFocus] = useState<'developer' | 'phishing'>('developer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onScan(url.trim(), scanMode === 'deep', forceRefresh);
  };

  const handleSelectSample = (sampleId: string) => {
    setSelectedSample(sampleId);
    const found = benchmarkSamples.find((s) => s.id === sampleId);
    if (found) {
      setUrl(found.url);
    }
  };

  const quickTargets = [
    { label: 'psit.ac.in (Edu 8144d)', url: 'https://psit.ac.in', type: 'safe' },
    { label: 'github.com (Hardened A+)', url: 'https://github.com', type: 'hardened' },
    { label: 'PayPal Lookalike (.xyz)', url: 'http://login-paypal-security-verification.xyz/auth/signin', type: 'phish' },
    { label: 'campuskart.shop (43d NRD)', url: 'https://campuskart.shop', type: 'safe' },
    { label: 'unregistered-sample.com', url: 'https://thisisatestunregistereddomain123987456.com', type: 'unregistered' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-panel"
      style={{
        padding: '26px 24px',
        margin: '0 24px 20px 24px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Dual-Feature Persona Mode Selector */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setScannerFocus('developer')}
              style={{
                background: scannerFocus === 'developer' ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)' : 'var(--code-box-bg)',
                color: scannerFocus === 'developer' ? '#38bdf8' : 'var(--text-secondary)',
                border: scannerFocus === 'developer' ? '1px solid #38bdf8' : '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s'
              }}
            >
              <Shield size={16} color={scannerFocus === 'developer' ? '#38bdf8' : 'var(--text-muted)'} />
              <span>Feature 1: Developer Website Security &amp; Anti-Hacking Audit</span>
            </button>

            <button
              type="button"
              onClick={() => setScannerFocus('phishing')}
              style={{
                background: scannerFocus === 'phishing' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(249, 115, 22, 0.25) 100%)' : 'var(--code-box-bg)',
                color: scannerFocus === 'phishing' ? '#f87171' : 'var(--text-secondary)',
                border: scannerFocus === 'phishing' ? '1px solid #f87171' : '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s'
              }}
            >
              <Zap size={16} color={scannerFocus === 'phishing' ? '#f87171' : 'var(--text-muted)'} />
              <span>Feature 2: Phishing &amp; Fraud Intelligence Scanner</span>
            </button>
          </div>

          {/* Main Input Row (Stacks vertically on mobile) */}
          <div className="scanner-input-row" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <motion.div
              animate={{
                borderColor: isFocused ? '#00f0ff' : 'var(--border-color)',
                boxShadow: isFocused ? '0 0 20px rgba(0, 240, 255, 0.25)' : 'inset 0 2px 4px rgba(0,0,0,0.3)'
              }}
              transition={{ duration: 0.2 }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                background: 'var(--code-box-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '0 16px'
              }}
            >
              <Search size={18} color={isFocused ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
              <input
                type="text"
                placeholder={scannerFocus === 'developer'
                  ? "Enter your website domain to audit defensive headers & anti-code injection posture (e.g. psit.ac.in, github.com)"
                  : "Enter suspicious URL to inspect phishing brand spoofing & credential harvesting (e.g. login-paypal-verify.xyz)"}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isLoading}
                className="mono"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                  padding: '14px 12px'
                }}
              />
              {url && !isLoading && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}
                >
                  Clear
                </button>
              )}
            </motion.div>

            <motion.button
              whileHover={{ scale: isLoading || !url.trim() ? 1 : 1.03 }}
              whileTap={{ scale: isLoading || !url.trim() ? 1 : 0.97 }}
              type="submit"
              disabled={isLoading || !url.trim()}
              className={`scanner-submit-btn ${!isLoading && url.trim() ? 'cyber-shimmer-btn' : ''}`}
              style={{
                background: isLoading
                  ? 'rgba(55, 65, 81, 0.8)'
                  : 'linear-gradient(135deg, #00f0ff 0%, #0284c7 100%)',
                color: isLoading ? 'var(--text-muted)' : '#070a10',
                border: 'none',
                borderRadius: '12px',
                padding: '0 24px',
                height: '50px',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: isLoading || !url.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isLoading || !url.trim() ? 'none' : '0 0 25px rgba(0, 240, 255, 0.45)',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={17} className="animate-spin" />
                  <span className="cyber-font">AUDITING...</span>
                </>
              ) : (
                <>
                  <Play size={16} fill="currentColor" />
                  <span className="cyber-font">
                    {scanMode === 'deep' ? 'EXECUTE DEEP AUDIT (x402)' : 'RUN FREE QUICK SCAN'}
                  </span>
                </>
              )}
            </motion.button>
          </div>

          {/* Options & Scan Status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  background: 'rgba(0, 240, 255, 0.12)',
                  border: '1px solid var(--accent-cyan)',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 0 12px rgba(0, 240, 255, 0.2)'
                }}
              >
                <Zap size={14} />
                <span>Free Quick Scan (Triage)</span>
              </div>
            </div>

            {/* Benchmark Samples Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Demo Target:
              </span>
              <select
                value={selectedSample}
                onChange={(e) => handleSelectSample(e.target.value)}
                disabled={isLoading}
                style={{
                  background: 'var(--code-box-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  padding: '7px 12px',
                  fontSize: '0.78rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select a Benchmark Case...</option>
                {benchmarkSamples.map((sample) => (
                  <option key={sample.id} value={sample.id}>
                    {sample.name} ({sample.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick 1-Tap Target Benchmark Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
            <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              QUICK TARGETS:
            </span>
            {quickTargets.map((tgt, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => { setUrl(tgt.url); }}
                style={{
                  background: url === tgt.url ? 'rgba(0, 240, 255, 0.22)' : 'var(--code-box-bg)',
                  border: url === tgt.url ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                  color: url === tgt.url ? 'var(--accent-cyan)' : 'var(--text-primary)',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  boxShadow: url === tgt.url ? '0 0 12px rgba(0, 240, 255, 0.3)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                <span className="mono">{tgt.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </form>
    </motion.div>
  );
};
