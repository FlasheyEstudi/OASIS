"use client";

import { motion } from "framer-motion";
import { Users, Plus, ChevronLeft, User, Heart, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

const dependientes = [
  { id: 1, nombre: "María Pérez", parentesco: "Esposa", salud: "Buena", edad: "32 años" },
  { id: 2, nombre: "Juanito Pérez", parentesco: "Hijo", salud: "Control de Niño Sano", edad: "6 años" },
];

export default function PaginaGrupoFamiliar() {
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
        <h2 className="text-2xl font-outfit font-bold">Grupo Familiar</h2>
      </div>

      <div className="p-6 bg-primary/5 border border-primary/10 rounded-[2rem] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">3</div>
          <div>
            <p className="text-sm font-bold">Espacios Disponibles</p>
            <p className="text-[10px] text-muted-foreground font-light">Puedes añadir hasta 5 dependientes.</p>
          </div>
        </div>
        <button className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black shadow-lg shadow-primary/20">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">Dependientes Activos</h3>
        
        {dependientes.map((dep, i) => (
          <motion.div
            key={dep.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-5 rounded-3xl flex items-center gap-4 border-white/5 hover:bg-white/5 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">
              <User className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold truncate">{dep.nombre}</h4>
              <p className="text-[10px] text-muted-foreground">{dep.parentesco} • {dep.edad}</p>
              <div className="flex items-center gap-2 mt-1">
                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                <span className="text-[10px] font-bold text-primary">{dep.salud}</span>
              </div>
            </div>
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold hover:bg-white/10">
              Ver Perfil
            </button>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel p-6 rounded-[2.5rem] border-white/5">
        <h4 className="text-xs font-bold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" /> Beneficios Familiares
        </h4>
        <ul className="space-y-3">
          {[
            "Citas simultáneas para el grupo",
            "Descuento del 15% en pediatría",
            "Historial médico compartido",
          ].map((ben, i) => (
            <li key={i} className="flex items-center gap-3 text-[10px] text-muted-foreground font-light">
              <div className="w-1 h-1 bg-blue-400 rounded-full" /> {ben}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
