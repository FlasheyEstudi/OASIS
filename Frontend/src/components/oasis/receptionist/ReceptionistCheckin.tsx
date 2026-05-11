'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, OasisButton, DropLoader, ErrorState, EmptyState, StatusBadge } from '@/components/oasis/shared/shared-components'
import { ClipboardCheck, User, Clock, CheckCircle, Search } from 'lucide-react'

export default function ReceptionistCheckin() {
  const { roleProfile } = useAuthStore()
  const clinicId = roleProfile?.clinicId
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [checking, setChecking] = useState<string | null>(null)

  useEffect(() => { loadAppointments() }, [])

  async function loadAppointments() {
    if (!clinicId) return
    setLoading(true)
    const res = await api.get('/receptionist/appointments', { clinicId, status: 'scheduled,confirmed', limit: 50 })
    if (res.success && (res as any).data) setAppointments((res as any).data)
    setLoading(false)
  }

  async function doCheckin(id: string) {
    setChecking(id)
    await api.post(`/receptionist/appointments/${id}/checkin`)
    setAppointments(prev => prev.map((a: any) => a.id === id ? { ...a, status: 'checked_in' } : a))
    setChecking(null)
  }

  const filtered = appointments.filter((a: any) => {
    if (!search) return true
    const name = a.patient?.user?.name || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Check-in de Pacientes</h1>
        <p className="font-inter text-sm text-[#8A8A8A]">Registrar la llegada de pacientes</p>
      </div>
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar paciente..."
          className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] pl-10 pr-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none" />
      </div>
      {filtered.length === 0 ? <EmptyState message="No hay pacientes esperando check-in" /> : (
        <div className="space-y-3">
          {filtered.map((apt: any) => (
            <OasisCard key={apt.id} hover={false} className="py-3 px-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${apt.status === 'checked_in' ? 'bg-[#E8F5EE]' : 'bg-[#FFF3E0]'}`}>
                  {apt.status === 'checked_in' ? <CheckCircle size={20} className="text-[#0E8C5E]" /> : <Clock size={20} className="text-[#F4A261]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-nunito font-bold text-[#4A4A4A]">{apt.patient?.user?.name || 'Paciente'}</p>
                  <p className="font-inter text-xs text-[#8A8A8A]">{apt.doctor?.user?.name || ''} - {apt.startTime}</p>
                </div>
                <StatusBadge status={apt.status === 'checked_in' ? 'completed' : 'pending'} />
                {apt.status !== 'checked_in' && (
                  <OasisButton size="sm" onClick={() => doCheckin(apt.id)} disabled={checking === apt.id}>
                    {checking === apt.id ? '...' : 'Check-in'}
                  </OasisButton>
                )}
              </div>
            </OasisCard>
          ))}
        </div>
      )}
    </div>
  )
}
