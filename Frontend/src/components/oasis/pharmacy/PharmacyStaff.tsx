'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, OasisButton, DropLoader, EmptyState, StatusBadge } from '@/components/oasis/shared/shared-components'
import { oasisToast } from '@/lib/oasis-toast'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { Users, Plus, Mail, Phone, UserCog, ShieldCheck, Trash2, Edit2, Loader2, Key } from 'lucide-react'
import { OasisInput } from '@/components/oasis/shared/shared-components'

export default function PharmacyStaff() {
  const { user } = useAuthStore()
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'vendedor' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadStaff() }, [])

  async function loadStaff() {
    setLoading(true)
    try {
      const res = await api.get('/pharmacy/staff')
      if (res.success && res.data) setStaff(res.data)
    } catch (err) {}
    setLoading(false)
  }

  async function createStaff() {
    setSaving(true)
    try {
      const res = await api.post('/pharmacy/staff', form)
      if (res.success) { 
        oasisToast.success('Usuario Registrado', `${form.name} ahora tiene acceso.`)
        setShowCreate(false)
        setForm({ name: '', email: '', password: '', phone: '', role: 'vendedor' })
        loadStaff() 
      }
    } catch (err) {
      oasisToast.error('Error', 'No se pudo crear el usuario.')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar a ${name}?`)) {
      try {
        await api.delete(`/pharmacy/staff/${id}`)
        oasisToast.success('Usuario Eliminado', 'El acceso ha sido revocado.')
        loadStaff()
      } catch (err) {
        oasisToast.error('Error', 'No se pudo eliminar el usuario.')
      }
    }
  }

  const handleEdit = (staffMember: any) => {
    oasisToast.info('Modo Edición', `Editando a ${staffMember.user?.name || staffMember.name}.`)
    // Here we would populate a modal, but for now we show feedback
  }

  if (loading && staff.length === 0) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-8 pb-24 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Gestión de Personal</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Administra los accesos y roles de tu equipo</p>
        </div>
        <OasisButton onClick={() => setShowCreate(true)}>
          <Plus size={16} className="mr-2" /> Agregar Colaborador
        </OasisButton>
      </div>

      {staff.length === 0 ? (
        <EmptyState message="Aún no has agregado personal a tu farmacia" />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((s: any) => (
            <OasisCard key={s.id} className="group hover:border-[#0E8C5E]/20 transition-all !p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#E8F5EE] flex items-center justify-center text-[#0E8C5E] group-hover:bg-[#0E8C5E] group-hover:text-white transition-all duration-300 shadow-sm">
                    <UserCog size={24} />
                  </div>
                  <div>
                    <h3 className="font-nunito font-black text-[#4A4A4A]">{s.user?.name || s.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <ShieldCheck size={12} className="text-[#0E8C5E]" />
                       <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest">{s.staffRole || s.role || 'Colaborador'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 p-4 bg-[#FAFAFA] rounded-2xl border border-[#F0F0F0] mb-6">
                 <div className="flex items-center gap-3">
                    <Mail size={14} className="text-[#8A8A8A]" />
                    <span className="text-xs font-inter text-[#4A4A4A] truncate">{s.user?.email || 'Sin correo'}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <Phone size={14} className="text-[#8A8A8A]" />
                    <span className="text-xs font-inter text-[#4A4A4A]">{s.user?.phone || 'Sin teléfono'}</span>
                 </div>
              </div>

              <div className="flex gap-2">
                 <OasisButton variant="outline" fullWidth size="sm" className="h-9">
                    <Edit2 size={14} className="mr-1.5" /> Editar
                 </OasisButton>
                 <OasisButton variant="danger" size="sm" className="w-10 h-9 p-0">
                    <Trash2 size={14} />
                 </OasisButton>
              </div>
            </OasisCard>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-xl">Agregar Nuevo Miembro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-6">
            <OasisInput 
              label="Nombre Completo" 
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })} 
              placeholder="Ej: Juan Pérez"
              icon={<UserCog size={16} />}
            />
            <OasisInput 
              label="Correo Electrónico" 
              value={form.email} 
              onChange={e => setForm({ ...form, email: e.target.value })} 
              placeholder="juan@ejemplo.com"
              icon={<Mail size={16} />}
            />
            <OasisInput 
              label="Contraseña" 
              type="password"
              value={form.password} 
              onChange={e => setForm({ ...form, password: e.target.value })} 
              placeholder="••••••••"
              icon={<Key size={16} />}
            />
            <OasisInput 
              label="Teléfono" 
              value={form.phone} 
              onChange={e => setForm({ ...form, phone: e.target.value })} 
              placeholder="8888-8888"
              icon={<Phone size={16} />}
            />
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#8A8A8A] uppercase ml-1">Rol de Usuario</label>
              <select 
                value={form.role} 
                onChange={e => setForm({ ...form, role: e.target.value })} 
                className="w-full bg-[#FAFAFA] border-2 border-[#E0E0E0] rounded-2xl px-4 py-3 text-sm font-inter outline-none focus:border-[#0E8C5E]"
              >
                <option value="vendedor">Vendedor / Staff</option>
                <option value="cajero">Cajero</option>
                <option value="auxiliar">Auxiliar de Farmacia</option>
                <option value="administrador">Administrador de Sucursal</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <OasisButton variant="ghost" fullWidth onClick={() => setShowCreate(false)}>Cancelar</OasisButton>
              <OasisButton fullWidth onClick={createStaff} disabled={!form.name || !form.email || !form.password || saving}>
                {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Plus size={16} className="mr-2" />}
                Registrar Miembro
              </OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
