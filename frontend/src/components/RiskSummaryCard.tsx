import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import type { RiskScoreReport } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface RiskSummaryCardProps {
  report: RiskScoreReport;
  onOpenExport: () => void;
}

export const RiskSummaryCard: React.FC<RiskSummaryCardProps> = ({ report, onOpenExport }) => {
  const isCritical = report.overall_risk_score >= 70;
  const isSuspicious = report.overall_risk_score >= 40 && report.overall_risk_score < 70;

  let glowClass = 'glow-safe';
  let badgeClass = 'badge-safe';
  let verdictColor = '#10b981';
  let VerdictIcon = CheckCircle;

  if (isCritical) {
    glowClass = 'glow-danger';
    badgeClass = 'badge-critical';
    verdictColor = '#ef4444';
    VerdictIcon = AlertOctagon;
  } else if (isSuspicious) {
    glowClass = 'glow-warning';
    badgeClass = 'badge-high';
    verdictColor = '#f97316';
    VerdictIcon = AlertTriangle;
  }

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (report.overall_risk_score / 100) * circumference;

  return (
    <div className={`glass-panel ${glowClass}`} style={{ padding: '24px', margin: '0 24px 20px 24px', position: 'relative', zIndex: 30 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '28px', alignItems: 'center' }}>
        {/* Risk Score Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="65"
              cy="65"
              r={radius}
              stroke="rgba(75, 85, 99, 0.25)"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="65"
              cy="65"
              r={radius}
              stroke={verdictColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', top: '35px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {report.overall_risk_score.toFixed(0)}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>
              / 100 RISK
            </span>
          </div>
        </div>

        {/* Verdict & Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <div className={badgeClass} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '16px', fontWeight: 700, fontSize: '0.85rem' }}>
              <VerdictIcon size={16} />
              <span>VERDICT: {report.verdict}</span>
            </div>

            <InfoTooltip
              title="Calibrated Phishing Risk Score"
              description="A multi-signal probabilistic score (0-100) calculated by combining lexical ML, domain age, DNS/TLS records, credential forms, and brand contradiction factors."
              securityImpact="0-35 indicates safe benign services; 70-100 indicates active phishing or malicious credential traps."
              goodVsBad="Green (Low) = Safe to visit. Red (High) = Block and do NOT enter credentials."
              position="top"
            />

            <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Confidence: {(report.confidence * 100).toFixed(0)}%
            </span>

            <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Case ID: {report.case_id}
            </span>
          </div>

          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            {report.canonical_domain}
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', background: 'var(--code-box-bg)', padding: '8px 12px', borderRadius: '8px', borderLeft: `3px solid ${verdictColor}`, marginBottom: '14px' }}>
            <strong>Recommended Security Action:</strong> {report.recommended_action}
          </div>

          {/* Sub-Score Vector Progress Bars (Tooltips Pop Upward) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>URL Lexical ML</span>
                  <InfoTooltip
                    title="URL Lexical ML Vector"
                    description="Analyzes character Shannon entropy, brand keywords in subdomains, length ratios, and suspicious TLD patterns."
                    securityImpact="High lexical entropy often indicates random string generation or deceptive lookalike paths."
                    position="top"
                  />
                </div>
                <span className="mono">{(report.score_lexical * 100).toFixed(0)}%</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(75, 85, 99, 0.4)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, report.score_lexical * 100)}%`, height: '100%', background: '#38bdf8' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>Infrastructure</span>
                  <InfoTooltip
                    title="Domain & Infrastructure Score"
                    description="Evaluates domain registration age via RDAP/WHOIS, TLS certificate issuer, and DNS hierarchy."
                    securityImpact="Newly Registered Domains (< 30 days old) or missing MX records represent primary phishing precursors."
                    position="top"
                  />
                </div>
                <span className="mono">{(report.score_infrastructure * 100).toFixed(0)}%</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(75, 85, 99, 0.4)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, report.score_infrastructure * 100)}%`, height: '100%', background: '#f59e0b' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>Content / DOM</span>
                  <InfoTooltip
                    title="DOM & Form Behavior Score"
                    description="Detects interactive password inputs, credit card fields, cross-origin form action dispatch, and obfuscated JavaScript."
                    securityImpact="Password inputs on unrecognized domains indicate credential harvesting."
                    position="top"
                  />
                </div>
                <span className="mono">{(report.score_content_behavior * 100).toFixed(0)}%</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(75, 85, 99, 0.4)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, report.score_content_behavior * 100)}%`, height: '100%', background: '#ef4444' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>Visual / Brand</span>
                  <InfoTooltip
                    title="Visual Brand & Logo Similarity"
                    description="Computes perceptual hash (pHash) on the rendered landing DOM against official brand catalogs to detect deceptive lookalikes."
                    securityImpact="High visual similarity combined with an unauthorized domain triggers Brand-Domain Contradiction."
                    position="top"
                  />
                </div>
                <span className="mono">{(report.score_visual_brand * 100).toFixed(0)}%</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(75, 85, 99, 0.4)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, report.score_visual_brand * 100)}%`, height: '100%', background: '#c084fc' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={onOpenExport}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #1e1b4b 100%)',
              color: '#ffffff',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              borderRadius: '10px',
              padding: '12px 18px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 15px rgba(2, 132, 199, 0.3)',
              transition: 'all 0.15s'
            }}
          >
            <FileText size={16} />
            <span>Export Forensic Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
