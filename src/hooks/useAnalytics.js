/**
 * useAnalytics.js
 *
 * Hook untuk fetch & agregasi data Analytics Dashboard dari Supabase.
 * Phase 2: Tambah parameter `days` (7 | 30 | 90) untuk date range filter.
 *   - Supabase path: query pakai lastNDays(days) sesuai pilihan user
 *   - Mock path: slice/generate data sesuai N hari agar chart terasa responsif
 *
 * Sumber data (tabel yang sudah ada, tidak ada tabel baru):
 *   - Production Output     ← operational_events (count event_type='production' per hari)
 *   - Fuel Consumption      ← fuel_metrics (sum fuel_consumption per hari)
 *   - Safety Incidents      ← operational_events (count event_type='safety'/severity='danger' per bulan)
 *   - Equipment Utilization ← equipment (avg utilization per type)
 *   - Efficiency Trend      ← fuel_metrics (avg fuel_efficiency per hari)
 *
 * Schema operational_events yang benar:
 *   id, timestamp, event_type, severity, message, equipment_id, acknowledged
 * BUKAN: created_at, type (kolom-kolom ini tidak ada)
 */

import { useState, useEffect } from 'react';
import { supabase, supabaseConfigured } from '../services/supabase';
import {
  productionTrendData,
  fuelUsageData,
  safetyIncidentData,
  equipmentUtilizationData,
} from '../data/mockData';

const EFFICIENCY_FALLBACK = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  values: [82, 85, 84, 87, 86, 83, 88],
};

const DAY_LABELS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function lastNDays(n) {
  const days = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push({
      key:   d.toISOString().slice(0, 10),
      label: n <= 7
        ? DAY_LABELS[d.getDay()]
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }
  return days;
}

// Generate mock data scaled to N days so the chart visually changes
function generateMockProduction(n) {
  const days = lastNDays(n);
  const base = [11200, 12400, 11800, 13100, 12847, 10500, 9200];
  const values = days.map((_, i) => {
    const seed = base[i % base.length];
    // slight variation per day index so 30/90-day views look different
    return Math.round(seed * (0.9 + (i % 5) * 0.04));
  });
  return { labels: days.map(d => d.label), values };
}

function generateMockFuel(n) {
  const days = lastNDays(n);
  const base = [7800, 8200, 7950, 8600, 8423, 6800, 5900];
  const values = days.map((_, i) => {
    const seed = base[i % base.length];
    return Math.round(seed * (0.92 + (i % 4) * 0.03));
  });
  return { labels: days.map(d => d.label), values };
}

function generateMockEfficiency(n) {
  const days = lastNDays(n);
  const base = [82, 85, 84, 87, 86, 83, 88];
  const values = days.map((_, i) => base[i % base.length]);
  return { labels: days.map(d => d.label), values };
}

// Safety incidents: always monthly (6 months) — date range doesn't affect bucketing
// but we can scale the counts loosely to suggest more data for longer ranges
function generateMockSafety(n) {
  if (n <= 7)  return { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [0, 1, 0, 1, 0, 0, 0] };
  if (n <= 30) return safetyIncidentData; // original 6-month data
  return {
    labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    values: [2, 1, 3, 1, 2, 0, 3, 1, 2],
  };
}

export function useAnalytics(days = 7) {
  const [productionTrend,    setProductionTrend]    = useState(() => generateMockProduction(days));
  const [fuelUsage,          setFuelUsage]          = useState(() => generateMockFuel(days));
  const [safetyIncidents,    setSafetyIncidents]    = useState(() => generateMockSafety(days));
  const [equipmentUtilization, setEquipmentUtilization] = useState(equipmentUtilizationData);
  const [efficiencyTrend,    setEfficiencyTrend]    = useState(() => generateMockEfficiency(days));

  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [source,      setSource]      = useState('mock');
  const [refetchKey,  setRefetchKey]  = useState(0);

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      setProductionTrend(generateMockProduction(days));
      setFuelUsage(generateMockFuel(days));
      setSafetyIncidents(generateMockSafety(days));
      setEquipmentUtilization(equipmentUtilizationData);
      setEfficiencyTrend(generateMockEfficiency(days));
      setSource('mock');
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      let anyFailed = false;
      let lastErrorMessage = null;

      // --- Production Output ---
      try {
        const dayArr = lastNDays(days);
        const since  = dayArr[0].key;
        const { data, error: err } = await supabase
          .from('operational_events')
          .select('timestamp, event_type')
          .eq('event_type', 'production')
          .gte('timestamp', since)
          .order('timestamp', { ascending: true });

        if (cancelled) return;
        if (err) throw err;

        const counts = Object.fromEntries(dayArr.map(d => [d.key, 0]));
        (data || []).forEach(row => {
          const key = row.timestamp ? String(row.timestamp).slice(0, 10) : null;
          if (key && key in counts) counts[key] += 1;
        });
        setProductionTrend({ labels: dayArr.map(d => d.label), values: dayArr.map(d => counts[d.key]) });
      } catch (err) {
        if (cancelled) return;
        console.error('[useAnalytics] productionTrend', err);
        anyFailed = true; lastErrorMessage = err.message;
        setProductionTrend(generateMockProduction(days));
      }

      // --- Fuel Consumption ---
      try {
        const dayArr = lastNDays(days);
        const since  = dayArr[0].key;
        const { data, error: err } = await supabase
          .from('fuel_metrics')
          .select('timestamp, fuel_consumption')
          .gte('timestamp', since)
          .order('timestamp', { ascending: true });

        if (cancelled) return;
        if (err) throw err;

        const sums = Object.fromEntries(dayArr.map(d => [d.key, 0]));
        (data || []).forEach(row => {
          const key = row.timestamp ? String(row.timestamp).slice(0, 10) : null;
          if (key && key in sums) sums[key] += Number(row.fuel_consumption) || 0;
        });
        setFuelUsage({ labels: dayArr.map(d => d.label), values: dayArr.map(d => Math.round(sums[d.key])) });
      } catch (err) {
        if (cancelled) return;
        console.error('[useAnalytics] fuelUsage', err);
        anyFailed = true; lastErrorMessage = err.message;
        setFuelUsage(generateMockFuel(days));
      }

      // --- Safety Incidents ---
      try {
        const { data, error: err } = await supabase
          .from('operational_events')
          .select('timestamp, event_type, severity');

        if (cancelled) return;
        if (err) throw err;

        const now = new Date();
        const months = [];
        const numMonths = days <= 7 ? 1 : days <= 30 ? 3 : 9;
        for (let i = numMonths - 1; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_LABELS[d.getMonth()] });
        }
        const counts = Object.fromEntries(months.map(m => [m.key, 0]));
        (data || []).forEach(row => {
          // Use event_type (not type) and check against actual schema values
          const isIncident = row.event_type === 'safety' || row.severity === 'danger';
          if (!isIncident || !row.timestamp) return;
          const d   = new Date(row.timestamp);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (key in counts) counts[key] += 1;
        });
        setSafetyIncidents({ labels: months.map(m => m.label), values: months.map(m => counts[m.key]) });
      } catch (err) {
        if (cancelled) return;
        console.error('[useAnalytics] safetyIncidents', err);
        anyFailed = true; lastErrorMessage = err.message;
        setSafetyIncidents(generateMockSafety(days));
      }

      // --- Equipment Utilization ---
      try {
        const { data, error: err } = await supabase.from('equipment').select('type, utilization');
        if (cancelled) return;
        if (err) throw err;
        const grouped = {};
        (data || []).forEach(row => {
          if (!row.type) return;
          if (!grouped[row.type]) grouped[row.type] = [];
          grouped[row.type].push(Number(row.utilization) || 0);
        });
        const labels = Object.keys(grouped);
        const values = labels.map(type => {
          const vals = grouped[type];
          return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
        });
        setEquipmentUtilization(labels.length > 0 ? { labels, values } : equipmentUtilizationData);
      } catch (err) {
        if (cancelled) return;
        console.error('[useAnalytics] equipmentUtilization', err);
        anyFailed = true; lastErrorMessage = err.message;
        setEquipmentUtilization(equipmentUtilizationData);
      }

      // --- Efficiency Trend ---
      try {
        const dayArr = lastNDays(days);
        const since  = dayArr[0].key;
        const { data, error: err } = await supabase
          .from('fuel_metrics')
          .select('timestamp, fuel_efficiency')
          .gte('timestamp', since)
          .order('timestamp', { ascending: true });

        if (cancelled) return;
        if (err) throw err;

        const buckets = Object.fromEntries(dayArr.map(d => [d.key, []]));
        (data || []).forEach(row => {
          if (row.fuel_efficiency == null) return;
          const key = row.timestamp ? String(row.timestamp).slice(0, 10) : null;
          if (key && key in buckets) buckets[key].push(Number(row.fuel_efficiency));
        });
        const values = dayArr.map(d => {
          const arr = buckets[d.key];
          if (arr.length === 0) return 0;
          return parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1));
        });
        const hasData = values.some(v => v > 0);
        setEfficiencyTrend(hasData ? { labels: dayArr.map(d => d.label), values } : generateMockEfficiency(days));
      } catch (err) {
        if (cancelled) return;
        console.error('[useAnalytics] efficiencyTrend', err);
        anyFailed = true; lastErrorMessage = err.message;
        setEfficiencyTrend(generateMockEfficiency(days));
      }

      if (cancelled) return;
      setError(anyFailed ? lastErrorMessage : null);
      setSource(anyFailed ? 'mock' : 'supabase');
      setLoading(false);
    }

    fetchAnalytics();
    return () => { cancelled = true; };
  }, [refetchKey, days]); // re-run when days changes

  const refetch = () => setRefetchKey(k => k + 1);

  function periodChange(values) {
    if (!values || values.length < 2) return null;
    const half = Math.floor(values.length / 2);
    const prev = values.slice(0, half).reduce((a, b) => a + b, 0);
    const curr = values.slice(half).reduce((a, b) => a + b, 0);
    if (prev === 0) return null;
    return ((curr - prev) / prev) * 100;
  }
  function fmtChange(pct) {
    if (pct === null) return null;
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(1)}%`;
  }

  const totalProduction    = (productionTrend.values || []).reduce((a, b) => a + b, 0);
  const productionChangePct = periodChange(productionTrend.values);
  const utilVals           = equipmentUtilization.values || [];
  const avgEfficiency      = utilVals.length > 0 ? utilVals.reduce((a, b) => a + b, 0) / utilVals.length : null;
  const totalFuel          = (fuelUsage.values || []).reduce((a, b) => a + b, 0);
  const fuelChangePct      = periodChange(fuelUsage.values);
  const totalSafetyIncidents = (safetyIncidents.values || []).reduce((a, b) => a + b, 0);
  const safetyChangePct    = periodChange(safetyIncidents.values);

  const kpiSummary = {
    totalProduction: {
      value: totalProduction > 0 ? totalProduction.toLocaleString() + ' events' : '—',
      change: fmtChange(productionChangePct),
      positive: productionChangePct === null || productionChangePct >= 0,
    },
    avgEfficiency: {
      value: avgEfficiency !== null ? avgEfficiency.toFixed(1) + '%' : '—',
      change: null, positive: true,
    },
    fuelConsumed: {
      value: totalFuel > 0 ? totalFuel.toLocaleString() + 'L' : '—',
      change: fmtChange(fuelChangePct !== null ? -fuelChangePct : null),
      positive: fuelChangePct === null || fuelChangePct <= 0,
    },
    safetyIncidents: {
      value: String(totalSafetyIncidents),
      change: fmtChange(safetyChangePct !== null ? -safetyChangePct : null),
      positive: safetyChangePct === null || safetyChangePct <= 0,
    },
  };

  return {
    productionTrend, fuelUsage, safetyIncidents,
    equipmentUtilization, efficiencyTrend,
    kpiSummary, loading, error, source, refetch,
  };
}
