import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { EventType } from '@/lib/types';

export function useEventTypes() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('event_types')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    setEventTypes((data ?? []) as EventType[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { eventTypes, loading, refetch: fetch };
}