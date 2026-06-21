/**
 * useFuel.js
 *
 * Hook untuk fetch data fuel metrics dari Supabase (tabel: fuel_metrics).
 * Fallback otomatis ke mockData kalau Supabase belum dikonfigurasi atau fetch gagal.
 *
 * Aturan sumber data (tidak boleh bercampur):
 *   - Supabase berhasil → tampilkan HANYA data Supabase, source='supabase'
 *   - Supabase gagal / tidak terkonfigurasi → tampilkan HANYA mockData, source='mock'
 */

import { useState, useEffect } from 'react';
import { supabase, supabaseConfigured } from '../services/supabase';
import { fuelIntelligence } from '../data/mockData';

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

        // Supabase berhasil → set HANYA data Supabase, bersihkan state sebelumnya
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

  // refetch: increment key untuk memicu useEffect ulang dengan fetch baru
  const refetch = () => setRefetchKey(k => k + 1);

  return { fuelMetrics, loading, error, source, refetch };
}