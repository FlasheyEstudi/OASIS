"use client";

import React from "react";
import { 
  Users, Calendar, FileText, Activity, 
  Clock, TrendingUp, ArrowRight, Video,
  Pill, CheckCircle, Search, Star
} from "lucide-react";
import { useAuthStore } from "@/almacenes/usoAuth";
import { useDashboardStats } from "@/hooks/useDashboard";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import Avatar from "@/componentes/ui/Avatar";
import { AnimatedCounter } from "@/componentes/ui/AnimatedCounter";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import { cn } from "@/lib/utils";

const DashboardDoctor = () => {
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return <SkeletonPage type="dashboard" />;
  }

  const proximasCitas = stats?.todayAppointments?.filter((c: any) => c.status === "scheduled").slice(0, 3) || [];
  const teleconsultaHoy = stats?.todayAppointments?.find((c: any) => c.type === "teleconsult" && c.status === "scheduled");

  return (
    <div className="space-y-10">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Pacientes Mes", value: stats?.totalPatients || 0, icon: Users, color: "text-accent", bg: "bg-accent/10" },
          { label: "Citas Hoy", value: stats?.todayAppointments?.length || 0, icon: Calendar, color: "text-success", bg: "bg-success/10" },
          { label: "Recetas Emitidas", value: stats?.totalPrescriptions || 0, icon: FileText, color: "text-info", bg: "bg-info/10" },
          { label: "Puntaje Aura", value: (stats?.rating * 20) || 98, suffix: "%", icon: Star, color: "text-warning", bg: "bg-warning/10" },
        ].map((stat, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <Card className="flex items-center gap-6 p-6">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-1">
                  <AnimatedCounter value={stat.value} className="text-fluid-2xl font-display font-light" />
                  {stat.suffix && <span className="text-fluid-xs font-mono text-muted">{stat.suffix}</span>}
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Próximas Citas */}
        <Reveal delay={0.4} className="lg:col-span-2">
          <Card className="h-full p-8 space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-fluid-xl font-light">Citas del Día</h3>
                <p className="text-fluid-xs text-muted uppercase tracking-widest font-bold mt-1">Gestión de consultas</p>
              </div>
              <Button variant="ghost" size="sm" iconRight={ArrowRight}>Ver Agenda</Button>
            </div>

            <div className="space-y-4">
              {proximasCitas.length > 0 ? proximasCitas.map((cita: any) => (
                <div key={cita.id} className="flex items-center gap-6 p-4 rounded-3xl bg-surface/50 border border-border hover:border-accent/20 transition-all group">
                  <div className="w-16 h-16 rounded-[20px] bg-accent/5 flex flex-col items-center justify-center border border-accent/10">
                    <span className="text-[10px] font-mono text-accent uppercase">{cita.startTime.split(':')[0]}</span>
                    <span className="text-fluid-sm font-bold text-accent">{cita.startTime.split(':')[1]}</span>
                  </div>
                  <Avatar name={cita.patient.user.name} size="md" />
                  <div className="flex-1">
                    <h4 className="text-fluid-sm font-bold">Patient: {cita.patient.user.name}</h4>
                    <p className="text-[10px] text-muted uppercase tracking-wider">{cita.type}</p>
                  </div>
                  <div className="flex gap-2">
                    {cita.type === "teleconsult" && (
                      <Button variant="primary" size="sm" icon={Video}>Unirse</Button>
                    )}
                    <Button variant="secondary" size="sm">Ficha</Button>
                  </div>
                </div>
              )) : (
                <p className="text-fluid-xs text-muted italic py-8 text-center">No hay más citas para hoy.</p>
              )}
            </div>
          </Card>
        </Reveal>

        {/* Teleconsulta Destacada / Acciones Rápidas */}
        <div className="space-y-8">
          <Reveal delay={0.5}>
            <Card className="bg-accent text-white p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                <Video size={120} />
              </div>
              <div className="relative z-10 space-y-6">
                <Badge variant="glass" className="bg-white/20 border-white/20 text-white">Siguiente Teleconsulta</Badge>
                {teleconsultaHoy ? (
                  <>
                    <div className="space-y-1">
                      <h4 className="text-fluid-xl font-display font-light">Dr. {teleconsultaHoy.patient.user.name}</h4>
                      <p className="text-white/70 text-fluid-xs">Inicia en 15 minutos</p>
                    </div>
                    <Button variant="glass" fullWidth className="bg-white text-accent hover:bg-white/90">
                      Entrar al Consultorio
                    </Button>
                  </>
                ) : (
                  <p className="text-white/70 text-fluid-xs">No hay teleconsultas pendientes.</p>
                )}
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.6}>
            <Card className="p-8 space-y-6">
              <h3 className="font-display text-fluid-lg font-light">Acciones Rápidas</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: FileText, label: "Nueva Receta", color: "text-accent", bg: "bg-accent/5" },
                  { icon: Users, label: "Pacientes", color: "text-success", bg: "bg-success/5" },
                  { icon: Search, label: "Vademécum", color: "text-info", bg: "bg-info/5" },
                  { icon: Activity, label: "Estadísticas", color: "text-warning", bg: "bg-warning/10" }
                ].map((item, i) => (
                  <button key={i} className={cn("flex flex-col items-center justify-center p-6 rounded-3xl gap-3 border border-transparent transition-all hover:border-border hover:shadow-float group", item.bg)}>
                    <item.icon className={cn(item.color, "group-hover:scale-110 transition-transform")} size={24} />
                    <span className="text-[9px] font-mono uppercase font-bold tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default DashboardDoctor;
