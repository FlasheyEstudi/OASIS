'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { OasisCard, DropLoader, ErrorState, EmptyState } from '@/components/oasis/shared/shared-components'
import { Shield, Search, Clock, User } from 'lucide-react'

export default function SuperAdminAudit() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [clinics, setClinics] = useState<any[]>([])

  useEffect(() => { loadClinics() }, [])
  useEffect(() => { if (clinics.length > 0) loadAudit() }, [page, clinics])

  async function loadClinics() {
    const res = await api.get('/clinics', { limit: 1 })
    if (res.success && (res as any).data) setClinics((res as any).data)
  }

  async function loadAudit() {
    if (clinics.length === 0) { setLoading(false); return }
    setLoading(true); setError(null)
    const clinicId = clinics[0]?.id
    if (!clinicId) { setLoading(false); return }
    const res = await api.get(`/clinics/${clinicId}/audit-logs`, { page, limit: 20 })
    if (res.success && (res as any).data) { setLogs((res as any).data); setTotalPages((res as any).pagination?.totalPages || 1) }
    else { setError('Error cargando auditoría') }
    setLoading(false)
  }

  const actionColors: Record<string, string> = {
    create: 'bg-[#E8F5EE] text-[#0E8C5E]', update: 'bg-[#E0F2FF] text-[#0077B6]', delete: 'bg-[#FEE2E2] text-[#EF4444]',
    login: 'bg-[#FFF3E0] text-[#F4A261]', default: 'bg-[#E0E0E0] text-[#8A8A8A]',
  }

  if (loading && logs.length === 0) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>
  if (error) return <ErrorState message={error} onRetry={loadAudit} />

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Auditoría Global</h1>
        <p className="font-inter text-sm text-[#8A8A8A]">Registro de actividades del sistema</p>
      </div>
      {logs.length === 0 ? <EmptyState message="No hay registros de auditoría" /> : (
        <div className="space-y-3">
          {logs.map((log: any, i: number) => (
            <OasisCard key={log.id || i} hover={false} className="py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                  <Shield size={14} className="text-[#8A8A8A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`capsule px-2 py-0.5 text-[10px] font-inter font-semibold ${actionColors[log.action] || actionColors.default}`}>
                      {log.action?.toUpperCase() || 'ACCIÓN'}
                    </span>
                    <span className="font-inter text-sm text-[#4A4A4A] truncate">{log.entity || 'Sistema'}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs font-inter text-[#8A8A8A]">
                    <span className="flex items-center gap-1"><User size={10} />{log.user?.name || 'Sistema'}</span>
                    <span className="flex items-center gap-1"><Clock size={10} />{log.createdAt ? new Date(log.createdAt).toLocaleString('es-NI') : '-'}</span>
                  </div>
                </div>
              </div>
            </OasisCard>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="capsule px-4 py-2 text-xs font-inter border border-[#E0E0E0] disabled:opacity-40">Anterior</button>
          <span className="font-inter text-sm text-[#8A8A8A] self-center">{page}/{totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="capsule px-4 py-2 text-xs font-inter border border-[#E0E0E0] disabled:opacity-40">Siguiente</button>
        </div>
      )}
    </div>
  )
}
