"use client";

import React, { useState } from "react";
import { 
  MapPin, Phone, MessageSquare, Box, 
  Navigation2, CheckCircle2, ShieldCheck,
  AlertCircle, ChevronRight, X
} from "lucide-react";
import { useRuta, useCompletarEntrega } from "@/hooks/delivery";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import dynamic from "next/dynamic";
const MapaAura = dynamic(() => import("@/componentes/MapaAura").then(mod => mod.MapaAura), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-surface animate-pulse" />
});
import Modal from "@/componentes/ui/Modal";
import { useToast } from "@/componentes/ui/Toast";
import { cn } from "@/lib/utils";

const EntregaActiva = () => {
  const [step, setStep] = useState(1); // 1: Recogiendo, 2: En Camino, 3: Entregando
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { show } = useToast();

  const handleStatusChange = () => {
    if (step < 3) {
      setStep(step + 1);
      show({ title: "Estado Actualizado", message: step === 1 ? "Pedido recogido. En camino al cliente." : "Llegaste al destino.", type: "success" });
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 pb-24">
      {/* Dynamic Header */}
      <Reveal>
        <Card className="p-6 bg-accent text-white shadow-glow-accent/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Navigation2 size={80} />
          </div>
          <div className="relative z-10 space-y-4">
            <Badge variant="glass" className="bg-white/20 border-white/20 text-white uppercase tracking-widest text-[9px]">
              {step === 1 ? "Punto de Recogida" : "Punto de Entrega"}
            </Badge>
            <div className="space-y-1">
              <h3 className="text-fluid-xl font-display font-light">
                {step === 1 ? "Farmacia San José" : "Residencial Las Colinas"}
              </h3>
              <p className="text-white/70 text-fluid-xs flex items-center gap-2">
                <MapPin size={12} /> {step === 1 ? "Km 4.5 Carretera Masaya" : "Calle Principal, Casa #12"}
              </p>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* Map View */}
      <Reveal delay={0.1} className="flex-1 min-h-[300px]">
        <MapaAura className="h-full rounded-[32px]" />
      </Reveal>

      {/* Delivery Info & Actions */}
      <Reveal delay={0.2}>
        <Card className="p-8 space-y-8 frost border-accent/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-muted">
                <Box size={24} />
              </div>
              <div>
                <h4 className="text-fluid-sm font-bold">Orden #RX9821</h4>
                <p className="text-[10px] text-muted uppercase tracking-wider font-mono">3 productos • C$ 420.00</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" icon={Phone} className="rounded-2xl h-12 w-12 p-0" />
              <Button variant="secondary" size="sm" icon={MessageSquare} className="rounded-2xl h-12 w-12 p-0" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest font-bold">Progreso de Entrega</span>
              <span className="text-fluid-xs font-bold text-accent">{step * 33}%</span>
            </div>
            <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
              <div className={cn("h-full bg-accent transition-all duration-700", step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full")} />
            </div>
          </div>

          <Button 
            size="xl" 
            fullWidth 
            onClick={handleStatusChange}
            icon={step === 3 ? CheckCircle2 : ChevronRight}
            className="h-16 rounded-[24px] text-fluid-base shadow-glow-accent"
          >
            {step === 1 ? "Confirmar Recogida" : step === 2 ? "Marcar Llegada" : "Finalizar Entrega"}
          </Button>
        </Card>
      </Reveal>

      {/* Completion Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Finalizar Entrega">
        <div className="space-y-8 py-4">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-[28px] bg-success/10 text-success mx-auto flex items-center justify-center">
              <ShieldCheck size={40} />
            </div>
            <div>
              <h4 className="font-display text-fluid-xl font-light">Confirmación Aura</h4>
              <p className="text-fluid-xs text-muted">Solicita el código de entrega al cliente.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <input key={i} type="text" maxLength={1} className="w-full h-16 bg-surface border border-border rounded-2xl text-center text-fluid-xl font-display outline-none focus:border-accent" />
            ))}
          </div>

          <div className="space-y-3">
            <Button fullWidth size="lg">Confirmar Entrega</Button>
            <Button variant="ghost" fullWidth onClick={() => setIsModalOpen(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EntregaActiva;
