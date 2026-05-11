'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, OasisButton, DropLoader, EmptyState, StatusBadge } from '@/components/oasis/shared/shared-components'
import { Video, Phone, Monitor, ExternalLink } from 'lucide-react'

export default function DoctorTeleconsult() {
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLink, setActiveLink] = useState<string | null>(null)
  const [activeAptId, setActiveAptId] = useState<string | null>(null)

  useEffect(() => { loadAppointments() }, [])

  async function loadAppointments() {
    if (!user?.id) return
    setLoading(true)
    const res = await api.get(`/doctors/${user.id}/appointments`, { status: 'confirmed,checked_in', limit: 20 })
    if (res.success && (res as any).data) {
      const teleconsults = ((res as any).data || []).filter((a: any) => a.type === 'teleconsult')
      setAppointments(teleconsults)
    }
    setLoading(false)
  }

  async function startTeleconsult(aptId: string) {
    const res = await api.post(`/appointments/${aptId}/start-teleconsult`)
    if (res.success && (res as any).data?.teleconsultLink) {
      setActiveLink((res as any).data.teleconsultLink)
      setActiveAptId(aptId)
    }
  }

  async function getLink(aptId: string) {
    const res = await api.get(`/appointments/${aptId}/teleconsult-link`)
    if (res.success && (res as any).data?.teleconsultLink) {
      setActiveLink((res as any).data.teleconsultLink)
      setActiveAptId(aptId)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div><h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Teleconsulta</h1><p className="font-inter text-sm text-[#8A8A8A]">Consultas médicas en línea</p></div>

      {activeLink && (
        <OasisCard className="overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-nunito font-bold text-lg text-[#0E8C5E] flex items-center gap-2"><Monitor size={20} /> Teleconsulta en Curso</h2>
            <div className="flex gap-2">
              <OasisButton variant="blue" size="sm" onClick={() => window.open(activeLink, '_blank')}><ExternalLink size={14} /> Abrir Jitsi</OasisButton>
              <OasisButton variant="danger" size="sm" onClick={() => { setActiveLink(null); setActiveAptId(null) }}>Terminar</OasisButton>
            </div>
          </div>
          <div className="bg-[#1a1a2e] rounded-[14px] aspect-video flex items-center justify-center">
            <iframe src={activeLink} allow="camera; microphone; fullscreen" className="w-full h-full rounded-[14px]" style={{ minHeight: '300px' }} />
          </div>
        </OasisCard>
      )}

      <OasisCard>
        <h2 className="font-nunito font-bold text-lg text-[#4A4A4A] mb-4">Teleconsultas Programadas</h2>
        {appointments.length === 0 ? <EmptyState message="No hay teleconsultas programadas" /> : (
          <div className="space-y-3">
            {appointments.map((apt: any) => (
              <div key={apt.id} className="flex items-center gap-4 p-3 rounded-[14px] border border-[#E0E0E0] hover:border-[#0E8C5E]/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#E0F2FF] flex items-center justify-center"><Video size={20} className="text-[#0077B6]" /></div>
                <div className="flex-1">
                  <p className="font-inter font-semibold text-sm text-[#4A4A4A]">{apt.patient?.user?.name || 'Paciente'}</p>
                  <p className="font-inter text-xs text-[#8A8A8A]">{apt.date?.split('T')[0]} - {apt.startTime}</p>
                </div>
                <StatusBadge status={apt.status === 'in_progress' ? 'completed' : 'active'} />
                {apt.teleconsultLink ? (
                  <OasisButton variant="blue" size="sm" onClick={() => getLink(apt.id)}><Video size={14} /> Unirse</OasisButton>
                ) : (
                  <OasisButton size="sm" onClick={() => startTeleconsult(apt.id)}><Phone size={14} /> Iniciar</OasisButton>
                )}
              </div>
            ))}
          </div>
        )}
      </OasisCard>
    </div>
  )
}
