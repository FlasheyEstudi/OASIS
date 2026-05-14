"use client";

import { motion } from "framer-motion";
import { 
  Pill, Printer, Download, Clock, ShieldCheck
} from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function PaginaDetalleReceta() {
  const { id } = useParams();

  const descargar = () => toast.success("Iniciando descarga de Receta Digital...");

  return (
    <div className="space-y-8 animate-aura">
      <div className="space-y-1">
        <h2 className="text-3xl font-outfit font-bold">Detalle de Receta</h2>
        <p className="text-xs text-muted-foreground font-light px-1">Referencia: {id} • Verificado por Oasis</p>
      </div>

      {/* Receta Card "Estilo Papel" */}
      <div className="bg-white text-black p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <ShieldCheck className="w-24 h-24" />
        </div>
        
        <div className="flex justify-between items-start mb-10 border-b border-black/10 pb-8">
          <div>
            <h3 className="text-2xl font-outfit font-bold uppercase tracking-tighter">Oasis Aura</h3>
            <p className="text-[10px] font-bold text-muted-foreground">CERTIFICADO MÉDICO DIGITAL</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold">10 MAYO 2024</p>
            <p className="text-[10px]">#8821-XP</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center">
              <Pill className="w-10 h-10 text-black" />
            </div>
            <div>
              <h4 className="text-xl font-bold">Amoxicilina 500mg</h4>
              <p className="text-sm">Tomar cada 8 horas por 7 días.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-black/10">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-muted-foreground uppercase">Doctor</p>
              <p className="text-sm font-bold">Dr. Armando Casas</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-muted-foreground uppercase">Paciente</p>
              <p className="text-sm font-bold">Demo Patient</p>
            </div>
          </div>
        </div>

        {/* QR Code Simulado */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="w-32 h-32 bg-black rounded-3xl p-4">
            <div className="w-full h-full bg-white rounded-lg flex items-center justify-center font-bold text-black text-xs text-center p-2">
              AURA QR VALID
            </div>
          </div>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Escanea en Farmacia</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={descargar}
          className="flex-1 py-5 bg-primary text-black font-bold rounded-[2rem] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 tap-active active:scale-95 transition-all"
        >
          <Download className="w-5 h-5" /> Descargar PDF
        </button>
        <button className="w-16 h-16 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center tap-active active:scale-90 transition-all">
          <Printer className="w-6 h-6 text-muted-foreground" />
        </button>
      </div>

      <div className="p-6 bg-white/5 rounded-[2.5rem] flex items-center gap-4">
        <Clock className="w-6 h-6 text-primary" />
        <p className="text-[10px] text-muted-foreground font-light italic">Esta receta expira en 48 horas.</p>
      </div>
    </div>
  );
}
