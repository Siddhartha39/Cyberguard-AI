import React from 'react';
import { ShieldAlert, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import type { BrandMatch, DomainIntel } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface BrandContradictionCardProps {
  brand: BrandMatch;
  domainIntel: DomainIntel;
}

export const BrandContradictionCard: React.FC<BrandContradictionCardProps> = ({ brand, domainIntel }) => {
  const hasBrand = !!brand.matched_brand;
  const isContradiction = brand.is_contradiction;

  return (
    <div className="glass-panel" style={{ padding: '24px', margin: '0 24px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: isContradiction ? 'rgba(239, 68, 68, 0.15)' : (hasBrand ? 'rgba(16, 185, 129, 0.15)' : 'rgba(75, 85, 99, 0.2)'),
            padding: '8px',
            borderRadius: '8px'
          }}>
            {isContradiction ? (
              <ShieldAlert size={20} color="#ef4444" />
            ) : (
              <ShieldCheck size={20} color={hasBrand ? '#10b981' : '#9ca3af'} />
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f3f4f6' }}>
                Brand-Domain Contradiction Engine
              </h3>
              <InfoTooltip
                title="Brand-Domain Contradiction"
                description="Explicitly compares the brand identity implied by page visuals, logos, and trademarks against the actual hosting domain owner."
                securityImpact="If a page looks like PayPal or Microsoft but is hosted on an unauthorized lookalike domain, it is a high-confidence phishing attack."
                goodVsBad="Consistent = Legitimately operated by the brand. Mismatch = Critical Phishing Impersonation."
              />
            </div>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
              Verifying claimed brand visual & semantic identity vs actual domain ownership
            </p>
          </div>
        </div>

        {isContradiction ? (
          <span className="badge-critical mono" style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
            CRITICAL CONTRADICTION DETECTED
          </span>
        ) : hasBrand ? (
          <span className="badge-safe mono" style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
            AUTHENTIC BRAND DOMAIN
          </span>
        ) : (
          <span className="badge-info mono" style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
            GENERIC / UNBRANDED DOMAIN
          </span>
        )}
      </div>

      {/* Side-by-Side Identity Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
        {/* Left: Claimed Brand Profile */}
        <div style={{ background: 'rgba(17, 24, 39, 0.6)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(75, 85, 99, 0.3)' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>
            Visual & Content Claimed Identity
          </div>
          {hasBrand ? (
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>
                {brand.brand_display_name}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '8px' }}>
                Official Domain: <span className="mono" style={{ color: '#10b981' }}>{brand.brand_official_domain}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
                <span className="badge-info" style={{ padding: '2px 8px', borderRadius: '6px' }}>
                  Visual Lookalike: {(brand.visual_similarity * 100).toFixed(0)}%
                </span>
                <span className="badge-info" style={{ padding: '2px 8px', borderRadius: '6px' }}>
                  Text Cues: {(brand.text_cue_similarity * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: '#6b7280', padding: '12px 0' }}>
              No high-confidence target brand imitation detected.
            </div>
          )}
        </div>

        {/* Center: Contradiction Bridge Indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <ArrowRight size={24} color={isContradiction ? '#ef4444' : '#10b981'} />
          <span style={{ fontSize: '0.65rem', color: isContradiction ? '#ef4444' : '#10b981', fontWeight: 700 }}>
            {isContradiction ? 'MISMATCH' : 'CONSISTENT'}
          </span>
        </div>

        {/* Right: Actual Hosting Domain */}
        <div style={{ background: 'rgba(17, 24, 39, 0.6)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(75, 85, 99, 0.3)' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>
            Actual Infrastructure Origin
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '4px' }} className="mono">
            {domainIntel.registrable_domain}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '8px' }}>
            Domain Age: <strong style={{ color: domainIntel.is_newly_registered ? '#ef4444' : '#10b981' }}>{domainIntel.domain_age_days} days</strong>
            {domainIntel.is_newly_registered && <span style={{ color: '#ef4444' }}> (Newly Registered Domain)</span>}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Registrar: {domainIntel.registrar || 'Public Registrar'} | TLD: .{domainIntel.tld}
          </div>
        </div>
      </div>

      {/* Rationale Explanation Box */}
      {isContradiction && brand.contradiction_explanation && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          borderLeft: '4px solid #ef4444',
          borderRadius: '6px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <AlertTriangle size={18} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fca5a5', marginBottom: '2px' }}>
              Explainable Contradiction Finding:
            </div>
            <div style={{ fontSize: '0.82rem', color: '#fecaca', lineHeight: 1.4 }}>
              {brand.contradiction_explanation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
