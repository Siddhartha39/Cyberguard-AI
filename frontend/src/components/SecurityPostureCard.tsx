import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Bot, Wrench, Lock } from 'lucide-react';
import type { SecurityPostureAudit, GeminiAIInsight } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface SecurityPostureCardProps {
  audit?: SecurityPostureAudit;
  aiInsights?: GeminiAIInsight;
  domain: string;
}

export const SecurityPostureCard: React.FC<SecurityPostureCardProps> = ({ audit, aiInsights, domain }) => {
  if (!audit) return null;

  const isGradeGood = ['A+', 'A', 'B'].includes(audit.security_grade);
  const gradeColor = audit.security_grade === 'A+' ? '#10b981' : audit.security_grade === 'B' ? '#38bdf8' : audit.security_grade === 'C' ? '#f59e0b' : '#ef4444';

  return (
    <div className="glass-panel" style={{ padding: '24px', margin: '0 24px 20px 24px', border: `1px solid ${isGradeGood ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}` }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #1e1b4b 100%)', padding: '10px', borderRadius: '10px', boxShadow: '0 0 16px rgba(2, 132, 199, 0.4)' }}>
            <Lock size={22} color="#38bdf8" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f3f4f6', letterSpacing: '-0.02em' }}>
                Website Security Posture & Exploitability Audit
              </h3>
              <InfoTooltip
                title="Website Security Posture Audit"
                description="Evaluates your web server's defensive headers, clickjacking immunity, and email domain anti-spoofing configurations."
                securityImpact="Websites with missing headers can be framed in invisible clickjacking traps or have their email domain forged by attackers."
                goodVsBad="A Grade 'A+' means hardened against common web exploits. Grades 'C' or 'F' mean easily exploitable."
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
              Deep vulnerability analysis & hacker-perspective remediation for <strong>{domain}</strong>
            </p>
          </div>
        </div>

        {/* Grade Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(17, 24, 39, 0.8)', padding: '6px 16px', borderRadius: '12px', border: `1px solid ${gradeColor}` }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 700 }}>SECURITY GRADE</div>
            <div className="mono" style={{ fontSize: '0.75rem', color: '#f3f4f6' }}>{audit.score_percentage}% Pass Rate</div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: gradeColor }} className="mono">
            {audit.security_grade}
          </div>
        </div>
      </div>

      {/* Gemini AI Penetration Testing & Threat Assessment */}
      {aiInsights && (
        <div style={{
          background: 'radial-gradient(circle at top left, rgba(6, 182, 212, 0.15) 0%, rgba(17, 24, 39, 0.85) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '10px',
          padding: '16px 18px',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Bot size={18} color="#06b6d4" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em' }}>
              GEMINI AI THREAT & EXPLOITABILITY BRIEFING
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.82rem' }}>
            <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
              <div style={{ fontWeight: 700, color: '#93c5fd', marginBottom: '4px' }}>
                🛡️ Threat & Trust Analysis
              </div>
              <p style={{ color: '#d1d5db', lineHeight: 1.45 }}>
                {aiInsights.threat_intel_analysis}
              </p>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '12px', borderRadius: '8px', borderLeft: `3px solid ${audit.is_clickjackable || audit.is_email_spoofable ? '#ef4444' : '#10b981'}` }}>
              <div style={{ fontWeight: 700, color: audit.is_clickjackable || audit.is_email_spoofable ? '#fca5a5' : '#86efac', marginBottom: '4px' }}>
                ⚡ Hacker / Penetration Tester Assessment
              </div>
              <p style={{ color: '#d1d5db', lineHeight: 1.45 }}>
                {aiInsights.hacker_perspective_audit}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Exploitability Indicator Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
        <div style={{ background: 'rgba(17, 24, 39, 0.6)', padding: '12px', borderRadius: '8px', border: `1px solid ${audit.is_clickjackable ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.4)'}` }}>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600 }}>CLICKJACKING IMMUNITY</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: audit.is_clickjackable ? '#ef4444' : '#10b981', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {audit.is_clickjackable ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{audit.is_clickjackable ? 'VULNERABLE (Easily Framed)' : 'PROTECTED (Anti-iFrame)'}</span>
          </div>
        </div>

        <div style={{ background: 'rgba(17, 24, 39, 0.6)', padding: '12px', borderRadius: '8px', border: `1px solid ${audit.is_email_spoofable ? 'rgba(249, 115, 22, 0.5)' : 'rgba(16, 185, 129, 0.4)'}` }}>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600 }}>EMAIL SPOOFING DEFENSE (DMARC)</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: audit.is_email_spoofable ? '#f97316' : '#10b981', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {audit.is_email_spoofable ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            <span>{audit.is_email_spoofable ? 'SPOOFABLE (Missing DMARC)' : 'ENFORCED (Anti-Phish)'}</span>
          </div>
        </div>

        <div style={{ background: 'rgba(17, 24, 39, 0.6)', padding: '12px', borderRadius: '8px', border: `1px solid ${audit.has_hsts ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.5)'}` }}>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600 }}>HTTPS ENCRYPTION (HSTS)</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: audit.has_hsts ? '#10b981' : '#ef4444', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {audit.has_hsts ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span>{audit.has_hsts ? 'ENFORCED (Anti-SSL Strip)' : 'MISSING (MitM Risk)'}</span>
          </div>
        </div>

        <div style={{ background: 'rgba(17, 24, 39, 0.6)', padding: '12px', borderRadius: '8px', border: `1px solid ${audit.has_csp ? 'rgba(16, 185, 129, 0.4)' : 'rgba(249, 115, 22, 0.5)'}` }}>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600 }}>CONTENT SECURITY POLICY (CSP)</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: audit.has_csp ? '#10b981' : '#f97316', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {audit.has_csp ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{audit.has_csp ? 'ENFORCED (Anti-XSS)' : 'RECOMMENDED'}</span>
          </div>
        </div>
      </div>

      {/* Detailed Defensive Header Findings Table */}
      <div style={{ marginBottom: '18px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.4)', textAlign: 'left', color: '#9ca3af' }}>
              <th style={{ padding: '8px 10px' }}>Defensive Security Control</th>
              <th style={{ padding: '8px 10px' }}>Status</th>
              <th style={{ padding: '8px 10px' }}>Observed Header / Configuration</th>
              <th style={{ padding: '8px 10px' }}>Exploit Vulnerability</th>
            </tr>
          </thead>
          <tbody>
            {audit.findings.map((f, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
                <td style={{ padding: '10px', color: '#f3f4f6', fontWeight: 600 }}>{f.name}</td>
                <td style={{ padding: '10px' }}>
                  <span className={f.status === 'PASS' ? 'badge-safe' : f.status === 'WARNING' ? 'badge-high' : 'badge-critical'} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                    {f.status}
                  </span>
                </td>
                <td style={{ padding: '10px', color: '#9ca3af' }} className="mono">{f.value || 'None'}</td>
                <td style={{ padding: '10px', color: f.status === 'PASS' ? '#34d399' : '#fca5a5', maxWidth: '320px', lineHeight: 1.3 }}>
                  {f.exploit_risk}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Developer Remediation Action Plan */}
      <div style={{ background: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(75, 85, 99, 0.4)', borderRadius: '8px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem', marginBottom: '10px' }}>
          <Wrench size={16} />
          <span>Actionable Website Hardening & Fix Recommendations (For Web Developers)</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
          {(aiInsights?.remediation_recommendations || audit.remediation_steps).map((step, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#d1d5db' }}>
              <span className="mono" style={{ color: '#06b6d4', fontWeight: 700 }}>0{idx + 1}.</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
