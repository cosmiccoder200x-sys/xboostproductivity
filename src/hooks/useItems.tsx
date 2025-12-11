import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Item {
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
}

interface CreateItemInput {
  url: string;
  title?: string;
  description?: string;
  thumbnail_url?: string;
  type?: 'video' | 'link';
  folder_id?: string | null;
  notes?: string;
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
      
      if (folderId) {
        query = query.eq('folder_id', folderId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Item[];
    },
    enabled: !!user,
  });

  const createItemMutation = useMutation({
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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      const { error } = await supabase
        .from('items')
        .update({ is_favorite })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  return {
    items,
    isLoading,
    createItem: createItemMutation.mutateAsync,
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    deleteItem: deleteItemMutation.mutateAsync,
  };
}
