import { useState, useEffect } from 'react';
import { Cpu, Wifi, Users, Shield, Zap, Thermometer } from 'lucide-react';

const metrics = [
  { icon: Cpu,         label: 'SYSTEM LOAD',    value: '34%',    color: 'var(--ok)',    ok: true },
  { icon: Wifi,        label: 'COMM LINK',       value: '98.2%',  color: 'var(--ok)',    ok: true },
  { icon: Users,       label: 'OPERATORS',       value: '12',     color: 'var(--cyan)',  ok: true },
  { icon: Shield,      label: 'SAFETY INDEX',    value: '94.7',   color: 'var(--ok)',    ok: true },
  { icon: Zap,         label: 'POWER DRAW',      value: '2.4 MW', color: 'var(--amber)', ok: true },
  { icon: Thermometer, label: 'AMBIENT TEMP',    value: '31°C',   color: 'var(--warn)',  ok: false },
];

export default function CommandCenterStatusBar() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="panel"
      style={{
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        borderTop: '1px solid var(--border-hard)',
      }}
    >
      {metrics.map((m, i) => {
        const Icon = m.icon;
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 16px',
              borderRight: i < metrics.length - 1 ? '1px solid var(--border-hard)' : 'none',
              flexShrink: 0,
            }}
          >
            <div style={{
              padding: '5px',
              background: `${m.color}10`,
              border: `1px solid ${m.color}20`,
              borderRadius: '4px',
            }}>
              <Icon size={12} color={m.color} />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.55rem',
                letterSpacing: '0.1em',
                color: 'var(--ink-muted)',
                marginBottom: '2px',
              }}>
                {m.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div className="live-dot" style={{
                  width: '5px',
                  height: '5px',
                  background: m.color,
                }} />
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: m.color,
                }}>
                  {m.value}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
