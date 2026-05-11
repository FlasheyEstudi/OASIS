'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { OasisCard, OasisButton, DropLoader, EmptyState, StatusBadge } from '@/components/oasis/shared/shared-components'
import { Calendar, Plus, Building2, Stethoscope, Clock, XCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  const [showCreate, setShowCreate] = useState(false)
  const [clinics, setClinics] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [form, setForm] = useState({ clinicId: '', doctorId: '', date: '', startTime: '', endTime: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAppointments(); loadClinics() }, [tab])

  async function loadAppointments() {
    setLoading(true)
    const statusMap: Record<string, string> = { upcoming: 'scheduled,confirmed,checked_in', past: 'completed', cancelled: 'cancelled' }
    const res = await api.get('/patient/appointments', { status: statusMap[tab], limit: 30 })
    if (res.success && (res as any).data) setAppointments((res as any).data)
    setLoading(false)
  }

  async function loadClinics() {
    const res = await api.get('/clinics', { limit: 50 })
    if (res.success && (res as any).data) setClinics((res as any).data)
  }

  async function loadDoctors(clinicId: string) {
    const res = await api.get('/doctors', { clinicId, limit: 50 })
    if (res.success && (res as any).data) setDoctors((res as any).data)
  }

  async function createAppointment() {
    setSaving(true)
    const res = await api.post('/patient/appointments', form)
    if (res.success) { setShowCreate(false); setForm({ clinicId: '', doctorId: '', date: '', startTime: '', endTime: '' }); loadAppointments() }
    setSaving(false)
  }

  async function cancelAppointment(id: string) {
    await api.put(`/appointments/${id}`, { status: 'cancelled', cancellationReason: 'Cancelada por el paciente' })
    loadAppointments()
  }

  const statusLabels: Record<string, any> = { scheduled: 'pending', confirmed: 'active', checked_in: 'active', in_progress: 'completed', completed: 'completed', cancelled: 'cancelled', no_show: 'inactive' }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Mis Citas</h1><p className="font-inter text-sm text-[#8A8A8A]">Agenda y gestiona tus citas médicas</p></div>
        <OasisButton onClick={() => setShowCreate(true)}><Plus size={16} /> Agendar</OasisButton>
      </div>
      <div className="flex gap-2">
        {[{ key: 'upcoming', label: 'Próximas' }, { key: 'past', label: 'Pasadas' }, { key: 'cancelled', label: 'Canceladas' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`capsule px-4 py-2 font-inter font-semibold text-sm transition-all ${tab === t.key ? 'oasis-gradient text-white shadow-md' : 'bg-[#E8F5EE] text-[#0E8C5E]'}`}>{t.label}</button>
        ))}
      </div>
      {appointments.length === 0 ? <EmptyState message="No hay citas" /> : (
        <div className="space-y-3">
          {appointments.map((apt: any) => (
            <OasisCard key={apt.id} hover={false} className="py-3 px-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center"><Calendar size={20} className="text-[#0E8C5E]" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter font-semibold text-sm text-[#4A4A4A]">{apt.doctor?.user?.name || 'Doctor'}</p>
                  <p className="font-inter text-xs text-[#8A8A8A]">{apt.clinic?.name || ''} - {apt.date?.split('T')[0]} {apt.startTime}</p>
                </div>
                <StatusBadge status={statusLabels[apt.status] || 'pending'} />
                {tab === 'upcoming' && <button onClick={() => cancelAppointment(apt.id)} className="text-[#8A8A8A] hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-[#FEE2E2] transition-colors"><XCircle size={16} /></button>}
              </div>
            </OasisCard>
          ))}
        </div>
      )}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Agendar Cita</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><label className="font-inter font-medium text-sm text-[#4A4A4A]">Clínica *</label>
              <select value={form.clinicId} onChange={e => { setForm({ ...form, clinicId: e.target.value, doctorId: '' }); loadDoctors(e.target.value) }}
                className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1">
                <option value="">Seleccionar clínica</option>
                {clinics.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select></div>
            <div><label className="font-inter font-medium text-sm text-[#4A4A4A]">Doctor *</label>
              <select value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}
                className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1">
                <option value="">Seleccionar doctor</option>
                {doctors.map((d: any) => <option key={d.id} value={d.id}>{d.user?.name || d.specialty}</option>)}
              </select></div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="font-inter text-xs text-[#8A8A8A]">Fecha</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full input-oasis border border-[#E0E0E0] px-3 py-2 text-sm focus:border-[#0E8C5E] focus:outline-none" /></div>
              <div><label className="font-inter text-xs text-[#8A8A8A]">Inicio</label><input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="w-full input-oasis border border-[#E0E0E0] px-3 py-2 text-sm focus:border-[#0E8C5E] focus:outline-none" /></div>
              <div><label className="font-inter text-xs text-[#8A8A8A]">Fin</label><input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="w-full input-oasis border border-[#E0E0E0] px-3 py-2 text-sm focus:border-[#0E8C5E] focus:outline-none" /></div>
            </div>
            <div className="flex gap-3 justify-end">
              <OasisButton variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</OasisButton>
              <OasisButton onClick={createAppointment} disabled={!form.clinicId || !form.doctorId || !form.date || saving}>{saving ? 'Agendando...' : 'Agendar'}</OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
