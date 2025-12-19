import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  favoriteCategory: string | null;
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ fullName }: { fullName: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });
}

export function useOrderStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['orderStats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: purchases, error } = await supabase
        .from('purchases')
        .select(`
          quantity,
          total_price,
          sweets (category)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const totalOrders = purchases?.length || 0;
      const totalSpent = purchases?.reduce((sum, p) => sum + Number(p.total_price), 0) || 0;

      // Find favorite category
      const categoryCount: Record<string, number> = {};
      purchases?.forEach((p) => {
        const category = (p.sweets as any)?.category;
        if (category) {
          categoryCount[category] = (categoryCount[category] || 0) + p.quantity;
        }
      });

      const favoriteCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      return {
        totalOrders,
        totalSpent,
        favoriteCategory,
      } as OrderStats;
    },
    enabled: !!user,
  });
}
