"use client";

import React from "react";
import { useParams } from "next/navigation";
import { 
  Star, MapPin, Calendar, Clock, 
  MessageSquare, Share2, ShieldCheck,
  ArrowRight, Award, Stethoscope, Hospital
} from "lucide-react";
import NavLanding from "@/componentes/layout/NavLanding";
import { usePerfilPublico } from "@/hooks/useExplorar";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import Avatar from "@/componentes/ui/Avatar";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import dynamic from "next/dynamic";
const MapaAura = dynamic(() => import("@/componentes/MapaAura").then(mod => mod.MapaAura), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-surface animate-pulse" />
});
import { cn } from "@/lib/utils";

const PerfilPublico = () => {
  const { slug } = useParams();
  const { data: perfil, isLoading } = usePerfilPublico(slug as string);

  if (isLoading) return <SkeletonPage type="detail" />;

  // Mock data si no hay respuesta real
  const data = perfil || {
    name: "Dr. Mateo Estudi",
    type: "doctor",
    specialty: "Cardiología Avanzada",
    rating: 4.9,
    reviews: 128,
    address: "Centro Médico Oasis, Suite 402, Managua",
    bio: "Especialista en cardiología intervencionista con más de 15 años de experiencia en el tratamiento de enfermedades cardiovasculares complejas.",
    services: ["Ecocardiografía", "Electrocardiograma", "Consulta Preventiva"],
    location: [12.115, -86.236],
  };

  return (
    <div className="min-h-screen bg-bg">
      <NavLanding />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Info Area */}
          <div className="lg:col-span-2 space-y-12">
            <Reveal className="flex flex-col md:flex-row gap-8 items-start">
              <Avatar name={data.name} size="xl" className="w-40 h-40 rounded-[40px] border-4 border-accent/10 shadow-float" />
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="accent">{data.specialty}</Badge>
                  <Badge variant="glass" className="gap-1"><ShieldCheck size={12} /> Verificado</Badge>
                </div>
                <h1 className="font-display text-fluid-4xl font-light leading-tight">{data.name}</h1>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 text-warning">
                    <Star size={16} fill="currentColor" />
                    <span className="text-fluid-sm font-bold text-text">{data.rating}</span>
                    <span className="text-fluid-xs text-muted">({data.reviews} reseñas)</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted text-fluid-xs">
                    <MapPin size={16} className="text-accent" />
                    <span>{data.address.split(',')[0]}</span>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.2} className="space-y-6 border-t border-border pt-12">
              <h3 className="font-display text-fluid-2xl font-light">Sobre {data.type === 'doctor' ? 'el Doctor' : 'el Centro'}</h3>
              <p className="text-fluid-base text-muted leading-relaxed max-w-3xl">
                {data.bio}
              </p>
            </Reveal>

            <Reveal delay={0.3} className="space-y-8">
              <h3 className="font-display text-fluid-xl font-light">Servicios y Especialidades</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.services.map((s: string, i: number) => (
                  <Card key={i} className="p-4 flex items-center gap-4 bg-surface/30 border-border-light">
                    <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent">
                      <Award size={20} />
                    </div>
                    <span className="text-fluid-xs font-bold">{s}</span>
                  </Card>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.4} className="h-96 rounded-[40px] overflow-hidden border border-border shadow-glow-accent/5">
              <MapaAura center={data.location} markers={[{ id: 1, position: data.location, title: data.name }]} className="h-full" />
            </Reveal>
          </div>

          {/* Booking / Action Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <Reveal delay={0.5} className="sticky top-32">
              <Card className="p-8 space-y-8 frost border-accent/20 shadow-float-accent">
                <div className="space-y-2">
                  <p className="text-[10px] font-mono text-muted uppercase tracking-widest font-bold">Reserva tu cita</p>
                  <h4 className="font-display text-fluid-2xl font-light">C$ 800.00 <span className="text-fluid-xs text-muted font-normal">/ sesión</span></h4>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-surface/50 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-accent" />
                      <span className="text-fluid-xs font-bold">Sábado, 16 May</span>
                    </div>
                    <Button variant="ghost" size="sm">Cambiar</Button>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface/50 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-accent" />
                      <span className="text-fluid-xs font-bold">10:30 AM</span>
                    </div>
                    <Button variant="ghost" size="sm">Cambiar</Button>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <Button fullWidth size="xl" icon={ArrowRight} className="shadow-glow">Reservar ahora</Button>
                  <Button variant="secondary" fullWidth icon={MessageSquare}>Enviar Mensaje</Button>
                </div>

                <div className="pt-6 border-t border-border flex items-center justify-center gap-4">
                  <button className="flex items-center gap-2 text-[10px] font-mono text-muted uppercase hover:text-accent transition-colors">
                    <Share2 size={14} /> Compartir
                  </button>
                  <div className="w-px h-4 bg-border" />
                  <button className="flex items-center gap-2 text-[10px] font-mono text-muted uppercase hover:text-accent transition-colors">
                    <ShieldCheck size={14} /> Reportar
                  </button>
                </div>
              </Card>
            </Reveal>
          </div>

        </div>
      </main>
    </div>
  );
};

export default PerfilPublico;
