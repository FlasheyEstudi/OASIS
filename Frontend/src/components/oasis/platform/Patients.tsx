'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, X, UserPlus, Trash2 as TrashIcon, Loader2 } from 'lucide-react'
import { OasisCard, OasisButton, OasisIconButton, DropFAB, StatusBadge, DropLoader, EmptyState, ErrorState } from '../shared/shared-components'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'

interface PatientForm {
  name: string
  phone: string
  email: string
  doctorId: string
  notes: string
}

const emptyForm: PatientForm = { name: '', phone: '', email: '', doctorId: '', notes: '' }

export default function Patients() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [form, setForm] = useState<PatientForm>(emptyForm)
  const [editingPatient, setEditingPatient] = useState<any>(null)
  const [deletingPatient, setDeletingPatient] = useState<any>(null)
  const [doctors, setDoctors] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPatients()
    loadDoctors()
  }, [search])

  async function loadPatients() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/patients', { search, limit: 50 })
      if (res.success && res.data) {
        setPatients(res.data)
      }
    } catch (err) {
      setError('No pudimos cargar la lista de pacientes.')
    } finally {
      setLoading(false)
    }
  }

  async function loadDoctors() {
    try {
      const res = await api.get('/doctors', { limit: 100 })
      if (res.success && res.data) {
        setDoctors(res.data)
      }
    } catch (err) {}
  }

  const handleAddPatient = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const res = await api.post('/patients', form)
      if (res.success) {
        loadPatients()
        setForm(emptyForm)
        setDialogOpen(false)
      }
    } catch (err) {
      alert('Error al guardar paciente')
    } finally {
      setSaving(false)
    }
  }

  const handleEditPatient = async () => {
    if (!editingPatient || !form.name.trim()) return
    setSaving(true)
    try {
      const res = await api.put(`/patients/${editingPatient.id}`, form)
      if (res.success) {
        loadPatients()
        setEditingPatient(null)
        setForm(emptyForm)
        setEditOpen(false)
      }
    } catch (err) {
      alert('Error al actualizar paciente')
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (patient: any) => {
    setEditingPatient(patient)
    setForm({ 
      name: patient.user?.name || '', 
      phone: patient.user?.phone || '', 
      email: patient.user?.email || '', 
      doctorId: patient.doctorPatients?.[0]?.doctorId || '', 
      notes: patient.notes || '' 
    })
    setEditOpen(true)
  }

  const openDelete = (patient: any) => {
    setDeletingPatient(patient)
    setDeleteOpen(true)
  }

  const handleDeletePatient = async () => {
    if (!deletingPatient) return
    setSaving(true)
    try {
      const res = await api.delete(`/patients/${deletingPatient.id}`)
      if (res.success) {
        loadPatients()
        setDeletingPatient(null)
        setDeleteOpen(false)
      }
    } catch (err) {
      alert('Error al eliminar paciente')
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return '??'
    const parts = name.split(' ')
    return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase()
  }

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Pacientes</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">{patients.length} pacientes registrados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <OasisButton size="sm">
              <Plus size={16} className="mr-1" /> Nuevo
            </OasisButton>
          </DialogTrigger>
          <DialogContent className="modal-oasis max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Nuevo Paciente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-inter font-medium text-sm text-[#4A4A4A]">Nombre</label>
                  <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" placeholder="Nombre completo" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div>
                  <label className="font-inter font-medium text-sm text-[#4A4A4A]">Teléfono</label>
                  <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" placeholder="88888888" value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Email</label>
                <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" placeholder="email@ejemplo.com" value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} />
              </div>
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Doctor asignado</label>
                <select className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" value={form.doctorId} onChange={(e) => setForm(prev => ({ ...prev, doctorId: e.target.value }))}>
                  <option value="">Seleccionar doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.user?.name}</option>)}
                </select>
              </div>
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Notas médicas</label>
                <textarea className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" rows={3} placeholder="Alergias, condiciones previas..." value={form.notes} onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <OasisButton variant="ghost" onClick={() => { setDialogOpen(false); setForm(emptyForm) }}>Cancelar</OasisButton>
                <OasisButton onClick={handleAddPatient} disabled={!form.name.trim() || saving}>
                   {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                   Guardar Paciente
                </OasisButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar paciente..."
          className="w-full input-oasis border-2 border-[#E0E0E0] bg-white px-4 py-2.5 pl-10 text-sm font-inter rounded-full focus:border-[#0E8C5E] focus:outline-none"
        />
      </div>

      {loading && patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <DropLoader size={48} />
          <p className="mt-4 font-inter text-sm text-[#8A8A8A]">Cargando pacientes...</p>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadPatients} />
      ) : patients.length === 0 ? (
        <EmptyState message="No se encontraron pacientes." icon="search" />
      ) : (
        <div className="bg-white card-oasis overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E0E0E0]">
                  <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3">Paciente</th>
                  <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3 hidden md:table-cell">Doctor Asignado</th>
                  <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3 hidden md:table-cell">Fecha Registro</th>
                  <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3">Estado</th>
                  <th className="text-right font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} className="border-b border-[#E0E0E0]/50 hover:bg-[#E8F5EE]/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-[#E8F5EE] text-[#0E8C5E] font-nunito font-bold text-[10px]">{getInitials(p.user?.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-inter font-medium text-sm text-[#4A4A4A]">{p.user?.name}</span>
                          <span className="text-[10px] text-[#8A8A8A] font-inter">{p.user?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell font-inter text-sm text-[#8A8A8A]">
                      {p.doctorPatients?.[0]?.doctor?.user?.name || 'Sin asignar'}
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell font-inter text-sm text-[#8A8A8A]">
                      {new Date(p.createdAt).toLocaleDateString('es-NI')}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={p.isActive ? 'active' : 'inactive'} /></td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <OasisIconButton
                          variant="ghost"
                          size="sm"
                          icon={<Edit size={14} />}
                          label="Editar"
                          onClick={() => openEdit(p)}
                        />
                        <OasisIconButton
                          variant="danger"
                          size="sm"
                          icon={<Trash2 size={14} />}
                          label="Eliminar"
                          onClick={() => openDelete(p)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Patient Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="modal-oasis max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Editar Paciente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Nombre</label>
                <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Teléfono</label>
                <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="font-inter font-medium text-sm text-[#4A4A4A]">Email</label>
              <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} />
            </div>
            <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Doctor asignado</label>
                <select className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" value={form.doctorId} onChange={(e) => setForm(prev => ({ ...prev, doctorId: e.target.value }))}>
                  <option value="">Seleccionar doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.user?.name}</option>)}
                </select>
              </div>
            <div className="flex justify-end gap-3 pt-2">
              <OasisButton variant="ghost" onClick={() => { setEditOpen(false); setEditingPatient(null); setForm(emptyForm) }}>Cancelar</OasisButton>
              <OasisButton onClick={handleEditPatient} disabled={!form.name.trim() || saving}>
                 {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                 Guardar Cambios
              </OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="modal-oasis max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Eliminar Paciente</DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FEE2E2] flex items-center justify-center mx-auto">
              <Trash2 size={28} className="text-[#EF4444]" />
            </div>
            <p className="font-inter text-sm text-[#4A4A4A]">
              ¿Estás seguro de eliminar a <strong>{deletingPatient?.user?.name}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <OasisButton variant="ghost" onClick={() => { setDeleteOpen(false); setDeletingPatient(null) }}>Cancelar</OasisButton>
              <OasisButton variant="danger" onClick={handleDeletePatient} disabled={saving}>
                 {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                 Eliminar
              </OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAB */}
      <DropFAB onClick={() => setDialogOpen(true)} icon={<Plus size={22} />} label="Nuevo paciente" />
    </div>
  )
}
