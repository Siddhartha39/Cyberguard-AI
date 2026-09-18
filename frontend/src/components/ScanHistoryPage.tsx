import React, { useState } from 'react';
import { History, FileText, ExternalLink, ShieldAlert, CheckCircle, AlertTriangle, Coins, ArrowRight, Download, Search, Filter, ArrowUpDown, Maximize2, X } from 'lucide-react';
import type { CaseSummary } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ScanHistoryPageProps {
  cases: CaseSummary[];
  onSelectCase: (caseId: string) => void;
  onLaunchScanner: () => void;
}

export const ScanHistoryPage: React.FC<ScanHistoryPageProps> = ({
  cases,
  onSelectCase,
  onLaunchScanner
}) => {
  const [search, setSearch] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<string>('All');
  const [sortNewest, setSortNewest] = useState(true);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const toggleCompare = (caseId: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(caseId)) return prev.filter(id => id !== caseId);
      if (prev.length >= 2) return [prev[1], caseId]; // Keep max 2
      return [...prev, caseId];
    });
  };

  const filteredAndSortedCases = cases
    .filter(c => c.canonical_domain.toLowerCase().includes(search.toLowerCase()) || c.target_url.toLowerCase().includes(search.toLowerCase()))
    .filter(c => verdictFilter === 'All' || c.verdict === verdictFilter)
    .sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortNewest ? timeB - timeA : timeA - timeB;
    });

  const getVerdictColor = (verdict: string) => {
    switch(verdict) {
      case 'PHISHING': return '#ef4444';
      case 'SUSPICIOUS': return '#f59e0b';
      case 'BENIGN': return '#10b981';
      case 'UNREGISTERED': return '#3b82f6';
      default: return 'var(--text-secondary)';
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch(verdict) {
      case 'PHISHING': return <span className="badge-critical px-2 py-1 rounded text-xs font-bold border">PHISHING</span>;
      case 'SUSPICIOUS': return <span className="badge-medium px-2 py-1 rounded text-xs font-bold border">SUSPICIOUS</span>;
      case 'BENIGN': return <span className="badge-safe px-2 py-1 rounded text-xs font-bold border">SAFE</span>;
      case 'UNREGISTERED': return <span className="badge-info px-2 py-1 rounded text-xs font-bold border">UNREGISTERED</span>;
      default: return <span className="badge-info px-2 py-1 rounded text-xs font-bold border">{verdict}</span>;
    }
  };

  const compareCases = selectedForCompare.map(id => cases.find(c => c.case_id === id)).filter(Boolean) as CaseSummary[];

  return (
    <div className="glass-panel" style={{ padding: '28px', margin: '0 24px 24px 24px', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.5)', padding: '8px', borderRadius: '10px', color: '#38bdf8' }}>
            <History size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Security Reports &amp; Scan History</span>
              <span className="badge-info" style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px' }}>
                {cases.length} AUDITS LOGGED
              </span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Historical website security assessments, phishing risk evaluations, and verified Algorand Testnet transactions.
            </p>
          </div>
        </div>

        <button
          onClick={onLaunchScanner}
          className="cyber-shimmer-btn"
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 15px rgba(2, 132, 199, 0.4)'
          }}
        >
          <span>Run New Scan</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Filters and Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Filter by target domain..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mono"
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Verdict Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={14} color="var(--text-secondary)" />
          {['All', 'PHISHING', 'SUSPICIOUS', 'BENIGN', 'UNREGISTERED'].map(v => {
            const isSelected = verdictFilter === v;
            return (
              <button 
                key={v}
                onClick={() => setVerdictFilter(v)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                  background: isSelected ? 'rgba(0, 240, 255, 0.15)' : 'var(--bg-primary)',
                  color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                {v}
              </button>
            );
          })}
        </div>

        <button 
          onClick={() => setSortNewest(!sortNewest)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <ArrowUpDown size={14} />
          <span>{sortNewest ? 'Newest First' : 'Oldest First'}</span>
        </button>
      </div>

      {/* Comparison Drawer */}
      <AnimatePresence>
        {compareCases.length === 2 && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            style={{
              marginBottom: '28px',
              padding: '24px',
              background: 'var(--bg-primary)',
              border: '2px solid var(--accent-cyan)',
              borderRadius: '16px',
              boxShadow: '0 0 24px rgba(0, 240, 255, 0.2)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setSelectedForCompare([])}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Maximize2 size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Side-by-Side Target Domain Comparison
              </h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {compareCases.map((c) => (
                <div key={c.case_id} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {c.canonical_domain}
                    </div>
                    {getVerdictBadge(c.verdict)}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Risk Score:</span>
                    <span className="mono" style={{ fontWeight: 800, color: getVerdictColor(c.verdict) }}>{c.risk_score.toFixed(1)} / 100</span>
                    
                    <span style={{ color: 'var(--text-secondary)' }}>Security Grade:</span>
                    <span className="mono" style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>{c.security_grade || 'N/A'}</span>
                    
                    <span style={{ color: 'var(--text-secondary)' }}>Audited Date:</span>
                    <span className="mono">{new Date(c.created_at).toLocaleDateString()}</span>
                    
                    <span style={{ color: 'var(--text-secondary)' }}>Deep Forensic Audit:</span>
                    <span style={{ color: c.is_premium ? 'var(--accent-green)' : 'var(--text-secondary)', fontWeight: 700 }}>
                      {c.is_premium ? 'Completed (Deep)' : 'Standard Triage'}
                    </span>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectCase(c.case_id)}
                    style={{
                      marginTop: 'auto',
                      padding: '10px',
                      background: 'rgba(0, 240, 255, 0.12)',
                      border: '1px solid var(--accent-cyan)',
                      color: 'var(--accent-cyan)',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Inspect Full Dossier
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of Cases */}
      {filteredAndSortedCases.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <AnimatePresence>
            {filteredAndSortedCases.map((c) => {
              const isSelected = selectedForCompare.includes(c.case_id);
              const isPhish = c.verdict === 'PHISHING';
              const isSusp = c.verdict === 'SUSPICIOUS';
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  key={c.case_id}
                  className="glass-panel cyber-card-hover"
                  style={{
                    padding: '18px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                    boxShadow: isSelected ? '0 0 16px rgba(0, 240, 255, 0.3)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }} title={c.canonical_domain}>
                      {c.canonical_domain}
                    </span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCompare(c.case_id)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>Compare</span>
                    </label>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {getVerdictBadge(c.verdict)}
                    <span className="mono" style={{ fontSize: '1.2rem', fontWeight: 900, color: getVerdictColor(c.verdict) }}>
                      {c.risk_score.toFixed(1)}
                    </span>
                  </div>
                  
                  {/* Score Meter Bar */}
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <div style={{ width: `${Math.min(100, Math.max(0, c.risk_score))}%`, height: '100%', backgroundColor: getVerdictColor(c.verdict), borderRadius: '999px' }} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Date:</span>
                      <span className="mono">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Security Grade:</span>
                      <span className="mono" style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>{c.security_grade || 'N/A'}</span>
                    </div>
                    {c.tx_id && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}><Coins size={12} /> TX:</span>
                        <a href={`https://lora.algokit.io/testnet/transaction/${c.tx_id}`} target="_blank" rel="noreferrer" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
                          <span className="mono">{c.tx_id.slice(0, 8)}...</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectCase(c.case_id)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--accent-cyan)',
                      cursor: 'pointer',
                      marginTop: '4px'
                    }}
                  >
                    View Details
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
          <History size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
          <p>No historical security scans match your filters.</p>
        </div>
      )}
    </div>
  );
};

