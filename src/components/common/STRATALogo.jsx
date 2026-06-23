export default function STRATALogo({ collapsed = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-shrink-0">
        <svg
          width={collapsed ? 32 : 36}
          height={collapsed ? 32 : 36}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="2" y="2" width="32" height="32" rx="6" fill="url(#logo-gradient)" />
          <path
            d="M10 26V14L18 10L26 14V26L18 22L10 26Z"
            stroke="var(--ink-primary)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M18 10V22"
            stroke="var(--orange)"
            strokeWidth="1.5"
          />
          <path
            d="M10 14L26 14"
            stroke="var(--orange)"
            strokeWidth="1"
            strokeDasharray="2 2"
            opacity="0.5"
          />
          <circle cx="18" cy="16" r="2.5" fill="var(--orange)" opacity="0.9" />
          <circle cx="18" cy="16" r="4" stroke="var(--orange)" strokeWidth="0.5" opacity="0.3" />
          <defs>
            <linearGradient id="logo-gradient" x1="2" y1="2" x2="34" y2="34">
              <stop offset="0%" stopColor="#272c30" />
              <stop offset="100%" stopColor="#1c2023" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-graphite-900" />
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-wider text-graphite-100">STRATA</span>
          <span className="text-[9px] font-medium tracking-widest text-graphite-400 uppercase">Tactical Ops</span>
        </div>
      )}
    </div>
  );
}
