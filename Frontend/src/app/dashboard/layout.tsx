"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/almacenes/usoAuth";
import DashboardShell from "@/componentes/layout/DashboardShell";
import socketService from "@/lib/socket";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    // Redirigir si no está autenticado
    if (!isAuthenticated) {
      router.push("/acceso/login");
      return;
    }

    // Lógica simple de protección de rutas por rol
    // Por ejemplo: si la ruta es /dashboard/admin y el rol no es superadmin
    if (pathname.includes("/admin") && user?.role !== "superadmin") {
      router.push("/dashboard");
    }

    // Conectar socket al entrar al dashboard
    socketService.connect();

    return () => {
      // Opcional: desconectar al salir, o mantener según necesidad
      // socketService.disconnect();
    };
  }, [isAuthenticated, router, pathname, user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Determinar título y descripción según la ruta
  const getPageInfo = () => {
    if (pathname.includes("/citas")) return { titulo: "Mis Citas", desc: "Gestión de consultas médicas" };
    if (pathname.includes("/pedidos")) return { titulo: "Farmacia", desc: "Pedidos y medicamentos" };
    if (pathname.includes("/historial")) return { titulo: "Historial Clínico", desc: "Tu salud en un solo lugar" };
    if (pathname.includes("/perfil")) return { titulo: "Mi Perfil", desc: "Configuración de cuenta" };
    if (pathname.includes("/chat")) return { titulo: "Mensajería", desc: "Chat con especialistas" };
    return { titulo: `Bienvenido, ${user.name.split(" ")[0]}`, desc: "Panel de control Oasis Aura" };
  };

  const { titulo, desc } = getPageInfo();

  return (
    <DashboardShell rol={user.role} titulo={titulo} descripcion={desc}>
      {children}
    </DashboardShell>
  );
}
