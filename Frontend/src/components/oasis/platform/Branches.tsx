'use client'

import { Plus, MapPin, Phone, Edit } from 'lucide-react'
import { OasisCard, OasisButton, StatusBadge } from '../shared/shared-components'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useState } from 'react'

const branches = [
  { id: 1, name: 'Clínica Oasis - Centro', address: 'Av. Bolívar #123, Managua', phone: '2255-1234', status: 'active' as const },
  { id: 2, name: 'Clínica Oasis - Sur', address: 'Carretera Sur Km 8, Managua', phone: '2255-5678', status: 'active' as const },
  { id: 3, name: 'Clínica Oasis - León', address: 'Calle Central #45, León', phone: '2311-9012', status: 'pending' as const },
]

export default function Branches() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Sucursales</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">{branches.length} sucursales registradas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <OasisButton size="sm"><Plus size={16} className="mr-1" /> Nueva Sucursal</OasisButton>
          </DialogTrigger>
          <DialogContent className="modal-oasis max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Nueva Sucursal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Nombre</label>
                <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" placeholder="Nombre de la sucursal" />
              </div>
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Dirección</label>
                <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" placeholder="Dirección completa" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-inter font-medium text-sm text-[#4A4A4A]">Latitud</label>
                  <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" placeholder="12.1364" />
                </div>
                <div>
                  <label className="font-inter font-medium text-sm text-[#4A4A4A]">Longitud</label>
                  <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" placeholder="-86.2514" />
                </div>
              </div>
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Teléfono</label>
                <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" placeholder="2255-0000" />
              </div>
              <div className="h-32 rounded-[14px] bg-[#E8F5EE] flex items-center justify-center text-sm font-inter text-[#0E8C5E]">
                Mini mapa (seleccionar ubicación)
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <OasisButton variant="ghost" onClick={() => setDialogOpen(false)}>Cancelar</OasisButton>
                <OasisButton onClick={() => setDialogOpen(false)}>Guardar Sucursal</OasisButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((b) => (
          <OasisCard key={b.id}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-nunito font-bold text-base text-[#4A4A4A]">{b.name}</h3>
              <StatusBadge status={b.status} />
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm font-inter text-[#8A8A8A]">
                <MapPin size={14} className="text-[#0E8C5E]" /> {b.address}
              </div>
              <div className="flex items-center gap-2 text-sm font-inter text-[#8A8A8A]">
                <Phone size={14} className="text-[#0077B6]" /> {b.phone}
              </div>
            </div>
            <div className="h-20 rounded-[14px] bg-[#E8F5EE] flex items-center justify-center text-xs font-inter text-[#0E8C5E]">
              Mapa de ubicación
            </div>
            <div className="flex justify-end mt-3">
              <button className="p-2 rounded-full hover:bg-[#E8F5EE] text-[#8A8A8A] hover:text-[#0E8C5E] transition-colors">
                <Edit size={16} />
              </button>
            </div>
          </OasisCard>
        ))}
      </div>
    </div>
  )
}
