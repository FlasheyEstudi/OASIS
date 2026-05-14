"use client";

import React, { useState } from "react";
import { 
  Pill, Download, Shield, RefreshCw, 
  Search, Filter, ChevronRight, FileText,
  Clock, AlertTriangle
} from "lucide-react";
import { useRecetas } from "@/hooks/usePaciente";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import Input from "@/componentes/ui/Input";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import EmptyState from "@/componentes/ui/EmptyState";
import { cn } from "@/lib/utils";
import QRModal from "@/componentes/ui/QRModal";
import { generatePrescriptionPDF } from "@/servicios/pdfService";

const RecetasPaciente = () => {
  const [statusFilter, setStatusFilter] = useState("active");
  const [selectedQR, setSelectedQR] = useState<any>(null);
  const { data: recetas, isLoading } = useRecetas({ status: statusFilter });

  if (isLoading) return <SkeletonPage type="list" />;

  return (
    <div className="space-y-10">
      {/* --- FILTERS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex bg-surface/50 p-1.5 rounded-2xl border border-border w-fit frost">
          {["active", "expired", "used"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-6 py-2 rounded-xl text-fluid-xs font-bold transition-all duration-300 uppercase tracking-widest",
                statusFilter === status 
                  ? "bg-accent text-white shadow-glow" 
                  : "text-muted hover:text-text hover:bg-white/5"
              )}
            >
              {status === "active" ? "Activas" : status === "expired" ? "Vencidas" : "Usadas"}
            </button>
          ))}
        </div>
        
        <div className="w-full md:w-64">
          <Input label="Buscador" placeholder="Buscar medicamento..." icon={Search} className="h-11" />
        </div>
      </div>

      {/* --- LISTA --- */}
      <div className="grid grid-cols-1 gap-6">
        {recetas?.length > 0 ? (
          recetas.map((rx: any, idx: number) => (
            <Reveal key={rx.id} delay={idx * 0.1}>
              <Card className="group hover:border-accent/30 transition-all duration-500">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                  {/* Icono/Status */}
                  <div className={cn(
                    "w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0",
                    rx.status === "active" ? "bg-success/10 text-success" : "bg-muted/10 text-muted"
                  )}>
                    <FileText size={32} />
                  </div>

                  {/* Info Principal */}
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-display text-fluid-xl font-light">Receta #{rx.verificationCode}</h3>
                        <p className="text-fluid-xs text-muted flex items-center gap-2 mt-1">
                          <Clock size={12} /> Emitida el {new Date(rx.date).toLocaleDateString()} • Por Dr. {rx.doctor.user.name}
                        </p>
                      </div>
                      <Badge variant={rx.status === "active" ? "success" : "muted"} size="sm">
                        {rx.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {rx.items.map((item: any) => (
                        <Badge key={item.id} variant="glass" size="xs">
                          {`${item.medication.name} (${item.dosage})`}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4">
                      <Button 
                        variant="primary" 
                        size="md" 
                        icon={Download}
                        onClick={() => generatePrescriptionPDF(rx)}
                      >
                        Descargar PDF
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="md" 
                        icon={Shield}
                        onClick={() => setSelectedQR({
                          id: rx.id,
                          value: rx.verificationCode,
                          title: `Validación Receta #${rx.verificationCode}`,
                          subtitle: `Paciente: ${rx.patient.user.name}`
                        })}
                      >
                        Validar QR
                      </Button>
                      {rx.refillsRemaining > 0 && rx.status === "active" && (
                        <Button variant="glass" size="md" icon={RefreshCw} className="text-accent">Solicitar Relleno</Button>
                      )}
                    </div>
                  </div>

                  {/* Refills Counter */}
                  <div className="hidden lg:flex flex-col items-center justify-center border-l border-border px-8 space-y-1">
                    <span className="text-fluid-2xl font-display font-light text-text">{rx.refillsRemaining}</span>
                    <span className="text-[10px] font-mono text-muted uppercase tracking-widest">Rellenos</span>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))
        ) : (
          <EmptyState 
            icon={Pill} 
            title="No se encontraron recetas" 
            description="No tienes recetas que coincidan con este filtro. Consulta con tu médico si necesitas una nueva prescripción."
            action={{ label: "Agendar Consulta", onClick: () => {} }}
          />
        )}
      </div>

      <QRModal 
        isOpen={!!selectedQR}
        onClose={() => setSelectedQR(null)}
        value={selectedQR?.value || ""}
        title={selectedQR?.title || ""}
        subtitle={selectedQR?.subtitle || ""}
        prescriptionId={selectedQR?.id}
      />
    </div>
  );
};

export default RecetasPaciente;
