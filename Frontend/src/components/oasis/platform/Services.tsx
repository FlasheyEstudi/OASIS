'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, OasisButton, DropLoader, EmptyState, StatusBadge } from '@/components/oasis/shared/shared-components'
import { Activity, Plus, Pencil, Trash2, Clock, DollarSign } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function Services() {
  const { roleProfile } = useAuthStore()
  const clinicId = roleProfile?.clinicId
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', duration: 30, price: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadServices() }, [])

  async function loadServices() {
    if (!clinicId) return
    setLoading(true)
    const res = await api.get('/services', { clinicId, limit: 50 })
    if (res.success && (res as any).data) setServices((res as any).data)
    setLoading(false)
  }

  async function saveService() {
    setSaving(true)
    if (editingId) {
      await api.put(`/services/${editingId}`, form)
    } else {
      await api.post('/services', { ...form, clinicId })
    }
    setShowCreate(false); setEditingId(null); setForm({ name: '', duration: 30, price: 0 }); loadServices(); setSaving(false)
  }

  async function deleteService(id: string) {
    await api.delete(`/services/${id}`)
    loadServices()
  }

  function startEdit(svc: any) {
    setForm({ name: svc.name, duration: svc.duration || 30, price: svc.price || 0 })
    setEditingId(svc.id)
    setShowCreate(true)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Servicios</h1><p className="font-inter text-sm text-[#8A8A8A]">Gestión de servicios médicos de la clínica</p></div>
        <OasisButton onClick={() => { setForm({ name: '', duration: 30, price: 0 }); setEditingId(null); setShowCreate(true) }}><Plus size={16} /> Nuevo Servicio</OasisButton>
      </div>
      {services.length === 0 ? <EmptyState message="No hay servicios registrados" /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((svc: any) => (
            <OasisCard key={svc.id}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center"><Activity size={20} className="text-[#0E8C5E]" /></div>
                  <h3 className="font-nunito font-bold text-[#4A4A4A]">{svc.name}</h3>
                </div>
                <StatusBadge status={svc.isActive !== false ? 'active' : 'inactive'} />
              </div>
              <div className="flex gap-4 text-sm font-inter text-[#8A8A8A] mt-3">
                <span className="flex items-center gap-1"><Clock size={14} />{svc.duration || 30} min</span>
                <span className="flex items-center gap-1"><DollarSign size={14} />C${svc.price || 0}</span>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-[#E0E0E0]">
                <button onClick={() => startEdit(svc)} className="text-[#0077B6] hover:bg-[#E0F2FF] rounded-lg p-1.5 transition-colors"><Pencil size={16} /></button>
                <button onClick={() => deleteService(svc.id)} className="text-[#8A8A8A] hover:text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg p-1.5 transition-colors"><Trash2 size={16} /></button>
              </div>
            </OasisCard>
          ))}
        </div>
      )}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">{editingId ? 'Editar' : 'Nuevo'} Servicio</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><label className="font-inter font-medium text-sm text-[#4A4A4A]">Nombre del Servicio *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="font-inter font-medium text-sm text-[#4A4A4A]">Duración (min)</label>
                <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) || 30 })} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1" /></div>
              <div><label className="font-inter font-medium text-sm text-[#4A4A4A]">Precio (C$)</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1" /></div>
            </div>
            <div className="flex gap-3 justify-end">
              <OasisButton variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</OasisButton>
              <OasisButton onClick={saveService} disabled={!form.name || saving}>{saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}</OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
