'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, OasisButton, DropLoader, ErrorState, EmptyState, StatusBadge } from '@/components/oasis/shared/shared-components'
import { DollarSign, User, CreditCard, Banknote, Shield, CheckCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function ReceptionistPayments() {
  const { roleProfile } = useAuthStore()
  const clinicId = roleProfile?.clinicId
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [collecting, setCollecting] = useState<string | null>(null)
  const [showPay, setShowPay] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [payMethod, setPayMethod] = useState('cash')
  const [payAmount, setPayAmount] = useState('')
  const [recentPayments, setRecentPayments] = useState<any[]>([])
  const [paySuccess, setPaySuccess] = useState(false)

  useEffect(() => { loadAppointments() }, [])

  async function loadAppointments() {
    if (!clinicId) return
    setLoading(true)
    const res = await api.get('/receptionist/appointments', { clinicId, status: 'checked_in,in_progress,completed', limit: 50 })
    if (res.success && (res as any).data) setAppointments((res as any).data)
    setLoading(false)
  }

  async function collectPayment() {
    if (!selected) return
    setCollecting(selected.id)
    const res = await api.post('/receptionist/payments/collect', {
      appointmentId: selected.id, paymentMethod: payMethod, amount: parseFloat(payAmount) || undefined
    })
    if (res.success) {
      setPaySuccess(true)
      setRecentPayments(prev => [{ ...selected, paid: true, paymentMethod: payMethod, amount: payAmount }, ...prev])
      setTimeout(() => { setShowPay(false); setPaySuccess(false); setPayMethod('cash'); setPayAmount(''); setSelected(null) }, 1500)
      loadAppointments()
    }
    setCollecting(null)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Cobros</h1>
        <p className="font-inter text-sm text-[#8A8A8A]">Procesar pagos y facturación</p>
      </div>

      {appointments.length === 0 ? <EmptyState message="No hay citas pendientes de cobro" /> : (
        <div className="space-y-3">
          <h2 className="font-nunito font-bold text-lg text-[#4A4A4A]">Pendientes de Cobro</h2>
          {appointments.map((apt: any) => (
            <OasisCard key={apt.id} hover={false} className="py-3 px-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFF3E0] flex items-center justify-center"><DollarSign size={20} className="text-[#F4A261]" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-nunito font-bold text-[#4A4A4A]">{apt.patient?.user?.name || 'Paciente'}</p>
                  <p className="font-inter text-xs text-[#8A8A8A]">{apt.doctor?.user?.name || ''} - {apt.service?.name || 'Consulta'}</p>
                </div>
                <span className="font-nunito font-bold text-[#0E8C5E]">C${apt.doctor?.consultationFee || apt.service?.price || 500}</span>
                <OasisButton size="sm" onClick={() => { setSelected(apt); setPayAmount(String(apt.doctor?.consultationFee || apt.service?.price || 500)); setShowPay(true) }}>Cobrar</OasisButton>
              </div>
            </OasisCard>
          ))}
        </div>
      )}

      {recentPayments.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-nunito font-bold text-lg text-[#4A4A4A]">Cobros Recientes</h2>
          {recentPayments.map((p: any, i: number) => (
            <OasisCard key={i} hover={false} className="py-3 px-4 bg-[#E8F5EE]/30">
              <div className="flex items-center gap-4">
                <CheckCircle size={20} className="text-[#0E8C5E]" />
                <div className="flex-1"><p className="font-inter font-semibold text-sm text-[#4A4A4A]">{p.patient?.user?.name || 'Paciente'}</p></div>
                <span className="font-nunito font-bold text-[#0E8C5E]">C${p.amount}</span>
              </div>
            </OasisCard>
          ))}
        </div>
      )}

      <Dialog open={showPay} onOpenChange={setShowPay}>
        <DialogContent className="modal-oasis max-w-sm">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Procesar Cobro</DialogTitle></DialogHeader>
          {paySuccess ? (
            <div className="flex flex-col items-center py-8">
              <CheckCircle size={48} className="text-[#0E8C5E] mb-3" />
              <p className="font-nunito font-bold text-lg text-[#0E8C5E]">Pago Registrado</p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              <p className="font-inter text-sm text-[#4A4A4A]">Paciente: <strong>{selected?.patient?.user?.name}</strong></p>
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Monto (C$)</label>
                <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1" />
              </div>
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Método de Pago</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[{ value: 'cash', icon: Banknote, label: 'Efectivo' }, { value: 'card_online', icon: CreditCard, label: 'Tarjeta' }, { value: 'insurance', icon: Shield, label: 'Seguro' }].map(m => (
                    <button key={m.value} onClick={() => setPayMethod(m.value)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-[14px] border-2 transition-all ${payMethod === m.value ? 'border-[#0E8C5E] bg-[#E8F5EE]' : 'border-[#E0E0E0]'}`}>
                      <m.icon size={20} className={payMethod === m.value ? 'text-[#0E8C5E]' : 'text-[#8A8A8A]'} />
                      <span className="text-[10px] font-inter font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <OasisButton variant="ghost" onClick={() => setShowPay(false)}>Cancelar</OasisButton>
                <OasisButton onClick={collectPayment} disabled={!!collecting}>{collecting ? 'Procesando...' : 'Confirmar Pago'}</OasisButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
