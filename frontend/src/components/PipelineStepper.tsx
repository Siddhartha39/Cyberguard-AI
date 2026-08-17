import React from 'react';
import { CheckCircle2, Loader2, CircleDot, AlertTriangle } from 'lucide-react';

export interface PipelineStep {
  id: string;
  name: string;
  detail: string;
  status: 'idle' | 'running' | 'completed' | 'warning';
}

interface PipelineStepperProps {
  steps: PipelineStep[];
  currentStepIndex: number;
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({ steps, currentStepIndex }) => {
  return (
    <div className="glass-panel" style={{ padding: '20px 24px', margin: '0 24px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Multi-Stage Intelligence Pipeline Execution
        </h3>
        <span className="mono" style={{ fontSize: '0.75rem', color: '#06b6d4' }}>
          {currentStepIndex >= 0 && currentStepIndex < steps.length
            ? `Executing Stage ${currentStepIndex + 1} of ${steps.length}`
            : currentStepIndex >= steps.length
            ? 'Pipeline Complete (All Signals Fused)'
            : 'Standby / Ready'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isRunning = step.status === 'running';
          const isWarning = step.status === 'warning';

          let borderColor = 'rgba(75, 85, 99, 0.3)';
          let bgColor = 'rgba(17, 24, 39, 0.5)';
          let icon = <CircleDot size={18} color="#6b7280" />;

          if (isCompleted) {
            borderColor = 'rgba(16, 185, 129, 0.4)';
            bgColor = 'rgba(16, 185, 129, 0.08)';
            icon = <CheckCircle2 size={18} color="#10b981" />;
          } else if (isRunning) {
            borderColor = 'rgba(6, 182, 212, 0.8)';
            bgColor = 'rgba(6, 182, 212, 0.12)';
            icon = <Loader2 size={18} color="#06b6d4" className="radar-spinner" />;
          } else if (isWarning) {
            borderColor = 'rgba(249, 115, 22, 0.5)';
            bgColor = 'rgba(249, 115, 22, 0.08)';
            icon = <AlertTriangle size={18} color="#f97316" />;
          }

          return (
            <div
              key={step.id}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                border: `1px solid ${borderColor}`,
                background: bgColor,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ marginTop: '2px' }}>{icon}</div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: isCompleted || isRunning ? '#f3f4f6' : '#9ca3af' }}>
                  {idx + 1}. {step.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: isRunning ? '#38bdf8' : '#6b7280', marginTop: '2px' }}>
                  {step.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
