import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, ExternalLink, Trash2, Heart, Plus, X } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useItem, useItems, ItemStatus, QueueBucket, Highlight } from '@/hooks/useItems';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { safeHref } from '@/lib/url';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: item, isLoading } = useItem(id);
  const {
    toggleFavorite, deleteItem, updateStatus, updateProgress,
    updateNotes, updateHighlights, updateQueue,
  } = useItems();

  const [notesDraft, setNotesDraft] = useState<string | null>(null);
  const [highlightText, setHighlightText] = useState('');
  const [highlightNote, setHighlightNote] = useState('');

  if (isLoading) {
    return (
      <AppLayout>
        <div className="px-4 py-6 max-w-3xl mx-auto animate-pulse space-y-4">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-48 bg-muted rounded-xl" />
          <div className="h-4 w-2/3 bg-muted rounded" />
        </div>
      </AppLayout>
    );
  }

  if (!item) {
    return (
      <AppLayout>
        <div className="px-4 py-12 text-center">
          <p className="text-muted-foreground">Item not found.</p>
          <Button asChild className="mt-4"><Link to="/">Back home</Link></Button>
        </div>
      </AppLayout>
    );
  }

  const notes = notesDraft ?? item.notes ?? '';

  const addHighlight = async () => {
    if (!highlightText.trim()) return;
    const h: Highlight = {
      id: crypto.randomUUID(),
      text: highlightText.trim(),
      note: highlightNote.trim() || undefined,
      created_at: new Date().toISOString(),
    };
    await updateHighlights({ id: item.id, highlights: [...item.highlights, h] });
    setHighlightText(''); setHighlightNote('');
    toast.success('Highlight saved');
  };

  const removeHighlight = async (hid: string) => {
    await updateHighlights({ id: item.id, highlights: item.highlights.filter(h => h.id !== hid) });
  };

  const saveNotes = async () => {
    await updateNotes({ id: item.id, notes });
    setNotesDraft(null);
    toast.success('Notes saved');
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => toggleFavorite({ id: item.id, is_favorite: !item.is_favorite })}>
              <Heart className={cn('h-4 w-4', item.is_favorite && 'fill-destructive text-destructive')} />
            </Button>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
            </a>
            <Button variant="ghost" size="icon" onClick={async () => { await deleteItem(item.id); toast.success('Deleted'); navigate('/'); }}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        {item.thumbnail_url && (
          <img src={item.thumbnail_url} alt="" className="w-full aspect-video object-cover rounded-xl border border-border" />
        )}

        <div>
          <h1 className="text-2xl font-semibold text-foreground">{item.title || 'Untitled'}</h1>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">{item.url}</a>
          {item.description && <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>}
        </div>

        {/* Progress & Status */}
        <section className="bg-card rounded-xl border border-border p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select
                value={item.status}
                onValueChange={(v) => updateStatus({ id: item.id, status: v as ItemStatus, prev: item.status })}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Read Later</label>
              <Select
                value={item.queue_bucket ?? 'none'}
                onValueChange={(v) => updateQueue({ id: item.id, queue_bucket: v === 'none' ? null : v as QueueBucket })}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not queued</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="someday">Someday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground">Progress</label>
              <span className="text-sm font-semibold text-foreground">{item.progress}%</span>
            </div>
            <Slider
              value={[item.progress]}
              max={100}
              step={5}
              onValueChange={(v) => updateProgress({ id: item.id, progress: v[0] })}
            />
          </div>
        </section>

        {/* Notes */}
        <section className="bg-card rounded-xl border border-border p-4">
          <h2 className="text-sm font-semibold mb-2">Personal Notes</h2>
          <Textarea
            placeholder="Your thoughts, takeaways, summary..."
            value={notes}
            onChange={(e) => setNotesDraft(e.target.value)}
            rows={4}
          />
          {notesDraft !== null && notesDraft !== (item.notes ?? '') && (
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={saveNotes}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setNotesDraft(null)}>Cancel</Button>
            </div>
          )}
        </section>

        {/* Highlights */}
        <section className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h2 className="text-sm font-semibold">Highlights & Quotes</h2>
          <div className="space-y-2">
            <Textarea
              placeholder="Paste a quote or key takeaway..."
              value={highlightText}
              onChange={(e) => setHighlightText(e.target.value)}
              rows={2}
            />
            <Input
              placeholder="Optional note about this highlight"
              value={highlightNote}
              onChange={(e) => setHighlightNote(e.target.value)}
            />
            <Button size="sm" onClick={addHighlight} disabled={!highlightText.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Add highlight
            </Button>
          </div>

          {item.highlights.length > 0 && (
            <ul className="space-y-3 pt-2 border-t border-border">
              {item.highlights.map(h => (
                <li key={h.id} className="border-l-2 border-primary pl-3 py-1 group">
                  <div className="flex items-start justify-between gap-2">
                    <blockquote className="text-sm text-foreground italic">"{h.text}"</blockquote>
                    <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeHighlight(h.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {h.note && <p className="text-xs text-muted-foreground mt-1">{h.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
