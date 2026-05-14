"use client";

import React from "react";
import { 
  Package, ShoppingCart, AlertTriangle, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Clock, Box,
  BarChart3, Users, DollarSign, Pill
} from "lucide-react";
import { useAuthStore } from "@/almacenes/usoAuth";
import { useDashboardStats } from "@/hooks/useDashboard";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Badge from "@/componentes/ui/Badge";
import { AnimatedCounter } from "@/componentes/ui/AnimatedCounter";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import { cn } from "@/lib/utils";

const DashboardFarmacia = () => {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return <SkeletonPage type="dashboard" />;
  }

  const pedidos = stats?.recentOrders || [];
  const pedidosPendientes = pedidos.filter((p: any) => p.status === "pending");
  const stockBajo = stats?.lowStockItems || [];
  const vencimiento = stats?.expiringItems || [];

  return (
    <div className="space-y-10">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Ventas Hoy", value: stats?.todayRevenue || 0, prefix: "C$ ", trend: stats?.revenueTrend, icon: DollarSign, color: "text-success", bg: "bg-success/10" },
          { label: "Pedidos", value: stats?.totalOrders || 0, icon: ShoppingCart, color: "text-accent", bg: "bg-accent/10" },
          { label: "Items Stock", value: stats?.totalInventoryItems || 0, icon: Package, color: "text-info", bg: "bg-info/10" },
          { label: "Por Vencer", value: stats?.expiringItemsCount || 0, icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10" },
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
                {stat.prefix && <span className="text-fluid-sm font-mono text-muted">{stat.prefix}</span>}
                <AnimatedCounter value={stat.value} className="text-fluid-2xl font-display font-light" />
              </div>
            </Card>
          </Reveal>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pedidos Recientes */}
        <Reveal delay={0.4} className="lg:col-span-2">
          <Card className="h-full p-8 space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-fluid-xl font-light">Gestión de Pedidos</h3>
                <p className="text-fluid-xs text-muted uppercase tracking-widest font-bold mt-1">Órdenes entrantes</p>
              </div>
              <Badge variant="accent" pulse>{pedidosPendientes.length} Pendientes</Badge>
            </div>

            <div className="space-y-4">
              {(Array.isArray(pedidos) ? pedidos : []).slice(0, 4).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-3xl bg-surface/50 border border-border group hover:border-accent/20 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center text-muted">
                      <Box size={24} />
                    </div>
                    <div>
                      <h4 className="text-fluid-sm font-bold">Orden #{p.id.slice(-6).toUpperCase()}</h4>
                      <p className="text-[10px] text-muted uppercase tracking-wider">{p.patient.user.name} • {p.items.length} productos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-fluid-xs font-mono font-bold text-accent">C$ {p.total}</span>
                    <Badge variant={p.status === 'pending' ? 'warning' : 'success'} size="xs">{p.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        {/* Alertas de Inventario */}
        <div className="space-y-8">
          <Reveal delay={0.5}>
            <Card className="p-8 space-y-6">
              <h3 className="font-display text-fluid-lg font-light flex items-center gap-2">
                <AlertTriangle size={20} className="text-danger" /> Alertas Críticas
              </h3>
              <div className="space-y-4">
                {stockBajo.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-danger/5 border border-danger/10">
                    <div>
                      <p className="text-fluid-xs font-bold">{item.medication.name}</p>
                      <p className="text-[9px] text-danger uppercase font-mono">Stock bajo: {item.quantity} und</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center text-danger">
                      <ArrowDownRight size={16} />
                    </div>
                  </div>
                ))}
                {(Array.isArray(vencimiento) ? vencimiento : []).slice(0, 2).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-warning/5 border border-warning/10">
                    <div>
                      <p className="text-fluid-xs font-bold">{item.medication.name}</p>
                      <p className="text-[9px] text-warning uppercase font-mono">Vence pronto: {new Date(item.expiryDate).toLocaleDateString()}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                      <Clock size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.6}>
            <Card className="p-8 bg-accent text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <BarChart3 size={100} />
              </div>
              <div className="relative z-10 space-y-4">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Resumen de Ventas</p>
                <h4 className="text-fluid-xl font-display font-light">C$ 84,200.00</h4>
                <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-3/4" />
                </div>
                <p className="text-[9px] uppercase tracking-widest font-bold">75% de la meta mensual</p>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default DashboardFarmacia;
