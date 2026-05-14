import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

// --- INVENTARIO ---
export const useInventario = () => {
  return useQuery({
    queryKey: ["farmacia", "inventario"],
    queryFn: async () => {
      const res = await apiClient.get("/pharmacy/inventory");
      return res.data.data;
    },
  });
};

export const useInventarioVencimiento = () => {
  return useQuery({
    queryKey: ["farmacia", "inventario", "vencimiento"],
    queryFn: async () => {
      const res = await apiClient.get("/pharmacy/inventory/expiring");
      return res.data.data;
    },
  });
};

export const useAgregarLote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/pharmacy/inventory", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmacia", "inventario"] });
    },
  });
};

// --- PEDIDOS ---
export const usePedidosFarmacia = (filtros: any = {}) => {
  return useQuery({
    queryKey: ["farmacia", "pedidos", filtros],
    queryFn: async () => {
      const params = new URLSearchParams(filtros).toString();
      const res = await apiClient.get(`/pharmacy/orders?${params}`);
      return res.data.data;
    },
  });
};

export const useAceptarPedido = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.put(`/pharmacy/orders/${id}/accept`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmacia", "pedidos"] });
    },
  });
};

// --- REPORTES ---
export const useReportesVentas = (pharmacyId: string) => {
  return useQuery({
    queryKey: ["farmacia", "reportes", "ventas", pharmacyId],
    queryFn: async () => {
      const res = await apiClient.get(`/pharmacies/${pharmacyId}/reports/sales`);
      return res.data.data;
    },
    enabled: !!pharmacyId,
  });
};

export const useReportesStock = (pharmacyId: string) => {
  return useQuery({
    queryKey: ["farmacia", "reportes", "stock", pharmacyId],
    queryFn: async () => {
      const res = await apiClient.get(`/pharmacies/${pharmacyId}/reports/stock-value`);
      return res.data.data;
    },
    enabled: !!pharmacyId,
  });
};

// --- PROVEEDORES ---
export const useProveedores = () => {
  return useQuery({
    queryKey: ["farmacia", "proveedores"],
    queryFn: async () => {
      const res = await apiClient.get("/pharmacy/suppliers");
      return res.data.data;
    },
  });
};

// --- FACTURAS ---
export const useFacturas = () => {
  return useQuery({
    queryKey: ["farmacia", "facturas"],
    queryFn: async () => {
      const res = await apiClient.get("/invoices");
      return res.data.data;
    },
  });
};
