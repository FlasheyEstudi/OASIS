'use client'

import { useState } from 'react'
import { ArrowLeft, Plus, ChevronRight, User as UserIcon, Phone, Hash, Heart } from 'lucide-react'
import { OasisCard, OasisButton, OasisIconButton } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

interface FamilyMember {
  name: string
  relation: string
  initials: string
  age: number
  phone?: string
}

const initialFamilyMembers: FamilyMember[] = [
  { name: 'Carlos López', relation: 'Esposo', initials: 'CL', age: 38, phone: '+505 8888-1234' },
  { name: 'Sofía López', relation: 'Hija', initials: 'SL', age: 10 },
  { name: 'Doña Carmen', relation: 'Madre', initials: 'DC', age: 65, phone: '+505 8888-5678' },
]

export default function PatientFamily() {
  const { navigate } = useNavigation()
  const [actingAs, setActingAs] = useState<string | null>(null)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamilyMembers)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formRelation, setFormRelation] = useState('')
  const [formAge, setFormAge] = useState('')
  const [formPhone, setFormPhone] = useState('')

  const resetForm = () => {
    setFormName('')
    setFormRelation('')
    setFormAge('')
    setFormPhone('')
  }

  const handleAddFamily = () => {
    if (!formName.trim() || !formRelation.trim() || !formAge.trim()) return

    const initials = formName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    const newMember: FamilyMember = {
      name: formName.trim(),
      relation: formRelation.trim(),
      initials,
      age: parseInt(formAge, 10) || 0,
      phone: formPhone.trim() || undefined,
    }

    setFamilyMembers(prev => [...prev, newMember])
    resetForm()
    setAddDialogOpen(false)
  }

  const openAddDialog = () => {
    resetForm()
    setAddDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {actingAs && (
        <div className="bg-[#E8F5EE] px-4 py-2 flex items-center justify-between">
          <span className="font-inter text-xs text-[#0E8C5E]">Actuando como <strong>{actingAs}</strong></span>
          <button onClick={() => setActingAs(null)} className="text-xs font-inter text-[#0E8C5E] underline">Volver</button>
        </div>
      )}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-[10px] border-b border-[#E0E0E0]/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('patient-profile')}><ArrowLeft size={20} className="text-[#4A4A4A]" /></button>
            <h1 className="font-nunito font-bold text-lg text-[#4A4A4A]">Perfil Familiar</h1>
          </div>
          <OasisIconButton
            onClick={openAddDialog}
            icon={<Plus size={16} className="text-[#0E8C5E]" />}
            variant="ghost"
            size="sm"
            className="bg-[#E8F5EE]"
          />
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-3">
        {familyMembers.map((member, i) => (
          <OasisCard key={i} className="!p-4" onClick={() => setActingAs(member.name)}>
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-[#E8F5EE]">
                <AvatarFallback className="bg-[#E8F5EE] text-[#0E8C5E] font-nunito font-bold">{member.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-nunito font-bold text-sm text-[#4A4A4A]">{member.name}</div>
                <div className="font-inter text-xs text-[#8A8A8A]">{member.relation} · {member.age} años</div>
              </div>
              <ChevronRight size={16} className="text-[#E0E0E0]" />
            </div>
          </OasisCard>
        ))}

        <button
          onClick={openAddDialog}
          className="w-full p-4 rounded-[16px] border-2 border-dashed border-[#E0E0E0] flex items-center justify-center gap-2 text-[#8A8A8A] hover:border-[#0E8C5E] hover:text-[#0E8C5E] transition-colors"
        >
          <Plus size={16} />
          <span className="font-inter font-semibold text-sm">Agregar familiar</span>
        </button>
      </div>

      {/* Add Family Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="rounded-[20px] max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-[#4A4A4A]">Agregar familiar</DialogTitle>
            <DialogDescription className="font-inter text-[#8A8A8A]">
              Ingresa los datos del nuevo miembro familiar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="font-inter font-medium text-sm text-[#4A4A4A]">Nombre</label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 pl-10 text-sm font-inter rounded-full focus:border-[#0E8C5E] focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="font-inter font-medium text-sm text-[#4A4A4A]">Relación</label>
              <div className="relative">
                <Heart size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
                <input
                  value={formRelation}
                  onChange={(e) => setFormRelation(e.target.value)}
                  placeholder="Ej: Esposo, Hija, Madre"
                  className="w-full border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 pl-10 text-sm font-inter rounded-full focus:border-[#0E8C5E] focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="font-inter font-medium text-sm text-[#4A4A4A]">Edad</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
                <input
                  value={formAge}
                  onChange={(e) => setFormAge(e.target.value)}
                  placeholder="Edad"
                  type="number"
                  className="w-full border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 pl-10 text-sm font-inter rounded-full focus:border-[#0E8C5E] focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="font-inter font-medium text-sm text-[#4A4A4A]">Teléfono</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
                <input
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+505 0000-0000"
                  className="w-full border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 pl-10 text-sm font-inter rounded-full focus:border-[#0E8C5E] focus:outline-none"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <OasisButton variant="ghost" onClick={() => { resetForm(); setAddDialogOpen(false); }}>
              Cancelar
            </OasisButton>
            <OasisButton onClick={handleAddFamily} disabled={!formName.trim() || !formRelation.trim() || !formAge.trim()}>
              Guardar
            </OasisButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
