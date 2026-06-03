import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export function usePurchases() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["purchases", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const data = await api.get("/purchases");
      return data;
    },
    enabled: !!user,
  });
}
