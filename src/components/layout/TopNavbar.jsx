import { Search, Bell, Menu, LogOut, AlertTriangle, Fuel, Wrench, ShieldCheck, Info, CheckCheck } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { liveFeedData, aiInsights } from '../../data/mockData';

// Build initial notifications from existing mockData — no new tables, no new deps
const INITIAL_NOTIFICATIONS = [
  // High-severity liveFeed items
  ...liveFeedData
    .filter(e => e.severity === 'danger' || e.severity === 'warning')
    .slice(0, 5)
    .map(e => ({
      id: `feed-${e.id}`,
      type: e.type,
      severity: e.severity,
      message: e.message,
      timestamp: e.timestamp,
      read: false,
    })),
  // High-priority AI insights
  ...aiInsights
    .filter(i => i.severity === 'high')
    .slice(0, 3)
    .map(i => ({
      id: `insight-${i.id}`,
      type: i.type,
      severity: 'warning',
      message: i.title + ' — ' + i.description.slice(0, 60) + '…',
      timestamp: i.timestamp,
      read: false,
    })),
];

const NOTIF_STORAGE_KEY = 'strata_notif_read_ids';

function getNotifIcon(type) {
  const map = {
    anomaly: Fuel,
    fuel: Fuel,
    maintenance: Wrench,
    safety: ShieldCheck,
    ai: ShieldCheck,
  };
  return map[type] || Info;
}

function getSeverityColor(severity) {
  if (severity === 'danger') return 'var(--alert)';
  if (severity === 'warning') return 'var(--warn)';
  return 'var(--cyan)';
}

export default function TopNavbar({ onMenuToggle }) {
  const [now, setNow] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const { user, signOut } = useAuth();

  // Load previously read IDs from localStorage
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY)) || []); }
    catch { return new Set(); }
  });

  const notifRef = useRef(null);

  const notifications = INITIAL_NOTIFICATIONS.map(n => ({
    ...n,
    read: readIds.has(n.id),
  }));
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Close notif dropdown on outside click
  useEffect(() => {
    if (!showNotif) return;
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotif]);

  const markAllRead = () => {
    const allIds = INITIAL_NOTIFICATIONS.map(n => n.id);
    const newSet = new Set(allIds);
    setReadIds(newSet);
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(allIds));
  };

  const markOneRead = (id) => {
    const newSet = new Set(readIds);
    newSet.add(id);
    setReadIds(newSet);
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify([...newSet]));
  };

  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const initials = user?.email
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : 'OP';

  const handleLogout = async () => {
    setShowUserMenu(false);
    await signOut();
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 20,
      height: '48px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-hard)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      gap: '16px',
    }}>

      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onMenuToggle}
          className="lg:hidden"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', padding: '4px' }}
        >
          <Menu size={18} />
        </button>

        <div className="navbar-search" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-elevated)', border: '1px solid var(--border-hard)',
          borderRadius: '4px', padding: '5px 12px', width: '260px',
        }}>
          <Search size={12} color="var(--ink-muted)" />
          <input
            type="text"
            placeholder="Search equipment, events, sectors…"
            style={{
              background: 'none', border: 'none', outline: 'none',
              fontSize: '0.78rem', color: 'var(--ink-primary)',
              fontFamily: 'var(--font-ui)', width: '100%',
            }}
          />
          <kbd style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
            color: 'var(--ink-ghost)', background: 'var(--bg-panel)',
            border: '1px solid var(--border-hard)', borderRadius: '2px', padding: '1px 5px',
          }}>⌘K</kbd>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

        <div className="badge badge-ok" style={{ gap: '6px' }}>
          <div className="live-dot" style={{ width: '5px', height: '5px' }} />
          OPERATIONAL
        </div>

        <div className="navbar-clock" style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-secondary)',
          background: 'var(--bg-elevated)', border: '1px solid var(--border-hard)',
          borderRadius: '4px', padding: '4px 10px', letterSpacing: '0.04em',
        }}>
          {dateStr} · <span style={{ color: 'var(--ink-primary)' }}>{timeStr}</span>
        </div>

        {/* ── Notification Bell ─────────────────────────────── */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotif(v => !v); setShowUserMenu(false); }}
            style={{
              position: 'relative', background: 'var(--bg-elevated)',
              border: '1px solid var(--border-hard)', borderRadius: '4px',
              padding: '6px 8px', cursor: 'pointer', color: 'var(--ink-secondary)',
              display: 'flex', alignItems: 'center',
            }}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                minWidth: '16px', height: '16px', borderRadius: '8px',
                background: 'var(--alert)', color: '#fff',
                fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                fontWeight: 700, display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: '0 3px', lineHeight: 1,
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              zIndex: 30, width: '340px',
              background: 'var(--bg-surface)', border: '1px solid var(--border-hard)',
              borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderBottom: '1px solid var(--border-hard)',
                background: 'var(--bg-elevated)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={13} color="var(--ink-secondary)" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--ink-primary)' }}>
                    NOTIFICATIONS
                  </span>
                  {unreadCount > 0 && (
                    <span style={{
                      background: 'var(--alert)', color: '#fff', borderRadius: '3px',
                      fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 700,
                      padding: '1px 5px',
                    }}>{unreadCount} unread</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--cyan)', fontFamily: 'var(--font-mono)',
                      fontSize: '0.6rem', letterSpacing: '0.06em',
                    }}
                  >
                    <CheckCheck size={11} />
                    MARK ALL READ
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 14px', textAlign: 'center' }}>
                    <Bell size={24} color="var(--ink-ghost)" style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-ghost)', letterSpacing: '0.06em' }}>
                      NO NOTIFICATIONS
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const Icon = getNotifIcon(notif.type);
                    const color = getSeverityColor(notif.severity);
                    return (
                      <div
                        key={notif.id}
                        onClick={() => markOneRead(notif.id)}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: '10px',
                          padding: '10px 14px', cursor: 'pointer',
                          borderBottom: '1px solid var(--border-soft)',
                          background: notif.read ? 'transparent' : 'rgba(255,255,255,0.02)',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                        onMouseLeave={e => e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(255,255,255,0.02)'}
                      >
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '4px',
                          background: `${color}18`, border: `1px solid ${color}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, marginTop: '1px',
                        }}>
                          <Icon size={13} color={color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: '0.75rem', color: notif.read ? 'var(--ink-secondary)' : 'var(--ink-primary)',
                            lineHeight: 1.4, marginBottom: '3px',
                          }}>
                            {notif.message}
                          </p>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--ink-ghost)' }}>
                            {notif.timestamp}
                          </span>
                        </div>
                        {!notif.read && (
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0, marginTop: '6px' }} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && unreadCount === 0 && (
                <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-hard)', textAlign: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ink-ghost)', letterSpacing: '0.06em' }}>
                    ALL CAUGHT UP
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        {/* ── End Notification Bell ──────────────────────────── */}

        {/* User avatar + dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowUserMenu(v => !v); setShowNotif(false); }}
            title={user?.email || 'Operator'}
            style={{
              width: '28px', height: '28px', borderRadius: '4px',
              background: 'var(--amber-dim)', border: '1px solid var(--amber-edge)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
              color: 'var(--amber)', cursor: 'pointer',
            }}
          >
            {initials}
          </button>

          {showUserMenu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 29 }} onClick={() => setShowUserMenu(false)} />
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 30,
                background: 'var(--bg-surface)', border: '1px solid var(--border-hard)',
                borderRadius: '4px', minWidth: '200px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)', overflow: 'hidden',
              }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-hard)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ink-ghost)', letterSpacing: '0.06em', marginBottom: '2px' }}>
                    LOGGED IN AS
                  </div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--ink-primary)', wordBreak: 'break-all' }}>
                    {user?.email || '—'}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--alert)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                    letterSpacing: '0.06em', textAlign: 'left',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <LogOut size={13} />
                  LOGOUT
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
