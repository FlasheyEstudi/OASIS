"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/almacenes/usoAuth";
import NavFlotante from "./NavFlotante";
import Avatar from "@/componentes/ui/Avatar";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  rol: string;
  children: React.ReactNode;
  titulo: string;
  descripcion?: string;
  acciones?: React.ReactNode;
}

const DashboardShell = ({
  rol,
  children,
  titulo,
  descripcion,
  acciones,
}: DashboardShellProps) => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      {/* Navegación Flotante (Desktop: Top, Mobile: Bottom) */}
      <NavFlotante />

      {/* Mobile Header (Solo < 1024px) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 frost border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-display text-fluid-base font-bold leading-tight">
            {titulo}
          </span>
          {descripcion && (
            <span className="text-[10px] text-muted uppercase tracking-widest font-bold truncate max-w-[150px]">
              {descripcion}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {acciones}
          <Avatar name={user?.name || "Usuario"} src={user?.avatar} size="sm" />
        </div>
      </header>

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 w-full max-w-[1400px] mx-auto px-6 pt-24 pb-32 lg:pt-32",
          "animate-in fade-in slide-in-from-bottom-4 duration-700 ease-apple"
        )}
      >
        {/* Desktop Header */}
        <div className="hidden lg:flex justify-between items-end mb-12">
          <div className="space-y-1">
            <h1 className="font-display text-fluid-3xl font-light text-text leading-tight">
              {titulo}
            </h1>
            {descripcion && (
              <p className="font-body text-fluid-base text-muted font-light">
                {descripcion}
              </p>
            )}
          </div>
          
          {acciones && (
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
              {acciones}
            </div>
          )}
        </div>

        {/* Page Content */}
        <div className="relative z-10">
          {children}
        </div>
      </main>

      {/* Bottom Padding para móvil (NavFlotante bottom) */}
      <div className="h-24 lg:hidden" />
    </div>
  );
};

export default DashboardShell;
