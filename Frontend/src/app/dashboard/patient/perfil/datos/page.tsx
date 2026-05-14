"use client";

import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Save, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaginaDatosPersonales() {
  const router = useRouter();

  return (
    <div className="space-y-6 pb-24">
    <div className="space-y-8 animate-aura">
      <div className="space-y-1">
        <h2 className="text-3xl font-outfit font-bold">Datos Personales</h2>
        <p className="text-xs text-muted-foreground font-light px-1">Actualiza tu información de contacto Aura.</p>
      </div>

      <div className="glass-panel p-6 rounded-[2rem] space-y-6 border-white/5">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Nombre Completo</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              defaultValue="Juan Pérez"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-primary/30 text-sm font-light transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Correo Electrónico</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="email" 
              defaultValue="juan.perez@email.com"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-primary/30 text-sm font-light transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Teléfono</label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="tel" 
              defaultValue="+505 8888 8888"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-primary/30 text-sm font-light transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Dirección de Residencia</label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              defaultValue="Managua, Nicaragua"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-primary/30 text-sm font-light transition-all"
            />
          </div>
        </div>

        <button className="w-full py-4 bg-primary text-black font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all mt-4">
          <Save className="w-5 h-5" /> Guardar Cambios
        </button>
      </div>
      </div>
    </div>
  );
}
