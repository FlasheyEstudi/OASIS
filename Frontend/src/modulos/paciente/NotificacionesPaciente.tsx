"use client";

import React from "react";
import { 
  Bell, Check, MessageSquare, 
  Calendar, Pill, AlertCircle, 
  Clock, Trash2, CheckCircle2
} from "lucide-react";
import { useNotificaciones, useMarcarLeida } from "@/hooks/usePaciente";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import EmptyState from "@/componentes/ui/EmptyState";
import { cn } from "@/lib/utils";

const NotificacionesPaciente = () => {
  const { data: notificaciones, isLoading } = useNotificaciones();
  const { mutate: marcarLeida } = useMarcarLeida();

  if (isLoading) return <SkeletonPage type="list" />;

  const getIcon = (type: string) => {
    switch (type) {
      case "appointment": return { icon: Calendar, color: "text-accent", bg: "bg-accent/10" };
      case "prescription": return { icon: Pill, color: "text-success", bg: "bg-success/10" };
      case "message": return { icon: MessageSquare, color: "text-info", bg: "bg-info/10" };
      default: return { icon: Bell, color: "text-warning", bg: "bg-warning/10" };
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-fluid-2xl font-light">Notificaciones</h3>
        <Button variant="ghost" size="sm" iconLeft={CheckCircle2} className="text-accent">
          Marcar todas como leídas
        </Button>
      </div>

      <div className="space-y-4">
        {notificaciones?.length > 0 ? notificaciones.map((notif: any, idx: number) => {
          const config = getIcon(notif.type);
          return (
            <Reveal key={notif.id} delay={idx * 0.05}>
              <Card 
                className={cn(
                  "p-6 cursor-pointer group transition-all duration-300",
                  !notif.read ? "bg-accent/5 border-accent/20" : "bg-surface/30 opacity-70"
                )}
                onClick={() => !notif.read && marcarLeida(notif.id)}
              >
                <div className="flex gap-6 items-start">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", config.bg, config.color)}>
                    <config.icon size={24} />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-display text-fluid-lg font-light leading-tight">{notif.title}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-muted uppercase tracking-widest flex items-center gap-1">
                          <Clock size={10} /> Hace 5 min
                        </span>
                        {!notif.read && <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
                      </div>
                    </div>
                    <p className="text-fluid-sm text-muted font-light leading-relaxed">
                      {notif.description || notif.message}
                    </p>
                  </div>

                  <button className="opacity-0 group-hover:opacity-100 p-2 text-muted hover:text-danger transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            </Reveal>
          );
        }) : (
          <EmptyState 
            icon={Bell} 
            title="Todo está en silencio" 
            description="No tienes notificaciones pendientes. Te avisaremos cuando ocurra algo importante."
          />
        )}
      </div>
    </div>
  );
};

export default NotificacionesPaciente;
