import { Heart, ExternalLink, Trash2, ListPlus, CheckCircle2, BookOpen, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { safeHref } from '@/lib/url';
import { QueueBucket, ItemStatus } from '@/hooks/useItems';

interface ItemCardProps {
  id: string;
  title: string | null;
  url: string;
  thumbnail_url?: string | null;
  type: string;
  is_favorite: boolean;
  status?: ItemStatus;
  progress?: number;
  queue_bucket?: QueueBucket | null;
  reading_time_minutes?: number | null;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onDelete?: (id: string) => void;
  onSetQueue?: (id: string, bucket: QueueBucket | null) => void;
}

const STATUS_META: Record<ItemStatus, { icon: any; label: string; cls: string }> = {
  not_started: { icon: Circle, label: 'Not started', cls: 'text-muted-foreground' },
  reading: { icon: BookOpen, label: 'Reading', cls: 'text-primary' },
  completed: { icon: CheckCircle2, label: 'Completed', cls: 'text-accent' },
};

const QUEUE_LABEL: Record<QueueBucket, string> = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  this_week: 'This Week',
  someday: 'Someday',
};

export default function ItemCard({
  id,
  title,
  url,
  thumbnail_url,
  type,
  is_favorite,
  status = 'not_started',
  progress = 0,
  queue_bucket,
  onToggleFavorite,
  onDelete,
  onSetQueue,
}: ItemCardProps) {
  const domain = (() => {
    try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
  })();

  const isVideo = type === 'video';
  const defaultThumbnail = isVideo
    ? 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=225&fit=crop'
    : 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=225&fit=crop';

  const StatusIcon = STATUS_META[status].icon;

  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden shadow-soft hover:shadow-card transition-all duration-200">
      <Link to={`/items/${id}`} className="block">
        <div className="relative aspect-video bg-muted">
          <img
            src={thumbnail_url || defaultThumbnail}
            alt={title || 'Content thumbnail'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
              <div className="w-12 h-12 rounded-full bg-card/90 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[16px] border-l-foreground border-y-[10px] border-y-transparent ml-1" />
              </div>
            </div>
          )}
          {queue_bucket && (
            <span className="absolute top-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
              {QUEUE_LABEL[queue_bucket]}
            </span>
          )}
        </div>
      </Link>

      <div className="p-3">
        <Link to={`/items/${id}`}>
          <h3 className="font-medium text-sm line-clamp-2 text-foreground mb-1 hover:text-primary transition-colors">
            {title || 'Untitled'}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          {domain}
        </p>

        {progress > 0 && progress < 100 && (
          <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onToggleFavorite(id, !is_favorite)}
              aria-label="Toggle favorite"
            >
              <Heart className={cn('h-4 w-4 transition-colors', is_favorite ? 'fill-destructive text-destructive' : 'text-muted-foreground')} />
            </Button>
            <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium', STATUS_META[status].cls)}>
              <StatusIcon className="h-3.5 w-3.5" />
              {STATUS_META[status].label}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {onSetQueue && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Add to queue">
                    <ListPlus className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Read later</DropdownMenuLabel>
                  {(['today', 'tomorrow', 'this_week', 'someday'] as QueueBucket[]).map(b => (
                    <DropdownMenuItem key={b} onClick={() => onSetQueue(id, b)}>
                      {QUEUE_LABEL[b]}
                    </DropdownMenuItem>
                  ))}
                  {queue_bucket && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onSetQueue(id, null)}>
                        Remove from queue
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <a href={safeHref(url)} target="_blank" rel="noopener noreferrer" className="inline-flex">
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Open link">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Button>
            </a>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onDelete(id)}
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
