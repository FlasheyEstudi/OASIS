"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Send, Phone, Video, 
  MoreVertical, CheckCheck, User, Stethoscope,
  ChevronLeft, Paperclip, Mic, Smile
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export function ModuloMensajes() {
  const [chatActivo, setChatActivo] = useState<any>(null);
  const [mensaje, setMensaje] = useState("");

  // Sincronización con Backend
  const { data: chats, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 600));
      return [
        { id: 1, nombre: "Dr. Armando Casas", last: "Tu receta ya está lista.", time: "10:30 AM", unread: 1, online: true, img: "👨‍⚕️", role: "Médico" },
        { id: 2, nombre: "Farmacia Oasis Metro", last: "El delivery va en camino.", time: "Ayer", unread: 0, online: false, img: "💊", role: "Soporte" },
        { id: 3, nombre: "Soporte Oasis", last: "¿En qué podemos ayudarte?", time: "Lunes", unread: 0, online: true, img: "🎧", role: "Aura Bot" },
      ];
    }
  });

  return (
    <div className="h-full flex flex-col pb-24">
      <AnimatePresence mode="wait">
        {!chatActivo ? (
          <motion.div
            key="lista"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 flex-1 flex flex-col"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-outfit font-bold">Mensajes</h2>
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-muted-foreground">
                <MoreVertical className="w-5 h-5" />
              </div>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar conversaciones..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-xs font-light focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {chats?.map((chat, i) => (
                <div
                  key={chat.id}
                  onClick={() => setChatActivo(chat)}
                  className="glass-panel p-4 rounded-3xl flex items-center gap-4 hover:bg-white/5 active:scale-[0.98] transition-all cursor-pointer group"
                >
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                      {chat.img}
                    </div>
                    {chat.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary border-4 border-background rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-bold truncate">{chat.nombre}</h4>
                      <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate font-light flex items-center gap-1">
                      {chat.unread === 0 && <CheckCheck className="w-3 h-3 text-primary" />}
                      {chat.last}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed inset-0 z-50 bg-background flex flex-col md:relative md:inset-auto md:h-[600px] md:bg-transparent"
          >
            {/* Header del Chat */}
            <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-background/80 backdrop-blur-xl">
              <button 
                onClick={() => setChatActivo(null)}
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center active:scale-90 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl">{chatActivo.img}</div>
                {chatActivo.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-background rounded-full" />}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold">{chatActivo.nombre}</h4>
                <p className="text-[10px] text-primary uppercase font-bold tracking-widest">{chatActivo.role}</p>
              </div>
              <div className="flex gap-2">
                <button className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-muted-foreground"><Phone className="w-4 h-4" /></button>
                <button className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-muted-foreground"><Video className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Area de Mensajes */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div className="flex justify-start">
                <div className="max-w-[80%] p-4 glass-panel rounded-2xl rounded-tl-none text-sm font-light leading-relaxed">
                  Hola, he revisado tus últimos exámenes. Todo se ve excelente en el sistema Aura.
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[80%] p-4 bg-primary text-black rounded-2xl rounded-tr-none text-sm font-bold shadow-lg shadow-primary/10">
                  ¡Excelente! Muchas gracias Doctor. ¿Cuándo puedo pasar por mi receta?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[80%] p-4 glass-panel rounded-2xl rounded-tl-none text-sm font-light leading-relaxed">
                  Ya la he enviado a tu sección de Recetas. Puedes descargarla ahí mismo.
                </div>
              </div>
            </div>

            {/* Input del Chat */}
            <div className="p-6 bg-background/80 backdrop-blur-xl border-t border-white/5">
              <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-3xl p-2 pl-4">
                <button className="text-muted-foreground hover:text-primary"><Smile className="w-5 h-5" /></button>
                <input 
                  type="text" 
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm font-light"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                />
                <button className="text-muted-foreground hover:text-primary"><Paperclip className="w-5 h-5" /></button>
                <button className="w-10 h-10 bg-primary text-black rounded-2xl flex items-center justify-center active:scale-95 transition-all">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
