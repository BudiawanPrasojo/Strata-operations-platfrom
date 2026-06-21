/**
 * ShiftHandover.jsx
 *
 * Shift Handover Summary — halaman operasional untuk serah terima shift.
 * Menampilkan ringkasan kondisi operasional dari data yang sudah ada:
 *   - operational_events  (via useOperationalEvents)
 *   - equipment           (via useEquipment)
 *   - safety_incidents    (via useSafety)
 *   - fuel_metrics        (via useFuel)
 *   - shift info          (via mockData.operationsData)
 *
 * Tidak ada tabel baru. Tidak ada hook baru.
 * Tidak ada AI summary palsu. Semua data deterministik.
 */

import { useMemo } from 'react';
import {
  ClipboardList, Users, Clock, Truck, ShieldAlert,
  Bell, AlertTriangle, CheckCircle2, AlertCircle,
  Zap, Radio, Fuel, ChevronRight, Activity,
  TrendingDown, WrenchIcon,
} from 'lucide-react';

import { useEquipment }         from '../hooks/useEquipment';
import { useFuel }              from '../hooks/useFuel';
import { useSafety }            from '../hooks/useSafety';
import { useOperationalEvents } from '../hooks/useOperationalEvents';
import { operationsData }       from '../data/mockData';

import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState      from '../components/common/ErrorState';

// ── Severity config ───────────────────────────────────────────────────────────
const SEV = {
  CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.28)', badge: 'badge-alert', icon: Zap,           rank: 3 },
  HIGH:     { color: '#f97316', bg: 'rgba(249,115,22,0.07)', border: 'rgba(249,115,22,0.25)', badge: 'badge-warn',  icon: AlertTriangle,  rank: 2 },
  MEDIUM:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.22)', badge: 'badge-warn',  icon: AlertCircle,    rank: 1 },
};

// ── KPI threshold evaluation (same logic as KPIThresholdAlertPanel) ───────────
function evaluateThresholds(equipment, fuelMetrics, incidents, events) {
  const alerts = [];

  (equipment || []).forEach(eq => {
    const h = eq.health ?? 100;
    if (h < 50) {
      alerts.push({ id: `eq-crit-${eq.id}`, severity: 'CRITICAL', category: 'Equipment',
        title: `${eq.id} — Critical Health`, detail: `Health at ${h}% · ${eq.location ?? '—'}` });
    } else if (h < 70) {
      alerts.push({ id: `eq-warn-${eq.id}`, severity: 'MEDIUM', category: 'Equipment',
        title: `${eq.id} — Health Warning`, detail: `Health at ${h}% · ${eq.location ?? '—'}` });
    }
  });

  (fuelMetrics || []).forEach((fm, idx) => {
    const site = fm.site ?? fm.location ?? `Site ${idx + 1}`;
    const eff  = fm.fuelEfficiency ?? null;
    if (eff !== null && eff < 70) {
      alerts.push({ id: `fuel-crit-${fm.id ?? idx}`, severity: 'CRITICAL', category: 'Fuel',
        title: `Fuel Efficiency Critical — ${site}`, detail: `Efficiency at ${eff}%` });
    } else if (eff !== null && eff < 80) {
      alerts.push({ id: `fuel-warn-${fm.id ?? idx}`, severity: 'MEDIUM', category: 'Fuel',
        title: `Fuel Efficiency Below Target — ${site}`, detail: `Efficiency at ${eff}%` });
    }
    if (eff === null && fm.status === 'Investigating') {
      alerts.push({ id: `fuel-status-${fm.id ?? idx}`, severity: 'HIGH', category: 'Fuel',
        title: `Fuel Anomaly — ${site}`, detail: `Status: Under Investigation · ${fm.amount ?? '—'}` });
    }
  });

  (incidents || []).forEach(inc => {
    const sev = (inc.severity ?? '').toLowerCase();
    if (sev === 'danger' || sev === 'critical' || sev === 'high') {
      alerts.push({ id: `safe-${inc.id}`, severity: 'CRITICAL', category: 'Safety',
        title: `${inc.type ?? 'Safety Incident'} — ${inc.location ?? '—'}`, detail: `${inc.id} · Status: ${inc.status ?? '—'}` });
    }
  });

  (events || [])
    .filter(e => e.severity === 'danger' && ['anomaly','maintenance','safety'].includes(e.type))
    .slice(0, 3)
    .forEach(ev => {
      alerts.push({ id: `ops-${ev.id}`, severity: 'HIGH', category: 'Ops Event',
        title: 'High Priority Operational Event',
        detail: ev.message?.slice(0, 90) + (ev.message?.length > 90 ? '…' : '') || 'Critical event detected' });
    });

  const seen = new Set();
  return alerts
    .filter(a => { if (seen.has(a.id)) return false; seen.add(a.id); return true; })
    .sort((a, b) => (SEV[b.severity]?.rank ?? 0) - (SEV[a.severity]?.rank ?? 0));
}

// ── Derive recommended handover actions from data ────────────────────────────
function deriveRecommendations(alerts, equipment, incidents) {
  const actions = [];

  // Critical equipment
  (equipment || []).filter(e => (e.health ?? 100) < 50).forEach(eq => {
    actions.push({
      priority: 'CRITICAL',
      icon: WrenchIcon,
      action: `Arrange immediate inspection for ${eq.id} (${eq.type})`,
      context: `Health at ${eq.health}% — do not return to service without clearance. Location: ${eq.location ?? '—'}.`,
    });
  });

  // Maintenance units
  const maintUnits = (equipment || []).filter(e => e.status === 'Maintenance');
  if (maintUnits.length > 0) {
    actions.push({
      priority: 'HIGH',
      icon: WrenchIcon,
      action: `Brief incoming supervisor on ${maintUnits.length} unit(s) currently in maintenance`,
      context: maintUnits.map(e => `${e.id} (${e.location ?? '—'})`).join(', '),
    });
  }

  // Warning health equipment
  (equipment || []).filter(e => {
    const h = e.health ?? 100;
    return h >= 50 && h < 70;
  }).forEach(eq => {
    actions.push({
      priority: 'MEDIUM',
      icon: AlertCircle,
      action: `Monitor ${eq.id} closely — schedule maintenance if utilization continues`,
      context: `Health at ${eq.health}%, utilization ${eq.utilization ?? 0}%. Last service: ${eq.lastService ?? '—'}.`,
    });
  });

  // Safety incidents unresolved
  const openIncidents = (incidents || []).filter(i =>
    i.status && !['Closed', 'Resolved'].includes(i.status)
  );
  if (openIncidents.length > 0) {
    actions.push({
      priority: 'HIGH',
      icon: ShieldAlert,
      action: `Hand over ${openIncidents.length} unresolved safety incident(s) to incoming supervisor`,
      context: openIncidents.map(i => `${i.id ?? '—'} (${i.type ?? '—'}, ${i.location ?? '—'})`).join(' · '),
    });
  }

  // Fuel anomalies
  const fuelAlerts = alerts.filter(a => a.category === 'Fuel');
  if (fuelAlerts.length > 0) {
    actions.push({
      priority: 'MEDIUM',
      icon: Fuel,
      action: 'Verify fuel inventory reconciliation before shift close',
      context: `${fuelAlerts.length} fuel anomaly alert(s) active. Ensure fuel depot logs are up to date.`,
    });
  }

  // If no actions, default checklist
  if (actions.length === 0) {
    actions.push(
      { priority: 'LOW', icon: CheckCircle2, action: 'Confirm all equipment logged and accounted for', context: 'Standard end-of-shift equipment check.' },
      { priority: 'LOW', icon: CheckCircle2, action: 'Submit shift production summary to Operations Manager', context: 'Include sector tonnage actuals vs targets.' },
      { priority: 'LOW', icon: CheckCircle2, action: 'Verify fuel depot levels and log consumption totals', context: 'Required for daily fuel reconciliation report.' },
    );
  } else {
    // Always add standard close-out
    actions.push({
      priority: 'LOW',
      icon: CheckCircle2,
      action: 'Complete shift production log and submit to Operations Manager',
      context: 'Include any deviations from plan and outstanding tasks for incoming shift.',
    });
  }

  const priorityRank = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  return actions.sort((a, b) => (priorityRank[b.priority] ?? 0) - (priorityRank[a.priority] ?? 0));
}

// ── Helper: severity color from event ────────────────────────────────────────
function eventSevColor(sev) {
  if (sev === 'danger')  return 'var(--alert)';
  if (sev === 'warning') return 'var(--warn)';
  if (sev === 'success') return 'var(--ok)';
  return 'var(--ink-muted)';
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ label, accent = 'var(--cyan)', children }) {
  return (
    <section>
      <div className="section-label">
        <div className="section-label__bar" style={{ background: accent }} />
        <span className="section-label__text">{label}</span>
        <div className="section-label__line" />
      </div>
      {children}
    </section>
  );
}

// ── Panel wrapper ─────────────────────────────────────────────────────────────
function Panel({ accentColor, children }) {
  return (
    <div className="panel" style={{
      borderRadius: '4px',
      overflow: 'hidden',
      borderTop: `2px solid ${accentColor ?? 'var(--border-hard)'}`,
    }}>
      {children}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, Icon }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-hard)',
      borderTop: `2px solid ${color}`,
      borderRadius: '4px',
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ padding: '5px', background: `${color}14`, border: `1px solid ${color}28`, borderRadius: '4px' }}>
          <Icon size={12} color={color} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.12em', color: 'var(--ink-muted)' }}>
          {label}
        </span>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ink-muted)', marginTop: '4px' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ── Priority badge ────────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const cfg = {
    CRITICAL: 'badge-alert',
    HIGH:     'badge-warn',
    MEDIUM:   'badge-warn',
    LOW:      'badge-ok',
  }[priority] ?? 'badge-ghost';
  return <span className={`badge ${cfg}`} style={{ fontSize: '0.5rem' }}>{priority}</span>;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ShiftHandover() {
  const { equipment,   loading: eqL,   error: eqE   } = useEquipment();
  const { fuelMetrics, loading: fuelL, error: fuelE  } = useFuel();
  const { incidents,   loading: safeL, error: safeE  } = useSafety();
  const { events,      loading: evL,   error: evE    } = useOperationalEvents();

  const loading = eqL || fuelL || safeL || evL;
  const error   = eqE || fuelE || safeE || evE;

  // Active shift from mockData
  const activeShift = operationsData.shifts.find(s => s.status === 'Active') ?? operationsData.shifts[0];

  // Derived
  const alerts          = useMemo(() => evaluateThresholds(equipment, fuelMetrics, incidents, events), [equipment, fuelMetrics, incidents, events]);
  const recommendations = useMemo(() => deriveRecommendations(alerts, equipment, incidents), [alerts, equipment, incidents]);

  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;
  const highAlerts     = alerts.filter(a => a.severity === 'HIGH').length;

  // Equipment breakdowns
  const eqActive  = equipment.filter(e => e.status === 'Active').length;
  const eqMaint   = equipment.filter(e => e.status === 'Maintenance').length;
  const eqIdle    = equipment.filter(e => e.status === 'Idle').length;
  const eqAtRisk  = equipment.filter(e => (e.health ?? 100) < 70);

  // Events summary
  const dangerEvents  = events.filter(e => e.severity === 'danger').length;
  const warnEvents    = events.filter(e => e.severity === 'warning').length;

  // Safety summary
  const openIncidents = incidents.filter(i => i.status && !['Closed', 'Resolved'].includes(i.status));

  const headerBorder = criticalAlerts > 0 ? 'var(--alert)' : highAlerts > 0 ? '#f97316' : 'var(--ok)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600,
            letterSpacing: '0.14em', color: 'var(--amber)', marginBottom: '4px',
          }}>
            SMART MINING OPERATIONS PLATFORM
          </div>
          <h1 style={{
            fontFamily: 'var(--font-ui)', fontSize: '1.35rem', fontWeight: 700,
            color: 'var(--ink-primary)', letterSpacing: '-0.02em', lineHeight: 1, margin: 0,
          }}>
            Shift Handover Summary
          </h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '4px' }}>
            {activeShift?.name} · Supervisor: {activeShift?.supervisor} · {activeShift?.time}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {criticalAlerts > 0 && (
            <span className="badge badge-alert">{criticalAlerts} CRITICAL</span>
          )}
          <span className="badge badge-amber">
            <div className="live-dot" style={{ width: '5px', height: '5px', background: 'var(--amber)' }} />
            HANDOVER READY
          </span>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <LoadingSkeleton rows={3} height={80} />
          <LoadingSkeleton rows={4} height={52} />
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <ErrorState message={`Failed to load handover data: ${error}`} />
      )}

      {!loading && !error && (
        <>
          {/* ── Shift Summary KPI row ── */}
          <Section label="SHIFT OVERVIEW" accent="var(--amber)">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
              gap: '8px',
            }}
              className="responsive-grid-4col"
            >
              <StatCard
                label="EVENTS THIS SHIFT"
                value={events.length}
                sub={`${dangerEvents} critical · ${warnEvents} warning`}
                color={dangerEvents > 0 ? 'var(--alert)' : 'var(--warn)'}
                Icon={Activity}
              />
              <StatCard
                label="FLEET ACTIVE"
                value={eqActive}
                sub={`of ${equipment.length} total units`}
                color="var(--ok)"
                Icon={Truck}
              />
              <StatCard
                label="IN MAINTENANCE"
                value={eqMaint}
                sub={eqMaint > 0 ? 'units offline' : 'fleet fully operational'}
                color={eqMaint > 0 ? 'var(--warn)' : 'var(--ok)'}
                Icon={WrenchIcon}
              />
              <StatCard
                label="OPEN INCIDENTS"
                value={openIncidents.length}
                sub={openIncidents.length > 0 ? 'require incoming shift action' : 'all incidents resolved'}
                color={openIncidents.length > 0 ? 'var(--alert)' : 'var(--ok)'}
                Icon={ShieldAlert}
              />
            </div>
          </Section>

          {/* ── Operational Events ── */}
          <Section label="OPERATIONAL EVENTS LOG" accent="var(--cyan)">
            <Panel accentColor="var(--cyan)">
              <div style={{ padding: '0' }}>
                {events.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center' }}>
                    <CheckCircle2 size={22} color="var(--ok)" strokeWidth={1.5} style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>No operational events recorded this shift.</div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-hard)', background: 'var(--bg-elevated)' }}>
                          {['TIME', 'TYPE', 'SEVERITY', 'MESSAGE'].map(h => (
                            <th key={h} style={{
                              padding: '8px 14px', textAlign: 'left',
                              fontFamily: 'var(--font-mono)', fontSize: '0.52rem',
                              letterSpacing: '0.1em', color: 'var(--ink-muted)', fontWeight: 600,
                              whiteSpace: 'nowrap',
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...events]
                          .sort((a, b) => {
                            const rank = { danger: 3, warning: 2, info: 1, success: 0 };
                            return (rank[b.severity] ?? 0) - (rank[a.severity] ?? 0);
                          })
                          .slice(0, 10)
                          .map((ev, idx) => (
                            <tr key={ev.id ?? idx} style={{
                              borderBottom: '1px solid var(--border-hard)',
                            }}>
                              <td style={{ padding: '8px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}>
                                {ev.timestamp ?? '—'}
                              </td>
                              <td style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                                <span style={{
                                  fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                                  letterSpacing: '0.08em',
                                  color: 'var(--ink-secondary)',
                                  background: 'var(--bg-elevated)',
                                  border: '1px solid var(--border-hard)',
                                  padding: '1px 6px', borderRadius: '2px',
                                }}>
                                  {(ev.type ?? 'event').toUpperCase()}
                                </span>
                              </td>
                              <td style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                                <span style={{
                                  fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                                  color: eventSevColor(ev.severity),
                                  letterSpacing: '0.06em',
                                }}>
                                  {(ev.severity ?? 'info').toUpperCase()}
                                </span>
                              </td>
                              <td style={{
                                padding: '8px 14px', color: 'var(--ink-primary)',
                                maxWidth: '360px', overflow: 'hidden',
                                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>
                                {ev.message ?? '—'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {events.length > 10 && (
                      <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-hard)', background: 'var(--bg-elevated)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ink-muted)' }}>
                          Showing top 10 of {events.length} events — sorted by severity
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Panel>
          </Section>

          {/* ── Equipment Status ── */}
          <Section label="EQUIPMENT STATUS SUMMARY" accent="var(--amber)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Fleet overview bar */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
                gap: '8px',
              }} className="responsive-grid-3col">
                {[
                  { label: 'ACTIVE', value: eqActive, color: 'var(--ok)' },
                  { label: 'MAINTENANCE', value: eqMaint, color: 'var(--warn)' },
                  { label: 'IDLE', value: eqIdle, color: 'var(--ink-muted)' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{
                    padding: '10px 12px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-hard)',
                    borderTop: `2px solid ${color}`,
                    borderRadius: '4px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--ink-muted)', letterSpacing: '0.12em', marginBottom: '4px' }}>
                      {label}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 700, color }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Units needing attention */}
              {eqAtRisk.length > 0 ? (
                <Panel accentColor="var(--warn)">
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-hard)', background: 'var(--bg-elevated)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', color: 'var(--warn)' }}>
                      UNITS REQUIRING ATTENTION ({eqAtRisk.length})
                    </span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-hard)' }}>
                          {['UNIT ID', 'TYPE', 'HEALTH', 'STATUS', 'LOCATION', 'OPERATOR'].map(h => (
                            <th key={h} style={{
                              padding: '7px 12px', textAlign: 'left',
                              fontFamily: 'var(--font-mono)', fontSize: '0.5rem',
                              letterSpacing: '0.1em', color: 'var(--ink-muted)', fontWeight: 600,
                              whiteSpace: 'nowrap',
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {eqAtRisk.map(eq => {
                          const hColor = (eq.health ?? 100) < 50 ? 'var(--alert)' : 'var(--warn)';
                          return (
                            <tr key={eq.id} style={{ borderBottom: '1px solid var(--border-hard)' }}>
                              <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-primary)', whiteSpace: 'nowrap' }}>
                                {eq.id}
                              </td>
                              <td style={{ padding: '8px 12px', color: 'var(--ink-secondary)', whiteSpace: 'nowrap' }}>
                                {eq.type ?? '—'}
                              </td>
                              <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: hColor }}>
                                  {eq.health ?? '—'}%
                                </span>
                              </td>
                              <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                                <span style={{
                                  fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                                  color: eq.status === 'Maintenance' ? 'var(--warn)' : 'var(--ink-secondary)',
                                  background: eq.status === 'Maintenance' ? 'rgba(245,158,11,0.10)' : 'var(--bg-elevated)',
                                  border: `1px solid ${eq.status === 'Maintenance' ? 'rgba(245,158,11,0.25)' : 'var(--border-hard)'}`,
                                  padding: '2px 7px', borderRadius: '2px',
                                }}>
                                  {eq.status}
                                </span>
                              </td>
                              <td style={{ padding: '8px 12px', color: 'var(--ink-muted)', whiteSpace: 'nowrap', fontSize: '0.7rem' }}>
                                {eq.location ?? '—'}
                              </td>
                              <td style={{ padding: '8px 12px', color: 'var(--ink-muted)', whiteSpace: 'nowrap', fontSize: '0.7rem' }}>
                                {eq.operator ?? '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              ) : (
                <div style={{
                  padding: '16px',
                  background: 'rgba(34,197,94,0.05)',
                  border: '1px solid rgba(34,197,94,0.14)',
                  borderRadius: '4px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <CheckCircle2 size={14} color="var(--ok)" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-secondary)' }}>
                    All fleet units operating above health threshold. No equipment requires immediate attention.
                  </span>
                </div>
              )}
            </div>
          </Section>

          {/* ── Safety Summary ── */}
          <Section label="SAFETY SUMMARY" accent="var(--alert)">
            <Panel accentColor={openIncidents.length > 0 ? 'var(--alert)' : 'var(--ok)'}>
              {incidents.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <CheckCircle2 size={22} color="var(--ok)" strokeWidth={1.5} style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>No safety incidents recorded this shift.</div>
                </div>
              ) : (
                <>
                  {/* Safety stats */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '0',
                    borderBottom: '1px solid var(--border-hard)',
                  }} className="responsive-grid-3col">
                    {[
                      { label: 'TOTAL INCIDENTS', value: incidents.length, color: 'var(--ink-primary)' },
                      { label: 'OPEN / UNRESOLVED', value: openIncidents.length, color: openIncidents.length > 0 ? 'var(--alert)' : 'var(--ok)' },
                      { label: 'CLOSED / RESOLVED', value: incidents.length - openIncidents.length, color: 'var(--ok)' },
                    ].map(({ label, value, color }, i) => (
                      <div key={label} style={{
                        padding: '12px 14px',
                        borderRight: i < 2 ? '1px solid var(--border-hard)' : 'none',
                      }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--ink-muted)', letterSpacing: '0.1em', marginBottom: '4px' }}>
                          {label}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Incident list */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-hard)', background: 'var(--bg-elevated)' }}>
                          {['ID', 'TYPE', 'SEVERITY', 'LOCATION', 'STATUS', 'DATE'].map(h => (
                            <th key={h} style={{
                              padding: '7px 12px', textAlign: 'left',
                              fontFamily: 'var(--font-mono)', fontSize: '0.5rem',
                              letterSpacing: '0.1em', color: 'var(--ink-muted)', fontWeight: 600,
                              whiteSpace: 'nowrap',
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {incidents.map((inc, idx) => {
                          const sevColor =
                            ['danger','critical','high'].includes((inc.severity ?? '').toLowerCase())
                              ? 'var(--alert)'
                              : (inc.severity ?? '').toLowerCase() === 'medium'
                              ? 'var(--warn)'
                              : 'var(--ink-secondary)';
                          const isOpen = inc.status && !['Closed', 'Resolved'].includes(inc.status);
                          return (
                            <tr key={inc.id ?? idx} style={{
                              borderBottom: '1px solid var(--border-hard)',
                              background: isOpen ? 'rgba(239,68,68,0.02)' : 'transparent',
                            }}>
                              <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-primary)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                                {inc.id ?? '—'}
                              </td>
                              <td style={{ padding: '8px 12px', color: 'var(--ink-secondary)', whiteSpace: 'nowrap' }}>
                                {inc.type ?? '—'}
                              </td>
                              <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: sevColor, fontWeight: 600 }}>
                                  {inc.severity ?? '—'}
                                </span>
                              </td>
                              <td style={{ padding: '8px 12px', color: 'var(--ink-muted)', whiteSpace: 'nowrap', fontSize: '0.7rem' }}>
                                {inc.location ?? '—'}
                              </td>
                              <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                                <span style={{
                                  fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                                  color: isOpen ? 'var(--warn)' : 'var(--ok)',
                                  background: isOpen ? 'rgba(245,158,11,0.10)' : 'rgba(34,197,94,0.08)',
                                  border: `1px solid ${isOpen ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.18)'}`,
                                  padding: '2px 7px', borderRadius: '2px',
                                }}>
                                  {inc.status ?? '—'}
                                </span>
                              </td>
                              <td style={{ padding: '8px 12px', color: 'var(--ink-muted)', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', fontSize: '0.63rem' }}>
                                {inc.date ?? '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </Panel>
          </Section>

          {/* ── Active KPI Alerts ── */}
          <Section label="ACTIVE KPI ALERTS" accent="var(--alert)">
            {alerts.length === 0 ? (
              <div style={{
                padding: '20px', background: 'rgba(34,197,94,0.05)',
                border: '1px solid rgba(34,197,94,0.14)', borderRadius: '4px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <CheckCircle2 size={16} color="var(--ok)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-secondary)' }}>
                  No KPI threshold alerts active. All monitored metrics are within normal operating parameters.
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {alerts.map(alert => {
                  const cfg = SEV[alert.severity] ?? SEV.MEDIUM;
                  return (
                    <div key={alert.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px',
                      padding: '10px 12px',
                      background: cfg.bg, border: `1px solid ${cfg.border}`,
                      borderLeft: `3px solid ${cfg.color}`, borderRadius: '4px',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-primary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {alert.title}
                          </span>
                          <span className={`badge ${cfg.badge}`} style={{ fontSize: '0.5rem', flexShrink: 0 }}>
                            {alert.severity}
                          </span>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.52rem',
                            color: 'var(--ink-secondary)', background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-hard)', padding: '1px 6px', borderRadius: '2px',
                          }}>
                            {alert.category?.toUpperCase()}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.68rem', color: 'var(--ink-muted)', margin: 0, lineHeight: 1.5 }}>
                          {alert.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          {/* ── Recommended Actions ── */}
          <Section label="RECOMMENDED HANDOVER ACTIONS" accent="var(--cyan)">
            <Panel accentColor="var(--cyan)">
              <div style={{ padding: '4px 0' }}>
                {recommendations.map((rec, idx) => {
                  const RecIcon = rec.icon;
                  const isLast  = idx === recommendations.length - 1;
                  const pColor  = { CRITICAL: 'var(--alert)', HIGH: '#f97316', MEDIUM: 'var(--warn)', LOW: 'var(--ok)' }[rec.priority] ?? 'var(--ink-muted)';
                  return (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '12px',
                      padding: '12px 16px',
                      borderBottom: isLast ? 'none' : '1px solid var(--border-hard)',
                    }}>
                      <div style={{
                        padding: '6px', background: `${pColor}12`,
                        border: `1px solid ${pColor}28`, borderRadius: '4px',
                        flexShrink: 0, marginTop: '1px',
                      }}>
                        <RecIcon size={12} color={pColor} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.77rem', fontWeight: 600, color: 'var(--ink-primary)', flex: 1 }}>
                            {rec.action}
                          </span>
                          <PriorityBadge priority={rec.priority} />
                        </div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', margin: 0, lineHeight: 1.5 }}>
                          {rec.context}
                        </p>
                      </div>
                      <ChevronRight size={14} color="var(--ink-ghost)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    </div>
                  );
                })}
              </div>
            </Panel>
          </Section>

          {/* ── Footer note ── */}
          <div style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-hard)',
            borderRadius: '4px',
            display: 'flex', alignItems: 'center', gap: '8px',
            flexWrap: 'wrap',
          }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--ok)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.57rem', color: 'var(--ink-muted)' }}>
              Data derived from{' '}
              <span style={{ color: 'var(--ink-secondary)' }}>operational_events</span> ·{' '}
              <span style={{ color: 'var(--ink-secondary)' }}>equipment</span> ·{' '}
              <span style={{ color: 'var(--ink-secondary)' }}>safety_incidents</span> ·{' '}
              <span style={{ color: 'var(--ink-secondary)' }}>fuel_metrics</span>
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.57rem', color: 'var(--ink-ghost)', marginLeft: 'auto' }}>
              Generated: {new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
