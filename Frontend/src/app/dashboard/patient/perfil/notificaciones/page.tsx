"use client";

import { motion } from "framer-motion";
import { Bell, ChevronLeft, Settings, MessageSquare, Pill, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

const notificaciones = [
  { id: 1, tipo: 'cita', titulo: "Recordatorio de Cita", desc: "Mañana tienes consulta con el Dr. Armando a las 10:30 AM", time: "Hace 1 hora", icon: Calendar, color: "text-blue-400", bg: "bg-blue-400/10" },
  { id: 2, tipo: 'pedido', titulo: "Pedido en camino", desc: "Tu pedido ORD-9921 ha salido de la farmacia.", time: "Hace 3 horas", icon: Pill, color: "text-primary", bg: "bg-primary/10" },
];

export default function PaginaNotificaciones() {
  const router = useRouter();

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center active:scale-90 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-outfit font-bold">Notificaciones</h2>
      </div>

      <div className="space-y-4">
        {notificaciones.map((not, i) => (
          <motion.div
            key={not.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-5 rounded-3xl flex items-start gap-4 border-white/5"
          >
            <div className={`w-12 h-12 ${not.bg} rounded-2xl flex items-center justify-center shrink-0`}>
              <not.icon className={`w-6 h-6 ${not.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-bold truncate">{not.titulo}</h4>
                <span className="text-[8px] text-muted-foreground uppercase font-bold">{not.time}</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-light leading-relaxed">
                {not.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-6 glass-panel rounded-[2.5rem] border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <p className="text-xs font-bold">Configurar Alertas</p>
        </div>
        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold">
          Gestionar
        </button>
      </div>
    </div>
  );
}
