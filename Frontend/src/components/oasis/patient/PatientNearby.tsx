
'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { api } from '@/lib/api-client'
import { OasisCard, DropLoader, EmptyState } from '@/components/oasis/shared/shared-components'
import { useNavigation } from '../navigation-store'
import { MapPin, Pill, Building2, Star, Wifi, Navigation, ArrowLeft } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Dynamic import for Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

export default function PatientNearby() {
  const { navigate } = useNavigation()
  const [tab, setTab] = useState<'pharmacies' | 'clinics'>('pharmacies')
  const [pharmacies, setPharmacies] = useState<any[]>([])
  const [clinics, setClinics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<[number, number]>([12.136, -86.251])
  const [L, setL] = useState<any>(null)

  useEffect(() => {
    // Import Leaflet on client side to fix icon issue
    import('leaflet').then(leaflet => {
      setL(leaflet)
      // Fix default icon issue in react-leaflet
      const DefaultIcon = leaflet.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      })
      leaflet.Marker.prototype.options.icon = DefaultIcon
    })

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => {
          console.warn('[GPS] Error:', err.message)
          // Fallback to Managua if GPS fails
          setUserLocation([12.136, -86.251])
        }
      )
    } else {
      // Manual fallback if not supported
      setUserLocation([12.136, -86.251])
    }
  }, [])

  useEffect(() => { loadData() }, [tab, userLocation])

  async function loadData() {
    setLoading(true)
    const [lat, lng] = userLocation
    if (tab === 'pharmacies') {
      const res = await api.get('/patient/nearby-pharmacies', { lat, lng, radius: 20 })
      if (res.success && res.data.pharmacies) setPharmacies(res.data.pharmacies)
    } else {
      const res = await api.get('/patient/nearby-clinics', { lat, lng, radius: 20 })
      if (res.success && res.data.clinics) setClinics(res.data.clinics)
    }
    setLoading(false)
  }

  const data = tab === 'pharmacies' ? pharmacies : clinics

  // Custom icons
  const pharmacyIcon = useMemo(() => L ? L.divIcon({
    html: '<div class="w-10 h-10 bg-[#0E8C5E] rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg></div>',
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  }) : null, [L])

  const clinicIcon = useMemo(() => L ? L.divIcon({
    html: '<div class="w-10 h-10 bg-[#0077B6] rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="M9 22V12h6v10"/><path d="M2 9h20"/><path d="M19 9V4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v5"/></svg></div>',
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  }) : null, [L])

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="p-6 pb-2 space-y-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('patient-feed')} 
            className="w-10 h-10 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#4A4A4A] active:scale-95 transition-all shadow-sm border border-[#F0F0F0]"
          >
             <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Servicios Cerca</h1>
            <p className="font-inter text-sm text-[#8A8A8A]">Explora farmacias y clínicas interactivamente</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setTab('pharmacies')} 
            className={`px-6 py-2.5 rounded-full font-inter font-bold text-sm transition-all shadow-sm ${
              tab === 'pharmacies' ? 'bg-[#0E8C5E] text-white' : 'bg-[#FAFAFA] border border-[#F0F0F0] text-[#8A8A8A]'
            }`}
          >
            <Pill size={16} className="inline mr-2" />Farmacias
          </button>
          <button 
            onClick={() => setTab('clinics')} 
            className={`px-6 py-2.5 rounded-full font-inter font-bold text-sm transition-all shadow-sm ${
              tab === 'clinics' ? 'bg-[#0077B6] text-white' : 'bg-[#FAFAFA] border border-[#F0F0F0] text-[#8A8A8A]'
            }`}
          >
            <Building2 size={16} className="inline mr-2" />Clínicas
          </button>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="flex-1 relative m-6 mt-2 rounded-[32px] overflow-hidden border-4 border-white shadow-2xl z-0">
        {typeof window !== 'undefined' && (
          <MapContainer center={userLocation} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User Marker */}
            <Marker position={userLocation}>
              <Popup>Tu ubicación actual</Popup>
            </Marker>

            {/* Service Markers */}
            {data.map((item: any) => (
              item.latitude && item.longitude && (
                <Marker 
                  key={item.id} 
                  position={[item.latitude, item.longitude]} 
                  icon={tab === 'pharmacies' ? pharmacyIcon : clinicIcon}
                >
                  <Popup>
                    <div className="p-1">
                      <p className="font-nunito font-bold text-sm m-0">{item.name}</p>
                      <p className="font-inter text-[10px] text-[#8A8A8A] m-0">{item.distance}km - {item.address}</p>
                      <div className="flex items-center gap-1 mt-1">
                         <Star size={10} className="fill-[#F4A261] text-[#F4A261]" />
                         <span className="text-[10px] font-bold">{item.rating || '4.5'}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        )}
      </div>

      {/* Floating List Toggle */}
      <div className="px-6 pb-6 space-y-3">
        <h3 className="font-nunito font-bold text-lg text-[#4A4A4A] flex items-center gap-2">
           <Navigation size={18} className="text-[#0E8C5E]" /> Listado cercano
        </h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {loading ? <DropLoader size={30} /> : data.map((item: any) => (
            <OasisCard key={item.id} className="min-w-[240px] p-4 flex gap-3 items-center">
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                 tab === 'pharmacies' ? 'bg-[#E8F5EE] text-[#0E8C5E]' : 'bg-[#E0F2FE] text-[#0077B6]'
               }`}>
                  {tab === 'pharmacies' ? <Pill size={20} /> : <Building2 size={20} />}
               </div>
               <div className="min-w-0">
                  <p className="font-nunito font-bold text-sm text-[#4A4A4A] truncate">{item.name}</p>
                  <p className="font-inter text-xs text-[#8A8A8A]">{item.distance}km</p>
               </div>
            </OasisCard>
          ))}
        </div>
      </div>
    </div>
  )
}
