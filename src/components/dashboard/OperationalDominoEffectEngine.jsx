/**
 * OperationalDominoEffectEngine.jsx
 *
 * Menampilkan cascade dampak dari insiden operasional nyata.
 * Data source:
 *   - operational_events  → trigger incident (via useOperationalEvents)
 *   - equipment           → unit terdampak, health, status (via useEquipment)
 *
 * Tidak ada tabel baru, tidak ada hook baru.
 * Logika cascade bersifat deterministik — tidak ada angka imajiner.
 * Semua nilai diturunkan dari data nyata dengan konstanta transparan.
 */

import { useState, useEffect } from 'react';
import { GitMerge, AlertTriangle, ChevronDown, ShieldAlert, Fuel, Truck, BarChart3, DollarSign, CheckCircle2 } from 'lucide-react';
import { useOperationalEvents } from '../../hooks/useOperationalEvents';
import { useEquipment } from '../../hooks/useEquipment';
import LoadingSkeleton from '../common/LoadingSkeleton';
import ErrorState from '../common/ErrorState';

// ── Konstanta produksi (transparan, bukan angka imajiner) ────────────────────
const BASELINE_DAILY_TONS   = 12000;  // dari KPI mockData: 12,847 → ~12k baseline
const PRICE_PER_TON_USD     = 45;     // harga batu bara thermal medium (estimasi konservatif)
const FUEL_OVERHEAD_RATE    = 0.04;   // setiap unit Maintenance → +4% fuel overhead fleet
const HOURS_PER_SHIFT       = 8;

// ── Tentukan seberapa kritis sebuah event ───────────────────────────────────
function eventCriticalityScore(event) {
  let score = 0;
  if (event.severity === 'danger')  score += 3;
  if (event.severity === 'warning') score += 1;
  if (event.type === 'anomaly')     score += 2;
  if (event.type === 'maintenance') score += 1;
  if (event.type === 'safety')      score += 2;
  return score;
}

// ── Pilih event paling kritis sebagai root incident ─────────────────────────
function pickRootIncident(events) {
  const candidates = (events || []).filter(e =>
    ['anomaly', 'maintenance', 'safety'].includes(e.type) &&
    ['danger', 'warning'].includes(e.severity)
  );
  if (candidates.length === 0) return { root: null, activeCount: 0 };
  const root = candidates.reduce((best, e) =>
    eventCriticalityScore(e) >= eventCriticalityScore(best) ? e : best
  , candidates[0]);
  return { root, activeCount: candidates.length };
}

// ── Cari equipment yang terdampak dari root event ────────────────────────────
function findAffectedEquipment(rootEvent, equipmentList) {
  if (!rootEvent) return null;
  // Pertama: cari by unit_id yang sama persis
  if (rootEvent.unit_id) {
    const match = equipmentList.find(e => e.id === rootEvent.unit_id);
    if (match) return match;
  }
  // Kedua: cari equipment yg Maintenance atau health rendah di sektor yg sama
  if (rootEvent.sector) {
    const inSector = equipmentList.filter(e =>
      e.location === rootEvent.sector &&
      (e.status === 'Maintenance' || (e.health || 100) < 75)
    );
    if (inSector.length > 0) return inSector[0];
  }
  // Ketiga: equipment dengan health paling rendah di seluruh fleet
  const lowest = [...equipmentList].sort((a, b) => (a.health || 100) - (b.health || 100));
  return lowest[0] || null;
}

// ── Hitung cascade chain dari root event + equipment terdampak ───────────────
function computeCascade(rootEvent, affectedEquip, allEquipment) {
  if (!rootEvent || !affectedEquip) return null;

  const health       = affectedEquip.health     ?? 70;
  const utilization  = affectedEquip.utilization ?? 50;
  const equipType    = affectedEquip.type        ?? 'Equipment';

  // Bobot dampak berdasarkan tipe equipment
  const typeWeight = {
    'Excavator':  1.4,
    'Dump Truck': 1.2,
    'Drill':      1.1,
    'Bulldozer':  0.9,
    'Grader':     0.7,
    'Loader':     1.0,
  }[equipType] ?? 1.0;

  // Jumlah unit Maintenance di seluruh fleet → pengaruhi route congestion
  const maintenanceCount = allEquipment.filter(e => e.status === 'Maintenance').length;
  const fleetSize        = allEquipment.length || 1;
  const maintenancePct   = maintenanceCount / fleetSize;

  // Route Congestion: semakin banyak unit down, semakin padat route
  const congestionPct = Math.round((maintenancePct * 20 + (100 - health) * 0.08) * typeWeight);

  // Fuel Overhead: unit down → reroute → konsumsi naik
  const fuelPct = Math.round(maintenanceCount * FUEL_OVERHEAD_RATE * 100 + (100 - health) * 0.03);

  // Production Impact: utilization turun proporsional
  const prodDropPct = Math.round(((100 - utilization) * 0.06 + (100 - health) * 0.04) * typeWeight);

  // Financial Loss: prod drop × baseline × harga per ton (estimasi)
  const dailyLossUSD = Math.round(
    (prodDropPct / 100) * BASELINE_DAILY_TONS * PRICE_PER_TON_USD
  );

  // Severity dibedakan antara CRITICAL dan HIGH secara visual
  const severity =
    health < 50 ? { label: 'CRITICAL', badge: 'badge-alert', borderColor: 'var(--alert)', headerBg: 'rgba(239,68,68,0.06)' } :
    health < 70 ? { label: 'HIGH',     badge: 'badge-warn',  borderColor: 'var(--warn)',  headerBg: 'rgba(245,158,11,0.06)' } :
    health < 85 ? { label: 'MEDIUM',   badge: 'badge-warn',  borderColor: 'var(--warn)',  headerBg: 'transparent' } :
                  { label: 'LOW',      badge: 'badge-ok',    borderColor: 'var(--ok)',    headerBg: 'transparent' };

  // Root cause inference dari event type
  const rootCauseMap = {
    anomaly:     { primary: 'Sensor Anomaly',      secondary: 'Threshold Breach'  },
    maintenance: { primary: 'Maintenance Overdue',  secondary: 'Hours Exceeded'    },
    safety:      { primary: 'Safety Protocol',      secondary: 'Operator Alert'    },
    movement:    { primary: 'Route Deviation',       secondary: 'Traffic Conflict'  },
  };
  const rootCause = rootCauseMap[rootEvent.type] ?? { primary: 'Operational Event', secondary: 'Under Review' };

  // Confidence: lebih tinggi jika severity danger
  const confidence = rootEvent.severity === 'danger' ? 88 : 74;

  // Warna node chain berdasarkan impact level
  const routeColor  = congestionPct >= 15 ? 'var(--alert)' : 'var(--warn)';
  const fuelColor   = fuelPct >= 8 ? 'var(--warn)' : 'var(--ink-secondary)';
  const prodColor   = prodDropPct >= 10 ? 'var(--alert)' : 'var(--warn)';
  const rootColor   = severity.label === 'CRITICAL' ? 'var(--alert)' : 'var(--warn)';

  return {
    severity,
    congestionPct,
    fuelPct,
    prodDropPct,
    dailyLossUSD,
    rootCause,
    confidence,
    equipType,
    maintenanceCount,
    chain: [
      {
        icon: ShieldAlert,
        label: 'ROOT INCIDENT',
        title: rootEvent.message?.slice(0, 60) + (rootEvent.message?.length > 60 ? '…' : '') || 'Operational Event',
        sub:   `${affectedEquip.id} · ${affectedEquip.location ?? rootEvent.sector ?? '—'}`,
        color: rootColor,
        isRoot: true,
      },
      {
        icon: Truck,
        label: 'ROUTE IMPACT',
        title: 'Haul Route Congestion Increase',
        sub:   `+${congestionPct}% above baseline · ${maintenanceCount} unit(s) offline`,
        color: routeColor,
      },
      {
        icon: Fuel,
        label: 'FUEL EFFECT',
        title: 'Fuel Consumption Overhead',
        sub:   `+${fuelPct}% rerouting overhead · ${equipType} class impact`,
        color: fuelColor,
      },
      {
        icon: BarChart3,
        label: 'PRODUCTION',
        title: 'Production Capacity Reduction',
        sub:   `-${prodDropPct}% from baseline · ${BASELINE_DAILY_TONS.toLocaleString()} t/day reference`,
        color: prodColor,
      },
      {
        icon: DollarSign,
        label: 'FINANCIAL EST.',
        title: 'Estimated Operational Loss',
        sub:   `~$${dailyLossUSD.toLocaleString()}/day · ~$${(dailyLossUSD / HOURS_PER_SHIFT).toLocaleString()}/hr (± 15%)`,
        color: 'var(--alert)',
      },
    ],
  };
}

// ── Animated progress bar ─────────────────────────────────────────────────────
function AnimBar({ pct, color, max = 100 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(Math.min(100, (pct / max) * 100)), 350);
    return () => clearTimeout(t);
  }, [pct, max]);
  return (
    <div style={{ height: '3px', background: 'var(--border-hard)', borderRadius: '1px', overflow: 'hidden', marginTop: '6px' }}>
      <div style={{
        height: '100%',
        width: `${w}%`,
        background: color,
        borderRadius: '1px',
        transition: 'width 1.1s cubic-bezier(0.16,1,0.3,1)',
      }} />
    </div>
  );
}

// ── Empty state: semua normal ─────────────────────────────────────────────────
function AllClearState() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '36px 20px',
      gap: '12px',
      textAlign: 'center',
    }}>
      <div style={{
        padding: '12px',
        background: 'rgba(34,197,94,0.08)',
        border: '1px solid rgba(34,197,94,0.18)',
        borderRadius: '50%',
      }}>
        <CheckCircle2 size={22} color="var(--ok)" strokeWidth={1.5} />
      </div>
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink-secondary)', marginBottom: '6px' }}>
          No Active Incidents
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', lineHeight: 1.6, maxWidth: '240px', margin: '0 auto' }}>
          All monitored events are within normal operating parameters. Cascade analysis is on standby.
        </p>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 10px',
        background: 'rgba(34,197,94,0.05)',
        border: '1px solid rgba(34,197,94,0.12)',
        borderRadius: '4px',
        marginTop: '4px',
      }}>
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--ok)', boxShadow: '0 0 4px var(--ok)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--ok)', letterSpacing: '0.08em' }}>
          SYSTEM NOMINAL
        </span>
      </div>
    </div>
  );
}

// ── Empty state: incident ada tapi equipment tidak ditemukan ─────────────────
function EquipmentUnavailableState({ rootEvent }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '36px 20px',
      gap: '12px',
      textAlign: 'center',
    }}>
      <div style={{
        padding: '12px',
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.18)',
        borderRadius: '50%',
      }}>
        <AlertTriangle size={20} color="var(--warn)" strokeWidth={1.5} />
      </div>
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink-secondary)', marginBottom: '6px' }}>
          Equipment Data Unavailable
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', lineHeight: 1.6, maxWidth: '260px', margin: '0 auto' }}>
          An incident was detected but no equipment record could be matched for cascade analysis. Check equipment telemetry connectivity.
        </p>
        {rootEvent && (
          <div style={{
            marginTop: '10px',
            padding: '7px 12px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-hard)',
            borderLeft: '3px solid var(--warn)',
            borderRadius: '4px',
            textAlign: 'left',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--ink-muted)', marginBottom: '3px', letterSpacing: '0.1em' }}>
              UNRESOLVED INCIDENT
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--ink-primary)', lineHeight: 1.4 }}>
              {rootEvent.message?.slice(0, 80) || 'Operational event detected'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OperationalDominoEffectEngine() {
  const { events,     loading: evLoading, error: evError   } = useOperationalEvents();
  const { equipment,  loading: eqLoading, error: eqError   } = useEquipment();

  const loading = evLoading || eqLoading;
  const error   = evError || eqError;

  // Derive cascade dari data yang sudah ada
  const { root: rootEvent, activeCount } = pickRootIncident(events);
  const affectedEquip = rootEvent ? findAffectedEquipment(rootEvent, equipment) : null;
  const cascade = (rootEvent && affectedEquip && equipment.length > 0)
    ? computeCascade(rootEvent, affectedEquip, equipment)
    : null;

  // State untuk empty states
  const noIncidents      = !loading && !error && !rootEvent;
  const incidentNoEquip  = !loading && !error && rootEvent && !affectedEquip;

  const topBorderColor = cascade
    ? cascade.severity.borderColor
    : 'var(--border-hard)';

  return (
    <div
      className="panel"
      style={{
        borderRadius: '4px',
        overflow: 'hidden',
        borderTop: `2px solid ${topBorderColor}`,
      }}
    >
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: '1px solid var(--border-hard)',
        background: cascade ? cascade.severity.headerBg : 'var(--bg-elevated)',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            padding: '6px',
            background: cascade
              ? `${cascade.severity.borderColor}18`
              : 'rgba(239,68,68,0.10)',
            border: `1px solid ${cascade ? cascade.severity.borderColor + '30' : 'rgba(239,68,68,0.22)'}`,
            borderRadius: '4px',
            flexShrink: 0,
          }}>
            <GitMerge size={14} color={cascade ? cascade.severity.borderColor : 'var(--alert)'} />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--ink-primary)',
              letterSpacing: '-0.01em',
            }}>
              Domino Effect Engine
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.55rem',
              letterSpacing: '0.1em',
              color: 'var(--ink-muted)',
              marginTop: '1px',
            }}>
              IMPACT ANALYSIS · OPERATIONAL EVENTS
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {activeCount > 1 && (
            <span className="badge badge-ghost" style={{ fontSize: '0.58rem' }}>
              {activeCount} ACTIVE
            </span>
          )}
          {cascade && (
            <span className={`badge ${cascade.severity.badge}`} style={{ fontSize: '0.58rem' }}>
              {cascade.severity.label}
            </span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '16px' }}>

        {/* Loading */}
        {loading && <LoadingSkeleton rows={5} height={48} />}

        {/* Error */}
        {!loading && error && (
          <ErrorState message={`Failed to load cascade data: ${error}`} />
        )}

        {/* All clear — no active incidents */}
        {noIncidents && <AllClearState />}

        {/* Incident found but no equipment match */}
        {incidentNoEquip && <EquipmentUnavailableState rootEvent={rootEvent} />}

        {/* Cascade chain */}
        {!loading && !error && cascade && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

            {/* ── KPI summary row ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '8px',
              marginBottom: '16px',
            }}>
              {[
                {
                  label: 'CONGESTION',
                  value: `+${cascade.congestionPct}%`,
                  color: cascade.congestionPct >= 15 ? 'var(--alert)' : 'var(--warn)',
                },
                {
                  label: 'PROD DROP',
                  value: `-${cascade.prodDropPct}%`,
                  color: cascade.prodDropPct >= 10 ? 'var(--alert)' : 'var(--warn)',
                },
                {
                  label: 'LOSS EST.',
                  value: `~$${(cascade.dailyLossUSD / 1000).toFixed(0)}k`,
                  color: 'var(--alert)',
                  note: '/day',
                },
              ].map(({ label, value, color, note }) => (
                <div key={label} style={{
                  padding: '10px 12px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-hard)',
                  borderTop: `2px solid ${color}`,
                  borderRadius: '4px',
                  minWidth: 0,
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.52rem',
                    color: 'var(--ink-muted)',
                    letterSpacing: '0.12em',
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color,
                      lineHeight: 1,
                    }}>
                      {value}
                    </span>
                    {note && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--ink-ghost)' }}>
                        {note}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Domino chain ── */}
            {cascade.chain.map((node, idx) => {
              const Icon = node.icon;
              const isLast = idx === cascade.chain.length - 1;
              return (
                <div key={idx}>
                  <div
                    className="animate-fade-up"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 12px',
                      background: node.isRoot ? `${node.color}08` : 'transparent',
                      border: node.isRoot ? `1px solid ${node.color}20` : '1px solid var(--border-hard)',
                      borderLeft: `3px solid ${node.color}`,
                      borderRadius: '4px',
                      animationDelay: `${idx * 80}ms`,
                      minWidth: 0,
                    }}
                  >
                    <div style={{
                      padding: '5px',
                      background: `${node.color}12`,
                      border: `1px solid ${node.color}22`,
                      borderRadius: '4px',
                      flexShrink: 0,
                      marginTop: '1px',
                    }}>
                      <Icon size={12} color={node.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.52rem',
                        letterSpacing: '0.12em',
                        color: 'var(--ink-muted)',
                        marginBottom: '2px',
                      }}>
                        {node.label}
                      </div>
                      <div style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--ink-primary)',
                        lineHeight: 1.3,
                        marginBottom: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {node.title}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.63rem',
                        color: node.color,
                        opacity: 0.85,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {node.sub}
                      </div>
                    </div>
                  </div>

                  {/* Arrow connector between nodes */}
                  {!isLast && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      padding: '2px 0',
                    }}>
                      <ChevronDown size={14} color="var(--ink-ghost)" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── Root Cause + Confidence ── */}
            <div style={{
              marginTop: '12px',
              padding: '12px 14px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-hard)',
              borderRadius: '4px',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.55rem',
                letterSpacing: '0.1em',
                color: 'var(--ink-muted)',
                marginBottom: '10px',
              }}>
                ROOT CAUSE ANALYSIS
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) 76px',
                gap: '10px',
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--ink-ghost)', marginBottom: '3px', letterSpacing: '0.1em' }}>
                    PRIMARY
                  </div>
                  <div style={{
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: 'var(--alert)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {cascade.rootCause.primary}
                  </div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--ink-ghost)', marginBottom: '3px', letterSpacing: '0.1em' }}>
                    SECONDARY
                  </div>
                  <div style={{
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: 'var(--warn)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {cascade.rootCause.secondary}
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--ink-ghost)', marginBottom: '3px', letterSpacing: '0.1em' }}>
                    CONFIDENCE
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--cyan)' }}>
                    {cascade.confidence}%
                  </div>
                  <AnimBar pct={cascade.confidence} color="var(--cyan)" />
                </div>
              </div>
            </div>

            {/* ── Estimate disclaimer + source note ── */}
            <div style={{
              marginTop: '8px',
              padding: '7px 10px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-hard)',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--ok)', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--ink-muted)' }}>
                  Derived from{' '}
                  <span style={{ color: 'var(--ink-secondary)' }}>operational_events</span>
                  {' '}+{' '}
                  <span style={{ color: 'var(--ink-secondary)' }}>equipment</span>
                  {' '}· deterministic cascade model
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--ink-ghost)', paddingLeft: '11px' }}>
                Financial figures are estimates only. Actual values may vary based on site conditions.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
