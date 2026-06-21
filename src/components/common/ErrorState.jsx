import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ErrorState — error display sesuai design system
 * Usage: <ErrorState message="Gagal memuat data" onRetry={refetch} />
 */
export default function ErrorState({ message = 'Terjadi kesalahan.', onRetry }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      gap: '12px',
      background: 'rgba(239,68,68,0.04)',
      border: '1px solid rgba(239,68,68,0.15)',
      borderRadius: '4px',
    }}>
      <AlertTriangle size={20} color="var(--alert)" />
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          color: 'var(--alert)',
          marginBottom: '4px',
        }}>
          DATA LOAD ERROR
        </div>
        <p style={{
          fontSize: '0.78rem',
          color: 'var(--ink-muted)',
          lineHeight: 1.5,
        }}>
          {message}
        </p>
        <p style={{
          fontSize: '0.72rem',
          color: 'var(--ink-ghost)',
          marginTop: '4px',
        }}>
          App menampilkan data offline sebagai fallback.
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            background: 'transparent',
            border: '1px solid var(--amber-edge)',
            borderRadius: '4px',
            color: 'var(--amber)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--amber-dim)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <RefreshCw size={11} />
          RETRY
        </button>
      )}
    </div>
  );
}
