import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

// --- PERFIL Y LEALTAD ---
export const usePerfilPaciente = () => {
  return useQuery({
    queryKey: ["paciente", "perfil"],
    queryFn: async () => {
      const res = await apiClient.get("/patient/profile");
      return res.data.data;
    },
  });
};

export const usePuntosLealtad = () => {
  return useQuery({
    queryKey: ["paciente", "lealtad"],
    queryFn: async () => {
      const res = await apiClient.get("/patient/loyalty");
      return res.data.data;
    },
  });
};

// --- CITAS ---
export const useCitas = (filtros: any = {}) => {
  return useQuery({
    queryKey: ["paciente", "citas", filtros],
    queryFn: async () => {
      const params = new URLSearchParams(filtros).toString();
      const res = await apiClient.get(`/patient/appointments?${params}`);
      return res.data.data;
    },
  });
};

export const useCrearCita = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/patient/appointments", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paciente", "citas"] });
    },
  });
};

// --- RECETAS ---
export const useRecetas = (filtros: any = {}) => {
  return useQuery({
    queryKey: ["paciente", "recetas", filtros],
    queryFn: async () => {
      const params = new URLSearchParams(filtros).toString();
      const res = await apiClient.get(`/patient/prescriptions?${params}`);
      return res.data.data;
    },
  });
};

export const useRecordatorios = () => {
  return useQuery({
    queryKey: ["paciente", "recordatorios"],
    queryFn: async () => {
      const res = await apiClient.get("/patient/refill-reminders");
      return res.data.data;
    },
  });
};

// --- FARMACIA Y PEDIDOS ---
export const useBuscarMedicamentos = (query: string) => {
  return useQuery({
    queryKey: ["farmacia", "buscar", query],
    queryFn: async () => {
      const res = await apiClient.get(`/patient/search-medications?query=${query}`);
      return res.data.data;
    },
    enabled: query.length > 2,
  });
};

export const useFarmaciasCercanas = (lat?: number, lng?: number) => {
  return useQuery({
    queryKey: ["farmacia", "cercanas", lat, lng],
    queryFn: async () => {
      const res = await apiClient.get(`/patient/nearby-pharmacies?lat=${lat}&lng=${lng}`);
      return res.data.data;
    },
    enabled: !!lat && !!lng,
  });
};

export const usePedidos = (filtros: any = {}) => {
  return useQuery({
    queryKey: ["paciente", "pedidos", filtros],
    queryFn: async () => {
      const params = new URLSearchParams(filtros).toString();
      const res = await apiClient.get(`/orders?${params}`);
      return res.data.data;
    },
  });
};

export const usePedido = (id: string) => {
  return useQuery({
    queryKey: ["paciente", "pedido", id],
    queryFn: async () => {
      const res = await apiClient.get(`/orders/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
};

export const useCrearPedido = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/orders", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paciente", "pedidos"] });
    },
  });
};

// --- FAMILIA ---
export const useFamiliares = () => {
  return useQuery({
    queryKey: ["paciente", "familia"],
    queryFn: async () => {
      const res = await apiClient.get("/patient/family-members");
      return res.data.data;
    },
  });
};

export const useAgregarFamiliar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/patient/family-members", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paciente", "familia"] });
    },
  });
};

// --- HISTORIAL ---
export const useHistorial = (patientId?: string) => {
  return useQuery({
    queryKey: ["paciente", "historial", patientId],
    queryFn: async () => {
      const res = await apiClient.get(`/patients/${patientId}/history`);
      return res.data.data;
    },
    enabled: !!patientId,
  });
};

// --- NOTIFICACIONES ---
export const useNotificaciones = () => {
  return useQuery({
    queryKey: ["paciente", "notificaciones"],
    queryFn: async () => {
      const res = await apiClient.get("/notifications");
      return res.data.data;
    },
  });
};

export const useMarcarLeida = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paciente", "notificaciones"] });
    },
  });
};
