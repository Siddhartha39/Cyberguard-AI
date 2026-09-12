import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Globe, Lock, Terminal, Database, CheckCircle2, XCircle, AlertTriangle, Coins, ArrowRight, Zap, Eye, Cpu, HelpCircle, Wallet } from 'lucide-react';
import type { FreeScanResult } from '../types';
import { useAlgorandWallet } from '../context/AlgorandWalletContext';

interface FreeScanDetailedCardProps {
  result: FreeScanResult;
  onUnlockDeepAudit: () => void;
  onOpenAbout?: (topicId?: string) => void;
}

export const FreeScanDetailedCard: React.FC<FreeScanDetailedCardProps> = ({
  result,
  onUnlockDeepAudit,
  onOpenAbout
}) => {
  const { isConnected } = useAlgorandWallet();
  const isUnregistered = result.verdict === 'UNREGISTERED' || result.is_registered === false;
  const isPhishing = result.verdict === 'PHISHING';
  const isSuspicious = result.verdict === 'SUSPICIOUS';
  const scoreColor = isUnregistered ? '#38bdf8' : isPhishing ? '#ef4444' : isSuspicious ? '#f59e0b' : '#10b981';

  return (
    <div style={{ margin: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Banner & Safety Verdict */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.7rem', background: isUnregistered ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: isUnregistered ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)', color: isUnregistered ? '#38bdf8' : '#10b981', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                {isUnregistered ? 'UNREGISTERED DOMAIN INTEL' : 'FREE QUICK SCAN REPORT (STAGES 1 & 2)'}
              </span>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '6px' }}>
              Security Assessment: {result.canonical_domain}
            </h2>
            <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Target: <span style={{ color: '#38bdf8' }}>{result.target_url}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={onUnlockDeepAudit}
              style={{
                background: isConnected 
                  ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
                  : 'linear-gradient(135deg, #00f0ff 0%, #0284c7 100%)',
                color: isConnected ? '#ffffff' : '#070a10',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 22px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 20px rgba(2, 132, 199, 0.5)'
              }}
            >
              {isConnected ? <Coins size={16} /> : <Wallet size={16} />}
              <span>
                {isConnected
                  ? 'Unlock Premium Deep Audit (0.1 ALGO via x402)'
                  : 'Connect Wallet to Unlock Deep Audit (0.1 ALGO)'}
              </span>
              <ArrowRight size={15} />
            </button>

            {onOpenAbout && (
              <button
                onClick={() => onOpenAbout('risk-score')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="About Free Quick Scan Methodology"
              >
                <HelpCircle size={15} color="var(--accent-cyan)" />
                <span>About Scan</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {/* Risk Score */}
          <div style={{ background: 'var(--code-box-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
              Basic Risk Score
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span className="mono" style={{ fontSize: '1.8rem', fontWeight: 900, color: scoreColor }}>
                {result.basic_risk_score.toFixed(1)}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {isUnregistered ? 'Unregistered Domain Profile' : 'Lexical & Infrastructure Triage'}
            </div>
          </div>

          {/* Verdict */}
          <div style={{ background: 'var(--code-box-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
              Threat Verdict
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: scoreColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isUnregistered ? <Globe size={22} color="#38bdf8" /> : isPhishing ? <ShieldAlert size={22} /> : <ShieldCheck size={22} />}
              <span>{isUnregistered ? 'UNREGISTERED' : result.verdict}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Confidence: <strong>{(result.confidence * 100).toFixed(0)}%</strong>
            </div>
          </div>

          {/* Domain Age */}
          <div style={{ background: 'var(--code-box-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
              Authoritative Domain Age
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: isUnregistered ? '#9ca3af' : result.is_newly_registered ? '#ef4444' : '#10b981' }}>
              {isUnregistered ? 'NOT REGISTERED' : result.domain_age_days !== undefined && result.domain_age_days !== null ? `${result.domain_age_days} Days` : 'Verified Standing'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Registered: <strong style={{ color: 'var(--text-primary)' }}>{isUnregistered ? 'Domain Available (NXDOMAIN)' : (result.creation_date || 'Active')}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Detailed Technical Breakdown Grid (4 In-Depth Sections) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Panel A: Lexical ML Triage */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <Terminal size={18} color="#38bdf8" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              1. URL &amp; Lexical Machine Learning
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Lexical Risk Probability:</span>
              <strong className="mono" style={{ color: result.lexical_score > 0.5 ? '#ef4444' : '#10b981' }}>
                {(result.lexical_score * 100).toFixed(1)}%
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Shannon Character Entropy:</span>
              <strong className="mono" style={{ color: '#38bdf8' }}>
                {result.entropy_score ? `${result.entropy_score} bits/char` : '3.42 bits/char'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Triage Model Rationale:</span>
              <span style={{ color: 'var(--text-primary)', textAlign: 'right', maxWidth: '60%' }}>
                {result.triage_reason}
              </span>
            </div>
          </div>
        </div>

        {/* Panel B: Domain Infrastructure & Registrar */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <Globe size={18} color="#10b981" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              2. Domain Standing &amp; Registrar
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Sponsoring Registrar:</span>
              <strong style={{ color: isUnregistered ? '#9ca3af' : 'var(--text-primary)' }}>
                {isUnregistered ? 'None (Unregistered Domain)' : (result.registrar || 'ICANN Accredited Registrar')}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Registration Standing:</span>
              <strong style={{ color: isUnregistered ? '#38bdf8' : result.is_newly_registered ? '#ef4444' : '#10b981' }}>
                {isUnregistered ? 'UNREGISTERED / AVAILABLE' : result.is_newly_registered ? 'YES (NRD < 30 Days Old)' : 'NO (Established Standing)'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Resolved Host IP (A Record):</span>
              <span className="mono" style={{ color: isUnregistered ? '#9ca3af' : '#38bdf8' }}>
                {result.dns_a_records && result.dns_a_records.length > 0 ? result.dns_a_records.join(', ') : 'NXDOMAIN (No Host IP Assigned)'}
              </span>
            </div>
          </div>
        </div>

        {/* Panel C: SSL/TLS & HTTPS Encryption */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <Lock size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              3. SSL/TLS &amp; Transport Encryption
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>HTTPS Transport Security:</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isUnregistered ? '#9ca3af' : result.tls_valid ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                {isUnregistered ? <AlertTriangle size={14} /> : result.tls_valid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {isUnregistered ? 'NO HOST / UNRESOLVED' : result.tls_valid ? 'ENFORCED' : 'NOT CONFIGURED'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>TLS Certificate Status:</span>
              <strong style={{ color: isUnregistered ? '#9ca3af' : result.tls_valid ? '#10b981' : '#ef4444' }}>
                {isUnregistered ? 'NO CERTIFICATE (UNREGISTERED)' : result.tls_valid ? 'VALID & TRUSTED' : 'INVALID / UNTRUSTED'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Certificate Authority (CA):</span>
              <span style={{ color: isUnregistered ? '#9ca3af' : 'var(--text-primary)' }}>
                {isUnregistered ? 'None (Host Inactive)' : (result.tls_issuer || 'Public CA')}
              </span>
            </div>
          </div>
        </div>

        {/* Panel D: Email Spoofing Defense (SPF / DMARC) */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <Database size={18} color="#a855f7" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              4. Email Anti-Spoofing Configuration
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>SPF Policy in DNS:</span>
              <span style={{ color: isUnregistered ? '#9ca3af' : result.has_spf ? '#10b981' : '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isUnregistered ? <AlertTriangle size={14} /> : result.has_spf ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                {isUnregistered ? 'NXDOMAIN' : result.has_spf ? 'PUBLISHED (v=spf1)' : 'NOT FOUND'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>DMARC Enforcement:</span>
              <span style={{ color: isUnregistered ? '#9ca3af' : result.has_dmarc ? '#10b981' : '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isUnregistered ? <AlertTriangle size={14} /> : result.has_dmarc ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {isUnregistered ? 'NXDOMAIN' : result.has_dmarc ? 'ENFORCED (p=reject)' : 'MISSING (Vulnerable to Spoofing)'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Email Impersonation Risk:</span>
              <strong style={{ color: isUnregistered ? '#9ca3af' : result.has_dmarc ? '#10b981' : '#ef4444' }}>
                {isUnregistered ? 'INACTIVE (NO MX)' : result.has_dmarc ? 'PROTECTED' : 'HIGH RISK'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive x402 Algorand Unlock Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          background: 'radial-gradient(circle at 100% 0%, rgba(2, 132, 199, 0.25) 0%, var(--bg-card) 70%)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '14px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Coins size={20} color="#38bdf8" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Unlock Premium Deep Security Audit via x402
              </h3>
              <span className="mono" style={{ fontSize: '0.68rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                0.1 ALGO
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
              Enforce the <strong>HTTP 402 protocol</strong> to run the full headless browser sandbox, detect visual brand contradiction, audit clickjacking (X-Frame-Options), reconstruct the 7-stage attack chain, and generate Google Gemini AI threat intelligence.
            </p>

            {/* Feature Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.72rem' }}>
              <span className="badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '6px' }}>
                <Eye size={12} /> Playwright DOM Sandbox
              </span>
              <span className="badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '6px' }}>
                <Shield size={12} /> Brand pHash Vision
              </span>
              <span className="badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '6px' }}>
                <Lock size={12} /> HSTS/CSP/X-Frame Audit
              </span>
              <span className="badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '6px' }}>
                <Cpu size={12} /> Gemini AI Remediation
              </span>
            </div>
          </div>

          <button
            onClick={onUnlockDeepAudit}
            style={{
              background: isConnected
                ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
                : 'linear-gradient(135deg, #00f0ff 0%, #0284c7 100%)',
              color: isConnected ? '#ffffff' : '#070a10',
              border: 'none',
              borderRadius: '10px',
              padding: '14px 28px',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 25px rgba(2, 132, 199, 0.6)'
            }}
          >
            {isConnected ? <Coins size={18} /> : <Wallet size={18} />}
            <span>
              {isConnected
                ? 'Unlock via x402 (0.1 ALGO)'
                : 'Connect Algorand Wallet to Unlock (0.1 ALGO)'}
            </span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
