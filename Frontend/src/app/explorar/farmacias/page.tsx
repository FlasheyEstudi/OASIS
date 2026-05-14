"use client";

import React, { useState } from "react";
import { 
  Pill, MapPin, Search, Clock, 
  Truck, ShieldCheck, ArrowRight,
  Info, ShoppingBag, Navigation
} from "lucide-react";
import NavLanding from "@/componentes/layout/NavLanding";
import { useExplorarFarmacias } from "@/hooks/useExplorar";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Input from "@/componentes/ui/Input";
import Badge from "@/componentes/ui/Badge";
import dynamic from "next/dynamic";
const MapaAura = dynamic(() => import("@/componentes/MapaAura").then(mod => mod.MapaAura), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-surface animate-pulse" />
});
import EmptyState from "@/componentes/ui/EmptyState";
import { cn } from "@/lib/utils";

const ExplorarFarmacias = () => {
  const [search, setSearch] = useState("");
  const { data: farmacias, isLoading } = useExplorarFarmacias({ q: search });

  const mapMarkers = farmacias?.map((f: any) => ({
    id: f.id,
    position: f.location,
    title: f.name,
    description: `${f.address} - ${f.hours}`
  })) || [];

  return (
    <div className="min-h-screen bg-bg">
      <NavLanding />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <Reveal className="space-y-4">
            <Badge variant="accent">Red de Suministros</Badge>
            <h1 className="font-display text-fluid-4xl font-light">Farmacias y Boticas</h1>
            <p className="text-fluid-base text-muted max-w-xl">Encuentra disponibilidad inmediata, envíos a domicilio y atención personalizada en nuestra red aliada.</p>
          </Reveal>
          
          <Reveal delay={0.2} className="w-full md:w-96">
            <Input 
              label="Buscador Farmacias"
              placeholder="Nombre, barrio o ciudad..." 
              icon={Search}
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              className="rounded-2xl"
            />
          </Reveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters & Map (Mobile View) */}
          <div className="lg:col-span-1 space-y-8 order-2 lg:order-1">
            <Reveal delay={0.3}>
              <Card className="p-8 space-y-6 frost border-accent/10">
                <h4 className="font-display text-fluid-sm font-bold">Opciones de Entrega</h4>
                <div className="space-y-3">
                  {[
                    { label: "Servicio 24h", icon: Clock },
                    { label: "Delivery Aura", icon: Truck },
                    { label: "Retiro en Tienda", icon: ShoppingBag }
                  ].map((opt) => (
                    <label key={opt.label} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-muted group-hover:text-accent transition-all">
                        <opt.icon size={20} />
                      </div>
                      <span className="text-fluid-xs text-muted group-hover:text-text">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </Card>
            </Reveal>

            <Reveal delay={0.4} className="h-80 hidden lg:block">
              <MapaAura 
                markers={mapMarkers} 
                className="h-full rounded-[32px] shadow-glow-accent/5"
                zoom={14}
              />
            </Reveal>
          </div>

          {/* Farmacias Grid */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 order-1 lg:order-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-64 bg-surface/30 animate-pulse rounded-[32px]" />)
            ) : farmacias?.length > 0 ? (
              farmacias.map((f: any, i: number) => (
                <Reveal key={f.id} delay={i * 0.1}>
                  <Card hover className="p-8 border-border-light group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 rounded-[24px] bg-accent/5 flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-500">
                        <Pill size={32} />
                      </div>
                      <Badge variant={f.delivery ? "success" : "glass"} size="xs">
                        {f.delivery ? "Envío Disponible" : "Solo Tienda"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-display text-fluid-xl font-light">{f.name}</h4>
                        <p className="text-[11px] text-muted flex items-center gap-2 mt-1">
                          <MapPin size={12} className="text-accent" /> {f.address}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 py-4 border-y border-border-light">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-muted uppercase">
                          <Clock size={12} className="text-accent" /> {f.hours}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-muted uppercase">
                          <Navigation size={12} className="text-accent" /> 1.5 km
                        </div>
                      </div>

                      <div className="pt-4 flex gap-3">
                        <Button fullWidth size="md">Ver Productos</Button>
                        <Button variant="secondary" size="md" icon={Info} />
                      </div>
                    </div>
                  </Card>
                </Reveal>
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState 
                  icon={Search} 
                  title="No hay farmacias cerca" 
                  description="Ajusta tu ubicación o prueba con otro nombre."
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExplorarFarmacias;
