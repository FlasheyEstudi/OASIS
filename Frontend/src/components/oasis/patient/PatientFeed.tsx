'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Filter, Bell, Heart, ShoppingBag, User, Clock, Pill, Building2, Siren, ArrowRight, Star, AlertCircle } from 'lucide-react'
import { OasisCard, OasisButton, StarRating, EmptyState, DropLoader, ErrorState, WaveSkeleton } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { oasisToast } from '@/lib/oasis-toast'
import { NotificationsTray } from '../platform/NotificationsTray'

const filterChips = ['Más cercanos', 'Mejor precio', '24h', 'Delivery', 'Abierto ahora']

export default function PatientFeed() {
  const { navigate } = useNavigation()
  const { user } = useAuthStore()
  const [location, setLocation] = useState({ lat: 12.136, lng: -86.251 })
  const [gpsError, setGpsError] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeFilter, setActiveFilter] = useState('Más cercanos')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const requestGps = async () => {
    if (typeof window === 'undefined') return
    setGpsError(false) // Reset error to show "trying" state
    
    if (!navigator.geolocation) {
      oasisToast.error('GPS no soportado', 'Tu dispositivo no permite geolocalización.')
      setGpsError(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsError(false)
        oasisToast.success('Ubicación Actualizada', 'Servicios cercanos cargados.')
      },
      (err) => {
        console.warn('[GPS] Error:', err.message)
        setGpsError(true)
        // Auto-fallback to default location after error
        setLocation({ lat: 12.136, lng: -86.251 })
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const useManualLocation = () => {
    setLocation({ lat: 12.136, lng: -86.251 })
    setGpsError(false)
    oasisToast.info('Ubicación Manual', 'Usando Managua como ubicación base.')
  }

  useEffect(() => {
    requestGps()
  }, [])

  useEffect(() => {
    loadFeed()
  }, [location, activeFilter])

  async function loadFeed() {
    setLoading(true)
    setError(null)
    try {
      const [pharmacyRes, clinicRes] = await Promise.all([
        api.get('/patient/nearby-pharmacies', { lat: location.lat, lng: location.lng, radius: 10 }),
        api.get('/patient/nearby-clinics', { lat: location.lat, lng: location.lng, radius: 10 })
      ])

      let combined: any[] = []

      if (pharmacyRes.success && pharmacyRes.data.pharmacies) {
        combined = [...combined, ...pharmacyRes.data.pharmacies.map((p: any) => ({ ...p, type: 'farmacia' }))]
      }
      if (clinicRes.success && clinicRes.data.clinics) {
        combined = [...combined, ...clinicRes.data.clinics.map((c: any) => ({ ...c, type: 'clinica' }))]
      }

      // Sort by distance
      combined.sort((a, b) => a.distance - b.distance)
      setItems(combined)
    } catch (err) {
      setError('No pudimos cargar los servicios cercanos. Verifica tu conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-[#E8F5EE] p-0.5">
               <div className="w-full h-full rounded-full bg-[#E8F5EE] flex items-center justify-center overflow-hidden">
                  <User size={24} className="text-[#0E8C5E]" />
               </div>
            </div>
            <div>
              <p className="font-inter text-xs text-[#8A8A8A]">Hola,</p>
              <h1 className="font-nunito font-bold text-lg text-[#4A4A4A]">{user?.name?.split(' ')[0] || 'Paciente'}</h1>
            </div>
          </div>
          <button 
            className="w-10 h-10 rounded-full bg-[#FAFAFA] border border-[#F0F0F0] flex items-center justify-center relative"
            onClick={() => setShowNotifications(true)}
          >
            <Bell size={20} className="text-[#4A4A4A]" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white" />
          </button>
        </div>
        <NotificationsTray open={showNotifications} onOpenChange={setShowNotifications} />

        {/* Unified Search */}
        <div 
          onClick={() => navigate('patient-search')}
          className="relative group cursor-pointer"
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A8A] group-hover:text-[#0E8C5E] transition-colors">
            <Search size={20} />
          </div>
          <div className="w-full h-14 border-2 border-[#F0F0F0] bg-[#FAFAFA] rounded-[22px] flex items-center pl-12 pr-4 text-sm font-inter text-[#B0B0B0] group-hover:border-[#0E8C5E]/30 transition-all">
            Busca tu medicamento o clínica...
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
          {filterChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`px-4 py-2 rounded-full text-xs font-inter font-bold whitespace-nowrap transition-all ${
                activeFilter === chip
                  ? 'bg-[#0E8C5E] text-white shadow-md'
                  : 'bg-[#FAFAFA] border border-[#F0F0F0] text-[#8A8A8A] hover:border-[#0E8C5E]/30'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* GPS Status/Error Notification */}
      <div className="px-6 mb-4">
        {gpsError ? (
           <div className="bg-[#FFF3E0] p-4 rounded-[28px] border border-[#F4A261]/30 flex items-center justify-between animate-shake">
              <div className="flex items-center gap-3 text-[#F4A261]">
                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <AlertCircle size={20} />
                 </div>
                 <div>
                    <p className="font-nunito font-bold text-sm leading-tight">Ubicación Bloqueada</p>
                    <p className="text-[10px] font-inter opacity-70">Pulsa permitir o usa Managua (default)</p>
                 </div>
              </div>
              <div className="flex gap-2">
                <OasisButton 
                  onClick={requestGps}
                  size="sm"
                  variant="outline"
                  className="!px-3 !py-2 !text-[10px] bg-white border-[#F4A261]/20 text-[#F4A261]"
                >
                   Reintentar
                </OasisButton>
                <OasisButton 
                  onClick={useManualLocation}
                  size="sm"
                  className="!px-3 !py-2 !text-[10px]"
                >
                   Usar Manual
                </OasisButton>
              </div>
           </div>
        ) : (
           <div className="flex items-center gap-2 px-2">
              <div className="w-2 h-2 rounded-full bg-[#0E8C5E] animate-pulse" />
              <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest">GPS Activo: Managua</span>
           </div>
        )}
      </div>

      {/* Map Preview */}
      <div className="px-6 mb-6">
         <div 
           className="relative h-40 bg-[#E8F5EE] rounded-[32px] overflow-hidden border-4 border-white shadow-xl group cursor-pointer" 
           onClick={() => navigate('patient-nearby')}
         >
            {/* Live Map Preview (Simplified) */}
            <div className="absolute inset-0 z-0">
               <iframe 
                 width="100%" 
                 height="100%" 
                 frameBorder="0" 
                 scrolling="no" 
                 marginHeight={0} 
                 marginWidth={0} 
                 src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng-0.01}%2C${location.lat-0.01}%2C${location.lng+0.01}%2C${location.lat+0.01}&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
                 className="grayscale opacity-60 pointer-events-none"
               />
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-gradient-to-t from-[#E8F5EE]/80 to-transparent">
               <div className="flex flex-col items-center gap-2 scale-100 group-hover:scale-110 transition-transform">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#0E8C5E] shadow-lg">
                     <MapPin size={28} />
                  </div>
                  <span className="font-nunito font-bold text-sm text-[#0E8C5E] bg-white/90 px-4 py-1 rounded-full shadow-sm">Explorar servicios cercanos</span>
               </div>
            </div>
            {/* Pulsing dots for effect */}
            <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-[#0E8C5E] rounded-full animate-ping z-20" />
            <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-[#0077B6] rounded-full animate-ping opacity-75 z-20" />
         </div>
      </div>

      {/* Feed Content */}
      <div className="flex-1 px-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-nunito font-bold text-xl text-[#4A4A4A]">Servicios Cerca</h2>
          <button className="text-[10px] font-bold text-[#0E8C5E] uppercase tracking-widest hover:underline">Ver todo</button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-[24px] bg-[#FAFAFA] overflow-hidden">
                <WaveSkeleton className="w-full h-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadFeed} />
        ) : items.length === 0 ? (
          <EmptyState message="No hay servicios cerca en este momento. Zumbi está trabajando en ello." />
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <OasisCard 
                key={item.id} 
                className="group relative overflow-hidden" 
                onClick={() => {
                  if (item.type === 'farmacia') navigate('patient-search') // Or pharmacy detail if implemented
                  else navigate('patient-appointments')
                }}
              >
                <div className="flex gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                    item.type === 'farmacia' ? 'bg-[#E8F5EE] text-[#0E8C5E]' : 'bg-[#E0F2FE] text-[#0077B6]'
                  }`}>
                    {item.type === 'farmacia' ? <Pill size={28} /> : <Building2 size={28} />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-nunito font-bold text-[#4A4A4A]">{item.name}</h3>
                      <div className="flex items-center gap-1 px-2 py-1 bg-[#FAFAFA] rounded-lg text-[10px] font-bold text-[#8A8A8A]">
                        <MapPin size={10} className="text-[#0E8C5E]" /> {item.distance}km
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="fill-[#F4A261] text-[#F4A261]" />
                        <span className="text-xs font-bold text-[#4A4A4A]">{item.rating || '4.5'}</span>
                      </div>
                      <span className="w-1 h-1 rounded-full bg-[#E0E0E0]" />
                      <div className={`flex items-center gap-1 text-[10px] font-bold ${item.isOpen ? 'text-[#0E8C5E]' : 'text-[#8A8A8A]'}`}>
                        <Clock size={10} /> {item.isOpen ? 'ABIERTO AHORA' : 'CERRADO'}
                      </div>
                    </div>
                    
                    <div className="flex gap-1.5 pt-1">
                      {item.type === 'farmacia' && (
                        <>
                          <span className="px-2 py-0.5 bg-[#E8F5EE] text-[#0E8C5E] text-[9px] font-bold rounded-md uppercase">Delivery</span>
                          {item.promotions?.length > 0 && (
                            <span className="px-2 py-0.5 bg-[#FFF3E0] text-[#F4A261] text-[9px] font-bold rounded-md uppercase">Promos</span>
                          )}
                        </>
                      )}
                      {item.type === 'clinica' && (
                        <span className="px-2 py-0.5 bg-[#E0F2FE] text-[#0077B6] text-[9px] font-bold rounded-md uppercase">Telemedicina</span>
                      )}
                    </div>
                  </div>
                </div>
              </OasisCard>
            ))}
          </div>
        )}
      </div>

      {/* Emergency FAB */}
      <button
        onClick={() => navigate('patient-emergency')}
        className="fixed bottom-24 right-6 z-50 w-16 h-16 rounded-full bg-[#F4A261] text-white flex items-center justify-center shadow-[0_8px_30px_rgba(244,162,97,0.4)] hover:scale-110 active:scale-95 transition-all group"
        style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }}
      >
        <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20 animate-ping" />
        <Siren size={32} />
      </button>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-6 pt-2 bg-white/80 backdrop-blur-md z-40 border-t border-[#F0F0F0]/50">
        <div className="bg-[#4A4A4A] rounded-[32px] h-16 flex items-center justify-around px-2 shadow-2xl">
          {[
            { icon: Search, label: 'Inicio', view: 'patient-feed' as const },
            { icon: ShoppingBag, label: 'Pedidos', view: 'patient-orders' as const },
            { icon: Heart, label: 'Recetas', view: 'patient-prescriptions' as const },
            { icon: User, label: 'Perfil', view: 'patient-profile' as const },
          ].map((item, i) => {
            const isActive = 'patient-feed' === item.view // This would be dynamic in real app
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

