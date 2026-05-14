"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, Package, MapPin, ChevronRight, 
  Clock, CheckCircle2, Pill, ShoppingBag,
  ChevronLeft, Navigation, Phone, MessageCircle
} from "lucide-react";
import { useState } from "react";
import { usePedidos } from "@/hooks/usePaciente";
import dynamic from "next/dynamic";
const MapaAura = dynamic(() => import("@/componentes/MapaAura").then(mod => mod.MapaAura), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-surface animate-pulse" />
});
import SkeletonPage from "@/componentes/ui/SkeletonPage";

export function ModuloPedidos() {
  const [pedidoActivo, setPedidoActivo] = useState<any>(null);

  // Sincronización con Backend
  const { data: pedidos, isLoading } = usePedidos();

  if (isLoading) return <SkeletonPage type="list" />;

  return (
    <div className="space-y-6 pb-24">
      <AnimatePresence mode="wait">
        {!pedidoActivo ? (
          <motion.div
            key="lista"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-outfit font-bold">Mis Pedidos</h2>

            {/* Tracking Destacado */}
            {pedidos?.[0] && (
              <motion.div 
                whileTap={{ scale: 0.98 }}
                onClick={() => setPedidoActivo(pedidos[0])}
                className="glass-panel p-6 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border-primary/20 relative overflow-hidden cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-bold uppercase tracking-widest rounded-md border border-primary/20">Sigue tu pedido</span>
                    <h3 className="text-xl font-outfit font-bold mt-2">{pedidos[0].status === 'en_camino' ? 'En camino...' : 'Preparando...'}</h3>
                    <p className="text-xs text-muted-foreground font-light">{pedidos[0].pharmacy?.name}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-black shadow-lg shadow-primary/20 animate-bounce">
                    <Truck className="w-6 h-6" />
                  </div>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                  <div className="w-2/3 h-full bg-primary" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Llega en 15 min</p>
                  <span className="text-primary text-[10px] font-bold flex items-center gap-1">Ver Mapa <ChevronRight className="w-3 h-3" /></span>
                </div>
              </motion.div>
            )}

            {/* Historial */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Historial de Compras</h3>
              {pedidos?.map((ped: any, i: number) => (
                <div
                  key={ped.id}
                  onClick={() => setPedidoActivo(ped)}
                  className="glass-panel p-4 rounded-3xl flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ped.status === 'en_camino' ? 'bg-primary/10 text-primary' : 'bg-white/5 text-muted-foreground'}`}>
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold">{ped.items?.[0]?.medication?.name || "Pedido Oasis"}</h4>
                    <p className="text-[10px] text-muted-foreground">{ped.pharmacy?.name}</p>
                  </div>
                  <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full ${ped.status === 'shipped' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'}`}>
                    {ped.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="tracking"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 h-full"
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setPedidoActivo(null)}
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center active:scale-90 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-outfit font-bold">Rastreo en Vivo</h2>
            </div>

            {/* Mapa con Leaflet */}
            <div className="h-80 md:h-[400px] w-full rounded-[2.5rem] overflow-hidden border border-white/5">
              <MapaAura 
                center={pedidoActivo.delivery?.currentLat ? [pedidoActivo.delivery.currentLat, pedidoActivo.delivery.currentLng] : [12.1328, -86.2504]}
                markers={[
                  { 
                    id: 'repartidor', 
                    position: pedidoActivo.delivery?.currentLat ? [pedidoActivo.delivery.currentLat, pedidoActivo.delivery.currentLng] : [12.1328, -86.2504], 
                    title: "Tu Repartidor", 
                    description: "Sigue el rastreo en tiempo real", 
                    type: 'courier' 
                  }
                ]}
              />
            </div>

            <div className="glass-panel p-6 rounded-[2.5rem] flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Truck className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold">Carlos Rodríguez</h4>
                <p className="text-[10px] text-muted-foreground">Repartidor Oasis Elite</p>
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(s => <CheckCircle2 key={s} className="w-3 h-3 text-primary" />)}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center"><Phone className="w-5 h-5" /></button>
                <button className="w-10 h-10 bg-white/5 text-muted-foreground rounded-xl flex items-center justify-center"><MessageCircle className="w-5 h-5" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
