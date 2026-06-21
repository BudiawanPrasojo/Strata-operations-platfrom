const statusConfig = {
  active:      { bg: 'rgba(34,197,94,0.12)',  text: '#22c55e', dot: '#22c55e',  border: 'rgba(34,197,94,0.25)',  label: 'Active' },
  idle:        { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', dot: '#94a3b8', border: 'rgba(148,163,184,0.25)', label: 'Idle' },
  maintenance: { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', dot: '#fbbf24', border: 'rgba(251,191,36,0.25)',  label: 'Maintenance' },
  danger:      { bg: 'rgba(239,68,68,0.12)',  text: '#ef4444', dot: '#ef4444', border: 'rgba(239,68,68,0.25)',   label: 'Danger' },
  warning:     { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', dot: '#f59e0b', border: 'rgba(245,158,11,0.25)',  label: 'Warning' },
  info:        { bg: 'rgba(59,130,246,0.12)', text: '#3b82f6', dot: '#3b82f6', border: 'rgba(59,130,246,0.25)',  label: 'Info' },
  success:     { bg: 'rgba(34,197,94,0.12)',  text: '#22c55e', dot: '#22c55e',  border: 'rgba(34,197,94,0.25)',  label: 'Success' },
  congested:   { bg: 'rgba(239,68,68,0.12)',  text: '#ef4444', dot: '#ef4444', border: 'rgba(239,68,68,0.25)',   label: 'Congested' },
};

export default function StatusBadge({ status }) {
  const key = status.toLowerCase();
  const config = statusConfig[key] || statusConfig.info;
  const isActive = key === 'active';

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide"
      style={{
        background: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.06em',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          background: config.dot,
          boxShadow: `0 0 4px ${config.dot}`,
          animation: isActive ? 'pulse 2s ease-in-out infinite' : 'none',
        }}
      />
      {status}
    </span>
  );
}
