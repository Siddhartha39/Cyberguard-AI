import React, { useState } from 'react';
import { X, Copy, Printer, Check, Shield } from 'lucide-react';
import type { RiskScoreReport } from '../types';

interface ReportExportModalProps {
  report: RiskScoreReport;
  onClose: () => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({ report, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = () => {
    const text = `
# CYBERGUARD AI - FORENSIC THREAT & WEBSITE SECURITY REPORT
Case ID: ${report.case_id}
Target URL: ${report.target_url}
Domain: ${report.canonical_domain}
Timestamp: ${report.timestamp}
Overall Risk Score: ${report.overall_risk_score} / 100 (${report.verdict})
Security Posture Grade: ${report.security_audit?.security_grade || 'N/A'}
Recommended Action: ${report.recommended_action}

## 1. GEMINI AI THREAT & HACKER-PERSPECTIVE AUDIT
Threat Intel Analysis: ${report.ai_insights?.threat_intel_analysis || 'N/A'}
Hacker Perspective Assessment: ${report.ai_insights?.hacker_perspective_audit || 'N/A'}

## 2. BRAND CONTRADICTION FINDINGS
Impersonated Brand: ${report.brand_analysis.brand_display_name || 'None'}
Authorized Domain: ${report.brand_analysis.brand_official_domain || 'N/A'}
Contradiction Detected: ${report.brand_analysis.is_contradiction ? 'YES' : 'NO'}
Rationale: ${report.brand_analysis.contradiction_explanation || 'N/A'}

## 3. MULTI-SIGNAL EVIDENCE FACTORS
${report.evidence_breakdown.map((e) => `- [${e.severity}] ${e.category} / ${e.name} (${e.contribution > 0 ? '+' : ''}${e.contribution.toFixed(1)} pts): ${e.summary}`).join('\n')}

## 4. RECONSTRUCTED ATTACK CHAIN
${report.attack_chain.map((n) => `Step ${n.step_number}: ${n.title} [${n.severity.toUpperCase()}]\n${n.description}`).join('\n\n')}

## 5. WEBSITE DEFENSE HARDENING RECOMMENDATIONS
${report.ai_insights?.remediation_recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n') || 'Maintain routine security monitoring.'}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '880px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0d131f',
        border: '1px solid rgba(56, 189, 248, 0.5)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(75, 85, 99, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f3f4f6' }}>
              CyberGuard AI Forensic Intelligence Report
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleCopyMarkdown}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                background: 'rgba(31, 41, 55, 0.8)',
                color: '#38bdf8',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? 'Copied Markdown' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handlePrint}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: '#0284c7',
                color: '#ffffff',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <div style={{
            background: 'rgba(17, 24, 39, 0.9)',
            border: '1px solid rgba(75, 85, 99, 0.4)',
            borderRadius: '8px',
            padding: '24px',
            color: '#f3f4f6',
            fontSize: '0.85rem',
            lineHeight: 1.6
          }}>
            <div style={{ borderBottom: '2px solid #06b6d4', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f3f4f6' }}>
                  CYBERGUARD AI FORENSIC INTELLIGENCE REPORT
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                  Multi-Signal Risk Assessment, Brand Contradiction & Exploitability Audit
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge-critical mono" style={{ fontSize: '0.85rem', padding: '4px 12px', borderRadius: '6px', fontWeight: 700 }}>
                  {report.verdict} ({report.overall_risk_score}/100)
                </span>
                <div className="mono" style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '4px' }}>
                  Case ID: {report.case_id}
                </div>
              </div>
            </div>

            {/* Target Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', background: 'rgba(31, 41, 55, 0.4)', padding: '12px', borderRadius: '6px' }}>
              <div><strong>Target URL:</strong> <span className="mono">{report.target_url}</span></div>
              <div><strong>Domain:</strong> <span className="mono">{report.canonical_domain}</span></div>
              <div><strong>Timestamp:</strong> <span className="mono">{report.timestamp}</span></div>
              <div><strong>Security Grade:</strong> <span className="mono" style={{ color: '#38bdf8', fontWeight: 700 }}>{report.security_audit?.security_grade || 'N/A'}</span></div>
            </div>

            {/* AI Insights */}
            {report.ai_insights && (
              <div style={{ marginBottom: '18px', background: 'rgba(6, 182, 212, 0.1)', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #06b6d4' }}>
                <h4 style={{ color: '#38bdf8', fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px' }}>
                  🤖 Gemini AI Threat & Penetration Audit
                </h4>
                <p style={{ color: '#d1d5db', fontSize: '0.82rem', marginBottom: '6px' }}>
                  {report.ai_insights.threat_intel_analysis}
                </p>
                <div style={{ color: '#fca5a5', fontSize: '0.82rem' }}>
                  <strong>Exploitability Finding:</strong> {report.ai_insights.hacker_perspective_audit}
                </div>
              </div>
            )}

            {/* Brand Contradiction Summary */}
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ color: '#38bdf8', fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>
                1. Brand-Domain Contradiction Summary
              </h4>
              <div style={{ color: '#d1d5db', fontSize: '0.82rem' }}>
                {report.brand_analysis.is_contradiction ? (
                  <div style={{ color: '#fca5a5' }}>
                    <strong>CRITICAL CONTRADICTION:</strong> {report.brand_analysis.contradiction_explanation}
                  </div>
                ) : (
                  <div>No unauthorized brand contradiction detected for this domain profile.</div>
                )}
              </div>
            </div>

            {/* Evidence Factor Summary */}
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ color: '#38bdf8', fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>
                2. Key Forensic Evidence Signals
              </h4>
              <ul style={{ paddingLeft: '20px', color: '#d1d5db', fontSize: '0.82rem' }}>
                {report.evidence_breakdown.map((ev, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>
                    <strong>[{ev.severity}] {ev.category} - {ev.name}</strong> ({ev.contribution > 0 ? '+' : ''}{ev.contribution.toFixed(1)} pts): {ev.summary}
                  </li>
                ))}
              </ul>
            </div>

            {/* Attack Chain Summary */}
            <div>
              <h4 style={{ color: '#38bdf8', fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>
                3. Reconstructed Attack-Chain Stages
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                {report.attack_chain.map((node) => (
                  <div key={node.id} style={{ background: 'rgba(31, 41, 55, 0.3)', padding: '8px 12px', borderRadius: '4px' }}>
                    <strong>Step {node.step_number}: {node.title}</strong> [{node.severity.toUpperCase()}]
                    <div style={{ color: '#9ca3af', marginTop: '2px' }}>{node.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
