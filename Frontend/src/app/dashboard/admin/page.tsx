import DashboardShell from "@/componentes/layout/DashboardShell";
import DashboardAdmin from "@/modulos/admin/DashboardAdmin";

export const metadata = { title: "Supervisión Global — Oasis Aura" };

export default function Page() {
  return (
    <DashboardShell rol="admin" titulo="Panel de Control" descripcion="Administración centralizada del ecosistema Oasis Aura.">
      <DashboardAdmin />
    </DashboardShell>
  );
}
