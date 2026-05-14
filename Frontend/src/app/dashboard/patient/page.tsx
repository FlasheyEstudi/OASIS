import DashboardShell from "@/componentes/layout/DashboardShell";
import DashboardPaciente from "@/modulos/paciente/DashboardPaciente";

export const metadata = {
  title: "Dashboard de Salud — Oasis Aura",
  description: "Tu centro de control de bienestar inteligente.",
};

export default function PatientDashboardPage() {
  return (
    <DashboardShell 
      rol="patient" 
      titulo="Tu Bienestar" 
      descripcion="Bienvenido de vuelta. Aquí tienes un resumen de tu salud hoy."
    >
      <DashboardPaciente />
    </DashboardShell>
  );
}
