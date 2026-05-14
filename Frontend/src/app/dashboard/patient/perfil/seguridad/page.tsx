"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Key, Smartphone, ChevronLeft, Fingerprint } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaginaSeguridad() {
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
        <h2 className="text-2xl font-outfit font-bold">Seguridad</h2>
      </div>

      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-[2rem] border-white/5 flex items-center gap-5">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Protección Aura Activa</h4>
            <p className="text-[10px] text-muted-foreground font-light">Tu cuenta está protegida con los más altos estándares de seguridad.</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">Autenticación</h3>
          
          <div className="glass-panel rounded-[2rem] overflow-hidden border-white/5">
            {[
              { icon: Lock, label: "Cambiar Contraseña", status: "Último cambio: hace 3 meses" },
              { icon: Smartphone, label: "Verificación en 2 Pasos", status: "Activado", active: true },
              { icon: Fingerprint, label: "Biometría / FaceID", status: "Disponible en APK", active: true },
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center justify-between p-5 hover:bg-white/5 border-b border-white/5 last:border-0 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-muted-foreground">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground font-light">{item.status}</p>
                  </div>
                </div>
                {item.active ? (
                  <div className="w-10 h-5 bg-primary/20 rounded-full relative p-0.5">
                    <div className="w-4 h-4 bg-primary rounded-full absolute right-0.5" />
                  </div>
                ) : (
                  <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-[2rem] border-red-500/10 bg-red-500/5">
          <h3 className="text-xs font-bold text-red-500 mb-2">Zona de Peligro</h3>
          <p className="text-[10px] text-muted-foreground font-light mb-4">Si cierras tu cuenta, perderás todos tus puntos Aura y tu historial médico.</p>
          <button className="text-xs font-bold text-red-500 underline underline-offset-4">Eliminar mi cuenta definitivamente</button>
        </div>
      </div>
    </div>
  );
}
