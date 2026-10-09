import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Lock, Mail, CheckCircle2, AlertCircle, X, LogOut, Cloud, Sparkles, RefreshCw } from 'lucide-react';
import { loginUser, registerUser, clearStoredAuth, getStoredUser, type UserProfile } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onAuthSuccess: (user: UserProfile | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMsg('Please enter your username/email and password.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await loginUser(identifier.trim(), password);
      setSuccessMsg(`Welcome back, ${res.user.username}! Syncing cloud history.`);
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) {
      setErrorMsg('Please fill in all registration fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await registerUser(username.trim(), email.trim(), password);
      setSuccessMsg(`Account created! Welcome, ${res.user.username}.`);
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    clearStoredAuth();
    onAuthSuccess(null);
    setSuccessMsg('Signed out successfully.');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(7, 10, 16, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 100010,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--accent-cyan)',
          borderRadius: '18px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 25px rgba(0, 240, 255, 0.25)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
                padding: '7px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(0, 240, 255, 0.4)'
              }}
            >
              <Shield size={20} color="#070a10" strokeWidth={2.5} />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '0.02em' }}>
                {currentUser ? 'CYBERGUARD ACCOUNT' : 'SIGN IN & CLOUD SYNC'}
              </h2>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Cloud size={11} color="var(--accent-cyan)" />
                <span>Access your threat audits and chats from anywhere</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Logged In View */}
        {currentUser ? (
          <div style={{ padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                background: 'var(--code-box-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00f0ff 0%, #818cf8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#070a10',
                  fontWeight: 900,
                  fontSize: '1.1rem'
                }}
              >
                {currentUser.username.substring(0, 1).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {currentUser.username}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.email}
                </div>
                <div style={{ fontSize: '0.66rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <CheckCircle2 size={11} />
                  <span>Cloud Sync Active (Chats &amp; Audits preserved)</span>
                </div>
              </div>
            </div>

            {successMsg && (
              <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '8px', color: '#10b981', fontSize: '0.74rem' }}>
                {successMsg}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '8px',
                  background: 'var(--code-box-bg)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Tab Switcher */}
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '3px'
              }}
            >
              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMsg(null); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: tab === 'login' ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)' : 'transparent',
                  color: tab === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: tab === 'login' ? 800 : 600,
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setErrorMsg(null); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: tab === 'register' ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)' : 'transparent',
                  color: tab === 'register' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: tab === 'register' ? 800 : 600,
                  cursor: 'pointer'
                }}
              >
                Create Account
              </button>
            </div>

            {errorMsg && (
              <div
                style={{
                  padding: '8px 12px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  padding: '8px 12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '8px',
                  color: '#10b981',
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Username or Email
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  >
                    <User size={14} color="var(--text-secondary)" />
                    <input
                      type="text"
                      placeholder="e.g. analyst or you@company.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Password
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  >
                    <Lock size={14} color="var(--text-secondary)" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    marginTop: '6px',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--accent-cyan) 0%, #3b82f6 100%)',
                    border: 'none',
                    color: '#070a10',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: isLoading ? 'default' : 'pointer',
                    boxShadow: '0 0 14px rgba(0, 240, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {isLoading && <RefreshCw size={13} className="spinning" />}
                  <span>{isLoading ? 'Signing In...' : 'Sign In & Sync'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Choose Username
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  >
                    <User size={14} color="var(--text-secondary)" />
                    <input
                      type="text"
                      placeholder="e.g. cyber_analyst"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Email Address
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  >
                    <Mail size={14} color="var(--text-secondary)" />
                    <input
                      type="email"
                      placeholder="analyst@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Password (min. 6 characters)
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  >
                    <Lock size={14} color="var(--text-secondary)" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    marginTop: '6px',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--accent-cyan) 0%, #3b82f6 100%)',
                    border: 'none',
                    color: '#070a10',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: isLoading ? 'default' : 'pointer',
                    boxShadow: '0 0 14px rgba(0, 240, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {isLoading && <RefreshCw size={13} className="spinning" />}
                  <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
