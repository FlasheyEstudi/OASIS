import DashboardShell from "@/componentes/layout/DashboardShell";
import ChatPanel from "@/componentes/compartidos/ChatPanel";

export const metadata = { title: "Atención al Cliente — Oasis Aura" };

export default function Page() {
  return (
    <DashboardShell rol="pharmacy_admin" titulo="Mensajería" descripcion="Chat directo con pacientes y repartidores.">
      <ChatPanel />
    </DashboardShell>
  );
}
