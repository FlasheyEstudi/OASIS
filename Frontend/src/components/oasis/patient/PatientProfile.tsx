import React, { useState, useEffect } from 'react'
import { ArrowLeft, Heart, FileText, ShoppingBag, Users, Shield, MessageCircle, Bell, Droplet, User, Edit3, Save, X, Phone, AlertCircle, Home, ShoppingBasket, Star, ChevronRight } from 'lucide-react'
import { OasisCard, OasisButton, OasisIconButton, DropLoader, WaveSkeleton } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const profileMenu = [
  { icon: Heart, label: 'Mi historial médico', view: 'patient-history' as const },
  { icon: FileText, label: 'Mis recetas', view: 'patient-prescriptions' as const },
  { icon: ShoppingBag, label: 'Mis pedidos', view: 'patient-orders' as const },
  { icon: Users, label: 'Perfil familiar', view: 'patient-family' as const },
  { icon: Shield, label: 'Mis seguros', view: 'patient-insurance' as const },
  { icon: MessageCircle, label: 'Chat con mi doctor', view: 'patient-chat' as const },
  { icon: Bell, label: 'Emergencia', view: 'patient-emergency' as const, color: '#F4A261' },
]

export default function PatientProfile() {
  const { navigate } = useNavigation()
  const { user, logout } = useAuthStore()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  
  // Edit form state
  const [allergies, setAllergies] = useState('')
  const [conditions, setConditions] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    setLoading(true)
    try {
      // In a real app, we would fetch from /patient/profile
      // For now, we simulate using auth user and some extra fields
      await new Promise(r => setTimeout(r, 800))
      setProfile({
        ...user,
        loyaltyPoints: 1250,
        loyaltyLevel: 'Plata',
        nextLevelPoints: 2000,
        allergies: 'Penicilina, Polen',
        conditions: 'Asma leve',
        emergencyContact: '+505 8888-0000 (Mamá)'
      })
      setAllergies('Penicilina, Polen')
      setConditions('Asma leve')
      setEmergencyContact('+505 8888-0000 (Mamá)')
    } catch {
      console.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
     // Simulate save
     setLoading(true)
     await new Promise(r => setTimeout(r, 1000))
     setProfile({ ...profile, allergies, conditions, emergencyContact })
     setEditOpen(false)
     setLoading(false)
  }

  const getLevelColor = (level: string) => {
     switch(level) {
        case 'Bronce': return '#A77044'
        case 'Plata': return '#0077B6'
        case 'Oro': return '#F4A261'
        case 'Diamante': return '#0E8C5E'
        default: return '#8A8A8A'
     }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('patient-feed')} className="w-10 h-10 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#4A4A4A] hover:bg-[#F0F0F0] transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-nunito font-bold text-xl text-[#4A4A4A]">Mi Oasis</h1>
          </div>
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
             <DialogTrigger asChild>
                <button className="w-10 h-10 rounded-full bg-[#E8F5EE] text-[#0E8C5E] flex items-center justify-center hover:scale-105 transition-all shadow-sm">
                   <Edit3 size={18} />
                </button>
             </DialogTrigger>
             <DialogContent className="modal-oasis max-w-sm">
                <DialogHeader>
                   <DialogTitle className="font-nunito font-bold text-xl">Editar Perfil de Salud</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest ml-2">Alergias Conocidas</label>
                      <textarea 
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        className="w-full bg-[#FAFAFA] border-2 border-[#F0F0F0] rounded-2xl p-4 text-sm font-inter focus:border-[#0E8C5E] outline-none min-h-[80px]"
                        placeholder="Ej: Penicilina, Nueces..."
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest ml-2">Condiciones Crónicas</label>
                      <textarea 
                        value={conditions}
                        onChange={(e) => setConditions(e.target.value)}
                        className="w-full bg-[#FAFAFA] border-2 border-[#F0F0F0] rounded-2xl p-4 text-sm font-inter focus:border-[#0E8C5E] outline-none min-h-[80px]"
                        placeholder="Ej: Asma, Diabetes Tipo 2..."
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest ml-2">Contacto de Emergencia</label>
                      <input 
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        className="w-full h-14 bg-[#FAFAFA] border-2 border-[#F0F0F0] rounded-[22px] px-6 text-sm font-inter focus:border-[#0E8C5E] outline-none"
                        placeholder="Nombre y Teléfono"
                      />
                   </div>
                   <OasisButton fullWidth size="lg" onClick={handleSaveProfile} disabled={loading}>
                      {loading ? <DropLoader size={24} color="#FFF" /> : <><Save size={18} className="mr-2" /> Guardar Cambios</>}
                   </OasisButton>
                </div>
             </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 px-6 space-y-8">
        {/* Profile Card */}
        <div className="relative pt-12 pb-8 flex flex-col items-center text-center">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#E8F5EE] rounded-full blur-[60px] -z-10 opacity-60" />
           
           <div className="relative group">
              <div className="w-28 h-28 rounded-[40px] bg-white border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                 {profile?.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                    <User size={48} className="text-[#0E8C5E]" />
                 )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl oasis-gradient border-4 border-white flex items-center justify-center text-white shadow-lg">
                 <Droplet size={18} />
              </div>
           </div>

           <div className="mt-6 space-y-1">
              <h2 className="font-nunito font-black text-2xl text-[#4A4A4A]">{profile?.name || user?.name || 'María López'}</h2>
              <p className="font-inter text-sm text-[#8A8A8A]">{profile?.email || user?.email}</p>
           </div>

           {/* Loyalty Level */}
           <div className="w-full max-w-[280px] mt-8 bg-white oasis-shadow p-5 rounded-[32px] border border-[#F0F0F0]">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex flex-col items-start">
                    <p className="text-[10px] font-bold text-[#8A8A8A] uppercase">Nivel de Salud</p>
                    <p className="font-nunito font-black text-lg" style={{ color: getLevelColor(profile?.loyaltyLevel || 'Bronce') }}>
                       {profile?.loyaltyLevel || 'Plata'}
                    </p>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] flex items-center justify-center text-[#F4A261] border border-[#F0F0F0]">
                    <Star className="fill-current" size={24} />
                 </div>
              </div>
              
              <div className="space-y-2">
                 <div className="h-2 w-full bg-[#F0F0F0] rounded-full overflow-hidden">
                    <div 
                      className="h-full oasis-gradient rounded-full transition-all duration-1000" 
                      style={{ width: `${((profile?.loyaltyPoints || 0) / (profile?.nextLevelPoints || 100)) * 100}%` }} 
                    />
                 </div>
                 <div className="flex justify-between items-center text-[9px] font-bold text-[#8A8A8A] uppercase tracking-wider">
                    <span>{profile?.loyaltyPoints || 1250} Ptos</span>
                    <span>Meta: {profile?.nextLevelPoints || 2000}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Health Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
           {[
              { label: 'Alergias', val: profile?.allergies?.split(',').length || 0, icon: AlertCircle, color: '#EF4444' },
              { label: 'Recetas', val: 5, icon: FileText, color: '#0E8C5E' },
              { label: 'Pedidos', val: 12, icon: ShoppingBasket, color: '#0077B6' },
           ].map((stat, i) => (
             <div key={i} className="bg-[#FAFAFA] p-4 rounded-3xl border border-[#F0F0F0] flex flex-col items-center gap-1">
                <stat.icon size={18} style={{ color: stat.color }} />
                <p className="font-nunito font-black text-lg text-[#4A4A4A]">{stat.val}</p>
                <p className="text-[9px] font-bold text-[#8A8A8A] uppercase tracking-tighter">{stat.label}</p>
             </div>
           ))}
        </div>

        {/* Menu Menu */}
        <div className="space-y-3">
          {profileMenu.map((item, i) => (
            <OasisCard
              key={i}
              className={`!p-4 border border-[#F0F0F0] ${item.color ? 'bg-[#FFF3E0]/30' : ''}`}
              onClick={() => navigate(item.view)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    item.color ? 'bg-[#FFF3E0] text-[#F4A261]' : 'bg-[#E8F5EE] text-[#0E8C5E]'
                  }`}>
                    <item.icon size={20} />
                  </div>
                  <span className={`font-nunito font-bold text-sm ${item.color ? 'text-[#F4A261]' : 'text-[#4A4A4A]'}`}>
                    {item.label}
                  </span>
                </div>
                <ChevronRight size={18} className="text-[#B0B0B0]" />
              </div>
            </OasisCard>
          ))}
        </div>

        {/* Logout */}
        <div className="pt-4 flex flex-col items-center gap-6">
           <button
             onClick={() => { logout(); navigate('landing'); }}
             className="flex items-center gap-2 font-inter font-bold text-sm text-[#EF4444] hover:opacity-70 transition-opacity"
           >
             <X size={18} /> Cerrar Sesión Segura
           </button>
           
           <p className="text-[10px] font-bold text-[#B0B0B0] uppercase tracking-widest">
              OASIS ID: {user?.id?.slice(-8).toUpperCase() || 'DEMO-7722'}
           </p>
        </div>
      </div>

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
