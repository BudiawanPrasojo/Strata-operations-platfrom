/**
 * useEquipment.js
 *
 * Hook untuk fetch data equipment dari Supabase.
 * Fallback otomatis ke mockData kalau Supabase belum dikonfigurasi.
 */

import { useState, useEffect } from 'react';
import { supabase, supabaseConfigured } from '../services/supabase';
import { equipmentData } from '../data/mockData';

export function useEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [source, setSource]       = useState('mock');

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      setEquipment(equipmentData);
      setSource('mock');
      setLoading(false);
      return;
    }

    async function fetchEquipment() {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from('equipment')
          .select('*')
          .order('id', { ascending: true });

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
        console.error('[useEquipment]', err);
        setError(err.message);
        setEquipment(equipmentData);
        setSource('mock');
      } finally {
        setLoading(false);
      }
    }

    fetchEquipment();
  }, []);

  const refetch = () => {
    setLoading(true);
    setError(null);
  };

  return { equipment, loading, error, source, refetch };
}
