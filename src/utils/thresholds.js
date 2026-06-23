/**
 * src/utils/thresholds.js
 *
 * Shared threshold constants dan pure evaluation logic untuk STRATA.
 *
 * Sebelumnya logika ini terduplikasi di:
 *   - src/components/dashboard/KPIThresholdAlertPanel.jsx  (evaluateThresholds)
 *   - src/pages/ShiftHandover.jsx                          (evaluateThresholds — "same logic as KPIThresholdAlertPanel")
 *
 * Cara pakai:
 *   import { THRESHOLDS, evaluateThresholds } from '../utils/thresholds';
 *
 * Tidak ada behavior yang berubah — ini adalah ekstraksi murni.
 */

// ── Threshold constants ───────────────────────────────────────────────────────

/**
 * @typedef {Object} ThresholdSet
 * @property {number} critical - Nilai di bawah ini → status CRITICAL
 * @property {number} warning  - Nilai di bawah ini (tapi ≥ critical) → status MEDIUM
 */

/**
 * Threshold KPI yang digunakan di seluruh aplikasi.
 * Ubah nilai di sini untuk mengubah behavior di semua komponen sekaligus.
 *
 * @type {{ equipmentHealth: ThresholdSet, fuelEfficiency: ThresholdSet }}
 */
export const THRESHOLDS = {
  /** Equipment health dalam persen (0–100) */
  equipmentHealth: {
    critical: 50,
    warning:  70,
  },
  /** Fuel efficiency dalam persen (0–100) */
  fuelEfficiency: {
    critical: 70,
    warning:  80,
  },
};

// ── Severity rank (dipakai untuk sorting alerts) ──────────────────────────────

/**
 * Rank numerik per severity level untuk keperluan sort descending.
 * CRITICAL (3) > HIGH (2) > MEDIUM (1)
 *
 * @type {Record<string, number>}
 */
export const SEVERITY_RANK = {
  CRITICAL: 3,
  HIGH:     2,
  MEDIUM:   1,
};

// ── Shared evaluateThresholds ─────────────────────────────────────────────────

/**
 * @typedef {Object} EquipmentItem
 * @property {string}       id          - Equipment ID (misal: "EX-14")
 * @property {string}       [type]      - Tipe equipment (misal: "Excavator")
 * @property {string}       [location]  - Lokasi (misal: "Sector A")
 * @property {number}       [health]    - Health dalam persen 0–100
 */

/**
 * @typedef {Object} FuelMetricItem
 * @property {string|number} [id]             - ID record
 * @property {string}        [site]           - Nama site
 * @property {string}        [location]       - Alias site (mock data)
 * @property {number|null}   [fuelEfficiency] - Efficiency dalam persen 0–100
 * @property {string}        [status]         - Status teks (misal: "Investigating")
 * @property {string}        [amount]         - Jumlah fuel (display string)
 * @property {string}        [time]           - Waktu (display string)
 * @property {string}        [timestamp]      - ISO timestamp (Supabase data)
 */

/**
 * @typedef {Object} SafetyIncident
 * @property {string|number} id         - ID insiden
 * @property {string}        [type]     - Tipe insiden
 * @property {string}        [severity] - Severity string (danger / critical / high / ...)
 * @property {string}        [location] - Lokasi insiden
 * @property {string}        [status]   - Status penanganan
 * @property {string}        [date]     - Tanggal (display string)
 */

/**
 * @typedef {Object} OperationalEvent
 * @property {string|number} id        - Event ID
 * @property {string}        [type]    - Tipe event (anomaly / maintenance / safety / ...)
 * @property {string}        [severity]- Severity (danger / warning / info / success)
 * @property {string}        [message] - Pesan event
 * @property {string}        [sector]  - Sektor lokasi
 * @property {string}        [timestamp] - Waktu event
 */

/**
 * @typedef {Object} ThresholdAlert
 * @property {string} id       - ID unik alert (deterministik dari sumber data)
 * @property {string} severity - CRITICAL | HIGH | MEDIUM
 * @property {string} source   - equipment | fuel | safety | ops
 * @property {string} title    - Judul singkat alert
 * @property {string} detail   - Penjelasan lengkap
 * @property {string} [meta]   - Metadata tambahan (lokasi, waktu, dsb.)
 * @property {string} [category] - Kategori display (Equipment | Fuel | Safety | Ops Event)
 */

/**
 * Evaluasi semua threshold KPI dari data operasional dan kembalikan daftar alert
 * yang telah diurutkan berdasarkan severity (CRITICAL teratas).
 *
 * Pure function — tidak ada side effect, tidak ada state mutation.
 * Single source of truth — used by KPIThresholdAlertPanel and ShiftHandover.
 *
 * @param {EquipmentItem[]}      equipment   - Data equipment
 * @param {FuelMetricItem[]}     fuelMetrics - Data fuel metrics
 * @param {SafetyIncident[]}     incidents   - Data safety incidents
 * @param {OperationalEvent[]}   events      - Data operational events
 * @returns {ThresholdAlert[]} Alert list, sorted by severity descending, deduplicated by id
 */
export function evaluateThresholds(equipment, fuelMetrics, incidents, events) {
  const alerts = [];
  const { equipmentHealth, fuelEfficiency } = THRESHOLDS;

  // 1. Equipment health
  (equipment || []).forEach(eq => {
    const h = eq.health ?? 100;
    if (h < equipmentHealth.critical) {
      alerts.push({
        id:       `equip-crit-${eq.id}`,
        severity: 'CRITICAL',
        source:   'equipment',
        category: 'Equipment',
        title:    `${eq.id} — Critical Health Degradation`,
        detail:   `Health at ${h}% — below critical threshold (${equipmentHealth.critical}%). Immediate inspection required. Location: ${eq.location ?? '—'}.`,
        meta:     `${eq.type ?? 'Equipment'} · ${eq.location ?? '—'}`,
      });
    } else if (h < equipmentHealth.warning) {
      alerts.push({
        id:       `equip-warn-${eq.id}`,
        severity: 'MEDIUM',
        source:   'equipment',
        category: 'Equipment',
        title:    `${eq.id} — Health Below Warning Threshold`,
        detail:   `Health at ${h}% — below warning threshold (${equipmentHealth.warning}%). Schedule preventive maintenance. Location: ${eq.location ?? '—'}.`,
        meta:     `${eq.type ?? 'Equipment'} · ${eq.location ?? '—'}`,
      });
    }
  });

  // 2. Fuel anomalies
  (fuelMetrics || []).forEach((fm, idx) => {
    const site = fm.site ?? fm.location ?? `Site ${idx + 1}`;
    const eff  = fm.fuelEfficiency ?? null;

    // Efficiency-based threshold (Supabase data)
    if (eff !== null) {
      if (eff < fuelEfficiency.critical) {
        alerts.push({
          id:       `fuel-crit-${fm.id ?? idx}`,
          severity: 'CRITICAL',
          source:   'fuel',
          category: 'Fuel',
          title:    `Fuel Efficiency Critical — ${site}`,
          detail:   `Efficiency at ${eff}% — below critical threshold (${fuelEfficiency.critical}%). Possible equipment fault or unauthorized consumption. Immediate review required.`,
          meta:     `${site} · ${fm.timestamp ? new Date(fm.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—'}`,
        });
      } else if (eff < fuelEfficiency.warning) {
        alerts.push({
          id:       `fuel-warn-${fm.id ?? idx}`,
          severity: 'MEDIUM',
          source:   'fuel',
          category: 'Fuel',
          title:    `Fuel Efficiency Below Target — ${site}`,
          detail:   `Efficiency at ${eff}% — below warning threshold (${fuelEfficiency.warning}%). Review haul routes and equipment calibration.`,
          meta:     `${site} · ${fm.timestamp ? new Date(fm.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—'}`,
        });
      }
    }

    // Status-based fallback (mock data — no fuelEfficiency field)
    if (eff === null && fm.status === 'Investigating') {
      alerts.push({
        id:       `fuel-status-${fm.id ?? idx}`,
        severity: 'HIGH',
        source:   'fuel',
        category: 'Fuel',
        title:    `Fuel Anomaly Under Investigation — ${site}`,
        detail:   `Suspicious fuel consumption flagged at ${site}. Amount: ${fm.amount ?? '—'}. Status: Under investigation.`,
        meta:     `${site} · ${fm.time ?? '—'}`,
      });
    }
  });

  // 3. Safety incidents
  (incidents || []).forEach(inc => {
    const sev = (inc.severity ?? '').toLowerCase();
    if (sev === 'danger' || sev === 'critical' || sev === 'high') {
      alerts.push({
        id:       `safety-crit-${inc.id}`,
        severity: 'CRITICAL',
        source:   'safety',
        category: 'Safety',
        title:    `Safety Incident — ${inc.type ?? 'Incident'}`,
        detail:   `Severity: ${inc.severity}. Location: ${inc.location ?? '—'}. Status: ${inc.status ?? 'Under Review'}. Immediate response required.`,
        meta:     `${inc.id} · ${inc.date ?? '—'}`,
      });
    }
  });

  // 4. Operational events — danger severity, critical types, max 3
  const criticalEventTypes = ['anomaly', 'maintenance', 'safety'];
  (events || [])
    .filter(e =>
      e.severity === 'danger' &&
      criticalEventTypes.includes(e.type)
    )
    .slice(0, 3)
    .forEach(ev => {
      alerts.push({
        id:       `ops-${ev.id}`,
        severity: 'HIGH',
        source:   'ops',
        category: 'Ops Event',
        title:    'High Priority Operational Event',
        detail:   ev.message?.slice(0, 120) + (ev.message?.length > 120 ? '…' : '') || 'Critical operational event detected.',
        meta:     `${ev.type?.toUpperCase() ?? 'EVENT'} · ${ev.sector ?? ev.timestamp ?? '—'}`,
      });
    });

  // Deduplicate by id, sort by severity rank descending
  const seen = new Set();
  return alerts
    .filter(a => { if (seen.has(a.id)) return false; seen.add(a.id); return true; })
    .sort((a, b) => (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0));
}
