"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Truck, Phone, MessageCircle, Star, 
  ChevronLeft, MapPin, Package, Clock
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const MapaAura = dynamic(() => import("@/componentes/MapaAura").then(mod => mod.MapaAura), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-surface animate-pulse" />
});
import { usePedido } from "@/hooks/usePaciente";
import socketService from "@/lib/socket";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import { Reveal } from "@/componentes/ui/Reveal";

export default function PaginaRastreoPedido() {
  const { id } = useParams();
  const router = useRouter();
  const { data: pedido, isLoading } = usePedido(id as string);
  const [courierLocation, setCourierLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!id) return;

    // Conectar al socket y unirse a la sala del pedido
    socketService.connect();
    socketService.emit("join-order", id);

    // Escuchar actualizaciones de ubicación
    const handleLocationUpdate = (data: any) => {
      if (data.orderId === id) {
        setCourierLocation([data.latitude, data.longitude]);
      }
    };

    window.addEventListener("oasis:location_update" as any, handleLocationUpdate);

    return () => {
      window.removeEventListener("oasis:location_update" as any, handleLocationUpdate);
    };
  }, [id]);

  if (isLoading) return <SkeletonPage type="dashboard" />;
  if (!pedido) return <div>Pedido no encontrado</div>;

  const origin: [number, number] = [pedido.pharmacy.latitude, pedido.pharmacy.longitude];
  const destination: [number, number] = [pedido.latitude, pedido.longitude];
  const currentPos: [number, number] = courierLocation || origin;

  const markers = [
    { id: 'pharmacy', position: origin, title: pedido.pharmacy.name, description: 'Origen del pedido', type: 'pharmacy' },
    { id: 'patient', position: destination, title: 'Tu Ubicación', description: 'Destino de entrega', type: 'user' },
    { id: 'courier', position: currentPos, title: 'Repartidor Oasis', description: 'En camino...', type: 'courier' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="glass" size="sm" onClick={() => router.back()} icon={ChevronLeft}>Volver</Button>
        <div>
          <h2 className="text-fluid-2xl font-display font-light">Seguimiento en Vivo</h2>
          <p className="text-[10px] font-mono text-muted uppercase tracking-[0.2em]">Orden #{id?.slice(-8)} • {pedido.status}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mapa Full Premium */}
        <div className="lg:col-span-2 h-[500px] rounded-[3rem] overflow-hidden relative shadow-2xl border border-border-light">
          <MapaAura 
            center={currentPos}
            zoom={15}
            markers={markers as any}
            route={{ origin: currentPos, destination }}
          />
        </div>

        {/* Info Lateral */}
        <div className="space-y-6">
          <Reveal delay={0.1}>
            <div className="frost-heavy p-8 rounded-[3rem] border border-border-light space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                  <Truck size={32} />
                </div>
                <div>
                  <h4 className="font-display text-lg font-light">Carlos Rodríguez</h4>
                  <Badge variant="accent" size="xs">Repartidor Elite</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-mono text-muted uppercase">Llegada Est.</p>
                  <p className="text-lg font-display font-light text-accent">12 min</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-mono text-muted uppercase">Distancia</p>
                  <p className="text-lg font-display font-light text-accent">2.4 km</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="primary" fullWidth icon={Phone}>Llamar</Button>
                <Button variant="secondary" fullWidth icon={MessageCircle}>Chat</Button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="p-8 rounded-[3rem] border border-border bg-surface/30 space-y-4">
              <h5 className="font-mono text-[10px] uppercase tracking-widest text-muted">Estado del Pedido</h5>
              <div className="space-y-4">
                {[
                  { label: "Pedido Recibido", time: "10:30 AM", active: true },
                  { label: "Preparando Medicamentos", time: "10:45 AM", active: true },
                  { label: "En Camino", time: "11:05 AM", active: true },
                  { label: "Entregado", time: "--:--", active: false }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${step.active ? 'bg-accent shadow-glow' : 'bg-border'}`} />
                      {i < 3 && <div className={`w-px h-8 ${step.active ? 'bg-accent' : 'bg-border'}`} />}
                    </div>
                    <div className={step.active ? 'text-text' : 'text-muted'}>
                      <p className="text-xs font-bold">{step.label}</p>
                      <p className="text-[10px] font-mono">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
