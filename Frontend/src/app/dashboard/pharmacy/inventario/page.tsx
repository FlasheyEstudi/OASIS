import DashboardShell from "@/componentes/layout/DashboardShell";
import InventarioFarmacia from "@/modulos/farmacia/InventarioFarmacia";

export const metadata = { title: "Inventario Inteligente — Oasis Aura" };

export default function Page() {
  return (
    <DashboardShell rol="pharmacy_admin" titulo="Inventario" descripcion="Gestión de lotes, fechas de vencimiento y existencias en tiempo real.">
      <InventarioFarmacia />
    </DashboardShell>
  );
}
