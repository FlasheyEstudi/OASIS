"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Calendar, Pill, Star, ArrowRight, 
  Activity, Bell, MapPin, QrCode, 
  TrendingUp, Clock, AlertCircle, Search
} from "lucide-react";
import { useAuthStore } from "@/almacenes/usoAuth";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useRecordatorios } from "@/hooks/usePaciente";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import Avatar from "@/componentes/ui/Avatar";
import { AnimatedCounter } from "@/componentes/ui/AnimatedCounter";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import EmptyState from "@/componentes/ui/EmptyState";
import { cn } from "@/lib/utils";

const DashboardPaciente = () => {
  const { user } = useAuthStore();
  
  // Consolidated Stats Hook
  const { data: stats, isLoading: loadingStats } = useDashboardStats();
  const { data: recordatorios, isLoading: loadingRecordatorios } = useRecordatorios();

  if (loadingStats || loadingRecordatorios) {
    return <SkeletonPage type="dashboard" />;
  }

  const proximaCita = stats?.nextAppointment;
  const recetasCount = stats?.activePrescriptions || 0;
  const lealtad = { points: stats?.loyaltyPoints || 0, level: stats?.loyaltyLevel || "Bronce" };
  const pedidos = stats?.recentOrders || [];
  const activeOrdersCount = stats?.activeOrders || 0;

  return (
    <div className="space-y-10">
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. PROXIMA CITA (GRANDE) */}
        <Reveal delay={0.1} className="lg:col-span-2">
          <Card className="h-full border-l-4 border-l-accent p-8">
            <div className="flex flex-col h-full justify-between gap-8">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display text-fluid-xl font-light mb-2">Próxima Cita</h3>
                  <p className="text-fluid-xs text-muted uppercase tracking-widest font-bold">Mantén tu seguimiento</p>
                </div>
                <Badge variant="accent" dot pulse>Sincronizado</Badge>
              </div>

              {proximaCita ? (
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                  <Avatar name={proximaCita?.doctor?.user?.name || "Doctor"} src={proximaCita?.doctor?.user?.avatarUrl} size="xl" className="rounded-3xl border-2 border-accent/10" />
                  <div className="flex-1 space-y-3">
                    <h4 className="font-display text-fluid-xl font-light">Dr. {proximaCita?.doctor?.user?.name}</h4>
                    <p className="text-accent text-[10px] font-mono uppercase tracking-[0.2em]">{proximaCita?.doctor?.specialty}</p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="flex items-center gap-2 text-fluid-xs text-muted">
                        <Calendar size={14} className="text-accent" />
                        <span>{proximaCita?.date ? new Date(proximaCita.date).toLocaleDateString() : "---"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-fluid-xs text-muted">
                        <Clock size={14} className="text-accent" />
                        <span>{proximaCita?.startTime || "---"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-fluid-xs text-muted">
                        <MapPin size={14} className="text-accent" />
                        <span>{proximaCita?.type === 'teleconsult' ? 'Virtual' : 'En clínica'}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="primary" size="lg">Ver Detalle</Button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-4">
                  <EmptyState 
                    icon={Calendar} 
                    title="No tienes citas" 
                    description="Tu agenda está libre. ¿Necesitas un chequeo?"
                    action={{ label: "Agendar Cita", onClick: () => {} }}
                    className="border-none bg-transparent p-0"
                  />
                </div>
              )}
            </div>
          </Card>
        </Reveal>

        {/* 2. PUNTOS LEALTAD */}
        <Reveal delay={0.2}>
          <Card className="h-full bg-accent/5 border-accent/20 flex flex-col justify-between p-8">
            <div className="flex justify-between items-center">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                <Star size={24} />
              </div>
              <Badge variant="glass">{lealtad.level}</Badge>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-baseline gap-1">
                  <AnimatedCounter value={lealtad.points} className="text-fluid-3xl font-display font-light text-accent" />
                  <span className="text-fluid-xs font-mono text-accent/60 uppercase">pts</span>
                </div>
                <p className="text-[10px] font-mono text-muted uppercase tracking-widest mt-1">Nivel {lealtad.level}</p>
              </div>
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-accent/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "65%" }}
                    className="h-full bg-accent shadow-glow"
                  />
                </div>
                <p className="text-[9px] font-mono text-subtle text-right uppercase tracking-widest">350 pts para Plata</p>
              </div>
            </div>
          </Card>
        </Reveal>

        {/* 3. RECETAS ACTIVAS */}
        <Reveal delay={0.3}>
          <Card className="h-full p-8 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-success">
                <Pill size={24} />
              </div>
              <Badge variant="success" size="xs">{`${recetasCount} Activas`}</Badge>
            </div>
            <div className="space-y-4">
              {stats?.activePrescriptionsList?.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between group cursor-pointer">
                  <div>
                    <p className="text-fluid-sm font-medium">Dr. {r?.doctor?.user?.name || "Especialista"}</p>
                    <p className="text-[10px] text-muted font-mono uppercase">{r?.date ? new Date(r.date).toLocaleDateString() : "---"}</p>
                  </div>
                  <ArrowRight size={14} className="text-muted group-hover:text-accent transition-all" />
                </div>
              ))}
              {recetasCount === 0 && <p className="text-fluid-xs text-muted italic">Sin recetas activas</p>}
            </div>
          </Card>
        </Reveal>

        {/* 4. PEDIDOS RECIENTES */}
        <Reveal delay={0.4}>
          <Card className="h-full p-8 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-info/10 flex items-center justify-center text-info">
                <TrendingUp size={24} />
              </div>
              <Badge variant="info" size="xs">{`${activeOrdersCount} En curso`}</Badge>
            </div>
            <div className="space-y-6">
              {(Array.isArray(pedidos) ? pedidos : []).slice(0, 2).map((o: any) => (
                <div key={o.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-info" />
                    <div className="w-px h-full bg-border" />
                  </div>
                  <div className="pb-4">
                    <p className="text-fluid-xs font-bold uppercase tracking-wider">Orden #{o.id.slice(-5)}</p>
                    <p className="text-[10px] text-muted">{o.pharmacy.name}</p>
                    <Badge variant="glass" size="xs" className="mt-2">{o.status}</Badge>
                  </div>
                </div>
              ))}
              {pedidos.length === 0 && <p className="text-fluid-xs text-muted italic text-center">No hay pedidos recientes</p>}
            </div>
          </Card>
        </Reveal>

        {/* 5. RECORDATORIOS */}
        <Reveal delay={0.5}>
          <Card className="h-full p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center text-warning">
                <Bell size={24} />
              </div>
              <h3 className="font-display text-fluid-lg font-light">Alertas</h3>
            </div>
            <div className="space-y-4">
              {recordatorios?.length > 0 ? recordatorios.map((rem: any) => (
                <div key={rem.id} className="flex items-center gap-4 p-3 rounded-xl bg-surface/50 border border-border">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  <div className="flex-1">
                    <p className="text-fluid-xs font-bold">{rem.medicationName}</p>
                    <p className="text-[10px] text-muted">Refill pronto</p>
                  </div>
                </div>
              )) : (
                <p className="text-fluid-xs text-muted italic">Todo al día</p>
              )}
            </div>
          </Card>
        </Reveal>

        {/* 6. ACCESO RAPIDO */}
        <Reveal delay={0.6}>
          <div className="grid grid-cols-2 gap-4 h-full">
            {[
              { icon: Calendar, label: "Nueva Cita", color: "text-accent", bg: "bg-accent/5" },
              { icon: Pill, label: "Medicamento", color: "text-success", bg: "bg-success/5" },
              { icon: MapPin, label: "Farmacia", color: "text-info", bg: "bg-info/5" },
              { icon: AlertCircle, label: "Emergencia", color: "text-danger", bg: "bg-danger/5" }
            ].map((item, i) => (
              <Card key={i} hover className={cn("flex flex-col items-center justify-center text-center p-4 gap-2", item.bg)}>
                <item.icon className={item.color} size={24} />
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest">{item.label}</span>
              </Card>
            ))}
          </div>
        </Reveal>

      </div>
    </div>
  );
};

export default DashboardPaciente;
