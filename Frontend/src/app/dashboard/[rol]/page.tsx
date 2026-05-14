import { redirect } from "next/navigation";

export default function RolDashboardPage() {
  // Redirigir al dashboard principal para que el selector de roles se encargue
  redirect("/dashboard");
  return null;
}
