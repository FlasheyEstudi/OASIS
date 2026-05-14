"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Pill, Search, Filter, ShoppingCart, 
  ArrowRight, ShieldCheck, AlertCircle,
  Download, Box, Info, CheckCircle2
} from "lucide-react";
import NavLanding from "@/componentes/layout/NavLanding";
import { useExplorarMedicamentos } from "@/hooks/useExplorar";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Input from "@/componentes/ui/Input";
import Badge from "@/componentes/ui/Badge";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import EmptyState from "@/componentes/ui/EmptyState";
import { cn } from "@/lib/utils";

const ExplorarMedicamentos = () => {
  const [search, setSearch] = useState("");
  const { data: medicamentos, isLoading } = useExplorarMedicamentos(search);

  return (
    <div className="min-h-screen bg-bg">
      <NavLanding />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <Reveal className="space-y-4">
            <Badge variant="accent">Catálogo Digital</Badge>
            <h1 className="font-display text-fluid-4xl font-light">Vademécum Oasis</h1>
            <p className="text-fluid-base text-muted max-w-xl">Consulta precios, disponibilidad y requisitos de prescripción de miles de medicamentos en tiempo real.</p>
          </Reveal>
          
          <Reveal delay={0.2} className="w-full md:w-96">
            <Input 
              label="Buscador Medicamentos"
              placeholder="Nombre comercial o genérico..." 
              icon={Search}
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              className="rounded-2xl"
            />
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-72 bg-surface/30 animate-pulse rounded-[28px]" />)
          ) : medicamentos?.length > 0 ? (
            medicamentos.map((med: any, i: number) => (
              <Reveal key={med.id} delay={i * 0.05}>
                <Card hover className="p-0 overflow-hidden flex flex-col h-full border-border-light group">
                  <div className="h-40 bg-surface/30 relative flex items-center justify-center">
                    <Pill size={48} className="text-accent/20 group-hover:scale-110 transition-transform duration-500" />
                    {med.requiresPrescription && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="warning" size="xs" className="gap-1">
                          <ShieldCheck size={10} /> Receta
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <div>
                      <h4 className="font-display text-fluid-lg font-light leading-tight">{med.name}</h4>
                      <p className="text-[10px] text-muted font-mono uppercase mt-1">{med.genericName} • {med.strength}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-auto">
                      <div className="space-y-1">
                        <p className="text-[9px] text-muted font-mono uppercase tracking-widest">Precio Base</p>
                        <p className="text-fluid-base font-bold text-accent">C$ {med.basePrice || "240.00"}</p>
                      </div>
                      <Link href={`/acceso/login?returnUrl=/explorar/medicamentos`}>
                        <Button variant="secondary" size="sm" icon={ShoppingCart}>Añadir</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))
          ) : (
            <div className="col-span-full">
              <EmptyState 
                icon={Search} 
                title="Búsqueda de medicamentos" 
                description={search ? "No encontramos resultados para tu búsqueda." : "Ingresa el nombre del medicamento para ver precios y disponibilidad."}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExplorarMedicamentos;
