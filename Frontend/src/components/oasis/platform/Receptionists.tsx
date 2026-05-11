'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, OasisButton, DropLoader, EmptyState, StatusBadge } from '@/components/oasis/shared/shared-components'
import { UserPlus, Plus, Mail, Phone, User } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function Receptionists() {
  const { roleProfile } = useAuthStore()
  const clinicId = roleProfile?.clinicId
  const [receptionists, setReceptionists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadReceptionists() }, [])

  async function loadReceptionists() {
    if (!clinicId) return
    setLoading(true)
    const res = await api.get(`/clinics/${clinicId}/receptionists`)
    if (res.success && (res as any).data) setReceptionists((res as any).data)
    setLoading(false)
  }

  async function createReceptionist() {
    setSaving(true)
    const res = await api.post(`/clinics/${clinicId}/receptionists`, form)
    if (res.success) { setShowCreate(false); setForm({ name: '', email: '', password: '', phone: '' }); loadReceptionists() }
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Recepcionistas</h1><p className="font-inter text-sm text-[#8A8A8A]">Gestión del personal de recepción</p></div>
        <OasisButton onClick={() => setShowCreate(true)}><Plus size={16} /> Agregar</OasisButton>
      </div>
      {receptionists.length === 0 ? <EmptyState message="No hay recepcionistas registrados" /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {receptionists.map((r: any) => (
            <OasisCard key={r.id}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#E0F2FF] flex items-center justify-center"><User size={20} className="text-[#0077B6]" /></div>
                <div><h3 className="font-nunito font-bold text-[#4A4A4A]">{r.user?.name || r.name}</h3><p className="font-inter text-xs text-[#8A8A8A]">Recepcionista</p></div>
              </div>
              <div className="space-y-1 text-xs font-inter text-[#8A8A8A]">
                {r.user?.email && <div className="flex items-center gap-1"><Mail size={12} />{r.user.email}</div>}
                {r.user?.phone && <div className="flex items-center gap-1"><Phone size={12} />{r.user.phone}</div>}
              </div>
            </OasisCard>
          ))}
        </div>
      )}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Agregar Recepcionista</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            {[
              { key: 'name', label: 'Nombre *' }, { key: 'email', label: 'Email *' },
              { key: 'password', label: 'Contraseña *', type: 'password' }, { key: 'phone', label: 'Teléfono' },
            ].map(f => (
              <div key={f.key}><label className="font-inter font-medium text-sm text-[#4A4A4A]">{f.label}</label>
                <input type={(f as any).type || 'text'} value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1" /></div>
            ))}
            <div className="flex gap-3 justify-end">
              <OasisButton variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</OasisButton>
              <OasisButton onClick={createReceptionist} disabled={!form.name || !form.email || !form.password || saving}>{saving ? 'Guardando...' : 'Agregar'}</OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
