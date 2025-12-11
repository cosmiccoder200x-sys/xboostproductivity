import { useState, useMemo } from 'react';
import { Search, Mic, Video, Link2, Heart, Calendar } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import FAB from '@/components/layout/FAB';
import ItemCard from '@/components/cards/ItemCard';
import EmptyState from '@/components/EmptyState';
import { ItemCardSkeleton } from '@/components/ui/skeletons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useItems } from '@/hooks/useItems';

type FilterType = 'all' | 'videos' | 'links' | 'favorites';

const filterOptions: { value: FilterType; label: string; icon: typeof Video }[] = [
  { value: 'all', label: 'All', icon: Search },
  { value: 'videos', label: 'Videos', icon: Video },
  { value: 'links', label: 'Links', icon: Link2 },
  { value: 'favorites', label: 'Favorites', icon: Heart },
];

export default function SearchPage() {
  const { items, isLoading, toggleFavorite, deleteItem } = useItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredItems = useMemo(() => {
    let result = items;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        item =>
          item.title?.toLowerCase().includes(query) ||
          item.url.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    // Apply filter
    switch (activeFilter) {
      case 'videos':
        result = result.filter(item => item.type === 'video');
        break;
      case 'links':
        result = result.filter(item => item.type === 'link');
        break;
      case 'favorites':
        result = result.filter(item => item.is_favorite);
        break;
    }

    return result;
  }, [items, searchQuery, activeFilter]);

  return (
    <AppLayout>
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-3 max-w-7xl mx-auto space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-10"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              disabled
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
            {filterOptions.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={activeFilter === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(value)}
                className="shrink-0 gap-1.5"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="px-4 py-6 max-w-7xl mx-auto">
        <p className="text-sm text-muted-foreground mb-4">
          {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No results found"
            description={searchQuery 
              ? `No bookmarks match "${searchQuery}". Try a different search term.`
              : "No bookmarks match the selected filter."
            }
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
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
      </div>

      <FAB />
    </AppLayout>
  );
}
