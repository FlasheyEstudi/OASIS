'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { OasisCard, OasisButton, DropLoader, ErrorState, EmptyState, StatusBadge } from '@/components/oasis/shared/shared-components'
import { Pill, Search, Plus, MapPin, Phone, Mail, Eye, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function SuperAdminPharmacies() {
  const [pharmacies, setPharmacies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadPharmacies() }, [page, search])

  async function loadPharmacies() {
    setLoading(true); setError(null)
    const res = await api.get('/pharmacies', { search: search || undefined, page, limit: 20 })
    if (res.success && (res as any).data) { setPharmacies((res as any).data); setTotalPages((res as any).pagination?.totalPages || 1) }
    else { setError('Error cargando farmacias') }
    setLoading(false)
  }

  async function createPharmacy() {
    setSaving(true)
    const res = await api.post('/pharmacies', form)
    if (res.success) { setShowCreate(false); setForm({ name: '', phone: '', email: '', address: '', city: '' }); loadPharmacies() }
    setSaving(false)
  }

  async function toggleActive(p: any) {
    if (p.isActive) await api.delete(`/pharmacies/${p.id}`)
    else await api.put(`/pharmacies/${p.id}`, { isActive: true })
    loadPharmacies()
  }

  if (loading && pharmacies.length === 0) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>
  if (error) return <ErrorState message={error} onRetry={loadPharmacies} />

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Farmacias</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Gestión de todas las farmacias del sistema</p>
        </div>
        <OasisButton onClick={() => setShowCreate(true)}><Plus size={16} /> Nueva Farmacia</OasisButton>
      </div>
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Buscar farmacia..."
          className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] pl-10 pr-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none" />
      </div>
      {pharmacies.length === 0 ? <EmptyState message="No se encontraron farmacias" /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pharmacies.map((p: any) => (
            <OasisCard key={p.id} onClick={() => setSelected(p)} className="cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E0F2FF] flex items-center justify-center"><Pill size={20} className="text-[#0077B6]" /></div>
                  <div><h3 className="font-nunito font-bold text-[#4A4A4A]">{p.name}</h3><p className="font-inter text-xs text-[#8A8A8A]">{p.city || 'Sin ciudad'}</p></div>
                </div>
                <StatusBadge status={p.isActive ? 'active' : 'inactive'} />
              </div>
              <div className="space-y-1 text-xs font-inter text-[#8A8A8A]">
                {p.phone && <div className="flex items-center gap-1"><Phone size={12} />{p.phone}</div>}
                {p.email && <div className="flex items-center gap-1"><Mail size={12} />{p.email}</div>}
                {p.address && <div className="flex items-center gap-1"><MapPin size={12} />{p.address}</div>}
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-[#E0E0E0]">
                <button onClick={e => { e.stopPropagation(); setSelected(p) }} className="text-[#0077B6] hover:bg-[#E0F2FF] rounded-lg p-1.5 transition-colors"><Eye size={16} /></button>
                <button onClick={e => { e.stopPropagation(); toggleActive(p) }} className={`hover:bg-[#FEE2E2] rounded-lg p-1.5 transition-colors ${p.isActive ? 'text-[#EF4444]' : 'text-[#0E8C5E]'}`}>
                  {p.isActive ? <Trash2 size={16} /> : <Plus size={16} />}
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
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Nueva Farmacia</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            {[
              { key: 'name', label: 'Nombre *' }, { key: 'phone', label: 'Teléfono' }, { key: 'email', label: 'Email' },
              { key: 'address', label: 'Dirección' }, { key: 'city', label: 'Ciudad' },
            ].map(f => (
              <div key={f.key}>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1" />
              </div>
            ))}
            <div className="flex gap-3 justify-end">
              <OasisButton variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</OasisButton>
              <OasisButton onClick={createPharmacy} disabled={!form.name || saving}>{saving ? 'Guardando...' : 'Crear Farmacia'}</OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!selected && !showCreate} onOpenChange={() => setSelected(null)}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">{selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-xs text-[#8A8A8A]">Ciudad</span><p className="font-inter text-sm text-[#4A4A4A]">{selected.city || '-'}</p></div>
                <div><span className="text-xs text-[#8A8A8A]">Teléfono</span><p className="font-inter text-sm text-[#4A4A4A]">{selected.phone || '-'}</p></div>
              </div>
              <div><span className="text-xs text-[#8A8A8A]">Email</span><p className="font-inter text-sm text-[#4A4A4A]">{selected.email || '-'}</p></div>
              <div><span className="text-xs text-[#8A8A8A]">Dirección</span><p className="font-inter text-sm text-[#4A4A4A]">{selected.address || '-'}</p></div>
              <div className="flex items-center gap-2"><span className="text-xs text-[#8A8A8A]">Estado:</span><StatusBadge status={selected.isActive ? 'active' : 'inactive'} /></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
