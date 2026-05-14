import DashboardShell from "@/componentes/layout/DashboardShell";
import FamiliaPaciente from "@/modulos/paciente/FamiliaPaciente";

export const metadata = { title: "Círculo Familiar — Oasis Aura" };

export default function Page() {
  return (
    <DashboardShell rol="patient" titulo="Familia" descripcion="Gestiona la salud de tus seres queridos desde un solo lugar.">
      <FamiliaPaciente />
    </DashboardShell>
  );
}
