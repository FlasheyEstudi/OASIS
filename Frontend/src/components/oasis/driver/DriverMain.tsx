
'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, User, Loader2, TrendingUp, ShoppingBag, Package, Map as MapIcon, Siren } from 'lucide-react'
import { OasisCard, OasisButton, DropLoader, EmptyState, ErrorState, WaveSkeleton } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { oasisToast } from '@/lib/oasis-toast'
import 'leaflet/dist/leaflet.css'

// Dynamic imports for Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

export default function DriverMain() {
  const { navigate } = useNavigation()
  const { user } = useAuthStore()
  const [available, setAvailable] = useState(false)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [activeOrder, setActiveOrder] = useState<any>(null)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<[number, number]>([12.136, -86.251])
  const [L, setL] = useState<any>(null)

  useEffect(() => {
    // Leaflet setup
    import('leaflet').then(leaflet => {
      setL(leaflet)
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
        (pos) => setLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => {
          console.warn('[GPS] Using default location:', err.message)
          oasisToast.info('GPS Desactivado', 'Usando ubicación predeterminada.')
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      oasisToast.error('GPS no soportado', 'Tu navegador no permite geolocalización.')
    }

    loadInitialData()
  }, [])

  async function loadInitialData() {
    setLoading(true)
    setError(null)
    try {
      // 1. Get availability
      const availabilityRes = await api.get('/delivery/availability')
      if (availabilityRes.success) setAvailable(availabilityRes.data.isAvailable)

      // 2. Check for active delivery (assigned, accepted, picked_up, in_transit)
      const deliveriesRes = await api.get('/delivery/my-deliveries')
      if (deliveriesRes.success) {
        const active = (deliveriesRes.data as any[]).find(d => ['assigned', 'accepted', 'picked_up', 'in_transit'].includes(d.status))
        if (active) {
           navigate('driver-active') // If active, move to active screen
           return
        }
      }

      // 3. Load available orders
      await loadAvailableOrders()
    } catch (err) {
      setError('Error al cargar datos del repartidor.')
    } finally {
      setLoading(false)
    }
  }

  async function loadAvailableOrders() {
    try {
      const res = await api.get('/delivery/available-orders', { 
        lat: location[0], 
        lng: location[1], 
        radius: 15 
      })
      if (res.success && res.data) {
        setOrders(res.data)
      }
    } catch (err) {}
  }

  const toggleAvailability = async () => {
    setUpdating(true)
    try {
      const newStatus = !available
      const res = await api.put('/delivery/availability', { isAvailable: newStatus })
      if (res.success) {
        setAvailable(newStatus)
        if (newStatus) {
          oasisToast.success('Estás Online', 'Buscando pedidos cercanos...')
          loadAvailableOrders()
        } else {
          oasisToast.info('Desconectado', 'Has dejado de recibir pedidos.')
          setOrders([])
        }
      }
    } catch (err) {
      oasisToast.error('Error de Conexión', 'No se pudo cambiar el estado.')
    } finally {
      setUpdating(false)
    }
  }

  const handleAccept = async (orderId: string) => {
    setUpdating(true)
    try {
      const res = await api.post(`/delivery/accept-order/${orderId}`)
      if (res.success) {
        oasisToast.success('Pedido Aceptado', 'Dirígete a la farmacia indicada.')
        navigate('driver-active')
      }
    } catch (err) {
      oasisToast.error('Error al aceptar', 'El pedido ya no está disponible o hubo un fallo.')
    } finally {
      setUpdating(false)
    }
  }

  const orderIcon = useMemo(() => L ? L.divIcon({
    html: '<div class="w-8 h-8 bg-[#0077B6] rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg></div>',
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  }) : null, [L])

  return (
    <div className="min-h-screen bg-white flex flex-col pb-16 overflow-hidden">
      {/* Real Map Header */}
      <div className="relative h-[45vh] z-0">
        {typeof window !== 'undefined' && (
          <MapContainer center={location} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* Self Marker */}
            <Marker position={location}>
              <Popup>Estás aquí</Popup>
            </Marker>

            {/* Available Orders Markers */}
            {available && orders.map(order => (
               <Marker 
                 key={order.id} 
                 position={[order.pharmacy.latitude, order.pharmacy.longitude]} 
                 icon={orderIcon}
               >
                 <Popup>
                    <div className="p-1 font-inter">
                       <p className="font-bold text-sm m-0">Pedido #{order.id.slice(-4).toUpperCase()}</p>
                       <p className="text-xs m-0 text-[#8A8A8A]">{order.pharmacy.name}</p>
                       <p className="text-xs font-bold text-[#0E8C5E] mt-1">Ganas C$80.00</p>
                    </div>
                 </Popup>
               </Marker>
            ))}
          </MapContainer>
        )}

        {/* Overlay Controls */}
        <div className="absolute top-8 left-6 right-6 flex items-center justify-between z-[1000]">
           <div 
             onClick={() => navigate('driver-profile')}
             className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white cursor-pointer active:scale-95 transition-all"
           >
              <div className="w-10 h-10 rounded-full oasis-gradient p-0.5 shadow-sm">
                 <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    <User size={20} className="text-[#0E8C5E]" />
                 </div>
              </div>
              <div>
                 <p className="text-[10px] text-[#8A8A8A] font-inter">{user?.name || 'Repartidor'}</p>
                 <p className="text-xs font-nunito font-bold text-[#4A4A4A]">ID: #{user?.id?.slice(-4).toUpperCase() || '7742'}</p>
              </div>
           </div>
           
           <div className="flex flex-col gap-2">
              <button 
                onClick={() => setLocation([location[0], location[1]])} // Forces re-center
                className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-[#0E8C5E] active:scale-95 transition-all"
              >
                 <MapIcon size={24} />
              </button>
              <button 
                onClick={() => oasisToast.info('S.O.S Enviado', 'El equipo de seguridad ha sido notificado.')}
                className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-[#F4A261] active:scale-95 transition-all"
              >
                 <Siren size={24} />
              </button>
           </div>
        </div>

        {/* Availability Toggle */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000]">
           <button
             onClick={toggleAvailability}
             disabled={updating}
             className={`group relative flex items-center gap-3 px-8 py-4 rounded-[22px] font-nunito font-bold text-sm shadow-2xl transition-all duration-500 ${
               available 
                 ? 'bg-[#0E8C5E] text-white' 
                 : 'bg-white text-[#4A4A4A] border border-[#F0F0F0]'
             }`}
           >
              {available && <div className="absolute inset-0 bg-white/20 rounded-[22px] animate-pulse" />}
              {updating ? <Loader2 size={18} className="animate-spin" /> : (
                <div className={`w-3 h-3 rounded-full ${available ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-[#E0E0E0]'}`} />
              )}
              {available ? 'CONECTADO Y DISPONIBLE' : 'MODO OFFLINE'}
           </button>
        </div>
      </div>

      {/* Orders Panel (Sliding Sheet style) */}
      <div className="flex-1 bg-white rounded-t-[32px] -mt-8 relative z-10 p-6 pt-8 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] border-t border-[#F0F0F0]">
         <div className="w-12 h-1.5 bg-[#E0E0E0] rounded-full mx-auto mb-6" />
         
         <div className="flex items-center justify-between mb-6">
            <h2 className="font-nunito font-bold text-xl text-[#4A4A4A]">Pedidos en tu zona</h2>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#E8F5EE] text-[#0E8C5E] rounded-full text-xs font-bold">
               <TrendingUp size={14} /> C$245.00 hoy
            </div>
         </div>

         {loading ? (
            <div className="space-y-4">
               {[1, 2].map(i => (
                 <div key={i} className="h-32 rounded-[24px] bg-[#FAFAFA] border border-[#F0F0F0] p-4 flex gap-4">
                    <WaveSkeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                       <WaveSkeleton className="w-1/3 h-4" />
                       <WaveSkeleton className="w-2/3 h-3" />
                       <WaveSkeleton className="w-full h-8 rounded-lg mt-2" />
                    </div>
                 </div>
               ))}
            </div>
         ) : !available ? (
            <div className="py-12 flex flex-col items-center text-center px-8 space-y-4">
               <div className="w-20 h-20 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#E0E0E0]">
                  <ShoppingBag size={40} />
               </div>
               <div>
                  <p className="font-nunito font-bold text-lg text-[#4A4A4A]">Estás fuera de servicio</p>
                  <p className="font-inter text-sm text-[#8A8A8A]">Activa tu disponibilidad para empezar a recibir pedidos en tiempo real.</p>
               </div>
            </div>
         ) : orders.length === 0 ? (
            <EmptyState message="No hay pedidos disponibles por ahora. Quédate cerca de zonas comerciales." />
         ) : (
            <div className="space-y-4">
               {orders.map(order => (
                  <OasisCard key={order.id} className="p-0 overflow-hidden border border-[#F0F0F0]">
                     <div className="p-4 flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#E8F5EE] text-[#0E8C5E] flex items-center justify-center flex-shrink-0">
                           <Package size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-start">
                              <div>
                                 <p className="font-nunito font-bold text-[#4A4A4A] truncate">{order.pharmacy.name}</p>
                                 <p className="font-inter text-xs text-[#8A8A8A]">{order.distance?.toFixed(1)} km de distancia</p>
                              </div>
                              <div className="text-right">
                                 <p className="font-nunito font-bold text-[#0E8C5E]">C$80.00</p>
                                 <p className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider">Pago Cash</p>
                              </div>
                           </div>
                           <div className="mt-3 flex items-center gap-2 text-xs text-[#4A4A4A] font-inter">
                              <MapPin size={12} className="text-[#0077B6]" />
                              <span className="truncate">{order.deliveryAddress}</span>
                           </div>
                        </div>
                     </div>
                     <div className="bg-[#FAFAFA] p-3 flex gap-3">
                        <OasisButton variant="ghost" className="flex-1 !h-10 text-xs">Detalles</OasisButton>
                        <OasisButton 
                          className="flex-1 !h-10 text-xs" 
                          onClick={() => handleAccept(order.id)}
                          disabled={updating}
                        >
                           {updating ? <Loader2 size={16} className="animate-spin" /> : 'Aceptar Pedido'}
                        </OasisButton>
                     </div>
                  </OasisCard>
               ))}
            </div>
         )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[#F0F0F0] h-16 flex items-center justify-around z-40">
        {[
          { icon: MapPin, label: 'Inicio', view: 'driver-main' as const },
          { icon: TrendingUp, label: 'Ganancias', view: 'driver-earnings' as const },
          { icon: User, label: 'Perfil', view: 'driver-profile' as const },
        ].map((item, i) => {
          const isActive = item.view === 'driver-main'
          return (
            <button key={i} onClick={() => navigate(item.view)} className={`flex flex-col items-center gap-0.5 px-6 transition-all ${isActive ? 'text-[#0E8C5E]' : 'text-[#B0B0B0]'}`}>
              <item.icon size={22} className={isActive ? 'animate-bounce-subtle' : ''} />
              <span className="text-[9px] font-bold font-nunito uppercase tracking-tighter">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
