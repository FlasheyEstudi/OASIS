import DashboardShell from "@/componentes/layout/DashboardShell";
import CitasPaciente from "@/modulos/paciente/CitasPaciente";


export default function Page() {
  return (
    <DashboardShell rol="patient" titulo="Mis Citas" descripcion="Gestiona tus consultas presenciales y virtuales.">
      <CitasPaciente />
    </DashboardShell>
  );
}
