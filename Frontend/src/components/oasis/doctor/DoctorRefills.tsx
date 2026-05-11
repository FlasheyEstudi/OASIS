
'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, OasisButton, DropLoader, EmptyState, StatusBadge, OasisIconButton } from '@/components/oasis/shared/shared-components'
import { RefreshCw, Check, X, AlertCircle, FileText, User, Calendar, MessageSquare, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function DoctorRefills() {
  const { user } = useAuthStore()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => { loadRequests() }, [])

  async function loadRequests() {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await api.get('/doctor/refill-requests', { status: 'pending', limit: 20 })
      if (res.success && res.data) setRequests(res.data)
    } catch (err) {}
    setLoading(false)
  }

  async function handleApprove(id: string) {
    setProcessing(id)
    try {
      const res = await api.post(`/doctor/refill-requests/${id}/approve`)
      if (res.success) {
        setRequests(requests.filter(r => r.id !== id))
        alert('Solicitud de refill aprobada y receta generada')
      }
    } catch (err) {
      alert('Error al aprobar refill')
    }
    setProcessing(null)
  }

  async function handleReject() {
    if (!rejectId || !rejectReason) return
    setProcessing(rejectId)
    try {
      const res = await api.post(`/doctor/refill-requests/${rejectId}/reject`, { reason: rejectReason })
      if (res.success) {
        setRequests(requests.filter(r => r.id !== rejectId))
        setRejectId(null)
        setRejectReason('')
      }
    } catch (err) {}
    setProcessing(null)
  }

  if (loading && requests.length === 0) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Solicitudes de Refill</h1>
        <p className="font-inter text-sm text-[#8A8A8A]">Autoriza renovaciones de recetas para pacientes crónicos</p>
      </div>

      {requests.length === 0 ? <EmptyState message="No hay solicitudes de renovación pendientes" /> : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <OasisCard key={req.id} className="!p-0 overflow-hidden border-2 border-[#E8F5EE]">
              <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#0E8C5E]">
                    <RefreshCw size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <h3 className="font-inter font-bold text-base text-[#4A4A4A]">{req.patient?.user?.name}</h3>
                       <span className="bg-[#E0F2FF] text-[#0077B6] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Crónico</span>
                    </div>
                    <p className="text-sm font-inter text-[#0E8C5E] font-semibold">{req.medication?.name}</p>
                    <p className="text-[10px] font-inter text-[#8A8A8A] mt-1 italic">Solicitado el {new Date(req.createdAt).toLocaleDateString('es-NI')}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:w-64 border-t md:border-t-0 md:border-l border-[#F0F0F0] pt-4 md:pt-0 md:pl-6">
                   <div className="flex items-center gap-2 text-xs font-inter text-[#8A8A8A]">
                      <FileText size={14} className="text-[#0E8C5E]" />
                      <span>Última receta: #{req.lastPrescriptionId?.slice(-6).toUpperCase() || 'N/A'}</span>
                   </div>
                   <div className="flex items-center gap-2 text-xs font-inter text-[#8A8A8A]">
                      <Calendar size={14} className="text-[#0077B6]" />
                      <span>Venció: {req.expiryDate ? new Date(req.expiryDate).toLocaleDateString() : 'Expirada'}</span>
                   </div>
                </div>

                <div className="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0">
                   <button 
                     onClick={() => setRejectId(req.id)}
                     className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#FEE2E2] text-[#EF4444] font-inter font-bold text-sm hover:bg-[#FEE2E2] transition-all"
                   >
                     <X size={18} /> Rechazar
                   </button>
                   <button 
                     onClick={() => handleApprove(req.id)}
                     disabled={processing === req.id}
                     className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0E8C5E] text-white font-inter font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50"
                   >
                     {processing === req.id ? <Loader2 className="animate-spin" size={18} /> : <><Check size={18} /> Aprobar Refill</>}
                   </button>
                </div>
              </div>
              
              {req.patientNote && (
                <div className="px-6 py-3 bg-[#FAFAFA] border-t border-[#F0F0F0] flex items-center gap-2">
                   <MessageSquare size={14} className="text-[#8A8A8A]" />
                   <p className="text-[11px] font-inter text-[#4A4A4A] italic">"{req.patientNote}"</p>
                </div>
              )}
            </OasisCard>
          ))}
        </div>
      )}

      {/* Rejection Dialog */}
      <Dialog open={!!rejectId} onOpenChange={() => { setRejectId(null); setRejectReason('') }}>
         <DialogContent className="modal-oasis max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Rechazar Solicitud</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
               <div className="bg-[#FEE2E2] p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="text-[#EF4444] shrink-0 mt-0.5" />
                  <p className="text-[11px] font-inter text-[#EF4444]">Indica el motivo del rechazo. El paciente recibirá una notificación sugiriendo una nueva cita de evaluación.</p>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-[#8A8A8A] uppercase">Motivo del rechazo</label>
                  <textarea 
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-3 font-inter text-sm rounded-[14px] mt-1 focus:border-[#EF4444] outline-none resize-none"
                    rows={3}
                    placeholder="Ej: Requiere evaluación presencial antes de renovar..."
                  />
               </div>
               <div className="flex gap-3">
                  <OasisButton variant="ghost" className="flex-1" onClick={() => setRejectId(null)}>Cancelar</OasisButton>
                  <OasisButton variant="danger" className="flex-1" onClick={handleReject} disabled={!rejectReason || processing === rejectId}>
                    {processing === rejectId ? <Loader2 className="animate-spin" size={16} /> : 'Confirmar Rechazo'}
                  </OasisButton>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  )
}
