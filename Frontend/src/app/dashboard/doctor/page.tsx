import DashboardShell from "@/componentes/layout/DashboardShell";
import DashboardDoctor from "@/modulos/doctor/DashboardDoctor";

export const metadata = { title: "Panel Médico — Oasis Aura" };

export default function Page() {
  return (
    <DashboardShell rol="doctor" titulo="Dashboard Médico" descripcion="Resumen de tu actividad clínica hoy.">
      <DashboardDoctor />
    </DashboardShell>
  );
}
