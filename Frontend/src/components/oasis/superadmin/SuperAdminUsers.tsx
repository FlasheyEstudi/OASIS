'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { OasisCard, DropLoader, ErrorState, EmptyState, StatusBadge } from '@/components/oasis/shared/shared-components'
import { Users, Search, Stethoscope, Heart } from 'lucide-react'

export default function SuperAdminUsers() {
  const [tab, setTab] = useState<'doctors' | 'patients'>('doctors')
  const [doctors, setDoctors] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => { loadUsers() }, [tab, page, search])

  async function loadUsers() {
    setLoading(true); setError(null)
    if (tab === 'doctors') {
      const res = await api.get('/doctors', { search: search || undefined, page, limit: 20 })
      if (res.success && (res as any).data) { setDoctors((res as any).data); setTotalPages((res as any).pagination?.totalPages || 1) }
    } else {
      const res = await api.get('/patients', { search: search || undefined, page, limit: 20 })
      if (res.success && (res as any).data) { setPatients((res as any).data); setTotalPages((res as any).pagination?.totalPages || 1) }
    }
    setLoading(false)
  }

  const data = tab === 'doctors' ? doctors : patients

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Usuarios</h1>
        <p className="font-inter text-sm text-[#8A8A8A]">Gestión de doctores y pacientes</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => { setTab('doctors'); setPage(1) }}
          className={`capsule px-4 py-2 font-inter font-semibold text-sm transition-all ${tab === 'doctors' ? 'oasis-gradient text-white shadow-md' : 'bg-[#E8F5EE] text-[#0E8C5E]'}`}>
          <Stethoscope size={16} className="inline mr-1.5" />Doctores
        </button>
        <button onClick={() => { setTab('patients'); setPage(1) }}
          className={`capsule px-4 py-2 font-inter font-semibold text-sm transition-all ${tab === 'patients' ? 'oasis-gradient text-white shadow-md' : 'bg-[#E8F5EE] text-[#0E8C5E]'}`}>
          <Heart size={16} className="inline mr-1.5" />Pacientes
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder={`Buscar ${tab === 'doctors' ? 'doctor' : 'paciente'}...`}
          className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] pl-10 pr-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none" />
      </div>

      {loading ? <div className="flex justify-center py-12"><DropLoader size={40} /></div> :
        data.length === 0 ? <EmptyState message={`No se encontraron ${tab === 'doctors' ? 'doctores' : 'pacientes'}`} /> : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((item: any) => (
              <OasisCard key={item.id}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tab === 'doctors' ? 'bg-[#E8F5EE]' : 'bg-[#E0F2FF]'}`}>
                    {tab === 'doctors' ? <Stethoscope size={20} className="text-[#0E8C5E]" /> : <Heart size={20} className="text-[#0077B6]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-nunito font-bold text-[#4A4A4A] truncate">{item.user?.name || item.name || 'Sin nombre'}</h3>
                    <p className="font-inter text-xs text-[#8A8A8A]">{item.user?.email || item.email || ''}</p>
                  </div>
                  <StatusBadge status={item.isActive !== false ? 'active' : 'inactive'} />
                </div>
                {tab === 'doctors' && (
                  <div className="mt-3 pt-3 border-t border-[#E0E0E0] flex gap-4 text-xs font-inter text-[#8A8A8A]">
                    <span>Especialidad: {item.specialty || '-'}</span>
                    <span>Licencia: {item.licenseNumber || '-'}</span>
                  </div>
                )}
              </OasisCard>
            ))}
          </div>
        )
      }
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
