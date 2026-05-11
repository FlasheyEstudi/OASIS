import React, { useState, useEffect } from 'react'
import { ArrowLeft, Plus, ChevronRight, User as UserIcon, Phone, Hash, Heart, Shield, Home, ShoppingBag, User, ShieldCheck, Check, Clock } from 'lucide-react'
import { OasisCard, OasisButton, OasisIconButton, DropLoader, WaveSkeleton, EmptyState } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { api, setFamilyMemberId, getFamilyMemberId } from '@/lib/api-client'

export default function PatientFamily() {
  const { navigate } = useNavigation()
  const [actingAsId, setActingAsId] = useState<string | null>(getFamilyMemberId())
  const [familyMembers, setFamilyMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formRelation, setFormRelation] = useState('')
  const [formAge, setFormAge] = useState('')
  const [formPhone, setFormPhone] = useState('')

  useEffect(() => {
    loadFamily()
  }, [])

  async function loadFamily() {
    setLoading(true)
    try {
      // Corrected API Path
      const res = await api.get('/patient/family-members')
      if (res.success && res.data) {
        setFamilyMembers(res.data)
      }
    } catch {
      console.error('Failed to load family')
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchContext = (memberId: string | null) => {
    setFamilyMemberId(memberId)
    setActingAsId(memberId)
    navigate('patient-feed')
  }

  const handleAddFamily = async () => {
    if (!formName.trim() || !formRelation.trim() || !formAge.trim()) return

    try {
       const res = await api.post('/patient/family-members', {
          name: formName,
          relationship: formRelation,
          dateOfBirth: new Date(new Date().getFullYear() - parseInt(formAge), 0, 1).toISOString(),
          phone: formPhone
       })
       if (res.success) {
          loadFamily()
          setAddDialogOpen(false)
          setFormName('')
          setFormRelation('')
          setFormAge('')
          setFormPhone('')
       }
    } catch {
       alert('Error al agregar familiar')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pb-24">
      {/* Active Context Banner - Glassmorphism */}
      {actingAsId && (
        <div className="sticky top-0 z-50 bg-[#0E8C5E]/90 backdrop-blur-md px-6 py-2.5 flex items-center justify-between border-b border-white/20">
          <div className="flex items-center gap-2">
             <ShieldCheck size={14} className="text-white" />
             <span className="font-inter text-[10px] font-bold text-white uppercase tracking-widest">
                Perfil Activo: {familyMembers.find(m => m.id === actingAsId)?.name || 'Familiar'}
             </span>
          </div>
          <button onClick={() => handleSwitchContext(null)} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all">
             Cambiar
          </button>
        </div>
      )}

      <div className="px-6 pt-8 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('patient-profile')} className="w-11 h-11 rounded-2xl bg-[#FAFAFA] flex items-center justify-center text-[#4A4A4A] border border-[#F0F0F0]">
              <ArrowLeft size={20} />
            </button>
            <div>
               <h1 className="font-nunito font-black text-2xl text-[#4A4A4A]">Familia Oasis</h1>
               <p className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest">Gestiona la salud de los tuyos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 space-y-4">
        {loading ? (
          <div className="space-y-4">
             {[1, 2, 3].map(i => <WaveSkeleton key={i} className="h-24 w-full rounded-[28px]" />)}
          </div>
        ) : familyMembers.length === 0 ? (
          <div className="py-12">
             <EmptyState message="Zumbi dice: ¡La salud es mejor en familia! Agrega a tus seres queridos aquí." />
          </div>
        ) : (
          <div className="grid gap-4">
             {familyMembers.map((member) => {
               const isActive = actingAsId === member.id
               return (
                  <OasisCard 
                    key={member.id} 
                    className={`relative overflow-hidden transition-all duration-500 hover:-translate-y-1 ${isActive ? 'bg-[#E8F5EE] border-[#0E8C5E]/30 shadow-xl' : 'bg-white border-[#F0F0F0]'}`}
                    onClick={() => handleSwitchContext(member.id)}
                  >
                    {isActive && (
                       <div className="absolute top-0 right-0 p-3">
                          <div className="w-6 h-6 rounded-full bg-[#0E8C5E] flex items-center justify-center text-white shadow-lg animate-scale-in">
                             <Check size={14} strokeWidth={3} />
                          </div>
                       </div>
                    )}
                    <div className="flex items-center gap-5">
                      <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center font-nunito font-black text-xl border-4 border-white shadow-sm ${isActive ? 'bg-[#0E8C5E] text-white' : 'bg-[#FAFAFA] text-[#0E8C5E]'}`}>
                         {member.name.split(' ').map((n:any) => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="font-nunito font-black text-lg text-[#4A4A4A]">{member.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                           <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-tight ${isActive ? 'bg-white text-[#0E8C5E]' : 'bg-[#E8F5EE] text-[#0E8C5E]'}`}>
                              {member.relationship}
                           </span>
                           <span className="text-[10px] font-bold text-[#8A8A8A] flex items-center gap-1">
                              <Clock size={10} /> {member.age || 'N/A'} años
                           </span>
                        </div>
                      </div>
                      {!isActive && <ChevronRight size={20} className="text-[#E0E0E0]" />}
                    </div>
                  </OasisCard>
               )
             })}
          </div>
        )}

        <button
          onClick={() => setAddDialogOpen(true)}
          className="group w-full p-8 rounded-[40px] border-2 border-dashed border-[#F0F0F0] flex flex-col items-center justify-center gap-3 text-[#B0B0B0] hover:border-[#0E8C5E] hover:text-[#0E8C5E] hover:bg-[#E8F5EE]/10 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-full bg-[#FAFAFA] border border-[#F0F0F0] flex items-center justify-center group-hover:scale-110 group-hover:bg-white transition-all shadow-sm">
             <Plus size={24} />
          </div>
          <span className="font-nunito font-black text-base uppercase tracking-tighter">Agregar nuevo familiar</span>
        </button>
      </div>

      {/* Add Family Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="modal-oasis max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-nunito font-black text-2xl text-[#4A4A4A]">Nuevo Familiar</DialogTitle>
            <DialogDescription className="text-xs text-[#8A8A8A]">Completa los datos para el historial médico.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#8A8A8A] uppercase tracking-widest ml-2">Nombre Completo</label>
              <div className="relative">
                <UserIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B0B0B0]" />
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full h-14 border-2 border-[#F0F0F0] bg-[#FAFAFA] pl-14 pr-6 font-inter text-sm text-[#4A4A4A] rounded-[24px] focus:border-[#0E8C5E] focus:bg-white outline-none transition-all shadow-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-[#8A8A8A] uppercase tracking-widest ml-2">Relación</label>
                 <input
                   value={formRelation}
                   onChange={(e) => setFormRelation(e.target.value)}
                   placeholder="Ej: Hijo"
                   className="w-full h-14 border-2 border-[#F0F0F0] bg-[#FAFAFA] px-6 font-inter text-sm text-[#4A4A4A] rounded-[24px] focus:border-[#0E8C5E] focus:bg-white outline-none transition-all shadow-sm"
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-[#8A8A8A] uppercase tracking-widest ml-2">Edad</label>
                 <input
                   value={formAge}
                   onChange={(e) => setFormAge(e.target.value)}
                   placeholder="0"
                   type="number"
                   className="w-full h-14 border-2 border-[#F0F0F0] bg-[#FAFAFA] px-6 font-inter text-sm text-[#4A4A4A] rounded-[24px] focus:border-[#0E8C5E] focus:bg-white outline-none transition-all shadow-sm"
                 />
               </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#8A8A8A] uppercase tracking-widest ml-2">Teléfono (Opcional)</label>
              <div className="relative">
                <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B0B0B0]" />
                <input
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+505 0000-0000"
                  className="w-full h-14 border-2 border-[#F0F0F0] bg-[#FAFAFA] pl-14 pr-6 font-inter text-sm text-[#4A4A4A] rounded-[24px] focus:border-[#0E8C5E] focus:bg-white outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col gap-3 pt-4">
            <OasisButton fullWidth size="lg" onClick={handleAddFamily} disabled={!formName || !formRelation || !formAge}>
              Registrar Familiar
            </OasisButton>
            <button onClick={() => setAddDialogOpen(false)} className="text-xs font-black text-[#8A8A8A] uppercase tracking-widest hover:text-[#4A4A4A]">
               Cancelar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-6 pt-2 bg-white/80 backdrop-blur-md z-40 border-t border-[#F0F0F0]/50">
        <div className="bg-[#4A4A4A] rounded-[32px] h-16 flex items-center justify-around px-2 shadow-2xl">
          {[
            { icon: Home, label: 'Inicio', view: 'patient-feed' as const },
            { icon: ShoppingBag, label: 'Pedidos', view: 'patient-orders' as const },
            { icon: Heart, label: 'Recetas', view: 'patient-prescriptions' as const },
            { icon: User, label: 'Perfil', view: 'patient-profile' as const },
          ].map((item, i) => {
            const isActive = 'patient-profile' === item.view
            return (
              <button
                key={i}
                onClick={() => navigate(item.view)}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${
                  isActive ? 'bg-[#0E8C5E] text-white scale-110' : 'text-white/40 hover:text-white/60'
                }`}
              >
                <item.icon size={22} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
