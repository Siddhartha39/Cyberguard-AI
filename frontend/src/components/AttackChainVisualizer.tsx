import React, { useState } from 'react';
import { GitCommit, ArrowRight, ShieldAlert, Globe, Server, CornerDownRight, KeyRound, Radio, CheckCircle2 } from 'lucide-react';
import type { AttackChainNode } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface AttackChainVisualizerProps {
  nodes: AttackChainNode[];
}

export const AttackChainVisualizer: React.FC<AttackChainVisualizerProps> = ({ nodes }) => {
  const [selectedNode, setSelectedNode] = useState<AttackChainNode | null>(nodes.length > 0 ? nodes[0] : null);

  const getCategoryIcon = (category: string, severity: string) => {
    const color = severity === 'danger' ? '#ef4444' : severity === 'warning' ? '#f97316' : severity === 'safe' ? '#10b981' : '#38bdf8';
    switch (category) {
      case 'ingress': return <Globe size={18} color={color} />;
      case 'resolution': return <Server size={18} color={color} />;
      case 'redirect': return <CornerDownRight size={18} color={color} />;
      case 'landing': return <Radio size={18} color={color} />;
      case 'form_hook': return <KeyRound size={18} color={color} />;
      case 'exfiltration': return <GitCommit size={18} color={color} />;
      case 'verdict': return <ShieldAlert size={18} color={color} />;
      default: return <CheckCircle2 size={18} color={color} />;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', margin: '0 24px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f3f4f6' }}>
              Explainable Attack-Chain Reconstruction
            </h3>
            <InfoTooltip
              title="Attack-Chain Reconstruction"
              description="A chronological graph assembling every stage an attacker executes: from user arrival and DNS hosting to redirections, deceptive forms, and data exfiltration."
              securityImpact="Enables security analysts to understand HOW the attack works instead of relying on a blind probability score."
              goodVsBad="Click any node in the graph below to inspect the forensic telemetry collected at that stage."
            />
          </div>
          <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
            Forensic chronological path from ingress to credential exfiltration
          </p>
        </div>
        <span className="badge-info mono" style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px' }}>
          {nodes.length} Observed Forensic Stages
        </span>
      </div>

      {/* Horizontal Flow Chart / Nodes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '14px', marginBottom: '16px' }}>
        {nodes.map((node, index) => {
          const isSelected = selectedNode?.id === node.id;
          const isDanger = node.severity === 'danger';

          let border = '1px solid rgba(75, 85, 99, 0.4)';
          let bg = 'rgba(17, 24, 39, 0.7)';
          if (isSelected) {
            border = '2px solid #38bdf8';
            bg = 'rgba(6, 182, 212, 0.15)';
          } else if (isDanger) {
            border = '1px solid rgba(239, 68, 68, 0.4)';
            bg = 'rgba(239, 68, 68, 0.08)';
          }

          return (
            <React.Fragment key={node.id}>
              <div
                onClick={() => setSelectedNode(node)}
                style={{
                  minWidth: '175px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border,
                  background: bg,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getCategoryIcon(node.category, node.severity)}
                    <span className="mono" style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600 }}>
                      STEP 0{node.step_number}
                    </span>
                  </div>
                  <span
                    className={
                      node.severity === 'danger' ? 'badge-critical' : node.severity === 'warning' ? 'badge-high' : 'badge-safe'
                    }
                    style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '6px', textTransform: 'uppercase' }}
                  >
                    {node.severity}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f3f4f6', lineHeight: 1.2 }}>
                  {node.title}
                </div>
              </div>

              {index < nodes.length - 1 && (
                <ArrowRight size={18} color="#4b5563" style={{ flexShrink: 0 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Selected Node Detailed Forensic Inspector */}
      {selectedNode && (
        <div style={{
          background: 'rgba(31, 41, 55, 0.5)',
          border: '1px solid rgba(75, 85, 99, 0.4)',
          borderRadius: '10px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getCategoryIcon(selectedNode.category, selectedNode.severity)}
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f3f4f6' }}>
                Stage 0{selectedNode.step_number}: {selectedNode.title}
              </h4>
            </div>
            <span className="mono" style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              Category: {selectedNode.category.toUpperCase()}
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#d1d5db', lineHeight: 1.5 }}>
            {selectedNode.description}
          </p>

          {/* Node Metadata Inspector */}
          {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
            <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '10px 14px', borderRadius: '6px', marginTop: '4px' }}>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, marginBottom: '6px' }}>
                TELEMETRY & EVIDENCE PAYLOAD:
              </div>
              <pre className="mono" style={{ fontSize: '0.75rem', color: '#38bdf8', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {JSON.stringify(selectedNode.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
