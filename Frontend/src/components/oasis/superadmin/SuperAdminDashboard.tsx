'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useNavigation } from '@/components/oasis/navigation-store'
import { OasisCard, DropLoader, ErrorState } from '@/components/oasis/shared/shared-components'
import { Building2, Pill, Stethoscope, Users, Shield, Activity, ArrowRight } from 'lucide-react'

interface StatData { clinics: number; pharmacies: number; doctors: number; patients: number }

export default function SuperAdminDashboard() {
  const { navigate } = useNavigation()
  const [stats, setStats] = useState<StatData | null>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    setLoading(true); setError(null)
    try {
      const [clinicsRes, pharmRes, docsRes, patsRes] = await Promise.all([
        api.get('/clinics', { limit: 1 }),
        api.get('/pharmacies', { limit: 1 }),
        api.get('/doctors', { limit: 1 }),
        api.get('/patients', { limit: 1 }),
      ])
      setStats({
        clinics: (clinicsRes as any)?.pagination?.total || 0,
        pharmacies: (pharmRes as any)?.pagination?.total || 0,
        doctors: (docsRes as any)?.pagination?.total || 0,
        patients: (patsRes as any)?.pagination?.total || 0,
      })
    } catch { setError('Error cargando datos') }
    finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>
  if (error) return <ErrorState message={error} onRetry={loadDashboard} />

  const statCards = [
    { label: 'Clínicas', value: stats?.clinics || 0, icon: Building2, color: '#0E8C5E', bg: '#E8F5EE', view: 'superadmin-clinics' as const },
    { label: 'Farmacias', value: stats?.pharmacies || 0, icon: Pill, color: '#0077B6', bg: '#E0F2FF', view: 'superadmin-pharmacies' as const },
    { label: 'Doctores', value: stats?.doctors || 0, icon: Stethoscope, color: '#0E8C5E', bg: '#E8F5EE', view: 'superadmin-users' as const },
    { label: 'Pacientes', value: stats?.patients || 0, icon: Users, color: '#F4A261', bg: '#FFF3E0', view: 'superadmin-users' as const },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Dashboard Global</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Vista general del sistema OASIS</p>
        </div>
        <Shield size={24} className="text-[#4A4A4A]" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <OasisCard key={s.label} onClick={() => navigate(s.view)} className="cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <p className="font-nunito font-bold text-2xl" style={{ color: s.color }}>{s.value}</p>
                <p className="font-inter text-xs text-[#8A8A8A]">{s.label}</p>
              </div>
            </div>
          </OasisCard>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <OasisCard className="md:col-span-2">
          <h2 className="font-nunito font-bold text-lg text-[#4A4A4A] mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Gestionar Clínicas', view: 'superadmin-clinics' as const, icon: Building2, color: '#0E8C5E' },
              { label: 'Gestionar Farmacias', view: 'superadmin-pharmacies' as const, icon: Pill, color: '#0077B6' },
              { label: 'Ver Usuarios', view: 'superadmin-users' as const, icon: Users, color: '#F4A261' },
              { label: 'Auditoría', view: 'superadmin-audit' as const, icon: Shield, color: '#4A4A4A' },
            ].map((a) => (
              <button key={a.view} onClick={() => navigate(a.view)}
                className="flex items-center gap-3 p-3 rounded-[14px] border border-[#E0E0E0] hover:border-[#0E8C5E]/30 hover:shadow-md transition-all text-left">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#E8F5EE]">
                  <a.icon size={16} style={{ color: a.color }} />
                </div>
                <span className="font-inter font-medium text-sm text-[#4A4A4A]">{a.label}</span>
                <ArrowRight size={14} className="ml-auto text-[#8A8A8A]" />
              </button>
            ))}
          </div>
        </OasisCard>

        <OasisCard>
          <h2 className="font-nunito font-bold text-lg text-[#4A4A4A] mb-3">Estado del Sistema</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#0E8C5E]" />
              <span className="font-inter text-sm text-[#4A4A4A]">API Operativa</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[#0077B6]" />
              <span className="font-inter text-sm text-[#4A4A4A]">142 endpoints activos</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-[#F4A261]" />
              <span className="font-inter text-sm text-[#4A4A4A]">22 módulos</span>
            </div>
          </div>
        </OasisCard>
      </div>
    </div>
  )
}
