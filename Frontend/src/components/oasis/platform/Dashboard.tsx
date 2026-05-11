'use client'

import { useState, useEffect } from 'react'
import { Users, Calendar, FileText, DollarSign, TrendingUp, Clock, MapPin } from 'lucide-react'
import { OasisCard, DropLoader, ErrorState } from '../shared/shared-components'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/clinics/stats')
      if (res.success && res.data) {
        setData(res.data)
      }
    } catch (err) {
      setError('No pudimos cargar las estadísticas.')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !data) return <div className="flex items-center justify-center min-h-[60vh]"><DropLoader size={48} /></div>
  if (error) return <ErrorState message={error} onRetry={loadStats} />
  if (!data) return null

  const metrics = [
    { label: 'Pacientes Activos', value: data.metrics.patients, change: '+12%', icon: Users, color: '#0E8C5E' },
    { label: 'Citas Hoy', value: data.metrics.appointmentsToday, change: '+3', icon: Calendar, color: '#0077B6' },
    { label: 'Recetas Emitidas (Mes)', value: data.metrics.prescriptionsMonth, change: '+8%', icon: FileText, color: '#0E8C5E' },
    { label: 'Ingresos del Mes', value: `C$${data.metrics.revenueMonth.toLocaleString()}`, change: '+18%', icon: DollarSign, color: '#0077B6' },
  ]

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Dashboard</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Bienvenido, {user?.name}</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar paciente..."
              className="input-oasis border-2 border-[#E0E0E0] bg-white px-4 py-2 pl-10 text-sm font-inter rounded-full w-64 focus:border-[#0E8C5E] focus:outline-none"
            />
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <OasisCard key={i} className="!p-4 md:!p-5">
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${m.color}15` }}
              >
                <m.icon size={20} style={{ color: m.color }} />
              </div>
              <span className="text-xs font-inter font-semibold text-[#0E8C5E] bg-[#E8F5EE] px-2 py-0.5 rounded-full">
                {m.change}
              </span>
            </div>
            <div className="font-nunito font-bold text-xl md:text-2xl text-[#4A4A4A]">{m.value}</div>
            <div className="font-inter text-xs text-[#8A8A8A] mt-0.5">{m.label}</div>
          </OasisCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <OasisCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-nunito font-bold text-lg text-[#4A4A4A]">Ingresos de la Semana</h3>
            <div className="flex items-center gap-2 text-xs font-inter text-[#8A8A8A]">
              <TrendingUp size={14} className="text-[#0E8C5E]" />
              Sincronizado en tiempo real
            </div>
          </div>
          <div className="flex items-end gap-2 md:gap-4 h-48">
            {data.weeklyData.map((d: any, i: number) => {
              const maxVal = Math.max(...data.weeklyData.map((w: any) => w.value)) || 1
              const height = (d.value / maxVal) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative" style={{ height: '160px' }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-[10px] transition-all duration-500"
                      style={{
                        height: `${Math.max(5, height)}%`,
                        background: i === data.weeklyData.length - 1 ? 'linear-gradient(135deg, #0E8C5E, #0077B6)' : '#E8F5EE',
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-inter text-[#8A8A8A]">{d.day}</span>
                </div>
              )
            })}
          </div>
        </OasisCard>

        {/* Upcoming Appointments */}
        <OasisCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-nunito font-bold text-lg text-[#4A4A4A]">Próximas Citas</h3>
            <Clock size={16} className="text-[#8A8A8A]" />
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto oasis-scroll">
            {data.upcomingAppointments.length === 0 ? (
              <p className="text-center py-10 text-xs font-inter text-[#8A8A8A]">No hay citas próximas.</p>
            ) : (
              data.upcomingAppointments.map((apt: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-[14px] bg-[#FAFAFA] hover:bg-[#E8F5EE]/50 transition-colors"
                >
                  <Avatar className="w-9 h-9">
                    <AvatarFallback
                      className="font-nunito font-bold text-xs"
                      style={{ backgroundColor: `${apt.color}15`, color: apt.color }}
                    >
                      {apt.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-inter font-semibold text-sm text-[#4A4A4A] truncate">{apt.name}</div>
                    <div className="font-inter text-xs text-[#8A8A8A]">{apt.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-inter font-semibold text-xs text-[#0E8C5E]">{apt.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </OasisCard>
      </div>
    </div>
  )
}

function SearchIcon({ size, className }: { size: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
}

