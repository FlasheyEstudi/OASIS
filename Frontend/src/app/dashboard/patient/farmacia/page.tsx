import DashboardShell from "@/componentes/layout/DashboardShell";
import FarmaciaPaciente from "@/modulos/paciente/FarmaciaPaciente";


export default function Page() {
  return (
    <DashboardShell rol="patient" titulo="Farmacia Digital" descripcion="Compra medicamentos y productos de salud con entrega a domicilio.">
      <FarmaciaPaciente />
    </DashboardShell>
  );
}
