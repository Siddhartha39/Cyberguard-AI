import React, { useState } from 'react';
import { Download, Sparkles, Terminal, Puzzle, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const ChromeExtensionPage: React.FC = () => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    const link = document.createElement('a');
    link.href = '/CyberGuard-AI-Chrome-Extension.zip';
    link.download = 'CyberGuard-AI-Chrome-Extension.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 1500);
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', margin: '0 24px 20px 24px' }}>
      {/* Hero Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'center', marginBottom: '36px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.4)', borderRadius: '20px', padding: '4px 12px', fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, marginBottom: '14px' }}>
            <Sparkles size={14} />
            <span>REAL-TIME BROWSER DEFENSE (MANIFEST V3)</span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '12px' }}>
            CyberGuard AI Chrome Extension
          </h2>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
            Install the lightweight browser extension to get instant early-warning alerts whenever you visit suspect lookalike domains, credential phishing traps, or unsecured web servers.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={handleDownload}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 20px rgba(2, 132, 199, 0.5)',
                transition: 'all 0.15s'
              }}
            >
              <Download size={18} />
              <span>{downloading ? 'Downloading Package...' : 'Download Chrome Extension (.ZIP)'}</span>
            </button>
          </div>
        </div>

        {/* Live Extension Mockup Box */}
        <div style={{
          background: 'var(--code-box-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '18px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: '#0284c7', padding: '6px', borderRadius: '6px', color: '#ffffff' }}>
                <Puzzle size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>CyberGuard AI</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>v2.0 Active Shield</div>
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
              ● SHIELD ACTIVE
            </span>
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.4)', borderRadius: '8px', padding: '12px', marginBottom: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Active Tab Evaluated</div>
            <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              https://campuskart.shop
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 600 }}>RISK SCORE</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>15.6 / 100</div>
            </div>
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: 600 }}>VERDICT</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>BENIGN</div>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={13} color="#10b981" />
            <span>Passive background scanner monitoring tab navigation</span>
          </div>
        </div>
      </div>

      {/* 3-Step Setup Instructions */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={18} color="#38bdf8" />
          <span>3-Step Installation Guide</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--code-box-bg)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', marginBottom: '12px' }}>
              1
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Download & Unzip</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Click the download button above and extract the downloaded <code className="mono" style={{ color: '#38bdf8' }}>CyberGuard-AI-Chrome-Extension.zip</code> file onto your computer.
            </p>
          </div>

          <div style={{ background: 'var(--code-box-bg)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', marginBottom: '12px' }}>
              2
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Open Extensions Page</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Open Chrome and navigate to <code className="mono" style={{ color: '#38bdf8' }}>chrome://extensions</code>, then toggle on <strong>Developer mode</strong> in the top-right corner.
            </p>
          </div>

          <div style={{ background: 'var(--code-box-bg)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', marginBottom: '12px' }}>
              3
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Load Unpacked</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Click <strong>"Load unpacked"</strong> in the top-left and select the unzipped <code className="mono" style={{ color: '#38bdf8' }}>extension</code> directory. CyberGuard is now protecting your browser!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
