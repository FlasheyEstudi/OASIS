"use client";

import React, { useState } from "react";
import { 
  Box, Clock, CheckCircle, Truck, 
  ArrowRight, Search, Filter, MoreVertical,
  ExternalLink, User, ShoppingBag, Eye
} from "lucide-react";
import { usePedidosFarmacia, useAceptarPedido } from "@/hooks/farmacia";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import Avatar from "@/componentes/ui/Avatar";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import { cn } from "@/lib/utils";

const PedidosFarmacia = () => {
  const [tab, setTab] = useState("pending");
  const { data: pedidos, isLoading } = usePedidosFarmacia({ status: tab });
  const { mutate: aceptar } = useAceptarPedido();

  if (isLoading) return <SkeletonPage type="list" />;

  return (
    <div className="space-y-10">
      <div className="flex bg-surface/50 p-1.5 rounded-2xl border border-border w-fit frost">
        {["pending", "processing", "shipped", "delivered"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-6 py-2 rounded-xl text-fluid-xs font-bold transition-all duration-300 uppercase tracking-widest",
              tab === t ? "bg-accent text-white shadow-glow" : "text-muted hover:text-text"
            )}
          >
            {t === "pending" ? "Nuevos" : t === "processing" ? "En Prep" : t === "shipped" ? "En Camino" : "Entregados"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {pedidos?.length > 0 ? (
          pedidos.map((o: any, idx: number) => (
            <Reveal key={o.id} delay={idx * 0.1}>
              <Card className="group hover:border-accent/30 transition-all overflow-hidden p-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                  <div className={cn(
                    "w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0",
                    tab === "pending" ? "bg-warning/10 text-warning" : "bg-accent/10 text-accent"
                  )}>
                    <ShoppingBag size={32} />
                  </div>

                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-display text-fluid-xl font-light">Orden #{o.id.slice(-6).toUpperCase()}</h3>
                        <p className="text-fluid-xs text-muted mt-1 uppercase tracking-widest flex items-center gap-2">
                          <User size={12} /> {o.patient.user.name} • <Clock size={12} /> Hace 12 min
                        </p>
                      </div>
                      <Badge variant={tab === 'pending' ? 'warning' : 'info'} pulse={tab === 'pending'}>
                        {o.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 py-2">
                      {o.items.map((item: any) => (
                        <Badge key={item.id} variant="glass" size="xs">
                          {`${item.quantity}x ${item.medication.name}`}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                      {tab === "pending" && (
                        <Button variant="primary" size="md" icon={CheckCircle} onClick={() => aceptar(o.id)}>Aceptar Pedido</Button>
                      )}
                      {tab === "processing" && (
                        <Button variant="primary" size="md" icon={Truck}>Enviar con Repartidor</Button>
                      )}
                      <Button variant="secondary" size="md" icon={Eye}>Ver Detalles</Button>
                      <Button variant="glass" size="md" icon={ExternalLink}>Factura</Button>
                    </div>
                  </div>

                  <div className="hidden lg:flex flex-col items-end justify-center px-8 border-l border-border min-w-[150px]">
                    <span className="text-[10px] font-mono text-muted uppercase tracking-widest">Total Orden</span>
                    <span className="text-fluid-xl font-display font-bold text-accent">C$ {o.total}</span>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-surface mx-auto flex items-center justify-center text-muted/20">
              <ShoppingBag size={32} />
            </div>
            <p className="text-fluid-xs text-muted italic">No hay pedidos en esta categoría.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PedidosFarmacia;
