import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/almacenes/usoAuth";

export function useDashboardStats() {
  const { user } = useAuthStore();
  const role = user?.role;

  return useQuery({
    queryKey: ["dashboard", "stats", role],
    queryFn: async () => {
      let endpoint = "/dashboard";
      
      switch (role) {
        case "patient": endpoint = "/patient/dashboard"; break;
        case "doctor": endpoint = "/doctor/dashboard"; break;
        case "pharmacy_admin":
        case "pharmacy_staff": endpoint = "/pharmacy/dashboard"; break;
        case "delivery_person": endpoint = "/delivery/dashboard"; break;
        case "superadmin": endpoint = "/admin/dashboard"; break;
        case "receptionist": endpoint = "/receptionist/dashboard"; break;
      }

      const { data } = await apiClient.get(endpoint);
      return data.data;
    },
    enabled: !!role,
    staleTime: 60000, // 1 minuto
  });
}
