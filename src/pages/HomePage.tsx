import { Bookmark, Heart, Clock } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import FAB from '@/components/layout/FAB';
import StatCard from '@/components/cards/StatCard';
import ItemCard from '@/components/cards/ItemCard';
import EmptyState from '@/components/EmptyState';
import { ItemCardSkeleton, StatCardSkeleton } from '@/components/ui/skeletons';
import { useItems } from '@/hooks/useItems';
import { useAddContentModal } from '@/hooks/useAddContentModal';

export default function HomePage() {
  const { items, isLoading, toggleFavorite, deleteItem } = useItems();
  const { openModal } = useAddContentModal();

  const totalSaved = items.length;
  const favorites = items.filter(item => item.is_favorite).length;
  const recentItems = items.slice(0, 6);

  return (
    <AppLayout>
      <TopBar />
      
      <div className="px-4 py-6 max-w-7xl mx-auto space-y-6">
        {/* Stats */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Overview</h2>
          <div className="grid grid-cols-3 gap-3">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard title="Total Saved" value={totalSaved} icon={Bookmark} color="primary" />
                <StatCard title="Favorites" value={favorites} icon={Heart} color="accent" />
                <StatCard title="Recent" value={Math.min(recentItems.length, 6)} icon={Clock} color="warning" />
              </>
            )}
          </div>
        </section>

        {/* Recent Items */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Recent Items</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
          ) : recentItems.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No bookmarks yet"
              description="Start saving links and videos to see them here. Tap the + button to add your first bookmark."
              actionLabel="Add Content"
              onAction={openModal}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentItems.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  url={item.url}
                  thumbnail_url={item.thumbnail_url}
                  type={item.type}
                  is_favorite={item.is_favorite}
                  onToggleFavorite={(id, isFavorite) => toggleFavorite({ id, is_favorite: isFavorite })}
                  onDelete={deleteItem}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <FAB />
    </AppLayout>
  );
}
