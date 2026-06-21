import { Activity, AlertTriangle, Wrench, Brain, Shield, TrendingUp, Truck, Database } from 'lucide-react';
import { useOperationalEvents } from '../../hooks/useOperationalEvents';
import LoadingSkeleton from '../common/LoadingSkeleton';
import ErrorState from '../common/ErrorState';
import EmptyState from '../common/EmptyState';

const typeConfig = {
  movement:    { icon: Truck,         color: 'var(--cyan)',  label: 'MOVEMENT' },
  anomaly:     { icon: AlertTriangle, color: 'var(--alert)', label: 'ANOMALY'  },
  maintenance: { icon: Wrench,        color: 'var(--amber)', label: 'MAINT'    },
  ai:          { icon: Brain,         color: '#8B5CF6',      label: 'INTEL'    },
  safety:      { icon: Shield,        color: 'var(--warn)',  label: 'SAFETY'   },
  production:  { icon: TrendingUp,    color: 'var(--ok)',    label: 'PROD'     },
};

const severityBar = {
  info:    'var(--cyan)',
  warning: 'var(--warn)',
  danger:  'var(--alert)',
  success: 'var(--ok)',
};

export default function LiveOperationalFeed() {
  const { events, loading, error, source } = useOperationalEvents();

  return (
    <div className="panel" style={{ borderRadius: '4px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-hard)',
        background: 'var(--bg-elevated)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={14} color="var(--cyan)" />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: 'var(--ink-secondary)',
          }}>
            OPERATIONAL EVENT FEED
          </span>
          {source === 'supabase'
            ? <span className="badge badge-cyan">LIVE</span>
            : <span className="badge badge-ghost">OFFLINE</span>
          }
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {source === 'supabase' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Database size={10} color="var(--ok)" />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.58rem',
                color: 'var(--ok)',
              }}>
                SUPABASE
              </span>
            </div>
          )}
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: 'var(--ink-muted)',
          }}>
            {events.length} events
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxHeight: '340px', overflowY: 'auto', padding: loading || error ? '12px' : '0' }}>
        {loading && <LoadingSkeleton rows={6} height={52} />}
        {!loading && error && (
          <ErrorState message={`Gagal memuat dari Supabase: ${error}`} />
        )}
        {!loading && !error && events.length === 0 && (
          <EmptyState
            title="Tidak ada event"
            description="Belum ada kejadian operasional tercatat."
          />
        )}
        {!loading && events.map((item, idx) => {
          const cfg = typeConfig[item.type] || typeConfig.movement;
          const Icon = cfg.icon;
          const barColor = severityBar[item.severity] || 'var(--border-hard)';

          return (
            <div
              key={item.id}
              className="hover-row"
              style={{
                display: 'flex',
                gap: '12px',
                padding: '10px 16px',
                borderBottom: '1px solid var(--border-soft)',
                borderLeft: `2px solid ${barColor}`,
                animation: 'fade-up 0.3s ease both',
                animationDelay: `${Math.min(idx * 40, 400)}ms`,
              }}
            >
              <div style={{
                flexShrink: 0,
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `${cfg.color}12`,
                border: `1px solid ${cfg.color}25`,
                borderRadius: '4px',
                marginTop: '1px',
              }}>
                <Icon size={13} color={cfg.color} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.58rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    color: cfg.color,
                  }}>
                    {cfg.label}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    color: 'var(--ink-muted)',
                  }}>
                    {item.timestamp}
                  </span>
                  {item.unit_id && (
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.58rem',
                      color: 'var(--ink-ghost)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-hard)',
                      borderRadius: '2px',
                      padding: '0 4px',
                    }}>
                      {item.unit_id}
                    </span>
                  )}
                </div>
                <p style={{
                  fontSize: '0.78rem',
                  color: 'var(--ink-secondary)',
                  lineHeight: 1.4,
                  margin: 0,
                }}>
                  {item.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
