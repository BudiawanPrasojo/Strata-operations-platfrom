/**
 * useSafety.js
 *
 * Hook untuk fetch safety incidents dari Supabase.
 * Fallback ke mockData jika Supabase belum tersedia.
 */

import { useState, useEffect } from 'react';
import { supabase, supabaseConfigured } from '../services/supabase';
import { safetyData } from '../data/mockData';

export function useSafety() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('mock');

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      setIncidents(safetyData.recentIncidents);
      setSource('mock');
      setLoading(false);
      return;
    }

    async function fetchIncidents() {
      try {
        setLoading(true);

        const { data, error: err } = await supabase
          .from('safety_incidents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);

        if (err) throw err;

        const mapped = (data || []).map((row) => ({
          id: row.id,
          date: row.created_at
            ? new Date(row.created_at).toISOString().split('T')[0]
            : '-',
          type: row.incident_type,
          severity: row.severity,
          location: row.location,
          status: row.status,
        }));

        setIncidents(mapped);
        setSource('supabase');
        setError(null);
      } catch (err) {
        console.error('[useSafety]', err);

        setError(err.message);
        setIncidents(safetyData.recentIncidents);
        setSource('mock');
      } finally {
        setLoading(false);
      }
    }

    fetchIncidents();
  }, []);

  const refetch = () => {
    window.location.reload();
  };

  return {
    incidents,
    loading,
    error,
    source,
    refetch,
  };
}