import React from 'react';
import { Activity, RefreshCw, Zap } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';
import type { FeedItem } from '../types';

interface DiscoveryFeedProps {
  feed: FeedItem[];
  onEscalate: (itemId: string) => void;
  onSelectDomain: (domain: string) => void;
  isLoading: boolean;
  onRefreshFeed: () => void;
}

export const DiscoveryFeed: React.FC<DiscoveryFeedProps> = ({
  feed,
  onEscalate,
  onSelectDomain,
  isLoading,
  onRefreshFeed
}) => {
  return (
    <div className="glass-panel" style={{ padding: '24px', margin: '0 24px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(249, 115, 22, 0.15)', padding: '8px', borderRadius: '8px' }}>
            <Activity size={20} color="#f97316" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Discovery Mode: Newly Registered Domain (NRD) Pipeline
              </h3>
              <InfoTooltip
                title="NRD Ingestion Pipeline"
                description="Real-time stream aggregating domains registered within the last 30 days. Employs ultra-fast lexical classification before domains can be used in active campaigns."
                securityImpact="Stops zero-day phishing attacks before emails reach employee inboxes."
                goodVsBad="Domains with suspicious keywords or high character entropy get elevated triage scores (>65)."
                position="bottom"
              />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Early-warning streaming ingestion: Fast lexical triage prioritizes candidate domains before phishing attacks weaponize
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshFeed}
          disabled={isLoading}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={14} className={isLoading ? 'radar-spinner' : ''} />
          <span>Refresh Stream</span>
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>
                Candidate Domain
                <InfoTooltip
                  title="Candidate Domain"
                  description="Newly registered FQDN identified through DNS zone changes or Certificate Transparency logs."
                  position="bottom"
                />
              </th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>
                Fast Triage Score
                <InfoTooltip
                  title="Fast Triage Score (0–100)"
                  description="Lightweight sub-10ms lexical & entropy score used to triage millions of domains daily without executing headless browsers."
                  position="bottom"
                />
              </th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>
                Discovery Source
                <InfoTooltip
                  title="Discovery Ingestion Channel"
                  description="Origin telemetry channel (e.g. DNS Zone Stream, Certificate Transparency, Passive DNS)."
                  position="bottom"
                />
              </th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>Timestamp</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>
                Heuristic Tags
                <InfoTooltip
                  title="Heuristic Anomaly Tags"
                  description="Automated indicators flagged during lexical pass, such as brand keywords, high entropy, or suspicious TLDs."
                  position="bottom"
                />
              </th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>
                Escalation Action
                <InfoTooltip
                  title="Sandbox Escalation"
                  description="Spawns headless Playwright crawler, takes DOM screenshot, checks logo pHash, and builds full forensic attack chain."
                  position="bottom"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {feed.map((item) => {
              const isHigh = item.fast_risk_score >= 65;
              const isMedium = item.fast_risk_score >= 35 && item.fast_risk_score < 65;

              let badgeClass = 'badge-safe';
              if (isHigh) {
                badgeClass = 'badge-critical';
              } else if (isMedium) {
                badgeClass = 'badge-high';
              }

              return (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    background: item.is_escalated ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                    transition: 'background 0.15s'
                  }}
                >
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => onSelectDomain(item.domain)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-cyan)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      className="mono"
                    >
                      {item.domain}
                    </button>
                  </td>

                  <td style={{ padding: '12px' }}>
                    <span className={badgeClass} style={{ padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      {item.fast_risk_score.toFixed(0)} / 100
                    </span>
                  </td>

                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                    {item.source}
                  </td>

                  <td style={{ padding: '12px', color: 'var(--text-muted)' }} className="mono">
                    {item.discovered_time}
                  </td>

                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {item.tags.map((t, idx) => (
                        <span key={idx} className="badge-info" style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px' }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => onEscalate(item.id)}
                      disabled={isLoading}
                      style={{
                        background: item.is_escalated ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                        color: item.is_escalated ? 'var(--threat-safe)' : '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {item.is_escalated ? (
                        <span>Deep Analyzed</span>
                      ) : (
                        <>
                          <Zap size={13} fill="#ffffff" />
                          <span>Escalate to Sandbox</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
