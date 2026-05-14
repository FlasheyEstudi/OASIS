"use client";

import React from "react";
import { 
  Activity, Calendar, FileText, Heart, 
  ShieldAlert, Thermometer, User, Pill
} from "lucide-react";
import { useHistorial, usePerfilPaciente } from "@/hooks/usePaciente";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Badge from "@/componentes/ui/Badge";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import { cn } from "@/lib/utils";

const HistorialPaciente = () => {
  const { data: perfil } = usePerfilPaciente();
  const { data: historial, isLoading } = useHistorial(perfil?.id);

  if (isLoading) return <SkeletonPage type="list" />;

  return (
    <div className="space-y-12 pb-20">
      {/* --- RESUMEN CLINICO --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Reveal delay={0.1}>
          <Card className="bg-danger/5 border-danger/10">
            <h4 className="text-[10px] font-mono text-danger uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2">
              <ShieldAlert size={14} /> Alergias
            </h4>
            <div className="flex flex-wrap gap-2">
              {perfil?.allergies?.map((a: any) => (
                <Badge key={a.id} variant="danger" size="xs">{a.name}</Badge>
              )) || <span className="text-fluid-xs text-muted">Sin alergias registradas</span>}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.2}>
          <Card className="bg-accent/5 border-accent/10">
            <h4 className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2">
              <Thermometer size={14} /> Cond. Crónicas
            </h4>
            <div className="flex flex-wrap gap-2">
              {perfil?.chronicConditions?.map((c: any) => (
                <Badge key={c.id} variant="accent" size="xs">{c.name}</Badge>
              )) || <span className="text-fluid-xs text-muted">Ninguna detectada</span>}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.3}>
          <Card className="bg-success/5 border-success/10">
            <h4 className="text-[10px] font-mono text-success uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2">
              <Pill size={14} /> Meds. Actuales
            </h4>
            <div className="space-y-2">
              {(Array.isArray(historial?.medications) ? historial.medications : []).slice(0, 2).map((m: any) => (
                <p key={m.id} className="text-fluid-xs font-medium">{m.name} • <span className="text-muted">{m.dosage}</span></p>
              )) || <span className="text-fluid-xs text-muted">Sin medicación activa</span>}
            </div>
          </Card>
        </Reveal>
      </div>

      {/* --- TIMELINE --- */}
      <div className="space-y-8">
        <h3 className="font-display text-fluid-2xl font-light">Línea del Tiempo Clínica</h3>
        
        <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-accent before:via-border before:to-transparent">
          
          {[1, 2, 3].map((i) => (
            <Reveal key={i} delay={i * 0.1} direction={i % 2 === 0 ? "right" : "left"}>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                {/* Dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-bg group-hover:border-accent group-hover:scale-125 transition-all duration-500 absolute left-0 md:left-1/2 md:-ml-5 z-10">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                </div>
                
                {/* Content */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-8 rounded-[32px] border border-border bg-surface/30 frost group-hover:border-accent/30 transition-all duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <time className="font-mono text-fluid-xs text-accent font-bold">1{i} MAY 2026</time>
                    <Badge variant="glass" size="xs">CONSULTA</Badge>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-display text-fluid-xl font-light">Chequeo General Anual</h4>
                    <p className="text-fluid-xs text-muted font-light leading-relaxed">
                      Paciente presenta signos vitales estables. Se recomienda continuar con suplementación de vitamina D3.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-3 py-3 border-t border-border">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                      <User size={14} />
                    </div>
                    <span className="text-[11px] font-bold text-muted">Dr. Mateo Estudi</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}

        </div>
      </div>
    </div>
  );
};

export default HistorialPaciente;
