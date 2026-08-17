import React, { useState } from 'react';
import { Camera, Server, Code, FileJson, Lock, Globe } from 'lucide-react';
import type { RiskScoreReport } from '../types';

interface TechnicalInspectorProps {
  report: RiskScoreReport;
}

export const TechnicalInspector: React.FC<TechnicalInspectorProps> = ({ report }) => {
  const [activeTab, setActiveTab] = useState<'screenshot' | 'dns_tls' | 'dom_forms' | 'raw_json'>('screenshot');

  const crawl = report.crawl_artifacts;
  const domainIntel = report.domain_intel;

  return (
    <div className="glass-panel" style={{ padding: '24px', margin: '0 24px 20px 24px' }}>
      {/* Tab Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(75, 85, 99, 0.4)', paddingBottom: '12px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('screenshot')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'screenshot' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: activeTab === 'screenshot' ? '#38bdf8' : '#9ca3af',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Camera size={15} /> Screenshot Sandbox
          </button>

          <button
            onClick={() => setActiveTab('dns_tls')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'dns_tls' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: activeTab === 'dns_tls' ? '#38bdf8' : '#9ca3af',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Server size={15} /> DNS & TLS Telemetry
          </button>

          <button
            onClick={() => setActiveTab('dom_forms')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'dom_forms' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: activeTab === 'dom_forms' ? '#38bdf8' : '#9ca3af',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Code size={15} /> DOM & Form Inspector
          </button>

          <button
            onClick={() => setActiveTab('raw_json')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'raw_json' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: activeTab === 'raw_json' ? '#38bdf8' : '#9ca3af',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileJson size={15} /> Raw API Payload
          </button>
        </div>

        <span className="mono" style={{ fontSize: '0.75rem', color: '#6b7280' }}>
          Crawl Time: {crawl?.crawl_time_ms || 0}ms
        </span>
      </div>

      {/* Tab 1: Screenshot Sandbox */}
      {activeTab === 'screenshot' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9ca3af' }}>
            <span>Isolated Headless Chromium Visual Capture</span>
            {crawl?.screenshot_hash && (
              <span className="mono" style={{ fontSize: '0.72rem' }}>
                SHA256: {crawl.screenshot_hash.slice(0, 24)}...
              </span>
            )}
          </div>

          {crawl?.screenshot_url ? (
            <div style={{
              background: '#000000',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(75, 85, 99, 0.4)',
              maxHeight: '420px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img
                src={`http://localhost:8000${crawl.screenshot_url}`}
                alt="Isolated Sandbox Screenshot"
                style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px dashed rgba(75, 85, 99, 0.5)',
              borderRadius: '8px',
              padding: '40px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Camera size={32} color="#6b7280" />
              <div style={{ fontSize: '0.9rem', color: '#d1d5db', fontWeight: 600 }}>
                Synthesized Headless Rendering Active
              </div>
              <p style={{ fontSize: '0.78rem', color: '#9ca3af', maxWidth: '420px' }}>
                Page DOM and textual signatures were parsed directly in the security sandbox.
              </p>
            </div>
          )}

          {crawl?.title && (
            <div style={{ fontSize: '0.8rem', color: '#d1d5db', background: 'rgba(17, 24, 39, 0.6)', padding: '8px 12px', borderRadius: '6px' }}>
              <strong>Rendered Document Title:</strong> <em>"{crawl.title}"</em>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: DNS & TLS Telemetry */}
      {activeTab === 'dns_tls' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* DNS Records */}
          <div style={{ background: 'rgba(17, 24, 39, 0.6)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(75, 85, 99, 0.3)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={16} /> DNS Record Hierarchy
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
              <div>
                <span style={{ color: '#9ca3af' }}>A Records:</span>{' '}
                <span className="mono" style={{ color: '#f3f4f6' }}>{domainIntel.dns.a_records.join(', ') || 'None'}</span>
              </div>
              <div>
                <span style={{ color: '#9ca3af' }}>AAAA Records:</span>{' '}
                <span className="mono" style={{ color: '#f3f4f6' }}>{domainIntel.dns.aaaa_records.join(', ') || 'None'}</span>
              </div>
              <div>
                <span style={{ color: '#9ca3af' }}>MX Records:</span>{' '}
                <span className="mono" style={{ color: '#f3f4f6' }}>{domainIntel.dns.mx_records.join(', ') || 'None (Suspicious if claiming to be major enterprise)'}</span>
              </div>
              <div>
                <span style={{ color: '#9ca3af' }}>NS Records:</span>{' '}
                <span className="mono" style={{ color: '#f3f4f6' }}>{domainIntel.dns.ns_records.join(', ') || 'None'}</span>
              </div>
            </div>
          </div>

          {/* TLS & Certificates */}
          <div style={{ background: 'rgba(17, 24, 39, 0.6)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(75, 85, 99, 0.3)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={16} /> TLS / SSL Certificate Context
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
              <div>
                <span style={{ color: '#9ca3af' }}>Certificate Valid:</span>{' '}
                <span style={{ color: domainIntel.tls_valid ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                  {domainIntel.tls_valid ? 'YES' : 'INVALID / UNRESOLVED'}
                </span>
              </div>
              <div>
                <span style={{ color: '#9ca3af' }}>Issuer CA:</span>{' '}
                <span style={{ color: '#f3f4f6' }}>{domainIntel.tls_issuer || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: '#9ca3af' }}>Days Remaining:</span>{' '}
                <span className="mono" style={{ color: '#f3f4f6' }}>{domainIntel.tls_days_remaining ?? 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: '#9ca3af' }}>Self-Signed:</span>{' '}
                <span style={{ color: domainIntel.tls_is_self_signed ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                  {domainIntel.tls_is_self_signed ? 'YES (HIGH RISK)' : 'NO'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: DOM & Form Inspector */}
      {activeTab === 'dom_forms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8' }}>
            Detected Web Forms & Interactive Hooks ({crawl?.forms.length || 0})
          </div>

          {crawl?.forms && crawl.forms.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {crawl.forms.map((f, idx) => (
                <div key={idx} style={{ background: 'rgba(17, 24, 39, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(75, 85, 99, 0.3)', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="mono" style={{ fontWeight: 600, color: '#f3f4f6' }}>
                      Method: {f.method} | Action: {f.action}
                    </span>
                    {f.has_password && (
                      <span className="badge-critical" style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700 }}>
                        PASSWORD INPUT DETECTED
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#9ca3af' }}>
                    Input Types: <span className="mono" style={{ color: '#38bdf8' }}>{f.input_types.join(', ')}</span> | Cross-Origin Target: <strong style={{ color: f.is_cross_origin ? '#ef4444' : '#10b981' }}>{f.is_cross_origin ? 'YES' : 'NO'}</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: '#9ca3af', padding: '16px', background: 'rgba(17, 24, 39, 0.4)', borderRadius: '6px' }}>
              No active interactive input forms identified on landing page.
            </div>
          )}

          {crawl?.external_domains && crawl.external_domains.length > 0 && (
            <div style={{ background: 'rgba(17, 24, 39, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(75, 85, 99, 0.3)' }}>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '6px', fontWeight: 600 }}>
                External Asset & Script Domains:
              </div>
              <div className="mono" style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                {crawl.external_domains.join(', ')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Raw JSON */}
      {activeTab === 'raw_json' && (
        <div style={{ background: 'rgba(17, 24, 39, 0.9)', padding: '16px', borderRadius: '8px', maxHeight: '350px', overflowY: 'auto' }}>
          <pre className="mono" style={{ fontSize: '0.75rem', color: '#34d399' }}>
            {JSON.stringify(report, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
