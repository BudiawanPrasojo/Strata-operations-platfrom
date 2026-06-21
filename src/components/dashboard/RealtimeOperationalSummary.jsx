import { useState, useEffect, useRef } from 'react';
import { Cpu, Users, Gauge, Route, Shield, Wrench, TrendingUp } from 'lucide-react';
import Card, { CardHeader } from '../common/Card';

function useAnimatedCounter(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const startValRef = useRef(0);

  useEffect(() => {
    startValRef.current = value;
    startRef.current = null;
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(startValRef.current + (target - startValRef.current) * ease));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return value;
}

function MetricRow({ icon: Icon, label, value, unit, max, color, suffix = '', decimals = 0 }) {
  const pct = Math.min((value / max) * 100, 100);
  const animated = useAnimatedCounter(value);
  const displayVal = decimals > 0 ? (animated / 10 ** decimals).toFixed(decimals) : animated;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0"
            style={{ background: `${color}15`, border: `1px solid ${color}25` }}
          >
            <Icon size={11} style={{ color }} />
          </div>
          <span
            className="font-mono uppercase tracking-wide"
            style={{ fontSize: '10px', color: 'var(--ink-secondary)', letterSpacing: '0.08em' }}
          >
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-bold font-mono" style={{ fontSize: '13px', color }}>
            {displayVal}{suffix}
          </span>
          {unit && (
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--ink-secondary)' }}>
              {unit}
            </span>
          )}
        </div>
      </div>
      {/* Progress bar */}
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(52,58,64,0.4)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 6px ${color}55`,
          }}
        />
      </div>
    </div>
  );
}

const BASE_METRICS = {
  equipment: 42,
  workforce: 187,
  efficiency: 873,   // ×0.1 → 87.3%
  routeUtil: 762,    // ×0.1 → 76.2%
  safety: 947,       // ×0.1 → 94.7%
  maintQueue: 6,
};

export default function RealtimeOperationalSummary() {
  const [metrics, setMetrics] = useState(BASE_METRICS);

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics(prev => ({
        equipment: Math.max(38, Math.min(46, prev.equipment + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
        workforce: Math.max(175, Math.min(200, prev.workforce + (Math.random() > 0.8 ? Math.round((Math.random() - 0.5) * 4) : 0))),
        efficiency: Math.max(820, Math.min(960, prev.efficiency + Math.round((Math.random() - 0.5) * 8))),
        routeUtil: Math.max(650, Math.min(950, prev.routeUtil + Math.round((Math.random() - 0.5) * 10))),
        safety: Math.max(900, Math.min(999, prev.safety + Math.round((Math.random() - 0.48) * 3))),
        maintQueue: Math.max(3, Math.min(12, prev.maintQueue + (Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
      }));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className="h-full">
      <CardHeader
        title="Operational Summary"
        subtitle="Realtime KPI snapshot"
        icon={TrendingUp}
        action={
          <span
            className="text-[9px] font-bold font-mono tracking-widest px-2 py-1 rounded"
            style={{
              color: '#22c55e',
              background: 'rgba(34,197,94,0.10)',
              border: '1px solid rgba(34,197,94,0.22)',
            }}
          >
            LIVE
          </span>
        }
      />

      <div className="space-y-4">
        <MetricRow
          icon={Cpu}
          label="Active Equipment"
          value={metrics.equipment}
          unit="units"
          max={50}
          color="var(--orange)"
        />
        <MetricRow
          icon={Users}
          label="Active Workforce"
          value={metrics.workforce}
          unit="personnel"
          max={220}
          color="var(--cyan)"
        />
        <MetricRow
          icon={Gauge}
          label="Operational Efficiency"
          value={metrics.efficiency}
          suffix="%"
          max={1000}
          color="#22c55e"
          decimals={1}
        />
        <MetricRow
          icon={Route}
          label="Route Utilization"
          value={metrics.routeUtil}
          suffix="%"
          max={1000}
          color="#a78bfa"
          decimals={1}
        />
        <MetricRow
          icon={Shield}
          label="Safety Compliance"
          value={metrics.safety}
          suffix="%"
          max={1000}
          color="#22c55e"
          decimals={1}
        />
        <MetricRow
          icon={Wrench}
          label="Maintenance Queue"
          value={metrics.maintQueue}
          unit="pending"
          max={20}
          color="#f59e0b"
        />
      </div>
    </Card>
  );
}
