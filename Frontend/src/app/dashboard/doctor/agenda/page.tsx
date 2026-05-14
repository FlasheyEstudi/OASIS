import DashboardShell from "@/componentes/layout/DashboardShell";
import AgendaDoctor from "@/modulos/doctor/AgendaDoctor";

export const metadata = { title: "Agenda Médica — Oasis Aura" };

export default function Page() {
  return (
    <DashboardShell rol="doctor" titulo="Agenda" descripcion="Consulta tu calendario de citas presenciales y virtuales.">
      <AgendaDoctor />
    </DashboardShell>
  );
}
