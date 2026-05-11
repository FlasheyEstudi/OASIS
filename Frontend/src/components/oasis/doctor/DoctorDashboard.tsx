
'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { useNavigation } from '@/components/oasis/navigation-store'
import { OasisCard, DropLoader, ErrorState, OasisButton, OasisIconButton } from '@/components/oasis/shared/shared-components'
import { Stethoscope, Users, Calendar, FileText, Video, Clock, TrendingUp, ChevronRight, Bell } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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
    try {
      const [aptRes, patRes] = await Promise.all([
        api.get(`/doctors/${doctorId}/appointments`, { date: today, limit: 10 }),
        api.get(`/doctors/${doctorId}/patients`, { limit: 5 }),
      ])
      if (aptRes.success && aptRes.data) setAppointments(aptRes.data)
      if (patRes.success && patRes.data) setPatients(patRes.data)
    } catch (err) {}
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  const quickActions = [
    { label: 'Agenda Diaria', view: 'doctor-appointments', icon: Calendar, color: '#0E8C5E', bg: '#E8F5EE' },
    { label: 'Nueva Receta', view: 'doctor-prescriptions', icon: FileText, color: '#0077B6', bg: '#E0F2FF' },
    { label: 'Mis Pacientes', view: 'doctor-patients', icon: Users, color: '#F4A261', bg: '#FFF3E0' },
    { label: 'Teleconsulta', view: 'doctor-teleconsult', icon: Video, color: '#0E8C5E', bg: '#E8F5EE' },
  ]

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Panel Médico</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Bienvenido, Dr. {user?.name?.split(' ').pop() || ''}</p>
        </div>
        <button className="relative p-2 bg-white border border-[#E0E0E0] rounded-full text-[#8A8A8A] hover:text-[#0E8C5E] transition-all">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#EF4444] border-2 border-white rounded-full"></span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Citas Hoy', value: appointments.length, icon: Calendar, color: '#0E8C5E' },
          { label: 'Pacientes', value: '48', icon: Users, color: '#0077B6' },
          { label: 'Recetas Mes', value: '124', icon: FileText, color: '#F4A261' },
          { label: 'Teleconsultas', value: '5', icon: Video, color: '#0E8C5E' },
        ].map((stat, i) => (
          <OasisCard key={i} className="group hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="font-nunito font-bold text-2xl text-[#4A4A4A]">{stat.value}</p>
                <p className="font-inter text-[10px] text-[#8A8A8A] uppercase font-bold tracking-wider">{stat.label}</p>
              </div>
            </div>
          </OasisCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <OasisCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-nunito font-bold text-lg text-[#4A4A4A]">Próximas Citas</h2>
              <OasisButton variant="ghost" size="sm" onClick={() => navigate('doctor-appointments')}>Ver todas</OasisButton>
            </div>
            {appointments.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center">
                 <Calendar size={40} className="text-[#E0E0E0] mb-2" />
                 <p className="font-inter text-sm text-[#8A8A8A]">No hay citas programadas para hoy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="flex items-center gap-4 p-3 rounded-2xl bg-[#FAFAFA] border border-transparent hover:border-[#E8F5EE] hover:bg-white transition-all group">
                    <div className="w-12 h-12 flex-shrink-0 bg-white rounded-xl border border-[#E0E0E0] flex flex-col items-center justify-center">
                       <span className="font-nunito font-bold text-[#0E8C5E] text-sm leading-none">{apt.startTime?.split(':')[0]}</span>
                       <span className="font-inter text-[8px] text-[#8A8A8A] uppercase font-bold">{apt.startTime?.split(':')[1]} min</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-inter font-bold text-sm text-[#4A4A4A] truncate">{apt.patient?.user?.name}</p>
                      <p className="font-inter text-xs text-[#8A8A8A] flex items-center gap-1">
                         {apt.type === 'teleconsult' ? <Video size={10} className="text-[#0077B6]" /> : <MapPin size={10} className="text-[#0E8C5E]" />}
                         {apt.type === 'teleconsult' ? 'Teleconsulta' : 'Consultorio 2B'}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                       <OasisIconButton icon={<ChevronRight size={16} />} label="Ver Detalle" variant="ghost" size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </OasisCard>

          <OasisCard>
             <div className="flex items-center justify-between mb-6">
                <h2 className="font-nunito font-bold text-lg text-[#4A4A4A]">Productividad</h2>
                <div className="flex items-center gap-2 text-xs font-inter text-[#0E8C5E] font-bold">
                   <TrendingUp size={14} /> +8% vs ayer
                </div>
             </div>
             <div className="h-32 flex items-end gap-2">
                {[40, 65, 45, 90, 55, 80, 70].map((v, i) => (
                  <div key={i} className="flex-1 bg-[#E8F5EE] rounded-t-lg transition-all hover:bg-[#0E8C5E]" style={{ height: `${v}%` }} />
                ))}
             </div>
             <div className="flex justify-between mt-2 px-1">
                {['L','M','X','J','V','S','D'].map(d => <span key={d} className="text-[10px] font-inter text-[#8A8A8A]">{d}</span>)}
             </div>
          </OasisCard>
        </div>

        <div className="space-y-6">
           <OasisCard>
              <h2 className="font-nunito font-bold text-lg text-[#4A4A4A] mb-6">Acciones Rápidas</h2>
              <div className="grid grid-cols-1 gap-3">
                 {quickActions.map(a => (
                   <button 
                     key={a.view} 
                     onClick={() => navigate(a.view as any)}
                     className="flex items-center gap-4 p-4 rounded-2xl border-2 border-[#FAFAFA] hover:border-[#0E8C5E]/30 hover:bg-[#E8F5EE]/10 transition-all text-left"
                   >
                     <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: a.bg, color: a.color }}>
                        <a.icon size={20} />
                     </div>
                     <span className="font-inter font-bold text-sm text-[#4A4A4A]">{a.label}</span>
                   </button>
                 ))}
              </div>
           </OasisCard>

           <OasisCard className="!bg-gradient-to-br from-[#0E8C5E] to-[#0077B6] text-white">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-white/20 rounded-lg"><Stethoscope size={20} /></div>
                 <h3 className="font-nunito font-bold">Resumen Semanal</h3>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm font-inter">
                    <span>Pacientes atendidos</span>
                    <span className="font-bold">42</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-inter">
                    <span>Recetas firmadas</span>
                    <span className="font-bold">18</span>
                 </div>
                 <div className="pt-4 border-t border-white/20">
                    <p className="text-[10px] font-inter text-white/70 italic leading-tight">Has superado tu promedio de atención semanal en un 15%.</p>
                 </div>
              </div>
           </OasisCard>
        </div>
      </div>
    </div>
  )
}

function MapPin({ size, className }: { size: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
}
