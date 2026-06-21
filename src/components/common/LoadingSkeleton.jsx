/**
 * LoadingSkeleton — shimmer loader sesuai design system Dark Technical
 * Usage: <LoadingSkeleton rows={5} height={40} />
 */
export default function LoadingSkeleton({ rows = 4, height = 36 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px 0' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: `${height}px`,
            borderRadius: '4px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 100%)',
            backgroundSize: '200% 100%',
            animation: `shimmer 1.5s ease-in-out ${i * 0.1}s infinite`,
            opacity: 1 - i * 0.1,
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
