"use client";

import React from "react";
import { 
  Users, ShoppingBag, Activity, ShieldCheck, 
  ArrowUpRight, ArrowDownRight, Globe, Database,
  TrendingUp, DollarSign, AlertCircle, Server
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboard";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import { AnimatedCounter } from "@/componentes/ui/AnimatedCounter";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import { cn } from "@/lib/utils";

const DashboardAdmin = () => {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <SkeletonPage type="dashboard" />;

  return (
    <div className="space-y-10">
      {/* Global Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Usuarios Totales", value: stats?.totalUsers || 0, trend: "+8%", icon: Users, color: "text-accent", bg: "bg-accent/10" },
          { label: "Pedidos Totales", value: stats?.totalOrders || 0, trend: "+12%", icon: ShoppingBag, color: "text-success", bg: "bg-success/10" },
          { label: "Ingresos Globales", value: stats?.totalRevenue || 0, prefix: "C$ ", trend: "+5%", icon: DollarSign, color: "text-info", bg: "bg-info/10" },
          { label: "Médicos Activos", value: stats?.activeDoctors || 0, icon: Activity, color: "text-warning", bg: "bg-warning/10" },
        ].map((stat, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                  <stat.icon size={24} />
                </div>
                {stat.trend && (
                  <Badge variant="success" size="xs" className="bg-success/10 border-none">
                    {stat.trend}
                  </Badge>
                )}
              </div>
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                {'prefix' in stat && stat.prefix && <span className="text-fluid-sm font-mono text-muted">{stat.prefix}</span>}
                <AnimatedCounter value={stat.value} className="text-fluid-2xl font-display font-light" />
                {'suffix' in stat && (stat as any).suffix && <span className="text-fluid-xs font-mono text-muted">{(stat as any).suffix}</span>}
              </div>
            </Card>
          </Reveal>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfica de Actividad (Simulada) */}
        <Reveal delay={0.4} className="lg:col-span-2">
          <Card className="h-full p-8 space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-fluid-xl font-light">Actividad Global</h3>
                <p className="text-fluid-xs text-muted uppercase tracking-widest font-bold mt-1">Sincronización en tiempo real</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="glass">7D</Badge>
                <Badge variant="accent">30D</Badge>
              </div>
            </div>

            <div className="h-64 w-full flex items-end gap-2 px-2">
              {[40, 60, 45, 90, 65, 80, 50, 70, 85, 100, 75, 95].map((h, i) => (
                <div key={i} className="flex-1 bg-accent/20 rounded-t-lg relative group transition-all hover:bg-accent cursor-pointer" style={{ height: `${h}%` }}>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-card border border-border px-2 py-1 rounded text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {h * 12} ops
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between px-2 pt-4 border-t border-border">
              <span className="text-[9px] font-mono text-muted uppercase">Ene</span>
              <span className="text-[9px] font-mono text-muted uppercase">May</span>
              <span className="text-[9px] font-mono text-muted uppercase">Dic</span>
            </div>
          </Card>
        </Reveal>

        {/* Auditoría Rápida */}
        <div className="space-y-8">
          <Reveal delay={0.5}>
            <Card className="p-8 space-y-6">
              <h3 className="font-display text-fluid-lg font-light flex items-center gap-2">
                <ShieldCheck size={20} className="text-accent" /> Últimas Acciones
              </h3>
              <div className="space-y-6">
                {[
                  { user: "admin_mateo", action: "Cambio Config", time: "2m", color: "text-info" },
                  { user: "dr_estudi", action: "Login Exitoso", time: "5m", color: "text-success" },
                  { user: "delivery_12", action: "Error de Pago", time: "12m", color: "text-danger" },
                  { user: "system", action: "Backup Diario", time: "1h", color: "text-muted" }
                ].map((log, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-1 h-10 rounded-full bg-border relative overflow-hidden">
                      <div className={cn("absolute top-0 left-0 w-full h-1/2", log.color.replace('text-', 'bg-'))} />
                    </div>
                    <div>
                      <p className="text-fluid-xs font-bold">{log.user}</p>
                      <p className="text-[10px] text-muted uppercase">{log.action} • {log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="secondary" fullWidth size="sm">Ver Auditoría Completa</Button>
            </Card>
          </Reveal>

          <Reveal delay={0.6}>
            <Card className="p-8 bg-surface/50 border-border frost space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <Database size={20} />
                </div>
                <h4 className="text-fluid-sm font-bold">Estado Base de Datos</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono uppercase">
                  <span className="text-muted">Espacio: 1.2 GB / 5 GB</span>
                  <span className="text-accent">24%</span>
                </div>
                <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-[24%]" />
                </div>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
