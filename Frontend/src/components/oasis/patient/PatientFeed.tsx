'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Star, Filter, Bell, Heart, ShoppingBag, User, Clock, Pill, Building2, Siren } from 'lucide-react'
import { OasisCard, OasisButton, StarRating, EmptyState, DropLoader, ErrorState } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'

const filterChips = ['Más cercanos', 'Mejor precio', '24h', 'Delivery', 'Abierto ahora']

export default function PatientFeed() {
  const { navigate } = useNavigation()
  const { user } = useAuthStore()
  const [activeFilter, setActiveFilter] = useState('Más cercanos')
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Default to Managua, NI for demo if geolocation fails
  const [location, setLocation] = useState({ lat: 12.136, lng: -86.251 })

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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-[10px] border-b border-[#E0E0E0]/50 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg width="24" height="31" viewBox="0 0 36 47" fill="none">
              <path d="M18 0C18 0 0 22.5 0 31.5C0 39.784 8.059 47 18 47C27.941 47 36 39.784 36 31.5C36 22.5 18 0 18 0Z" fill="url(#navDrop)"/>
              <defs><linearGradient id="navDrop" x1="0" y1="0" x2="36" y2="47" gradientUnits="userSpaceOnUse"><stop stopColor="#0E8C5E"/><stop offset="1" stopColor="#0077B6"/></linearGradient></defs>
            </svg>
            <span className="font-nunito font-bold text-[#0E8C5E] text-lg">Oasis</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative">
              <Bell size={20} className="text-[#4A4A4A]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#F4A261]" />
            </button>
            <button onClick={() => navigate('patient-profile')} className="w-8 h-8 rounded-full bg-[#E8F5EE] flex items-center justify-center">
              <User size={16} className="text-[#0E8C5E]" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={() => navigate('patient-search')}
            placeholder="Busca tu medicamento o clínica..."
            className="w-full border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 pl-10 text-sm font-inter rounded-full focus:border-[#0E8C5E] focus:outline-none"
            readOnly
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 pb-1">
          {filterChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`capsule px-3 py-1.5 text-[10px] font-inter font-semibold whitespace-nowrap transition-all ${
                activeFilter === chip
                  ? 'oasis-gradient text-white shadow-sm'
                  : 'bg-[#E8F5EE] text-[#0E8C5E]'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Map expandable */}
      <div className="relative h-40 bg-[#E8F5EE] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={24} className="text-[#0E8C5E] mx-auto mb-1" />
            <span className="font-inter text-xs text-[#0E8C5E]">Mapa interactivo</span>
          </div>
        </div>
        {/* Fake map dots */}
        {[{t:20,l:30},{t:40,l:60},{t:60,l:25},{t:30,l:80}].map((dot, i) => (
          <div key={i} className="absolute w-4 h-4 rounded-full oasis-gradient drop-loader" style={{ top: `${dot.t}%`, left: `${dot.l}%`, animationDelay: `${i * 0.3}s` }} />
        ))}
        <button className="absolute bottom-2 right-4 bg-white rounded-full p-2 shadow-md">
          <MapPin size={16} className="text-[#0E8C5E]" />
        </button>
      </div>

      {/* Feed */}
      <div className="flex-1 px-4 py-4 space-y-3 pb-24">
        <h2 className="font-nunito font-bold text-lg text-[#4A4A4A]">Cerca de ti</h2>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <DropLoader size={48} />
            <p className="mt-4 font-inter text-sm text-[#8A8A8A]">Localizando servicios...</p>
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadFeed} />
        ) : items.length === 0 ? (
          <EmptyState message="No encontramos farmacias o clínicas cerca de tu ubicación actual." icon="search" />
        ) : (
          items.map((item) => (
            <OasisCard key={item.id} className="!p-4" onClick={() => navigate('patient-search')}>
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${
                  item.type === 'farmacia' ? 'bg-[#E8F5EE]' : 'bg-[#E0F2FE]'
                }`}>
                  {item.type === 'farmacia' ? <Pill size={18} className="text-[#0E8C5E]" /> : <Building2 size={18} className="text-[#0077B6]" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-nunito font-bold text-sm text-[#4A4A4A]">{item.name}</div>
                    <div className="flex items-center gap-1 text-xs font-inter text-[#8A8A8A]">
                      <MapPin size={10} /> {item.distance} km
                    </div>
                  </div>
                  <div className="flex items-center gap-2 my-1">
                    <StarRating rating={4} size={10} />
                    <span className="text-[10px] font-inter text-[#8A8A8A]">4.5</span>
                    <span className="capsule bg-[#E8F5EE] text-[#0E8C5E] px-2 py-0.5 text-[8px] font-inter font-semibold">Abierto</span>
                  </div>
                  {item.type === 'farmacia' && item.activeInventoryCount > 0 && (
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      <span className="capsule bg-[#FFF3E0] text-[#F4A261] px-2 py-0.5 text-[8px] font-inter font-semibold">Stock disponible</span>
                      <span className="capsule bg-[#E8F5EE] text-[#0E8C5E] px-2 py-0.5 text-[8px] font-inter font-semibold">Delivery rápido</span>
                    </div>
                  )}
                  {item.type === 'clinica' && item.telemedicineEnabled && (
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      <span className="capsule bg-[#E0F2FE] text-[#0077B6] px-2 py-0.5 text-[8px] font-inter font-semibold">Teleconsulta</span>
                    </div>
                  )}
                </div>
              </div>
            </OasisCard>
          ))
        )}
      </div>

      {/* Emergency FAB */}
      <button
        onClick={() => navigate('patient-emergency')}
        className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full bg-[#F4A261] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }}
      >
        <Siren size={22} />
      </button>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0E0E0] h-16 flex items-center justify-around z-40">
        {[
          { icon: Search, label: 'Inicio', view: 'patient-feed' as const },
          { icon: ShoppingBag, label: 'Pedidos', view: 'patient-orders' as const },
          { icon: Heart, label: 'Perfil', view: 'patient-profile' as const },
          { icon: User, label: 'Chat', view: 'patient-chat' as const },
        ].map((item, i) => (
          <button
            key={i}
            onClick={() => navigate(item.view)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${item.view === 'patient-feed' ? 'text-[#0E8C5E]' : 'text-[#8A8A8A]'}`}
          >
            {item.view === 'patient-feed' && <div className="w-1 h-1 rounded-full bg-[#0E8C5E] mb-0.5" />}
            <item.icon size={20} />
            <span className="text-[9px] font-inter font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

