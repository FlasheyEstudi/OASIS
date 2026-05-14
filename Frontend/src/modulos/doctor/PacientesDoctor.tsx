"use client";

import React, { useState } from "react";
import { 
  Users, Search, Filter, ArrowRight, 
  ChevronRight, Calendar, Activity, 
  Plus, MoreHorizontal, FileText, Heart
} from "lucide-react";
import { usePacientesDoctor } from "@/hooks/doctor";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import Avatar from "@/componentes/ui/Avatar";
import Input from "@/componentes/ui/Input";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import EmptyState from "@/componentes/ui/EmptyState";
import { cn } from "@/lib/utils";

const PacientesDoctor = () => {
  const { data: pacientes, isLoading } = usePacientesDoctor();
  const [search, setSearch] = useState("");

  const filteredPacientes = pacientes?.filter((p: any) => 
    p.user.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading) return <SkeletonPage type="list" />;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1 w-full max-w-md">
          <Input 
            label="Buscador"
            placeholder="Buscar por nombre, ID o diagnóstico..." 
            icon={Search}
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" icon={Filter}>Filtros</Button>
          <Button icon={Plus}>Expediente Nuevo</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPacientes.length > 0 ? filteredPacientes.map((p: any, idx: number) => (
          <Reveal key={p.id} delay={idx * 0.05}>
            <Card className="group hover:border-accent/30 transition-all p-8 relative overflow-hidden">
              <div className="flex items-start justify-between mb-6">
                <Avatar name={p.user.name} size="xl" className="border-2 border-accent/10 rounded-[28px]" />
                <button className="p-2 text-muted hover:text-text transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-display text-fluid-lg font-light leading-tight">{p.user.name}</h4>
                  <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-1">ID: {p.id.slice(-8).toUpperCase()}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                  <div>
                    <p className="text-[9px] font-mono text-muted uppercase tracking-wider">Última Cita</p>
                    <p className="text-fluid-xs font-bold">12 Abr 2026</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-muted uppercase tracking-wider">Edad / Sexo</p>
                    <p className="text-fluid-xs font-bold">{p.age || "28"} / {p.gender === 'female' ? 'F' : 'M'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="glass" size="xs">Hipertensión</Badge>
                  <Badge variant="danger" size="xs">Alergia: Penicilina</Badge>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button variant="primary" fullWidth size="md">Ver Ficha</Button>
                  <Button variant="secondary" size="md" icon={FileText} />
                </div>
              </div>
            </Card>
          </Reveal>
        )) : (
          <div className="col-span-full">
            <EmptyState 
              icon={Users} 
              title="No hay pacientes" 
              description="No se encontraron registros que coincidan con tu búsqueda."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PacientesDoctor;
