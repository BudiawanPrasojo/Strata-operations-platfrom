/**
 * src/utils/exportCSV.js
 * Utility untuk export data ke file CSV
 * Trigger download otomatis di browser
 */

export function exportToCSV(data, filename = 'export') {
  if (!data || data.length === 0) {
    console.warn('[exportCSV] Tidak ada data untuk diexport');
    return;
  }

  // Ambil headers dari keys object pertama
  const headers = Object.keys(data[0]);

  // Convert ke CSV string
  const csvRows = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row =>
      headers.map(h => {
        const val = row[h] ?? '';
        // Quote kalau ada koma, newline, atau quote di dalamnya
        const str = String(val);
        return str.includes(',') || str.includes('\n') || str.includes('"')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    ),
  ].join('\n');

  // Tambah BOM untuk Excel compatibility
  const blob = new Blob(['\uFEFF' + csvRows], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);

  // Append tanggal ke filename
  const today = new Date().toISOString().split('T')[0];
  const link  = document.createElement('a');
  link.href     = url;
  link.download = `${filename}-${today}.csv`;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper khusus equipment — map key ke label yang lebih readable
export function exportEquipmentCSV(data) {
  const mapped = data.map(u => ({
    'Unit ID':      u.id,
    'Name':         u.name,
    'Type':         u.type,
    'Status':       u.status,
    'Location':     u.location,
    'Operator':     u.operator,
    'Health (%)':   u.health,
    'Fuel (%)':     u.fuelLevel,
    'Hours Today':  u.hoursToday,
    'Utilization (%)': u.utilization,
    'Maintenance':  u.maintenance,
    'Last Service': u.lastService,
  }));
  exportToCSV(mapped, 'strata-equipment');
}

// Helper khusus events
export function exportEventsCSV(data) {
  const mapped = data.map(e => ({
    'ID':        e.id,
    'Timestamp': e.timestamp,
    'Type':      e.type,
    'Severity':  e.severity,
    'Message':   e.message,
    'Sector':    e.sector || '-',
    'Unit ID':   e.unit_id || '-',
    'Operator':  e.operator || '-',
  }));
  exportToCSV(mapped, 'strata-events');
}
