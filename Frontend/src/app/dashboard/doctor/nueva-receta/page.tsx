import DashboardShell from "@/componentes/layout/DashboardShell";
import NuevaReceta from "@/modulos/doctor/NuevaReceta";

export const metadata = { title: "Emitir Receta — Oasis Aura" };

export default function Page() {
  return (
    <DashboardShell rol="doctor" titulo="Nueva Receta" descripcion="Emisión de prescripciones digitales firmadas.">
      <NuevaReceta />
    </DashboardShell>
  );
}
