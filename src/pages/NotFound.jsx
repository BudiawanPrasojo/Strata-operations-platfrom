/**
 * NotFound.jsx — 404 catch-all route
 * Muncul ketika user mengakses URL yang tidak terdaftar di router.
 */

import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        gap: '24px',
        padding: '24px',
      }}
    >
      {/* Icon */}
      <div style={{
        width: '64px', height: '64px',
        borderRadius: '12px',
        background: 'rgba(232,96,10,0.08)',
        border: '1px solid rgba(232,96,10,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <AlertTriangle size={28} color="var(--orange)" />
      </div>

      {/* Code */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '4rem',
          fontWeight: 700,
          color: 'var(--orange)',
          lineHeight: 1,
          letterSpacing: '-0.04em',
        }}>
          404
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          letterSpacing: '0.2em',
          color: 'var(--ink-muted)',
          marginTop: '8px',
          textTransform: 'uppercase',
        }}>
          ROUTE NOT FOUND
        </div>
      </div>

      {/* Message */}
      <p style={{
        fontSize: '0.875rem',
        color: 'var(--ink-secondary)',
        textAlign: 'center',
        maxWidth: '320px',
        lineHeight: 1.6,
      }}>
        The page you're looking for doesn't exist or has been moved.
        Return to the operations dashboard.
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.05em',
            background: 'transparent',
            border: '1px solid var(--border-hard)',
            color: 'var(--ink-secondary)',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--ink-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-hard)'; e.currentTarget.style.color = 'var(--ink-secondary)'; }}
        >
          <ArrowLeft size={14} />
          Go Back
        </button>

        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.05em',
            background: 'rgba(232,96,10,0.1)',
            border: '1px solid rgba(232,96,10,0.3)',
            color: 'var(--orange)',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,96,10,0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(232,96,10,0.1)'; }}
        >
          <LayoutDashboard size={14} />
          Dashboard
        </button>
      </div>

      {/* Footer */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.55rem',
        color: 'var(--ink-ghost)',
        letterSpacing: '0.1em',
        marginTop: '8px',
      }}>
        STRATA · SMART TACTICAL RESOURCE & ANALYTICS PLATFORM
      </div>
    </div>
  );
}
