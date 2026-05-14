import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

// --- DOCTORES ---
export const useExplorarDoctores = (filtros: any = {}) => {
  return useQuery({
    queryKey: ["explorar", "doctores", filtros],
    queryFn: async () => {
      const params = new URLSearchParams(filtros).toString();
      const res = await apiClient.get(`/doctors?${params}`);
      return res.data.data;
    },
  });
};

// --- CLINICAS ---
export const useExplorarClinicas = (filtros: any = {}) => {
  return useQuery({
    queryKey: ["explorar", "clinicas", filtros],
    queryFn: async () => {
      // Si el endpoint no es público aún, devolvemos mock
      try {
        const params = new URLSearchParams(filtros).toString();
        const res = await apiClient.get(`/clinics?${params}`);
        return res.data.data;
      } catch (e) {
        console.warn("Usando datos mock para clínicas");
        return [
          { id: "1", name: "Clínica Aura Central", address: "Altamira, Managua", services: ["General", "Cardiología"], location: [12.12, -86.25] },
          { id: "2", name: "Centro Médico Oasis", address: "Carretera Masaya", services: ["Pediatría", "Dermatología"], location: [12.11, -86.24] },
        ];
      }
    },
  });
};

// --- FARMACIAS ---
export const useExplorarFarmacias = (filtros: any = {}) => {
  return useQuery({
    queryKey: ["explorar", "farmacias", filtros],
    queryFn: async () => {
      try {
        const params = new URLSearchParams(filtros).toString();
        const res = await apiClient.get(`/pharmacies?${params}`);
        return res.data.data;
      } catch (e) {
        return [
          { id: "1", name: "Farmacia San José", address: "Bello Horizonte", delivery: true, hours: "24/7", location: [12.14, -86.23] },
          { id: "2", name: "Farmacia Aura Norte", address: "Villa Fontana", delivery: true, hours: "7AM - 10PM", location: [12.10, -86.27] },
        ];
      }
    },
  });
};

// --- MEDICAMENTOS ---
export const useExplorarMedicamentos = (search: string = "") => {
  return useQuery({
    queryKey: ["explorar", "medicamentos", search],
    queryFn: async () => {
      const res = await apiClient.get(`/patient/search-medications?q=${search}`);
      return res.data.data;
    },
    enabled: search.length > 2 || search === "",
  });
};

// --- PERFIL PUBLICO ---
export const usePerfilPublico = (slug: string) => {
  return useQuery({
    queryKey: ["explorar", "perfil", slug],
    queryFn: async () => {
      const res = await apiClient.get(`/public/profile/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });
};
