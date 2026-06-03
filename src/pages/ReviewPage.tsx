import { Bookmark, BookOpen, CheckCircle2, Flame, TrendingUp } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/cards/StatCard';
import { useItems } from '@/hooks/useItems';
import { useActivity } from '@/hooks/useActivity';
import { useFolders } from '@/hooks/useFolders';
import { useMemo } from 'react';

export default function ReviewPage() {
  const { items, isLoading } = useItems();
  const { folders } = useFolders();
  const { weekTotals, streak, weekRows } = useActivity(30);

  const weekAgo = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() - 7); return d;
  }, []);

  const savedThisWeek = items.filter(i => new Date(i.created_at) >= weekAgo);
  const completedThisWeek = items.filter(i => i.completed_at && new Date(i.completed_at) >= weekAgo);

  // Most active folder
  const folderCounts = items.reduce<Record<string, number>>((acc, i) => {
    if (i.folder_id) acc[i.folder_id] = (acc[i.folder_id] || 0) + 1;
    return acc;
  }, {});
  const topFolders = Object.entries(folderCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([fid, count]) => ({ folder: folders.find(f => f.id === fid), count }));

  const favorites = items.filter(i => i.is_favorite).slice(0, 5);

  // Last 7 days mini chart
  const last7 = useMemo(() => {
    const days: { date: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const row = weekRows.find(r => r.activity_date === key);
      days.push({
        date: key,
        total: row ? row.items_saved + row.items_read + row.items_completed : 0,
      });
    }
    return days;
  }, [weekRows]);

  const maxDay = Math.max(1, ...last7.map(d => d.total));

  return (
    <AppLayout>
      <TopBar title="Weekly Review" />
      <div className="px-4 py-6 max-w-7xl mx-auto space-y-6">
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">This week</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Saved" value={savedThisWeek.length} icon={Bookmark} color="primary" />
            <StatCard title="Read" value={weekTotals.read} icon={BookOpen} color="accent" />
            <StatCard title="Completed" value={completedThisWeek.length} icon={CheckCircle2} color="accent" />
            <StatCard title="Day streak" value={streak} icon={Flame} color="warning" />
          </div>
        </section>

        <section className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Activity (last 7 days)</h2>
          </div>
          <div className="flex items-end gap-2 h-32">
            {last7.map(d => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary/80 rounded-t transition-all"
                  style={{ height: `${(d.total / maxDay) * 100}%`, minHeight: d.total ? 4 : 2 }}
                  title={`${d.total} actions`}
                />
                <span className="text-[10px] text-muted-foreground">
                  {new Date(d.date + 'T00:00:00Z').toLocaleDateString(undefined, { weekday: 'narrow' })}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <h2 className="text-sm font-semibold mb-3">Most active folders</h2>
            {topFolders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No folders yet.</p>
            ) : (
              <ul className="space-y-2">
                {topFolders.map(({ folder, count }) => folder && (
                  <li key={folder.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{folder.name}</span>
                    <span className="text-muted-foreground">{count} items</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <h2 className="text-sm font-semibold mb-3">Favorites</h2>
            {favorites.length === 0 ? (
              <p className="text-sm text-muted-foreground">No favorites yet.</p>
            ) : (
              <ul className="space-y-2">
                {favorites.map(f => (
                  <li key={f.id} className="text-sm text-foreground line-clamp-1">{f.title || f.url}</li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {isLoading && <p className="text-xs text-muted-foreground">Loading…</p>}
      </div>
    </AppLayout>
  );
}
