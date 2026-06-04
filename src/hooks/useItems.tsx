import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { recordActivity } from '@/lib/activity';

export type QueueBucket = 'today' | 'tomorrow' | 'this_week' | 'someday';
export type ItemStatus = 'not_started' | 'reading' | 'completed';

export interface Highlight {
  id: string;
  text: string;
  note?: string;
  created_at: string;
}

export interface Item {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  type: string;
  is_favorite: boolean;
  notes: string | null;
  folder_id: string | null;
  created_at: string;
  user_id: string;
  queue_bucket: QueueBucket | null;
  status: ItemStatus;
  progress: number;
  completed_at: string | null;
  highlights: Highlight[];
  summary: string | null;
  key_points: string[];
  reading_time_minutes: number | null;
}

interface CreateItemInput {
  url: string;
  title?: string;
  description?: string;
  thumbnail_url?: string;
  type?: 'video' | 'link';
  folder_id?: string | null;
  notes?: string;
  queue_bucket?: QueueBucket | null;
}

export function useItems(folderId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items', user?.id, folderId],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (folderId) query = query.eq('folder_id', folderId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        highlights: Array.isArray(d.highlights) ? d.highlights : [],
        key_points: Array.isArray(d.key_points) ? d.key_points : [],
      })) as Item[];
    },
    enabled: !!user,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['items'] });
    queryClient.invalidateQueries({ queryKey: ['activity'] });
  };

  const createItem = useMutation({
    mutationFn: async (input: CreateItemInput) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('items')
        .insert({
          ...input,
          user_id: user.id,
          folder_id: input.folder_id === 'none' ? null : input.folder_id,
        })
        .select()
        .single();
      if (error) throw error;
      await recordActivity(user.id, { items_saved: 1 });
      return data;
    },
    onSuccess: invalidate,
  });

  const toggleFavorite = useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      const { error } = await supabase.from('items').update({ is_favorite }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateQueue = useMutation({
    mutationFn: async ({ id, queue_bucket }: { id: string; queue_bucket: QueueBucket | null }) => {
      const { error } = await supabase.from('items').update({ queue_bucket }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, prev }: { id: string; status: ItemStatus; prev: ItemStatus }) => {
      if (!user) throw new Error('Not authenticated');
      const patch: any = { status };
      if (status === 'completed') {
        patch.completed_at = new Date().toISOString();
        patch.progress = 100;
      } else if (status === 'not_started') {
        patch.progress = 0;
        patch.completed_at = null;
      }
      const { error } = await supabase.from('items').update(patch).eq('id', id);
      if (error) throw error;
      if (status === 'reading' && prev === 'not_started') {
        await recordActivity(user.id, { items_read: 1 });
      }
      if (status === 'completed' && prev !== 'completed') {
        await recordActivity(user.id, { items_completed: 1 });
      }
    },
    onSuccess: invalidate,
  });

  const updateProgress = useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      const patch: any = { progress };
      if (progress >= 100) {
        patch.status = 'completed';
        patch.completed_at = new Date().toISOString();
      } else if (progress > 0) {
        patch.status = 'reading';
      }
      const { error } = await supabase.from('items').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateNotes = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase.from('items').update({ notes }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateHighlights = useMutation({
    mutationFn: async ({ id, highlights }: { id: string; highlights: Highlight[] }) => {
      const { error } = await supabase.from('items').update({ highlights: highlights as any }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    items,
    isLoading,
    createItem: createItem.mutateAsync,
    toggleFavorite: toggleFavorite.mutateAsync,
    deleteItem: deleteItem.mutateAsync,
    updateQueue: updateQueue.mutateAsync,
    updateStatus: updateStatus.mutateAsync,
    updateProgress: updateProgress.mutateAsync,
    updateNotes: updateNotes.mutateAsync,
    updateHighlights: updateHighlights.mutateAsync,
  };
}

export function useItem(id: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['item', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('items').select('*').eq('id', id).single();
      if (error) throw error;
      return {
        ...data,
        highlights: Array.isArray((data as any).highlights) ? (data as any).highlights : [],
        key_points: Array.isArray((data as any).key_points) ? (data as any).key_points : [],
      } as Item;
    },
    enabled: !!user && !!id,
  });
}

export async function summarizeAndSaveItem(itemId: string, url: string) {
  const { data, error } = await supabase.functions.invoke('summarize-link', {
    body: { url },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  const patch: any = {
    summary: data.summary ?? null,
    key_points: data.key_points ?? [],
    reading_time_minutes: data.reading_time_minutes ?? null,
  };
  if (data.title && data.title.length > 0) patch.title = data.title;
  const { error: upErr } = await supabase.from('items').update(patch).eq('id', itemId);
  if (upErr) throw upErr;
  return data;
}
