'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, OasisButton, DropLoader, EmptyState, StatusBadge } from '@/components/oasis/shared/shared-components'
import { Calendar, Clock, Filter, Video, XCircle } from 'lucide-react'

export default function DoctorAppointments() {
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => { loadAppointments() }, [date, statusFilter])

  async function loadAppointments() {
    if (!user?.id) return
    setLoading(true)
    const res = await api.get(`/doctors/${user.id}/appointments`, { date, status: statusFilter || undefined, limit: 50 })
    if (res.success && (res as any).data) setAppointments((res as any).data)
    setLoading(false)
  }

  async function startTeleconsult(id: string) {
    const res = await api.post(`/appointments/${id}/start-teleconsult`)
    if (res.success && (res as any).data?.teleconsultLink) window.open((res as any).data.teleconsultLink, '_blank')
    loadAppointments()
  }

  async function cancelAppointment(id: string) {
    await api.put(`/appointments/${id}`, { status: 'cancelled', cancellationReason: 'Cancelada por el doctor' })
    loadAppointments()
  }

  const statusMap: Record<string, any> = { scheduled: 'pending', confirmed: 'active', checked_in: 'active', in_progress: 'completed', completed: 'completed', cancelled: 'cancelled', no_show: 'inactive' }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div><h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Mis Citas</h1><p className="font-inter text-sm text-[#8A8A8A]">Gestión de citas médicas</p></div>
      <div className="flex flex-wrap gap-3">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-3 py-2 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-3 py-2 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none">
          <option value="">Todos</option><option value="scheduled">Programada</option><option value="confirmed">Confirmada</option><option value="in_progress">En curso</option><option value="completed">Completada</option>
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
                  <p className="font-inter font-semibold text-sm text-[#4A4A4A]">{apt.patient?.user?.name || 'Paciente'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {apt.type === 'teleconsult' && <Video size={12} className="text-[#0077B6]" />}
                    <span className="font-inter text-xs text-[#8A8A8A]">{apt.type === 'teleconsult' ? 'Teleconsulta' : 'Presencial'}</span>
                  </div>
                </div>
                <StatusBadge status={statusMap[apt.status] || 'pending'} />
                <div className="flex gap-1">
                  {apt.type === 'teleconsult' && apt.status === 'confirmed' && (
                    <OasisButton variant="blue" size="sm" onClick={() => startTeleconsult(apt.id)}><Video size={14} /></OasisButton>
                  )}
                  {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                    <button onClick={() => cancelAppointment(apt.id)} className="text-[#8A8A8A] hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-[#FEE2E2] transition-colors"><XCircle size={16} /></button>
                  )}
                </div>
              </div>
            </OasisCard>
          ))}
        </div>
      )}
    </div>
  )
}
