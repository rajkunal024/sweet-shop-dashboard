import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';

export interface PurchaseWithSweet {
  id: string;
  quantity: number;
  total_price: number;
  created_at: string;
  sweet: {
    id: string;
    name: string;
    image_url: string | null;
    category: string;
  } | null;
}

export function usePurchases() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['purchases', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          quantity,
          total_price,
          created_at,
          sweet:sweets (
            id,
            name,
            image_url,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PurchaseWithSweet[];
    },
    enabled: !!user,
  });
}
