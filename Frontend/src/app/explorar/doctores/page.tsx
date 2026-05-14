"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Search, Filter, Star, MapPin, 
  ArrowRight, Stethoscope, Clock, ShieldCheck,
  ChevronRight, Heart, Award
} from "lucide-react";
import NavLanding from "@/componentes/layout/NavLanding";
import { useExplorarDoctores } from "@/hooks/useExplorar";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Input from "@/componentes/ui/Input";
import Badge from "@/componentes/ui/Badge";
import Avatar from "@/componentes/ui/Avatar";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import EmptyState from "@/componentes/ui/EmptyState";
import { cn } from "@/lib/utils";

const ExplorarDoctores = () => {
  const [search, setSearch] = useState("");
  const { data: doctores, isLoading } = useExplorarDoctores({ q: search });

  return (
    <div className="min-h-screen bg-bg">
      <NavLanding />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-12">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <Reveal className="space-y-4">
            <Badge variant="accent">Directorio Médico</Badge>
            <h1 className="font-display text-fluid-4xl font-light">Nuestros Especialistas</h1>
            <p className="text-fluid-base text-muted max-w-xl">Encuentra y agenda con los mejores profesionales de la salud, verificados por Oasis Aura.</p>
          </Reveal>
          
          <Reveal delay={0.2} className="w-full md:w-96">
            <Input 
              label="Buscador Doctores"
              placeholder="Buscar por nombre o especialidad..." 
              icon={Search}
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              className="rounded-2xl"
            />
          </Reveal>
        </div>

        {/* Filters Bar */}
        <Reveal delay={0.3}>
          <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
            <Button variant="secondary" size="sm" icon={Filter}>Filtros</Button>
            {["Cardiología", "Pediatría", "Dermatología", "Ginecología", "Nutrición", "Psicología"].map((cat) => (
              <Badge key={cat} variant="glass" className="cursor-pointer hover:bg-accent/10 hover:text-accent transition-colors px-4 py-2">
                {cat}
              </Badge>
            ))}
          </div>
        </Reveal>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[450px] bg-surface/30 animate-pulse rounded-[32px]" />)
          ) : doctores?.length > 0 ? (
            doctores.map((doc: any, i: number) => (
              <Reveal key={doc.id} delay={i * 0.05}>
                <Card hover className="p-0 overflow-hidden group flex flex-col h-full border-border-light">
                  {/* Photo/Visual Area */}
                  <div className="h-48 bg-gradient-to-br from-accent/10 to-success/10 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <Avatar 
                      name={doc.user.name} 
                      src={doc.user.avatarUrl} 
                      size="xl" 
                      className="w-32 h-32 rounded-[32px] border-4 border-bg shadow-float group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <button className="p-2 bg-bg/50 backdrop-blur-md rounded-full text-text hover:text-accent transition-colors">
                        <Heart size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Info Area */}
                  <div className="p-8 space-y-6 flex-1 flex flex-col">
                    <div className="text-center space-y-2">
                      <h3 className="font-display text-fluid-xl font-light">Dr. {doc.user.name}</h3>
                      <p className="text-accent text-[10px] font-mono uppercase tracking-[0.2em] font-bold">{doc.specialty}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-border-light">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-warning mb-1">
                          <Star size={14} fill="currentColor" />
                          <span className="text-fluid-xs font-bold text-text">{doc.rating}</span>
                        </div>
                        <p className="text-[9px] text-muted uppercase font-mono">Rating</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-accent mb-1">
                          <Award size={14} />
                          <span className="text-fluid-xs font-bold text-text">+{doc.totalReviews}</span>
                        </div>
                        <p className="text-[9px] text-muted uppercase font-mono">Reseñas</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-fluid-xs text-muted">
                        <MapPin size={14} className="text-accent" />
                        <span>{doc.clinic?.name || "Clínica Oasis Central"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-fluid-xs text-muted">
                        <Clock size={14} className="text-accent" />
                        <span>Disponible hoy</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-auto">
                      <Link href={`/explorar/doctores/${doc.id}`}>
                        <Button fullWidth size="lg" icon={ArrowRight} className="rounded-2xl shadow-glow-accent/5">
                          Ver Disponibilidad
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))
          ) : (
            <div className="col-span-full">
              <EmptyState 
                icon={Search} 
                title="No se encontraron doctores" 
                description="Intenta ajustando los filtros o buscando por especialidad."
                action={{ label: "Ver todos los especialistas", onClick: () => setSearch("") }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExplorarDoctores;
