import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutGrid, List, Bookmark } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import FAB from '@/components/layout/FAB';
import ItemCard from '@/components/cards/ItemCard';
import EmptyState from '@/components/EmptyState';
import { ItemCardSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { useFolders } from '@/hooks/useFolders';
import { useItems } from '@/hooks/useItems';
import { useAddContentModal } from '@/hooks/useAddContentModal';

export default function FolderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { folders } = useFolders();
  const { items, isLoading, toggleFavorite, deleteItem } = useItems(id);
  const { openModal } = useAddContentModal();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const folder = folders.find(f => f.id === id);
  const folderItems = items.filter(item => item.folder_id === id);

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center h-14 px-4 max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <h1 className="text-lg font-semibold text-foreground flex-1">
            {folder?.name || 'Folder'}
          </h1>
          
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-8 w-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      <div className="px-4 py-6 max-w-7xl mx-auto">
        <p className="text-sm text-muted-foreground mb-4">
          {folderItems.length} {folderItems.length === 1 ? 'item' : 'items'}
        </p>

        {isLoading ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
            : 'space-y-3'
          }>
            {[...Array(4)].map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        ) : folderItems.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="This folder is empty"
            description="Add some content to this folder to get started."
            actionLabel="Add Content"
            onAction={openModal}
          />
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
            : 'space-y-3'
          }>
            {folderItems.map((item) => (
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
