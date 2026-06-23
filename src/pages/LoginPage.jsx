/**
 * src/pages/LoginPage.jsx
 *
 * Halaman login STRATA — Email + Password only.
 * Standalone (tanpa Layout/Sidebar).
 * Setelah login berhasil → redirect ke / (Dashboard).
 */

import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import STRATALogo from '../components/common/STRATALogo';

export default function LoginPage() {
  const { signIn, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sudah login → langsung ke dashboard
  if (!loading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setSubmitting(true);
    const { error: authError } = await signIn({ email, password });
    setSubmitting(false);

    if (authError) {
      // Pesan error yang ramah
      if (authError.message.includes('Invalid login credentials')) {
        setError('Email atau password salah. Periksa kembali dan coba lagi.');
      } else if (authError.message.includes('Email not confirmed')) {
        setError('Email belum dikonfirmasi. Periksa inbox Anda.');
      } else {
        setError(authError.message);
      }
      return;
    }

    navigate('/', { replace: true });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-hard)',
        borderRadius: '6px',
        padding: '32px',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            background: 'var(--amber-dim)',
            border: '1px solid var(--amber-edge)',
            borderRadius: '6px',
            marginBottom: '12px',
          }}>
            <Activity size={22} color="var(--amber)" />
          </div>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--ink-primary)',
            letterSpacing: '0.1em',
            marginBottom: '4px',
          }}>
            STRATA
          </div>

          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem',
            color: 'var(--ink-muted)',
            letterSpacing: '0.06em',
          }}>
            SMART TACTICAL RESOURCE & TACTICAL ANALYTICS
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'var(--border-hard)',
          marginBottom: '24px',
        }} />

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Error banner */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              background: 'var(--red-dim, rgba(239,68,68,0.1))',
              border: '1px solid var(--alert)',
              borderRadius: '4px',
              padding: '10px 12px',
            }}>
              <AlertCircle size={14} color="var(--alert)" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                color: 'var(--alert)',
                lineHeight: 1.5,
              }}>
                {error}
              </span>
            </div>
          )}

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--ink-muted)',
              letterSpacing: '0.08em',
            }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="operator@perusahaan.com"
              autoComplete="email"
              disabled={submitting}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-hard)',
                borderRadius: '4px',
                padding: '9px 12px',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.82rem',
                color: 'var(--ink-primary)',
                outline: 'none',
                transition: 'border-color 0.15s',
                opacity: submitting ? 0.6 : 1,
              }}
              onFocus={e => e.target.style.borderColor = 'var(--amber-edge)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-hard)'}
            />
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--ink-muted)',
              letterSpacing: '0.08em',
            }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={submitting}
                style={{
                  width: '100%',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-hard)',
                  borderRadius: '4px',
                  padding: '9px 40px 9px 12px',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.82rem',
                  color: 'var(--ink-primary)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                  opacity: submitting ? 0.6 : 1,
                }}
                onFocus={e => e.target.style.borderColor = 'var(--amber-edge)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-hard)'}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--ink-muted)',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: '4px',
              background: submitting ? 'var(--bg-elevated)' : 'var(--amber-dim)',
              border: '1px solid var(--amber-edge)',
              borderRadius: '4px',
              padding: '10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: submitting ? 'var(--ink-muted)' : 'var(--amber)',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s',
            }}
          >
            {submitting ? (
              <>
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '1.5px solid var(--border-hard)',
                  borderTopColor: 'var(--amber)',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                AUTHENTICATING…
              </>
            ) : 'MASUK'}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-hard)',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          color: 'var(--ink-ghost)',
          letterSpacing: '0.06em',
        }}>
          STRATA PLATFORM · AUTHORIZED PERSONNEL ONLY
        </div>
      </div>
    </div>
  );
}
