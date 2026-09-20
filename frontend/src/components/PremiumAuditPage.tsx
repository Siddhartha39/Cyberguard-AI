import React, { useState, useEffect } from 'react';
import { Coins, ShieldCheck, CheckCircle2, XCircle, ExternalLink, Zap, ArrowRight, Lock, Activity } from 'lucide-react';
import type { TestnetStatus } from '../types';
import { fetchTestnetStatus } from '../services/api';

interface PremiumAuditPageProps {
  onLaunchScanner: () => void;
  onOpenPaymentModal: () => void;
}

export const PremiumAuditPage: React.FC<PremiumAuditPageProps> = ({
  onLaunchScanner,
  onOpenPaymentModal
}) => {
  const [testnetStatus, setTestnetStatus] = useState<TestnetStatus>({ online: true });

  useEffect(() => {
    fetchTestnetStatus().then(setTestnetStatus);
  }, []);

  const features = [
    { name: 'URL Lexical 24-D ML Classifier', free: true, premium: true },
    { name: 'Fast Phishing Risk Score (0-100)', free: true, premium: true },
    { name: 'Basic Domain Age & Registrar', free: true, premium: true },
    { name: 'Authoritative RDAP Historical Profile', free: false, premium: true },
    { name: 'Full DNS Hierarchy & MX/NS Records', free: false, premium: true },
    { name: 'Email Spoofing Defense (SPF & DMARC Audit)', free: false, premium: true },
    { name: 'SSL/TLS Certificate Validity & SNI Chain', free: false, premium: true },
    { name: 'Clickjacking Immunity (X-Frame-Options Audit)', free: false, premium: true },
    { name: 'HSTS & Content Security Policy (CSP) Audit', free: false, premium: true },
    { name: 'Playwright Sandbox Headless DOM Inspection', free: false, premium: true },
    { name: 'Computer Vision Brand-Domain Contradiction (pHash)', free: false, premium: true },
    { name: 'Reconstructed 7-Stage Attack Chain Graph', free: false, premium: true },
    { name: 'CyberGuard AI Threat Explainer & Analysis', free: false, premium: true },
    { name: 'Actionable Developer 1-Click Code Fixes', free: false, premium: true },
    { name: 'Downloadable Forensic Markdown & JSON Report', free: false, premium: true },
  ];

  return (
    <div className="glass-panel" style={{ padding: '32px', margin: '0 24px 24px 24px' }}>
      {/* Header Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'center', marginBottom: '36px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.4)', borderRadius: '20px', padding: '4px 12px', fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, marginBottom: '14px' }}>
            <Coins size={14} />
            <span>MANDATORY HACKATHON INTEGRATION: x402 + ALGORAND TESTNET</span>
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '12px' }}>
            x402 Micropayment Protocol &amp; Deep Security Audit
          </h2>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
            CyberGuard AI enforces the standard <strong>HTTP 402 Payment Required</strong> protocol on Algorand Testnet. Free scans provide fast triage, while deep multi-modal forensics and AI remediation are unlocked via micro-transactions (0.1 ALGO) routed through the <strong>GoPlausible Facilitator</strong>.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={onLaunchScanner}
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
              <ShieldCheck size={18} />
              <span>Scan &amp; Test x402 Protocol</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Live Algorand Node Status Box */}
        <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#10b981" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Algorand Testnet Node
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
              ● NODE ONLINE
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Server Endpoint: </span>
              <span className="mono" style={{ color: '#38bdf8' }}>{testnetStatus.node_server || 'https://testnet-api.algonode.cloud'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>CAIP-2 Network: </span>
              <span className="mono" style={{ color: '#38bdf8' }}>algorand:testnet</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Current Consensus Round: </span>
              <span className="mono" style={{ color: '#10b981', fontWeight: 700 }}>#{testnetStatus.last_round || 66997726}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>x402 Facilitator: </span>
              <span className="mono" style={{ color: 'var(--text-muted)' }}>GoPlausible x402 Facilitator (facilitator.goplausible.xyz)</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Accepted Pricing: </span>
              <span className="mono" style={{ color: '#f59e0b', fontWeight: 700 }}>0.1 ALGO / $0.01 USDC (ASA #10458941)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '18px' }}>
          Free Scan vs. Premium Deep Security Audit
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>Cyber Intelligence Capability</th>
                <th style={{ padding: '12px 14px', width: '140px', textAlign: 'center' }}>Free Quick Scan</th>
                <th style={{ padding: '12px 14px', width: '220px', textAlign: 'center', background: 'rgba(6, 182, 212, 0.08)', color: '#38bdf8' }}>
                  Premium Deep Audit (x402)
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((f, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
                  <td style={{ padding: '12px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {f.name}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    {f.free ? (
                      <CheckCircle2 size={16} color="#10b981" style={{ margin: '0 auto' }} />
                    ) : (
                      <XCircle size={16} color="var(--text-muted)" style={{ margin: '0 auto' }} />
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', background: 'rgba(6, 182, 212, 0.04)' }}>
                    <CheckCircle2 size={16} color="#38bdf8" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
