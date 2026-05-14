import DashboardShell from "@/componentes/layout/DashboardShell";
import PedidosPaciente from "@/modulos/paciente/PedidosPaciente";


export default function Page() {
  return (
    <DashboardShell rol="patient" titulo="Mis Pedidos" descripcion="Seguimiento en tiempo real de tus compras de farmacia.">
      <PedidosPaciente />
    </DashboardShell>
  );
}
