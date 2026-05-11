'use client'

import { ArrowLeft, Star, Bike, MapPin, Clock, Settings } from 'lucide-react'
import { OasisCard, StarRating } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const zones = ['Managua Centro', 'Managua Sur', 'Carretera Norte', 'Ciudad Sandino']
const schedule = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

export default function DriverProfile() {
  const { navigate } = useNavigation()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-[10px] border-b border-[#E0E0E0]/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('driver-main')}><ArrowLeft size={20} className="text-[#4A4A4A]" /></button>
          <h1 className="font-nunito font-bold text-lg text-[#4A4A4A]">Mi Perfil</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 space-y-4">
        {/* Profile header */}
        <div className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-[#E8F5EE]">
            <AvatarFallback className="bg-[#E8F5EE] text-[#0E8C5E] font-nunito font-bold text-2xl">PG</AvatarFallback>
          </Avatar>
          <div className="font-nunito font-bold text-xl text-[#4A4A4A]">Pedro Gutiérrez</div>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Bike size={14} className="text-[#8A8A8A]" />
            <span className="font-inter text-sm text-[#8A8A8A]">Moto · Placa M-1234</span>
          </div>
          <div className="flex items-center justify-center gap-1 mt-2">
            <StarRating rating={5} size={14} />
            <span className="font-inter text-xs text-[#8A8A8A]">4.9 (128 entregas)</span>
          </div>
        </div>

        {/* Zones */}
        <OasisCard>
          <h3 className="font-nunito font-bold text-sm text-[#4A4A4A] mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-[#0E8C5E]" /> Zonas de Trabajo
          </h3>
          <div className="flex flex-wrap gap-2">
            {zones.map((zone, i) => (
              <span key={i} className={`capsule px-3 py-1.5 text-xs font-inter font-semibold ${
                i < 2 ? 'bg-[#E8F5EE] text-[#0E8C5E]' : 'bg-[#E0E0E0] text-[#8A8A8A]'
              }`}>
                {zone}
              </span>
            ))}
          </div>
        </OasisCard>

        {/* Schedule */}
        <OasisCard>
          <h3 className="font-nunito font-bold text-sm text-[#4A4A4A] mb-3 flex items-center gap-2">
            <Clock size={16} className="text-[#0077B6]" /> Horario
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => (
              <span key={i} className={`capsule px-3 py-1.5 text-xs font-inter font-semibold ${
                i < 5 ? 'bg-[#E8F5EE] text-[#0E8C5E]' : 'bg-[#E0E0E0] text-[#8A8A8A]'
              }`}>
                {day}
              </span>
            ))}
          </div>
          <div className="font-inter text-xs text-[#8A8A8A] mt-2">8:00 AM - 6:00 PM</div>
        </OasisCard>

        {/* Settings */}
        <OasisCard>
          <button className="flex items-center gap-3 w-full" onClick={() => navigate('landing')}>
            <Settings size={18} className="text-[#8A8A8A]" />
            <span className="font-inter font-medium text-sm text-[#4A4A4A]">Configuración</span>
          </button>
        </OasisCard>
      </div>
    </div>
  )
}
