import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  role: 'admin' | 'user';
  totalOrders: number;
  totalSpent: number;
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch all purchases for order stats
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('user_id, total_price');

      if (purchasesError) throw purchasesError;

      const rolesMap = new Map(roles?.map((r) => [r.user_id, r.role]) || []);

      // Calculate order stats per user
      const orderStatsMap = new Map<string, { totalOrders: number; totalSpent: number }>();
      purchases?.forEach((p) => {
        const stats = orderStatsMap.get(p.user_id) || { totalOrders: 0, totalSpent: 0 };
        stats.totalOrders += 1;
        stats.totalSpent += Number(p.total_price);
        orderStatsMap.set(p.user_id, stats);
      });

      return (profiles || []).map((profile) => ({
        ...profile,
        role: rolesMap.get(profile.id) || 'user',
        totalOrders: orderStatsMap.get(profile.id)?.totalOrders || 0,
        totalSpent: orderStatsMap.get(profile.id)?.totalSpent || 0,
      })) as UserProfile[];
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Delete from profiles (cascade will handle user_roles)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });
}
