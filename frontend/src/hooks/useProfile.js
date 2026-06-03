import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const data = await api.get("/auth/me");
      return data;
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ fullName }) => {
      if (!user) throw new Error("Not authenticated");
      const data = await api.put("/auth/profile", { fullName });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });
}

export function useOrderStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["orderStats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const data = await api.get("/auth/stats");
      return data;
    },
    enabled: !!user,
  });
}
