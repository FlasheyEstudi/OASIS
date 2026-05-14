import DashboardShell from "@/componentes/layout/DashboardShell";
import NotificacionesPaciente from "@/modulos/paciente/NotificacionesPaciente";

export const metadata = { title: "Notificaciones — Oasis Aura" };

export default function Page() {
  return (
    <DashboardShell rol="patient" titulo="Avisos Aura" descripcion="Mantente al día con tus citas, pedidos y mensajes médicos.">
      <NotificacionesPaciente />
    </DashboardShell>
  );
}
