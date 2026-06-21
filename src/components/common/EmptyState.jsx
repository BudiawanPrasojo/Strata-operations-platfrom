import { Inbox } from 'lucide-react';

/**
 * EmptyState — untuk tabel atau feed yang kosong
 * Usage: <EmptyState title="Tidak ada event" description="Belum ada kejadian tercatat." />
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Tidak ada data',
  description = 'Belum ada data yang tersedia.',
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      gap: '10px',
    }}>
      <Icon size={24} color="var(--ink-ghost)" strokeWidth={1.5} />
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          color: 'var(--ink-muted)',
          marginBottom: '4px',
        }}>
          {title}
        </div>
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--ink-ghost)',
          lineHeight: 1.5,
        }}>
          {description}
        </p>
      </div>
    </div>
  );
}
