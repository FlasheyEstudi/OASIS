import DashboardShell from "@/componentes/layout/DashboardShell";
import HistorialPaciente from "@/modulos/paciente/HistorialPaciente";

export const metadata = { title: "Mi Historial — Oasis Aura" };

export default function Page() {
  return (
    <DashboardShell rol="patient" titulo="Historial Clínico" descripcion="Tu registro de salud completo, seguro y siempre accesible.">
      <HistorialPaciente />
    </DashboardShell>
  );
}
