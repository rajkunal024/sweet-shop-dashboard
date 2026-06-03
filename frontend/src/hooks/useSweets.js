import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function useSweets(searchQuery, category, minPrice, maxPrice) {
  return useQuery({
    queryKey: ["sweets", searchQuery, category, minPrice, maxPrice],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("searchQuery", searchQuery);
      if (category) params.append("category", category);
      if (minPrice !== undefined) params.append("minPrice", String(minPrice));
      if (maxPrice !== undefined) params.append("maxPrice", String(maxPrice));

      const queryString = params.toString();
      const url = `/sweets${queryString ? `?${queryString}` : ""}`;
      const data = await api.get(url);
      return data;
    },
  });
}

export function useAddSweet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sweet) => {
      const data = await api.post("/sweets", sweet);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sweets"] });
      toast.success("Sweet added successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to add sweet: ${error.message}`);
    },
  });
}

export function useUpdateSweet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...sweet }) => {
      const data = await api.put(`/sweets/${id}`, sweet);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sweets"] });
      toast.success("Sweet updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update sweet: ${error.message}`);
    },
  });
}

export function useDeleteSweet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/sweets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sweets"] });
      toast.success("Sweet deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to delete sweet: ${error.message}`);
    },
  });
}

export function usePurchaseSweet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sweetId, quantity }) => {
      const data = await api.post(`/sweets/${sweetId}/purchase`, { quantity });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sweets"] });
      toast.success("Purchase successful!");
    },
    onError: (error) => {
      toast.error(`Purchase failed: ${error.message}`);
    },
  });
}

export function useRestockSweet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sweetId, quantity }) => {
      const data = await api.post(`/sweets/${sweetId}/restock`, { quantity });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sweets"] });
      toast.success("Restock successful!");
    },
    onError: (error) => {
      toast.error(`Restock failed: ${error.message}`);
    },
  });
}
