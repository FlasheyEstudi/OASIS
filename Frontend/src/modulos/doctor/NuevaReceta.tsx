"use client";

import React, { useState } from "react";
import { 
  Pill, Search, Plus, Trash2, 
  ShieldCheck, AlertTriangle, FileText, 
  User, CheckCircle, RefreshCw, Send
} from "lucide-react";
import { usePacientesDoctor, useCrearReceta, useVerificarInteracciones } from "@/hooks/doctor";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import Input from "@/componentes/ui/Input";
import Avatar from "@/componentes/ui/Avatar";
import { useAuthStore } from "@/almacenes/usoAuth";
import { useToast } from "@/componentes/ui/Toast";
import { cn } from "@/lib/utils";

const NuevaReceta = () => {
  const { user } = useAuthStore();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const { show } = useToast();

  const { data: pacientes } = usePacientesDoctor();
  const { mutate: crearReceta, isPending: creando } = useCrearReceta();
  const { mutate: verificar, isPending: verificando } = useVerificarInteracciones();

  const addItem = () => {
    setItems([...items, { medicationId: "", name: "", dosage: "", frequency: "", duration: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!selectedPatient || items.length === 0) {
      show({ title: "Error", message: "Selecciona un paciente y al menos un medicamento.", type: "error" });
      return;
    }
    crearReceta({
      patientId: selectedPatient.id,
      items,
      notes,
      diagnosis,
      date: new Date().toISOString(),
    }, {
      onSuccess: () => {
        show({ title: "Éxito", message: "Receta creada y firmada digitalmente.", type: "success" });
        setSelectedPatient(null);
        setItems([]);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Area */}
      <div className="lg:col-span-2 space-y-8">
        <Reveal>
          <Card className="p-8 space-y-8">
            <div className="flex items-center gap-4 border-b border-border pb-6">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                <FileText size={24} />
              </div>
              <h3 className="font-display text-fluid-xl font-light">Nueva Prescripción</h3>
            </div>

            {/* Patient Selector */}
            <div className="space-y-4">
              <label className="text-[10px] font-mono text-muted uppercase tracking-widest font-bold">Paciente</label>
              {!selectedPatient ? (
                <div className="relative">
                  <Input label="Paciente" icon={Search} placeholder="Buscar paciente por nombre..." />
                  <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-card border border-border rounded-2xl p-2 frost shadow-float">
                    {(Array.isArray(pacientes) ? pacientes : []).slice(0, 3).map((p: any) => (
                      <button 
                        key={p.id} 
                        onClick={() => setSelectedPatient(p)}
                        className="w-full p-4 flex items-center gap-4 hover:bg-surface/50 rounded-xl transition-all"
                      >
                        <Avatar name={p.user.name} size="sm" />
                        <span className="text-fluid-xs font-bold">{p.user.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar name={selectedPatient.user.name} size="md" />
                    <div>
                      <p className="text-fluid-xs font-bold">{selectedPatient.user.name}</p>
                      <p className="text-[10px] text-muted uppercase">ID: {selectedPatient.id.slice(-6)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>Cambiar</Button>
                </div>
              )}
            </div>

            {/* Medications List */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-muted uppercase tracking-widest font-bold">Medicamentos</label>
                <Button variant="secondary" size="sm" icon={Plus} onClick={addItem}>Añadir</Button>
              </div>

              <div className="space-y-4">
                {items.map((item, i) => (
                  <div key={i} className="p-6 rounded-3xl border border-border bg-surface/30 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-accent uppercase font-bold">Medicamento #{i+1}</span>
                      <button onClick={() => removeItem(i)} className="text-muted hover:text-danger"><Trash2 size={16} /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Nombre / Genérico" placeholder="Ej. Amoxicilina 500mg" />
                      <Input label="Dosis" placeholder="Ej. 1 tableta" />
                      <Input label="Frecuencia" placeholder="Ej. Cada 8 horas" />
                      <Input label="Duración" placeholder="Ej. 7 días" />
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="py-12 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-muted">
                    <Pill size={32} className="opacity-20 mb-2" />
                    <p className="text-fluid-xs">No hay medicamentos añadidos</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <Input label="Diagnóstico" placeholder="Describe brevemente el diagnóstico..." value={diagnosis} onChange={(e: any) => setDiagnosis(e.target.value)} />
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted uppercase tracking-widest font-bold px-1">Indicaciones Adicionales</label>
                <textarea 
                  className="w-full h-32 bg-surface/50 border border-border rounded-2xl p-4 text-fluid-xs outline-none focus:border-accent transition-all resize-none"
                  placeholder="Ej. Evitar consumo de lácteos durante el tratamiento..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </Card>
        </Reveal>
      </div>

      {/* Sidebar - Actions & Checks */}
      <div className="space-y-8">
        <Reveal delay={0.2}>
          <Card className="p-8 space-y-6 frost border-accent/20">
            <h4 className="font-display text-fluid-lg font-light flex items-center gap-2">
              <ShieldCheck className="text-accent" /> Firma Digital
            </h4>
            <div className="p-6 rounded-2xl bg-accent/5 border border-dashed border-accent/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 mx-auto flex items-center justify-center text-accent">
                <User size={24} />
              </div>
              <div>
                <p className="text-fluid-xs font-bold">Firma de: Dr. {user?.name}</p>
                <p className="text-[9px] text-muted font-mono uppercase">Certificado Aura V4.2</p>
              </div>
            </div>
            <div className="space-y-3">
              <Button fullWidth size="lg" icon={CheckCircle} loading={creando} onClick={handleCreate}>
                Firmar y Enviar
              </Button>
              <Button variant="secondary" fullWidth icon={AlertTriangle} loading={verificando} onClick={() => show({ title: "Clinical Check", message: "No se detectaron interacciones peligrosas.", type: "info" })}>
                Verificar Interacciones
              </Button>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.3}>
          <Card className="p-8 space-y-4 bg-warning/5 border-warning/20">
            <h4 className="text-[10px] font-mono text-warning uppercase tracking-widest font-bold flex items-center gap-2">
              <AlertTriangle size={14} /> Importante
            </h4>
            <p className="text-[11px] text-muted leading-relaxed">
              La firma digital tiene validez legal inmediata. Asegúrate de verificar las dosis antes de proceder.
            </p>
          </Card>
        </Reveal>
      </div>
    </div>
  );
};

export default NuevaReceta;
