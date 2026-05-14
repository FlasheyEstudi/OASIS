import DashboardShell from "@/componentes/layout/DashboardShell";
import DashboardDelivery from "@/modulos/delivery/DashboardDelivery";

export const metadata = { title: "Ruta de Entrega — Oasis Aura" };

export default function Page() {
  return (
    <DashboardShell rol="delivery_person" titulo="Dashboard" descripcion="Gestión de disponibilidad y entregas cercanas.">
      <DashboardDelivery />
    </DashboardShell>
  );
}
