import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sweet, SweetFormData } from '@/types/sweet';
import { toast } from 'sonner';

export function useSweets(searchQuery?: string, category?: string, minPrice?: number, maxPrice?: number) {
  return useQuery({
    queryKey: ['sweets', searchQuery, category, minPrice, maxPrice],
    queryFn: async () => {
      let query = supabase
        .from('sweets')
        .select('*')
        .order('name');

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      if (category) {
        query = query.eq('category', category);
      }

      if (minPrice !== undefined) {
        query = query.gte('price', minPrice);
      }

      if (maxPrice !== undefined) {
        query = query.lte('price', maxPrice);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return data as Sweet[];
    },
  });
}

export function useAddSweet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sweet: SweetFormData) => {
      const { data, error } = await supabase
        .from('sweets')
        .insert([sweet])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sweets'] });
      toast.success('Sweet added successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to add sweet: ${error.message}`);
    },
  });
}

export function useUpdateSweet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...sweet }: SweetFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('sweets')
        .update(sweet)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sweets'] });
      toast.success('Sweet updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update sweet: ${error.message}`);
    },
  });
}

export function useDeleteSweet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sweets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sweets'] });
      toast.success('Sweet deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete sweet: ${error.message}`);
    },
  });
}

export function usePurchaseSweet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sweetId, quantity }: { sweetId: string; quantity: number }) => {
      const { data, error } = await supabase
        .rpc('purchase_sweet', { sweet_id: sweetId, purchase_quantity: quantity });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sweets'] });
      toast.success('Purchase successful!');
    },
    onError: (error) => {
      toast.error(`Purchase failed: ${error.message}`);
    },
  });
}

export function useRestockSweet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sweetId, quantity }: { sweetId: string; quantity: number }) => {
      const { data, error } = await supabase
        .rpc('restock_sweet', { sweet_id: sweetId, restock_quantity: quantity });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sweets'] });
      toast.success('Restock successful!');
    },
    onError: (error) => {
      toast.error(`Restock failed: ${error.message}`);
    },
  });
}
