import { supabase } from '@/integrations/supabase/client';

type ActivityDelta = {
  items_saved?: number;
  items_read?: number;
  items_completed?: number;
};

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function recordActivity(userId: string, delta: ActivityDelta) {
  const date = todayUTC();
  const { data: existing } = await supabase
    .from('user_activity')
    .select('*')
    .eq('user_id', userId)
    .eq('activity_date', date)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('user_activity')
      .update({
        items_saved: (existing.items_saved || 0) + (delta.items_saved || 0),
        items_read: (existing.items_read || 0) + (delta.items_read || 0),
        items_completed: (existing.items_completed || 0) + (delta.items_completed || 0),
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('user_activity').insert({
      user_id: userId,
      activity_date: date,
      items_saved: delta.items_saved || 0,
      items_read: delta.items_read || 0,
      items_completed: delta.items_completed || 0,
    });
  }
}

export interface ActivityRow {
  activity_date: string;
  items_saved: number;
  items_read: number;
  items_completed: number;
}

export function computeStreak(rows: ActivityRow[]): number {
  // rows expected sorted desc by date. A "learning day" = any activity > 0.
  const active = new Set(
    rows
      .filter(r => (r.items_saved + r.items_read + r.items_completed) > 0)
      .map(r => r.activity_date)
  );
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (active.has(key)) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else if (streak === 0) {
      // allow today gap: check yesterday too
      cursor.setUTCDate(cursor.getUTCDate() - 1);
      const yKey = cursor.toISOString().slice(0, 10);
      if (active.has(yKey)) {
        streak++;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      } else break;
    } else break;
  }
  return streak;
}
