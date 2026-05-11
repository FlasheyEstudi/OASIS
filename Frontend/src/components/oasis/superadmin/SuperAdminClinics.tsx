'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { OasisCard, OasisButton, DropLoader, ErrorState, EmptyState, StatusBadge } from '@/components/oasis/shared/shared-components'
import { Building2, Search, Plus, MapPin, Phone, Mail, Eye, Pencil, Trash2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function SuperAdminClinics() {
  const [clinics, setClinics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedClinic, setSelectedClinic] = useState<any>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', department: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadClinics() }, [page, search])

  async function loadClinics() {
    setLoading(true); setError(null)
    const res = await api.get('/clinics', { search: search || undefined, page, limit: 20 })
    if (res.success && (res as any).data) {
      setClinics((res as any).data)
      setTotalPages((res as any).pagination?.totalPages || 1)
    } else { setError('Error cargando clínicas') }
    setLoading(false)
  }

  async function createClinic() {
    setSaving(true)
    const res = await api.post('/clinics', form)
    if (res.success) { setShowCreate(false); setForm({ name: '', phone: '', email: '', address: '', city: '', department: '' }); loadClinics() }
    setSaving(false)
  }

  async function toggleActive(clinic: any) {
    if (clinic.isActive) { await api.delete(`/clinics/${clinic.id}`) }
    else { await api.put(`/clinics/${clinic.id}`, { isActive: true }) }
    loadClinics()
  }

  if (loading && clinics.length === 0) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>
  if (error) return <ErrorState message={error} onRetry={loadClinics} />

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Clínicas</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Gestión de todas las clínicas del sistema</p>
        </div>
        <OasisButton onClick={() => setShowCreate(true)}><Plus size={16} /> Nueva Clínica</OasisButton>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar por nombre..." className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] pl-10 pr-4 py-2.5 font-inter text-sm text-[#4A4A4A] focus:border-[#0E8C5E] focus:outline-none" />
      </div>

      {clinics.length === 0 ? <EmptyState message="No se encontraron clínicas" /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clinics.map((c: any) => (
            <OasisCard key={c.id} onClick={() => setSelectedClinic(c)} className="cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center"><Building2 size={20} className="text-[#0E8C5E]" /></div>
                  <div>
                    <h3 className="font-nunito font-bold text-[#4A4A4A]">{c.name}</h3>
                    <p className="font-inter text-xs text-[#8A8A8A]">{c.city || 'Sin ciudad'}</p>
                  </div>
                </div>
                <StatusBadge status={c.isActive ? 'active' : 'inactive'} />
              </div>
              <div className="space-y-1 text-xs font-inter text-[#8A8A8A]">
                {c.phone && <div className="flex items-center gap-1"><Phone size={12} /> {c.phone}</div>}
                {c.email && <div className="flex items-center gap-1"><Mail size={12} /> {c.email}</div>}
                {c.address && <div className="flex items-center gap-1"><MapPin size={12} /> {c.address}</div>}
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-[#E0E0E0]">
                <button onClick={e => { e.stopPropagation(); setSelectedClinic(c) }} className="text-[#0077B6] hover:bg-[#E0F2FF] rounded-lg p-1.5 transition-colors"><Eye size={16} /></button>
                <button onClick={e => { e.stopPropagation(); toggleActive(c) }} className={`hover:bg-[#FEE2E2] rounded-lg p-1.5 transition-colors ${c.isActive ? 'text-[#EF4444]' : 'text-[#0E8C5E]'}`}>
                  {c.isActive ? <Trash2 size={16} /> : <Plus size={16} />}
                </button>
              </div>
            </OasisCard>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <OasisButton variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</OasisButton>
          <span className="font-inter text-sm text-[#8A8A8A] self-center">Página {page} de {totalPages}</span>
          <OasisButton variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</OasisButton>
        </div>
      )}

      {/* Create Clinic Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Nueva Clínica</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            {[
              { key: 'name', label: 'Nombre *', type: 'text' },
              { key: 'phone', label: 'Teléfono', type: 'tel' },
              { key: 'email', label: 'Email', type: 'email' },
              { key: 'address', label: 'Dirección', type: 'text' },
              { key: 'city', label: 'Ciudad', type: 'text' },
              { key: 'department', label: 'Departamento', type: 'text' },
            ].map(f => (
              <div key={f.key}>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1" />
              </div>
            ))}
            <div className="flex gap-3 justify-end">
              <OasisButton variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</OasisButton>
              <OasisButton onClick={createClinic} disabled={!form.name || saving}>{saving ? 'Guardando...' : 'Crear Clínica'}</OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clinic Detail Modal */}
      <Dialog open={!!selectedClinic && !showCreate} onOpenChange={() => setSelectedClinic(null)}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">{selectedClinic?.name}</DialogTitle></DialogHeader>
          {selectedClinic && (
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-xs text-[#8A8A8A]">Ciudad</span><p className="font-inter text-sm text-[#4A4A4A]">{selectedClinic.city || '-'}</p></div>
                <div><span className="text-xs text-[#8A8A8A]">Departamento</span><p className="font-inter text-sm text-[#4A4A4A]">{selectedClinic.department || '-'}</p></div>
                <div><span className="text-xs text-[#8A8A8A]">Teléfono</span><p className="font-inter text-sm text-[#4A4A4A]">{selectedClinic.phone || '-'}</p></div>
                <div><span className="text-xs text-[#8A8A8A]">Email</span><p className="font-inter text-sm text-[#4A4A4A]">{selectedClinic.email || '-'}</p></div>
              </div>
              <div><span className="text-xs text-[#8A8A8A]">Dirección</span><p className="font-inter text-sm text-[#4A4A4A]">{selectedClinic.address || '-'}</p></div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8A8A8A]">Estado:</span>
                <StatusBadge status={selectedClinic.isActive ? 'active' : 'inactive'} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
