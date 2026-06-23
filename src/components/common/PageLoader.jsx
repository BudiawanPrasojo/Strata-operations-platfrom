/**
 * PageLoader — fallback component untuk React.lazy / Suspense boundary.
 * Digunakan sebagai loading state saat page-level component sedang di-load.
 */
export default function PageLoader() {
  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        gap:            '6px',
        padding:        '24px',
        width:          '100%',
        boxSizing:      'border-box',
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            height:           i === 0 ? '48px' : '36px',
            borderRadius:     '4px',
            background:       'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 100%)',
            backgroundSize:   '200% 100%',
            animation:        `shimmer 1.5s ease-in-out ${i * 0.08}s infinite`,
            opacity:          1 - i * 0.08,
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </div>
  );
}
