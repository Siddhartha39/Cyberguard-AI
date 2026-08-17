import React, { useState } from 'react';
import { Database, Search, ArrowRight } from 'lucide-react';
import type { CaseSummary } from '../types';

interface CaseHistoryProps {
  cases: CaseSummary[];
  onSelectCase: (caseId: string) => void;
  onSubmitFeedback: (caseId: string, verdict: string, notes?: string) => void;
}

export const CaseHistory: React.FC<CaseHistoryProps> = ({ cases, onSelectCase, onSubmitFeedback }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<string>('ALL');
  const [feedbackNotes, setFeedbackNotes] = useState<string>('');

  const filteredCases = cases.filter((c) => {
    const matchesSearch = c.canonical_domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.target_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.case_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVerdict = filterVerdict === 'ALL' || c.verdict === filterVerdict;
    return matchesSearch && matchesVerdict;
  });

  const handleFeedback = (caseId: string, verdict: string) => {
    onSubmitFeedback(caseId, verdict, feedbackNotes);
    setFeedbackNotes('');
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', margin: '0 24px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '8px', borderRadius: '8px' }}>
            <Database size={20} color="#3b82f6" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f3f4f6' }}>
              Case Repository & Analyst Feedback Loop
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
              Audited investigations, evidence traces, and human-in-the-loop labels for continuous ML calibration
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(17, 24, 39, 0.8)', border: '1px solid rgba(75, 85, 99, 0.4)', borderRadius: '6px', padding: '4px 10px' }}>
            <Search size={14} color="#9ca3af" />
            <input
              type="text"
              placeholder="Search domains/cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mono"
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f3f4f6', fontSize: '0.8rem', padding: '4px 8px' }}
            />
          </div>

          <select
            value={filterVerdict}
            onChange={(e) => setFilterVerdict(e.target.value)}
            style={{
              background: 'rgba(31, 41, 55, 0.8)',
              border: '1px solid rgba(75, 85, 99, 0.5)',
              color: '#f3f4f6',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Verdicts</option>
            <option value="PHISHING">Phishing Only</option>
            <option value="SUSPICIOUS">Suspicious Only</option>
            <option value="BENIGN">Benign Only</option>
          </select>
        </div>
      </div>

      {filteredCases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
          <Database size={32} color="#6b7280" style={{ marginBottom: '8px' }} />
          <div>No cases found matching your criteria. Execute an inspection above to log cases.</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.4)', textAlign: 'left', color: '#9ca3af' }}>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Case ID</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Domain</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Risk Score</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Verdict</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Target Brand</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Contradiction</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Analyst Feedback</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => {
                const isCritical = c.risk_score >= 70;
                const isSuspicious = c.risk_score >= 40 && c.risk_score < 70;

                let badgeClass = 'badge-safe';
                if (isCritical) badgeClass = 'badge-critical';
                else if (isSuspicious) badgeClass = 'badge-high';

                return (
                  <tr
                    key={c.case_id}
                    style={{
                      borderBottom: '1px solid rgba(75, 85, 99, 0.2)',
                      transition: 'background 0.15s'
                    }}
                  >
                    <td style={{ padding: '12px' }} className="mono">
                      <button
                        onClick={() => onSelectCase(c.case_id)}
                        style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: 600 }}
                      >
                        {c.case_id}
                      </button>
                    </td>

                    <td style={{ padding: '12px', color: '#f3f4f6', fontWeight: 600 }} className="mono">
                      {c.canonical_domain}
                    </td>

                    <td style={{ padding: '12px' }}>
                      <span className={badgeClass} style={{ padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {c.risk_score.toFixed(0)} / 100
                      </span>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <span style={{ fontWeight: 600, color: isCritical ? '#ef4444' : isSuspicious ? '#f97316' : '#10b981' }}>
                        {c.verdict}
                      </span>
                    </td>

                    <td style={{ padding: '12px', color: '#9ca3af' }}>
                      {c.matched_brand ? (
                        <span className="badge-info" style={{ padding: '2px 6px', borderRadius: '4px' }}>
                          {c.matched_brand.toUpperCase()}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td style={{ padding: '12px' }}>
                      {c.is_contradiction ? (
                        <span className="badge-critical" style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                          YES
                        </span>
                      ) : (
                        <span className="badge-safe" style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                          NO
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '12px' }}>
                      {c.analyst_verdict ? (
                        <span style={{ color: '#34d399', fontWeight: 600, fontSize: '0.75rem' }}>
                          ✓ {c.analyst_verdict}
                        </span>
                      ) : (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleFeedback(c.case_id, 'CONFIRMED_PHISHING')}
                            title="Confirm as Phishing"
                            style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '4px', color: '#f87171', padding: '2px 6px', cursor: 'pointer', fontSize: '0.7rem' }}
                          >
                            Phishing
                          </button>
                          <button
                            onClick={() => handleFeedback(c.case_id, 'BENIGN')}
                            title="Mark as Benign / False Positive"
                            style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '4px', color: '#34d399', padding: '2px 6px', cursor: 'pointer', fontSize: '0.7rem' }}
                          >
                            Benign
                          </button>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => onSelectCase(c.case_id)}
                        style={{
                          background: 'rgba(6, 182, 212, 0.15)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          borderRadius: '6px',
                          color: '#38bdf8',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>View Trace</span>
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
