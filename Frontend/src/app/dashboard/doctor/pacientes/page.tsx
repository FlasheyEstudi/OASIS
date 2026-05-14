import DashboardShell from "@/componentes/layout/DashboardShell";
import PacientesDoctor from "@/modulos/doctor/PacientesDoctor";

export const metadata = { title: "Mis Pacientes — Oasis Aura" };

export default function Page() {
  return (
    <DashboardShell rol="doctor" titulo="Mis Pacientes" descripcion="Gestión de expedientes y seguimiento clínico.">
      <PacientesDoctor />
    </DashboardShell>
  );
}
