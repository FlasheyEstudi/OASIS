'use client'

import { useState } from 'react'
import { Plus, Phone, Pill } from 'lucide-react'
import { OasisCard, OasisButton, HeartbeatCheck } from '../shared/shared-components'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const providers = [
  { id: 1, name: 'Distribuidora Médica Nicaragüense', contact: 'Ing. Roberto Vega', phone: '2255-3344' },
  { id: 2, name: 'Pharma Central S.A.', contact: 'Lic. Carmen Ríos', phone: '2255-5566' },
  { id: 3, name: 'MediSuministros del Norte', contact: 'Sr. Luis Castillo', phone: '2311-7788' },
]

export default function Providers() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  const handleCreateOrder = () => {
    setOrderSuccess(true)
    setTimeout(() => {
      setOrderSuccess(false)
      setDialogOpen(false)
    }, 1500)
  }

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Proveedores y Ordenes de Compra</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">{providers.length} proveedores</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setOrderSuccess(false) }}>
          <DialogTrigger asChild>
            <OasisButton size="sm"><Plus size={16} className="mr-1" /> Nueva Orden</OasisButton>
          </DialogTrigger>
          <DialogContent className="modal-oasis max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Nueva Orden de Compra</DialogTitle>
            </DialogHeader>
            {orderSuccess ? (
              <div className="py-8 text-center">
                <HeartbeatCheck size={56} />
                <h3 className="font-nunito font-bold text-lg text-[#4A4A4A] mt-3">Orden Creada</h3>
                <p className="font-inter text-sm text-[#8A8A8A] mt-1">La orden de compra se ha generado correctamente</p>
              </div>
            ) : (
            <div className="space-y-4 mt-4">
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Proveedor</label>
                <select className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1">
                  {providers.map(p => <option key={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A] mb-2 block">Medicamentos a pedir</label>
                <div className="space-y-2">
                  {[
                    { name: 'Omeprazol 20mg', qty: 100, cost: 45 },
                    { name: 'Ibuprofeno 400mg', qty: 150, cost: 30 },
                  ].map((med, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-[10px] bg-[#FAFAFA]">
                      <span className="flex-1 font-inter text-sm text-[#4A4A4A]"><Pill size={12} className="inline mr-1 text-[#0E8C5E]" /> {med.name}</span>
                      <input className="w-16 border border-[#E0E0E0] rounded-[8px] px-2 py-1 text-xs font-inter text-center" defaultValue={med.qty} />
                      <span className="text-xs font-inter text-[#8A8A8A]">@ C${med.cost}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-[14px] bg-[#E8F5EE]/50 font-inter text-sm text-[#0E8C5E] font-semibold text-right">
                Total estimado: C$9,750
              </div>
              <OasisButton className="w-full" onClick={handleCreateOrder}>Crear Orden de Compra</OasisButton>
            </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white card-oasis overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E0E0E0]">
              <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3">Proveedor</th>
              <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3 hidden md:table-cell">Contacto</th>
              <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3 hidden md:table-cell">Teléfono</th>
              <th className="text-right font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.id} className="border-b border-[#E0E0E0]/50 hover:bg-[#E8F5EE]/20 transition-colors">
                <td className="px-5 py-3 font-inter font-medium text-sm text-[#4A4A4A]">{p.name}</td>
                <td className="px-5 py-3 hidden md:table-cell font-inter text-sm text-[#8A8A8A]">{p.contact}</td>
                <td className="px-5 py-3 hidden md:table-cell font-inter text-sm text-[#8A8A8A]">{p.phone}</td>
                <td className="px-5 py-3 text-right">
                  <a
                    href={`tel:${p.phone}`}
                    className="p-1.5 rounded-full hover:bg-[#E8F5EE] text-[#8A8A8A] hover:text-[#0E8C5E] transition-colors inline-flex items-center justify-center"
                    title={`Llamar a ${p.phone}`}
                  >
                    <Phone size={14} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
