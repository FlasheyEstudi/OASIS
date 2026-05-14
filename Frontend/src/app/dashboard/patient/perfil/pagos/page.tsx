"use client";

import { motion } from "framer-motion";
import { CreditCard, Plus, ChevronLeft, Trash2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaginaMetodosPago() {
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
        <h2 className="text-2xl font-outfit font-bold">Métodos de Pago</h2>
      </div>

      <div className="space-y-4">
        {/* Tarjeta Principal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-[2.5rem] bg-gradient-to-br from-[#2c3e50] to-[#000000] border border-white/10 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <CreditCard className="w-32 h-32" />
          </div>
          
          <div className="flex justify-between items-start mb-12">
            <div className="w-12 h-8 bg-yellow-500/80 rounded-md shadow-inner" />
            <span className="text-xs font-bold tracking-widest text-white/40 italic uppercase">VISA</span>
          </div>

          <div className="space-y-4">
            <p className="text-xl font-mono tracking-[0.2em] text-white">**** **** **** 4421</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[8px] text-white/40 uppercase tracking-widest mb-1">Titular</p>
                <p className="text-xs font-bold text-white uppercase">JUAN PEREZ</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-white/40 uppercase tracking-widest mb-1">Exp</p>
                <p className="text-xs font-bold text-white">05/28</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <p className="text-[10px] text-muted-foreground font-light">Tus pagos están protegidos por encriptación de grado bancario AES-256.</p>
        </div>

        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mt-8">Otras Opciones</h3>
        
        <button className="w-full p-5 glass-panel rounded-3xl flex items-center justify-between border-dashed border-white/10 hover:border-primary/50 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-muted-foreground group-hover:text-primary">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold">Añadir Nueva Tarjeta</span>
          </div>
        </button>

        <button className="w-full p-5 glass-panel rounded-3xl flex items-center justify-between hover:bg-white/5 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <span className="font-bold text-lg">P</span>
            </div>
            <span className="text-sm font-bold">PayPal</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Configurado</span>
        </button>
      </div>
    </div>
  );
}
