import DashboardShell from "@/componentes/layout/DashboardShell";
import DashboardFarmacia from "@/modulos/farmacia/DashboardFarmacia";

export const metadata = { title: "Gestión Farmacéutica — Oasis Aura" };

export default function Page() {
  return (
    <DashboardShell rol="pharmacy_admin" titulo="Dashboard Farmacia" descripcion="Control de ventas, stock y operaciones logísticas.">
      <DashboardFarmacia />
    </DashboardShell>
  );
}
