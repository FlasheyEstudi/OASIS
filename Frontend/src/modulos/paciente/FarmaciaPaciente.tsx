"use client";

import React, { useState } from "react";
import { 
  Search, Pill, MapPin, ShoppingCart, 
  Filter, Plus, Minus, Info, 
  ArrowRight, Heart, Star, Shield
} from "lucide-react";
import { useBuscarMedicamentos, useFarmaciasCercanas } from "@/hooks/usePaciente";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import Input from "@/componentes/ui/Input";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import EmptyState from "@/componentes/ui/EmptyState";
import { cn } from "@/lib/utils";

const FarmaciaPaciente = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: meds, isLoading: loadingMeds } = useBuscarMedicamentos(searchQuery);
  const { data: pharmacies, isLoading: loadingPharmacies } = useFarmaciasCercanas(12.13, -86.27); // Mock Nicaraguan coords
  const [cart, setCart] = useState<any[]>([]);

  const addToCart = (med: any) => {
    setCart([...cart, { ...med, quantity: 1 }]);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* --- SEARCH BAR --- */}
      <Reveal>
        <div className="relative max-w-2xl mx-auto">
          <Input 
            size="large" 
            label="Buscador Farmacia"
            placeholder="Busca medicamentos, vitaminas o cuidado personal..." 
            icon={Search}
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            className="shadow-glow-accent/5"
          />
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {["Antibióticos", "Analgésicos", "Cuidado Piel", "Vitaminas", "Infantil"].map((cat) => (
              <Badge key={cat} variant="glass" className="cursor-pointer hover:bg-accent/10 hover:text-accent transition-colors">
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* --- PRODUCT GRID --- */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-fluid-2xl font-light">
              {searchQuery ? `Resultados para "${searchQuery}"` : "Medicamentos Populares"}
            </h3>
            <Badge variant="glass">{`${meds?.length || 0} productos`}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loadingMeds ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-64 bg-surface/50 animate-pulse rounded-3xl" />)
            ) : meds?.length > 0 ? (
              meds.map((med: any, idx: number) => (
                <Reveal key={med.id} delay={idx * 0.05}>
                  <Card className="p-0 overflow-hidden group">
                    <div className="aspect-square bg-surface/30 relative flex items-center justify-center">
                      <Pill size={64} className="text-accent/20 group-hover:scale-110 transition-transform duration-500" />
                      {med.requiresPrescription && (
                        <div className="absolute top-4 right-4">
                          <Badge variant="warning" size="xs">Receta Necesaria</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h4 className="font-display text-fluid-lg font-light">{med.name}</h4>
                        <p className="text-fluid-xs text-muted">{med.genericName} • {med.strength}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-mono text-fluid-base font-bold text-accent">C$ {med.basePrice || "240.00"}</span>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          icon={Plus}
                          onClick={() => addToCart(med)}
                        >
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Reveal>
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState 
                  icon={Search} 
                  title="¿Qué estás buscando?" 
                  description="Escribe el nombre del medicamento para ver disponibilidad en tiempo real."
                />
              </div>
            )}
          </div>
        </div>

        {/* --- SIDEBAR: CART & MAP --- */}
        <div className="space-y-10">
          {/* CART SUMMARY (FROST) */}
          <Reveal delay={0.2}>
            <Card className="frost border-accent/20 p-8 space-y-6 sticky top-32">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-fluid-xl font-light">Tu Carrito</h3>
                <ShoppingCart className="text-accent" />
              </div>

              {cart.length > 0 ? (
                <div className="space-y-6">
                  <div className="max-h-64 overflow-y-auto space-y-4 pr-2">
                    {cart.map((item, i) => (
                      <div key={i} className="flex justify-between items-center gap-4">
                        <div className="flex-1">
                          <p className="text-fluid-xs font-bold truncate">{item.name}</p>
                          <p className="text-[10px] text-muted uppercase">C$ {item.basePrice || "240"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:text-accent"><Minus size={14} /></button>
                          <span className="text-fluid-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button className="p-1 hover:text-accent"><Plus size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-border space-y-4">
                    <div className="flex justify-between text-fluid-sm font-bold">
                      <span>Total Estimado</span>
                      <span className="text-accent">C$ {cart.reduce((acc, curr) => acc + 240, 0)}</span>
                    </div>
                    <Button variant="primary" fullWidth size="lg" iconRight={ArrowRight}>Pagar Orden</Button>
                    <p className="text-[10px] text-muted text-center flex items-center justify-center gap-1 uppercase tracking-widest">
                      <Shield size={10} /> Verificación Aura Segura
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-surface mx-auto flex items-center justify-center text-muted/30">
                    <ShoppingCart size={32} />
                  </div>
                  <p className="text-fluid-xs text-muted">Tu carrito está vacío</p>
                </div>
              )}
            </Card>
          </Reveal>

          {/* NEARBY PHARMACIES PREVIEW */}
          <Reveal delay={0.3}>
            <div className="space-y-4">
              <h3 className="font-display text-fluid-lg font-light flex items-center gap-2">
                <MapPin size={18} className="text-accent" /> Farmacias Cercanas
              </h3>
              <div className="space-y-3">
                {(Array.isArray(pharmacies) ? pharmacies : []).slice(0, 3).map((ph: any) => (
                  <div key={ph.id} className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-4 hover:border-accent/20 transition-all cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-fluid-xs font-bold">{ph.name}</p>
                      <p className="text-[10px] text-muted uppercase">{ph.address.city} • 1.2km</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default FarmaciaPaciente;
