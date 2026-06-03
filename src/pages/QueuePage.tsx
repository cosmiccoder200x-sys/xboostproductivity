import { useMemo } from 'react';
import { Inbox } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import FAB from '@/components/layout/FAB';
import ItemCard from '@/components/cards/ItemCard';
import EmptyState from '@/components/EmptyState';
import { ItemCardSkeleton } from '@/components/ui/skeletons';
import { useItems, QueueBucket, Item } from '@/hooks/useItems';
import { toast } from 'sonner';

const BUCKETS: { key: QueueBucket; label: string; tint: string }[] = [
  { key: 'today', label: 'Today', tint: 'bg-primary/10 text-primary' },
  { key: 'tomorrow', label: 'Tomorrow', tint: 'bg-accent/10 text-accent' },
  { key: 'this_week', label: 'This Week', tint: 'bg-warning/10 text-warning' },
  { key: 'someday', label: 'Someday', tint: 'bg-muted text-muted-foreground' },
];

export default function QueuePage() {
  const { items, isLoading, toggleFavorite, deleteItem, updateQueue } = useItems();

  const grouped = useMemo(() => {
    const map: Record<QueueBucket, Item[]> = { today: [], tomorrow: [], this_week: [], someday: [] };
    items.forEach(i => {
      if (i.queue_bucket) map[i.queue_bucket].push(i);
    });
    return map;
  }, [items]);

  const totalQueued = items.filter(i => i.queue_bucket).length;

  return (
    <AppLayout>
      <TopBar title="Read Later" />
      <div className="px-4 py-6 max-w-7xl mx-auto space-y-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <ItemCardSkeleton key={i} />)}
          </div>
        ) : totalQueued === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Your queue is empty"
            description="Add items to your reading queue using the queue button on any bookmark card."
          />
        ) : (
          BUCKETS.map(b => (
            <section key={b.key}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${b.tint}`}>{b.label}</span>
                <span className="text-xs text-muted-foreground">{grouped[b.key].length}</span>
              </div>
              {grouped[b.key].length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing scheduled.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {grouped[b.key].map(item => (
                    <ItemCard
                      key={item.id}
                      {...item}
                      onToggleFavorite={(id, fav) => toggleFavorite({ id, is_favorite: fav })}
                      onDelete={async (id) => { await deleteItem(id); toast.success('Removed'); }}
                      onSetQueue={(id, bucket) => updateQueue({ id, queue_bucket: bucket })}
                    />
                  ))}
                </div>
              )}
            </section>
          ))
        )}
      </div>
      <FAB />
    </AppLayout>
  );
}
