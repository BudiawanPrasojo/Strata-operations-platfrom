import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Truck, Fuel, Shield, Gauge, Activity } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useEquipment } from '../../hooks/useEquipment';

const iconMap = { TrendingUp, Truck, Fuel, Shield, Gauge, Activity };

const accentMap = {
  industrial: { color: 'var(--amber)',   dim: 'var(--amber-dim)', edge: 'var(--amber-edge)' },
  info:       { color: '#3B82F6',        dim: 'rgba(59,130,246,0.08)',  edge: 'rgba(59,130,246,0.20)' },
  amber:      { color: 'var(--amber)',   dim: 'var(--amber-dim)', edge: 'var(--amber-edge)' },
  success:    { color: 'var(--ok)',      dim: 'rgba(34,197,94,0.08)',   edge: 'rgba(34,197,94,0.20)' },
  steel:      { color: 'var(--cyan)',    dim: 'var(--cyan-dim)',  edge: 'var(--cyan-edge)' },
};

function Bar({ color, pct }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 300); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ height: '2px', background: 'var(--border-hard)', borderRadius: '1px', marginTop: '12px', overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${w}%`,
        background: color,
        borderRadius: '1px',
        transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
      }} />
    </div>
  );
}

export default function KPICards() {
  const { kpiSummary, loading: analyticsLoading } = useAnalytics();
  const { equipment, loading: equipLoading } = useEquipment();

  // Hitung active equipment dari data live Supabase
  const activeCount  = equipment ? equipment.filter(e => e.status === 'Active').length  : null;
  const totalCount   = equipment ? equipment.length : null;

  // Parse % change dari string "+3.2%" → angka, untuk badge
  function parseChangePct(str) {
    if (!str) return null;
    const n = parseFloat(str.replace('%', ''));
    return isNaN(n) ? null : n;
  }

  // Hitung bar pct dari nilai numerik (skala tergantung KPI)
  function barPct(numericVal, scale = 200) {
    if (numericVal === null || numericVal === undefined || isNaN(numericVal)) return 50;
    return Math.min(100, Math.max(8, (numericVal / scale) * 100));
  }

  // ── Definisi KPI cards — semua value dari useAnalytics / useEquipment ──────
  const totalProductionNum = parseFloat(
    (kpiSummary?.totalProduction?.value || '0').replace(/[^\d.]/g, '')
  );
  const fuelNum = parseFloat(
    (kpiSummary?.fuelConsumed?.value || '0').replace(/[^\d.]/g, '')
  );
  const safetyNum = parseFloat(kpiSummary?.safetyIncidents?.value || '0');
  const effNum    = parseFloat(
    (kpiSummary?.avgEfficiency?.value || '0').replace(/[^\d.%]/g, '')
  );

  const cards = [
    {
      id:     'daily-production',
      title:  'Total Production',
      value:  kpiSummary?.totalProduction?.value  ?? '—',
      unit:   '',
      change: parseChangePct(kpiSummary?.totalProduction?.change),
      positive: kpiSummary?.totalProduction?.positive ?? true,
      icon:   'TrendingUp',
      color:  'industrial',
      barVal: barPct(totalProductionNum, 100),   // events, skala 100
    },
    {
      id:     'active-equipment',
      title:  'Active Equipment',
      value:  activeCount !== null ? String(activeCount) : '—',
      unit:   totalCount !== null ? `of ${totalCount}` : '',
      change: null,
      positive: true,
      icon:   'Truck',
      color:  'info',
      barVal: activeCount !== null && totalCount
        ? Math.round((activeCount / totalCount) * 100)
        : 50,
    },
    {
      id:     'fuel-consumption',
      title:  'Fuel Consumed',
      value:  kpiSummary?.fuelConsumed?.value ?? '—',
      unit:   '',
      change: parseChangePct(kpiSummary?.fuelConsumed?.change),
      positive: kpiSummary?.fuelConsumed?.positive ?? true,
      icon:   'Fuel',
      color:  'amber',
      barVal: barPct(fuelNum, 70000),  // total 7-day liters, skala 70k
    },
    {
      id:     'safety-score',
      title:  'Safety Incidents',
      value:  kpiSummary?.safetyIncidents?.value ?? '—',
      unit:   'incidents',
      change: parseChangePct(kpiSummary?.safetyIncidents?.change),
      positive: kpiSummary?.safetyIncidents?.positive ?? true,
      icon:   'Shield',
      color:  'success',
      barVal: safetyNum === 0 ? 100 : Math.max(8, 100 - safetyNum * 10),
    },
    {
      id:     'operational-efficiency',
      title:  'Avg Efficiency',
      value:  kpiSummary?.avgEfficiency?.value ?? '—',
      unit:   '',
      change: parseChangePct(kpiSummary?.avgEfficiency?.change),
      positive: kpiSummary?.avgEfficiency?.positive ?? true,
      icon:   'Gauge',
      color:  'steel',
      barVal: isNaN(effNum) ? 50 : Math.min(100, effNum),
    },
  ];

  const isLoading = analyticsLoading || equipLoading;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '12px',
    }}>
      {cards.map((kpi, idx) => {
        const Icon    = iconMap[kpi.icon] || Activity;
        const accent  = accentMap[kpi.color] || accentMap.steel;
        const changePct = kpi.change;
        const isPositive = kpi.positive;

        return (
          <div
            key={kpi.id}
            className="animate-fade-up"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-hard)',
              borderTop: `2px solid ${accent.color}`,
              borderRadius: '4px',
              padding: '16px',
              animationDelay: `${idx * 60}ms`,
              transition: 'border-color 0.2s, background 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--bg-elevated)';
              e.currentTarget.style.borderColor = accent.edge;
              e.currentTarget.style.borderTopColor = accent.color;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--bg-surface)';
              e.currentTarget.style.borderColor = 'var(--border-hard)';
              e.currentTarget.style.borderTopColor = accent.color;
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{
                padding: '6px',
                background: accent.dim,
                border: `1px solid ${accent.edge}`,
                borderRadius: '4px',
              }}>
                <Icon size={14} color={accent.color} />
              </div>
              {changePct !== null && (
                <div className={`badge ${isPositive ? 'badge-ok' : 'badge-alert'}`} style={{ fontSize: '0.58rem' }}>
                  {isPositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  {Math.abs(changePct).toFixed(1)}%
                </div>
              )}
            </div>

            {/* Value */}
            <div className="kpi-value" style={{ fontSize: '1.5rem', marginBottom: '2px' }}>
              {isLoading ? (
                <div style={{ height: '28px', width: '70%', background: 'var(--bg-elevated)', borderRadius: '3px' }} />
              ) : (
                <>
                  {kpi.value}
                  {kpi.unit && (
                    <span style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.65rem',
                      color: 'var(--ink-muted)',
                      marginLeft: '4px',
                      fontWeight: 400,
                    }}>
                      {kpi.unit}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Label */}
            <div style={{
              fontSize: '0.72rem',
              color: 'var(--ink-secondary)',
              fontWeight: 500,
            }}>
              {kpi.title}
            </div>

            <Bar color={accent.color} pct={isLoading ? 0 : kpi.barVal} />
          </div>
        );
      })}
    </div>
  );
}
