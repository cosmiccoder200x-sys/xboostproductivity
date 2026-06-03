import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityRow, computeStreak } from '@/lib/activity';

export function useActivity(days = 30) {
  const { user } = useAuth();

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['activity', user?.id, days],
    queryFn: async () => {
      if (!user) return [];
      const since = new Date();
      since.setUTCDate(since.getUTCDate() - days);
      const { data, error } = await supabase
        .from('user_activity')
        .select('activity_date, items_saved, items_read, items_completed')
        .eq('user_id', user.id)
        .gte('activity_date', since.toISOString().slice(0, 10))
        .order('activity_date', { ascending: false });
      if (error) throw error;
      return (data || []) as ActivityRow[];
    },
    enabled: !!user,
  });

  const streak = computeStreak(rows);

  const weekRows = rows.filter(r => {
    const d = new Date(r.activity_date + 'T00:00:00Z');
    const weekAgo = new Date();
    weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
    return d >= weekAgo;
  });

  const weekTotals = weekRows.reduce(
    (acc, r) => ({
      saved: acc.saved + r.items_saved,
      read: acc.read + r.items_read,
      completed: acc.completed + r.items_completed,
    }),
    { saved: 0, read: 0, completed: 0 }
  );

  return { rows, weekRows, weekTotals, streak, isLoading };
}
