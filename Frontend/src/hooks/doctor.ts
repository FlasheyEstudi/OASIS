import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

// --- PACIENTES ---
export const usePacientesDoctor = () => {
  return useQuery({
    queryKey: ["doctor", "pacientes"],
    queryFn: async () => {
      const res = await apiClient.get("/doctor/patients");
      return res.data.data;
    },
  });
};

// --- AGENDA / CITAS ---
export const useAgendaDoctor = (doctorId: string) => {
  return useQuery({
    queryKey: ["doctor", "agenda", doctorId],
    queryFn: async () => {
      const res = await apiClient.get(`/doctors/${doctorId}/appointments`);
      return res.data.data;
    },
    enabled: !!doctorId,
  });
};

export const useScheduleDoctor = (doctorId: string) => {
  return useQuery({
    queryKey: ["doctor", "schedule", doctorId],
    queryFn: async () => {
      const res = await apiClient.get(`/doctors/${doctorId}/schedule`);
      return res.data.data;
    },
    enabled: !!doctorId,
  });
};

// --- RECETAS ---
export const useRecetasDoctor = () => {
  return useQuery({
    queryKey: ["doctor", "recetas"],
    queryFn: async () => {
      const res = await apiClient.get("/doctor/prescriptions");
      return res.data.data;
    },
  });
};

export const useCrearReceta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/doctor/prescriptions", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor", "recetas"] });
    },
  });
};

// --- CLINICAL CHECK ---
export const useVerificarInteracciones = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/clinical-check/interactions", data);
      return res.data.data;
    },
  });
};

// --- CHAT ---
export const useChats = () => {
  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await apiClient.get("/chats");
      return res.data.data;
    },
  });
};

export const useMensajesChat = (chatId: string) => {
  return useQuery({
    queryKey: ["chats", chatId, "mensajes"],
    queryFn: async () => {
      const res = await apiClient.get(`/chats/${chatId}/messages`);
      return res.data.data;
    },
    enabled: !!chatId,
  });
};

export const useEnviarMensaje = (chatId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post(`/chats/${chatId}/messages`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", chatId, "mensajes"] });
    },
  });
};
