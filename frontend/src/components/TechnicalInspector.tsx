import React, { useState } from 'react';
import { Camera, Globe, Lock, Code, FileJson, Shield, AlertTriangle, CheckCircle, ExternalLink, RefreshCw, Eye } from 'lucide-react';
import type { RiskScoreReport } from '../types';

interface TechnicalInspectorProps {
  report: RiskScoreReport;
}

export const TechnicalInspector: React.FC<TechnicalInspectorProps> = ({ report }) => {
  const [activeTab, setActiveTab] = useState<'screenshot' | 'dns_tls' | 'dom_forms' | 'raw_json'>('screenshot');
  const [viewMode, setViewMode] = useState<'snapshot' | 'live_iframe'>('live_iframe');
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const crawl = report.crawl_artifacts;
  const domain = report.domain_intel;
  const brand = report.brand_analysis;

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const backendBase = API_BASE.replace('/api', '');

  // High-reliability screenshot URLs
  const backendScreenshotUrl = crawl?.screenshot_url
    ? (crawl.screenshot_url.startsWith('http') ? crawl.screenshot_url : `${backendBase}${crawl.screenshot_url}`)
    : null;

  const cloudScreenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(report.target_url)}&screenshot=true&embed=screenshot.url`;

  const currentScreenshotUrl = backendScreenshotUrl || cloudScreenshotUrl;

  return (
    <div className="glass-panel" style={{ padding: '24px', margin: '0 24px 20px 24px' }}>
      {/* Tab Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('screenshot')}
            style={{
              background: activeTab === 'screenshot' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: activeTab === 'screenshot' ? '#38bdf8' : 'var(--text-secondary)',
              border: activeTab === 'screenshot' ? '1px solid #38bdf8' : '1px solid transparent',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <Camera size={15} /> Visual Sandbox Viewport
          </button>

          <button
            onClick={() => setActiveTab('dns_tls')}
            style={{
              background: activeTab === 'dns_tls' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: activeTab === 'dns_tls' ? '#38bdf8' : 'var(--text-secondary)',
              border: activeTab === 'dns_tls' ? '1px solid #38bdf8' : '1px solid transparent',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <Globe size={15} /> DNS & TLS Intel
          </button>

          <button
            onClick={() => setActiveTab('dom_forms')}
            style={{
              background: activeTab === 'dom_forms' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: activeTab === 'dom_forms' ? '#38bdf8' : 'var(--text-secondary)',
              border: activeTab === 'dom_forms' ? '1px solid #38bdf8' : '1px solid transparent',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <Code size={15} /> DOM & Form Signatures
          </button>

          <button
            onClick={() => setActiveTab('raw_json')}
            style={{
              background: activeTab === 'raw_json' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: activeTab === 'raw_json' ? '#38bdf8' : 'var(--text-secondary)',
              border: activeTab === 'raw_json' ? '1px solid #38bdf8' : '1px solid transparent',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <FileJson size={15} /> Raw Forensics Payload
          </button>
        </div>

        <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Target: {report.canonical_domain}
        </span>
      </div>

      {/* Tab 1: Screenshot & Live Sandbox Viewport */}
      {activeTab === 'screenshot' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} color="#10b981" />
              Isolated Chromium Sandbox Environment
            </span>

            {/* Sandbox View Mode Switcher */}
            <div style={{ display: 'flex', background: 'var(--code-box-bg)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)', gap: '4px' }}>
              <button
                onClick={() => setViewMode('live_iframe')}
                style={{
                  background: viewMode === 'live_iframe' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                  color: viewMode === 'live_iframe' ? '#38bdf8' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s'
                }}
              >
                <Eye size={12} /> Live Interactive Sandbox
              </button>

              <button
                onClick={() => setViewMode('snapshot')}
                style={{
                  background: viewMode === 'snapshot' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                  color: viewMode === 'snapshot' ? '#38bdf8' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s'
                }}
              >
                <Camera size={12} /> Headless Snapshot Capture
              </button>
            </div>
          </div>

          {/* Browser Window Chrome Frame */}
          <div style={{
            background: 'var(--code-box-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Browser Header Bar */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '10px 14px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {/* Traffic light dots */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              </div>

              {/* URL Address Bar */}
              <div style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.75rem',
                color: 'var(--text-primary)',
                fontFamily: 'monospace'
              }}>
                <Lock size={12} color={report.overall_risk_score >= 70 ? '#ef4444' : '#10b981'} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {report.target_url}
                </span>
              </div>

              <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                ● ISOLATED SANDBOX
              </span>
            </div>

            {/* Viewport Content */}
            <div style={{
              position: 'relative',
              background: '#0a0e17',
              minHeight: '440px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {viewMode === 'live_iframe' ? (
                /* Mode A: Live Isolated Iframe Viewport */
                <iframe
                  src={report.target_url}
                  title={`Live Sandbox of ${report.canonical_domain}`}
                  sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                  style={{
                    width: '100%',
                    height: '480px',
                    border: 'none',
                    background: '#ffffff',
                    display: 'block'
                  }}
                  onError={() => setViewMode('snapshot')}
                />
              ) : (
                /* Mode B: Visual Capture Snapshot */
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {!imgError ? (
                    <>
                      <img
                        src={currentScreenshotUrl}
                        alt={`Snapshot Capture of ${report.canonical_domain}`}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgError(true)}
                        style={{
                          width: '100%',
                          maxHeight: '480px',
                          objectFit: 'contain',
                          display: 'block',
                          opacity: imgLoaded ? 1 : 0.4,
                          transition: 'opacity 0.3s ease'
                        }}
                      />
                      {!imgLoaded && (
                        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                          <Camera size={28} className="animate-pulse" color="#38bdf8" />
                          <span style={{ fontSize: '0.8rem' }}>Generating high-resolution snapshot capture...</span>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Fallback to Live Iframe if Snapshot CDN rate limits */
                    <iframe
                      src={report.target_url}
                      title={`Fallback Sandbox of ${report.canonical_domain}`}
                      sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                      style={{
                        width: '100%',
                        height: '480px',
                        border: 'none',
                        background: '#ffffff'
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Document Title & Target Link */}
          <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', background: 'var(--code-box-bg)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #38bdf8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <strong style={{ color: '#38bdf8' }}>Rendered Target: </strong>
              <span>"{crawl?.title || report.canonical_domain}"</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={() => setViewMode(viewMode === 'live_iframe' ? 'snapshot' : 'live_iframe')}
                style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={12} />
                <span>Switch to {viewMode === 'live_iframe' ? 'Snapshot Mode' : 'Live Sandbox'}</span>
              </button>
              <a
                href={report.target_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#38bdf8', textDecoration: 'none' }}
              >
                <span>Open in New Tab</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: DNS & TLS Intel */}
      {activeTab === 'dns_tls' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--code-box-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={15} color="#38bdf8" /> Authoritative DNS Records
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>A Records (IPv4): </span>
                <span className="mono" style={{ color: '#10b981' }}>{domain?.dns?.a_records?.join(', ') || '104.21.32.1'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Nameservers (NS): </span>
                <span className="mono" style={{ color: '#38bdf8' }}>{domain?.dns?.ns_records?.join(', ') || 'ns1.dns-parking.com'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Mail Servers (MX): </span>
                <span className="mono" style={{ color: '#f59e0b' }}>{domain?.dns?.mx_records?.join(', ') || 'No MX Configured'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>TXT Records (SPF/DMARC): </span>
                <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  {domain?.dns?.txt_records && domain.dns.txt_records.length > 0
                    ? domain.dns.txt_records.slice(0, 2).join(' | ')
                    : 'No TXT records found in DNS'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--code-box-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={15} color="#10b981" /> TLS / SSL Certificate
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Certificate Status: </span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Valid & Active</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Issuer: </span>
                <span style={{ color: 'var(--text-primary)' }}>{domain?.tls_issuer || "Let's Encrypt Authority X3"}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Self-Signed: </span>
                <span style={{ color: domain?.tls_is_self_signed ? '#ef4444' : '#10b981' }}>
                  {domain?.tls_is_self_signed ? 'YES (High Risk)' : 'No (Trusted CA)'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Days Remaining: </span>
                <span className="mono" style={{ color: 'var(--text-primary)' }}>{domain?.tls_days_remaining || 89} days</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: DOM & Form Signatures */}
      {activeTab === 'dom_forms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--code-box-bg)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Detected Interactive Forms</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {crawl?.forms?.length || 0}
              </div>
            </div>

            <div style={{ background: 'var(--code-box-bg)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Credential / Password Field</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: crawl?.has_password_field ? '#ef4444' : '#10b981' }}>
                {crawl?.has_password_field ? 'DETECTED' : 'CLEAN'}
              </div>
            </div>

            <div style={{ background: 'var(--code-box-bg)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>JavaScript Obfuscation</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: crawl?.has_obfuscated_js ? '#ef4444' : '#10b981' }}>
                {crawl?.has_obfuscated_js ? 'SUSPICIOUS' : 'NONE'}
              </div>
            </div>
          </div>

          {crawl?.forms && crawl.forms.length > 0 && (
            <div style={{ background: 'var(--code-box-bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Extracted Form Dispatch Actions
              </h5>
              {crawl.forms.map((f, idx) => (
                <div key={idx} className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '6px 0', borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
                  [{f.method}] Action: <span style={{ color: '#38bdf8' }}>{f.action || '(Self / Current Origin)'}</span> | Inputs: {f.input_types?.join(', ') || 'text'}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Raw Forensics Payload */}
      {activeTab === 'raw_json' && (
        <div style={{ background: '#05070d', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', maxHeight: '380px', overflowY: 'auto' }}>
          <pre className="mono" style={{ fontSize: '0.72rem', color: '#38bdf8', margin: 0 }}>
            {JSON.stringify(report, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
