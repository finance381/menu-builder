import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Venue } from '@/lib/types';

export function useVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenues();
  }, []);

  async function fetchVenues() {
    setLoading(true);
    const { data } = await supabase
      .from('venues')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (data) setVenues(data);
    setLoading(false);
  }

  return { venues, loading, refetch: fetchVenues };
}