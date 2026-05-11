'use client'

import { ArrowLeft, Shield, Plus } from 'lucide-react'
import { OasisCard, OasisButton } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const insurances = [
  { insurer: 'Seguros América', policy: 'POL-2025-001234', expiry: '31 Dic 2025', active: true },
]

export default function PatientInsurance() {
  const { navigate } = useNavigation()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-[10px] border-b border-[#E0E0E0]/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('patient-profile')}><ArrowLeft size={20} className="text-[#4A4A4A]" /></button>
            <h1 className="font-nunito font-bold text-lg text-[#4A4A4A]">Mis Seguros</h1>
          </div>
          <button onClick={() => setDialogOpen(true)} className="w-8 h-8 rounded-full bg-[#E8F5EE] flex items-center justify-center">
            <Plus size={16} className="text-[#0E8C5E]" />
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-3">
        {insurances.map((ins, i) => (
          <OasisCard key={i} className="!p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E8F5EE] flex items-center justify-center">
                <Shield size={18} className="text-[#0E8C5E]" />
              </div>
              <div className="flex-1">
                <div className="font-nunito font-bold text-sm text-[#4A4A4A]">{ins.insurer}</div>
                <div className="font-inter text-xs text-[#8A8A8A] mt-0.5">Póliza: {ins.policy}</div>
                <div className="font-inter text-xs text-[#8A8A8A]">Vencimiento: {ins.expiry}</div>
              </div>
              <span className="capsule bg-[#E8F5EE] text-[#0E8C5E] px-2 py-0.5 text-[10px] font-inter font-semibold">Activo</span>
            </div>
          </OasisCard>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Agregar Póliza</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="font-inter font-medium text-sm text-[#4A4A4A]">Aseguradora</label>
              <select className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1">
                <option>Seguros América</option>
                <option>Mapfre</option>
                <option>ASSA</option>
              </select>
            </div>
            <div>
              <label className="font-inter font-medium text-sm text-[#4A4A4A]">Número de Póliza</label>
              <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1" placeholder="POL-2025-XXXXXX" />
            </div>
            <div>
              <label className="font-inter font-medium text-sm text-[#4A4A4A]">Fecha Vencimiento</label>
              <input type="date" className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1" />
            </div>
            <OasisButton className="w-full" onClick={() => setDialogOpen(false)}>Guardar Póliza</OasisButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
