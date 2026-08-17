import React, { useState } from 'react';
import { Download, Sparkles, Terminal, Puzzle } from 'lucide-react';

export const ChromeExtensionPage: React.FC = () => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    window.location.href = 'http://localhost:8000/api/extension/download';
    setTimeout(() => setDownloading(false), 2000);
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

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f3f4f6', lineHeight: 1.25, marginBottom: '12px' }}>
            CyberGuard AI Chrome Extension
          </h2>

          <p style={{ fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.6, marginBottom: '24px' }}>
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
                boxShadow: '0 0 20px rgba(2, 132, 199, 0.5)'
              }}
            >
              <Download size={18} />
              <span>{downloading ? 'Downloading Package...' : 'Download Chrome Extension (.ZIP)'}</span>
            </button>
          </div>
        </div>

        {/* Live Mockup Box */}
        <div style={{
          background: '#0d131f',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '12px',
          padding: '18px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.8), 0 0 20px rgba(6, 182, 212, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(75, 85, 99, 0.4)', paddingBottom: '8px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8' }}>
              <Puzzle size={16} color="#06b6d4" />
              <span>CYBERGUARD REAL-TIME POPUP</span>
            </div>
            <span className="badge-safe mono" style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px' }}>
              ACTIVE SHIELD
            </span>
          </div>

          <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '10px', borderRadius: '6px', marginBottom: '10px', fontSize: '0.75rem' }}>
            <div style={{ color: '#9ca3af', fontSize: '0.65rem' }}>CURRENT TAB</div>
            <div className="mono" style={{ color: '#f3f4f6', fontWeight: 700 }}>https://login-paypal-security-verification.xyz</div>
          </div>

          <div style={{ background: 'rgba(239, 68, 68, 0.15)', borderLeft: '3px solid #ef4444', padding: '8px 10px', borderRadius: '4px', marginBottom: '10px', fontSize: '0.75rem', color: '#fca5a5' }}>
            <strong>CRITICAL CONTRADICTION:</strong> Imitates 'PayPal' on unauthorized .xyz domain.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '8px', borderRadius: '6px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444' }}>88/100</div>
              <div style={{ fontSize: '0.6rem', color: '#9ca3af' }}>PHISHING RISK</div>
            </div>
            <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '8px', borderRadius: '6px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>GRADE F</div>
              <div style={{ fontSize: '0.6rem', color: '#9ca3af' }}>SECURITY POSTURE</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Setup Guide */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f3f4f6', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={20} color="#06b6d4" />
          <span>Quick 3-Step Installation Guide (Chrome / Brave / Edge)</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(75, 85, 99, 0.3)', borderRadius: '10px', padding: '18px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', marginBottom: '6px' }}>STEP 01</div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '6px' }}>Unzip the Package</h4>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', lineHeight: 1.5 }}>
              Click the download button above and extract the downloaded <code className="mono" style={{ color: '#38bdf8' }}>CyberGuard-AI-Chrome-Extension.zip</code> file onto your computer.
            </p>
          </div>

          <div style={{ background: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(75, 85, 99, 0.3)', borderRadius: '10px', padding: '18px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', marginBottom: '6px' }}>STEP 02</div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '6px' }}>Open Extensions Page</h4>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', lineHeight: 1.5 }}>
              Open Chrome and navigate to <code className="mono" style={{ color: '#38bdf8' }}>chrome://extensions</code>, then toggle on <strong>Developer mode</strong> in the top-right corner.
            </p>
          </div>

          <div style={{ background: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(75, 85, 99, 0.3)', borderRadius: '10px', padding: '18px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', marginBottom: '6px' }}>STEP 03</div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '6px' }}>Click "Load Unpacked"</h4>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', lineHeight: 1.5 }}>
              Click <strong>"Load unpacked"</strong> in the top-left and select the unzipped <code className="mono" style={{ color: '#38bdf8' }}>extension</code> directory. CyberGuard is now protecting your browser!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
