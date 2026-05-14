import DashboardShell from "@/componentes/layout/DashboardShell";
import ChatPanel from "@/componentes/compartidos/ChatPanel";

export const metadata = { title: "Consultas Directas — Oasis Aura" };

export default function Page() {
  return (
    <DashboardShell rol="doctor" titulo="Mensajería" descripcion="Consulta directa con tus pacientes asignados.">
      <ChatPanel />
    </DashboardShell>
  );
}
