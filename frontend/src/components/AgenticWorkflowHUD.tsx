import React from 'react';
import { Bot, CheckCircle2, Loader2, ShieldAlert, Cpu, Terminal, Coins, ArrowRight } from 'lucide-react';

export interface AgenticStep {
  id: string;
  stage: string;
  action: string;
  status: 'pending' | 'running' | 'completed' | 'paused_for_payment' | 'failed';
  detail?: string;
  timestamp?: string;
}

interface AgenticWorkflowHUDProps {
  currentStage: number; // 0 to 7
  targetUrl: string;
  isPaid: boolean;
  onOpenPaymentModal: () => void;
  txId?: string;
}

export const AgenticWorkflowHUD: React.FC<AgenticWorkflowHUDProps> = ({
  currentStage,
  targetUrl,
  isPaid,
  onOpenPaymentModal,
  txId
}) => {
  const steps: AgenticStep[] = [
    {
      id: 'step-1',
      stage: 'INGRESS & LEXICAL ML',
      action: 'Extracting 24-D Lexical Tensor & Shannon Entropy',
      status: currentStage > 0 ? 'completed' : currentStage === 0 ? 'running' : 'pending',
      detail: 'Evaluates URL structure, brand-in-subdomain, and character entropy in <15ms.'
    },
    {
      id: 'step-2',
      stage: 'AUTHORITATIVE RDAP & DNS',
      action: 'Querying IETF RDAP Registry & Google DoH Servers',
      status: currentStage > 1 ? 'completed' : currentStage === 1 ? 'running' : 'pending',
      detail: 'Resolves exact domain registration date, registrar name, and DNS A/NS/MX records.'
    },
    {
      id: 'step-3',
      stage: 'DECISION BOUNDARY',
      action: 'Initial Risk Calculation & Deep Audit Escalation',
      status: currentStage > 2 ? 'completed' : currentStage === 2 ? 'running' : 'pending',
      detail: 'Determines whether deep sandbox, visual logo pHash, and exploitability audit are needed.'
    },
    {
      id: 'step-4',
      stage: 'DEEP FORENSIC ESCALATION',
      action: 'Executing Zero-Cost Deep Sandbox & Vision Analysis',
      status: currentStage >= 3 ? 'completed' : 'pending',
      detail: 'Free and open-access execution: Playwright headless DOM interception and visual brand matching.'
    },
    {
      id: 'step-5',
      stage: 'ISOLATED SANDBOX & VISION',
      action: 'Executing Playwright Headless Browser & Logo pHash Matching',
      status: currentStage > 4 ? 'completed' : currentStage === 4 ? 'running' : 'pending',
      detail: 'Renders DOM in safe sandbox, intercepts form targets, and matches logos against brand catalog.'
    },
    {
      id: 'step-6',
      stage: 'SECURITY POSTURE AUDIT',
      action: 'Auditing HTTP Headers (HSTS, CSP, X-Frame) & SPF/DMARC Spoofing',
      status: currentStage > 5 ? 'completed' : currentStage === 5 ? 'running' : 'pending',
      detail: 'Calculates developer defensive grade (A+ to F) and checks clickjacking vulnerability.'
    },
    {
      id: 'step-7',
      stage: 'MULTI-SIGNAL FUSION & AI',
      action: 'Synthesizing Calibrated 0-100 Score & Threat Intelligence',
      status: currentStage >= 6 ? 'completed' : currentStage === 6 ? 'running' : 'pending',
      detail: 'Fuses all 6 vectors into calibrated risk score and generates actionable 1-click remediation.'
    }
  ];

  return (
    <div
      style={{
        background: 'rgba(10, 15, 29, 0.75)',
        border: '1px solid rgba(6, 182, 212, 0.35)',
        borderRadius: '14px',
        padding: '20px',
        margin: '0 24px 24px 24px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(6, 182, 212, 0.05)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(75, 85, 99, 0.3)', paddingBottom: '12px', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.5)', borderRadius: '10px', padding: '8px', display: 'flex' }}>
            <Bot size={22} color="#00f0ff" />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Autonomous Cyber Intelligence Agent</span>
              <span className="badge-info" style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px' }}>
                100% FREE & OPEN
              </span>
            </div>
            <div className="mono" style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
              Target: <span style={{ color: '#38bdf8' }}>{targetUrl || 'Ready for URL analysis'}</span>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '4px 10px', borderRadius: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            <span>AGENT ACTIVE &amp; UNRESTRICTED</span>
          </div>
        </div>
      </div>

      {/* Workflow Stage Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        {steps.map((step, idx) => {
          let statusBorder = 'rgba(75, 85, 99, 0.3)';
          let statusBg = 'rgba(17, 24, 39, 0.4)';
          let statusColor = '#9ca3af';
          let StatusIcon = Cpu;

          if (step.status === 'completed') {
            statusBorder = 'rgba(16, 185, 129, 0.4)';
            statusBg = 'rgba(16, 185, 129, 0.08)';
            statusColor = '#10b981';
            StatusIcon = CheckCircle2;
          } else if (step.status === 'running') {
            statusBorder = 'rgba(56, 189, 248, 0.6)';
            statusBg = 'rgba(56, 189, 248, 0.12)';
            statusColor = '#38bdf8';
            StatusIcon = Loader2;
          } else if (step.status === 'paused_for_payment') {
            statusBorder = 'rgba(245, 158, 11, 0.6)';
            statusBg = 'rgba(245, 158, 11, 0.12)';
            statusColor = '#f59e0b';
            StatusIcon = Coins;
          }

          return (
            <div
              key={step.id}
              style={{
                background: statusBg,
                border: `1px solid ${statusBorder}`,
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: statusColor, letterSpacing: '0.05em' }}>
                    STAGE {idx + 1}: {step.stage}
                  </span>
                  <StatusIcon size={14} color={statusColor} className={step.status === 'running' ? 'animate-spin' : ''} />
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '4px', lineHeight: 1.3 }}>
                  {step.action}
                </div>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#9ca3af', lineHeight: 1.4, marginTop: '6px' }}>
                {step.detail}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
