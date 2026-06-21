import { NavLink, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import {
  LayoutDashboard, Pickaxe, Truck, Map, BrainCircuit,
  Fuel, ShieldCheck, BarChart3, FileText, Settings,
  ChevronLeft, ChevronRight, Activity, ClipboardList,
} from 'lucide-react';

const navItems = [
  { to: '/',                  icon: LayoutDashboard, label: 'Dashboard',         group: 'main' },
  { to: '/operations',        icon: Pickaxe,         label: 'Operations',        group: 'main' },
  { to: '/shift-handover',    icon: ClipboardList,   label: 'Shift Handover',    group: 'main' },
  { to: '/equipment',         icon: Truck,           label: 'Equipment',         group: 'main' },
  { to: '/tactical-map',      icon: Map,             label: 'Tactical Map',      group: 'main' },
  { to: '/fuel-intelligence', icon: Fuel,            label: 'Fuel Intelligence', group: 'intel' },
  { to: '/ai-insights',       icon: BrainCircuit,    label: 'Op. Intelligence',  group: 'intel' },
  { to: '/safety-center',     icon: ShieldCheck,     label: 'Safety Center',     group: 'intel' },
  { to: '/analytics',         icon: BarChart3,       label: 'Analytics',         group: 'report' },
  { to: '/reports',           icon: FileText,        label: 'Reports',           group: 'report' },
  { to: '/settings',          icon: Settings,        label: 'Settings',          group: 'report' },
];

const groups = {
  main:   { label: 'Operations' },
  intel:  { label: 'Intelligence' },
  report: { label: 'Reporting' },
};

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  // Auto-close sidebar on mobile when navigating to a new page
  useEffect(() => {
    const isMobile = window.innerWidth < 1024; // lg breakpoint
    if (isMobile && !collapsed) {
      onToggle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const grouped = Object.keys(groups).map(key => ({
    key,
    ...groups[key],
    items: navItems.filter(n => n.group === key),
  }));

  return (
    <>
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/70 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-200 overflow-hidden strata-sidebar ${collapsed ? 'sidebar-collapsed' : 'sidebar-open'}`}
        style={{
          width: collapsed ? '52px' : '216px',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-hard)',
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center h-12 flex-shrink-0 overflow-hidden"
          style={{
            borderBottom: '1px solid var(--border-hard)',
            padding: collapsed ? '0 14px' : '0 16px',
            gap: '10px',
          }}
        >
          {/* Logo mark */}
          <div
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: '24px',
              height: '24px',
              background: 'var(--amber-dim)',
              border: '1px solid var(--amber-edge)',
              borderRadius: '4px',
            }}
          >
            <Pickaxe size={13} color="var(--amber)" />
          </div>

          {!collapsed && (
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: 'var(--ink-primary)',
                lineHeight: 1,
              }}>
                SMART MINING
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.55rem',
                letterSpacing: '0.08em',
                color: 'var(--ink-muted)',
                marginTop: '2px',
              }}>
                OPS PLATFORM v2
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {grouped.map(group => (
            <div key={group.key} className="mb-4">
              {!collapsed && (
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.55rem',
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-ghost)',
                  padding: '0 16px',
                  marginBottom: '4px',
                }}>
                  {group.label}
                </div>
              )}
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  title={collapsed ? item.label : undefined}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: collapsed ? 0 : '10px',
                    justifyContent: collapsed ? 'center' : undefined,
                    padding: collapsed ? '8px 0' : '7px 16px',
                    margin: '1px 6px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: isActive ? 'var(--amber)' : 'var(--ink-secondary)',
                    background: isActive ? 'var(--amber-dim)' : 'transparent',
                    borderLeft: isActive ? '2px solid var(--amber)' : '2px solid transparent',
                    transition: 'all 0.15s',
                  })}
                  onMouseEnter={e => {
                    if (!e.currentTarget.style.borderLeft.includes('amber') &&
                        !e.currentTarget.style.background.includes('amber')) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.color = 'var(--ink-primary)';
                    }
                  }}
                  onMouseLeave={e => {
                    const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--ink-secondary)';
                    }
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={15}
                        style={{ flexShrink: 0, color: isActive ? 'var(--amber)' : 'inherit' }}
                      />
                      {!collapsed && (
                        <span style={{ letterSpacing: '0.01em' }}>{item.label}</span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* System status */}
        {!collapsed && (
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid var(--border-hard)',
            background: 'rgba(0,0,0,0.2)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              background: 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.15)',
              borderRadius: '4px',
            }}>
              <div className="live-dot" />
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: 'var(--ok)',
                }}>
                  ALL SYSTEMS NOMINAL
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.55rem',
                  color: 'var(--ink-muted)',
                  marginTop: '1px',
                }}>
                  Kalimantan Site — Shift B
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center"
          style={{
            height: '36px',
            borderTop: '1px solid var(--border-hard)',
            background: 'transparent',
            border: 'none',
            borderTop: '1px solid var(--border-hard)',
            color: 'var(--ink-muted)',
            cursor: 'pointer',
            transition: 'color 0.15s',
            width: '100%',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--ink-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-muted)'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  );
}
