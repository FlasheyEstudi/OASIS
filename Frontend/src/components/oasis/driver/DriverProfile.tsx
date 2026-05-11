'use client'

import React from 'react'
import { 
  ArrowLeft, Star, Bike, MapPin, Clock, Settings, 
  LogOut, ShieldCheck, User, ChevronLeft, Loader2 
} from 'lucide-react'
import { OasisCard, OasisButton } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { useAuthStore } from '@/lib/auth-store'
import { api } from '@/lib/api-client'
import { oasisToast } from '@/lib/oasis-toast'

export default function DriverProfile() {
  const { navigate } = useNavigation()
  const { user, roleProfile, logout, setUser, setRoleProfile } = useAuthStore() as any
  const [isEditing, setIsEditing] = React.useState(false)
  const [updating, setUpdating] = React.useState(false)
  
  // Form state initialized from roleProfile
  const [formData, setFormData] = React.useState({
    name: user?.name || '',
    phone: user?.phone || '',
    vehicleType: roleProfile?.vehicleType || 'Moto',
    plateNumber: roleProfile?.plateNumber || '',
    zones: roleProfile?.zones 
      ? (typeof roleProfile.zones === 'string' 
          ? JSON.parse(roleProfile.zones) 
          : roleProfile.zones) 
      : ['Managua Centro', 'Los Robles', 'Altamira']
  })
  const [newZone, setNewZone] = React.useState('')

  React.useEffect(() => {
    // Register FCM token if available in local storage
    const fcmToken = localStorage.getItem('oasis_fcm_token')
    if (fcmToken) {
      api.post('/auth/fcm-token', { token: fcmToken }).catch(() => {})
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('landing')
  }

  const addZone = () => {
    if (!newZone.trim()) return
    if (formData.zones.includes(newZone.trim())) return
    setFormData({ ...formData, zones: [...formData.zones, newZone.trim()] })
    setNewZone('')
  }

  const removeZone = (zoneToRemove: string) => {
    setFormData({ ...formData, zones: formData.zones.filter((z: string) => z !== zoneToRemove) })
  }

  const handleSave = async () => {
    setUpdating(true)
    try {
      const res = await api.put('/delivery/update-profile', {
        name: formData.name,
        phone: formData.phone,
        vehicleType: formData.vehicleType,
        plateNumber: formData.plateNumber,
        zones: formData.zones
      })

      if (res.success) {
        if (!user) return

        // Update local state with type safety
        const updatedUser = { 
          ...user, 
          name: formData.name, 
          phone: formData.phone,
        }
        
        const updatedProfile = {
          ...roleProfile,
          vehicleType: formData.vehicleType,
          plateNumber: formData.plateNumber,
          zones: formData.zones
        }
        
        setUser(updatedUser)
        setRoleProfile(updatedProfile)
        
        oasisToast.success('Perfil Actualizado', 'Tus datos se han guardado correctamente.')
        setIsEditing(false)
      }
    } catch (err) {
      oasisToast.error('Error', 'No se pudieron guardar los cambios.')
    } finally {
      setUpdating(false)
    }
  }

  // Use the local form state for instant preview while editing, or roleProfile otherwise
  const profile = roleProfile || {}
  const vehicle = formData.vehicleType || profile.vehicleType || 'Moto'
  const plate = formData.plateNumber || profile.plateNumber || 'M-7742'
  const rating = profile.rating || 4.8
  const totalDeliveries = profile.totalDeliveries || 0
  const zones = formData.zones
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-[10px] border-b border-[#F0F0F0] px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('driver-main')} className="w-10 h-10 rounded-2xl bg-[#FAFAFA] flex items-center justify-center text-[#4A4A4A]">
             <ArrowLeft size={20} />
          </button>
          <h1 className="font-nunito font-bold text-xl text-[#4A4A4A]">Mi Perfil</h1>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Profile Card */}
        <div className="text-center">
           <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-full h-full rounded-full oasis-gradient p-1 shadow-xl">
                 <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    <User size={48} className="text-[#0E8C5E]" />
                 </div>
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#0E8C5E] rounded-full border-4 border-white flex items-center justify-center text-white">
                 <ShieldCheck size={16} />
              </div>
           </div>
           
           <h2 className="font-nunito font-bold text-2xl text-[#4A4A4A]">{user?.name || 'Luis Rojas'}</h2>
           <p className="font-inter text-sm text-[#8A8A8A] flex items-center justify-center gap-1.5 mt-1">
              <Bike size={16} className="text-[#0E8C5E]" /> {vehicle} · Placa {plate}
           </p>
           
           <div className="flex items-center justify-center gap-2 mt-3 px-4 py-1.5 bg-[#FAFAFA] w-fit mx-auto rounded-full border border-[#F0F0F0]">
              <Star size={16} className="fill-[#F4A261] text-[#F4A261]" />
              <span className="font-nunito font-bold text-sm text-[#4A4A4A]">{rating}</span>
              <span className="w-1 h-1 rounded-full bg-[#E0E0E0]" />
              <span className="font-inter text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">{totalDeliveries} Entregas</span>
           </div>
        </div>

        {/* Working Zones */}
        <OasisCard className="p-6">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-[#0E8C5E]">
                 <MapPin size={20} />
              </div>
              <h3 className="font-nunito font-bold text-lg text-[#4A4A4A]">Zonas de Cobertura</h3>
           </div>
           <div className="flex flex-wrap gap-2">
              {zones.map((zone: string, i: number) => (
                 <span key={zone} className="px-3 py-1.5 rounded-full bg-[#FAFAFA] border border-[#F0F0F0] text-xs font-bold text-[#4A4A4A]">
                    {zone}
                 </span>
              ))}
              <button 
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-full border border-dashed border-[#0E8C5E] text-[#0E8C5E] text-xs font-bold active:bg-[#E8F5EE] transition-colors"
              >
                + Editar
              </button>
           </div>
        </OasisCard>

        {/* Schedule */}
        <OasisCard className="p-6">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] flex items-center justify-center text-[#0077B6]">
                 <Clock size={20} />
              </div>
              <h3 className="font-nunito font-bold text-lg text-[#4A4A4A]">Disponibilidad</h3>
           </div>
           <div className="flex justify-between mb-4">
              {days.map((day, i) => (
                 <div key={day} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                       i < 5 ? 'bg-[#0E8C5E] text-white shadow-md' : 'bg-[#FAFAFA] border border-[#F0F0F0] text-[#8A8A8A]'
                    }`}>
                       {day}
                    </div>
                 </div>
              ))}
           </div>
           <div className="flex justify-between items-center p-3 bg-[#FAFAFA] rounded-xl border border-[#F0F0F0]">
              <span className="font-inter text-xs font-bold text-[#4A4A4A]">Turno Diario</span>
              <span className="font-nunito font-bold text-sm text-[#0E8C5E]">08:00 AM - 06:00 PM</span>
           </div>
        </OasisCard>

        {/* Actions */}
        <div className="space-y-3">
           <button 
             onClick={() => setIsEditing(true)}
             className="w-full flex items-center justify-between p-5 bg-[#FAFAFA] rounded-[24px] border border-[#F0F0F0] hover:bg-white hover:border-[#0E8C5E] hover:shadow-lg transition-all group"
           >
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#8A8A8A] group-hover:text-[#0E8C5E]">
                    <Settings size={22} />
                 </div>
                 <span className="font-nunito font-bold text-[#4A4A4A]">Configuración de Cuenta</span>
              </div>
              <ChevronLeft size={20} className="text-[#E0E0E0] rotate-180" />
           </button>
           
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-between p-5 bg-[#FFF3E0] rounded-[24px] border border-[#F4A261]/20 hover:bg-[#F4A261] hover:text-white transition-all group"
           >
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#F4A261]">
                    <LogOut size={22} />
                 </div>
                 <span className="font-nunito font-bold text-[#4A4A4A] group-hover:text-white">Cerrar Sesión</span>
              </div>
           </button>
        </div>
      </div>

      {/* Edit Settings Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[2000] flex items-end justify-center">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
           <div className="relative w-full max-w-lg bg-white rounded-t-[40px] p-8 space-y-6 animate-slide-up">
              <div className="w-12 h-1.5 bg-[#E0E0E0] rounded-full mx-auto mb-2" />
              <h3 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Editar Perfil</h3>
              
              <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                 {/* Personal Info Section */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-[#8A8A8A] ml-1 uppercase">Nombre</label>
                       <input 
                         type="text" 
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                         className="w-full h-14 bg-[#FAFAFA] border border-[#F0F0F0] rounded-2xl px-5 font-inter text-[#4A4A4A] focus:border-[#0E8C5E] outline-none transition-all"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-[#8A8A8A] ml-1 uppercase">Teléfono</label>
                       <input 
                         type="tel" 
                         value={formData.phone}
                         onChange={(e) => setFormData({...formData, phone: e.target.value})}
                         className="w-full h-14 bg-[#FAFAFA] border border-[#F0F0F0] rounded-2xl px-5 font-inter text-[#4A4A4A] focus:border-[#0E8C5E] outline-none transition-all"
                       />
                    </div>
                 </div>

                 {/* Vehicle Info Section */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-[#8A8A8A] ml-1 uppercase">Vehículo</label>
                       <select 
                         value={formData.vehicleType}
                         onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                         className="w-full h-14 bg-[#FAFAFA] border border-[#F0F0F0] rounded-2xl px-5 font-inter text-[#4A4A4A] focus:border-[#0E8C5E] outline-none transition-all"
                       >
                          <option value="Moto">Moto</option>
                          <option value="Bicicleta">Bicicleta</option>
                          <option value="Auto">Auto</option>
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-[#8A8A8A] ml-1 uppercase">Placa</label>
                       <input 
                         type="text" 
                         value={formData.plateNumber}
                         onChange={(e) => setFormData({...formData, plateNumber: e.target.value})}
                         className="w-full h-14 bg-[#FAFAFA] border border-[#F0F0F0] rounded-2xl px-5 font-inter text-[#4A4A4A] focus:border-[#0E8C5E] outline-none transition-all"
                       />
                    </div>
                 </div>

                 {/* Zones Management Section */}
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8A8A8A] ml-1 uppercase">Zonas de Cobertura</label>
                    <div className="flex gap-2 mb-2">
                       <input 
                         type="text" 
                         value={newZone}
                         onChange={(e) => setNewZone(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && addZone()}
                         placeholder="Ej: Bello Horizonte"
                         className="flex-1 h-12 bg-[#FAFAFA] border border-[#F0F0F0] rounded-xl px-4 font-inter text-sm outline-none focus:border-[#0E8C5E]"
                       />
                       <button 
                         onClick={addZone}
                         className="px-4 h-12 bg-[#0E8C5E] text-white rounded-xl font-bold text-sm"
                       >
                          +
                       </button>
                    </div>
                    <div className="flex flex-wrap gap-2 p-3 bg-[#FAFAFA] rounded-2xl border border-[#F0F0F0] min-h-[60px]">
                       {formData.zones.map((zone: string) => (
                          <div key={zone} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8F5EE] rounded-full">
                             <span className="text-xs font-bold text-[#4A4A4A]">{zone}</span>
                             <button onClick={() => removeZone(zone)} className="text-[#F4A261] hover:text-red-500">
                                <LogOut size={12} className="rotate-45" /> 
                             </button>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <OasisButton variant="ghost" className="flex-1" onClick={() => setIsEditing(false)}>CANCELAR</OasisButton>
                 <OasisButton 
                   className="flex-1" 
                   onClick={handleSave}
                   disabled={updating}
                 >
                    {updating ? <Loader2 className="animate-spin" /> : 'GUARDAR CAMBIOS'}
                 </OasisButton>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
