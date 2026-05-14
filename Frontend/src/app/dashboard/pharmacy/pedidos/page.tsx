import DashboardShell from "@/componentes/layout/DashboardShell";
import PedidosFarmacia from "@/modulos/farmacia/PedidosFarmacia";

export const metadata = { title: "Órdenes de Compra — Oasis Aura" };

export default function Page() {
  return (
    <DashboardShell rol="pharmacy_admin" titulo="Pedidos" descripcion="Procesamiento y despacho de medicamentos para pacientes y clínicas.">
      <PedidosFarmacia />
    </DashboardShell>
  );
}
