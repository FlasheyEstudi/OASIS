'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, OasisButton, DropLoader, ErrorState, EmptyState, StatusBadge } from '@/components/oasis/shared/shared-components'
import { Calendar, Clock, User, Stethoscope, CheckCircle, Plus, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function ReceptionistAgenda() {
  const { roleProfile } = useAuthStore()
  const clinicId = roleProfile?.clinicId
  const [appointments, setAppointments] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ doctorId: '', patientId: '', date: '', startTime: '', endTime: '' })
  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAppointments(); loadDoctors() }, [date, statusFilter])

  async function loadAppointments() {
    if (!clinicId) return
    setLoading(true)
    const res = await api.get('/receptionist/appointments', { date, status: statusFilter || undefined, clinicId, limit: 50 })
    if (res.success && (res as any).data) setAppointments((res as any).data)
    setLoading(false)
  }

  async function loadDoctors() {
    if (!clinicId) return
    const res = await api.get('/doctors', { clinicId, limit: 50 })
    if (res.success && (res as any).data) setDoctors((res as any).data)
  }

  async function searchPatients(q: string) {
    setPatientSearch(q)
    if (q.length < 2) { setPatientResults([]); return }
    const res = await api.get('/patients', { search: q, limit: 10 })
    if (res.success && (res as any).data) setPatientResults((res as any).data)
  }

  async function confirmAppointment(id: string) {
    await api.put(`/receptionist/appointments/${id}/confirm`)
    loadAppointments()
  }

  async function checkinAppointment(id: string) {
    await api.post(`/receptionist/appointments/${id}/checkin`)
    loadAppointments()
  }

  async function createAppointment() {
    setSaving(true)
    await api.post('/receptionist/appointments', { ...form, clinicId })
    setShowCreate(false); loadAppointments(); setSaving(false)
  }

  const statusActions: Record<string, { label: string; action: (id: string) => void; variant: 'primary' | 'blue' }[]> = {
    scheduled: [{ label: 'Confirmar', action: confirmAppointment, variant: 'primary' }],
    confirmed: [{ label: 'Check-in', action: checkinAppointment, variant: 'blue' }],
  }

  const statusMap: Record<string, any> = { scheduled: 'pending', confirmed: 'active', checked_in: 'completed', in_progress: 'completed', completed: 'completed', cancelled: 'cancelled', no_show: 'inactive' }

  if (loading && appointments.length === 0) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>
  if (error) return <ErrorState message={error} onRetry={loadAppointments} />

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Agenda del Día</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Citas programadas con check-in y cobros</p>
        </div>
        <OasisButton onClick={() => { setForm({ ...form, date }); setShowCreate(true) }}><Plus size={16} /> Nueva Cita</OasisButton>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-3 py-2 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-3 py-2 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none">
          <option value="">Todos los estados</option>
          <option value="scheduled">Programada</option>
          <option value="confirmed">Confirmada</option>
          <option value="checked_in">Check-in</option>
          <option value="completed">Completada</option>
          <option value="cancelled">Cancelada</option>
        </select>
      </div>

      {appointments.length === 0 ? <EmptyState message="No hay citas para esta fecha" /> : (
        <div className="space-y-3">
          {appointments.map((apt: any) => (
            <OasisCard key={apt.id} hover={false} className="py-3 px-4">
              <div className="flex items-center gap-4">
                <div className="text-center flex-shrink-0 w-16">
                  <p className="font-nunito font-bold text-lg text-[#0E8C5E]">{apt.startTime || '--:--'}</p>
                  <p className="font-inter text-[10px] text-[#8A8A8A]">{apt.endTime || ''}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-[#8A8A8A]" />
                    <span className="font-inter font-semibold text-sm text-[#4A4A4A] truncate">{apt.patient?.user?.name || apt.patientId}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Stethoscope size={14} className="text-[#8A8A8A]" />
                    <span className="font-inter text-xs text-[#8A8A8A]">{apt.doctor?.user?.name || apt.doctorId}</span>
                  </div>
                </div>
                <StatusBadge status={statusMap[apt.status] || 'pending'} />
                <div className="flex gap-1">
                  {(statusActions[apt.status] || []).map((a, i) => (
                    <OasisButton key={i} variant={a.variant} size="sm" onClick={() => a.action(apt.id)}>{a.label}</OasisButton>
                  ))}
                </div>
              </div>
            </OasisCard>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Nueva Cita</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="font-inter font-medium text-sm text-[#4A4A4A]">Doctor *</label>
              <select value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}
                className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1">
                <option value="">Seleccionar doctor</option>
                {doctors.map((d: any) => <option key={d.id} value={d.id}>{d.user?.name || d.specialty}</option>)}
              </select>
            </div>
            <div>
              <label className="font-inter font-medium text-sm text-[#4A4A4A]">Paciente *</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
                <input value={patientSearch} onChange={e => searchPatients(e.target.value)} placeholder="Buscar paciente..."
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] pl-10 pr-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1" />
              </div>
              {patientResults.length > 0 && (
                <div className="mt-1 border border-[#E0E0E0] rounded-[14px] max-h-32 overflow-y-auto">
                  {patientResults.map((p: any) => (
                    <button key={p.id} onClick={() => { setForm({ ...form, patientId: p.id }); setPatientSearch(p.user?.name || p.id); setPatientResults([]) }}
                      className="w-full text-left px-3 py-2 font-inter text-sm hover:bg-[#E8F5EE] transition-colors">{p.user?.name || p.id}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="font-inter text-xs text-[#8A8A8A]">Fecha</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full input-oasis border-2 border-[#E0E0E0] px-3 py-2 text-sm focus:border-[#0E8C5E] focus:outline-none" /></div>
              <div><label className="font-inter text-xs text-[#8A8A8A]">Inicio</label><input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="w-full input-oasis border-2 border-[#E0E0E0] px-3 py-2 text-sm focus:border-[#0E8C5E] focus:outline-none" /></div>
              <div><label className="font-inter text-xs text-[#8A8A8A]">Fin</label><input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="w-full input-oasis border-2 border-[#E0E0E0] px-3 py-2 text-sm focus:border-[#0E8C5E] focus:outline-none" /></div>
            </div>
            <div className="flex gap-3 justify-end">
              <OasisButton variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</OasisButton>
              <OasisButton onClick={createAppointment} disabled={!form.doctorId || !form.patientId || saving}>{saving ? 'Creando...' : 'Agendar'}</OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
