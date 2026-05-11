'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { useNavigation } from '@/components/oasis/navigation-store'
import { OasisCard, DropLoader, ErrorState } from '@/components/oasis/shared/shared-components'
import { Stethoscope, Users, Calendar, FileText, Video, Clock } from 'lucide-react'

export default function DoctorDashboard() {
  const { user } = useAuthStore()
  const { navigate } = useNavigation()
  const [appointments, setAppointments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const doctorId = user?.id
    if (!doctorId) { setLoading(false); return }
    const today = new Date().toISOString().split('T')[0]
    const [aptRes, patRes] = await Promise.all([
      api.get(`/doctors/${doctorId}/appointments`, { date: today, limit: 10 }),
      api.get(`/doctors/${doctorId}/patients`, { limit: 5 }),
    ])
    if (aptRes.success && (aptRes as any).data) setAppointments((aptRes as any).data)
    if (patRes.success && (patRes as any).data) setPatients((patRes as any).data)
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  const quickActions = [
    { label: 'Mis Citas', view: 'doctor-appointments', icon: Calendar, color: '#0E8C5E', bg: '#E8F5EE' },
    { label: 'Recetas', view: 'doctor-prescriptions', icon: FileText, color: '#0077B6', bg: '#E0F2FF' },
    { label: 'Teleconsulta', view: 'doctor-teleconsult', icon: Video, color: '#0E8C5E', bg: '#E8F5EE' },
    { label: 'Mi Horario', view: 'doctor-schedule', icon: Clock, color: '#F4A261', bg: '#FFF3E0' },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Panel Médico</h1>
        <p className="font-inter text-sm text-[#8A8A8A]">Bienvenido, Dr. {user?.name?.split(' ').pop() || ''}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OasisCard onClick={() => navigate('doctor-appointments')} className="cursor-pointer">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center"><Calendar size={20} className="text-[#0E8C5E]" /></div>
            <div><p className="font-nunito font-bold text-2xl text-[#0E8C5E]">{appointments.length}</p><p className="font-inter text-xs text-[#8A8A8A]">Citas hoy</p></div></div>
        </OasisCard>
        <OasisCard onClick={() => navigate('doctor-patients')} className="cursor-pointer">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#E0F2FF] flex items-center justify-center"><Users size={20} className="text-[#0077B6]" /></div>
            <div><p className="font-nunito font-bold text-2xl text-[#0077B6]">{patients.length}+</p><p className="font-inter text-xs text-[#8A8A8A]">Pacientes</p></div></div>
        </OasisCard>
        <OasisCard onClick={() => navigate('doctor-prescriptions')} className="cursor-pointer">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#FFF3E0] flex items-center justify-center"><FileText size={20} className="text-[#F4A261]" /></div>
            <div><p className="font-nunito font-bold text-2xl text-[#F4A261]">-</p><p className="font-inter text-xs text-[#8A8A8A]">Recetas</p></div></div>
        </OasisCard>
        <OasisCard onClick={() => navigate('doctor-teleconsult')} className="cursor-pointer">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center"><Video size={20} className="text-[#0E8C5E]" /></div>
            <div><p className="font-nunito font-bold text-2xl text-[#0E8C5E]">-</p><p className="font-inter text-xs text-[#8A8A8A]">Teleconsultas</p></div></div>
        </OasisCard>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <OasisCard>
          <h2 className="font-nunito font-bold text-lg text-[#4A4A4A] mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(a => (
              <button key={a.view} onClick={() => navigate(a.view as any)}
                className="flex items-center gap-3 p-3 rounded-[14px] border border-[#E0E0E0] hover:border-[#0E8C5E]/30 hover:shadow-md transition-all text-left">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: a.bg }}><a.icon size={16} style={{ color: a.color }} /></div>
                <span className="font-inter font-medium text-sm text-[#4A4A4A]">{a.label}</span>
              </button>
            ))}
          </div>
        </OasisCard>

        <OasisCard>
          <h2 className="font-nunito font-bold text-lg text-[#4A4A4A] mb-4">Próximas Citas</h2>
          {appointments.length === 0 ? <p className="font-inter text-sm text-[#8A8A8A]">Sin citas programadas hoy</p> : (
            <div className="space-y-2">
              {appointments.slice(0, 5).map((apt: any) => (
                <div key={apt.id} className="flex items-center gap-3 p-2 rounded-[12px] hover:bg-[#E8F5EE]/30 transition-colors">
                  <Clock size={14} className="text-[#8A8A8A]" />
                  <span className="font-inter text-sm font-medium text-[#4A4A4A]">{apt.startTime}</span>
                  <span className="font-inter text-sm text-[#8A8A8A]">{apt.patient?.user?.name || 'Paciente'}</span>
                </div>
              ))}
            </div>
          )}
        </OasisCard>
      </div>
    </div>
  )
}
