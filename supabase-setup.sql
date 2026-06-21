-- ============================================================
-- Smart Mining Operations Platform — Supabase Setup
-- ============================================================
-- Jalankan file ini di: Supabase → SQL Editor → New Query
-- Jalankan SATU BLOK sekaligus, cek hasilnya, baru lanjut
-- ============================================================


-- ============================================================
-- BLOK 1: Tabel operational_events (untuk Live Feed)
-- ============================================================

CREATE TABLE IF NOT EXISTS operational_events (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  timestamp   TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('movement','anomaly','maintenance','ai','safety','production')),
  message     TEXT NOT NULL,
  severity    TEXT NOT NULL CHECK (severity IN ('info','warning','danger','success')),
  sector      TEXT,
  unit_id     TEXT,
  acknowledged BOOLEAN DEFAULT FALSE,
  operator    TEXT
);

-- Enable realtime
ALTER TABLE operational_events REPLICA IDENTITY FULL;

-- Index untuk query terbaru
CREATE INDEX IF NOT EXISTS idx_events_created ON operational_events (created_at DESC);

-- ============================================================
-- BLOK 2: Seed data operational_events (20 rows realistis)
-- ============================================================

INSERT INTO operational_events (timestamp, type, message, severity, sector, unit_id, operator) VALUES
('08:42:15', 'movement',    'Truck DT-09 masuk Sektor B — Hauling Route Alpha aktif',              'info',    'Sector B', 'DT-09', 'M. Johnson'),
('08:39:22', 'anomaly',     'Fuel anomaly terdeteksi pada EX-14 — konsumsi 23% di atas baseline',  'warning',  'Sector A', 'EX-14', 'R. Martinez'),
('08:36:08', 'maintenance', 'Maintenance warning — DR-03 mendekati batas jam operasional',         'warning',  'Workshop', 'DR-03', NULL),
('08:33:41', 'ai',          'Risiko kemacetan Route C teridentifikasi — probabilitas 78%',          'danger',   'Sector C', NULL,    NULL),
('08:30:19', 'safety',      'Fatigue alert — Operator J. Wilson mendekati batas jam shift',        'warning',  NULL,       NULL,    'J. Wilson'),
('08:27:55', 'production',  'Target harian Sektor A tercapai — 4.200 ton diekstraksi',             'success',  'Sector A', NULL,    NULL),
('08:24:33', 'movement',    'Bulldozer BD-11 reposisi ke Sektor D — penyesuaian grade',            'info',     'Sector D', 'BD-11', 'A. Chen'),
('08:21:10', 'ai',          'Prediksi maintenance EX-14 diperlukan dalam 36 jam operasional',      'warning',  'Sector A', 'EX-14', NULL),
('08:18:45', 'movement',    'DT-07 selesai unloading di Processing Plant — kembali ke Sektor B',   'info',     'Sector B', 'DT-07', 'K. Thompson'),
('08:15:22', 'safety',      'Zona aman diaktifkan di Sektor C — blasting terjadwal 14:00',        'warning',  'Sector C', NULL,    'P. Davis'),
('08:12:09', 'production',  'Shift B mulai — 38 operator aktif, semua posisi terisi',              'success',  NULL,       NULL,    'L. Wang'),
('08:09:33', 'anomaly',     'Tekanan hidrolik rendah terdeteksi pada EX-22 — monitoring aktif',    'warning',  'Sector C', 'EX-22', NULL),
('08:06:17', 'maintenance', 'Servis rutin DT-07 selesai — unit kembali operasional',               'success',  'Workshop', 'DT-07', NULL),
('08:03:51', 'movement',    'Konvoi 3 unit DT memasuki Route Beta — kapasitas 85%',               'info',     'Sector B', NULL,    NULL),
('08:01:28', 'ai',          'Optimasi rute tersedia — jalur Sektor D hemat fuel 12%',              'info',     'Sector D', NULL,    NULL),
('07:58:44', 'safety',      'Inspeksi pre-shift selesai — semua 41 unit lulus pemeriksaan',        'success',  NULL,       NULL,    'P. Davis'),
('07:55:19', 'production',  'Sektor B melaporkan produksi 3.850 ton — 85.6% dari target',         'info',     'Sector B', NULL,    NULL),
('07:52:03', 'anomaly',     'Konsumsi fuel Depot B — 47L tidak tercatat, sedang investigasi',     'danger',   NULL,       NULL,    NULL),
('07:48:37', 'movement',    'Grader GR-05 mulai operasi perataan jalur Sektor A–B',               'info',     'Sector A', 'GR-05', NULL),
('07:45:12', 'maintenance', 'Jadwal maintenance BD-11 diperbarui — mundur 3 hari (kondisi baik)', 'info',     NULL,       'BD-11', NULL);


-- ============================================================
-- BLOK 3: Tabel equipment (untuk Equipment Page)
-- ============================================================

CREATE TABLE IF NOT EXISTS equipment (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('Active','Idle','Maintenance')),
  health          INTEGER CHECK (health BETWEEN 0 AND 100),
  utilization     INTEGER CHECK (utilization BETWEEN 0 AND 100),
  maintenance     TEXT,
  location        TEXT,
  operator        TEXT,
  fuel_level      INTEGER CHECK (fuel_level BETWEEN 0 AND 100),
  hours_today     NUMERIC(4,1),
  last_service    TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BLOK 4: Seed data equipment
-- ============================================================

INSERT INTO equipment VALUES
('EX-14', 'Excavator EX-14',     'Excavator',  'Active',      72,  85, 'Due Soon',    'Sector A', 'R. Martinez', 64,  6.5, '12 days ago'),
('DT-07', 'Dump Truck DT-07',    'Dump Truck', 'Active',      91,  78, 'Good',        'Sector B', 'K. Thompson', 82,  5.2, '3 days ago'),
('DR-03', 'Drill Unit DR-03',    'Drill',      'Maintenance', 45,   0, 'In Progress', 'Workshop', 'Unassigned',  30,  0.0, 'Today'),
('BD-11', 'Bulldozer BD-11',     'Bulldozer',  'Active',      88,  62, 'Good',        'Sector D', 'A. Chen',     71,  4.8, '7 days ago'),
('DT-09', 'Dump Truck DT-09',    'Dump Truck', 'Active',      95,  90, 'Good',        'Sector B', 'M. Johnson',  55,  7.1, '5 days ago'),
('EX-22', 'Excavator EX-22',     'Excavator',  'Idle',        83,   0, 'Good',        'Sector C', 'Standby',     90,  0.0, '2 days ago'),
('GR-05', 'Grader GR-05',        'Grader',     'Active',      79,  55, 'Good',        'Sector A', 'B. Santos',   68,  3.2, '9 days ago'),
('DT-12', 'Dump Truck DT-12',    'Dump Truck', 'Active',      87,  81, 'Good',        'Sector C', 'H. Wijaya',   74,  6.8, '4 days ago'),
('EX-08', 'Excavator EX-08',     'Excavator',  'Active',      94,  92, 'Good',        'Sector B', 'S. Pratama',  88,  7.5, '1 day ago'),
('DR-07', 'Drill Unit DR-07',    'Drill',      'Idle',        68,   0, 'Scheduled',   'Sector D', 'Standby',     45,  0.0, '15 days ago')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- BLOK 5: Row Level Security (RLS) — baca publik, tulis terlindungi
-- ============================================================

ALTER TABLE operational_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- Izinkan SELECT untuk semua (anon key cukup untuk baca)
CREATE POLICY "allow_read_events"
  ON operational_events FOR SELECT
  USING (true);

CREATE POLICY "allow_read_equipment"
  ON equipment FOR SELECT
  USING (true);

-- Izinkan INSERT untuk anon (agar feed bisa menambah events baru)
CREATE POLICY "allow_insert_events"
  ON operational_events FOR INSERT
  WITH CHECK (true);


-- ============================================================
-- BLOK 6: Verifikasi — jalankan ini terakhir untuk cek
-- ============================================================

SELECT 'operational_events' as table_name, COUNT(*) as row_count FROM operational_events
UNION ALL
SELECT 'equipment', COUNT(*) FROM equipment;

-- Hasil yang diharapkan:
-- operational_events | 20
-- equipment          | 10
