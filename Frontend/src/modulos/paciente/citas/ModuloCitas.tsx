"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Clock, MapPin, ChevronRight, 
  Plus, Search, Filter, Stethoscope, Loader2,
  ChevronLeft, X, CheckCircle, AlertCircle
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/almacenes/usoAuth";
import { toast } from "sonner";

export function ModuloCitas() {
  const [view, setView] = useState<"list" | "create">("list");
  const [filtro, setFiltro] = useState("proximas");
  const user = useAuthStore((state) => state.user);

  const { data: citas, isLoading } = useQuery({
    queryKey: ['citas', user?.id],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 1000));
      return [
        { id: 1, doctor: "Dr. Armando Casas", especialidad: "Medicina Interna", fecha: "15 Mayo", hora: "10:30 AM", estado: "pendiente", clinic: "Oasis Central" },
        { id: 2, doctor: "Dra. Elena Nito", especialidad: "Dermatología", fecha: "22 Mayo", hora: "02:00 PM", estado: "confirmada", clinic: "Sucursal Metrocentro" },
      ];
    }
  });

  const agendarCita = () => {
    toast.success("Cita agendada correctamente en el sistema Aura.");
    setView("list");
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">Sincronizando Citas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-aura">
      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-outfit font-bold">Gestión de Salud</h3>
                <p className="text-xs text-muted-foreground font-light">Tienes 2 citas programadas para este mes.</p>
              </div>
              <button 
                onClick={() => setView("create")}
                className="w-14 h-14 bg-primary text-black rounded-3xl flex items-center justify-center shadow-lg shadow-primary/20 tap-active transition-transform"
              >
                <Plus className="w-7 h-7" />
              </button>
            </div>

            {/* Filtros Premium */}
            <div className="flex gap-2 p-1.5 bg-white/5 rounded-[1.5rem] border border-white/5">
              {["proximas", "pasadas"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-all ${filtro === f ? "bg-primary text-black aura-shadow" : "text-muted-foreground hover:bg-white/5"}`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Lista de Citas */}
            <div className="grid grid-cols-1 gap-4">
              {citas?.map((cita, i) => (
                <motion.div
                  key={cita.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="aura-card group border-white/5"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${cita.estado === 'confirmada' ? 'bg-primary' : 'bg-secondary'}`} />
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Stethoscope className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-bold leading-tight">{cita.doctor}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{cita.especialidad}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{cita.fecha}</p>
                      <p className="text-[10px] text-muted-foreground font-light">{cita.hora}</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-light">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> {cita.clinic}
                    </div>
                    <button className="text-primary text-[11px] font-bold flex items-center gap-1 tap-active">
                      Ver Detalles <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Tip Aura */}
            <div className="p-6 bg-primary/5 border border-primary/10 rounded-[2rem] flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-primary shrink-0" />
              <p className="text-[11px] text-muted-foreground font-light leading-relaxed">
                Recuerda llegar 15 minutos antes de tu cita para el pre-chequeo biométrico en la Clínica Oasis.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setView("list")} className="w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center tap-active">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-outfit font-bold">Nueva Cita Aura</h2>
            </div>

            <div className="aura-card space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Especialidad</label>
                <div className="grid grid-cols-2 gap-3">
                  {["General", "Dental", "Cardio", "Derma"].map((esp, i) => (
                    <button key={i} className="p-5 bg-white/5 border border-white/5 rounded-3xl text-xs font-bold hover:border-primary/50 hover:bg-primary/5 transition-all tap-active">
                      {esp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Fecha Disponible</label>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {[15, 16, 17, 18, 19].map((dia) => (
                    <button key={dia} className={`w-16 h-20 shrink-0 rounded-3xl flex flex-col items-center justify-center gap-1.5 transition-all tap-active ${dia === 15 ? 'bg-primary text-black aura-shadow' : 'bg-white/5 text-muted-foreground border border-white/5'}`}>
                      <span className="text-[9px] uppercase font-bold">May</span>
                      <span className="text-xl font-bold">{dia}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={agendarCita}
                className="w-full py-5 bg-primary text-black font-bold rounded-3xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 tap-active mt-4 text-sm"
              >
                Confirmar Reserva
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
