import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  User, 
  Lock, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  LogOut, 
  Cloud, 
  Sparkles, 
  RefreshCw 
} from 'lucide-react';
import { 
  signInWithGoogle, 
  signInEmailPassword, 
  registerEmailPassword, 
  firebaseSignOut 
} from '../services/firebase';
import { 
  loginUser, 
  registerUser, 
  clearStoredAuth, 
  setStoredAuth, 
  type UserProfile 
} from '../services/api';

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Google Sign-In Flow
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsGoogleLoading(true);
    try {
      const fbUser = await signInWithGoogle();
      const profile: UserProfile = {
        id: fbUser.id,
        username: fbUser.username,
        email: fbUser.email,
        photoURL: fbUser.photoURL,
        created_at: fbUser.created_at
      };
      setStoredAuth(fbUser.id, profile);
      setSuccessMsg(`Welcome, ${profile.username}! Signed in with Google.`);
      setTimeout(() => {
        onAuthSuccess(profile);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Google auth error:', err);
      // Give readable error message
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Google sign-in popup was closed before completion.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Sign-in cancelled.');
      } else if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        setErrorMsg(`Unauthorized Domain: Please add "${currentHost}" to Firebase Console > Authentication > Settings > Authorized Domains.`);
      } else {
        setErrorMsg(err.message || 'Google Sign-In failed. Please try again or use email.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Email / Password Login Flow (Firebase primary, backend fallback)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    try {
      // If identifier looks like email, try Firebase first
      const isEmail = identifier.includes('@');
      let profile: UserProfile | null = null;
      let token: string | null = null;

      if (isEmail) {
        try {
          const fbUser = await signInEmailPassword(identifier.trim(), password);
          profile = {
            id: fbUser.id,
            username: fbUser.username,
            email: fbUser.email,
            photoURL: fbUser.photoURL,
            created_at: fbUser.created_at
          };
          token = fbUser.id;
        } catch (fbErr: any) {
          console.warn('Firebase login attempt:', fbErr?.code || fbErr?.message);
          // If user exists on legacy backend, fallback to backend login
          const res = await loginUser(identifier.trim(), password);
          profile = res.user;
          token = res.token;
        }
      } else {
        // Username login via backend database
        const res = await loginUser(identifier.trim(), password);
        profile = res.user;
        token = res.token;
      }

      if (profile && token) {
        setStoredAuth(token, profile);
        setSuccessMsg(`Welcome back, ${profile.username}! Syncing cloud history.`);
        setTimeout(() => {
          onAuthSuccess(profile);
          onClose();
        }, 700);
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMsg('Invalid email or password. Please try again.');
      } else {
        setErrorMsg(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Registration Flow (Firebase Auth with backend mirror)
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
      let profile: UserProfile | null = null;
      let token: string | null = null;

      // 1. Register with Firebase Auth
      try {
        const fbUser = await registerEmailPassword(username.trim(), email.trim(), password);
        profile = {
          id: fbUser.id,
          username: fbUser.username,
          email: fbUser.email,
          photoURL: fbUser.photoURL,
          created_at: fbUser.created_at
        };
        token = fbUser.id;
      } catch (fbErr: any) {
        console.warn('Firebase registration error, attempting fallback:', fbErr);
        // Fallback to backend registration if Firebase fails
        const res = await registerUser(username.trim(), email.trim(), password);
        profile = res.user;
        token = res.token;
      }

      // Also register on local backend in background for hybrid DB sync
      registerUser(username.trim(), email.trim(), password).catch(() => {});

      if (profile && token) {
        setStoredAuth(token, profile);
        setSuccessMsg(`Account created! Welcome, ${profile.username}.`);
        setTimeout(() => {
          onAuthSuccess(profile);
          onClose();
        }, 700);
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('This email address is already registered. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
      } else {
        setErrorMsg(err.message || 'Registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await firebaseSignOut();
    } catch (e) {
      console.warn('Firebase signout error:', e);
    }
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
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.25 }}
        style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--accent-cyan)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '430px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(0,240,255,0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0, 240, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--accent-cyan)'
              }}
            >
              <Shield size={18} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                {currentUser ? 'CyberGuard Operator Profile' : 'Operator Authentication'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                Firebase Cloud Sync &amp; Access Control
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
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.username}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: '1.5px solid var(--accent-cyan)',
                    objectFit: 'cover'
                  }}
                />
              ) : (
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
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {currentUser.username}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.email}
                </div>
                <div style={{ fontSize: '0.66rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <CheckCircle2 size={11} />
                  <span>Firebase &amp; Firestore Cloud Synced</span>
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
          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Google One-Click Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '9px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#1e293b',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: (isGoogleLoading || isLoading) ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.2s'
              }}
            >
              {isGoogleLoading ? (
                <RefreshCw size={15} className="spinning" color="#1e293b" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                or with email
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            </div>

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
                  padding: '7px',
                  borderRadius: '7px',
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
                  padding: '7px',
                  borderRadius: '7px',
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
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Email or Username
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
                      placeholder="analyst@domain.com or username"
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
                    marginTop: '4px',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--accent-cyan) 0%, #3b82f6 100%)',
                    border: 'none',
                    color: '#070a10',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: isLoading ? 'default' : 'pointer',
                    boxShadow: '0 0 14px rgba(0, 240, 255, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {isLoading && <RefreshCw size={13} className="spinning" />}
                  <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Operator Handle / Username
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
                    marginTop: '4px',
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
