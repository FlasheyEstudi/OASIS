"use client";

import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, Clock, ChevronLeft, 
  ChevronRight, MoreVertical, Plus, Filter,
  Phone, Video, MapPin, User
} from "lucide-react";
import { useAuthStore } from "@/almacenes/usoAuth";
import { useAgendaDoctor } from "@/hooks/doctor";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import Avatar from "@/componentes/ui/Avatar";
import CalendarioSimple from "@/componentes/compartidos/CalendarioSimple";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import { cn } from "@/lib/utils";

const AgendaDoctor = () => {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: citas, isLoading } = useAgendaDoctor(user?.id || "");

  const timeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  if (isLoading) return <SkeletonPage type="dashboard" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar - Calendar & Filters */}
      <div className="lg:col-span-1 space-y-8">
        <Reveal>
          <CalendarioSimple 
            selectedDate={selectedDate} 
            onDateSelect={setSelectedDate} 
          />
        </Reveal>

        <Reveal delay={0.2}>
          <Card className="p-6 space-y-6">
            <h4 className="font-display text-fluid-sm font-bold">Filtros</h4>
            <div className="space-y-3">
              {[
                { label: "Presencial", color: "bg-success" },
                { label: "Teleconsulta", color: "bg-info" },
                { label: "Urgencia", color: "bg-danger" }
              ].map((f) => (
                <label key={f.label} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="hidden" />
                  <div className="w-5 h-5 rounded-md border border-border flex items-center justify-center group-hover:border-accent transition-colors">
                    <div className="w-2.5 h-2.5 rounded-sm bg-transparent group-hover:bg-accent/20" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", f.color)} />
                    <span className="text-fluid-xs text-muted group-hover:text-text transition-colors">{f.label}</span>
                  </div>
                </label>
              ))}
            </div>
            <Button variant="secondary" fullWidth size="sm" icon={Plus}>Nueva Cita</Button>
          </Card>
        </Reveal>
      </div>

      {/* Main Agenda View */}
      <div className="lg:col-span-3 space-y-8">
        <Reveal delay={0.1}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-fluid-2xl font-light">
                {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest mt-1">
                {citas?.length || 0} Consultas programadas
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={ChevronLeft} size="sm" />
              <Button variant="secondary" icon={ChevronRight} size="sm" />
            </div>
          </div>
        </Reveal>

        <div className="space-y-1">
          {timeSlots.map((slot, i) => {
            const cita = citas?.find((c: any) => c.startTime === slot);
            return (
              <Reveal key={slot} delay={i * 0.05} direction="up">
                <div className="flex gap-6 group">
                  {/* Time Label */}
                  <div className="w-20 pt-4 text-right">
                    <span className="text-[10px] font-mono text-muted uppercase tracking-widest font-bold">
                      {slot}
                    </span>
                  </div>

                  {/* Slot Content */}
                  <div className={cn(
                    "flex-1 min-h-[100px] border-l-2 py-4 px-6 mb-2 transition-all duration-300",
                    cita 
                      ? (cita.type === 'teleconsult' ? "bg-info/5 border-info" : "bg-success/5 border-success")
                      : "border-border hover:bg-surface/30"
                  )}>
                    {cita ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <Avatar name={cita.patient.user.name} size="md" />
                          <div className="space-y-1">
                            <h4 className="text-fluid-sm font-bold">{cita.patient.user.name}</h4>
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-mono text-muted uppercase flex items-center gap-1">
                                {cita.type === 'teleconsult' ? <Video size={10} /> : <MapPin size={10} />}
                                {cita.type}
                              </span>
                              <Badge variant="glass" size="xs">Confirmada</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="secondary" size="sm">Ver Ficha</Button>
                          <Button variant="primary" size="sm" icon={MoreVertical} />
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center text-muted/20 italic text-[10px] uppercase tracking-[0.2em] font-bold">
                        Espacio disponible
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AgendaDoctor;
