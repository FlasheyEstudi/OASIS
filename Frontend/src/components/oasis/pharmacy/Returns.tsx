'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCcw, PackageCheck, AlertCircle, Trash2, ArrowLeftRight, Loader2, Search } from 'lucide-react'
import { OasisCard, OasisButton, HeartbeatCheck, DropLoader, EmptyState } from '../shared/shared-components'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { api } from '@/lib/api-client'

export default function Returns() {
  const [returns, setReturns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [processOpen, setProcessOpen] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState<any>(null)
  const [processSuccess, setProcessSuccess] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadReturns()
  }, [])

  async function loadReturns() {
    setLoading(true)
    try {
      const res = await api.get('/pharmacy/returns')
      if (res.success && res.data) setReturns(res.data)
    } catch (err) {}
    setLoading(false)
  }

  const handleProcess = async () => {
    if (!selectedReturn) return
    setProcessing(true)
    try {
      const res = await api.put(`/pharmacy/returns/${selectedReturn.id}/process`, {
        action: 'restock' // default for now
      })
      if (res.success) {
        setProcessSuccess(true)
        setTimeout(() => {
          setProcessSuccess(false)
          setProcessOpen(false)
          setSelectedReturn(null)
          loadReturns()
        }, 1500)
      }
    } catch (err) {
      alert('Error al procesar')
    }
    setProcessing(false)
  }

  const filtered = returns.filter(r => 
    r.id.toLowerCase().includes(search.toLowerCase()) || 
    r.order?.id?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Devoluciones</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Gestión de retornos e ingresos al inventario</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ID o Pedido..."
            className="pl-9 pr-4 py-2 bg-[#FAFAFA] border-2 border-[#F0F0F0] rounded-xl text-xs font-inter focus:border-[#0E8C5E] outline-none w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><DropLoader size={48} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState message="No hay solicitudes de devolución pendientes" icon="drop" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {filtered.map((ret) => (
            <OasisCard key={ret.id} className="hover:border-[#F4A261]/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <div className="w-10 h-10 rounded-xl bg-[#FFF3E0] flex items-center justify-center text-[#F4A261]">
                      <ArrowLeftRight size={20} />
                   </div>
                   <div>
                      <span className="font-inter font-bold text-sm text-[#4A4A4A]">#{ret.id.slice(-6).toUpperCase()}</span>
                      <p className="text-[10px] text-[#8A8A8A] font-bold uppercase tracking-tighter">Pedido {ret.order?.id?.slice(-6).toUpperCase()}</p>
                   </div>
                </div>
                <span className={`capsule text-[10px] font-inter font-bold px-3 py-1 ${ret.status === 'pending' ? 'bg-[#FFF3E0] text-[#F4A261]' : 'bg-[#E8F5EE] text-[#0E8C5E]'}`}>
                  {ret.status === 'pending' ? 'PENDIENTE' : 'PROCESADO'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-inter mb-6 p-4 bg-[#FAFAFA] rounded-2xl border border-[#F0F0F0]">
                <div>
                   <p className="text-[#8A8A8A] font-bold text-[9px] uppercase mb-0.5">Paciente</p>
                   <p className="text-[#4A4A4A] font-semibold">{ret.order?.patient?.name || 'N/A'}</p>
                </div>
                <div>
                   <p className="text-[#8A8A8A] font-bold text-[9px] uppercase mb-0.5">Monto Reembolso</p>
                   <p className="text-[#0E8C5E] font-black">C${ret.amount?.toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                   <p className="text-[#8A8A8A] font-bold text-[9px] uppercase mb-0.5">Motivo de Devolución</p>
                   <p className="text-[#4A4A4A] flex items-center gap-1.5 italic">
                      <AlertCircle size={12} className="text-[#F4A261]" /> {ret.reason || 'Sin motivo especificado'}
                   </p>
                </div>
              </div>

              <OasisButton 
                variant="outline" 
                fullWidth 
                size="sm" 
                onClick={() => { setSelectedReturn(ret); setProcessOpen(true) }}
                disabled={ret.status !== 'pending'}
              >
                <RefreshCcw size={14} className="mr-2" /> Procesar Solicitud
              </OasisButton>
            </OasisCard>
          ))}
        </div>
      )}

      <Dialog open={processOpen} onOpenChange={(open) => { setProcessOpen(open); if (!open) { setProcessSuccess(false); setSelectedReturn(null) } }}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-xl">Resolución de Devolución</DialogTitle>
          </DialogHeader>
          {processSuccess ? (
            <div className="py-12 text-center space-y-4">
              <HeartbeatCheck size={72} />
              <div>
                <h3 className="font-nunito font-black text-2xl text-[#4A4A4A]">¡Procesado!</h3>
                <p className="font-inter text-sm text-[#8A8A8A]">El reembolso y ajuste de inventario han sido aplicados.</p>
              </div>
            </div>
          ) : selectedReturn && (
            <div className="space-y-6 mt-4">
              <div className="space-y-4">
                <label className="text-xs font-bold text-[#8A8A8A] uppercase ml-1">¿Qué hacer con el producto?</label>
                <div className="grid gap-3">
                  <button className="flex items-center gap-3 p-4 rounded-2xl border-2 border-[#0E8C5E] bg-[#E8F5EE]/30 text-left transition-all">
                    <div className="w-10 h-10 rounded-full bg-[#0E8C5E] text-white flex items-center justify-center">
                       <PackageCheck size={20} />
                    </div>
                    <div>
                       <p className="font-bold text-sm text-[#4A4A4A]">Reingresar a Stock</p>
                       <p className="text-[10px] text-[#8A8A8A]">El producto está en buen estado y volverá al inventario.</p>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-4 rounded-2xl border-2 border-[#F0F0F0] hover:border-[#EF4444] text-left transition-all group">
                    <div className="w-10 h-10 rounded-full bg-[#FAFAFA] group-hover:bg-[#EF4444] group-hover:text-white text-[#8A8A8A] flex items-center justify-center transition-all">
                       <Trash2 size={20} />
                    </div>
                    <div>
                       <p className="font-bold text-sm text-[#4A4A4A]">Desechar / Dañado</p>
                       <p className="text-[10px] text-[#8A8A8A]">El producto no es apto para la venta y se dará de baja.</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#E8F5EE] rounded-2xl border border-[#0E8C5E]/20">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#0E8C5E]">MONTO A REEMBOLSAR:</span>
                    <span className="font-nunito font-black text-xl text-[#0E8C5E]">C${selectedReturn.amount?.toLocaleString()}</span>
                 </div>
              </div>

              <OasisButton fullWidth size="lg" onClick={handleProcess} disabled={processing}>
                {processing ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                Confirmar y Emitir Reembolso
              </OasisButton>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
