/**
 * useOperationalEvents.js
 *
 * Hook untuk fetch operational events dari Supabase.
 * Fallback otomatis ke mockData kalau Supabase belum dikonfigurasi.
 * Realtime subscription aktif kalau Supabase tersedia.
 */

import { useState, useEffect } from 'react';
import { supabase, supabaseConfigured } from '../services/supabase';
import { liveFeedData } from '../data/mockData';

export function useOperationalEvents() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [source, setSource]   = useState('mock'); // 'supabase' | 'mock'

  useEffect(() => {
    // Kalau Supabase belum dikonfigurasi → pakai mock data
    if (!supabaseConfigured || !supabase) {
      setEvents(liveFeedData);
      setSource('mock');
      setLoading(false);
      return;
    }

    // Fetch dari Supabase
    async function fetchEvents() {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from('operational_events')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(30);

        if (err) throw err;

        setEvents(data || []);
        setSource('supabase');
        setError(null);
      } catch (err) {
        console.error('[useOperationalEvents]', err);
        setError(err.message);
        // Fallback ke mock data kalau fetch gagal
        setEvents(liveFeedData);
        setSource('mock');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();

    // Realtime subscription — event baru prepend ke atas
    // Nama channel harus unik per instance: hook ini dipakai oleh beberapa
    // komponen sekaligus (LiveOperationalFeed, OperationalDominoEffectEngine,
    // KPIThresholdAlertPanel). Nama yang sama menyebabkan error
    // "cannot add postgres_changes callbacks after subscribe()".
    const channelName = `operational_events_realtime_${Date.now()}_${Math.random()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'operational_events' },
        (payload) => {
          setEvents(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { events, loading, error, source };
}
