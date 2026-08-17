import React from 'react';
import { TrendingUp, TrendingDown, Layers } from 'lucide-react';
import type { EvidenceItem } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface EvidenceTableProps {
  evidenceList: EvidenceItem[];
}

export const EvidenceTable: React.FC<EvidenceTableProps> = ({ evidenceList }) => {
  return (
    <div className="glass-panel" style={{ padding: '24px', margin: '0 24px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '8px', borderRadius: '8px' }}>
            <Layers size={20} color="#06b6d4" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f3f4f6' }}>
                Multi-Signal Calibrated Evidence Matrix
              </h3>
              <InfoTooltip
                title="Evidence Factor Matrix"
                description="Lists all independent forensic indicators evaluated by the AI engine with their calibrated point impacts (+/- score points)."
                securityImpact="Positive points (+pts) increase overall threat score; negative points (-pts) prove legitimate domain history and reduce the score."
                goodVsBad="Inspect this table to audit exactly why the AI assigned the specific risk verdict."
              />
            </div>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
              Individual independent evidence factors and their calibrated contributions to the overall risk score
            </p>
          </div>
        </div>

        <span className="mono" style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
          {evidenceList.length} Extracted Signals
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.4)', textAlign: 'left', color: '#9ca3af' }}>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>Evidence Indicator</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>Severity</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>Weight</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>Score Impact</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>Forensic Description</th>
            </tr>
          </thead>
          <tbody>
            {evidenceList.map((ev, idx) => {
              const isPositive = ev.contribution > 0;
              const isSafe = ev.severity === 'SAFE';

              let badgeClass = 'badge-medium';
              if (ev.severity === 'CRITICAL') badgeClass = 'badge-critical';
              else if (ev.severity === 'HIGH') badgeClass = 'badge-high';
              else if (ev.severity === 'SAFE') badgeClass = 'badge-safe';

              return (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid rgba(75, 85, 99, 0.2)',
                    background: idx % 2 === 0 ? 'rgba(17, 24, 39, 0.3)' : 'transparent',
                    transition: 'background 0.15s'
                  }}
                >
                  <td style={{ padding: '12px', color: '#9ca3af', fontWeight: 500 }}>
                    {ev.category}
                  </td>

                  <td style={{ padding: '12px', color: '#f3f4f6', fontWeight: 600 }}>
                    {ev.name}
                  </td>

                  <td style={{ padding: '12px' }}>
                    <span className={badgeClass} style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                      {ev.severity}
                    </span>
                  </td>

                  <td style={{ padding: '12px' }} className="mono">
                    {ev.weight.toFixed(2)}
                  </td>

                  <td style={{ padding: '12px' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: isSafe ? '#10b981' : (isPositive ? '#ef4444' : '#10b981'),
                      fontWeight: 700
                    }} className="mono">
                      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span>{isPositive ? `+${ev.contribution.toFixed(1)}` : `${ev.contribution.toFixed(1)}`} pts</span>
                    </div>
                  </td>

                  <td style={{ padding: '12px', color: '#d1d5db', maxWidth: '380px', lineHeight: 1.4 }}>
                    {ev.summary}
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
