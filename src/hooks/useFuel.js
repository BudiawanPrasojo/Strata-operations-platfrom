/**
 * useFuel.js
 *
 * Hook untuk fetch data fuel metrics dari Supabase (tabel: fuel_metrics).
 * Fallback otomatis ke mockData kalau Supabase belum dikonfigurasi atau fetch gagal.
 *
 * Aturan sumber data (tidak boleh bercampur):
 *   - Supabase berhasil → tampilkan HANYA data Supabase, source='supabase'
 *   - Supabase gagal / tidak terkonfigurasi → tampilkan HANYA mockData, source='mock'
 *
 * @module useFuel
 */

import { useState, useEffect } from 'react';
import { supabase, supabaseConfigured } from '../services/supabase';
import { fuelIntelligence } from '../data/mockData';

/**
 * @typedef {Object} FuelMetricRecord
 * @property {number}      id              - ID record (dari Supabase) atau index (mock)
 * @property {string}      site            - Nama site / lokasi
 * @property {number}      fuelConsumption - Konsumsi bahan bakar dalam liter
 * @property {number}      fuelEfficiency  - Efisiensi dalam persen (0–100)
 * @property {number}      fuelCost        - Biaya bahan bakar (nilai moneter)
 * @property {string}      status          - "Normal" | "Investigating" | "Critical" | "Resolved"
 * @property {string}      timestamp       - ISO timestamp record
 * @property {string}      location        - Alias untuk `site` (kompatibilitas UI)
 * @property {string}      amount          - Display string konsumsi (misal: "8423L")
 * @property {string}      time            - Display string waktu (misal: "14:32")
 */

/**
 * @typedef {Object} UseFuelResult
 * @property {FuelMetricRecord[]}    fuelMetrics - Daftar data fuel metrics
 * @property {boolean}               loading     - true selama fetch berlangsung
 * @property {string|null}           error       - Pesan error, null jika tidak ada
 * @property {'supabase'|'mock'}     source      - Sumber data aktif
 * @property {() => void}            refetch     - Fungsi untuk memicu ulang fetch
 */

/**
 * Hook untuk mengambil data fuel metrics dari Supabase.
 * Otomatis fallback ke mockData jika Supabase tidak dikonfigurasi atau fetch gagal.
 *
 * @returns {UseFuelResult}
 */
export function useFuel() {
  const [fuelMetrics, setFuelMetrics] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [source, setSource]           = useState('mock');
  // refetchKey: increment untuk trigger ulang useEffect saat refetch dipanggil
  const [refetchKey, setRefetchKey]   = useState(0);

  useEffect(() => {
    // Tidak terkonfigurasi → langsung pakai mock, tidak ada fetch
    if (!supabaseConfigured || !supabase) {
      setFuelMetrics(fuelIntelligence.suspiciousLoss);
      setSource('mock');
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false; // guard race condition (React StrictMode double-invoke)

    async function fetchFuelMetrics() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: err } = await supabase
          .from('fuel_metrics')
          .select('*')
          .order('timestamp', { ascending: false });

        if (cancelled) return;
        if (err) throw err;

        const mapped = (data || []).map(row => ({
          id:              row.id,
          site:            row.site,
          fuelConsumption: row.fuel_consumption,
          fuelEfficiency:  row.fuel_efficiency,
          fuelCost:        row.fuel_cost,
          status:          row.status,
          timestamp:       row.timestamp,
          // Alias kompatibilitas UI tabel Anomaly Detection
          location: row.site,
          amount:   row.fuel_consumption != null ? `${row.fuel_consumption}L` : '-',
          time:     row.timestamp
            ? new Date(row.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
            : '-',
        }));

        setFuelMetrics(mapped);
        setSource('supabase');
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error('[useFuel]', err);
        setError(err.message);
        // Supabase gagal → set HANYA mockData, tidak ada campuran
        setFuelMetrics(fuelIntelligence.suspiciousLoss);
        setSource('mock');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFuelMetrics();

    // Cleanup: tandai cancelled supaya hasil fetch lama tidak menimpa state baru
    return () => { cancelled = true; };
  }, [refetchKey]); // refetchKey sebagai trigger — jalan ulang setiap refetch dipanggil

  /** Memicu ulang fetch fuel metrics dari awal. */
  const refetch = () => setRefetchKey(k => k + 1);

  return { fuelMetrics, loading, error, source, refetch };
}
