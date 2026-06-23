/**
 * useSafety.js
 *
 * Hook untuk fetch safety incidents dari Supabase (tabel: safety_incidents).
 * Fallback ke mockData jika Supabase belum tersedia atau fetch gagal.
 *
 * @module useSafety
 */

import { useState, useEffect } from 'react';
import { supabase, supabaseConfigured } from '../services/supabase';
import { safetyData } from '../data/mockData';

/**
 * @typedef {Object} SafetyIncident
 * @property {string|number} id       - ID unik insiden
 * @property {string}        date     - Tanggal insiden dalam format "YYYY-MM-DD"
 * @property {string}        type     - Tipe insiden (misal: "Near Miss", "Equipment Failure")
 * @property {string}        severity - Severity: "info" | "warning" | "danger" | "critical" | "high"
 * @property {string}        location - Lokasi kejadian (misal: "Sector A")
 * @property {string}        status   - Status penanganan: "Open" | "Under Review" | "Resolved" | "Closed"
 */

/**
 * @typedef {Object} UseSafetyResult
 * @property {SafetyIncident[]}      incidents - Daftar insiden keselamatan (max 30 terbaru)
 * @property {boolean}               loading   - true selama fetch berlangsung
 * @property {string|null}           error     - Pesan error, null jika tidak ada
 * @property {'supabase'|'mock'}     source    - Sumber data aktif
 * @property {() => void}            refetch   - Fungsi untuk memicu ulang fetch
 */

/**
 * Hook untuk mengambil data safety incidents dari Supabase.
 * Otomatis fallback ke mockData jika Supabase tidak dikonfigurasi atau fetch gagal.
 *
 * @returns {UseSafetyResult}
 */
export function useSafety() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [source, setSource]       = useState('mock');
  // refetchKey: increment untuk trigger ulang useEffect saat refetch dipanggil
  const [refetchKey, setRefetchKey] = useState(0);

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      setIncidents(safetyData.recentIncidents);
      setSource('mock');
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchIncidents() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: err } = await supabase
          .from('safety_incidents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);

        if (cancelled) return;
        if (err) throw err;

        const mapped = (data || []).map((row) => ({
          id:       row.id,
          date:     row.created_at
            ? new Date(row.created_at).toISOString().split('T')[0]
            : '-',
          type:     row.incident_type,
          severity: row.severity,
          location: row.location,
          status:   row.status,
        }));

        setIncidents(mapped);
        setSource('supabase');
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error('[useSafety]', err);
        setError(err.message);
        setIncidents(safetyData.recentIncidents);
        setSource('mock');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchIncidents();

    return () => { cancelled = true; };
  }, [refetchKey]);

  /** Memicu ulang fetch incidents tanpa reload halaman. */
  const refetch = () => setRefetchKey(k => k + 1);

  return { incidents, loading, error, source, refetch };
}
