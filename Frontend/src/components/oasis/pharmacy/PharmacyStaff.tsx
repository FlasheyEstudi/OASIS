'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, OasisButton, DropLoader, EmptyState, StatusBadge } from '@/components/oasis/shared/shared-components'
import { Users, Plus, Mail, Phone, UserCog } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function PharmacyStaff() {
  const { roleProfile } = useAuthStore()
  const pharmacyId = roleProfile?.pharmacyId
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'vendedor' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadStaff() }, [])

  async function loadStaff() {
    setLoading(true)
    const res = await api.get('/pharmacy/staff')
    if (res.success && (res as any).data) setStaff((res as any).data)
    setLoading(false)
  }

  async function createStaff() {
    setSaving(true)
    const res = await api.post('/pharmacy/staff', form)
    if (res.success) { setShowCreate(false); setForm({ name: '', email: '', password: '', phone: '', role: 'vendedor' }); loadStaff() }
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Personal</h1><p className="font-inter text-sm text-[#8A8A8A]">Gestión del personal de farmacia</p></div>
        <OasisButton onClick={() => setShowCreate(true)}><Plus size={16} /> Agregar</OasisButton>
      </div>
      {staff.length === 0 ? <EmptyState message="No hay personal registrado" /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((s: any) => (
            <OasisCard key={s.id}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#E0F2FF] flex items-center justify-center"><UserCog size={20} className="text-[#0077B6]" /></div>
                <div><h3 className="font-nunito font-bold text-[#4A4A4A]">{s.user?.name || s.name}</h3>
                  <p className="font-inter text-xs text-[#8A8A8A]">{s.staffRole || s.role || 'Staff'}</p></div>
              </div>
              <div className="space-y-1 text-xs font-inter text-[#8A8A8A]">
                {s.user?.email && <div className="flex items-center gap-1"><Mail size={12} />{s.user.email}</div>}
                {s.user?.phone && <div className="flex items-center gap-1"><Phone size={12} />{s.user.phone}</div>}
              </div>
            </OasisCard>
          ))}
        </div>
      )}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Agregar Personal</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            {[
              { key: 'name', label: 'Nombre *' }, { key: 'email', label: 'Email *' },
              { key: 'password', label: 'Contraseña *', type: 'password' }, { key: 'phone', label: 'Teléfono' },
            ].map(f => (
              <div key={f.key}><label className="font-inter font-medium text-sm text-[#4A4A4A]">{f.label}</label>
                <input type={(f as any).type || 'text'} value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1" /></div>
            ))}
            <div><label className="font-inter font-medium text-sm text-[#4A4A4A]">Rol</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1">
                <option value="vendedor">Vendedor</option><option value="cajero">Cajero</option><option value="auxiliar">Auxiliar</option>
              </select></div>
            <div className="flex gap-3 justify-end">
              <OasisButton variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</OasisButton>
              <OasisButton onClick={createStaff} disabled={!form.name || !form.email || !form.password || saving}>{saving ? 'Guardando...' : 'Agregar'}</OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
