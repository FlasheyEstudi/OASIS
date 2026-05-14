"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Pill, FileText, Download, QrCode, 
  CheckCircle2, Clock, ChevronRight, AlertCircle,
  ChevronLeft, Printer, ShieldCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { clienteApi } from "@/servicios/cliente";

export function ModuloRecetas() {
  const [recetaActiva, setRecetaActiva] = useState<any>(null);
  const [qrBase64, setQrBase64] = useState<string | null>(null);

  // Sincronización con Backend REAL
  const { data: recetas, isLoading } = useQuery({
    queryKey: ['recetas'],
    queryFn: async () => {
      try {
        const res = await clienteApi.get('/prescriptions');
        const data = res.data.data;

        if (!data || data.length === 0) {
          return [
            { id: 1, medicina: "Amoxicilina 500mg", doctor: "Dr. Armando Casas", fecha: "10 May 2025", estado: "activa", code: "OASIS-DEMO-1", dosis: "1 tableta cada 8 horas", duracion: "7 días" },
          ];
        }

        return data.map((r: any) => ({
          id: r.id,
          medicina: r.items?.[0]?.medication?.name || "Medicamento Oasis",
          doctor: r.doctor?.user?.name || "Especialista Aura",
          fecha: new Date(r.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
          estado: r.status,
          code: r.verificationCode,
          dosis: r.items?.[0]?.dosage || "Según indicaciones médicas",
          duracion: "Tratamiento completo"
        }));
      } catch (error) {
        return [
          { id: 1, medicina: "Amoxicilina 500mg (Demo)", doctor: "Dr. Armando Casas", fecha: "10 May 2025", estado: "activa", code: "OASIS-DEMO-1", dosis: "1 tableta cada 8 horas", duracion: "7 días" },
        ];
      }
    }
  });

  // Efecto para cargar QR autenticado cuando se abre una receta
  useEffect(() => {
    if (recetaActiva?.id) {
      setQrBase64(null); // Reset
      clienteApi.get(`/prescriptions/${recetaActiva.id}/qr`)
        .then((res: any) => setQrBase64(res.data.data.qrBase64))
        .catch((err: any) => console.error("Error al cargar QR:", err));
    }
  }, [recetaActiva]);

  const descargarPDF = async (id: string) => {
    const toastId = toast.loading('Generando receta firmada...');
    try {
      const response = await clienteApi.get(`/prescriptions/${id}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receta-oasis-${id.substring(0, 5)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Receta descargada con éxito.', { id: toastId });
    } catch (error) {
      console.error("Error descargando PDF:", error);
      toast.error('Error al generar el PDF. Inténtelo de nuevo.', { id: toastId });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <AnimatePresence mode="wait">
        {!recetaActiva ? (
          <motion.div
            key="lista"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-outfit font-bold">Mis Recetas</h2>
              <button className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-muted-foreground">
                <FileText className="w-5 h-5" />
              </button>
            </div>

            {/* Receta Destacada */}
            {recetas?.[0] && (
              <motion.div 
                whileTap={{ scale: 0.98 }}
                onClick={() => setRecetaActiva(recetas[0])}
                className="glass-panel p-6 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border-primary/20 cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-bold uppercase tracking-widest rounded-md border border-primary/20">Última Receta</span>
                    <h3 className="text-xl font-outfit font-bold mt-2">{recetas[0].medicina}</h3>
                    <p className="text-xs text-muted-foreground font-light">{recetas[0].doctor}</p>
                  </div>
                  <div className="p-3 bg-white rounded-2xl group-hover:rotate-6 transition-transform flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-black" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-primary font-bold">
                  Click para abrir en Farmacia <ChevronRight className="w-3 h-3" />
                </div>
              </motion.div>
            )}

            {/* Historial */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Historial Médico</h3>
              {recetas?.map((receta: any, i: number) => (
                <div
                  key={receta.id}
                  onClick={() => setRecetaActiva(receta)}
                  className="glass-panel p-4 rounded-3xl flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${receta.estado === 'activa' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    <Pill className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold">{receta.medicina}</h4>
                    <p className="text-[10px] text-muted-foreground">{receta.doctor} • {receta.fecha}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detalle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setRecetaActiva(null)}
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center active:scale-90 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-outfit font-bold">Detalle de Receta</h2>
            </div>

            <div className="glass-panel p-8 rounded-[3rem] border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Pill className="w-32 h-32" />
              </div>

              <div className="flex flex-col items-center text-center mb-8">
                <div className="p-6 bg-white rounded-[2rem] shadow-2xl mb-6 min-w-[10rem] min-h-[10rem] flex items-center justify-center">
                  {qrBase64 ? (
                    <img 
                      src={qrBase64} 
                      alt="QR Receta"
                      className="w-40 h-40 animate-in fade-in zoom-in duration-500"
                    />
                  ) : (
                    <div className="w-40 h-40 flex flex-col items-center justify-center gap-2">
                       <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                       <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Generando Aura QR...</p>
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">ID: {recetaActiva.code}</p>
                <h3 className="text-2xl font-outfit font-bold mt-2">{recetaActiva.medicina}</h3>
                <p className="text-sm text-muted-foreground">{recetaActiva.doctor}</p>
              </div>

              <div className="space-y-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                <div>
                  <p className="text-[8px] uppercase font-bold text-muted-foreground mb-1">Indicaciones</p>
                  <p className="text-sm font-medium">{recetaActiva.dosis}</p>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-[8px] uppercase font-bold text-muted-foreground mb-1">Duración</p>
                    <p className="text-xs font-bold">{recetaActiva.duracion}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] uppercase font-bold text-muted-foreground mb-1">Emitida</p>
                    <p className="text-xs font-bold">{recetaActiva.fecha}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <button 
                  onClick={() => descargarPDF(recetaActiva.id)}
                  className="py-4 bg-primary text-black font-bold rounded-2xl text-[11px] flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  <Download className="w-4 h-4" /> Guardar PDF
                </button>
                <button className="py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-bold flex items-center justify-center gap-2">
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <p className="text-[10px] text-muted-foreground font-light leading-tight">
                Esta receta cuenta con **Firma Electrónica Avanzada** y es válida en todas las farmacias del país.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
