'use client'

import { useState, useEffect } from 'react'
import { MapPin, Phone, Navigation, Camera, PenTool, CheckCircle, Package, TrendingUp, User, Bike, Loader2 } from 'lucide-react'
import { OasisCard, OasisButton, HeartbeatCheck, DropLoader, ErrorState, EmptyState } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'

export default function DriverMain() {
  const { navigate } = useNavigation()
  const { user } = useAuthStore()
  const [available, setAvailable] = useState(false)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [acceptedOrder, setAcceptedOrder] = useState<any>(null)
  const [step, setStep] = useState(0) // 0=none, 1=picked, 2=onway, 3=delivered
  const [confirming, setConfirming] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  async function loadInitialData() {
    setLoading(true)
    setError(null)
    try {
      // 1. Check current availability
      const availabilityRes = await api.get('/delivery/availability')
      if (availabilityRes.success) {
        setAvailable(availabilityRes.data.isAvailable)
      }

      // 2. Check for active delivery
      const activeRes = await api.get('/delivery/order/active')
      if (activeRes.success && activeRes.data) {
        setAcceptedOrder(activeRes.data)
        // Map status to step
        const status = activeRes.data.status
        if (status === 'accepted') setStep(0)
        else if (status === 'picked_up') setStep(1)
        else if (status === 'on_the_way') setStep(2)
      } else {
        // 3. Load available orders if no active one
        loadAvailableOrders()
      }
    } catch (err) {
      setError('Error al conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  async function loadAvailableOrders() {
    if (!available) {
      setOrders([])
      return
    }
    try {
      const res = await api.get('/delivery/available-orders', { 
        lat: 12.136, 
        lng: -86.251, 
        radius: 10 
      })
      if (res.success && res.data) {
        setOrders(res.data)
      }
    } catch (err) {}
  }

  const toggleAvailability = async () => {
    setUpdating(true)
    try {
      const res = await api.post('/delivery/availability', { isAvailable: !available })
      if (res.success) {
        setAvailable(!available)
        if (!available) loadAvailableOrders()
      }
    } catch (err) {
    } finally {
      setUpdating(false)
    }
  }

  const handleAccept = async (orderId: string) => {
    setUpdating(true)
    try {
      const res = await api.post('/delivery/accept-order', { orderId })
      if (res.success) {
        setAcceptedOrder(res.data)
        setStep(0)
      }
    } catch (err) {
      alert('No se pudo aceptar el pedido. Tal vez ya fue tomado.')
    } finally {
      setUpdating(false)
    }
  }

  const updateStatus = async (status: string) => {
    if (!acceptedOrder) return
    setUpdating(true)
    try {
      const res = await api.put(`/delivery/order/${acceptedOrder.id}`, { status })
      if (res.success) {
        setAcceptedOrder({ ...acceptedOrder, status })
        if (status === 'picked_up') setStep(1)
        else if (status === 'on_the_way') setStep(2)
        else if (status === 'delivered') {
          setStep(3)
          setAcceptedOrder(null)
          loadAvailableOrders()
        }
      }
    } catch (err) {
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Map area */}
      <div className="relative h-[45vh] bg-[#E8F5EE] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin size={32} className="text-[#0E8C5E] drop-loader" />
        </div>
        {/* Fake map dots for orders */}
        {orders.map((o, i) => (
          <div key={i} className="absolute w-3 h-3 rounded-full bg-[#0077B6] animate-pulse" style={{ top: `${20 + i*15}%`, left: `${30 + i*20}%` }} />
        ))}
        
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="24" height="31" viewBox="0 0 36 47" fill="none">
              <path d="M18 0C18 0 0 22.5 0 31.5C0 39.784 8.059 47 18 47C27.941 47 36 39.784 36 31.5C36 22.5 18 0 18 0Z" fill="url(#dDrop)"/>
              <defs><linearGradient id="dDrop" x1="0" y1="0" x2="36" y2="47" gradientUnits="userSpaceOnUse"><stop stopColor="#0E8C5E"/><stop offset="1" stopColor="#0077B6"/></linearGradient></defs>
            </svg>
            <span className="font-nunito font-bold text-[#0E8C5E]">Oasis</span>
          </div>
          <button onClick={() => navigate('driver-profile')} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center">
            <User size={16} className="text-[#4A4A4A]" />
          </button>
        </div>

        {/* Toggle */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <button
            onClick={toggleAvailability}
            disabled={updating}
            className={`flex items-center gap-2 capsule px-6 py-3 text-sm font-inter font-semibold shadow-lg transition-all ${
              available
                ? 'bg-[#0E8C5E] text-white'
                : 'bg-white text-[#4A4A4A]'
            }`}
          >
            {updating ? <Loader2 size={14} className="animate-spin" /> : (
              <div className={`w-3 h-3 rounded-full ${available ? 'bg-white animate-pulse' : 'bg-[#E0E0E0]'}`} />
            )}
            {available ? 'Disponible' : 'Fuera de servicio'}
          </button>
        </div>
      </div>

      {/* Orders panel */}
      <div className="flex-1 bg-white rounded-t-[24px] -mt-4 relative z-10 p-4 space-y-3">
        <h3 className="font-nunito font-bold text-base text-[#4A4A4A]">
          {acceptedOrder ? 'Pedido en Proceso' : 'Pedidos Disponibles'}
        </h3>

        {loading ? (
          <div className="py-12 flex flex-col items-center">
            <DropLoader size={48} />
            <p className="mt-4 font-inter text-sm text-[#8A8A8A]">Actualizando estado...</p>
          </div>
        ) : acceptedOrder ? (
          <OasisCard className="!p-4 !bg-[#E8F5EE]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-inter font-bold text-sm text-[#0E8C5E]">#{acceptedOrder.id.slice(-4).toUpperCase()}</span>
              <span className={`capsule px-3 py-1 text-xs font-inter font-semibold ${
                step === 0 ? 'bg-[#FFF3E0] text-[#F4A261]' :
                step === 1 ? 'bg-[#E0F2FE] text-[#0077B6]' :
                step === 2 ? 'bg-[#E8F5EE] text-[#0E8C5E]' : 'bg-[#0E8C5E] text-white'
              }`}>
                {['Aceptado', 'Recogido', 'En camino', 'Entregado'][step]}
              </span>
            </div>
            <div className="space-y-2 text-sm font-inter text-[#4A4A4A]">
              <div className="flex items-center gap-2"><Package size={14} className="text-[#0E8C5E]" /> {acceptedOrder.pharmacy?.name}</div>
              <div className="flex items-center gap-2"><MapPin size={14} className="text-[#0077B6]" /> {acceptedOrder.deliveryAddress}</div>
              <div className="flex items-center gap-2"><User size={14} className="text-[#0E8C5E]" /> {acceptedOrder.patient?.user?.name}</div>
            </div>
            <div className="flex gap-2 mt-4">
              {step === 0 && <OasisButton size="sm" className="flex-1" onClick={() => updateStatus('picked_up')} disabled={updating}>Recogí el pedido</OasisButton>}
              {step === 1 && <OasisButton size="sm" className="flex-1" onClick={() => updateStatus('on_the_way')} disabled={updating}>En camino</OasisButton>}
              {step === 2 && <OasisButton size="sm" className="flex-1" onClick={() => setConfirming(true)} disabled={updating}>Confirmar entrega</OasisButton>}
            </div>
          </OasisCard>
        ) : available ? (
          orders.length === 0 ? (
            <EmptyState message="Buscando pedidos cercanos..." icon="search" />
          ) : (
            orders.map((order) => (
              <OasisCard key={order.id} className="!p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-inter font-bold text-sm text-[#0E8C5E]">#{order.id.slice(-4).toUpperCase()}</div>
                    <div className="font-inter text-xs text-[#8A8A8A]">{order.pharmacy?.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-nunito font-bold text-base text-[#0E8C5E]">C$80.00</div>
                    <div className="text-[10px] font-inter text-[#8A8A8A]">{order.distance ? `${order.distance.toFixed(1)} km` : '---'}</div>
                  </div>
                </div>
                <div className="text-xs font-inter text-[#8A8A8A] mb-3 truncate">{order.deliveryAddress}</div>
                <OasisButton size="sm" className="w-full" onClick={() => handleAccept(order.id)} disabled={updating}>Aceptar Pedido</OasisButton>
              </OasisCard>
            ))
          )
        ) : (
          <div className="text-center py-8">
            <p className="font-inter text-sm text-[#8A8A8A]">Activa tu disponibilidad para recibir pedidos.</p>
          </div>
        )}
      </div>

      {/* Confirm delivery modal */}
      {confirming && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-[24px] w-full max-w-lg p-6 space-y-4">
            <h3 className="font-nunito font-bold text-lg text-[#4A4A4A]">Confirmar Entrega</h3>
            <div className="space-y-3">
              <button className="w-full p-4 rounded-[16px] border-2 border-[#E0E0E0] flex items-center gap-3 hover:border-[#0E8C5E] transition-colors">
                <Camera size={20} className="text-[#0E8C5E]" />
                <span className="font-inter text-sm text-[#4A4A4A]">Tomar foto del paquete</span>
              </button>
              <button className="w-full p-4 rounded-[16px] border-2 border-[#E0E0E0] flex items-center gap-3 hover:border-[#0E8C5E] transition-colors">
                <PenTool size={20} className="text-[#0E8C5E]" />
                <span className="font-inter text-sm text-[#4A4A4A]">Firma del cliente</span>
              </button>
            </div>
            <div className="flex gap-3">
              <OasisButton variant="ghost" className="flex-1" onClick={() => setConfirming(false)}>Cancelar</OasisButton>
              <OasisButton className="flex-1" onClick={() => { setConfirming(false); updateStatus('delivered'); }}>
                Entrega Confirmada
              </OasisButton>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0E0E0] h-16 flex items-center justify-around z-40">
        {[
          { icon: MapPin, label: 'Inicio', view: 'driver-main' as const },
          { icon: TrendingUp, label: 'Ganancias', view: 'driver-earnings' as const },
          { icon: User, label: 'Perfil', view: 'driver-profile' as const },
        ].map((item, i) => (
          <button key={i} onClick={() => navigate(item.view)} className={`flex flex-col items-center gap-0.5 px-4 py-1 ${item.view === 'driver-main' ? 'text-[#0E8C5E]' : 'text-[#8A8A8A]'}`}>
            {item.view === 'driver-main' && <div className="w-1 h-1 rounded-full bg-[#0E8C5E] mb-0.5" />}
            <item.icon size={20} />
            <span className="text-[9px] font-inter font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

