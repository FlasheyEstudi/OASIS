import DashboardShell from "@/componentes/layout/DashboardShell";
import EntregaActiva from "@/modulos/delivery/EntregaActiva";

export const metadata = { title: "Navegación Activa — Oasis Aura" };

export default function Page() {
  return (
    <DashboardShell rol="delivery_person" titulo="Entrega en Curso" descripcion="Sigue la ruta y confirma la entrega de forma segura.">
      <EntregaActiva />
    </DashboardShell>
  );
}
