'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, OasisButton, DropLoader, EmptyState, StatusBadge } from '@/components/oasis/shared/shared-components'
import { Users, Search, Plus, Heart, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function DoctorPatients() {
  const { user } = useAuthStore()
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAdd, setShowAdd] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [history, setHistory] = useState<any>(null)

  useEffect(() => { loadPatients() }, [page, search])

  async function loadPatients() {
    if (!user?.id) return
    setLoading(true)
    const res = await api.get(`/doctors/${user.id}/patients`, { search: search || undefined, page, limit: 20 })
    if (res.success && (res as any).data) { setPatients((res as any).data); setTotalPages((res as any).pagination?.totalPages || 1) }
    setLoading(false)
  }

  async function searchAllPatients(q: string) {
    setPatientSearch(q)
    if (q.length < 2) { setPatientResults([]); return }
    const res = await api.get('/patients', { search: q, limit: 10 })
    if (res.success && (res as any).data) setPatientResults((res as any).data)
  }

  async function assignPatient(patientId: string) {
    if (!user?.id) return
    await api.post(`/doctors/${user.id}/patients`, { patientId })
    setShowAdd(false); setPatientSearch(''); setPatientResults([]); loadPatients()
  }

  async function viewHistory(patientId: string) {
    const res = await api.get(`/patients/${patientId}/history`)
    if (res.success && (res as any).data) { setHistory((res as any).data); setSelectedPatient(patientId) }
  }

  if (loading && patients.length === 0) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Mis Pacientes</h1><p className="font-inter text-sm text-[#8A8A8A]">Pacientes asignados</p></div>
        <OasisButton onClick={() => setShowAdd(true)}><Plus size={16} /> Asignar Paciente</OasisButton>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Buscar paciente..."
          className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] pl-10 pr-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none" />
      </div>

      {patients.length === 0 ? <EmptyState message="No tienes pacientes asignados" /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patients.map((p: any) => (
            <OasisCard key={p.id}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center"><Heart size={20} className="text-[#0E8C5E]" /></div>
                <div><h3 className="font-nunito font-bold text-[#4A4A4A]">{p.user?.name || 'Paciente'}</h3><p className="font-inter text-xs text-[#8A8A8A]">{p.user?.email || ''}</p></div>
              </div>
              <div className="flex gap-2 text-xs font-inter text-[#8A8A8A]">
                {p.bloodType && <span className="bg-[#FEE2E2] text-[#EF4444] capsule px-2 py-0.5">{p.bloodType}</span>}
                {p.allergies && <span className="bg-[#FFF3E0] text-[#F4A261] capsule px-2 py-0.5">Alergias</span>}
              </div>
              <button onClick={() => viewHistory(p.id)} className="mt-3 text-[#0077B6] font-inter text-xs hover:underline flex items-center gap-1"><FileText size={12} />Ver historial</button>
            </OasisCard>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Asignar Paciente</DialogTitle></DialogHeader>
          <div className="mt-4">
            <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
              <input value={patientSearch} onChange={e => searchAllPatients(e.target.value)} placeholder="Buscar por nombre o email..."
                className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] pl-10 pr-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none" /></div>
            {patientResults.length > 0 && (
              <div className="mt-2 border border-[#E0E0E0] rounded-[14px] max-h-48 overflow-y-auto">
                {patientResults.map((p: any) => (
                  <button key={p.id} onClick={() => assignPatient(p.id)} className="w-full text-left px-4 py-3 hover:bg-[#E8F5EE] transition-colors border-b border-[#E0E0E0] last:border-0">
                    <p className="font-inter font-semibold text-sm text-[#4A4A4A]">{p.user?.name || p.id}</p>
                    <p className="font-inter text-xs text-[#8A8A8A]">{p.user?.email || ''}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedPatient} onOpenChange={() => { setSelectedPatient(null); setHistory(null) }}>
        <DialogContent className="modal-oasis max-w-lg">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Historial Médico</DialogTitle></DialogHeader>
          {history && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-sm font-inter">
                {history.patient?.bloodType && <div><span className="text-xs text-[#8A8A8A]">Tipo Sangre</span><p className="font-semibold text-[#4A4A4A]">{history.patient.bloodType}</p></div>}
                <div><span className="text-xs text-[#8A8A8A]">Alergias</span><p className="font-semibold text-[#4A4A4A]">{history.patient?.allergies ? JSON.parse(history.patient.allergies).join(', ') : 'Ninguna'}</p></div>
                <div><span className="text-xs text-[#8A8A8A]">Condiciones</span><p className="font-semibold text-[#4A4A4A]">{history.patient?.chronicConditions ? JSON.parse(history.patient.chronicConditions).join(', ') : 'Ninguna'}</p></div>
              </div>
              {history.summary && (
                <div className="bg-[#E8F5EE]/30 rounded-[14px] p-3 text-sm font-inter">
                  <p>Recetas activas: <strong>{history.summary.activePrescriptions || 0}</strong></p>
                  <p>Citas completadas: <strong>{history.summary.completedAppointments || 0}</strong></p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
