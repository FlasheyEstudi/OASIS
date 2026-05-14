"use client";

import React from "react";
import { useAuthStore } from "@/almacenes/usoAuth";
import InicioPaciente from "@/modulos/dashboard/paciente/Inicio";
import { SkeletonDashboard } from "@/componentes/ui/Skeleton";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();

  // Si no está autenticado, el layout de dashboard se encarga del redirect.
  // Aquí solo determinamos qué vista mostrar según el rol.
  
  if (!isAuthenticated || !user) {
    return <SkeletonDashboard />;
  }

  // Renderizar la vista correspondiente al rol
  switch (user.role) {
    case "patient":
      return <InicioPaciente />;
    case "doctor":
      return (
        <div className="flex items-center justify-center h-[60vh] text-muted">
          <p className="font-display text-fluid-xl italic">Panel de Doctor en desarrollo...</p>
        </div>
      );
    // ... otros roles
    default:
      return <InicioPaciente />;
  }
}
