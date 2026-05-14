import DashboardShell from "@/componentes/layout/DashboardShell";
import RecetasPaciente from "@/modulos/paciente/RecetasPaciente";

export const metadata = { title: "Mis Recetas — Oasis Aura" };

export default function Page() {
  return (
    <DashboardShell rol="patient" titulo="Mis Recetas" descripcion="Tus prescripciones médicas digitales y solicitudes de relleno.">
      <RecetasPaciente />
    </DashboardShell>
  );
}
