# STRATA — Architecture Documentation

> Smart Tactical Resource & Analytics Platform  
> Production-ready mining operations intelligence dashboard built with React + Supabase.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Custom Hooks](#custom-hooks)
4. [Services Layer](#services-layer)
5. [Supabase Integration](#supabase-integration)
6. [PostgreSQL Schema](#postgresql-schema)
7. [Data Flow](#data-flow)
8. [Bundle Strategy](#bundle-strategy)
9. [Environment Configuration](#environment-configuration)

---

## System Overview

```
┌────────────────────────────────────────────────────────────┐
│                       Browser (React SPA)                  │
│                                                            │
│  Pages (lazy-loaded)  →  Custom Hooks  →  Supabase Client  │
│         ↓                     ↓                  ↓         │
│  Components              Mock Fallback      PostgreSQL      │
│  (shared UI)             (no .env)         (cloud DB)       │
└────────────────────────────────────────────────────────────┘
         ↑                                        ↑
     Vercel CDN                            Supabase Cloud
   (static deploy)                      (managed Postgres)
```

STRATA is a single-page application deployed on Vercel. All data is fetched
client-side via the Supabase JavaScript SDK. When Supabase credentials are not
configured (local dev or demo), every hook automatically falls back to static
`mockData` so the UI is always functional.

---

## Frontend Architecture

### Technology Stack

| Layer        | Technology                      | Version |
|--------------|---------------------------------|---------|
| Framework    | React                           | 18.x    |
| Bundler      | Vite                            | 5.x     |
| Routing      | React Router DOM                | 6.x     |
| Styling      | Tailwind CSS + CSS custom props | 3.x     |
| Icons        | Lucide React                    | latest  |
| Database SDK | Supabase JS                     | 2.x     |
| Deploy       | Vercel                          | —       |

### Directory Structure

```
src/
├── App.jsx                        # Root router — all page routes defined here
├── main.jsx                       # React DOM entry point
│
├── pages/                         # Route-level page components (lazy-loaded)
│   ├── Dashboard.jsx              # Main KPI overview
│   ├── Operations.jsx             # Live operational events feed
│   ├── Equipment.jsx              # Equipment fleet status
│   ├── TacticalMap.jsx            # Geospatial sector map
│   ├── FuelIntelligence.jsx       # Fuel anomaly detection
│   ├── SafetyCenter.jsx           # Safety incident tracker
│   ├── Analytics.jsx              # Trend charts and KPI analytics
│   ├── AIInsights.jsx             # AI-generated operational insights
│   ├── Reports.jsx                # Exportable shift reports
│   ├── Settings.jsx               # App and user preferences
│   ├── ShiftHandover.jsx          # Structured shift changeover summary
│   └── LoginPage.jsx              # Authentication (eager-loaded)
│
├── components/
│   ├── layout/
│   │   ├── Layout.jsx             # App shell: sidebar + main content area
│   │   └── Sidebar.jsx            # Navigation rail
│   ├── auth/
│   │   └── ProtectedRoute.jsx     # Auth guard for protected pages
│   ├── common/
│   │   ├── PageLoader.jsx         # Suspense fallback skeleton
│   │   ├── LoadingSkeleton.jsx    # In-component loading states
│   │   └── ErrorState.jsx         # Consistent error display
│   └── dashboard/
│       └── KPIThresholdAlertPanel.jsx  # Threshold-based alert engine
│
├── hooks/                         # Data-fetching hooks (see Custom Hooks)
│   ├── useEquipment.js
│   ├── useFuel.js
│   ├── useSafety.js
│   ├── useAnalytics.js
│   └── useOperationalEvents.js
│
├── services/
│   └── supabase.js                # Supabase client + configuration guard
│
├── utils/
│   └── thresholds.js              # Shared KPI threshold constants + evaluator
│
├── data/
│   └── mockData.js                # Static fallback data for all hooks
│
└── styles/
    ├── index.css                  # Global styles + CSS custom properties
    └── responsive.css             # Responsive breakpoint overrides
```

### Code Splitting

All page components are loaded with `React.lazy()` + `<Suspense>` in `App.jsx`.
`LoginPage` is eagerly loaded because it must render instantly before the auth
check completes. Every other page is a separate async chunk, loaded on first navigation.

```jsx
// App.jsx — pattern applied to all 11 protected pages
const Dashboard = lazy(() => import('./pages/Dashboard'));

<Route path="/" element={
  <Suspense fallback={<PageLoader />}>
    <Dashboard />
  </Suspense>
} />
```

---

## Custom Hooks

All hooks follow the same interface contract:

```ts
interface HookResult<T> {
  data:     T;          // typed payload
  loading:  boolean;    // true while fetching
  error:    string | null;
  source:   'supabase' | 'mock';
  refetch?: () => void; // not on useOperationalEvents (uses realtime)
}
```

### Hook Catalogue

#### `useEquipment` → `equipment[]`
Fetches all rows from the `equipment` table, ordered by `id`. Maps snake_case
DB columns (`fuel_level`, `hours_today`, `last_service`) to camelCase for
component consumption. `refetch()` uses the `refetchKey` pattern — incrementing
a state counter triggers the `useEffect` dependency to re-run cleanly.

#### `useFuel` → `fuelMetrics[]`
Fetches from `fuel_metrics`, ordered by `timestamp` descending. Adds computed
display aliases (`location`, `amount`, `time`) so the Anomaly Detection table
renders identically whether data comes from Supabase or mock. Strict source
isolation: on success, only Supabase data is set; on failure, only mock data.

#### `useSafety` → `incidents[]` (max 30)
Fetches from `safety_incidents`, ordered by `created_at` descending, limited
to 30 rows. Maps `incident_type` → `type`, `created_at` → `date` (ISO date
string). `refetch()` uses `refetchKey` pattern.

#### `useAnalytics(days)` → chart datasets + KPI summary
Aggregates data from `fuel_metrics` and `operational_events` into chart-ready
`{ labels, values }` datasets. Accepts `days` parameter (7 | 30 | 90) for
date-range filtering. Mock path generates data dynamically to match N days so
the UI feels responsive even without Supabase.

#### `useOperationalEvents` → `events[]` (max 30, realtime)
Fetches from `operational_events` ordered by `timestamp` descending, then
opens a Supabase Realtime channel for `INSERT` events. New events are prepended
to the list in real time. Channel name includes `Date.now() + Math.random()` to
prevent duplicate subscription errors when the hook is mounted by multiple
components simultaneously. Does not expose `refetch()` — realtime handles updates.

### Fallback Pattern

```js
// Every hook follows this guard at the top of useEffect:
if (!supabaseConfigured || !supabase) {
  setState(mockData);
  setSource('mock');
  setLoading(false);
  return;
}
```

---

## Services Layer

### `src/services/supabase.js`

Single export point for the Supabase client. Reads credentials from Vite
environment variables and validates them before creating the client:

```js
const isConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl !== 'https://your-project-ref.supabase.co'
);

export const supabase          = isConfigured ? createClient(url, key) : null;
export const supabaseConfigured = isConfigured;
```

All hooks import `{ supabase, supabaseConfigured }` and check `supabaseConfigured`
before issuing any query. This means the app works fully offline / in demo mode
with zero code changes.

---

## Supabase Integration

### Authentication

Supabase Auth is used for user session management. `ProtectedRoute` checks for
an active session and redirects to `/login` if none exists.

### Realtime

`useOperationalEvents` subscribes to Postgres changes on the
`operational_events` table using `supabase.channel()` with the
`postgres_changes` filter for `INSERT` events. The channel is removed on
component unmount via the `useEffect` cleanup function.

### Row-Level Security (RLS)

Enable RLS on all tables and restrict access to authenticated users:

```sql
ALTER TABLE equipment          ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_metrics        ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_incidents    ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_events  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read" ON equipment
  FOR SELECT TO authenticated USING (true);
-- Repeat for each table
```

---

## PostgreSQL Schema

Full DDL is in [`supabase-setup.sql`](./supabase-setup.sql).

### Table: `equipment`

| Column        | Type          | Notes                                      |
|---------------|---------------|--------------------------------------------|
| `id`          | `text` PK     | Human-readable ID e.g. `"EX-14"`          |
| `name`        | `text`        | Display name e.g. `"Excavator EX-14"`     |
| `type`        | `text`        | `"Excavator"` · `"Dump Truck"` · etc.     |
| `status`      | `text`        | `"Active"` · `"Idle"` · `"Maintenance"`   |
| `health`      | `integer`     | 0–100 %                                    |
| `utilization` | `integer`     | 0–100 %                                    |
| `maintenance` | `text`        | `"Good"` · `"Due Soon"` · `"Overdue"`     |
| `location`    | `text`        | Sector name e.g. `"Sector A"`             |
| `operator`    | `text`        | Operator display name                      |
| `fuel_level`  | `integer`     | 0–100 %                                    |
| `hours_today` | `numeric`     | Operating hours this shift                 |
| `last_service`| `text`        | Human-readable e.g. `"3 days ago"`        |

### Table: `fuel_metrics`

| Column            | Type          | Notes                          |
|-------------------|---------------|--------------------------------|
| `id`              | `bigserial` PK| Auto-increment                 |
| `site`            | `text`        | Site / location name           |
| `fuel_consumption`| `numeric`     | Litres consumed                |
| `fuel_efficiency` | `numeric`     | 0–100 %                        |
| `fuel_cost`       | `numeric`     | Monetary value                 |
| `status`          | `text`        | `"Normal"` · `"Investigating"` · `"Critical"` · `"Resolved"` |
| `timestamp`       | `timestamptz` | Record time (UTC)              |

### Table: `safety_incidents`

| Column          | Type          | Notes                                  |
|-----------------|---------------|----------------------------------------|
| `id`            | `bigserial` PK| Auto-increment                         |
| `incident_type` | `text`        | `"Near Miss"` · `"Equipment Failure"` · etc. |
| `severity`      | `text`        | `"info"` · `"warning"` · `"danger"` · `"critical"` · `"high"` |
| `location`      | `text`        | Sector or area name                    |
| `status`        | `text`        | `"Open"` · `"Under Review"` · `"Resolved"` · `"Closed"` |
| `created_at`    | `timestamptz` | Auto-set by Supabase                   |

### Table: `operational_events`

| Column          | Type          | Notes                                  |
|-----------------|---------------|----------------------------------------|
| `id`            | `bigserial` PK| Auto-increment                         |
| `timestamp`     | `timestamptz` | Event time (UTC)                       |
| `event_type`    | `text`        | `"movement"` · `"anomaly"` · `"maintenance"` · `"ai"` · `"safety"` · `"production"` |
| `severity`      | `text`        | `"info"` · `"warning"` · `"danger"` · `"success"` |
| `message`       | `text`        | Human-readable event description       |
| `equipment_id`  | `text`        | References `equipment.id` (optional)   |
| `acknowledged`  | `boolean`     | Whether an operator has reviewed this  |

---

## Data Flow

```
User navigates to /fuel-intelligence
         │
         ▼
FuelIntelligence.jsx (lazy chunk loads)
         │
         ▼
useFuel() mounts → checks supabaseConfigured
         │
    ┌────┴─────────────────────────────┐
    │ configured                       │ not configured
    ▼                                  ▼
supabase.from('fuel_metrics')     setFuelMetrics(mockData)
  .select('*')                    setSource('mock')
  .order('timestamp', desc)       setLoading(false)
         │
    ┌────┴──────────────┐
    │ success           │ error
    ▼                   ▼
setFuelMetrics(mapped)  setFuelMetrics(mockData)
setSource('supabase')   setSource('mock')
         │
         ▼
FuelIntelligence renders with { fuelMetrics, source, loading, error }
```

### KPI Alert Evaluation

`KPIThresholdAlertPanel` composes four hooks and passes their combined output
into `evaluateThresholds()` from `src/utils/thresholds.js`. This pure function
returns a sorted, deduplicated alert list without any component state mutation:

```
useEquipment()  ──┐
useFuel()       ──┤  → evaluateThresholds() → ThresholdAlert[]
useSafety()     ──┤                              │
useOperationalEvents() ──┘                       ▼
                                        <AlertRow /> × N
```

---

## Bundle Strategy

Configured in `vite.config.js` via `rollupOptions.output.manualChunks`:

| Chunk            | Contents                                      | Est. size (gz) |
|------------------|-----------------------------------------------|----------------|
| `vendor-react`   | react, react-dom, react-router-dom, scheduler | ~140 KB        |
| `vendor-supabase`| @supabase/supabase-js                         | ~45 KB         |
| `vendor-charts`  | recharts, d3-* (Analytics page only)          | ~60 KB         |
| `vendor-ui`      | lucide-react (tree-shaken)                    | ~20 KB         |
| `[page]-chunk`   | Each lazy page (auto-split by Vite)           | 5–30 KB each   |

The vendor chunks are stable across deploys — their hashes only change when
dependencies are upgraded, maximising CDN cache hit rates for returning users.

---

## Environment Configuration

```bash
# .env (copy from .env.example — never commit)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

When either variable is missing or still set to the placeholder value,
`supabaseConfigured` is `false` and the app runs entirely on `mockData`.
No error is shown to the user — this is intentional for portfolio demos.
