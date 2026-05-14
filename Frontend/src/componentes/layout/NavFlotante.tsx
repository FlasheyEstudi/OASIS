"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, Search, Calendar, Package, MessageSquare, 
  User, LayoutDashboard, LogOut, Bell, Activity,
  Zap, Shield, Pill
} from "lucide-react";
import { useAuthStore } from "@/almacenes/usoAuth";
import Avatar from "@/componentes/ui/Avatar";
import NotificationBell from "@/componentes/notificaciones/NotificationBell";
import ThemeToggle from "@/componentes/ui/ThemeToggle";
import { cn } from "@/lib/utils";

const NavFlotante = () => {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDashboard = pathname?.startsWith("/dashboard");

  // Links dinámicos según el rol
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { label: "Servicios", href: "#servicios", icon: Activity },
        { label: "Cómo Funciona", href: "#como-funciona", icon: Zap },
        { label: "Nosotros", href: "#nosotros", icon: Shield },
      ];
    }

    // Links para el Dashboard del Paciente
    if (user?.role === "patient") {
      return [
        { label: "Inicio", href: "/dashboard", icon: LayoutDashboard },
        { label: "Citas", href: "/dashboard/patient/citas", icon: Calendar },
        { label: "Farmacia", href: "/dashboard/patient/farmacia", icon: Pill },
        { label: "Historial", href: "/dashboard/patient/historial", icon: Activity },
        { label: "Mensajes", href: "/dashboard/patient/mensajes", icon: MessageSquare },
      ];
    }

    // Fallback para otros roles o dashboard base
    return [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Citas", href: "/dashboard/patient/citas", icon: Calendar },
      { label: "Ajustes", href: "/dashboard/perfil", icon: User },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* DESKTOP NAV (Top Floating Pill) */}
      <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 pointer-events-none pt-4">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            "max-w-3xl mx-auto pointer-events-auto rounded-full transition-all duration-500",
            "frost border border-border-light px-2 py-1.5",
            scrolled ? "shadow-float border-accent/20 bg-surface/80" : "shadow-card"
          )}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="px-6 flex items-center gap-2">
              <span className="font-display text-fluid-base font-bold tracking-tighter">
                OASIS <span className="text-accent italic font-light">AURA</span>
              </span>
            </Link>

            {/* Links */}
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-full text-fluid-xs font-medium transition-all duration-350",
                    pathname === link.href 
                      ? "bg-accent text-white shadow-glow" 
                      : "text-muted hover:bg-surface/50 hover:text-text"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* User / Actions */}
            <div className="flex items-center gap-2 pr-2">
              <ThemeToggle variant="icon" />
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3 ml-2">
                  <NotificationBell />
                  <Link href="/dashboard/perfil">
                    <Avatar 
                      name={user.name} 
                      src={user.avatar} 
                      size="sm" 
                      className="hover:scale-110 transition-transform active:scale-95" 
                    />
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/acceso/login" className="px-4 py-2 text-fluid-xs font-semibold text-muted hover:text-text">
                    Entrar
                  </Link>
                  <Link href="/acceso/registro" className="px-5 py-2 bg-accent text-white rounded-full text-fluid-xs font-bold shadow-glow hover:scale-105 active:scale-95 transition-all">
                    Comenzar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </nav>

      {/* MOBILE NAV (Bottom Floating Pill) */}
      <nav className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-md mx-auto frost border border-border-light rounded-[24px] shadow-float p-2 pb-safe"
        >
          <div className="flex items-center justify-around">
            {navLinks.slice(0, 5).map((link) => {
              const Icon = link.icon || Home;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2 min-w-[64px] transition-all duration-300",
                    isActive ? "text-accent scale-110" : "text-subtle"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-2xl transition-colors",
                    isActive ? "bg-accent-glow" : "bg-transparent"
                  )}>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="text-[0.6rem] font-bold uppercase tracking-widest leading-none">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </nav>
    </>
  );
};

export default NavFlotante;
