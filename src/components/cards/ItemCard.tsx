import { Heart, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ItemCardProps {
  id: string;
  title: string | null;
  url: string;
  thumbnail_url?: string | null;
  type: string;
  is_favorite: boolean;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onDelete?: (id: string) => void;
}

export default function ItemCard({
  id,
  title,
  url,
  thumbnail_url,
  type,
  is_favorite,
  onToggleFavorite,
  onDelete,
}: ItemCardProps) {
  const domain = (() => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  })();

  const isVideo = type === 'video';
  const defaultThumbnail = isVideo
    ? 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=225&fit=crop'
    : 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=225&fit=crop';

  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden shadow-soft hover:shadow-card transition-all duration-200">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative aspect-video bg-muted">
          <img
            src={thumbnail_url || defaultThumbnail}
            alt={title || 'Content thumbnail'}
            className="w-full h-full object-cover"
          />
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
              <div className="w-12 h-12 rounded-full bg-card/90 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[16px] border-l-foreground border-y-[10px] border-y-transparent ml-1" />
              </div>
            </div>
          )}
        </div>
      </a>
      
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 text-foreground mb-1">
          {title || 'Untitled'}
        </h3>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          {domain}
        </p>
        
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(id, !is_favorite);
            }}
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors',
                is_favorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'
              )}
            />
          </Button>
          
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                onDelete(id);
              }}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
