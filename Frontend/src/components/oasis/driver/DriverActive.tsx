
'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { 
  MapPin, Phone, MessageSquare, ChevronLeft, Package, Clock, 
  Camera, PenTool, CheckCircle, AlertTriangle, Loader2, QrCode 
} from 'lucide-react'
import Script from 'next/script'
import { OasisCard, OasisButton, DropLoader, ErrorState } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { api } from '@/lib/api-client'
import { getSocket } from '@/lib/socket-client'
import { oasisToast } from '@/lib/oasis-toast'
import 'leaflet/dist/leaflet.css'

// Dynamic imports for Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false })

export default function DriverActive() {
  const { navigate } = useNavigation()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [route, setRoute] = useState<any>(null)
  const [updating, setUpdating] = useState(false)
  const [step, setStep] = useState(0) // 0=accepted, 1=picked_up, 2=in_transit
  const [modal, setModal] = useState<'none' | 'confirm' | 'failed' | 'scanner'>('none')
  const [photo, setPhoto] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [location, setLocation] = useState<[number, number]>([12.136, -86.251])
  const [L, setL] = useState<any>(null)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSigning, setIsSigning] = useState(false)
  const scannerRef = useRef<any>(null)

  // Start QR Scanner
  const startScanner = () => {
    setModal('scanner')
    setIsScanning(true)
    setTimeout(() => {
      const { Html5QrcodeScanner } = (window as any)
      if (Html5QrcodeScanner) {
        scannerRef.current = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 })
        scannerRef.current.render((decodedText: string) => {
          setQrCode(decodedText)
          stopScanner()
          oasisToast.success('Código Validado', 'Receta confirmada correctamente.')
        }, (error: any) => {
          // Ignore scanning errors
        })
      }
    }, 500)
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {})
    }
    setIsScanning(false)
    setModal('confirm')
  }

  useEffect(() => {
    // Leaflet setup
    import('leaflet').then(leaflet => {
      setL(leaflet)
    })

    loadActiveOrder()

    // Watch location
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newLoc: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setLocation(newLoc)
        // Emit via socket if in transit
        if (order?.status === 'in_transit') {
          const socket = getSocket()
          socket.emit('delivery:locationUpdate', {
            orderId: order.id,
            latitude: newLoc[0],
            longitude: newLoc[1]
          })
        }
      },
      () => {},
      { enableHighAccuracy: true }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [order?.status, order?.id])

  async function loadActiveOrder() {
    setLoading(true)
    try {
      const res = await api.get('/delivery/my-deliveries')
      if (res.success) {
        const active = (res.data as any[]).find(d => ['assigned', 'accepted', 'picked_up', 'in_transit'].includes(d.status))
        if (!active) {
          navigate('driver-main')
          return
        }
        setOrder(active)
        
        // Map status to step
        if (active.status === 'assigned' || active.status === 'accepted') setStep(0)
        else if (active.status === 'picked_up') setStep(1)
        else if (active.status === 'in_transit') setStep(2)

        // Load route
        const routeRes = await api.get(`/delivery/route/${active.id}`)
        if (routeRes.success) setRoute(routeRes.data)
      }
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status: string) => {
    setUpdating(true)
    try {
      const res = await api.put(`/delivery/order/${order.id}/status`, { status })
      if (res.success) {
        setOrder({ ...order, status })
        if (status === 'picked_up') setStep(1)
        else if (status === 'in_transit') setStep(2)
        else if (status === 'delivered') {
          navigate('driver-main')
        }
      }
    } catch (err) {
    } finally {
      setUpdating(false)
    }
  }

  const handleCapturePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const startDrawing = (e: any) => {
    setIsSigning(true)
    draw(e)
  }

  const draw = (e: any) => {
    if (!isSigning || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches[0].clientX) - rect.left
    const y = (e.clientY || e.touches[0].clientY) - rect.top
    
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#0E8C5E'
    
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const clearSignature = () => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    ctx?.beginPath()
  }

  const confirmDelivery = async () => {
    // Check if QR validation is needed (if order has prescription)
    if (order?.prescriptionId && !qrCode) {
      oasisToast.error('Validación requerida', 'Debes escanear el código QR de la receta del paciente.')
      return
    }

    if (!photo || !canvasRef.current) {
      oasisToast.error('Faltan datos', 'Debes capturar la foto y la firma del cliente.')
      return
    }

    setUpdating(true)
    try {
      // 1. Convert signature to Base64
      const signatureBase64 = canvasRef.current.toDataURL('image/png')

      // 2. Upload proof (Photo and Signature)
      // Note: We use JSON for Base64 strings for now, as the backend is set for it
      const proofRes = await api.post(`/delivery/order/${order.id}/proof`, {
        proofPhotoUrl: photo, // This is already a Base64 string from handleCapturePhoto
        signatureUrl: signatureBase64
      })

      if (!proofRes.success) {
        throw new Error(proofRes.error || 'Error al subir comprobante')
      }

      // 3. Mark as delivered
      await updateStatus('delivered')
      setModal('none')
      oasisToast.success('¡Entregado!', 'La entrega se ha registrado exitosamente.')
    } catch (err: any) {
      oasisToast.error('Fallo en entrega', err.message || 'No se pudo confirmar la entrega.')
    } finally {
      setUpdating(false)
    }
  }

  // Icons for Map
  const icons = useMemo(() => {
    if (!L) return {}
    return {
      pharmacy: L.divIcon({
        html: '<div class="w-8 h-8 bg-[#0E8C5E] rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="M9 22V12h6v10"/><path d="M2 9h20"/><path d="M19 9V4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v5"/></svg></div>',
        className: '', iconSize: [32, 32], iconAnchor: [16, 16]
      }),
      patient: L.divIcon({
        html: '<div class="w-8 h-8 bg-[#0077B6] rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>',
        className: '', iconSize: [32, 32], iconAnchor: [16, 16]
      }),
      driver: L.divIcon({
        html: '<div class="w-10 h-10 bg-[#4A4A4A] rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 18H5a3 3 0 0 1-3-3v-1"/><path d="M14 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M20 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M5 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M19 21h-2"/><path d="M7 21h7"/><path d="M14 19h10"/><path d="M15 19v-4a3 3 0 0 1 3-3h3"/><path d="M5 19V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v10"/></svg></div>',
        className: '', iconSize: [40, 40], iconAnchor: [20, 20]
      })
    }
  }, [L])

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><DropLoader size={60} /></div>

  return (
    <div className="h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex items-center gap-4">
        <button onClick={() => navigate('driver-main')} className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-[#4A4A4A]">
           <ChevronLeft size={24} />
        </button>
        <div className="flex-1 bg-white/90 backdrop-blur-md h-12 rounded-2xl shadow-xl border border-white px-4 flex items-center justify-between">
           <span className="font-nunito font-bold text-[#4A4A4A]">Pedido #{order?.id?.slice(-4).toUpperCase()}</span>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#0E8C5E] animate-pulse" />
              <span className="text-[10px] font-bold text-[#0E8C5E] uppercase tracking-wider">En vivo</span>
           </div>
        </div>
      </div>

      {/* Map with Route */}
      <div className="flex-1 z-0">
        {typeof window !== 'undefined' && (
          <MapContainer 
            center={location} 
            zoom={15} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* Pharmacy Marker */}
            {route?.pickup && (
              <Marker position={[route.pickup.latitude, route.pickup.longitude]} icon={icons.pharmacy}>
                <Popup>{route.pickup.name}</Popup>
              </Marker>
            )}

            {/* Destination Marker */}
            {route?.dropoff && (
              <Marker position={[route.dropoff.latitude, route.dropoff.longitude]} icon={icons.patient}>
                <Popup>Entrega</Popup>
              </Marker>
            )}

            {/* Driver Marker */}
            <Marker position={location} icon={icons.driver}>
              <Popup>Tu posición</Popup>
            </Marker>

            {/* OSRM Route Line */}
            {route?.geometry && (
              <>
                <Polyline 
                  positions={route.geometry.coordinates.map((c: any) => [c[1], c[0]])}
                  color="white"
                  weight={10}
                  opacity={0.4}
                  lineCap="round"
                />
                <Polyline 
                  positions={route.geometry.coordinates.map((c: any) => [c[1], c[0]])}
                  color="#0077B6"
                  weight={6}
                  opacity={1}
                  lineCap="round"
                />
              </>
            )}
          </MapContainer>
        )}
      </div>

      {/* Action Panel */}
      <div className="bg-white rounded-t-[32px] p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] relative z-10 border-t border-[#F0F0F0]">
         <div className="w-12 h-1.5 bg-[#E0E0E0] rounded-full mx-auto mb-6" />
         
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-[#E8F5EE] flex items-center justify-center text-[#0E8C5E]">
                  <Package size={24} />
               </div>
               <div>
                  <p className="font-nunito font-bold text-[#4A4A4A]">{order?.patient?.user?.name || 'Cliente'}</p>
                  <p className="font-inter text-xs text-[#8A8A8A] flex items-center gap-1">
                     <Clock size={12} /> Llegada en {route?.estimatedMinutes || '--'} min
                  </p>
               </div>
            </div>
            <div className="flex gap-2">
               <a href={`tel:${order?.patient?.user?.phone}`} className="w-12 h-12 rounded-full bg-[#FAFAFA] border border-[#F0F0F0] flex items-center justify-center text-[#0077B6] hover:bg-[#E0F2FE] transition-colors">
                  <Phone size={20} />
               </a>
               <button 
                 onClick={() => navigate('driver-chat')}
                 className="w-12 h-12 rounded-full bg-[#FAFAFA] border border-[#F0F0F0] flex items-center justify-center text-[#0E8C5E] hover:bg-[#E8F5EE] transition-colors"
               >
                  <MessageSquare size={20} />
               </button>
            </div>
         </div>

         <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-[#F0F0F0] mb-6">
            <div className="flex items-center gap-2 mb-1">
               <MapPin size={14} className="text-[#0077B6]" />
               <span className="font-inter font-bold text-xs text-[#4A4A4A]">Dirección de entrega</span>
            </div>
            <p className="font-inter text-sm text-[#8A8A8A] pl-5">{order?.deliveryAddress}</p>
         </div>

         <div className="space-y-3">
            {step === 0 && (
               <OasisButton 
                 className="w-full !h-14 font-nunito font-bold text-base" 
                 onClick={() => updateStatus('picked_up')}
                 disabled={updating}
               >
                  {updating ? <Loader2 className="animate-spin" /> : 'RECOGÍ EL PEDIDO'}
               </OasisButton>
            )}
            {step === 1 && (
               <OasisButton 
                 className="w-full !h-14 font-nunito font-bold text-base bg-[#0077B6]" 
                 onClick={() => updateStatus('in_transit')}
                 disabled={updating}
               >
                  {updating ? <Loader2 className="animate-spin" /> : 'INICIAR RUTA'}
               </OasisButton>
            )}
            {step === 2 && (
               <div className="flex gap-3">
                  <OasisButton 
                    variant="ghost" 
                    className="flex-1 !h-14 text-[#F4A261] border-[#F4A261]/20"
                    onClick={() => setModal('failed')}
                  >
                     FALLÓ
                  </OasisButton>
                  <OasisButton 
                    className="flex-[2] !h-14 font-nunito font-bold text-base" 
                    onClick={() => setModal('confirm')}
                  >
                     ENTREGAR
                  </OasisButton>
               </div>
            )}
         </div>
      </div>

      {/* Confirmation Modal */}
      {modal === 'confirm' && (
         <div className="fixed inset-0 z-[2000] flex items-end justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal('none')} />
            <div className="relative w-full max-w-lg bg-white rounded-t-[40px] p-8 space-y-6 animate-slide-up">
               <div className="w-12 h-1.5 bg-[#E0E0E0] rounded-full mx-auto mb-2" />
               <h3 className="font-nunito font-bold text-2xl text-[#4A4A4A] text-center">Confirmar Entrega</h3>
               
               <div className="space-y-4">
                  {/* QR Prescription Validation (Required if order has prescription) */}
                  <div className="space-y-2">
                     <span className="font-inter font-bold text-sm text-[#4A4A4A]">Validación de Receta</span>
                     <button 
                       onClick={startScanner}
                       className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                         qrCode ? 'border-[#0E8C5E] bg-[#E8F5EE]/50 text-[#0E8C5E]' : 'border-dashed border-[#0077B6] bg-[#E0F2FE]/30 text-[#0077B6]'
                       }`}
                     >
                        <div className="flex items-center gap-3">
                           <QrCode size={24} />
                           <span className="font-nunito font-bold">{qrCode ? 'RECETA VALIDADA' : 'ESCANEAR CÓDIGO QR'}</span>
                        </div>
                        {qrCode && <CheckCircle size={20} />}
                     </button>
                     {qrCode && (
                       <p className="text-[10px] font-bold text-[#0E8C5E] px-1 truncate">CODE: {qrCode}</p>
                     )}
                  </div>

                  {/* Photo Capture */}
                  <div className="relative">
                     <input 
                       type="file" 
                       id="photo-input" 
                       accept="image/*" 
                       capture="environment" 
                       className="hidden" 
                       onChange={handleCapturePhoto}
                     />
                     <label 
                       htmlFor="photo-input"
                       className={`w-full h-40 rounded-[28px] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                         photo ? 'border-[#0E8C5E] bg-[#E8F5EE]/30' : 'border-[#E0E0E0] bg-[#FAFAFA]'
                       }`}
                     >
                        {photo ? (
                           <img src={photo} alt="Evidencia" className="w-full h-full object-cover rounded-[26px]" />
                        ) : (
                           <>
                              <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-[#0E8C5E]">
                                 <Camera size={28} />
                              </div>
                              <span className="font-inter font-bold text-sm text-[#4A4A4A]">Foto del paquete en destino</span>
                           </>
                        )}
                     </label>
                  </div>

                  {/* Signature Canvas */}
                  <div className="space-y-2">
                     <div className="flex justify-between items-center px-1">
                        <span className="font-inter font-bold text-sm text-[#4A4A4A]">Firma del cliente</span>
                        <button onClick={clearSignature} className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">Borrar</button>
                     </div>
                     <div className="h-40 rounded-[28px] bg-[#FAFAFA] border-2 border-[#E0E0E0] overflow-hidden">
                        <canvas 
                          ref={canvasRef}
                          width={400}
                          height={160}
                          className="w-full h-full touch-none"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={() => setIsSigning(false)}
                          onMouseLeave={() => setIsSigning(false)}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={() => setIsSigning(false)}
                        />
                     </div>
                  </div>
               </div>

               <div className="flex gap-4 pt-2">
                  <OasisButton variant="ghost" className="flex-1" onClick={() => setModal('none')}>CANCELAR</OasisButton>
                  <OasisButton 
                    className="flex-1" 
                    disabled={!photo || updating}
                    onClick={confirmDelivery}
                  >
                     {updating ? <Loader2 className="animate-spin" /> : 'CONFIRMAR'}
                  </OasisButton>
               </div>
            </div>
         </div>
      )}

      {/* Failed Modal */}
      {modal === 'failed' && (
         <div className="fixed inset-0 z-[2000] flex items-end justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal('none')} />
            <div className="relative w-full max-w-lg bg-white rounded-t-[40px] p-8 space-y-6 animate-slide-up">
               <h3 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Reportar Problema</h3>
               <div className="grid gap-3">
                  {['Cliente ausente', 'Dirección incorrecta', 'Paquete dañado', 'Otro'].map(reason => (
                     <button key={reason} className="w-full p-4 rounded-2xl bg-[#FAFAFA] border border-[#F0F0F0] text-left font-inter font-bold text-[#4A4A4A] hover:border-[#F4A261] transition-colors">
                        {reason}
                     </button>
                  ))}
               </div>
               <div className="flex gap-4">
                  <OasisButton variant="ghost" className="flex-1" onClick={() => setModal('none')}>VOLVER</OasisButton>
                  <OasisButton className="flex-1 bg-[#F4A261]" onClick={() => navigate('driver-main')}>ENVIAR REPORTE</OasisButton>
               </div>
            </div>
         </div>
      )}

      {/* QR Scanner Modal */}
      {modal === 'scanner' && (
         <div className="fixed inset-0 z-[3000] bg-black flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm aspect-square bg-white/10 rounded-3xl overflow-hidden relative">
               <div id="reader" className="w-full h-full"></div>
               <div className="absolute inset-0 border-2 border-[#0E8C5E] animate-pulse pointer-events-none rounded-3xl" />
            </div>
            <div className="mt-8 text-center space-y-4">
               <h3 className="font-nunito font-bold text-xl text-white">Escaneando Receta...</h3>
               <p className="font-inter text-sm text-white/60">Encuadra el código QR del paciente dentro del cuadro</p>
               <OasisButton variant="ghost" className="!text-white border-white/20" onClick={() => setModal('confirm')}>
                  CANCELAR
               </OasisButton>
            </div>
         </div>
      )}

      <Script 
        src="https://unpkg.com/html5-qrcode" 
        strategy="lazyOnload"
        onLoad={() => console.log('QR Scanner Loaded')}
      />
    </div>
  )
}
