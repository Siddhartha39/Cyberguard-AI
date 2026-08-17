import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Bot, Wrench, Lock, Copy, Check, Code } from 'lucide-react';
import type { SecurityPostureAudit, GeminiAIInsight } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface SecurityPostureCardProps {
  audit?: SecurityPostureAudit;
  aiInsights?: GeminiAIInsight;
  domain: string;
}

export const SecurityPostureCard: React.FC<SecurityPostureCardProps> = ({ audit, aiInsights, domain }) => {
  const [selectedSnippetTab, setSelectedSnippetTab] = useState<'nginx' | 'apache' | 'nextjs' | 'dns' | 'node'>('nginx');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!audit) return null;

  const isGradeGood = ['A+', 'A', 'B'].includes(audit.security_grade);
  const gradeColor = audit.security_grade === 'A+' ? '#10b981' : audit.security_grade === 'B' ? '#38bdf8' : audit.security_grade === 'C' ? '#f59e0b' : '#ef4444';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Code snippets tailored for the scanned domain
  const snippets = {
    nginx: `# Nginx Web Server Hardening Config (Place inside server { ... } block)
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self' https: data:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; object-src 'none';" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;`,

    apache: `# Apache Web Server (.htaccess or httpd.conf)
<IfModule mod_headers.c>
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  Header always set Content-Security-Policy "default-src 'self' https: data:; script-src 'self' 'unsafe-inline' https:; object-src 'none';"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>`,

    nextjs: `// Next.js (next.config.js) Security Headers Configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "default-src 'self' https:; script-src 'self' 'unsafe-inline' https:; object-src 'none';" }
        ]
      }
    ];
  }
};
module.exports = nextConfig;`,

    dns: `# DNS TXT Anti-Email Spoofing Configuration for ${domain}
# 1. SPF Record (Prevents forged email delivery):
Type: TXT | Host: @ (or ${domain})
Value: v=spf1 include:_spf.mx.cloudflare.net ~all

# 2. DMARC Policy (Instructs receiving mail servers to reject unauthorized spoofers):
Type: TXT | Host: _dmarc
Value: v=DMARC1; p=reject; rua=mailto:security-reports@${domain}; pct=100`,

    node: `// Node.js & Express Security Middleware (Helmet)
const express = require('express');
const helmet = require('helmet');

const app = express();

// Automatically configures HSTS, X-Frame-Options, CSP, and X-Content-Type-Options
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
      objectSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));`
  };

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
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Website Security Posture &amp; Exploitability Audit
              </h3>
              <InfoTooltip
                title="Website Security Posture Audit"
                description="Evaluates your web server's defensive headers, clickjacking immunity, and email domain anti-spoofing configurations."
                securityImpact="Websites with missing headers can be framed in invisible clickjacking traps or have their email domain forged by attackers."
                goodVsBad="A Grade 'A+' means hardened against common web exploits. Grades 'C' or 'F' mean easily exploitable."
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Deep vulnerability analysis &amp; hacker-perspective remediation for <strong>{domain}</strong>
            </p>
          </div>
        </div>

        {/* Grade Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-secondary)', padding: '6px 16px', borderRadius: '12px', border: `1px solid ${gradeColor}` }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>SECURITY GRADE</div>
            <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>{audit.score_percentage}% Pass Rate</div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: gradeColor }} className="mono">
            {audit.security_grade}
          </div>
        </div>
      </div>

      {/* Gemini AI Penetration Testing & Threat Assessment */}
      {aiInsights && (
        <div style={{
          background: 'var(--hero-bg)',
          border: '1px solid var(--border-focus)',
          borderRadius: '10px',
          padding: '16px 18px',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Bot size={18} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>
              GEMINI AI THREAT &amp; EXPLOITABILITY AUDIT
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', fontSize: '0.82rem' }}>
            <div style={{ background: 'var(--code-box-bg)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--accent-cyan)' }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                🛡️ Threat &amp; Trust Analysis
              </div>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.45 }}>
                {aiInsights.threat_intel_analysis}
              </p>
            </div>

            <div style={{ background: 'var(--code-box-bg)', padding: '12px', borderRadius: '8px', borderLeft: `3px solid ${audit.is_clickjackable || audit.is_email_spoofable ? 'var(--threat-critical)' : 'var(--threat-safe)'}` }}>
              <div style={{ fontWeight: 700, color: audit.is_clickjackable || audit.is_email_spoofable ? 'var(--threat-critical)' : 'var(--threat-safe)', marginBottom: '4px' }}>
                ⚡ Hacker / Penetration Tester Assessment
              </div>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.45 }}>
                {aiInsights.hacker_perspective_audit}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Exploitability Indicator Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: `1px solid ${audit.is_clickjackable ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.4)'}` }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CLICKJACKING IMMUNITY</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: audit.is_clickjackable ? 'var(--threat-critical)' : 'var(--threat-safe)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {audit.is_clickjackable ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{audit.is_clickjackable ? 'VULNERABLE (Easily Framed)' : 'PROTECTED (Anti-iFrame)'}</span>
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: `1px solid ${audit.is_email_spoofable ? 'rgba(249, 115, 22, 0.5)' : 'rgba(16, 185, 129, 0.4)'}` }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>EMAIL SPOOFING DEFENSE (DMARC)</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: audit.is_email_spoofable ? 'var(--threat-high)' : 'var(--threat-safe)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {audit.is_email_spoofable ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            <span>{audit.is_email_spoofable ? 'SPOOFABLE (Missing DMARC)' : 'ENFORCED (Anti-Phish)'}</span>
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: `1px solid ${audit.has_hsts ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.5)'}` }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>HTTPS ENCRYPTION (HSTS)</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: audit.has_hsts ? 'var(--threat-safe)' : 'var(--threat-critical)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {audit.has_hsts ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span>{audit.has_hsts ? 'ENFORCED (Anti-SSL Strip)' : 'MISSING (MitM Risk)'}</span>
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: `1px solid ${audit.has_csp ? 'rgba(16, 185, 129, 0.4)' : 'rgba(249, 115, 22, 0.5)'}` }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CONTENT SECURITY POLICY (CSP)</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: audit.has_csp ? 'var(--threat-safe)' : 'var(--threat-high)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {audit.has_csp ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{audit.has_csp ? 'ENFORCED (Anti-XSS)' : 'RECOMMENDED'}</span>
          </div>
        </div>
      </div>

      {/* Detailed Defensive Header Findings Table */}
      <div style={{ marginBottom: '22px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '8px 10px' }}>Defensive Security Control</th>
              <th style={{ padding: '8px 10px' }}>Status</th>
              <th style={{ padding: '8px 10px' }}>Observed Header / Configuration</th>
              <th style={{ padding: '8px 10px' }}>Exploit Vulnerability</th>
            </tr>
          </thead>
          <tbody>
            {audit.findings.map((f, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px', color: 'var(--text-primary)', fontWeight: 600 }}>{f.name}</td>
                <td style={{ padding: '10px' }}>
                  <span className={f.status === 'PASS' ? 'badge-safe' : f.status === 'WARNING' ? 'badge-high' : 'badge-critical'} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                    {f.status}
                  </span>
                </td>
                <td style={{ padding: '10px', color: 'var(--text-secondary)' }} className="mono">{f.value || 'None'}</td>
                <td style={{ padding: '10px', color: f.status === 'PASS' ? 'var(--threat-safe)' : 'var(--threat-critical)', maxWidth: '320px', lineHeight: 1.3 }}>
                  {f.exploit_risk}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actionable Website Hardening & Fix Recommendations */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontWeight: 800, fontSize: '0.92rem' }}>
            <Wrench size={18} />
            <span>ACTIONABLE REMEDIATION ROADMAP FOR WEBSITE OWNERS</span>
          </div>

          <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Target: <strong>{domain}</strong>
          </span>
        </div>

        {/* Priority 1 & Priority 2 Action Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {(aiInsights?.remediation_recommendations || audit.remediation_steps).map((step, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                background: 'var(--code-box-bg)',
                padding: '10px 14px',
                borderRadius: '8px',
                borderLeft: `4px solid ${idx === 0 ? 'var(--threat-critical)' : idx === 1 ? 'var(--threat-high)' : 'var(--accent-cyan)'}`
              }}
            >
              <div style={{
                background: idx === 0 ? 'var(--threat-critical)' : 'var(--accent-cyan)',
                color: '#070a10',
                fontWeight: 900,
                fontSize: '0.68rem',
                borderRadius: '4px',
                padding: '2px 6px',
                marginTop: '1px'
              }}>
                STEP {idx + 1}
              </div>
              <div style={{ flex: 1, fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 1-Click Copy Developer Code Snippets & Hardening Patch Generator */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-focus)', borderRadius: '12px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontWeight: 800, fontSize: '0.92rem' }}>
            <Code size={18} />
            <span>1-CLICK DEVELOPER FIX SNIPPETS (COPY-PASTE)</span>
            <InfoTooltip
              title="Developer Fix Snippets"
              description="Copy-paste security configuration blocks for your web server (Nginx, Apache, Next.js, Cloudflare, Node.js) to resolve all flagged vulnerabilities."
              position="bottom"
            />
          </div>

          {/* Snippet Technology Selector */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--code-box-bg)', padding: '3px', borderRadius: '8px' }}>
            {[
              { id: 'nginx', label: 'Nginx' },
              { id: 'apache', label: 'Apache' },
              { id: 'nextjs', label: 'Next.js / Vercel' },
              { id: 'dns', label: 'DNS (SPF/DMARC)' },
              { id: 'node', label: 'Node.js Express' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedSnippetTab(tab.id as any)}
                style={{
                  background: selectedSnippetTab === tab.id ? 'var(--accent-cyan)' : 'transparent',
                  color: selectedSnippetTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Code Box */}
        <div style={{ position: 'relative' }}>
          <pre
            className="mono"
            style={{
              background: 'var(--code-box-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '0.78rem',
              color: 'var(--text-primary)',
              overflowX: 'auto',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap'
            }}
          >
            {snippets[selectedSnippetTab]}
          </pre>

          <button
            onClick={() => handleCopy(snippets[selectedSnippetTab], selectedSnippetTab)}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: copiedKey === selectedSnippetTab ? 'var(--accent-green)' : 'var(--bg-card)',
              color: copiedKey === selectedSnippetTab ? '#ffffff' : 'var(--accent-cyan)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--panel-shadow)'
            }}
          >
            {copiedKey === selectedSnippetTab ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedKey === selectedSnippetTab ? 'COPIED!' : 'COPY FIX'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
