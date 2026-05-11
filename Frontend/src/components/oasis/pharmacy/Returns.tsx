'use client'

import { useState } from 'react'
import { OasisCard, OasisButton, HeartbeatCheck } from '../shared/shared-components'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const returns = [
  { id: '#R001', order: '#0007', patient: 'Roberto Díaz', reason: 'Medicamento equivocado', date: '19 Ene 2025', amount: 165 },
  { id: '#R002', order: '#0005', patient: 'Laura Torres', reason: 'Reacción alérgica', date: '18 Ene 2025', amount: 85 },
]

export default function Returns() {
  const [processOpen, setProcessOpen] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState<typeof returns[0] | null>(null)
  const [processSuccess, setProcessSuccess] = useState(false)

  const handleProcess = () => {
    setProcessSuccess(true)
    setTimeout(() => {
      setProcessSuccess(false)
      setProcessOpen(false)
      setSelectedReturn(null)
    }, 1500)
  }

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div>
        <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Devoluciones</h1>
        <p className="font-inter text-sm text-[#8A8A8A]">Solicitudes de devolución</p>
      </div>

      <div className="space-y-4">
        {returns.map((ret) => (
          <OasisCard key={ret.id}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-inter font-bold text-sm text-[#0077B6]">{ret.id}</span>
              <span className="capsule bg-[#FFF3E0] text-[#F4A261] px-3 py-1 text-[10px] font-inter font-semibold">Pendiente</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm font-inter mb-3">
              <div><span className="text-[#8A8A8A]">Pedido:</span> {ret.order}</div>
              <div><span className="text-[#8A8A8A]">Paciente:</span> {ret.patient}</div>
              <div><span className="text-[#8A8A8A]">Motivo:</span> {ret.reason}</div>
              <div><span className="text-[#8A8A8A]">Monto:</span> <span className="text-[#0E8C5E] font-bold">C${ret.amount}</span></div>
            </div>
            <OasisButton variant="outline" size="sm" onClick={() => { setSelectedReturn(ret); setProcessOpen(true) }}>
              Procesar Devolución
            </OasisButton>
          </OasisCard>
        ))}
      </div>

      <Dialog open={processOpen} onOpenChange={(open) => { setProcessOpen(open); if (!open) { setProcessSuccess(false); setSelectedReturn(null) } }}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Procesar Devolución</DialogTitle>
          </DialogHeader>
          {processSuccess ? (
            <div className="py-8 text-center">
              <HeartbeatCheck size={56} />
              <h3 className="font-nunito font-bold text-lg text-[#4A4A4A] mt-3">Devolución Procesada</h3>
              <p className="font-inter text-sm text-[#8A8A8A] mt-1">La devolución se ha procesado correctamente</p>
            </div>
          ) : selectedReturn && (
            <div className="space-y-4 mt-4">
              <div className="p-3 rounded-[14px] bg-[#FAFAFA] font-inter text-sm">
                <div><span className="text-[#8A8A8A]">Pedido:</span> {selectedReturn.order}</div>
                <div><span className="text-[#8A8A8A]">Paciente:</span> {selectedReturn.patient}</div>
              </div>
              <div className="space-y-2">
                <label className="font-inter font-semibold text-sm text-[#4A4A4A]">Acción</label>
                {['Reingresar al inventario', 'Descartar'].map((option) => (
                  <label key={option} className="flex items-center gap-3 p-3 rounded-[14px] border-2 border-[#E0E0E0] cursor-pointer hover:border-[#0E8C5E] transition-colors">
                    <input type="radio" name="returnAction" className="accent-[#0E8C5E]" />
                    <span className="font-inter text-sm text-[#4A4A4A]">{option}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Monto reembolso</label>
                <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1" defaultValue={`C$${selectedReturn.amount}`} />
              </div>
              <OasisButton className="w-full" onClick={handleProcess}>Procesar</OasisButton>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
