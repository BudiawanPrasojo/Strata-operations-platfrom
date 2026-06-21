import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, Zap, ShieldAlert, X, Bell } from 'lucide-react';
import Card, { CardHeader } from '../common/Card';

const SEVERITY = {
  CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.09)', border: 'rgba(239,68,68,0.30)', icon: Zap,          label: 'CRITICAL', rank: 4 },
  HIGH:     { color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.28)', icon: AlertTriangle, label: 'HIGH',     rank: 3 },
  MEDIUM:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', icon: AlertCircle,  label: 'MEDIUM',   rank: 2 },
  LOW:      { color: 'var(--cyan)', bg: 'rgba(6,182,212,0.06)', border: 'rgba(6,182,212,0.20)', icon: Info,         label: 'LOW',      rank: 1 },
};

const INITIAL_ALERTS = [
  { id: 1, level: 'CRITICAL', title: 'Fuel Anomaly Detected', detail: 'Fuel consumption spike 34% above threshold in Sector B. Possible leak detected.', time: '08:47', sector: 'Sector B' },
  { id: 2, level: 'HIGH',     title: 'Congestion Risk Increasing', detail: 'Traffic density near Haul Route C approaching capacity. AI predicts 18-min delay.', time: '08:45', sector: 'Route C' },
  { id: 3, level: 'HIGH',     title: 'Hydraulic Pressure Anomaly', detail: 'EX-14 hydraulic pressure reading outside normal operating range. Immediate inspection recommended.', time: '08:41', sector: 'Zone A' },
  { id: 4, level: 'MEDIUM',   title: 'Maintenance Recommended', detail: 'EX-14 has exceeded 480 operational hours since last service. Schedule maintenance within 24h.', time: '08:38', sector: 'Fleet' },
  { id: 5, level: 'MEDIUM',   title: 'Workforce Density Alert', detail: 'Team Alpha and Team Bravo overlap in Extraction Zone A. Recommend staggered deployment.', time: '08:35', sector: 'Zone A' },
  { id: 6, level: 'LOW',      title: 'Route Optimization Available', detail: 'AI identified alternate route saving est. 12 min per haul cycle on Route B.', time: '08:30', sector: 'Route B' },
  { id: 7, level: 'LOW',      title: 'Shift Transition Reminder', detail: 'Shift C handover due in 47 minutes. Confirm briefing scheduled.', time: '08:28', sector: 'Operations' },
];

const NEW_ALERT_POOL = [
  { level: 'HIGH',   title: 'Collision Risk Detected',    detail: 'Proximity sensors on DT-09 and DT-12 flagged near-miss event near Sector C junction.', sector: 'Sector C' },
  { level: 'MEDIUM', title: 'AI Anomaly Alert Generated', detail: 'AI model detected irregular drilling pattern on DR-03. Review recommended.', sector: 'Zone B' },
  { level: 'LOW',    title: 'Fuel Efficiency Reduction',  detail: 'DT-05 showing 8% lower fuel efficiency vs. baseline. Tire pressure check advised.', sector: 'Fleet' },
  { level: 'CRITICAL', title: 'Restricted Zone Breach',   detail: 'Unauthorized equipment movement detected in blasting perimeter Zone D. Halt issued.', sector: 'Zone D' },
  { level: 'MEDIUM', title: 'Scheduled Maintenance Due',  detail: 'DR-07 scheduled maintenance window starting in 15 minutes.', sector: 'Fleet' },
];

let alertIdCounter = 100;

function AlertCard({ alert, onDismiss }) {
  const cfg = SEVERITY[alert.level] || SEVERITY.LOW;
  const Icon = cfg.icon;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-12px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: '10px',
        padding: '10px 12px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle glow top */}
      {(alert.level === 'CRITICAL' || alert.level === 'HIGH') && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${cfg.color}60, transparent)`,
            animation: alert.level === 'CRITICAL' ? 'pulse 1.5s ease-in-out infinite' : 'none',
          }}
        />
      )}

      <div className="flex items-start gap-2.5">
        {/* Icon */}
        <div
          className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 mt-0.5"
          style={{
            background: `${cfg.color}18`,
            border: `1px solid ${cfg.color}30`,
            animation: alert.level === 'CRITICAL' ? 'pulse 1.8s ease-in-out infinite' : 'none',
          }}
        >
          <Icon size={13} style={{ color: cfg.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="font-mono font-bold tracking-widest flex-shrink-0"
                style={{ fontSize: '9px', color: cfg.color, letterSpacing: '0.12em' }}
              >
                {cfg.label}
              </span>
              <span
                className="font-semibold truncate"
                style={{ fontSize: '12px', color: 'var(--ink-primary)' }}
              >
                {alert.title}
              </span>
            </div>
            <span
              className="font-mono flex-shrink-0"
              style={{ fontSize: '9px', color: 'var(--ink-secondary)' }}
            >
              {alert.time}
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--ink-secondary)', lineHeight: 1.4 }}>
            {alert.detail}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="font-mono"
              style={{ fontSize: '9px', color: 'var(--ink-muted)', background: 'rgba(52,58,64,0.3)', padding: '1px 6px', borderRadius: '4px' }}
            >
              {alert.sector}
            </span>
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => onDismiss(alert.id)}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-md transition-all duration-150"
          style={{ color: 'var(--ink-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#adb5bd'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-muted)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

export default function TacticalAlertCenter() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [filter, setFilter] = useState('ALL');

  const dismissAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Periodically inject a new alert
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() > 0.55) {
        const template = NEW_ALERT_POOL[Math.floor(Math.random() * NEW_ALERT_POOL.length)];
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        setAlerts(prev => {
          const next = [{ ...template, id: ++alertIdCounter, time: timeStr }, ...prev];
          return next.slice(0, 12); // cap at 12
        });
      }
    }, 14000);
    return () => clearInterval(id);
  }, []);

  const levels = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const filtered = filter === 'ALL' ? alerts : alerts.filter(a => a.level === filter);
  const counts = levels.slice(1).reduce((acc, l) => {
    acc[l] = alerts.filter(a => a.level === l).length;
    return acc;
  }, {});

  const filterColor = (l) => SEVERITY[l]?.color || 'var(--orange)';

  return (
    <Card className="h-full">
      <CardHeader
        title="Tactical Alert Center"
        subtitle="Active operational alerts"
        icon={Bell}
        action={
          <div className="flex items-center gap-1.5">
            {counts.CRITICAL > 0 && (
              <span
                className="font-mono font-bold text-[9px] px-2 py-0.5 rounded tracking-widest"
                style={{ color: '#ef4444', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)', animation: 'pulse 1.5s ease-in-out infinite' }}
              >
                {counts.CRITICAL} CRIT
              </span>
            )}
            <span
              className="font-mono text-[9px] px-2 py-0.5 rounded tracking-widest"
              style={{ color: 'var(--ink-secondary)', background: 'rgba(52,58,64,0.25)', border: '1px solid rgba(52,58,64,0.3)' }}
            >
              {alerts.length} TOTAL
            </span>
          </div>
        }
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {levels.map(l => {
          const active = filter === l;
          const col = l === 'ALL' ? 'var(--orange)' : filterColor(l);
          const cnt = l === 'ALL' ? alerts.length : counts[l];
          return (
            <button
              key={l}
              onClick={() => setFilter(l)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono tracking-widest flex-shrink-0 transition-all duration-150"
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: active ? col : 'var(--ink-secondary)',
                background: active ? `${col}14` : 'transparent',
                border: `1px solid ${active ? col + '30' : 'rgba(52,58,64,0.25)'}`,
              }}
            >
              {l}
              {cnt > 0 && (
                <span style={{ color: active ? col : 'var(--ink-muted)', fontWeight: 800 }}>{cnt}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Alert list */}
      <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: '340px' }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <ShieldAlert size={28} style={{ color: 'var(--ink-muted)' }} />
            <p className="font-mono text-xs mt-2" style={{ color: 'var(--ink-muted)' }}>No alerts in this category</p>
          </div>
        ) : (
          [...filtered]
            .sort((a, b) => (SEVERITY[b.level]?.rank || 0) - (SEVERITY[a.level]?.rank || 0))
            .map(alert => (
              <AlertCard key={alert.id} alert={alert} onDismiss={dismissAlert} />
            ))
        )}
      </div>
    </Card>
  );
}
