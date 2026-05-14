"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  ArrowRight, Heart, Clock, Pill, 
  Activity, MapPin, Shield, Zap, 
  Search, Users, Star, Truck
} from "lucide-react";
import { Reveal } from "@/componentes/ui/Reveal";
import { AnimatedCounter } from "@/componentes/ui/AnimatedCounter";
import Button from "@/componentes/ui/Button";
import Card from "@/componentes/ui/Card";
import Badge from "@/componentes/ui/Badge";
import NavLanding from "@/componentes/layout/NavLanding";
import { PiePagina } from "@/componentes/layout/PiePagina";
import { cn } from "@/lib/utils";

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const yMarquee = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // Mock de datos que podrían venir del backend
  const stats = [
    { value: 15000, label: "Pacientes activos", suffix: "+" },
    { value: 200, label: "Doctores verificados", suffix: "+" },
    { value: 50, label: "Farmacias aliadas", suffix: "+" },
    { value: 98, label: "Satisfacción", suffix: "%" },
  ];

  const marqueeItems = [
    "Citas Médicas", "Recetas Digitales", "Farmacia Online", 
    "Delivery Rápido", "Historial Clínico", "Validación Clínica", 
    "Tracking GPS", "Puntos de Lealtad"
  ];

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-accent/30 overflow-x-hidden">
      <NavLanding />

      {/* --- SECCIÓN 1: HERO --- */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[420px] h-[420px] bg-accent/6 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-5%] w-[260px] h-[260px] bg-success/4 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* LADO IZQUIERDO */}
          <div className="lg:col-span-7 space-y-10 z-10">
            <Reveal direction="up" delay={0.2}>
              <Badge variant="glass" className="py-1.5 px-4 text-accent border-accent/20">
                🌿 Plataforma de Salud Integral
              </Badge>
            </Reveal>

            <div className="space-y-4">
              <div className="overflow-hidden">
                <motion.h1 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-fluid-hero font-light leading-[0.95] tracking-tight"
                >
                  Tu salud,
                </motion.h1>
              </div>
              <div className="overflow-hidden">
                <motion.h1 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-fluid-hero font-light leading-[0.95] tracking-tight italic text-accent"
                >
                  merece
                </motion.h1>
              </div>
              <div className="overflow-hidden">
                <motion.h1 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-fluid-hero font-light leading-[0.95] tracking-tight"
                >
                  un oasis.
                </motion.h1>
              </div>
            </div>

            <Reveal delay={0.8}>
              <p className="text-fluid-base text-muted font-light max-w-lg leading-relaxed">
                Conectamos pacientes, doctores y farmacias en un ecosistema digital. 
                Citas, recetas, medicamentos y seguimiento — todo en un solo lugar.
              </p>
            </Reveal>

            <Reveal delay={0.95}>
              <div className="flex flex-col sm:flex-row gap-5">
                <Button variant="primary" size="xl" iconRight={ArrowRight} className="shadow-glow-accent">
                  Comenzar Gratis
                </Button>
                <Button variant="glass" size="xl">
                  Cómo Funciona
                </Button>
              </div>
            </Reveal>

            <Reveal delay={1.1}>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2 text-subtle">
                  <Shield size={16} className="text-accent" />
                  <span className="text-[11px] font-mono uppercase tracking-widest">Datos encriptados</span>
                </div>
                <div className="flex items-center gap-2 text-subtle">
                  <Heart size={16} className="text-accent" />
                  <span className="text-[11px] font-mono uppercase tracking-widest">+15K pacientes</span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* LADO DERECHO */}
          <div className="hidden lg:flex lg:col-span-5 justify-center relative">
            <motion.div 
              animate={{ 
                rotate: [0, 90, 180, 270, 360],
                borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "30% 60% 70% 40% / 50% 60% 30% 60%", "60% 40% 30% 70% / 60% 30% 70% 40%"]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-[420px] h-[420px] bg-accent/5 border border-accent/10 relative flex items-center justify-center"
            >
              <div className="absolute inset-8 border border-white/5 rounded-full" />
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 frost rounded-full flex items-center justify-center border border-accent/20 shadow-glow-accent"
              >
                <Heart size={32} className="text-accent fill-accent/20" />
              </motion.div>
            </motion.div>
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 right-0 p-6 frost rounded-3xl border border-white/10 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <Activity size={18} className="text-success" />
                </div>
                <div>
                  <p className="text-[9px] font-mono text-muted uppercase">Ritmo Cardíaco</p>
                  <p className="text-fluid-sm font-bold">72 BPM</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 2: MARQUEE --- */}
      <div className="py-8 border-y border-border bg-surface/50 relative z-20 overflow-hidden">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-16"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-16">
              {marqueeItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-16">
                  <span className="font-display text-fluid-sm text-muted uppercase tracking-[0.2em]">
                    {item}
                  </span>
                  <span className="text-accent/60 opacity-60">◆</span>
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* --- SECCIÓN 3: SERVICIOS --- */}
      <section id="servicios" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <Reveal>
            <div className="flex items-center gap-6">
              <span className="text-fluid-xs font-mono uppercase tracking-[0.3em] text-accent">Servicios</span>
              <div className="h-px bg-accent/20 flex-1" />
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 p-10 bg-accent/5 border-accent/10 flex flex-col justify-between group overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                <Clock size={200} />
              </div>
              <div className="space-y-6 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-bg shadow-glow-accent">
                  <Clock size={32} />
                </div>
                <h3 className="font-display text-fluid-2xl font-light">Citas Médicas Inteligentes</h3>
                <p className="text-fluid-base text-muted font-light max-w-md leading-relaxed">
                  Agenda consultas presenciales o telemedicina con los mejores especialistas de la región en segundos.
                </p>
                <Link href="/acceso/registro" className="inline-flex items-center gap-2 text-accent font-bold group/link">
                  Explorar especialistas <ArrowRight size={18} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Card>

            <Card className="p-10 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center text-success">
                <Pill size={32} />
              </div>
              <h3 className="font-display text-fluid-xl font-light">Farmacia Digital</h3>
              <p className="text-fluid-sm text-muted font-light leading-relaxed">
                Recibe tus medicamentos en la puerta de tu casa con tracking en tiempo real.
              </p>
            </Card>

            <Card className="p-10 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-info/10 flex items-center justify-center text-info">
                <Activity size={32} />
              </div>
              <h3 className="font-display text-fluid-xl font-light">Historial Clínico</h3>
              <p className="text-fluid-sm text-muted font-light leading-relaxed">
                Toda tu información de salud organizada y accesible encriptada bajo el estándar Aura.
              </p>
            </Card>

            <Card className="lg:col-span-2 p-10 bg-surface/50 border-white/5 space-y-6 flex flex-col md:flex-row gap-10 items-center">
              <div className="flex-1 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center text-warning">
                  <MapPin size={32} />
                </div>
                <h3 className="font-display text-fluid-2xl font-light">Ecosistema Conectado</h3>
                <p className="text-fluid-base text-muted font-light leading-relaxed">
                  Seguimiento GPS para entregas y ubicación de clínicas aliadas con disponibilidad inmediata.
                </p>
              </div>
              <div className="w-full md:w-64 aspect-video rounded-2xl bg-bg border border-border overflow-hidden relative grayscale opacity-60">
                <div className="absolute inset-0 bg-accent/5 animate-pulse" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 4: CÓMO FUNCIONA --- */}
      <section id="como-funciona" className="py-32 px-6 bg-surface/20">
        <div className="max-w-7xl mx-auto space-y-20">
          <Reveal>
            <div className="flex items-center gap-6">
              <span className="text-fluid-xs font-mono uppercase tracking-[0.3em] text-accent">Cómo Funciona</span>
              <div className="h-px bg-accent/20 flex-1" />
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {[
              { num: "01", title: "Crea tu cuenta", desc: "Regístrate como paciente, doctor o farmacia. En menos de un minuto." },
              { num: "02", title: "Conecta y gestiona", desc: "Agenda citas, solicita recetas, ordena medicamentos." },
              { num: "03", title: "Cuida tu salud", desc: "Medicamentos en tu puerta, historial siempre actualizado." }
            ].map((step, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <div className="space-y-6">
                  <span className="font-display text-fluid-4xl font-light text-accent/10 leading-none">
                    {step.num}
                  </span>
                  <h3 className="font-display text-fluid-xl font-light">
                    {step.title}
                  </h3>
                  <p className="text-fluid-sm text-muted font-light leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 5: IMPACTO --- */}
      <section id="nosotros" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-24">
          <Reveal>
            <div className="flex items-center gap-6">
              <span className="text-fluid-xs font-mono uppercase tracking-[0.3em] text-accent">Impacto</span>
              <div className="h-px bg-accent/20 flex-1" />
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <Card key={i} className="text-center p-10 bg-surface/30 border-white/5 group hover:border-accent/20 transition-all">
                <div className="flex items-baseline justify-center gap-1">
                  <AnimatedCounter value={stat.value} className="font-display text-fluid-3xl text-accent" />
                  <span className="text-fluid-lg font-display text-accent/60">{stat.suffix}</span>
                </div>
                <p className="text-[11px] font-mono text-muted uppercase tracking-widest mt-2">{stat.label}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <Reveal direction="left">
              <div className="space-y-8">
                <h2 className="font-display text-fluid-2xl font-light leading-tight">
                  Más que una plataforma, <br />
                  <span className="italic text-accent">un ecosistema.</span>
                </h2>
                <div className="space-y-6 text-fluid-sm text-muted font-light leading-relaxed">
                  <p>
                    Oasis Aura nació con una misión clara: devolverle la serenidad a la gestión de salud. 
                    Creemos que la tecnología no debe ser una barrera, sino un puente entre quienes necesitan 
                    cuidado y quienes lo brindan.
                  </p>
                  <p>
                    Utilizamos inteligencia de datos para optimizar inventarios, geolocalización para 
                    reducir tiempos de entrega y protocolos de seguridad de grado bancario para proteger 
                    tu privacidad.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-accent font-display text-fluid-lg">
                  <Users className="text-accent" />
                  <span>Creciendo cada día</span>
                </div>
              </div>
            </Reveal>

            <Reveal direction="right">
              <div className="relative aspect-video rounded-[40px] bg-accent/5 border border-accent/10 overflow-hidden flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent" />
                <div className="relative z-10 w-24 h-24 rounded-full border border-accent/30 flex items-center justify-center animate-pulse-slow">
                  <div className="w-16 h-16 rounded-full bg-accent/20" />
                </div>
                {/* Visual shapes */}
                <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-accent animate-ping" />
                <div className="absolute bottom-10 right-10 w-2 h-2 rounded-full bg-success animate-ping" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 6: CTA FINAL --- */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/[0.03] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
          <Reveal direction="up">
            <h2 className="font-display text-fluid-4xl md:text-fluid-hero font-light leading-none tracking-tight">
              Tu oasis te está <br />
              <span className="italic text-accent">esperando.</span>
            </h2>
          </Reveal>
          
          <Reveal direction="up" delay={0.2}>
            <p className="text-fluid-base text-muted font-light max-w-xl mx-auto">
              Únete hoy a miles de personas que ya están transformando su relación con la salud. 
              Simple, humano, Aura.
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.3}>
            <Button variant="primary" size="xl" className="px-12 shadow-glow-accent" iconRight={ArrowRight}>
              Unirse Ahora
            </Button>
          </Reveal>
        </div>
      </section>

      <PiePagina />
    </div>
  );
};

export default LandingPage;
