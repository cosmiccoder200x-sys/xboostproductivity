import { useState } from 'react';
import { X, Link2, Loader2, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddContentModal } from '@/hooks/useAddContentModal';
import { useFolders } from '@/hooks/useFolders';
import { useItems, summarizeAndSaveItem } from '@/hooks/useItems';
import { useToast } from '@/hooks/use-toast';
import { isSafeHttpUrl } from '@/lib/url';
import { useQueryClient } from '@tanstack/react-query';

export default function AddContentModal() {
  const { isOpen, closeModal } = useAddContentModal();
  const { folders } = useFolders();
  const { createItem } = useItems();
  const { toast } = useToast();
  
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [folderId, setFolderId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<{ title: string; domain: string; thumbnail?: string } | null>(null);

  const extractDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return '';
    }
  };

  const handleUrlChange = async (value: string) => {
    setUrl(value);
    
    if (value.startsWith('http://') || value.startsWith('https://')) {
      setIsLoading(true);
      // Simulate smart detection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const domain = extractDomain(value);
      const isVideo = domain.includes('youtube') || domain.includes('vimeo') || domain.includes('tiktok');
      
      setPreview({
        title: `Content from ${domain}`,
        domain,
        thumbnail: isVideo ? `https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=225&fit=crop` : undefined,
      });
      setTitle(`Content from ${domain}`);
      setIsLoading(false);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!url) return;

    if (!isSafeHttpUrl(url)) {
      toast({
        title: 'Invalid URL',
        description: 'Only http:// and https:// URLs are allowed.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const domain = extractDomain(url);
      const isVideo = domain.includes('youtube') || domain.includes('vimeo') || domain.includes('tiktok');
      
      await createItem({
        url,
        title: title || `Content from ${domain}`,
        type: isVideo ? 'video' : 'link',
        folder_id: folderId || null,
        notes,
      });
      
      toast({
        title: 'Link saved!',
        description: 'Your content has been added successfully.',
      });
      
      // Reset form
      setUrl('');
      setTitle('');
      setNotes('');
      setTags('');
      setFolderId('');
      setPreview(null);
      closeModal();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save content. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Add Content
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="Paste a link here..."
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Detecting content...</span>
            </div>
          )}

          {preview && !isLoading && (
            <div className="rounded-lg border border-border bg-muted/50 p-3 animate-scale-in">
              <div className="flex gap-3">
                {preview.thumbnail && (
                  <img
                    src={preview.thumbnail}
                    alt="Preview"
                    className="h-16 w-24 rounded-md object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{preview.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <ExternalLink className="h-3 w-3" />
                    {preview.domain}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="Custom title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder">Folder</Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a folder..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No folder</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="Add tags separated by commas..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={closeModal}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={!url || isLoading}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
