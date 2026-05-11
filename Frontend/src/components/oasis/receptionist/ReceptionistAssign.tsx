'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, OasisButton, DropLoader, ErrorState, EmptyState } from '@/components/oasis/shared/shared-components'
import { ArrowRightLeft, Stethoscope, Calendar, CheckSquare, Square, AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function ReceptionistAssign() {
  const { roleProfile } = useAuthStore()
  const clinicId = roleProfile?.clinicId
  const [doctors, setDoctors] = useState<any[]>([])
  const [fromDoctor, setFromDoctor] = useState('')
  const [toDoctor, setToDoctor] = useState('')
  const [appointments, setAppointments] = useState<any[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [reassigning, setReassigning] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => { loadDoctors() }, [])

  async function loadDoctors() {
    if (!clinicId) return
    setLoading(true)
    const res = await api.get('/doctors', { clinicId, limit: 50 })
    if (res.success && (res as any).data) setDoctors((res as any).data)
    setLoading(false)
  }

  async function loadFromAppointments(doctorId: string) {
    setFromDoctor(doctorId); setSelected(new Set())
    if (!doctorId || !clinicId) return
    const res = await api.get('/receptionist/appointments', { clinicId, doctorId, status: 'scheduled,confirmed', limit: 50 })
    if (res.success && (res as any).data) setAppointments((res as any).data)
    else setAppointments([])
  }

  function toggleSelect(id: string) {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  async function doReassign() {
    setReassigning(true)
    const res = await api.post('/receptionist/assign-doctor', { fromDoctorId: fromDoctor, toDoctorId: toDoctor, appointmentIds: Array.from(selected) })
    if (res.success) { setResult(`Se reasignaron ${(res as any).data?.reassigned || selected.size} citas exitosamente`); loadFromAppointments(fromDoctor) }
    else setResult('Error al reasignar')
    setReassigning(false); setShowConfirm(false)
    setTimeout(() => setResult(null), 3000)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Reasignar Doctor</h1>
        <p className="font-inter text-sm text-[#8A8A8A]">Transfiere citas a otro médico</p>
      </div>

      {result && (
        <div className="bg-[#E8F5EE] border border-[#0E8C5E]/20 rounded-[14px] px-4 py-3 font-inter text-sm text-[#0E8C5E]">{result}</div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <OasisCard hover={false}>
          <h3 className="font-nunito font-bold text-[#4A4A4A] mb-3">Doctor Origen</h3>
          <select value={fromDoctor} onChange={e => loadFromAppointments(e.target.value)}
            className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none">
            <option value="">Seleccionar doctor</option>
            {doctors.map((d: any) => <option key={d.id} value={d.id}>{d.user?.name || d.specialty}</option>)}
          </select>
        </OasisCard>
        <OasisCard hover={false}>
          <h3 className="font-nunito font-bold text-[#4A4A4A] mb-3">Doctor Destino</h3>
          <select value={toDoctor} onChange={e => setToDoctor(e.target.value)}
            className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none">
            <option value="">Seleccionar doctor</option>
            {doctors.filter((d: any) => d.id !== fromDoctor).map((d: any) => <option key={d.id} value={d.id}>{d.user?.name || d.specialty}</option>)}
          </select>
        </OasisCard>
      </div>

      {fromDoctor && appointments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-nunito font-bold text-[#4A4A4A]">Citas ({appointments.length})</h3>
            <button onClick={() => { if (selected.size === appointments.length) setSelected(new Set()); else setSelected(new Set(appointments.map((a: any) => a.id))) }}
              className="text-xs font-inter text-[#0077B6] hover:underline">{selected.size === appointments.length ? 'Deseleccionar todas' : 'Seleccionar todas'}</button>
          </div>
          {appointments.map((apt: any) => (
            <div key={apt.id} onClick={() => toggleSelect(apt.id)}
              className={`flex items-center gap-3 p-3 rounded-[14px] border-2 cursor-pointer transition-all ${selected.has(apt.id) ? 'border-[#0E8C5E] bg-[#E8F5EE]/30' : 'border-[#E0E0E0]'}`}>
              {selected.has(apt.id) ? <CheckSquare size={18} className="text-[#0E8C5E]" /> : <Square size={18} className="text-[#8A8A8A]" />}
              <div className="flex-1">
                <p className="font-inter font-semibold text-sm text-[#4A4A4A]">{apt.patient?.user?.name || 'Paciente'}</p>
                <p className="font-inter text-xs text-[#8A8A8A]">{apt.date?.split('T')[0]} - {apt.startTime}</p>
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <OasisButton onClick={() => setShowConfirm(true)} disabled={selected.size === 0 || !toDoctor}>
              <ArrowRightLeft size={16} /> Reasignar {selected.size} citas
            </OasisButton>
          </div>
        </div>
      )}

      {fromDoctor && appointments.length === 0 && <EmptyState message="Este doctor no tiene citas pendientes" />}

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="modal-oasis max-w-sm">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Confirmar Reasignación</DialogTitle></DialogHeader>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2"><AlertTriangle size={20} className="text-[#F4A261]" /><p className="font-inter text-sm text-[#4A4A4A]">Se reasignarán {selected.size} citas al doctor seleccionado</p></div>
            <div className="flex gap-3 justify-end">
              <OasisButton variant="ghost" onClick={() => setShowConfirm(false)}>Cancelar</OasisButton>
              <OasisButton onClick={doReassign} disabled={reassigning}>{reassigning ? 'Reasignando...' : 'Confirmar'}</OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
