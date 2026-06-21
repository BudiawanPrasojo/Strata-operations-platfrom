# Smart Mining Operations Platform

> Operational Control Room Interface untuk industri tambang — membantu Shift Supervisor dan Operations Manager memonitor, menganalisis, dan merespons kondisi operasional secara real-time dari satu layar terpadu.

Platform ini bukan SCADA atau DCS. SMOP adalah **Decision Support Interface** — lapisan intelligence di atas data operasional yang memberikan konteks, visualisasi, dan rekomendasi berbasis aturan untuk membantu operator membuat keputusan lebih cepat dan lebih tepat.

---

## Tech Stack

| Layer | Teknologi | Keterangan |
|---|---|---|
| UI Framework | React 18 + Vite | Component-based, fast HMR |
| Routing | React Router DOM v6 | Client-side, nested routes |
| Styling | Tailwind CSS v3 | Custom design tokens |
| Charting | Chart.js + react-chartjs-2 | Canvas-based, interactive |
| Icons | Lucide React | Consistent, tree-shakeable |
| Backend | Supabase | PostgreSQL + Realtime |
| Language | JavaScript (JSX) | No TypeScript |

---

## Fitur Utama

### Dashboard — Command View
Layar utama yang menampilkan seluruh kondisi site. Terdiri dari:
- **Command Center Status Bar** — system load, comm link, operators online, safety index
- **KPI Cards** — production, equipment aktif, fuel, safety score, efficiency
- **Live Operational Feed** — stream kejadian real-time dari Supabase dengan fallback mock data
- **Tactical Mining Map** — peta site dengan overlay equipment dan haul route
- **Tactical Alert Center** — alert yang membutuhkan perhatian segera

### Operational Intelligence Engine
Rule-based analysis — bukan AI generatif. Setiap insight memiliki:
- **Detection Basis** yang transparan (aturan dan data yang memicu)
- **Confidence score** berdasarkan kualitas data
- **Recommended Action** yang spesifik

### Decision Impact Simulator
Pilih skenario operasional → lihat proyeksi dampak multi-dimensi secara instan:
- EX-14 Unexpected Breakdown
- Heavy Rain Protocol Activated
- Close Route B Temporarily
- Workforce Shortage Event
- Activate Sector D Expansion

### Domino Effect Engine
Visualisasi cascade effect dari satu insiden — dari root cause hingga kerugian finansial akhir. Setiap tahap dikuantifikasi dan terhubung ke skenario yang dipilih di Decision Simulator.

### Equipment Monitor
- Summary bar: total, active, idle, maintenance
- Tabel sortable dengan filter status dan search
- Detail panel slide-in per unit (health gauge, fuel bar, hours, operator)
- Data dari Supabase dengan fallback mock data
- Export CSV

### Fuel Intelligence
- Konsumsi fuel aktual vs baseline (Chart.js)
- Anomaly detection engine — rule-based, bukan AI
- Per-unit fuel table dengan deviation tracking
- Cost projection (IDR)

### Safety Center
- Safety score dengan ring progress visual
- Incident log dengan filter severity dan status
- Worker fatigue monitoring
- Compliance checklist harian

---

## Cara Run

```bash
# 1. Clone project
git clone <repo-url>
cd smart-mining-platform

# 2. Install dependencies
npm install

# 3. Setup environment (optional — app berjalan dengan mock data tanpa ini)
cp .env.example .env
# Edit .env dan isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY

# 4. Jalankan dev server
npm run dev
```

App berjalan di `http://localhost:5173`

> **Tanpa .env:** App tetap berjalan menggunakan mock data dari `src/data/mockData.js`. Badge "OFFLINE" menggantikan "LIVE" di feed dan komponen yang menggunakan Supabase.

---

## Setup Supabase (Optional)

1. Buat project di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** → jalankan `supabase-setup.sql` (ada di root project) blok per blok
3. Salin kredensial dari **Settings → API** ke file `.env`
4. Restart dev server

---

## Struktur Project

```
smart-mining-platform/
├── src/
│   ├── components/
│   │   ├── common/           — LoadingSkeleton, ErrorState, EmptyState
│   │   ├── dashboard/        — semua komponen Dashboard
│   │   └── layout/           — Sidebar, TopNavbar, Layout
│   ├── hooks/
│   │   ├── useOperationalEvents.js   — fetch events dari Supabase
│   │   └── useEquipment.js           — fetch equipment dari Supabase
│   ├── pages/                — 10 halaman aplikasi
│   ├── services/
│   │   └── supabase.js       — Supabase client (baca dari .env)
│   ├── utils/
│   │   └── exportCSV.js      — CSV export utility
│   └── data/
│       └── mockData.js       — fallback data (tidak dihapus)
├── supabase-setup.sql        — SQL schema + seed data
├── .env.example              — template environment variables
└── README.md
```

---

## Applicable Concepts for Industrial Operations

Platform ini membangun konsep-konsep yang langsung relevan dengan sistem nyata di industri tambang dan migas:

| Feature in SMOP | Industrial Equivalent | Relevant For |
|---|---|---|
| Decision Impact Simulator | What-if analysis in SCADA/MES | OT Engineer, Ops Manager |
| Domino Effect Engine | Root cause cascade analysis (RCA) | Digital Transformation Engineer |
| Fuel Anomaly Detection | Process deviation alarm (DCS) | OT Engineer, Fleet Manager |
| Maintenance Prediction | Predictive maintenance trigger | Asset Management Team |
| Live Operational Feed | Event historian / alarm log | Shift Supervisor, Operator |
| Equipment Status Panel | Asset tracking system (EAM) | Fleet Manager |
| KPI Cards | OEE dashboard (Overall Equipment Effectiveness) | Operations Manager |
| Shift-aware layout | Shift report & handover system | All operational roles |
| Rule-based Intelligence | Expert system / decision support | Digital Transformation |
| Realtime Supabase | SCADA historian subscription | OT Engineer |

---

## Roadmap

- [x] Dashboard — command view
- [x] Equipment monitor dengan Supabase integration
- [x] Live operational feed dengan realtime subscription
- [x] Decision Impact Simulator
- [x] Domino Effect Engine
- [x] Operational Intelligence Engine (rule-based)
- [x] Fuel Intelligence page
- [x] Safety Center page
- [ ] KPI Threshold Alert system
- [ ] Shift Handover Summary generator
- [ ] Analytics page dengan chart dari Supabase
- [ ] CSV export di semua halaman
- [ ] Responsive mobile view

---

## Author

Mahasiswa Computer Science — BINUS University  
Fokus: Operations Technology · Industrial Software · Digital Transformation  
Target Industri: Petrosea · PAMA · United Tractors · Pertamina · Freeport Indonesia
