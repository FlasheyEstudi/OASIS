'use client'

import { ArrowLeft, Heart, FileText, ShoppingBag, Users, Shield, MessageCircle, Bell, Droplet } from 'lucide-react'
import { OasisCard } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-[10px] border-b border-[#E0E0E0]/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('patient-feed')}><ArrowLeft size={20} className="text-[#4A4A4A]" /></button>
          <h1 className="font-nunito font-bold text-lg text-[#4A4A4A]">Mi Oasis</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        {/* Profile header */}
        <div className="text-center mb-6">
          <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-[#E8F5EE]">
            <AvatarFallback className="bg-[#E8F5EE] text-[#0E8C5E] font-nunito font-bold text-2xl">ML</AvatarFallback>
          </Avatar>
          <div className="font-nunito font-bold text-xl text-[#4A4A4A]">María López</div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="flex items-center gap-1 capsule bg-[#FFF3E0] text-[#F4A261] px-3 py-1 text-xs font-inter font-semibold">
              <Droplet size={12} className="inline mr-1" /> Nivel Plata
            </div>
          </div>
          {/* Progress to next level */}
          <div className="mt-3 max-w-[200px] mx-auto">
            <div className="flex justify-between text-[10px] font-inter text-[#8A8A8A] mb-1">
              <span>Plata</span>
              <span>Oro</span>
            </div>
            <div className="h-2 rounded-full bg-[#E0E0E0]">
              <div className="h-full rounded-full oasis-gradient" style={{ width: '65%' }} />
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="space-y-2">
          {profileMenu.map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.view)}
              className={`w-full flex items-center gap-3 p-4 rounded-[16px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                item.color === '#F4A261' ? 'bg-[#FFF3E0] border border-[#F4A261]/30' : 'bg-[#FAFAFA]'
              }`}
            >
              <item.icon size={20} className={item.color === '#F4A261' ? 'text-[#F4A261]' : 'text-[#0E8C5E]'} />
              <span className={`font-inter font-semibold text-sm flex-1 text-left ${
                item.color === '#F4A261' ? 'text-[#F4A261]' : 'text-[#4A4A4A]'
              }`}>
                {item.label}
              </span>
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d="M1 1L7 7L1 13" stroke={item.color === '#F4A261' ? '#F4A261' : '#8A8A8A'} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => navigate('landing')}
          className="w-full mt-6 p-3 rounded-[14px] text-center font-inter text-sm text-[#8A8A8A] hover:text-[#EF4444] transition-colors"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0E0E0] h-16 flex items-center justify-around z-40">
        {['Inicio', 'Pedidos', 'Perfil', 'Chat'].map((label, i) => (
          <button key={i} className={`flex flex-col items-center gap-0.5 px-3 py-1 ${i === 2 ? 'text-[#0E8C5E]' : 'text-[#8A8A8A]'}`}>
            {i === 2 && <div className="w-1 h-1 rounded-full bg-[#0E8C5E] mb-0.5" />}
            <span className="text-[9px] font-inter font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
