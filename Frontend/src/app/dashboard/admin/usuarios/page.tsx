import DashboardShell from "@/componentes/layout/DashboardShell";
import UsuariosAdmin from "@/modulos/admin/UsuariosAdmin";

export const metadata = { title: "Gestión de Usuarios — Oasis Aura" };

export default function Page() {
  return (
    <DashboardShell rol="admin" titulo="Usuarios" descripcion="Administración de cuentas, roles y permisos de acceso.">
      <UsuariosAdmin />
    </DashboardShell>
  );
}
