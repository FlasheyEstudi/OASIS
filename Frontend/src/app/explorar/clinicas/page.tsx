"use client";

import React, { useState } from "react";
import { 
  Hospital, MapPin, Search, Phone, 
  ArrowRight, Users, Star, Globe,
  ShieldCheck, Activity
} from "lucide-react";
import NavLanding from "@/componentes/layout/NavLanding";
import { useExplorarClinicas } from "@/hooks/useExplorar";
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

const ExplorarClinicas = () => {
  const [search, setSearch] = useState("");
  const { data: clinicas, isLoading } = useExplorarClinicas({ q: search });

  const mapMarkers = clinicas?.map((c: any) => ({
    id: c.id,
    position: c.location,
    title: c.name,
    description: c.address
  })) || [];

  return (
    <div className="min-h-screen bg-bg">
      <NavLanding />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <Reveal className="space-y-4">
            <Badge variant="accent">Red de Salud</Badge>
            <h1 className="font-display text-fluid-4xl font-light">Centros Médicos</h1>
            <p className="text-fluid-base text-muted max-w-xl">Encuentra la clínica más cercana equipada con tecnología de vanguardia y los mejores especialistas.</p>
          </Reveal>
          
          <Reveal delay={0.2} className="w-full md:w-96">
            <Input 
              label="Buscador Clínicas"
              placeholder="Nombre, zona o servicio..." 
              icon={Search}
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              className="rounded-2xl"
            />
          </Reveal>
        </div>

        {/* Split View: List & Map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
          {/* Clinics List */}
          <div className="lg:col-span-1 space-y-6 max-h-[800px] overflow-y-auto pr-2 scrollbar-hide">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 bg-surface/30 animate-pulse rounded-[28px]" />)
            ) : clinicas?.length > 0 ? (
              clinicas.map((c: any, i: number) => (
                <Reveal key={c.id} delay={i * 0.1}>
                  <Card hover className="p-6 border-border-light cursor-pointer group">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-accent/5 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                        <Hospital size={24} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="font-display text-fluid-base font-bold">{c.name}</h4>
                        <p className="text-[11px] text-muted flex items-center gap-2">
                          <MapPin size={12} className="text-accent" /> {c.address}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {c.services.map((s: string) => (
                            <Badge key={s} variant="glass" size="xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Reveal>
              ))
            ) : (
              <EmptyState 
                icon={Hospital} 
                title="Sin resultados" 
                description="Prueba con otra zona o servicio."
              />
            )}
          </div>

          {/* Interactive Map */}
          <Reveal delay={0.3} className="lg:col-span-2 h-[600px] lg:h-full min-h-[500px]">
            <MapaAura 
              markers={mapMarkers} 
              className="h-full rounded-[40px] shadow-glow-accent/5"
              center={clinicas?.[0]?.location}
            />
          </Reveal>
        </div>
      </main>
    </div>
  );
};

export default ExplorarClinicas;
