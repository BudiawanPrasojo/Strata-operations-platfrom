import { useState, useEffect } from 'react';
import { Truck, Wrench, Activity, ChevronRight } from 'lucide-react';
import { useEquipment } from '../../hooks/useEquipment';
import Card, { CardHeader } from '../common/Card';
import StatusBadge from '../common/StatusBadge';

function AnimatedBar({ value, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 300 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  const barColor =
    value >= 80 ? '#22c55e' : value >= 60 ? '#f59e0b' : '#ef4444';
  const glowColor =
    value >= 80 ? 'rgba(34,197,94,0.4)' : value >= 60 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)';

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: '5px', background: 'rgba(255,255,255,0.05)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${barColor}80, ${barColor})`,
            boxShadow: `0 0 6px ${glowColor}`,
            transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>
      <span
        className="text-[11px] font-bold tabular-nums w-9 text-right flex-shrink-0"
        style={{ color: barColor, fontFamily: 'var(--font-mono)' }}
      >
        {value}%
      </span>
    </div>
  );
}

export default function EquipmentStatusPanel() {
  const { equipment } = useEquipment();
  const displayEquipment = equipment.slice(0, 4);
  const activeCount = equipment.filter(e => e.status === 'Active').length;

  return (
    <Card className="h-full">
      <CardHeader
        title="Equipment Status"
        subtitle={`${activeCount} of ${equipment.length} units active`}
        icon={Truck}
        action={
          <button
            className="flex items-center gap-1 text-xs font-bold transition-colors"
            style={{ color: 'var(--orange)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ff8c33'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--orange)'}
          >
            ALL
            <ChevronRight size={12} />
          </button>
        }
      />

      <div className="space-y-3">
        {displayEquipment.map((eq, idx) => (
          <div
            key={eq.id}
            className="rounded-xl p-3.5 transition-all duration-200 cursor-default"
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(52,58,64,0.35)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(52,58,64,0.65)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
              e.currentTarget.style.borderColor = 'rgba(52,58,64,0.35)';
            }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: eq.status === 'Maintenance'
                      ? 'rgba(245,158,11,0.12)'
                      : 'rgba(232,96,10,0.10)',
                    border: eq.status === 'Maintenance'
                      ? '1px solid rgba(245,158,11,0.25)'
                      : '1px solid rgba(232,96,10,0.20)',
                  }}
                >
                  {eq.status === 'Maintenance' ? (
                    <Wrench size={14} color="#f59e0b" />
                  ) : (
                    <Activity size={14} color="var(--orange)" />
                  )}
                </div>
                <div>
                  <p
                    className="font-semibold leading-tight"
                    style={{ fontSize: '0.875rem', color: 'var(--ink-primary)' }}
                  >
                    {eq.name}
                  </p>
                  <p
                    className="text-[10px] tracking-wider mt-0.5"
                    style={{ color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)' }}
                  >
                    {eq.location}
                  </p>
                </div>
              </div>
              <StatusBadge status={eq.status} />
            </div>

            {/* Health/Utilization bars */}
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span
                    className="text-[10px] font-semibold tracking-widest uppercase"
                    style={{ color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)' }}
                  >
                    Health
                  </span>
                </div>
                <AnimatedBar value={eq.health} delay={idx * 100} />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span
                    className="text-[10px] font-semibold tracking-widest uppercase"
                    style={{ color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)' }}
                  >
                    Utilization
                  </span>
                </div>
                <AnimatedBar value={eq.utilization} delay={idx * 100 + 80} />
              </div>
            </div>

            {/* Footer metrics */}
            <div
              className="flex items-center justify-between mt-3 pt-3"
              style={{ borderTop: '1px solid rgba(52,58,64,0.30)' }}
            >
              <div className="flex items-center gap-1">
                <span className="text-[10px]" style={{ color: 'var(--ink-muted)' }}>MAINT</span>
                <span className="text-[10px] font-bold" style={{ color: 'var(--ink-secondary)' }}>{eq.maintenance}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px]" style={{ color: 'var(--ink-muted)' }}>FUEL</span>
                <span
                  className="text-[10px] font-bold"
                  style={{
                    color: eq.fuelLevel >= 50 ? '#22c55e' : eq.fuelLevel >= 25 ? '#f59e0b' : '#ef4444',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {eq.fuelLevel}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
