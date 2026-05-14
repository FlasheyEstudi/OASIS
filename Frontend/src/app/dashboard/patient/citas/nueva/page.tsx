"use client";

import { motion } from "framer-motion";
import { 
  Stethoscope, Calendar, Clock, MapPin, CheckCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PaginaNuevaCita() {
  const router = useRouter();

  const confirmar = () => {
    toast.success("Reserva confirmada en el ecosistema Aura.");
    router.push("/dashboard/patient/citas");
  };

  return (
    <div className="space-y-10 animate-aura">
      <div className="space-y-1">
        <h2 className="text-3xl font-outfit font-bold">Agendar Cita</h2>
        <p className="text-xs text-muted-foreground font-light px-1">Selecciona la especialidad y el horario disponible.</p>
      </div>

      <div className="glass-panel p-8 rounded-[3rem] border-white/10 space-y-10">
        {/* Especialidades con Iconos */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] px-2">Especialidad</label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: "general", label: "General", icon: Stethoscope },
              { id: "dental", label: "Dental", icon: CheckCircle },
              { id: "cardio", label: "Cardio", icon: Clock },
              { id: "derma", label: "Derma", icon: MapPin },
            ].map((esp, i) => (
              <button 
                key={i} 
                onClick={() => router.push(`/dashboard/patient/buscar?cat=${esp.id}`)}
                className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all group tap-active"
              >
                <esp.icon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs font-bold">{esp.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Calendario Minimalista */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] px-2">Fecha</label>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {[15, 16, 17, 18, 19, 20].map((dia) => (
              <button key={dia} className={`w-20 h-24 shrink-0 rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all tap-active ${dia === 15 ? 'bg-primary text-black shadow-xl shadow-primary/30 scale-105' : 'bg-white/5 text-muted-foreground border border-white/5'}`}>
                <span className="text-[10px] uppercase font-bold tracking-widest">May</span>
                <span className="text-2xl font-bold">{dia}</span>
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={confirmar}
          className="w-full py-6 bg-primary text-black font-bold rounded-[2rem] shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 tap-active active:scale-95 transition-all mt-4 text-sm uppercase tracking-[0.1em]"
        >
          Confirmar Reserva Aura
        </button>
      </div>
    </div>
  );
}
