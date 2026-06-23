/**
 * KPIThresholdAlertPanel.jsx
 *
 * Displays active KPI threshold alerts derived from operational data.
 *
 * Data sources (existing hooks, no new tables):
 *   - useEquipment      → equipment health threshold
 *   - useFuel           → fuel anomaly status
 *   - useSafety         → safety incident severity
 *   - useOperationalEvents → critical operational events
 *
 * Tidak ada hook baru. Tidak ada tabel baru.
 * Threshold bersifat deterministik dan transparan.
 */

import { useMemo } from 'react';
import {
  Bell, BellOff, Zap, AlertTriangle, AlertCircle,
  Truck, Fuel, ShieldAlert, Radio,
} from 'lucide-react';
import { useEquipment }          from '../../hooks/useEquipment';
import { useFuel }               from '../../hooks/useFuel';
import { useSafety }             from '../../hooks/useSafety';
import { useOperationalEvents }  from '../../hooks/useOperationalEvents';
import LoadingSkeleton           from '../common/LoadingSkeleton';
import ErrorState                from '../common/ErrorState';
import { evaluateThresholds }    from '../../utils/thresholds';

// ── Severity config (consistent with TacticalAlertCenter design system) ──────
const SEV = {
  CRITICAL: {
    color:  '#ef4444',
    bg:     'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.28)',
    badge:  'badge-alert',
    icon:   Zap,
    rank:   3,
  },
  HIGH: {
    color:  '#f97316',
    bg:     'rgba(249,115,22,0.07)',
    border: 'rgba(249,115,22,0.25)',
    badge:  'badge-warn',
    icon:   AlertTriangle,
    rank:   2,
  },
  MEDIUM: {
    color:  '#f59e0b',
    bg:     'rgba(245,158,11,0.07)',
    border: 'rgba(245,158,11,0.22)',
    badge:  'badge-warn',
    icon:   AlertCircle,
    rank:   1,
  },
};

// ── Source category tags ──────────────────────────────────────────────────────
const SOURCE_TAG = {
  equipment: { label: 'EQUIPMENT', color: 'var(--cyan)' },
  fuel:      { label: 'FUEL',      color: 'var(--amber)' },
  safety:    { label: 'SAFETY',    color: 'var(--alert)' },
  ops:       { label: 'OPS EVENT', color: '#f97316'       },
};

// ── Single alert row ──────────────────────────────────────────────────────────
function AlertRow({ alert }) {
  const cfg    = SEV[alert.severity] ?? SEV.MEDIUM;
  const Icon   = alert.icon ?? cfg.icon;
  const srcCfg = SOURCE_TAG[alert.source] ?? SOURCE_TAG.ops;

  return (
    <div style={{
      display:     'flex',
      alignItems:  'flex-start',
      gap:         '10px',
      padding:     '10px 12px',
      background:  cfg.bg,
      border:      `1px solid ${cfg.border}`,
      borderLeft:  `3px solid ${cfg.color}`,
      borderRadius:'4px',
    }}>
      {/* Icon */}
      <div style={{
        padding:     '5px',
        background:  `${cfg.color}14`,
        border:      `1px solid ${cfg.color}28`,
        borderRadius:'4px',
        flexShrink:  0,
        marginTop:   '1px',
      }}>
        <Icon size={12} color={cfg.color} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title row */}
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '6px',
          marginBottom: '3px',
          flexWrap:   'wrap',
        }}>
          <span style={{
            fontSize:   '0.76rem',
            fontWeight: 600,
            color:      'var(--ink-primary)',
            lineHeight: 1.3,
            flex:       1,
            minWidth:   0,
            overflow:   'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {alert.title}
          </span>
          <span className={`badge ${cfg.badge}`} style={{ fontSize: '0.52rem', flexShrink: 0 }}>
            {alert.severity}
          </span>
        </div>

        {/* Detail */}
        <p style={{
          fontSize:  '0.7rem',
          color:     'var(--ink-secondary)',
          lineHeight: 1.5,
          margin:    0,
          marginBottom: '5px',
        }}>
          {alert.detail}
        </p>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily:     'var(--font-mono)',
            fontSize:       '0.55rem',
            letterSpacing:  '0.08em',
            color:          srcCfg.color,
            background:     `${srcCfg.color}12`,
            border:         `1px solid ${srcCfg.color}22`,
            padding:        '1px 6px',
            borderRadius:   '2px',
          }}>
            {srcCfg.label}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize:   '0.58rem',
            color:      'var(--ink-muted)',
            overflow:   'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {alert.meta}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Healthy state ─────────────────────────────────────────────────────────────
function HealthyState() {
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '36px 20px',
      gap:            '12px',
      textAlign:      'center',
    }}>
      <div style={{
        padding:    '14px',
        background: 'rgba(34,197,94,0.08)',
        border:     '1px solid rgba(34,197,94,0.18)',
        borderRadius: '50%',
      }}>
        <BellOff size={22} color="var(--ok)" strokeWidth={1.5} />
      </div>
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink-secondary)', marginBottom: '6px' }}>
          All KPIs Within Thresholds
        </div>
        <p style={{
          fontSize:  '0.72rem',
          color:     'var(--ink-muted)',
          lineHeight: 1.6,
          maxWidth:  '260px',
          margin:    '0 auto',
        }}>
          Equipment health, fuel efficiency, safety incidents, and operational events are all operating within normal parameters.
        </p>
      </div>
      <div style={{
        display:    'flex',
        alignItems: 'center',
        gap:        '6px',
        padding:    '5px 12px',
        background: 'rgba(34,197,94,0.05)',
        border:     '1px solid rgba(34,197,94,0.14)',
        borderRadius:'4px',
      }}>
        <div style={{
          width:       '5px',
          height:      '5px',
          borderRadius:'50%',
          background:  'var(--ok)',
          boxShadow:   '0 0 4px var(--ok)',
        }} />
        <span style={{
          fontFamily:    'var(--font-mono)',
          fontSize:      '0.58rem',
          color:         'var(--ok)',
          letterSpacing: '0.08em',
        }}>
          ALL SYSTEMS NOMINAL
        </span>
      </div>
    </div>
  );
}

// ── Summary bar ───────────────────────────────────────────────────────────────
function SummaryBar({ alerts }) {
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0 };
  alerts.forEach(a => { if (counts[a.severity] !== undefined) counts[a.severity]++; });

  return (
    <div style={{
      display:  'grid',
      gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
      gap:      '6px',
      marginBottom: '14px',
    }}>
      {[
        { label: 'CRITICAL', count: counts.CRITICAL, color: SEV.CRITICAL.color },
        { label: 'HIGH',     count: counts.HIGH,     color: SEV.HIGH.color     },
        { label: 'MEDIUM',   count: counts.MEDIUM,   color: SEV.MEDIUM.color   },
      ].map(({ label, count, color }) => (
        <div key={label} style={{
          padding:     '8px 10px',
          background:  count > 0 ? `${color}08` : 'var(--bg-elevated)',
          border:      `1px solid ${count > 0 ? color + '25' : 'var(--border-hard)'}`,
          borderTop:   `2px solid ${count > 0 ? color : 'var(--border-hard)'}`,
          borderRadius:'4px',
          minWidth:    0,
        }}>
          <div style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '0.5rem',
            color:         'var(--ink-muted)',
            letterSpacing: '0.1em',
            marginBottom:  '3px',
            overflow:      'hidden',
            textOverflow:  'ellipsis',
            whiteSpace:    'nowrap',
          }}>
            {label}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize:   '1.1rem',
            fontWeight: 700,
            color:      count > 0 ? color : 'var(--ink-ghost)',
            lineHeight: 1,
          }}>
            {count}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function KPIThresholdAlertPanel() {
  const { equipment,   loading: eqLoading,  error: eqError  } = useEquipment();
  const { fuelMetrics, loading: fuelLoading, error: fuelError } = useFuel();
  const { incidents,   loading: safeLoading, error: safeError } = useSafety();
  const { events,      loading: evLoading,   error: evError  } = useOperationalEvents();

  const loading = eqLoading || fuelLoading || safeLoading || evLoading;
  const error   = eqError || fuelError || safeError || evError;

  const alerts = useMemo(
    () => evaluateThresholds(equipment, fuelMetrics, incidents, events),
    [equipment, fuelMetrics, incidents, events]
  );

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const headerBorder  = criticalCount > 0 ? 'var(--alert)' : alerts.length > 0 ? '#f97316' : 'var(--border-hard)';

  return (
    <div
      className="panel"
      style={{
        borderRadius: '4px',
        overflow:     'hidden',
        borderTop:    `2px solid ${headerBorder}`,
      }}
    >
      {/* ── Header ── */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        justifyContent:'space-between',
        padding:      '14px 16px',
        borderBottom: '1px solid var(--border-hard)',
        background:   criticalCount > 0 ? 'rgba(239,68,68,0.04)' : 'var(--bg-elevated)',
        flexWrap:     'wrap',
        gap:          '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            padding:    '6px',
            background: criticalCount > 0
              ? 'rgba(239,68,68,0.12)'
              : 'rgba(245,158,11,0.10)',
            border:     criticalCount > 0
              ? '1px solid rgba(239,68,68,0.25)'
              : '1px solid rgba(245,158,11,0.22)',
            borderRadius: '4px',
          }}>
            <Bell
              size={14}
              color={criticalCount > 0 ? 'var(--alert)' : 'var(--warn)'}
            />
          </div>
          <div>
            <div style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      '0.72rem',
              fontWeight:    700,
              color:         'var(--ink-primary)',
              letterSpacing: '-0.01em',
            }}>
              KPI Threshold Alerts
            </div>
            <div style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      '0.55rem',
              letterSpacing: '0.1em',
              color:         'var(--ink-muted)',
              marginTop:     '1px',
            }}>
              EQUIPMENT · FUEL · SAFETY · OPERATIONS
            </div>
          </div>
        </div>

        {/* Alert count badge */}
        {!loading && alerts.length > 0 && (
          <span
            className={`badge ${criticalCount > 0 ? 'badge-alert' : 'badge-warn'}`}
            style={{ fontSize: '0.58rem', flexShrink: 0 }}
          >
            {alerts.length} ALERT{alerts.length !== 1 ? 'S' : ''}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '16px' }}>

        {/* Loading */}
        {loading && <LoadingSkeleton rows={4} height={52} />}

        {/* Error */}
        {!loading && error && (
          <ErrorState message={`Failed to load threshold data: ${error}`} />
        )}

        {/* Healthy — no alerts */}
        {!loading && !error && alerts.length === 0 && <HealthyState />}

        {/* Alerts */}
        {!loading && !error && alerts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

            {/* Summary counts */}
            <SummaryBar alerts={alerts} />

            {/* Alert list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {alerts.map(alert => (
                <AlertRow key={alert.id} alert={alert} />
              ))}
            </div>

            {/* Source note */}
            <div style={{
              marginTop:    '10px',
              padding:      '6px 10px',
              background:   'rgba(255,255,255,0.02)',
              border:       '1px solid var(--border-hard)',
              borderRadius: '4px',
              display:      'flex',
              alignItems:   'center',
              gap:          '6px',
            }}>
              <div style={{
                width:       '5px',
                height:      '5px',
                borderRadius:'50%',
                background:  'var(--ok)',
                flexShrink:  0,
              }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize:   '0.57rem',
                color:      'var(--ink-muted)',
              }}>
                Derived from{' '}
                <span style={{ color: 'var(--ink-secondary)' }}>equipment</span>
                {' '}·{' '}
                <span style={{ color: 'var(--ink-secondary)' }}>fuel_metrics</span>
                {' '}·{' '}
                <span style={{ color: 'var(--ink-secondary)' }}>safety_incidents</span>
                {' '}·{' '}
                <span style={{ color: 'var(--ink-secondary)' }}>operational_events</span>
                {' '}· deterministic thresholds
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
