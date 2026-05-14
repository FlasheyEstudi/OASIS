"use client";

import React, { useState } from "react";
import { 
  Package, MapPin, Clock, ArrowRight, 
  Search, Filter, ExternalLink, RefreshCw
} from "lucide-react";
import { usePedidos } from "@/hooks/usePaciente";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import EmptyState from "@/componentes/ui/EmptyState";
import { cn } from "@/lib/utils";

const PedidosPaciente = () => {
  const [tab, setTab] = useState("active");
  const { data: pedidos, isLoading } = usePedidos({ status: tab });

  if (isLoading) return <SkeletonPage type="list" />;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "warning";
      case "shipped": return "info";
      case "delivered": return "success";
      default: return "muted";
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex bg-surface/50 p-1.5 rounded-2xl border border-border w-fit frost">
        {["active", "history"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-8 py-2 rounded-xl text-fluid-xs font-bold transition-all duration-300 uppercase tracking-widest",
              tab === t ? "bg-accent text-white shadow-glow" : "text-muted hover:text-text"
            )}
          >
            {t === "active" ? "En Curso" : "Historial"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {pedidos?.length > 0 ? (
          pedidos.map((o: any, idx: number) => (
            <Reveal key={o.id} delay={idx * 0.1}>
              <Card className="group hover:border-accent/30 transition-all">
                <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                  <div className={cn(
                    "w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0",
                    tab === "active" ? "bg-info/10 text-info" : "bg-muted/10 text-muted"
                  )}>
                    <Package size={32} />
                  </div>

                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-display text-fluid-xl font-light">Orden #{o.id.slice(-6).toUpperCase()}</h3>
                        <p className="text-fluid-xs text-muted mt-1 uppercase tracking-widest">
                          {o.pharmacy.name} • {new Date(o.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(o.status)} pulse={o.status === 'shipped'}>
                        {o.status}
                      </Badge>
                    </div>

                    {/* Timeline Visual */}
                    <div className="flex items-center gap-2 py-4 overflow-x-auto">
                      {["Pendiente", "Preparando", "En Camino", "Entregado"].map((step, i) => {
                        const isActive = i <= (o.status === 'delivered' ? 3 : o.status === 'shipped' ? 2 : 1);
                        return (
                          <React.Fragment key={step}>
                            <div className="flex flex-col items-center gap-2 min-w-[80px]">
                              <div className={cn(
                                "w-3 h-3 rounded-full border-2",
                                isActive ? "bg-accent border-accent shadow-glow" : "border-border bg-transparent"
                              )} />
                              <span className={cn("text-[9px] font-mono uppercase font-bold", isActive ? "text-accent" : "text-subtle")}>
                                {step}
                              </span>
                            </div>
                            {i < 3 && <div className={cn("h-px flex-1 min-w-[20px]", isActive ? "bg-accent" : "bg-border")} />}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4">
                      <Button variant="secondary" size="md">Detalles de Orden</Button>
                      {o.status === "shipped" && (
                        <Button variant="primary" size="md" iconLeft={MapPin}>Rastrear Envío</Button>
                      )}
                      {o.status === "delivered" && (
                        <Button variant="glass" size="md" iconLeft={RefreshCw} className="text-accent">Reordenar</Button>
                      )}
                    </div>
                  </div>

                  <div className="hidden lg:flex flex-col items-end justify-center px-8 border-l border-border min-w-[150px]">
                    <span className="text-[10px] font-mono text-muted uppercase tracking-widest">Total</span>
                    <span className="text-fluid-xl font-display font-bold text-accent">C$ {o.total}</span>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))
        ) : (
          <EmptyState 
            icon={Package} 
            title="Sin pedidos recientes" 
            description="Aquí aparecerán tus órdenes de farmacia y su estado en tiempo real."
            action={{
              label: "Ir a Farmacia",
              onClick: () => {}
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PedidosPaciente;
