"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, Search, Filter, Plus, 
  MapPin, Video, Clock, ChevronRight,
  User, Star, Info, LayoutGrid, List
} from "lucide-react";
import { useAuthStore } from "@/almacenes/usoAuth";
import apiClient from "@/lib/api-client";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import Input from "@/componentes/ui/Input";
import Modal from "@/componentes/ui/Modal";
import EmptyState from "@/componentes/ui/EmptyState";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import { useToast } from "@/componentes/ui/Toast";
import Avatar from "@/componentes/ui/Avatar";
import { cn } from "@/lib/utils";

const CitasPaciente = () => {
  const { show } = useToast();
  const [activeTab, setActiveTab] = useState("proximas");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        // Simulación de fetch a /api/v1/patient/appointments
        // const res = await apiClient.get(`/patient/appointments?status=${activeTab}`);
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
        
        // Mock data
        const mockApts = [
          {
            id: "apt_1",
            doctor: { name: "Mateo Estudi", specialty: "Cardiología", avatar: "" },
            date: "2026-05-14",
            time: "10:00 AM",
            status: "confirmed",
            type: "presencial",
            location: "Clínica Los Olivos, Managua"
          },
          {
            id: "apt_2",
            doctor: { name: "Elena Rivera", specialty: "Dermatología", avatar: "" },
            date: "2026-05-16",
            time: "02:30 PM",
            status: "confirmed",
            type: "teleconsult",
            location: "Online"
          }
        ];
        
        setAppointments(activeTab === "proximas" ? mockApts : []);
      } catch (error) {
        show({ type: "error", title: "Error", message: "No se pudieron cargar las citas." });
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [activeTab]);

  if (loading) return <SkeletonPage type="list" />;

  return (
    <div className="space-y-10">
      {/* --- HEADER & FILTERS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex bg-surface/50 p-1.5 rounded-2xl border border-border w-fit frost">
          {["proximas", "pasadas", "canceladas"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 rounded-xl text-fluid-xs font-bold transition-all duration-300 uppercase tracking-widest",
                activeTab === tab 
                  ? "bg-accent text-white shadow-glow" 
                  : "text-muted hover:text-text hover:bg-white/5"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <Button 
          icon={Plus} 
          size="lg" 
          onClick={() => setIsModalOpen(true)}
          className="shadow-glow-accent w-full md:w-auto"
        >
          Agendar Cita
        </Button>
      </div>

      {/* --- LISTA DE CITAS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {appointments.length > 0 ? (
          appointments.map((cita, idx) => (
            <Reveal key={cita.id} delay={idx * 0.1}>
              <Card className="group hover:border-accent/30 transition-all duration-500 overflow-hidden relative">
                <div className="flex gap-6">
                  <Avatar 
                    name={cita.doctor.name} 
                    size="xl" 
                    className="border-2 border-accent/10 rounded-[24px]" 
                  />
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-fluid-lg font-light">Dr. {cita.doctor.name}</h3>
                        <p className="text-accent text-[10px] font-mono uppercase tracking-[0.2em]">{cita.doctor.specialty}</p>
                      </div>
                      <Badge variant={cita.status === 'confirmed' ? 'success' : 'danger'} size="xs">
                        {cita.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-2 bg-surface rounded-xl border border-border/50">
                        <Calendar size={14} className="text-accent" />
                        <span className="text-[11px] font-bold">{cita.date}</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-surface rounded-xl border border-border/50">
                        <Clock size={14} className="text-accent" />
                        <span className="text-[11px] font-bold">{cita.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-accent/5 rounded-xl border border-accent/10">
                      {cita.type === 'teleconsult' ? (
                        <><Video size={16} className="text-info" /> <span className="text-[10px] font-medium text-muted uppercase tracking-widest">Teleconsulta Online</span></>
                      ) : (
                        <><MapPin size={16} className="text-accent" /> <span className="text-[10px] font-medium text-muted uppercase tracking-widest truncate">{cita.location}</span></>
                      )}
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                      <Button variant="secondary" size="md" fullWidth>Detalles</Button>
                      {activeTab === 'proximas' && (
                        <Button variant="glass" size="md" fullWidth className="text-danger hover:bg-danger/10">Cancelar</Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState 
              icon={Calendar} 
              title="Sin citas programadas" 
              description="No tienes consultas activas en esta categoría. ¿Deseas buscar un especialista ahora?"
              action={{ label: "Buscar Doctores", onClick: () => setIsModalOpen(true) }}
            />
          </div>
        )}
      </div>

      {/* --- MODAL AGENDAR --- */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Agendar Nueva Cita"
      >
        <div className="space-y-8 py-2">
          <div className="flex items-center gap-4 p-4 bg-info/5 rounded-2xl border border-info/10 text-info">
            <Info size={24} className="shrink-0" />
            <p className="text-fluid-xs font-medium leading-relaxed">
              Selecciona el tipo de especialista y el horario. La confirmación es inmediata y se enviará a tu correo.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input label="Especialidad" placeholder="Ej. Cardiología" icon={Search} />
            <Input label="Modalidad" placeholder="Presencial / Online" icon={Video} />
          </div>

          <div className="p-12 border-2 border-dashed border-border rounded-[32px] flex flex-col items-center text-center bg-surface/10">
            <Calendar size={48} className="text-muted/20 mb-4" />
            <p className="text-muted text-fluid-xs font-mono uppercase tracking-widest">Selecciona un doctor para continuar</p>
          </div>

          <div className="flex gap-4">
            <Button variant="secondary" fullWidth onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button fullWidth className="shadow-glow-accent">Continuar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CitasPaciente;
