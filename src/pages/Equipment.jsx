import { useState } from 'react';
import { Truck, Search, Wrench, Fuel, Clock, MapPin, User, Database, X } from 'lucide-react';
import { useEquipment } from '../hooks/useEquipment';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

// ── HealthGauge (dipertahankan dari versi asli) ──────────────
function HealthGauge({ value, size = 64 }) {
  const safeValue = Number(value) || 0; // fallback ke 0 kalau undefined/null/NaN
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (safeValue / 100) * circumference;
  const color = safeValue >= 80 ? '#22c55e' : safeValue >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1E2A35" strokeWidth="4" />
        <circle
          cx={size/2} cy={size/2} r={radius}
          fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, color }}>
          {safeValue}%
        </span>
      </div>
    </div>
  );
}

// ── Mini fuel bar ────────────────────────────────────────────
function FuelBar({ pct }) {
  const safePct = Number(pct) || 0;
  const color = safePct > 60 ? 'var(--ok)' : safePct > 30 ? 'var(--warn)' : 'var(--alert)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '60px', height: '4px', background: 'var(--border-hard)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${safePct}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.8s ease' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color }}>{safePct}%</span>
    </div>
  );
}

// ── Status color ─────────────────────────────────────────────
const statusStyle = {
  Active:      { color: 'var(--ok)',    bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.20)'   },
  Idle:        { color: 'var(--warn)',  bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.20)'  },
  Maintenance: { color: 'var(--alert)', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.20)'   },
};

// ── Detail Panel ─────────────────────────────────────────────
function DetailPanel({ unit, onClose }) {
  if (!unit) return null;
  const st = statusStyle[unit.status] || statusStyle.Idle;
  return (
    <div className="detail-panel" style={{
      position: 'fixed', top: 0, right: 0, height: '100vh',
      zIndex: 50,
      background: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border-hard)',
      display: 'flex', flexDirection: 'column',
      animation: 'slide-in-right 0.25s ease',
      boxShadow: '-8px 0 24px rgba(0,0,0,0.4)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px', borderBottom: '1px solid var(--border-hard)',
        background: 'var(--bg-elevated)',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ink-muted)', letterSpacing: '0.1em', marginBottom: '4px' }}>
            UNIT DETAIL
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: 'var(--ink-primary)' }}>
            {unit.id}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-secondary)', marginTop: '2px' }}>{unit.name}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '3px 10px', borderRadius: '2px', border: `1px solid ${st.border}`, background: st.bg, color: st.color, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
            {unit.status.toUpperCase()}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', padding: '4px' }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { label: 'TYPE',       value: unit.type },
            { label: 'LOCATION',   value: unit.location },
            { label: 'OPERATOR',   value: unit.operator },
            { label: 'LAST SVC',   value: unit.lastService ?? '-' },
            { label: 'HRS TODAY',  value: `${Number(unit.hoursToday) || 0}h` },
            { label: 'MAINT',      value: unit.maintenance ?? '-' },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: '10px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-hard)', borderRadius: '4px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--ink-muted)', letterSpacing: '0.1em', marginBottom: '4px' }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink-primary)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Health */}
        <div style={{ padding: '14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-hard)', borderRadius: '4px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ink-muted)', letterSpacing: '0.1em', marginBottom: '12px' }}>HEALTH & PERFORMANCE</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <HealthGauge value={unit.health} size={72} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--ink-muted)', marginTop: '6px' }}>HEALTH</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <HealthGauge value={unit.utilization} size={72} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--ink-muted)', marginTop: '6px' }}>UTILIZATION</div>
            </div>
          </div>
        </div>

        {/* Fuel */}
        <div style={{ padding: '14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-hard)', borderRadius: '4px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ink-muted)', letterSpacing: '0.1em', marginBottom: '10px' }}>FUEL LEVEL</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Fuel size={14} color="var(--amber)" />
            <div style={{ flex: 1 }}>
              <div style={{ height: '6px', background: 'var(--border-hard)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Number(unit.fuelLevel) || 0}%`,
                  background: (Number(unit.fuelLevel) || 0) > 60 ? 'var(--ok)' : (Number(unit.fuelLevel) || 0) > 30 ? 'var(--warn)' : 'var(--alert)',
                  borderRadius: '3px',
                  transition: 'width 0.8s ease',
                }} />
              </div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink-primary)' }}>{Number(unit.fuelLevel) || 0}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function Equipment() {
  const { equipment, loading, error, source, refetch } = useEquipment();
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('All');
  const [selected, setSelected] = useState(null);

  const statusFilters = ['All', 'Active', 'Idle', 'Maintenance'];

  const filtered = equipment.filter(u => {
    const matchStatus = filter === 'All' || u.status === filter;
    const matchSearch = !search || u.id.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.location || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const summary = {
    total:       equipment.length,
    active:      equipment.filter(u => u.status === 'Active').length,
    idle:        equipment.filter(u => u.status === 'Idle').length,
    maintenance: equipment.filter(u => u.status === 'Maintenance').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Page header */}
      <div className="page-header">
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.14em', color: 'var(--amber)', marginBottom: '4px' }}>
            FLEET MANAGEMENT
          </div>
          <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            Equipment Monitor
          </h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '4px' }}>
            Kalimantan Site — {summary.total} unit terdaftar
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {source === 'supabase' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Database size={11} color="var(--ok)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ok)' }}>SUPABASE</span>
            </div>
          )}
          <span className="badge badge-amber">{filter === 'All' ? 'ALL UNITS' : filter.toUpperCase()}</span>
        </div>
      </div>

      {/* Summary bar */}
      <div className="responsive-grid-4col">
        {[
          { label: 'TOTAL FLEET',  value: summary.total,       color: 'var(--amber)' },
          { label: 'ACTIVE',       value: summary.active,      color: 'var(--ok)'    },
          { label: 'IDLE',         value: summary.idle,        color: 'var(--warn)'  },
          { label: 'MAINTENANCE',  value: summary.maintenance, color: 'var(--alert)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            padding: '14px 16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-hard)',
            borderTop: `2px solid ${color}`,
            borderRadius: '4px',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--ink-muted)', letterSpacing: '0.12em', marginBottom: '6px' }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border-hard)', borderRadius: '4px', padding: '6px 12px', flex: 1, minWidth: '200px' }}>
          <Search size={13} color="var(--ink-muted)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari unit ID, nama, lokasi..."
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: '0.8rem', color: 'var(--ink-primary)', fontFamily: 'var(--font-ui)', width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {statusFilters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                background: filter === f ? 'var(--amber-dim)' : 'var(--bg-surface)',
                border: `1px solid ${filter === f ? 'var(--amber-edge)' : 'var(--border-hard)'}`,
                borderRadius: '4px',
                color: filter === f ? 'var(--amber)' : 'var(--ink-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: filter === f ? 600 : 400,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="panel" style={{ borderRadius: '4px', overflow: 'hidden' }}>
        <div className="table-scroll-wrapper">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr 100px 100px 120px 100px 80px',
          padding: '10px 16px',
          borderBottom: '1px solid var(--border-hard)',
          background: 'var(--bg-elevated)',
          minWidth: '640px',
        }}>
          {['UNIT ID', 'NAME & LOCATION', 'STATUS', 'FUEL', 'HEALTH', 'HOURS', 'UTIL'].map(h => (
            <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--ink-muted)' }}>{h}</div>
          ))}
        </div>

        {loading && <div style={{ padding: '12px 16px' }}><LoadingSkeleton rows={5} height={44} /></div>}

        {!loading && error && (
          <div style={{ padding: '12px' }}>
            <ErrorState message={`Gagal memuat equipment: ${error}`} onRetry={refetch} />
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState title="Tidak ada unit" description={search ? `Tidak ada unit yang cocok dengan "${search}"` : 'Tidak ada unit dengan filter ini.'} />
        )}

        {!loading && filtered.map((unit) => {
          const st = statusStyle[unit.status] || statusStyle.Idle;
          return (
            <div
              key={unit.id}
              onClick={() => setSelected(unit)}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 100px 120px 120px 100px 80px',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-soft)',
                cursor: 'pointer',
                transition: 'background 0.15s',
                borderLeft: `2px solid ${st.color}`,
                minWidth: '640px',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--amber)', alignSelf: 'center' }}>{unit.id}</div>
              <div style={{ alignSelf: 'center' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--ink-primary)', marginBottom: '2px' }}>{unit.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={10} color="var(--ink-muted)" />
                  <span style={{ fontSize: '0.68rem', color: 'var(--ink-muted)' }}>{unit.location}</span>
                  {unit.operator !== 'Unassigned' && unit.operator !== 'Standby' && (
                    <>
                      <span style={{ color: 'var(--ink-ghost)' }}>·</span>
                      <User size={10} color="var(--ink-muted)" />
                      <span style={{ fontSize: '0.68rem', color: 'var(--ink-muted)' }}>{unit.operator}</span>
                    </>
                  )}
                </div>
              </div>
              <div style={{ alignSelf: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: '2px', border: `1px solid ${st.border}`, background: st.bg, color: st.color, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                  {unit.status.toUpperCase()}
                </span>
              </div>
              <div style={{ alignSelf: 'center' }}><FuelBar pct={unit.fuelLevel} /></div>
              <div style={{ alignSelf: 'center' }}><HealthGauge value={unit.health} size={44} /></div>
              <div style={{ alignSelf: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} color="var(--ink-muted)" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-secondary)' }}>{Number(unit.hoursToday) || 0}h</span>
                </div>
              </div>
              <div style={{ alignSelf: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: (Number(unit.utilization) || 0) >= 80 ? 'var(--ok)' : (Number(unit.utilization) || 0) >= 50 ? 'var(--warn)' : 'var(--ink-muted)' }}>
                {Number(unit.utilization) || 0}%
              </div>
            </div>
          );
        })}
        </div>{/* end table-scroll-wrapper */}
      </div>

      {/* Detail Panel */}
      {selected && (
        <>
          <div
            onClick={() => setSelected(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          />
          <DetailPanel unit={selected} onClose={() => setSelected(null)} />
        </>
      )}
    </div>
  );
}