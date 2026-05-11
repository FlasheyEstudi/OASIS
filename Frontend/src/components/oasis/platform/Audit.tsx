
'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, Clock, User, Activity, ChevronDown, ChevronUp } from 'lucide-react'
import { OasisCard, DropLoader, ErrorState } from '../shared/shared-components'
import { useAuthStore } from '@/lib/auth-store'
import { api } from '@/lib/api-client'

export default function Audit() {
  const { roleProfile } = useAuthStore()
  const clinicId = roleProfile?.clinicId
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (clinicId) loadLogs()
  }, [clinicId])

  async function loadLogs() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/clinics/${clinicId}/audit-logs`)
      if (res.success && res.data) {
        setLogs(res.data)
      }
    } catch (err) {
      setError('No pudimos cargar la auditoría.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = logs.filter(l => 
    l.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entity.toLowerCase().includes(search.toLowerCase())
  )

  if (loading && logs.length === 0) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>
  if (error) return <ErrorState message={error} onRetry={loadLogs} />

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div>
        <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Auditoría de Sistema</h1>
        <p className="font-inter text-sm text-[#8A8A8A]">Registro histórico de acciones en la clínica</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Buscar por usuario, acción o entidad..." 
            className="w-full input-oasis border-2 border-[#E0E0E0] bg-white px-4 py-2.5 pl-10 text-sm font-inter rounded-full focus:border-[#0E8C5E] focus:outline-none" 
          />
        </div>
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E0E0E0] rounded-full text-xs font-inter text-[#4A4A4A] hover:bg-[#FAFAFA] transition-colors">
             <Filter size={14} /> Filtros Avanzados
           </button>
        </div>
      </div>

      <div className="bg-white card-oasis overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E0E0E0] bg-[#FAFAFA]">
                <th className="text-left font-inter font-semibold text-[10px] text-[#8A8A8A] px-5 py-4 uppercase tracking-widest">Fecha y Hora</th>
                <th className="text-left font-inter font-semibold text-[10px] text-[#8A8A8A] px-5 py-4 uppercase tracking-widest">Usuario</th>
                <th className="text-left font-inter font-semibold text-[10px] text-[#8A8A8A] px-5 py-4 uppercase tracking-widest">Acción</th>
                <th className="text-left font-inter font-semibold text-[10px] text-[#8A8A8A] px-5 py-4 uppercase tracking-widest">Entidad</th>
                <th className="text-right font-inter font-semibold text-[10px] text-[#8A8A8A] px-5 py-4 uppercase tracking-widest">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <React.Fragment key={log.id}>
                  <tr 
                    key={log.id} 
                    className={`border-b border-[#F0F0F0] hover:bg-[#E8F5EE]/20 transition-colors cursor-pointer ${expandedId === log.id ? 'bg-[#E8F5EE]/30' : ''}`}
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs font-inter text-[#4A4A4A]">
                        <Clock size={14} className="text-[#0E8C5E]" />
                        {new Date(log.createdAt).toLocaleString('es-NI', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-xs font-inter text-[#4A4A4A]">
                        <User size={14} className="text-[#0077B6]" />
                        <span className="font-semibold">{log.user?.name || 'Sistema'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        log.action === 'create' ? 'bg-[#E8F5EE] text-[#0E8C5E]' :
                        log.action === 'update' ? 'bg-[#E0F2FF] text-[#0077B6]' :
                        log.action === 'delete' ? 'bg-[#FEE2E2] text-[#EF4444]' :
                        'bg-[#F0F0F0] text-[#8A8A8A]'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-xs font-inter text-[#8A8A8A]">
                        <Activity size={14} />
                        {log.entity}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {expandedId === log.id ? <ChevronUp size={16} className="ml-auto" /> : <ChevronDown size={16} className="ml-auto" />}
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr>
                      <td colSpan={5} className="px-10 py-6 bg-[#FAFAFA] border-b border-[#E0E0E0]">
                        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-1 duration-200">
                          <div>
                            <h4 className="text-[10px] font-bold text-[#8A8A8A] uppercase mb-2">Valores Anteriores</h4>
                            <div className="bg-white p-3 rounded-xl border border-[#E0E0E0] text-[11px] font-mono overflow-auto max-h-40">
                              {log.oldValues ? <pre>{JSON.stringify(log.oldValues, null, 2)}</pre> : <span className="italic text-[#8A8A8A]">N/A</span>}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-bold text-[#8A8A8A] uppercase mb-2">Valores Nuevos</h4>
                            <div className="bg-white p-3 rounded-xl border border-[#E0E0E0] text-[11px] font-mono overflow-auto max-h-40">
                               {log.newValues ? <pre>{JSON.stringify(log.newValues, null, 2)}</pre> : <span className="italic text-[#8A8A8A]">N/A</span>}
                            </div>
                          </div>
                          <div className="md:col-span-2 flex items-center justify-between pt-2">
                             <p className="text-[10px] font-inter text-[#8A8A8A]">Entidad ID: <span className="font-mono">{log.entityId}</span></p>
                             <p className="text-[10px] font-inter text-[#8A8A8A]">IP: {log.ipAddress || 'Interna'}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
