/**
 * useEquipment.js
 *
 * Hook untuk fetch data equipment dari Supabase.
 * Fallback otomatis ke mockData kalau Supabase belum dikonfigurasi.
 *
 * @module useEquipment
 */

import { useState, useEffect } from 'react';
import { supabase, supabaseConfigured } from '../services/supabase';
import { equipmentData } from '../data/mockData';

/**
 * @typedef {Object} EquipmentRecord
 * @property {string}  id          - Equipment ID (misal: "EX-14")
 * @property {string}  name        - Nama display (misal: "Excavator EX-14")
 * @property {string}  type        - Tipe unit (misal: "Excavator", "Dump Truck")
 * @property {string}  status      - Status operasional: "Active" | "Idle" | "Maintenance"
 * @property {number}  health      - Health dalam persen (0–100)
 * @property {number}  utilization - Utilisasi dalam persen (0–100)
 * @property {string}  maintenance - Status maintenance (misal: "Good", "Due Soon")
 * @property {string}  location    - Lokasi saat ini (misal: "Sector A")
 * @property {string}  operator    - Nama operator aktif
 * @property {number}  fuelLevel   - Level bahan bakar dalam persen (0–100)
 * @property {number}  hoursToday  - Jam operasi hari ini
 * @property {string}  lastService - Keterangan servis terakhir (misal: "3 days ago")
 */

/**
 * @typedef {Object} UseEquipmentResult
 * @property {EquipmentRecord[]} equipment - Daftar data equipment
 * @property {boolean}           loading   - true selama fetch berlangsung
 * @property {string|null}       error     - Pesan error, null jika tidak ada
 * @property {'supabase'|'mock'} source    - Sumber data aktif
 * @property {() => void}        refetch   - Fungsi untuk memicu ulang fetch
 */

/**
 * Hook untuk mengambil data equipment dari Supabase.
 * Otomatis fallback ke mockData jika Supabase tidak dikonfigurasi atau fetch gagal.
 *
 * @returns {UseEquipmentResult}
 */
export function useEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [source, setSource]       = useState('mock');
  // refetchKey: increment untuk trigger ulang useEffect saat refetch dipanggil
  const [refetchKey, setRefetchKey] = useState(0);

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      setEquipment(equipmentData);
      setSource('mock');
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchEquipment() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: err } = await supabase
          .from('equipment')
          .select('*')
          .order('id', { ascending: true });

        if (cancelled) return;
        if (err) throw err;

        // Map kolom Supabase ke format yang dipakai komponen
        const mapped = (data || []).map(row => ({
          id:          row.id,
          name:        row.name,
          type:        row.type,
          status:      row.status,
          health:      row.health,
          utilization: row.utilization,
          maintenance: row.maintenance,
          location:    row.location,
          operator:    row.operator,
          fuelLevel:   row.fuel_level,
          hoursToday:  row.hours_today,
          lastService: row.last_service,
        }));

        setEquipment(mapped);
        setSource('supabase');
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error('[useEquipment]', err);
        setError(err.message);
        setEquipment(equipmentData);
        setSource('mock');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchEquipment();

    return () => { cancelled = true; };
  }, [refetchKey]); // refetchKey sebagai trigger — jalan ulang setiap refetch dipanggil

  /** Trigger a fresh equipment fetch. */
  const refetch = () => setRefetchKey(k => k + 1);

  return { equipment, loading, error, source, refetch };
}
