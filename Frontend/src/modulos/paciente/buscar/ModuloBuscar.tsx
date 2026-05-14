"use client";

import { motion } from "framer-motion";
import { 
  Search, MapPin, Star, ChevronRight, 
  Filter, Navigation, Stethoscope, Pill 
} from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
const MapaAura = dynamic(() => import("@/componentes/MapaAura").then(mod => mod.MapaAura), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-surface animate-pulse" />
});

const resultadosDemo = [
  { id: 1, nombre: "Clínica Oasis Central", tipo: "Clínica", distancia: "0.8 km", calif: 4.9, img: "🏥", pos: [12.1328, -86.2504] as [number, number] },
  { id: 2, nombre: "Dr. Roberto Gómez", tipo: "Cardiólogo", distancia: "1.2 km", calif: 4.8, img: "👨‍⚕️", pos: [12.1400, -86.2600] as [number, number] },
  { id: 3, nombre: "Farmacia Oasis Metrocentro", tipo: "Farmacia", distancia: "1.5 km", calif: 4.7, img: "💊", pos: [12.1250, -86.2400] as [number, number] },
];

export function ModuloBuscar() {
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-8 animate-aura">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-outfit font-bold">Explorar Red</h2>
          <p className="text-xs text-muted-foreground font-light">Encuentra especialistas y farmacias cerca de ti.</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o especialidad..."
            className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-light transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-muted-foreground hover:text-white transition-colors tap-active">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Categorías Rápidas Premium */}
      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
        {[
          { label: "Doctores", icon: Stethoscope, color: "bg-blue-500/10 text-blue-400" },
          { label: "Farmacias", icon: Pill, color: "bg-purple-500/10 text-purple-400" },
          { label: "Clínicas", icon: Navigation, color: "bg-emerald-500/10 text-emerald-400" },
          { label: "Laboratorio", icon: Star, color: "bg-orange-500/10 text-orange-400" },
        ].map((cat, i) => (
          <button key={i} className="flex flex-col items-center gap-3 shrink-0 tap-active group">
            <div className={`w-16 h-16 rounded-[2rem] ${cat.color} border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <cat.icon className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Mapa Real Aura */}
      <div className="h-72 w-full rounded-[2.5rem] overflow-hidden border border-white/10 relative aura-shadow">
        <MapaAura 
          markers={resultadosDemo.map(r => ({ id: r.id, position: r.pos, title: r.nombre, description: r.tipo }))} 
        />
        <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" /> Localizando Red Oasis...
        </div>
      </div>

      {/* Resultados */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Recomendados para ti</h3>
        
        {resultadosDemo.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="aura-card p-5 flex items-center gap-5 tap-active border-white/5"
          >
            <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-3xl border border-white/5">
              {item.img}
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold leading-tight">{item.nombre}</h4>
              <p className="text-[11px] text-muted-foreground mt-1">{item.tipo} • {item.distancia}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                <span className="text-[11px] font-bold">{item.calif}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
