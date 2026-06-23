# STRATA — Smart Tactical Resource & Analytics Platform

> Production-grade mining operations intelligence dashboard.  
> Real-time equipment telemetry · Fuel anomaly detection · Safety incident tracking · AI-powered shift handover.

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://strata-operations-platfrom.vercel.app)
[![Repository](https://img.shields.io/badge/Repository-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/BudiawanPrasojo/Strata-operations-platfrom)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=for-the-badge&logo=react)](https://react.dev)

</div>

---

## Live Demo

**[→ strata-operations-platfrom.vercel.app](https://strata-operations-platfrom.vercel.app)**

The live demo runs on static mock data — no credentials required.  
To connect your own Supabase instance, see [Environment Setup](#environment-setup).

| Credential | Value     |
|------------|-----------|
| Email      | `demo@strata.io` |
| Password   | `demo1234` |

---

## Screenshots

> Live demo: **[strata-operations-platfrom.vercel.app](https://strata-operations-platfrom.vercel.app)**  
> Screenshots akan ditambahkan setelah final deployment. Lihat live demo untuk tampilan lengkap.

| Page | Description |
|---|---|
| **Dashboard** | KPI cards, tactical map, live feed, domino-effect alerts |
| **Tactical Map** | Real-time equipment position & zone status (SVG) |
| **Fuel Intelligence** | Anomaly detection, consumption heatmap, route optimizer |
| **Safety Center** | Incident tracker, compliance overview, worker log |
| **Shift Handover** | Structured changeover summary with threshold alerts |

---

## Features

- **Real-Time Equipment Monitoring** — Fleet health, utilisation, maintenance status, and operator assignment across all sectors.
- **Fuel Anomaly Detection** — Threshold-based alerts for suspicious consumption patterns, with `Investigating` / `Critical` / `Resolved` status tracking.
- **Safety Incident Management** — Severity-ranked incident log (Near Miss → Critical) with open/resolved workflow.
- **KPI Threshold Alert Engine** — `evaluateThresholds()` pure function unifies alerts from equipment, fuel, safety, and operational events into a single sorted panel.
- **Shift Handover Summary** — Data-driven handover page: active alerts, equipment status, recommended actions, and pre-built narrative for incoming supervisor.
- **Operational Intelligence Feed** — Live event stream (movement · anomaly · maintenance · AI · safety · production) with Supabase Realtime subscription.
- **Analytics Dashboard** — Trend charts for production output, fuel consumption, efficiency, and safety incidents with 7 / 30 / 90-day range selector.
- **Tactical Map** — Geospatial sector view with equipment positioning and status overlays.
- **Graceful Fallback** — Every data hook falls back to rich static mock data automatically when Supabase is not configured — zero broken state in demos.

---

## Architecture

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the full technical reference including:

- System overview diagram
- Directory structure
- Custom hook catalogue and interface contract
- Supabase integration details (Auth, Realtime, RLS)
- PostgreSQL schema (all 4 tables)
- Data flow diagrams
- Bundle split strategy

### Quick Overview

```
src/
├── pages/          # 11 lazy-loaded route pages
├── components/     # Shared UI — Layout, Auth, Common, Dashboard
├── hooks/          # 5 data hooks (Supabase + mock fallback)
├── services/       # Supabase client + configuration guard
├── utils/          # thresholds.js — shared KPI evaluation logic
└── data/           # mockData.js — static fallback for all hooks
```

---

## Tech Stack

| Category        | Technology              |
|-----------------|-------------------------|
| Framework       | React 18                |
| Bundler         | Vite 5                  |
| Routing         | React Router DOM 6      |
| Styling         | Tailwind CSS + CSS vars |
| Icons           | Lucide React            |
| Database        | Supabase (PostgreSQL)   |
| Realtime        | Supabase Realtime       |
| Auth            | Supabase Auth           |
| Hosting         | Vercel                  |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
# Clone
git clone https://github.com/BudiawanPrasojo/Strata-operations-platfrom.git
cd Strata-operations-platfrom

# Install dependencies
npm install

# Start development server (mock data — no Supabase needed)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Environment Setup

To connect a live Supabase database:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run the database schema:

```bash
# In Supabase Dashboard → SQL Editor → paste and run:
supabase-setup.sql
```

Restart the dev server — the app will automatically switch from mock to live data.

---

## Project Structure

```
Strata-operations-platfrom/
├── src/
│   ├── App.jsx                  # Root — all routes with React.lazy
│   ├── pages/                   # Route-level pages (11 total)
│   ├── components/              # Shared components
│   ├── hooks/                   # Data hooks (useEquipment, useFuel, etc.)
│   ├── services/supabase.js     # Client + config guard
│   ├── utils/thresholds.js      # Shared KPI threshold logic
│   ├── data/mockData.js         # Static fallback data
│   └── styles/
│       ├── index.css            # Global styles + CSS variables
│       └── responsive.css       # Responsive breakpoints
├── vite.config.js               # Build config with manualChunks
├── supabase-setup.sql           # Database DDL
├── ARCHITECTURE.md              # Full technical documentation
└── README.md                    # This file
```

---

## Build

```bash
npm run build       # Production build → dist/
npm run preview     # Preview production build locally
```

Build output uses manual chunk splitting for optimal caching:

| Chunk              | Contents                        |
|--------------------|---------------------------------|
| `vendor-react`     | React core + Router             |
| `vendor-supabase`  | Supabase SDK                    |
| `vendor-charts`    | Recharts + D3                   |
| `vendor-ui`        | Lucide React (tree-shaken)      |
| `[page]` × 11     | One async chunk per page        |

---

## Deployment

### Vercel (recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Manual

```bash
npm run build
# Upload dist/ to any static host (Netlify, Cloudflare Pages, S3+CloudFront)
```

---

## Database Schema

Four tables power the live data mode. Full DDL in [`supabase-setup.sql`](./supabase-setup.sql).

| Table                 | Primary use                       |
|-----------------------|-----------------------------------|
| `equipment`           | Fleet status, health, utilisation |
| `fuel_metrics`        | Consumption, efficiency, anomalies |
| `safety_incidents`    | Incident log with severity + status |
| `operational_events`  | Live event feed + Realtime stream  |

---

## Contributing

This is a portfolio project. Issues and PRs are welcome for bug fixes and documentation improvements.

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">
Built with React · Supabase · Vite · Vercel
</div>
