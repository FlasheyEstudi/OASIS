
'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Loader2, Mail, Phone, MapPin } from 'lucide-react'
import { OasisCard, OasisButton, OasisIconButton, StatusBadge, DropLoader, ErrorState } from '../shared/shared-components'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuthStore } from '@/lib/auth-store'
import { api } from '@/lib/api-client'

export default function Receptionists() {
  const { roleProfile } = useAuthStore()
  const clinicId = roleProfile?.clinicId
  const [receptionists, setReceptionists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    branchId: ''
  })

  const [branches, setBranches] = useState<any[]>([])

  useEffect(() => {
    if (clinicId) {
      loadReceptionists()
      loadBranches()
    }
  }, [clinicId])

  async function loadReceptionists() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/clinics/${clinicId}/receptionists`)
      if (res.success && res.data) {
        setReceptionists(res.data)
      }
    } catch (err) {
      setError('No pudimos cargar los recepcionistas.')
    } finally {
      setLoading(false)
    }
  }

  async function loadBranches() {
    try {
      const res = await api.get(`/clinics/${clinicId}/branches`)
      if (res.success && res.data) setBranches(res.data)
    } catch (err) {}
  }

  async function handleSave() {
    if (!form.name || !form.email || (!form.id && !form.password)) return
    setSaving(true)
    try {
      const endpoint = form.id 
        ? `/receptionists/${form.id}` 
        : `/clinics/${clinicId}/receptionists`
      
      const method = form.id ? 'put' : 'post'
      const res = await (api as any)[method](endpoint, form)
      
      if (res.success) {
        setDialogOpen(false)
        loadReceptionists()
        resetForm()
      }
    } catch (err) {
      alert('Error al guardar recepcionista')
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setForm({
      id: '',
      name: '',
      email: '',
      phone: '',
      password: '',
      branchId: ''
    })
  }

  function openEdit(recep: any) {
    setForm({
      id: recep.id,
      name: recep.user.name,
      email: recep.user.email,
      phone: recep.user.phone || '',
      password: '',
      branchId: recep.branchId || ''
    })
    setDialogOpen(true)
  }

  const filtered = receptionists.filter(r => 
    r.user.name.toLowerCase().includes(search.toLowerCase()) || 
    r.user.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading && receptionists.length === 0) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>
  if (error) return <ErrorState message={error} onRetry={loadReceptionists} />

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Recepcionistas</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">{receptionists.length} recepcionistas registrados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <OasisButton size="sm"><Plus size={16} className="mr-1" /> Nuevo Recepcionista</OasisButton>
          </DialogTrigger>
          <DialogContent className="modal-oasis max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">
                {form.id ? 'Editar Recepcionista' : 'Nuevo Recepcionista'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Nombre Completo</label>
                <input 
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" 
                  placeholder="Nombre y Apellidos"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-inter font-medium text-sm text-[#4A4A4A]">Email (Usuario)</label>
                  <input 
                    className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" 
                    placeholder="recepcion@oasis.ni"
                    type="email"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    disabled={!!form.id}
                  />
                </div>
                <div>
                  <label className="font-inter font-medium text-sm text-[#4A4A4A]">Teléfono</label>
                  <input 
                    className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" 
                    placeholder="88888888"
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                  />
                </div>
              </div>
              {!form.id && (
                <div>
                  <label className="font-inter font-medium text-sm text-[#4A4A4A]">Contraseña Temporal</label>
                  <input 
                    className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" 
                    placeholder="••••••••"
                    type="password"
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                  />
                </div>
              )}
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Sucursal Asignada</label>
                <select 
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none"
                  value={form.branchId}
                  onChange={e => setForm({...form, branchId: e.target.value})}
                >
                  <option value="">Clínica Principal</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <OasisButton variant="ghost" onClick={() => setDialogOpen(false)}>Cancelar</OasisButton>
                <OasisButton onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" size={16} /> : 'Guardar Recepcionista'}
                </OasisButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
        <input 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Buscar recepcionista..." 
          className="w-full input-oasis border-2 border-[#E0E0E0] bg-white px-4 py-2.5 pl-10 text-sm font-inter rounded-full focus:border-[#0E8C5E] focus:outline-none" 
        />
      </div>

      <div className="bg-white card-oasis overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E0E0E0] bg-[#FAFAFA]">
                <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3 uppercase tracking-wider">Personal</th>
                <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3 uppercase tracking-wider hidden md:table-cell">Contacto</th>
                <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3 uppercase tracking-wider hidden lg:table-cell">Ubicación</th>
                <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3 uppercase tracking-wider">Estado</th>
                <th className="text-right font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((recep) => {
                const initials = recep.user.name.split(' ').map((n:any) => n[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <tr key={recep.id} className="border-b border-[#E0E0E0]/50 hover:bg-[#E8F5EE]/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 border border-[#E0E0E0]">
                          <AvatarFallback className="bg-[#E8F5EE] text-[#0E8C5E] font-nunito font-bold text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-inter font-semibold text-sm text-[#4A4A4A]">{recep.user.name}</p>
                          <p className="text-[10px] font-inter text-[#8A8A8A]">ID: {recep.id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-inter text-[#8A8A8A]"><Mail size={12} className="text-[#0E8C5E]" /> {recep.user.email}</div>
                        {recep.user.phone && <div className="flex items-center gap-2 text-xs font-inter text-[#8A8A8A]"><Phone size={12} className="text-[#0077B6]" /> {recep.user.phone}</div>}
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-xs font-inter text-[#4A4A4A]">
                        <MapPin size={14} className="text-[#F4A261]" />
                        {recep.branch?.name || 'Clínica Principal'}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={recep.user.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <OasisIconButton 
                          icon={<Edit size={14} />} 
                          label="Editar" 
                          variant="ghost" 
                          onClick={() => openEdit(recep)} 
                        />
                        <OasisIconButton 
                          icon={<Trash2 size={14} />} 
                          label="Desactivar" 
                          variant="danger" 
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
