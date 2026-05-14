"use client";

import { motion } from "framer-motion";
import { 
  MessageSquare, ChevronRight, Search, Plus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export default function PaginaListaMensajes() {
  const router = useRouter();

  const { data: chats, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 800));
      return [
        { id: 1, nombre: "Dr. Armando Casas", last: "Hola, ¿cómo sigues con el tratamiento?", time: "10:30 AM", unread: 2, online: true },
        { id: 2, nombre: "Farmacia Oasis Central", last: "Tu pedido está listo para retiro.", time: "Ayer", unread: 0, online: false },
      ];
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-outfit font-bold">Mensajes</h2>
          <p className="text-xs text-muted-foreground font-light px-1">Consultas directas con tu equipo médico.</p>
        </div>
        <button className="w-14 h-14 bg-primary text-black rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 tap-active active:scale-90 transition-all">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Buscador Minimalista */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
        <input 
          type="text" 
          placeholder="Buscar conversación..."
          className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-light"
        />
      </div>

      {/* Lista de Chats */}
      <div className="space-y-3">
        {chats?.map((chat, i) => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => router.push(`/dashboard/patient/mensajes/${chat.id}`)}
            className="glass-panel p-5 rounded-3xl border-white/5 hover:bg-white/5 transition-all cursor-pointer flex items-center gap-5 group"
          >
            <div className="relative">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-2xl font-bold text-primary">
                {chat.nombre.charAt(0)}
              </div>
              {chat.online && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-4 border-black" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-base font-bold truncate">{chat.nombre}</h4>
                <span className="text-[10px] text-muted-foreground">{chat.time}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate font-light">{chat.last}</p>
            </div>

            {chat.unread > 0 && (
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-black shadow-lg shadow-primary/20">
                {chat.unread}
              </div>
            )}
            <ChevronRight className="w-5 h-5 text-muted-foreground/20 group-hover:text-primary transition-colors" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
