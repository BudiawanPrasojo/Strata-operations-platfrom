/**
 * src/components/auth/ProtectedRoute.jsx
 *
 * Membungkus routes yang memerlukan autentikasi.
 * - loading  → spinner fullscreen
 * - no user  → redirect ke /login
 * - ada user → render children (Outlet)
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
      }}>
        {/* Spinner */}
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid var(--border-hard)',
          borderTopColor: 'var(--amber)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--ink-muted)',
          letterSpacing: '0.08em',
        }}>
          VERIFYING SESSION…
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
