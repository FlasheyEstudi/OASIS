"use client";

import { motion } from "framer-motion";
import { Shield, AlertTriangle, Activity, ChevronLeft, Plus, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaginaSaludAlergias() {
  const router = useRouter();

  return (
    <div className="space-y-6 pb-24">
    <div className="space-y-8 animate-aura">
      <div className="space-y-1">
        <h2 className="text-3xl font-outfit font-bold">Salud y Alergias</h2>
        <p className="text-xs text-muted-foreground font-light px-1">Información vital sincronizada en tiempo real.</p>
      </div>

      {/* Alerta Médica */}
      <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-red-500">Información Vital</h4>
          <p className="text-[10px] text-muted-foreground font-light leading-relaxed mt-1">
            Esta información será visible para los doctores en caso de emergencia. Mantenla siempre actualizada.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">Alergias Conocidas</h3>
        <div className="glass-panel p-4 rounded-3xl flex flex-wrap gap-2">
          {["Penicilina", "Lactosa", "Polen"].map((al, i) => (
            <span key={i} className="px-4 py-2 bg-white/5 border border-white/5 rounded-full text-xs font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" /> {al}
            </span>
          ))}
          <button className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Añadir
          </button>
        </div>

        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mt-6">Condiciones Crónicas</h3>
        <div className="glass-panel p-6 rounded-[2rem] space-y-4 border-white/5">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-bold">Hipertensión</p>
                <p className="text-[10px] text-muted-foreground">Diagnosticado en 2021</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-primary/20 text-primary text-[8px] font-bold rounded">CONTROLADO</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm font-bold">Asma Leve</p>
                <p className="text-[10px] text-muted-foreground">Uso estacional de inhalador</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-blue-400/20 text-blue-400 text-[8px] font-bold rounded">ESTABLE</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
