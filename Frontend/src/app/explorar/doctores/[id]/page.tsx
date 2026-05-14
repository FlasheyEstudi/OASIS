"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Star, MapPin, Clock, Calendar, 
  ChevronLeft, ShieldCheck, Award, MessageCircle,
  Share2, Heart, Info, ArrowRight
} from "lucide-react";
import NavLanding from "@/componentes/layout/NavLanding";
import { usePerfilPublico } from "@/hooks/useExplorar";
import { useAuthStore } from "@/almacenes/usoAuth";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import Avatar from "@/componentes/ui/Avatar";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import { cn } from "@/lib/utils";

const DoctorDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: doc, isLoading } = usePerfilPublico(id as string);

  if (isLoading) return <SkeletonPage type="detail" />;
  if (!doc) return <div className="min-h-screen flex items-center justify-center">Médico no encontrado</div>;

  const handleBooking = () => {
    if (!user) {
      router.push(`/acceso/login?returnUrl=/explorar/doctores/${id}`);
    } else {
      router.push(`/dashboard/patient/citas/nueva?doctorId=${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <NavLanding />
      
      {/* Hero Profile Header */}
      <section className="pt-32 pb-12 px-6 bg-gradient-to-b from-accent/5 to-transparent border-b border-border-light">
        <div className="max-w-5xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            icon={ChevronLeft} 
            onClick={() => router.back()}
            className="mb-8"
          >
            Volver al directorio
          </Button>
          
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <Reveal>
              <Avatar 
                name={doc.user.name} 
                src={doc.user.avatarUrl} 
                size="xl" 
                className="w-40 h-40 rounded-[40px] border-4 border-bg shadow-float" 
              />
            </Reveal>
            
            <div className="flex-1 space-y-4">
              <Reveal delay={0.1}>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-fluid-4xl font-light">Dr. {doc.user.name}</h1>
                  <Badge variant="accent" className="flex gap-1 items-center">
                    <ShieldCheck size={12} /> Verificado
                  </Badge>
                </div>
                <p className="text-accent text-fluid-lg font-mono uppercase tracking-widest font-bold">{doc.specialty}</p>
              </Reveal>
              
              <Reveal delay={0.2} className="flex flex-wrap gap-6 text-fluid-xs text-muted">
                <div className="flex items-center gap-2">
                  <Star className="text-warning" size={16} fill="currentColor" />
                  <span className="font-bold text-text">{doc.rating}</span>
                  <span>({doc.totalReviews} reseñas)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="text-accent" size={16} />
                  <span>{doc.clinic?.name || "Clínica Oasis Central"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="text-info" size={16} />
                  <span>12 años de experiencia</span>
                </div>
              </Reveal>

              <Reveal delay={0.3} className="flex gap-4 pt-4">
                <Button size="lg" icon={Calendar} onClick={handleBooking}>Agendar Cita</Button>
                <Button variant="secondary" size="lg" icon={MessageCircle}>Enviar Mensaje</Button>
                <div className="flex gap-2 ml-auto">
                  <button className="p-3 rounded-2xl bg-surface/50 border border-border hover:bg-surface transition-colors"><Heart size={20} /></button>
                  <button className="p-3 rounded-2xl bg-surface/50 border border-border hover:bg-surface transition-colors"><Share2 size={20} /></button>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Content Tabs/Grid */}
      <main className="py-16 px-6 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Info */}
        <div className="lg:col-span-2 space-y-12">
          <Reveal delay={0.4}>
            <div className="space-y-6">
              <h3 className="font-display text-fluid-2xl font-light border-b border-border pb-4">Biografía Profesional</h3>
              <p className="text-fluid-base text-muted leading-relaxed">
                {doc.biography || "El Dr. " + doc.user.name + " es un especialista altamente calificado con un enfoque en medicina humana y tecnología de vanguardia. Se dedica a proporcionar un cuidado excepcional basado en la evidencia y la empatía."}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.5}>
            <div className="space-y-6">
              <h3 className="font-display text-fluid-2xl font-light border-b border-border pb-4">Especialidades y Servicios</h3>
              <div className="flex flex-wrap gap-3">
                {["Consulta General", "Seguimiento Crónico", "Telemedicina", "Chequeo Ejecutivo", "Segunda Opinión"].map((s) => (
                  <Badge key={s} variant="glass" className="px-4 py-2">{s}</Badge>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.6}>
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <h3 className="font-display text-fluid-2xl font-light">Reseñas de Pacientes</h3>
                <Button variant="ghost" size="sm" iconRight={ArrowRight}>Ver todas</Button>
              </div>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="p-6 bg-surface/30">
                    <div className="flex justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar name="Paciente" size="sm" />
                        <div>
                          <p className="text-fluid-xs font-bold">Paciente Anónimo</p>
                          <p className="text-[10px] text-muted uppercase">Hace 2 semanas</p>
                        </div>
                      </div>
                      <div className="flex text-warning">
                        <Star size={12} fill="currentColor" />
                        <Star size={12} fill="currentColor" />
                        <Star size={12} fill="currentColor" />
                        <Star size={12} fill="currentColor" />
                        <Star size={12} fill="currentColor" />
                      </div>
                    </div>
                    <p className="text-fluid-xs text-muted italic">"Excelente atención, muy profesional y dedicado. Explicó todo con mucha claridad."</p>
                  </Card>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-8">
          <Reveal delay={0.7}>
            <Card className="p-8 space-y-6 border-accent/20 bg-accent/5">
              <div className="flex items-center gap-3 text-accent">
                <Clock size={20} />
                <h4 className="font-display text-fluid-lg font-light">Disponibilidad</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-fluid-xs">
                  <span className="text-muted">Lunes - Viernes</span>
                  <span className="font-bold">08:00 - 17:00</span>
                </div>
                <div className="flex justify-between text-fluid-xs">
                  <span className="text-muted">Sábados</span>
                  <span className="font-bold">09:00 - 13:00</span>
                </div>
                <div className="flex justify-between text-fluid-xs text-danger">
                  <span className="text-muted">Domingos</span>
                  <span className="font-bold">Cerrado</span>
                </div>
              </div>
              <Button fullWidth icon={ArrowRight} onClick={handleBooking}>Ver Próximos Cupos</Button>
            </Card>
          </Reveal>

          <Reveal delay={0.8}>
            <Card className="p-8 space-y-6">
              <div className="flex items-center gap-3 text-info">
                <Info size={20} />
                <h4 className="font-display text-fluid-lg font-light">Seguros Aceptados</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Iniser", "Assa", "Mapfre", "Vivamos"].map((ins) => (
                  <Badge key={ins} variant="glass" size="sm">{ins}</Badge>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>
      </main>
    </div>
  );
};

export default DoctorDetailPage;
