export default function Card({ children, className = '', hover = false, glow = false }) {
  return (
    <div
      className={`
        glass-panel rounded-xl p-5
        ${hover ? 'transition-all duration-300 hover:border-graphite-500/60 hover:translate-y-[-2px] hover:shadow-lg' : ''}
        ${glow ? 'glow-orange' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(232,96,10,0.18), rgba(232,96,10,0.06))',
              border: '1px solid rgba(232,96,10,0.25)',
            }}
          >
            <Icon size={18} className="text-industrial-400" />
          </div>
        )}
        <div>
          <h3
            className="font-bold leading-tight"
            style={{
              fontSize: '0.975rem',
              background: 'linear-gradient(135deg, var(--ink-primary) 0%, var(--ink-primary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-graphite-500 mt-0.5 font-mono tracking-wide">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
