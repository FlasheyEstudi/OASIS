"use client";

import React, { useState } from "react";
import { 
  Truck, MapPin, DollarSign, Power, 
  ChevronRight, Box, Clock, TrendingUp,
  Star, Navigation2, CheckCircle2
} from "lucide-react";
import { useAuthStore } from "@/almacenes/usoAuth";
import { useToggleDisponibilidad } from "@/hooks/delivery";
import { useDashboardStats } from "@/hooks/useDashboard";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import { AnimatedCounter } from "@/componentes/ui/AnimatedCounter";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import { cn } from "@/lib/utils";

import { ArrowRight } from "lucide-react";

const DashboardDelivery = () => {
  const { data: stats, isLoading } = useDashboardStats();
  const { mutate: toggle } = useToggleDisponibilidad();

  const isAvailable = stats?.isAvailable || false;

  const handleToggle = () => {
    toggle(!isAvailable);
  };

  if (isLoading) {
    return <SkeletonPage type="dashboard" />;
  }

  const disponibles = stats?.availableOrdersNearCount || 0;
  const ordenesDisponibles = stats?.availableOrders || [];

  return (
    <div className="space-y-8 pb-24">
      {/* Availability Toggle (Big & Prominent) */}
      <Reveal>
        <Card className={cn(
          "p-8 transition-all duration-700 border-2",
          isAvailable ? "bg-success/5 border-success shadow-glow-success/20" : "bg-surface/50 border-border"
        )}>
          <div className="flex flex-col items-center text-center gap-6">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500",
              isAvailable ? "bg-success text-white shadow-glow" : "bg-surface text-muted"
            )}>
              <Power size={48} />
            </div>
            <div>
              <h3 className="font-display text-fluid-2xl font-light">
                {isAvailable ? "En Línea" : "Desconectado"}
              </h3>
              <p className="text-fluid-xs text-muted max-w-xs mx-auto mt-2">
                {isAvailable 
                  ? "Buscando entregas cercanas para ti..." 
                  : "Conéctate para empezar a recibir pedidos."}
              </p>
            </div>
            <Button 
              variant={isAvailable ? "secondary" : "primary"} 
              size="xl" 
              fullWidth 
              onClick={handleToggle}
              className="max-w-xs"
            >
              {isAvailable ? "Desconectarse" : "Empezar Turno"}
            </Button>
          </div>
        </Card>
      </Reveal>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Reveal delay={0.1}>
          <Card className="p-6">
            <div className="flex justify-between items-start mb-2">
              <DollarSign className="text-success" size={20} />
              <Badge variant="success" size="xs">+15%</Badge>
            </div>
            <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Hoy</p>
            <div className="flex items-baseline gap-1">
              <span className="text-fluid-sm font-mono text-muted">C$</span>
              <AnimatedCounter value={stats?.earningsBalance || 0} className="text-fluid-xl font-display font-light" />
            </div>
          </Card>
        </Reveal>
        <Reveal delay={0.2}>
          <Card className="p-6">
            <div className="flex justify-between items-start mb-2">
              <Star className="text-warning" size={20} />
              <span className="text-[10px] font-mono font-bold text-warning">TOP</span>
            </div>
            <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Rating</p>
            <div className="flex items-baseline gap-1">
              <AnimatedCounter value={stats?.rating || 0} className="text-fluid-xl font-display font-light" />
              <span className="text-fluid-xs text-warning">★</span>
            </div>
          </Card>
        </Reveal>
      </div>

      {/* Available Orders Preview */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h4 className="font-display text-fluid-lg font-light">Entregas Disponibles</h4>
          <Badge variant="glass">{disponibles?.length || 0}</Badge>
        </div>
        
        <div className="space-y-4">
          {ordenesDisponibles?.length > 0 ? ordenesDisponibles.map((order: any, i: number) => (
            <Reveal key={order.id} delay={i * 0.1} direction="up">
              <Card className="p-6 border-border hover:border-accent/20 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                      <Box size={20} />
                    </div>
                    <div>
                      <h5 className="text-fluid-xs font-bold">Orden #{order.id.slice(-5).toUpperCase()}</h5>
                      <p className="text-[9px] text-muted uppercase tracking-wider">{order.pharmacy.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-fluid-sm font-bold text-success">C$ {order.payout || "65.00"}</span>
                    <p className="text-[9px] text-muted uppercase font-mono">Paga estimada</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 py-4 border-y border-border mb-4">
                  <div className="flex items-center gap-2 text-fluid-xs text-muted">
                    <Navigation2 size={12} className="text-accent" />
                    <span>1.2 km de ti</span>
                  </div>
                  <div className="flex items-center gap-2 text-fluid-xs text-muted">
                    <Clock size={12} className="text-accent" />
                    <span>15 min prep</span>
                  </div>
                </div>
                <Button fullWidth icon={ArrowRight}>Ver Detalles y Aceptar</Button>
              </Card>
            </Reveal>
          )) : (
            <div className="py-12 text-center space-y-4 bg-surface/20 rounded-[32px] border border-dashed border-border">
              <div className="w-16 h-16 rounded-full bg-surface mx-auto flex items-center justify-center text-muted/20">
                <Navigation2 size={32} />
              </div>
              <p className="text-fluid-xs text-muted px-8">
                {isAvailable ? "Esperando nuevas órdenes..." : "Conéctate para ver órdenes disponibles."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardDelivery;
