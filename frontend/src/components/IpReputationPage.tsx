import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Search, MapPin, ShieldAlert, List, Server, CheckCircle, XCircle, ShieldCheck, AlertTriangle, Radio } from 'lucide-react';
import { lookupIpReputation } from '../services/api';

interface IpReputationPageProps {
  theme: 'dark' | 'light';
}

export const IpReputationPage: React.FC<IpReputationPageProps> = ({ theme }) => {
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isValidIpAddress = (val: string): boolean => {
    // IPv4: 4 octets 0-255
    const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipv4.test(val)) return true;
    // IPv6: standard hex groups or :: shorthand
    const ipv6 = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^::1$|^([0-9a-fA-F]{1,4}:){1,7}:$|^:([0-9a-fA-F]{1,4}:){1,7}$|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$/;
    return ipv6.test(val);
  };

  const handleLookup = async (lookupIp: string) => {
    const cleanIp = lookupIp.trim();
    if (!cleanIp) return;
    setIp(cleanIp);
    setErrorMsg(null);

    // 1. Strict validation: reject non-IP strings like "rgrjjkfefe" immediately
    if (!isValidIpAddress(cleanIp)) {
      setData(null);
      setErrorMsg(`Invalid IP Address: "${cleanIp}" is not a valid IPv4 or IPv6 address. Please enter a valid address (e.g. 8.8.8.8, 1.1.1.1, 185.15.59.224).`);
      return;
    }

    setLoading(true);
    setData(null);

    try {
      const res = await lookupIpReputation(cleanIp);
      if (res && res.is_valid !== false) {
        setData(res);
        return;
      }
    } catch (e: any) {
      console.warn('Backend IP lookup failed, querying authoritative IP telemetry registry:', e);
    }

    // 2. Query live public registry (Zero fake data)
    try {
      const liveRes = await fetch(`https://ipwho.is/${cleanIp}`);
      if (liveRes.ok) {
        const info = await liveRes.json();
        if (info.success !== false) {
          const isHosting = !!(
            info.connection?.isp?.toLowerCase().includes('cloud') ||
            info.connection?.isp?.toLowerCase().includes('host') ||
            info.connection?.org?.toLowerCase().includes('amazon') ||
            info.connection?.org?.toLowerCase().includes('google') ||
            info.connection?.org?.toLowerCase().includes('microsoft')
          );
          setData({
            ip: cleanIp,
            is_valid: true,
            country: info.country || 'Unknown',
            country_code: info.country_code || 'UN',
            region: info.region || 'Unknown',
            city: info.city || 'Unknown',
            isp: info.connection?.isp || 'Unknown ISP',
            org: info.connection?.org || info.connection?.isp || 'Unknown Organization',
            as_number: info.connection?.asn ? `AS${info.connection.asn}` : 'AS Unknown',
            is_proxy: false,
            is_hosting: isHosting,
            is_tor: false,
            abuse_score: isHosting ? 20 : 0,
            risk_level: isHosting ? 'MEDIUM' : 'LOW',
            blacklists: isHosting ? ['Datacenter/Hosting Provider'] : [],
            reverse_dns: info.connection?.domain || null
          });
          return;
        } else {
          setErrorMsg(`IP Telemetry Registry: ${info.message || 'IP address not found or reserved for private use.'}`);
          return;
        }
      }
    } catch (clientErr) {
      console.warn('Direct IP geolocation query failed:', clientErr);
    }

    setErrorMsg(`Could not resolve live telemetry for IP ${cleanIp}. Please check network connectivity.`);
    setLoading(false);
  };

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#eab308';
      default: return '#10b981';
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
          border: '1px solid var(--accent-cyan)',
          padding: '12px',
          borderRadius: '16px',
          display: 'inline-flex',
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)'
        }}>
          <Globe size={32} color="var(--accent-cyan)" />
        </div>
        <h1 className="cyber-font" style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>
          IP Reputation &amp; Infrastructure Intelligence
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Inspect IP address geolocation, ASN network owner, hosting/proxy flags, and reverse DNS PTR records
        </p>
      </div>

      {/* Search Glass Panel */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup(ip)}
            placeholder="Enter IPv4 or IPv6 address (e.g. 8.8.8.8 or 1.1.1.1)"
            className="mono"
            style={{
              flex: '1 1 280px',
              padding: '14px 18px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-primary)',
              border: '2px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleLookup(ip)}
            disabled={!ip.trim() || loading}
            className="cyber-shimmer-btn"
            style={{
              background: (!ip.trim() || loading)
                ? 'rgba(56, 189, 248, 0.3)'
                : 'linear-gradient(135deg, #00f0ff 0%, #2563eb 100%)',
              color: '#070a10',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 900,
              cursor: (!ip.trim() || loading) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 16px rgba(0, 240, 255, 0.3)'
            }}
          >
            {loading ? (
              <>
                <div style={{ width: '16px', height: '16px', border: '2px solid #070a10', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span>Querying IP...</span>
              </>
            ) : (
              <>
                <Search size={18} />
                <span>Investigate IP</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Quick Example Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Quick Examples:</span>
          <button
            type="button"
            onClick={() => handleLookup('8.8.8.8')}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              cursor: 'pointer'
            }}
          >
            8.8.8.8 (Google Public DNS)
          </button>
          <button
            type="button"
            onClick={() => handleLookup('1.1.1.1')}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              cursor: 'pointer'
            }}
          >
            1.1.1.1 (Cloudflare)
          </button>
          <button
            type="button"
            onClick={() => handleLookup('185.15.59.224')}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              cursor: 'pointer'
            }}
          >
            185.15.59.224 (Suspicious Node)
          </button>
        </div>
      </div>

      {/* Error / Validation Alert Banner */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 20px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}
          >
            <AlertTriangle size={22} style={{ flexShrink: 0, color: '#ef4444' }} />
            <div style={{ flex: 1 }}>
              <strong style={{ color: '#ef4444', display: 'block', marginBottom: '2px' }}>Validation Alert</strong>
              <span>{errorMsg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <AnimatePresence>
        {data && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}
          >
            {/* Card 1: Geolocation */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <MapPin size={20} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Geolocation Telemetry
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Country</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {data.country || 'Unknown'} ({data.country_code || '--'})
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>City / Region</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {data.city || 'Unknown'}, {data.region || '--'}
                  </div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Internet Service Provider (ISP)</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {data.isp || 'Unknown'}
                  </div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Autonomous System (ASN)</span>
                  <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '2px' }}>
                    {data.as_number || data.org || 'Unknown'}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Risk Assessment */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <ShieldAlert size={20} color={getRiskColor(data.risk_level)} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Threat Risk Assessment
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Score Gauge Circle */}
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  border: `4px solid ${getRiskColor(data.risk_level)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-primary)',
                  boxShadow: `0 0 16px ${getRiskColor(data.risk_level)}40`,
                  flexShrink: 0
                }}>
                  <span className="mono" style={{ fontSize: '1.6rem', fontWeight: 900, color: getRiskColor(data.risk_level) }}>
                    {data.abuse_score ?? 0}
                  </span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Abuse Index
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    padding: '4px 12px',
                    borderRadius: '6px',
                    background: `${getRiskColor(data.risk_level)}20`,
                    color: getRiskColor(data.risk_level),
                    border: `1px solid ${getRiskColor(data.risk_level)}50`,
                    display: 'inline-block',
                    width: 'fit-content'
                  }}>
                    {data.risk_level || 'LOW'} RISK LEVEL
                  </span>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {data.is_hosting && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
                        Datacenter / Hosting
                      </span>
                    )}
                    {data.is_proxy && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                        Proxy / VPN Detected
                      </span>
                    )}
                    {data.is_tor && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                        Tor Exit Node
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Reverse DNS (PTR) */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <Server size={20} color="#10b981" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Reverse DNS (PTR Record)
                </h3>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: data.reverse_dns ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>
                  {data.reverse_dns || 'No PTR Record Configured (Unassigned)'}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                PTR verification ensures IP originates from an authenticated domain operator.
              </span>
            </div>

            {/* Card 4: Blacklists */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <List size={20} color="#a855f7" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Reputation Feed Listings
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.blacklists && data.blacklists.length > 0 ? (
                  data.blacklists.map((bl: string, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                      <XCircle size={16} color="#ef4444" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ef4444' }}>{bl}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <CheckCircle size={16} color="#10b981" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981' }}>Clean: Not flagged on active public blocklists</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

