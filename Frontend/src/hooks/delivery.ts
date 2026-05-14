import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

// --- DISPONIBILIDAD ---
export const useToggleDisponibilidad = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (available: boolean) => {
      const res = await apiClient.put("/delivery/availability", { available });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery", "perfil"] });
    },
  });
};

// --- ENTREGAS ---
export const useEntregasDisponibles = () => {
  return useQuery({
    queryKey: ["delivery", "disponibles"],
    queryFn: async () => {
      const res = await apiClient.get("/delivery/available-orders");
      return res.data.data;
    },
  });
};

export const useAceptarEntrega = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const res = await apiClient.post("/delivery/accept-order", { orderId });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery", "disponibles"] });
      queryClient.invalidateQueries({ queryKey: ["delivery", "activa"] });
    },
  });
};

export const useRuta = (orderId: string) => {
  return useQuery({
    queryKey: ["delivery", "ruta", orderId],
    queryFn: async () => {
      const res = await apiClient.get(`/delivery/route/${orderId}`);
      return res.data.data;
    },
    enabled: !!orderId,
  });
};

export const useCompletarEntrega = (orderId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post(`/delivery/order/${orderId}/proof`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery", "activa"] });
      queryClient.invalidateQueries({ queryKey: ["delivery", "ganancias"] });
    },
  });
};

// --- GANANCIAS ---
export const useGanancias = () => {
  return useQuery({
    queryKey: ["delivery", "ganancias"],
    queryFn: async () => {
      const res = await apiClient.get("/delivery/earnings");
      return res.data.data;
    },
  });
};
