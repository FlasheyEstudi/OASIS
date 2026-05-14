"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Search, Users, Hospital, Pill, 
  MapPin, ArrowRight, Star, ShieldCheck,
  Stethoscope, Clock
} from "lucide-react";
import NavLanding from "@/componentes/layout/NavLanding";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Input from "@/componentes/ui/Input";
import Badge from "@/componentes/ui/Badge";
import { cn } from "@/lib/utils";

const ExplorarPage = () => {
  const [activeTab, setActiveTab] = useState("doctores");

  const categories = [
    { id: "doctores", label: "Doctores", icon: Stethoscope, href: "/explorar/doctores" },
    { id: "clinicas", label: "Clínicas", icon: Hospital, href: "/explorar/clinicas" },
    { id: "farmacias", label: "Farmacias", icon: Pill, href: "/explorar/farmacias" },
    { id: "medicamentos", label: "Medicamentos", icon: Pill, href: "/explorar/medicamentos" },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <NavLanding />
      
      {/* Hero Search */}
      <section className="pt-40 pb-20 px-6 bg-gradient-to-b from-accent/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Reveal>
            <Badge variant="accent" className="mb-4">Explora el Ecosistema</Badge>
            <h1 className="font-display text-fluid-4xl md:text-fluid-5xl font-light leading-tight">
              Encuentra lo que <span className="italic text-accent">necesitas</span> para tu salud.
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="relative max-w-2xl mx-auto mt-12 group">
              <Input 
                size="xl" 
                label="Buscador Universal"
                placeholder="Busca doctores, especialidades, medicamentos..." 
                icon={Search}
                className="shadow-float-accent group-hover:shadow-glow-accent/20 transition-all duration-500 rounded-[32px] h-20 text-fluid-lg"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Button size="lg" className="rounded-2xl px-8 h-14">Buscar</Button>
              </div>
            </div>
          </Reveal>

          {/* Quick Categories */}
          <div className="flex flex-wrap justify-center gap-4 mt-12">
            {categories.map((cat, i) => (
              <Reveal key={cat.id} delay={0.3 + i * 0.1}>
                <Link href={cat.href}>
                  <Card hover className="px-6 py-4 flex items-center gap-3 border-border-light bg-surface/30 frost group">
                    <cat.icon className="text-accent group-hover:scale-110 transition-transform" size={20} />
                    <span className="text-fluid-xs font-bold uppercase tracking-widest">{cat.label}</span>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Sections */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-20">
        
        {/* Featured Doctors */}
        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-display text-fluid-3xl font-light">Especialistas Destacados</h2>
              <p className="text-fluid-base text-muted">Los mejores doctores certificados en la red Oasis.</p>
            </div>
            <Link href="/explorar/doctores" className="flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-[10px] hover:gap-3 transition-all">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Reveal key={i} delay={i * 0.1}>
                <Card className="p-8 group overflow-hidden relative">
                  <div className="w-20 h-20 rounded-[28px] bg-accent/10 mb-6 mx-auto flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                    <Stethoscope size={40} />
                  </div>
                  <div className="text-center space-y-4">
                    <h4 className="font-display text-fluid-lg font-light">Dr. Especialista</h4>
                    <Badge variant="glass">Cardiología</Badge>
                    <div className="flex items-center justify-center gap-1 text-warning">
                      <Star size={14} fill="currentColor" />
                      <span className="text-fluid-xs font-bold text-text">4.9</span>
                    </div>
                    <Button variant="secondary" fullWidth size="sm" className="mt-4">Ver Perfil</Button>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-20 border-t border-border">
          {[
            { icon: ShieldCheck, title: "Certificación Aura", desc: "Todos los profesionales y establecimientos son verificados con estándares internacionales." },
            { icon: Clock, title: "Atención 24/7", desc: "Acceso inmediato a teleconsultas y farmacias de turno en cualquier momento." },
            { icon: MapPin, title: "Geolocalización", desc: "Encuentra la clínica o farmacia más cercana a tu ubicación actual de forma inteligente." }
          ].map((item, i) => (
            <Reveal key={i} delay={0.5 + i * 0.1}>
              <div className="space-y-4 text-center md:text-left">
                <div className="w-12 h-12 rounded-2xl bg-accent/5 flex items-center justify-center text-accent mx-auto md:mx-0">
                  <item.icon size={24} />
                </div>
                <h3 className="font-display text-fluid-xl font-light">{item.title}</h3>
                <p className="text-fluid-xs text-muted leading-relaxed">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

      </section>
      
      {/* Footer CTA */}
      <section className="py-32 px-6 text-center bg-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-success/10 blur-[120px] rounded-full" />
        </div>
        
        <Reveal className="max-w-2xl mx-auto space-y-8 relative z-10">
          <h2 className="font-display text-fluid-4xl font-light">¿Listo para transformar <br />tu experiencia de salud?</h2>
          <p className="text-fluid-base text-muted">Únete a miles de personas que ya disfrutan de una salud conectada, premium y humana.</p>
          <div className="flex flex-col md:flex-row justify-center gap-4 pt-8">
            <Button size="xl" className="px-12 shadow-glow">Crear Cuenta Gratis</Button>
            <Button variant="secondary" size="xl" className="px-12">Saber más</Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default ExplorarPage;
