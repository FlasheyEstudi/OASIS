
'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Loader2, Users, Star, Mail, Phone, Calendar } from 'lucide-react'
import { OasisCard, OasisButton, OasisIconButton, StatusBadge, DropLoader, ErrorState } from '../shared/shared-components'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuthStore } from '@/lib/auth-store'
import { api } from '@/lib/api-client'

const specialtyOptions = [
  'Medicina General', 'Pediatría', 'Cardiología', 'Dermatología', 
  'Neurología', 'Ginecología', 'Oftalmología', 'Psiquiatría', 'Odontología'
]

export default function Doctors() {
  const { roleProfile } = useAuthStore()
  const clinicId = roleProfile?.clinicId
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [form, setForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    specialty: specialtyOptions[0],
    licenseNumber: '',
    consultationFee: 25,
    password: '', // Only for creation
    branchId: ''
  })

  const [branches, setBranches] = useState<any[]>([])

  useEffect(() => {
    if (clinicId) {
      loadDoctors()
      loadBranches()
    }
  }, [clinicId])

  async function loadDoctors() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/clinics/${clinicId}/doctors`)
      if (res.success && res.data) {
        setDoctors(res.data)
      }
    } catch (err) {
      setError('No pudimos cargar los doctores.')
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
    if (!form.name || !form.email || !form.specialty || (!form.id && !form.password)) return
    setSaving(true)
    try {
      const endpoint = form.id 
        ? `/doctors/${form.id}` 
        : `/clinics/${clinicId}/doctors`
      
      const method = form.id ? 'put' : 'post'
      const res = await (api as any)[method](endpoint, form)
      
      if (res.success) {
        setDialogOpen(false)
        loadDoctors()
        resetForm()
      } else {
        alert(res.message || 'Error al guardar doctor')
      }
    } catch (err: any) {
      alert(err.message || 'Error al guardar doctor')
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
      specialty: specialtyOptions[0],
      licenseNumber: '',
      consultationFee: 25,
      password: '',
      branchId: ''
    })
  }

  function openEdit(doc: any) {
    setForm({
      id: doc.id,
      name: doc.user.name,
      email: doc.user.email,
      phone: doc.user.phone || '',
      specialty: doc.specialty,
      licenseNumber: doc.licenseNumber || '',
      consultationFee: doc.consultationFee || 25,
      password: '',
      branchId: doc.branchId || ''
    })
    setDialogOpen(true)
  }

  const filtered = doctors.filter(d => 
    d.user.name.toLowerCase().includes(search.toLowerCase()) || 
    d.specialty.toLowerCase().includes(search.toLowerCase())
  )

  if (loading && doctors.length === 0) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>
  if (error) return <ErrorState message={error} onRetry={loadDoctors} />

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Doctores</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">{doctors.length} doctores registrados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <OasisButton size="sm"><Plus size={16} className="mr-1" /> Añadir Doctor</OasisButton>
          </DialogTrigger>
          <DialogContent className="modal-oasis max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">
                {form.id ? 'Editar Doctor' : 'Añadir Nuevo Doctor'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Nombre Completo</label>
                <input 
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" 
                  placeholder="Dr. Juan Pérez"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Email (Usuario)</label>
                <input 
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" 
                  placeholder="doctor@oasis.ni"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  disabled={!!form.id}
                />
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
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Especialidad</label>
                <select 
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none"
                  value={form.specialty}
                  onChange={e => setForm({...form, specialty: e.target.value})}
                >
                  {specialtyOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Licencia Médica</label>
                <input 
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" 
                  placeholder="Nº de Colegiado"
                  value={form.licenseNumber}
                  onChange={e => setForm({...form, licenseNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Tarifa Consulta ($)</label>
                <input 
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" 
                  type="number"
                  value={form.consultationFee}
                  onChange={e => setForm({...form, consultationFee: Number(e.target.value)})}
                />
              </div>
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
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E0E0]">
              <OasisButton variant="ghost" onClick={() => setDialogOpen(false)}>Cancelar</OasisButton>
              <OasisButton onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : 'Guardar Doctor'}
              </OasisButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
        <input 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Buscar por nombre o especialidad..." 
          className="w-full input-oasis border-2 border-[#E0E0E0] bg-white px-4 py-2.5 pl-10 text-sm font-inter rounded-full focus:border-[#0E8C5E] focus:outline-none" 
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((doc) => {
          const initials = doc.user.name.split(' ').map((n:any) => n[0]).join('').slice(0, 2).toUpperCase()
          return (
            <OasisCard key={doc.id} className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                <StatusBadge status={doc.user.isActive ? 'active' : 'inactive'} />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-16 h-16 border-2 border-[#E8F5EE]">
                  <AvatarFallback className="bg-[#E8F5EE] text-[#0E8C5E] font-nunito font-bold text-xl">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-nunito font-bold text-lg text-[#4A4A4A]">{doc.user.name}</h3>
                  <p className="font-inter text-sm text-[#0E8C5E] font-semibold">{doc.specialty}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-xs font-inter text-[#8A8A8A]">
                  <Users size={14} className="text-[#0E8C5E]" />
                  <span>{doc._count?.appointments || 0} Citas totales</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-inter text-[#8A8A8A]">
                  <Star size={14} className="text-[#F4A261]" />
                  <span>{doc.rating || 5.0} Calificación</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-inter text-[#8A8A8A]">
                  <Calendar size={14} className="text-[#0077B6]" />
                  <span>L-V 8am - 5pm</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-inter text-[#8A8A8A]">
                  <span className="font-bold text-[#4A4A4A]">${doc.consultationFee}</span>
                  <span>por consulta</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#F0F0F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <OasisIconButton 
                    icon={<Mail size={14} />} 
                    label="Email" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => window.open(`mailto:${doc.user.email}`)}
                  />
                  {doc.user.phone && (
                    <OasisIconButton 
                      icon={<Phone size={14} />} 
                      label="Llamar" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.open(`tel:${doc.user.phone}`)}
                    />
                  )}
                </div>
                <OasisButton 
                  size="sm" 
                  variant="ghost" 
                  className="text-[#0E8C5E] hover:bg-[#E8F5EE]"
                  onClick={() => openEdit(doc)}
                >
                  <Edit size={16} className="mr-1" /> Editar Perfil
                </OasisButton>
              </div>
            </OasisCard>
          )
        })}
      </div>
    </div>
  )
}
