'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { OasisCard, OasisButton, OasisIconButton, StatusBadge } from '../shared/shared-components'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const initialDoctors = [
  { id: 1, name: 'Dr. Carlos Ruiz', specialty: 'Medicina General', patients: 45, status: 'active' as const, initials: 'CR', email: 'carlos@clinica.com', phone: '8888-1234' },
  { id: 2, name: 'Dra. María Martínez', specialty: 'Pediatría', patients: 38, status: 'active' as const, initials: 'MM', email: 'maria@clinica.com', phone: '8888-5678' },
  { id: 3, name: 'Dr. Luis Hernández', specialty: 'Cardiología', patients: 22, status: 'active' as const, initials: 'LH', email: 'luis@clinica.com', phone: '8888-9012' },
  { id: 4, name: 'Dra. Sofía López', specialty: 'Dermatología', patients: 31, status: 'pending' as const, initials: 'SL', email: 'sofia@clinica.com', phone: '8888-3456' },
  { id: 5, name: 'Dr. Roberto Gómez', specialty: 'Neurología', patients: 18, status: 'inactive' as const, initials: 'RG', email: 'roberto@clinica.com', phone: '8888-7890' },
]

const specialtyOptions = ['Medicina General', 'Pediatría', 'Cardiología', 'Dermatología', 'Neurología']

interface DoctorForm {
  name: string
  specialty: string
  email: string
  phone: string
}

const emptyForm: DoctorForm = { name: '', specialty: specialtyOptions[0], email: '', phone: '' }

export default function Doctors() {
  const [search, setSearch] = useState('')
  const [doctors, setDoctors] = useState(initialDoctors)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [form, setForm] = useState<DoctorForm>(emptyForm)
  const [editingDoctor, setEditingDoctor] = useState<typeof initialDoctors[0] | null>(null)
  const [deletingDoctor, setDeletingDoctor] = useState<typeof initialDoctors[0] | null>(null)

  const filtered = doctors.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))

  const handleAddDoctor = () => {
    if (!form.name.trim()) return
    const nameParts = form.name.trim().split(' ')
    const initials = nameParts.length >= 2
      ? nameParts.filter(p => p.length > 2).map(p => p[0]).join('').toUpperCase().slice(0, 2)
      : form.name.trim().slice(0, 2).toUpperCase()
    const newDoctor = {
      id: Date.now(),
      name: form.name.trim(),
      specialty: form.specialty,
      patients: 0,
      status: 'active' as const,
      initials,
      email: form.email,
      phone: form.phone,
    }
    setDoctors(prev => [...prev, newDoctor])
    setForm(emptyForm)
    setDialogOpen(false)
  }

  const handleEditDoctor = () => {
    if (!editingDoctor || !form.name.trim()) return
    setDoctors(prev => prev.map(d => {
      if (d.id !== editingDoctor.id) return d
      const nameParts = form.name.trim().split(' ')
      const initials = nameParts.length >= 2
        ? nameParts.filter(p => p.length > 2).map(p => p[0]).join('').toUpperCase().slice(0, 2)
        : form.name.trim().slice(0, 2).toUpperCase()
      return {
        ...d,
        name: form.name.trim(),
        specialty: form.specialty,
        initials,
        email: form.email,
        phone: form.phone,
      }
    }))
    setEditingDoctor(null)
    setForm(emptyForm)
    setEditOpen(false)
  }

  const openEdit = (doctor: typeof initialDoctors[0]) => {
    setEditingDoctor(doctor)
    setForm({ name: doctor.name, specialty: doctor.specialty, email: doctor.email || '', phone: doctor.phone || '' })
    setEditOpen(true)
  }

  const openDelete = (doctor: typeof initialDoctors[0]) => {
    setDeletingDoctor(doctor)
    setDeleteOpen(true)
  }

  const handleDeleteDoctor = () => {
    if (!deletingDoctor) return
    setDoctors(prev => prev.filter(d => d.id !== deletingDoctor.id))
    setDeletingDoctor(null)
    setDeleteOpen(false)
  }

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Doctores</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">{doctors.length} doctores registrados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <OasisButton size="sm"><Plus size={16} className="mr-1" /> Añadir Doctor</OasisButton>
          </DialogTrigger>
          <DialogContent className="modal-oasis max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Añadir Doctor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-inter font-medium text-sm text-[#4A4A4A]">Nombre</label>
                  <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" placeholder="Dr. Nombre" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div>
                  <label className="font-inter font-medium text-sm text-[#4A4A4A]">Especialidad</label>
                  <select className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" value={form.specialty} onChange={(e) => setForm(prev => ({ ...prev, specialty: e.target.value }))}>
                    {specialtyOptions.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-inter font-medium text-sm text-[#4A4A4A]">Email</label>
                  <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" placeholder="doctor@clinica.com" value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} />
                </div>
                <div>
                  <label className="font-inter font-medium text-sm text-[#4A4A4A]">Teléfono</label>
                  <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" placeholder="88888888" value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <OasisButton variant="ghost" onClick={() => { setDialogOpen(false); setForm(emptyForm) }}>Cancelar</OasisButton>
                <OasisButton onClick={handleAddDoctor} disabled={!form.name.trim()}>Registrar Doctor</OasisButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar doctor..." className="w-full input-oasis border-2 border-[#E0E0E0] bg-white px-4 py-2.5 pl-10 text-sm font-inter rounded-full focus:border-[#0E8C5E] focus:outline-none" />
      </div>

      <div className="bg-white card-oasis overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E0E0E0]">
                <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3">Doctor</th>
                <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3 hidden md:table-cell">Especialidad</th>
                <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3 hidden md:table-cell">Pacientes</th>
                <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3">Estado</th>
                <th className="text-right font-inter font-semibold text-xs text-[#8A8A8A] px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-[#E0E0E0]/50 hover:bg-[#E8F5EE]/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-[#E8F5EE] text-[#0E8C5E] font-nunito font-bold text-[10px]">{d.initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-inter font-medium text-sm text-[#4A4A4A]">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell font-inter text-sm text-[#8A8A8A]">{d.specialty}</td>
                  <td className="px-5 py-3 hidden md:table-cell font-inter text-sm text-[#4A4A4A]">{d.patients}</td>
                  <td className="px-5 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <OasisIconButton
                        variant="ghost"
                        size="sm"
                        icon={<Edit size={14} />}
                        label="Editar"
                        onClick={() => openEdit(d)}
                      />
                      <OasisIconButton
                        variant="danger"
                        size="sm"
                        icon={<Trash2 size={14} />}
                        label="Eliminar"
                        onClick={() => openDelete(d)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Doctor Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="modal-oasis max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Editar Doctor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Nombre</label>
                <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Especialidad</label>
                <select className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" value={form.specialty} onChange={(e) => setForm(prev => ({ ...prev, specialty: e.target.value }))}>
                  {specialtyOptions.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Email</label>
                <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} />
              </div>
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Teléfono</label>
                <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <OasisButton variant="ghost" onClick={() => { setEditOpen(false); setEditingDoctor(null); setForm(emptyForm) }}>Cancelar</OasisButton>
              <OasisButton onClick={handleEditDoctor} disabled={!form.name.trim()}>Guardar Cambios</OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="modal-oasis max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Eliminar Doctor</DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FEE2E2] flex items-center justify-center mx-auto">
              <Trash2 size={28} className="text-[#EF4444]" />
            </div>
            <p className="font-inter text-sm text-[#4A4A4A]">
              ¿Estás seguro de eliminar a <strong>{deletingDoctor?.name}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <OasisButton variant="ghost" onClick={() => { setDeleteOpen(false); setDeletingDoctor(null) }}>Cancelar</OasisButton>
              <OasisButton variant="danger" onClick={handleDeleteDoctor}>Eliminar</OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
