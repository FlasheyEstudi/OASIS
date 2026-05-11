'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { getSocket } from '@/lib/socket-client'
import 'leaflet/dist/leaflet.css'

// Dynamic imports for Leaflet (no SSR)
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer   = dynamic(() => import('react-leaflet').then(m => m.TileLayer),     { ssr: false })
const Marker      = dynamic(() => import('react-leaflet').then(m => m.Marker),        { ssr: false })
const Popup       = dynamic(() => import('react-leaflet').then(m => m.Popup),         { ssr: false })
const Polyline    = dynamic(() => import('react-leaflet').then(m => m.Polyline),      { ssr: false })

// Inner component that uses the Leaflet map reference (must be inside MapContainer)
function FitBoundsController({ positions, L }: { positions: [number, number][], L: any }) {
  const { useMap } = require('react-leaflet')
  const map = useMap()

  useEffect(() => {
    if (L && map && positions.length >= 2) {
      // Convert GeoJSON [lng, lat] → Leaflet [lat, lng]
      const latLngs = positions.map(([lng, lat]) => [lat, lng] as [number, number])
      const bounds = L.latLngBounds(latLngs)
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 16 })
    }
  }, [positions, map, L])

  return null
}

const FitBoundsControllerDynamic = dynamic(
  () => Promise.resolve(FitBoundsController),
  { ssr: false }
)

export default function OrderTrackingMap({
  orderId,
  initialLocation,
}: {
  orderId: string
  initialLocation: [number, number]
}) {
  const [driverLocation, setDriverLocation] = useState<[number, number]>(initialLocation)
  const [route, setRoute] = useState<any>(null)
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street')
  const [L, setL] = useState<any>(null)

  useEffect(() => {
    import('leaflet').then(leaflet => {
      setL(leaflet)
    })

    const socket = getSocket()
    socket.emit('join-order', orderId)

    socket.on('delivery:trackingUpdate', (data: any) => {
      setDriverLocation([data.latitude, data.longitude])
    })

    // Fetch GraphHopper route from backend
    const fetchRoute = async () => {
      try {
        const { api } = await import('@/lib/api-client')
        const res = await api.get(`/delivery/route/${orderId}`)
        if (res.success) {
          setRoute(res.data)
          if (res.data.driverLocation) {
            setDriverLocation([res.data.driverLocation.latitude, res.data.driverLocation.longitude])
          }
        }
      } catch (e) {
        console.warn('[OrderTrackingMap] Route fetch failed:', e)
      }
    }
    fetchRoute()

    return () => {
      socket.off('delivery:trackingUpdate')
    }
  }, [orderId])

  // Custom Leaflet icons with premium animations
  const icons = useMemo(() => {
    if (!L) return {} as Record<string, any>
    const make = (color: string, svg: string, size: [number, number], pulse = false) =>
      L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            ${pulse ? `<div class="absolute inset-0 rounded-full animate-ping" style="background:${color}; opacity:0.4;"></div>` : ''}
            <div style="width:${size[0]}px;height:${size[0]}px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;color:white;position:relative;z-index:10;">
              ${svg}
            </div>
          </div>`,
        className: '',
        iconSize: size,
        iconAnchor: [size[0] / 2, size[0] / 2],
      })

    return {
      pharmacy: make(
        '#0E8C5E',
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>',
        [36, 36]
      ),
      patient: make(
        '#0077B6',
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        [36, 36]
      ),
      driver: make(
        '#4A4A4A',
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 18H5a3 3 0 0 1-3-3v-1"/><path d="M14 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M20 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M5 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M5 19V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v10"/></svg>',
        [44, 44],
        true // Pulsating effect for driver
      ),
    }
  }, [L])

  // GeoJSON coords come as [lng, lat] — Leaflet needs [lat, lng]
  const routeLatLngs: [number, number][] = useMemo(() => {
    if (!route?.geometry?.coordinates) return []
    return route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])
  }, [route])

  const center: [number, number] = [
    route?.pickup?.latitude ?? initialLocation[0],
    route?.pickup?.longitude ?? initialLocation[1],
  ]

  return (
    <div className="h-full w-full relative group">
      {/* Premium UI Overlay: Map Toggle */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button 
          onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
          className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-[#4A4A4A] hover:bg-[#E8F5EE] hover:text-[#0E8C5E] transition-all active:scale-90"
          title="Cambiar vista"
        >
          {mapType === 'street' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          )}
        </button>
      </div>

      {/* Premium UI Overlay: Delivery Status Card */}
      <div className="absolute bottom-6 left-6 right-6 z-[1000] md:max-w-xs transition-transform duration-500 group-hover:-translate-y-2">
         <div className="bg-white/90 backdrop-blur-xl rounded-[32px] p-4 shadow-2xl border border-white/50 space-y-3">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-[#0E8C5E] animate-pulse">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M2 12h20"/><path d="m5 7-3 5 3 5"/><path d="m19 7 3 5-3 5"/></svg>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-[#8A8A8A] uppercase">Tiempo Estimado</p>
                     <p className="font-nunito font-bold text-[#4A4A4A]">{route?.estimatedMinutes ? `${route.estimatedMinutes} minutos` : 'Calculando...'}</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-bold text-[#8A8A8A] uppercase">Distancia</p>
                  <p className="font-nunito font-bold text-[#0E8C5E]">{route?.distanceKm ? `${route.distanceKm} km` : '--'}</p>
               </div>
            </div>
         </div>
      </div>

      {typeof window !== 'undefined' && (
        <MapContainer
          center={center}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          className="z-0"
        >
          {mapType === 'street' ? (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          ) : (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            />
          )}

          {/* Auto-fit map to route bounds */}
          {routeLatLngs.length >= 2 && L && (
            <FitBoundsControllerDynamic positions={route.geometry.coordinates} L={L} />
          )}

          {/* Route line — Azul Conecta #0077B6 with white halo */}
          {routeLatLngs.length >= 2 && (
            <>
              {/* White halo for contrast on satellite/dark backgrounds */}
              <Polyline positions={routeLatLngs} color="white" weight={9} opacity={0.4} />
              {/* Main route line */}
              <Polyline positions={routeLatLngs} color="#0077B6" weight={5} opacity={0.8} />
            </>
          )}

          {/* Pharmacy marker (pickup) */}
          {route?.pickup && icons.pharmacy && (
            <Marker
              position={[route.pickup.latitude, route.pickup.longitude]}
              icon={icons.pharmacy}
            >
              <Popup>
                <div className="font-nunito p-1">
                  <strong className="text-[#0E8C5E] block mb-1">{route.pickup.name || 'Farmacia'}</strong>
                  <span className="text-[10px] text-[#8A8A8A]">{route.pickup.address}</span>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Patient marker (dropoff) */}
          {route?.dropoff && icons.patient && (
            <Marker
              position={[route.dropoff.latitude, route.dropoff.longitude]}
              icon={icons.patient}
            >
              <Popup>
                <div className="font-nunito p-1 text-center">
                  <strong className="text-[#0077B6]">Tu Entrega</strong>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Driver real-time marker */}
          {icons.driver && (
            <Marker position={driverLocation} icon={icons.driver}>
              <Popup>
                <div className="font-nunito p-1">
                  <strong className="text-[#4A4A4A] block mb-1">Repartidor Oasis</strong>
                  <div className="flex items-center gap-1 text-[10px] text-[#0E8C5E] font-bold uppercase">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0E8C5E] animate-pulse" />
                    En camino
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      )}
    </div>
  )
}
