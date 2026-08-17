import React, { useState } from 'react';
import { Search, Play, RefreshCw, Sparkles } from 'lucide-react';
import type { BenchmarkSample } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface ScannerProps {
  onScan: (url: string, deep: boolean, forceRefresh: boolean) => void;
  isLoading: boolean;
  benchmarkSamples: BenchmarkSample[];
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, isLoading, benchmarkSamples }) => {
  const [url, setUrl] = useState('');
  const [deepAnalysis, setDeepAnalysis] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [selectedSample, setSelectedSample] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onScan(url.trim(), deepAnalysis, forceRefresh);
  };

  const handleSelectSample = (sampleId: string) => {
    setSelectedSample(sampleId);
    const found = benchmarkSamples.find((s) => s.id === sampleId);
    if (found) {
      setUrl(found.url);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', margin: '0 24px 20px 24px' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Main Input Row (Stacks vertically on mobile) */}
          <div className="scanner-input-row" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              background: 'var(--code-box-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '0 16px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
            }}>
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Enter domain to audit (e.g. campuskart.shop or login-paypal.xyz)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                className="mono"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  padding: '14px 12px'
                }}
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="scanner-submit-btn"
              style={{
                background: isLoading ? '#374151' : 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0 22px',
                height: '48px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: isLoading || !url.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isLoading ? 'none' : '0 0 18px rgba(2, 132, 199, 0.4)',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={17} className="radar-spinner" />
                  <span>Auditing Security...</span>
                </>
              ) : (
                <>
                  <Play size={17} fill="#ffffff" />
                  <span>Execute Inspection</span>
                </>
              )}
            </button>
          </div>

          {/* Options & Benchmark Dropdown Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingTop: '4px' }}>
            {/* Quick Benchmark Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                <Sparkles size={14} />
                <span>Presets:</span>
                <InfoTooltip
                  title="Benchmark Scenarios"
                  description="Pre-configured high-fidelity test samples showcasing various attack archetypes (Credential harvesters, O365 portals, Punycode Cyrillic attacks, Legitimate infrastructure)."
                  goodVsBad="Click any scenario to evaluate how the multi-signal AI handles specific attack vectors."
                />
              </div>
              <select
                value={selectedSample}
                onChange={(e) => handleSelectSample(e.target.value)}
                style={{
                  background: 'var(--code-box-bg)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '0.78rem',
                  outline: 'none',
                  cursor: 'pointer',
                  maxWidth: '280px'
                }}
              >
                <option value="">Select Pre-Configured Benchmark...</option>
                {benchmarkSamples.map((sample) => (
                  <option key={sample.id} value={sample.id}>
                    [{sample.category}] {sample.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Analysis Mode Toggles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={deepAnalysis}
                  onChange={(e) => setDeepAnalysis(e.target.checked)}
                  style={{ accentColor: '#0284c7' }}
                />
                <span>Headless Sandbox Audit</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={forceRefresh}
                  onChange={(e) => setForceRefresh(e.target.checked)}
                  style={{ accentColor: '#0284c7' }}
                />
                <span>Bypass Cache</span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
