import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

// --- DASHBOARD GLOBAL ---
export const useDashboardAdmin = () => {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/dashboard");
      return res.data.data;
    },
  });
};

// --- USUARIOS ---
export const useUsuarios = (filtros: any = {}) => {
  return useQuery({
    queryKey: ["admin", "users", filtros],
    queryFn: async () => {
      const params = new URLSearchParams(filtros).toString();
      const res = await apiClient.get(`/admin/users?${params}`);
      return res.data.data;
    },
  });
};

export const useCambiarRol = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string, role: string }) => {
      const res = await apiClient.put(`/admin/users/${id}/role`, { role });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

export const useDesactivarUsuario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.put(`/admin/users/${id}/deactivate`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

// --- AUDITORIA ---
export const useAuditLog = (filtros: any = {}) => {
  return useQuery({
    queryKey: ["admin", "audit"],
    queryFn: async () => {
      const params = new URLSearchParams(filtros).toString();
      const res = await apiClient.get(`/admin/audit-log?${params}`);
      return res.data.data;
    },
  });
};

// --- CONFIGURACION ---
export const useConfigSistema = () => {
  return useQuery({
    queryKey: ["admin", "config"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/config");
      return res.data.data;
    },
  });
};

export const useUpdateConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.put("/admin/config", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "config"] });
    },
  });
};
