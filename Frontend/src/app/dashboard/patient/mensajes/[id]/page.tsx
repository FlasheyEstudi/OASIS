"use client";

import { motion } from "framer-motion";
import { 
  Send, Phone, Video, MoreVertical, Paperclip, Mic
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function PaginaChatDetalle() {
  const { id } = useParams();
  const [mensaje, setMensaje] = useState("");

  const chatInfo = {
    nombre: id === "1" ? "Dr. Armando Casas" : "Farmacia Oasis Central",
    status: "En línea"
  };

  return (
    <div className="flex flex-col h-[calc(100vh-250px)] animate-aura">
      {/* Header del Chat */}
      <div className="flex items-center justify-between pb-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary font-bold border border-primary/20">
            {chatInfo.nombre.charAt(0)}
          </div>
          <div>
            <h4 className="text-base font-bold leading-none">{chatInfo.nombre}</h4>
            <p className="text-[10px] text-primary font-bold mt-1.5 uppercase tracking-widest">{chatInfo.status}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary transition-all"><Video className="w-5 h-5" /></button>
          <button className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary transition-all"><Phone className="w-5 h-5" /></button>
          <button className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-muted-foreground"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Burbujas de Chat */}
      <div className="flex-1 overflow-y-auto py-8 space-y-6 scrollbar-hide">
        <div className="flex justify-start">
          <div className="max-w-[80%] p-5 bg-white/5 border border-white/10 rounded-[2rem] rounded-tl-none">
            <p className="text-sm font-light leading-relaxed">Hola, ¿cómo sigues con el tratamiento para la hipertensión?</p>
            <span className="text-[8px] text-muted-foreground mt-2 block text-right">10:30 AM</span>
          </div>
        </div>
        
        <div className="flex justify-end">
          <div className="max-w-[80%] p-5 bg-primary text-black rounded-[2rem] rounded-tr-none shadow-lg shadow-primary/20">
            <p className="text-sm font-bold leading-relaxed">Mucho mejor, doctor. Las pastillas me han ayudado a dormir mejor.</p>
            <span className="text-[8px] opacity-60 mt-2 block text-right font-bold">10:32 AM</span>
          </div>
        </div>
      </div>

      {/* Input de Mensaje */}
      <div className="pt-6">
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-2 flex items-center gap-2 group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <button className="p-3 text-muted-foreground hover:text-primary"><Paperclip className="w-5 h-5" /></button>
          <input 
            type="text" 
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm font-light px-2"
          />
          <button className="p-3 text-muted-foreground hover:text-primary"><Mic className="w-5 h-5" /></button>
          <button className="w-12 h-12 bg-primary text-black rounded-full flex items-center justify-center shadow-lg shadow-primary/20 tap-active">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
