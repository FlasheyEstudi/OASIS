"use client";

import React, { useEffect, useState } from "react";
import { 
  Calendar, Pill, Star, ArrowRight, 
  Activity, Bell, MapPin, QrCode, 
  TrendingUp, Clock, Search
} from "lucide-react";
import { useAuthStore } from "@/almacenes/usoAuth";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useRecetas, usePedidos, useNotificaciones } from "@/hooks/usePaciente";
import { cn } from "@/lib/utils";
import { Reveal } from "@/componentes/ui/Reveal";
import { FrostPanel } from "@/componentes/ui/FrostPanel";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import Avatar from "@/componentes/ui/Avatar";
import { AnimatedCounter } from "@/componentes/ui/AnimatedCounter";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import dynamic from "next/dynamic";
const MapaAura = dynamic(() => import("@/componentes/MapaAura").then(mod => mod.MapaAura), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-surface animate-pulse" />
});
import QRModal from "@/componentes/ui/QRModal";
import { Package } from "lucide-react";

const InicioPaciente = () => {
  const { user } = useAuthStore();
  const [qrOpen, setQrOpen] = useState(false);
  
  const { data: stats, isLoading: loadingStats } = useDashboardStats();
  const { data: recetas, isLoading: loadingRecetas } = useRecetas({ status: 'active' });
  const { data: pedidos, isLoading: loadingPedidos } = usePedidos();
  const { data: notifs, isLoading: loadingNotifs } = useNotificaciones();

  if (loadingStats || loadingRecetas || loadingPedidos || loadingNotifs) {
    return <SkeletonPage type="dashboard" />;
  }

  const proximaCita = stats?.nextAppointment;
  const puntos = stats?.loyaltyPoints || 0;
  const nivel = stats?.loyaltyLevel || "Bronce";

  return (
    <div className="space-y-10">
      {/* --- HERO STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Reveal delay={0.1}>
          <Card className="flex flex-col justify-between h-44 bg-accent/5 border-accent/20">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-accent/10 rounded-xl">
                <Star className="text-accent" size={20} />
              </div>
              <Badge variant="accent" size="xs">Aura Plus</Badge>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <AnimatedCounter value={puntos} className="text-fluid-2xl font-display font-light text-accent" />
                <span className="text-fluid-xs font-mono text-accent/60 uppercase">pts</span>
              </div>
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest mt-1">Nivel {nivel}</p>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.2}>
          <Card className="flex flex-col justify-between h-44">
            <div className="p-2.5 bg-info/10 rounded-xl w-fit">
              <Calendar className="text-info" size={20} />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <AnimatedCounter value={stats?.appointmentsCount || 0} className="text-fluid-2xl font-display font-light text-text" />
                <span className="text-fluid-xs font-mono text-muted uppercase">citas</span>
              </div>
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest mt-1">
                {proximaCita ? `Próxima: ${new Date(proximaCita.date).toLocaleDateString()}` : "Sin citas próximas"}
              </p>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.3}>
          <Card className="flex flex-col justify-between h-44">
            <div className="p-2.5 bg-success/10 rounded-xl w-fit">
              <Pill className="text-success" size={20} />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <AnimatedCounter value={recetas?.length || 0} className="text-fluid-2xl font-display font-light text-text" />
                <span className="text-fluid-xs font-mono text-muted uppercase">activas</span>
              </div>
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest mt-1">Recetas en tiempo real</p>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.4}>
          <Card className="flex flex-col justify-between h-44 bg-surface border-border-light">
            <div className="p-2.5 bg-white/5 rounded-xl w-fit">
              <TrendingUp className="text-muted" size={20} />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-fluid-2xl font-display font-light text-text">98</span>
                <span className="text-fluid-xs font-mono text-success uppercase">%</span>
              </div>
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest mt-1">Salud Aura General</p>
            </div>
          </Card>
        </Reveal>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Appointments & Activity */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Next Appointment Focus */}
          <Reveal delay={0.5}>
            <FrostPanel className="p-8 border-accent/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                {proximaCita ? (
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-accent flex flex-col items-center justify-center text-bg text-center">
                      <span className="text-fluid-base font-bold leading-none">{new Date(proximaCita.date).getDate()}</span>
                      <span className="text-[10px] font-mono uppercase font-bold tracking-tighter">
                        {new Date(proximaCita.date).toLocaleString('default', { month: 'short' })}
                      </span>
                    </div>
                    <div>
                      <Badge variant="accent" size="xs" className="mb-2">{proximaCita.type === 'teleconsult' ? 'Virtual' : 'Presencial'}</Badge>
                      <h3 className="font-display text-fluid-xl font-light">Dr. {proximaCita.doctor.user.name}</h3>
                      <p className="text-fluid-xs text-muted flex items-center gap-2 mt-1">
                        <Clock size={12} /> {proximaCita.startTime} • {proximaCita.doctor.specialty}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <h3 className="font-display text-fluid-xl font-light">Sin citas pendientes</h3>
                    <p className="text-fluid-xs text-muted mt-1">No tienes consultas agendadas próximamente.</p>
                  </div>
                )}
                <div className="flex gap-3 w-full md:w-auto">
                  {proximaCita && <Button variant="glass" size="md" className="flex-1 md:flex-none">Reprogramar</Button>}
                  <Button variant="primary" size="md" className="flex-1 md:flex-none">Agendar Nueva</Button>
                </div>
              </div>
            </FrostPanel>
          </Reveal>

          {/* Quick Actions Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hover onClick={() => {}} className="group flex flex-col items-center text-center p-8 border-white/5 bg-surface/30">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-accent/10 group-hover:text-accent transition-all">
                <Calendar size={24} />
              </div>
              <span className="font-display text-fluid-base">Nueva Cita</span>
            </Card>
            <Card hover onClick={() => {}} className="group flex flex-col items-center text-center p-8 border-white/5 bg-surface/30">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-info/10 group-hover:text-info transition-all">
                <Search size={24} />
              </div>
              <span className="font-display text-fluid-base">Farmacias</span>
            </Card>
            <Card hover onClick={() => {}} className="group flex flex-col items-center text-center p-8 border-white/5 bg-surface/30">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-success/10 group-hover:text-success transition-all">
                <QrCode size={24} />
              </div>
              <span className="font-display text-fluid-base">Mi Carnet</span>
            </Card>
          </div>

          {/* Recent Orders / Activity */}
          <Reveal delay={0.6}>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <h3 className="font-display text-fluid-xl font-light">Pedidos Recientes</h3>
                <Button variant="ghost" size="sm" className="text-accent">Ver todos</Button>
              </div>
              <div className="space-y-4">
                {(Array.isArray(pedidos) ? pedidos : []).slice(0, 2).map((o: any) => (
                  <div key={o.id} className="group flex items-center justify-between p-5 rounded-[20px] border border-border hover:border-border-hover bg-card transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-muted">
                        <Package size={22} className="group-hover:text-info transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-body font-medium text-fluid-sm">Orden #{o.id.slice(-6).toUpperCase()}</h4>
                        <p className="text-fluid-xs text-muted">{o.pharmacy.name} • {new Date(o.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={o.status === 'shipped' ? "info" : o.status === 'delivered' ? "success" : "warning"} dot pulse={o.status === 'shipped'}>
                        {o.status}
                      </Badge>
                      <ArrowRight size={16} className="text-muted group-hover:text-text transition-all group-hover:translate-x-1" />
                    </div>
                  </div>
                ))}
                {(!pedidos || pedidos.length === 0) && (
                  <p className="text-fluid-xs text-muted italic text-center py-4">No tienes pedidos recientes.</p>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right Column: Aura Map & Profile */}
        <div className="space-y-8">
          {/* Digital ID / QR Card */}
          <Reveal delay={0.7}>
            <Card className="bg-elevated border-border-hover relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <QrCode size={120} />
              </div>
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4">
                  <Avatar name={user?.name || ""} size="lg" className="border-2 border-accent/20" />
                  <div>
                    <h3 className="font-display text-fluid-lg font-light leading-none">{user?.name}</h3>
                    <p className="text-[10px] font-mono text-muted uppercase tracking-widest mt-1">ID: OA-99283-Z</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                  <div>
                    <p className="text-[9px] font-mono text-muted uppercase tracking-wider">Membresía</p>
                    <p className="font-body font-bold text-fluid-sm">{nivel}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-muted uppercase tracking-wider">Estado</p>
                    <p className="font-body font-bold text-fluid-sm text-success">Verificado</p>
                  </div>
                </div>
                <Button variant="primary" fullWidth size="lg" icon={QrCode} onClick={() => setQrOpen(true)}>Mi Carnet Digital</Button>
              </div>
            </Card>
          </Reveal>

          {/* Interactive Map Preview */}
          <Reveal delay={0.8}>
            <div className="space-y-4">
              <h3 className="font-display text-fluid-lg font-light flex items-center gap-2">
                <MapPin size={18} className="text-accent" /> Rastreo en Vivo
              </h3>
              <div className="aspect-square w-full rounded-[28px] bg-surface border border-border overflow-hidden relative group">
                <MapaAura 
                  center={[12.1328, -86.2504]} 
                  markers={[
                    { id: 'user', position: [12.1328, -86.2504], title: 'Tú', type: 'user' },
                    { id: 'farmacia', position: [12.1400, -86.2600], title: 'Farmacia Aura', type: 'pharmacy' }
                  ]}
                />
                <div className="absolute bottom-4 left-4 right-4 p-4 frost rounded-2xl border-white/5 flex items-center justify-between z-[1000]">
                  <div>
                    <p className="text-[9px] font-mono text-muted uppercase tracking-widest">Estado del servicio</p>
                    <p className="font-body font-bold text-fluid-xs">Conexión Aura Activa</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
              </div>
            </div>
          </Reveal>

          {/* Notifications List */}
          <Reveal delay={0.9}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-fluid-lg font-light">Avisos</h3>
                <Badge variant="muted" size="xs">2 Nuevos</Badge>
              </div>
              <div className="space-y-3">
                {(Array.isArray(notifs) ? notifs : []).slice(0, 3).map((n: any) => (
                  <div key={n.id} className="flex gap-4 p-4 rounded-2xl hover:bg-surface/50 transition-colors cursor-pointer border border-transparent hover:border-white/5">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      n.type === 'order' ? "bg-accent/10 text-accent" : "bg-info/10 text-info"
                    )}>
                      {n.type === 'order' ? <Bell size={18} /> : <Activity size={18} />}
                    </div>
                    <div>
                      <p className="text-fluid-sm font-medium leading-tight">{n.title}</p>
                      <p className="text-fluid-xs text-muted mt-1">{new Date(n.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                {(!notifs || notifs.length === 0) && (
                  <p className="text-fluid-xs text-muted italic text-center py-2">Sin notificaciones nuevas.</p>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
      <QRModal 
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        value={`OASIS-PATIENT-${user?.id}`}
        title="Carnet Digital Oasis"
        subtitle={user?.name || "Paciente"}
      />
    </div>
  );
};

export default InicioPaciente;
