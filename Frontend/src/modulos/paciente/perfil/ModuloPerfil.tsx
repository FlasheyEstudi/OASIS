"use client";

import { motion } from "framer-motion";
import { 
  User, Settings, CreditCard, Shield, 
  Users, LogOut, Bell, ChevronRight, Award 
} from "lucide-react";
import { useAuthStore } from "@/almacenes/usoAuth";
import { useRouter } from "next/navigation";

export function ModuloPerfil() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  return (
    <div className="space-y-8 pb-24">
      {/* Encabezado de Perfil */}
      <div className="flex flex-col items-center pt-6">
        <div className="relative">
          <div className="w-24 h-24 bg-primary/20 rounded-full border-4 border-white/5 flex items-center justify-center text-4xl font-bold text-primary">
            {user?.name?.charAt(0)}
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full border-4 border-background flex items-center justify-center">
            <Award className="w-4 h-4 text-black" />
          </div>
        </div>
        <h3 className="text-2xl font-outfit font-bold mt-4">{user?.name}</h3>
        <p className="text-sm text-muted-foreground font-light">{user?.email}</p>
        <span className="mt-2 px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-primary border border-primary/20 tracking-widest uppercase">Paciente Diamante</span>
      </div>

      {/* Secciones de Configuración */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-2">Configuración Personal</h4>
        
        <div className="glass-panel rounded-[2rem] overflow-hidden border-white/5">
          {[
            { id: 'datos', icon: User, label: "Datos Personales", desc: "Nombre, RUT, Teléfono" },
            { id: 'salud', icon: Shield, label: "Salud y Alergias", desc: "Información médica vital" },
            { id: 'familia', icon: Users, label: "Grupo Familiar", desc: "3 dependientes activos" },
            { id: 'pagos', icon: CreditCard, label: "Métodos de Pago", desc: "Tarjeta terminada en 4421" },
          ].map((item, i) => (
            <button 
              key={i} 
              onClick={() => router.push(`/dashboard/patient/perfil/${item.id}`)}
              className="w-full flex items-center gap-4 p-5 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-2 mt-8">Preferencias App</h4>
        
        <div className="glass-panel rounded-[2rem] overflow-hidden border-white/5">
          {[
            { id: 'notificaciones', icon: Bell, label: "Notificaciones", desc: "Push, Email, WhatsApp" },
            { id: 'seguridad', icon: Settings, label: "Seguridad", desc: "Contraseña y 2FA" },
          ].map((item, i) => (
            <button 
              key={i} 
              onClick={() => router.push(`/dashboard/patient/perfil/${item.id}`)}
              className="w-full flex items-center gap-4 p-5 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        <button 
          onClick={logout}
          className="w-full mt-6 p-5 glass-panel border-red-500/20 text-red-500 rounded-[2rem] flex items-center justify-center gap-3 font-bold text-sm hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
