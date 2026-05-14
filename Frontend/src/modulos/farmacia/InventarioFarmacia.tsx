"use client";

import React, { useState } from "react";
import { 
  Package, Search, Filter, Plus, 
  ArrowUpDown, MoreVertical, AlertCircle,
  Calendar, Info, Download, Trash2
} from "lucide-react";
import { useInventario, useAgregarLote } from "@/hooks/farmacia";
import { Reveal } from "@/componentes/ui/Reveal";
import Card from "@/componentes/ui/Card";
import Button from "@/componentes/ui/Button";
import Badge from "@/componentes/ui/Badge";
import Input from "@/componentes/ui/Input";
import SkeletonPage from "@/componentes/ui/SkeletonPage";
import Modal from "@/componentes/ui/Modal";
import { useToast } from "@/componentes/ui/Toast";
import { cn } from "@/lib/utils";

const InventarioFarmacia = () => {
  const { data: inventario, isLoading } = useInventario();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { show } = useToast();

  const filtered = inventario?.filter((i: any) => 
    i.medication.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading) return <SkeletonPage type="list" />;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1 w-full max-w-md">
          <Input 
            label="Buscador Inventario"
            placeholder="Buscar por medicamento, lote o categoría..." 
            icon={Search}
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" icon={Download}>Exportar</Button>
          <Button icon={Plus} onClick={() => setIsModalOpen(true)}>Añadir Lote</Button>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/50 border-b border-border">
                <th className="p-6 text-[10px] font-mono text-muted uppercase tracking-widest font-bold">Medicamento</th>
                <th className="p-6 text-[10px] font-mono text-muted uppercase tracking-widest font-bold">Lote</th>
                <th className="p-6 text-[10px] font-mono text-muted uppercase tracking-widest font-bold">Stock</th>
                <th className="p-6 text-[10px] font-mono text-muted uppercase tracking-widest font-bold">Vencimiento</th>
                <th className="p-6 text-[10px] font-mono text-muted uppercase tracking-widest font-bold">Estado</th>
                <th className="p-6 text-[10px] font-mono text-muted uppercase tracking-widest font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item: any, idx: number) => (
                <tr key={item.id} className="group hover:bg-surface/30 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="text-fluid-xs font-bold">{item.medication.name}</p>
                        <p className="text-[9px] text-muted uppercase">{item.medication.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 font-mono text-fluid-xs">{item.batchNumber}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-fluid-xs font-bold", item.quantity < 20 ? "text-danger" : "text-text")}>
                        {item.quantity}
                      </span>
                      {item.quantity < 20 && <AlertCircle size={14} className="text-danger" />}
                    </div>
                  </td>
                  <td className="p-6 text-fluid-xs text-muted">
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="p-6">
                    <Badge variant={item.quantity > 0 ? "success" : "danger"} size="xs">
                      {item.quantity > 0 ? "Disponible" : "Agotado"}
                    </Badge>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-surface rounded-xl text-muted hover:text-accent"><Info size={18} /></button>
                      <button className="p-2 hover:bg-danger/10 rounded-xl text-muted hover:text-danger"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Lote de Inventario">
        <div className="space-y-6 py-4">
          <Input label="Medicamento" placeholder="Buscar medicamento..." icon={Search} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Número de Lote" placeholder="Ej. L-2024-01" />
            <Input label="Cantidad" placeholder="Ej. 100" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha de Expiración" type="date" />
            <Input label="Precio de Compra" placeholder="C$ 0.00" />
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="secondary" fullWidth onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button fullWidth onClick={() => { show({ title: "Éxito", message: "Lote registrado correctamente.", type: "success" }); setIsModalOpen(false); }}>
              Registrar Lote
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InventarioFarmacia;
