"use client";

import React, { useState } from "react";
import { 
  Users, Plus, Heart, Info, 
  Trash2, Edit3, ShieldAlert,
  AlertCircle, ChevronRight
} from "lucide-react";
import { useFamiliares, useAgregarFamiliar } from "@/hooks/usePaciente";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import Avatar from "@/componentes/ui/Avatar";
import Modal from "@/componentes/ui/Modal";
import Input from "@/componentes/ui/Input";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import { useToast } from "@/componentes/ui/Toast";

const FamiliaPaciente = () => {
  const { data: familia, isLoading } = useFamiliares();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { show } = useToast();

  if (isLoading) return <SkeletonPage type="grid" />;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-fluid-2xl font-light">Círculo de Cuidado</h3>
        <Button iconLeft={Plus} onClick={() => setIsModalOpen(true)}>Añadir Familiar</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {familia?.length > 0 ? familia.map((member: any, idx: number) => (
          <Reveal key={member.id} delay={idx * 0.1}>
            <Card className="group hover:border-accent/30 transition-all p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button className="p-2 hover:bg-surface rounded-full text-muted hover:text-text"><Edit3 size={16} /></button>
                <button className="p-2 hover:bg-danger/10 rounded-full text-muted hover:text-danger"><Trash2 size={16} /></button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar name={member.name} size="xl" className="border-2 border-accent/10" />
                  <div>
                    <h4 className="font-display text-fluid-lg font-light leading-tight">{member.name}</h4>
                    <Badge variant="glass" size="xs" className="mt-2">{member.relationship}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                  <div>
                    <p className="text-[9px] font-mono text-muted uppercase tracking-wider">Edad</p>
                    <p className="font-body font-bold text-fluid-sm">{member.age || "32"} años</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-muted uppercase tracking-wider">Tipo Sangre</p>
                    <p className="font-body font-bold text-fluid-sm text-accent">{member.bloodType || "A+"}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[9px] font-mono text-muted uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert size={10} className="text-danger" /> Alergias
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {member.allergies?.length > 0 ? member.allergies.map((a: any) => (
                      <Badge key={a} variant="danger" size="xs">{a}</Badge>
                    )) : (
                      <span className="text-[10px] text-muted italic">Ninguna reportada</span>
                    )}
                  </div>
                </div>

                {member.emergencyContact && (
                  <div className="p-4 bg-success/5 rounded-2xl border border-success/10 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success">
                      <Heart size={14} />
                    </div>
                    <p className="text-[10px] font-mono text-success uppercase tracking-widest font-bold">Contacto de Emergencia</p>
                  </div>
                )}
              </div>
            </Card>
          </Reveal>
        )) : (
          <div className="col-span-full py-20 text-center space-y-6 bg-surface/20 rounded-[40px] border border-dashed border-border">
            <div className="w-20 h-20 rounded-full bg-surface mx-auto flex items-center justify-center text-muted/30">
              <Users size={40} />
            </div>
            <div>
              <p className="font-display text-fluid-xl font-light">Gestiona la salud de los tuyos</p>
              <p className="text-fluid-xs text-muted max-w-xs mx-auto mt-2">
                Agrega a tus familiares para gestionar sus citas y recetas desde un solo perfil centralizado.
              </p>
            </div>
            <Button variant="secondary" iconLeft={Plus} onClick={() => setIsModalOpen(true)}>Empezar ahora</Button>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Familiar">
        <div className="space-y-6 py-4">
          <Input label="Nombre Completo" placeholder="Ej. Ana García" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Relación" placeholder="Ej. Hija" />
            <Input label="Edad" placeholder="Ej. 12" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tipo Sangre" placeholder="Ej. O+" />
            <Input label="Género" placeholder="Ej. Femenino" />
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="secondary" fullWidth onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button fullWidth className="shadow-glow-accent">Guardar Familiar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FamiliaPaciente;
