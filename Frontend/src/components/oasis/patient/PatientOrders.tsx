'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, MapPin, Phone, FileText, Check, Home, ShoppingBag, User, MessageCircle } from 'lucide-react'
import { OasisCard, OasisButton, OasisIconButton, DropLoader, ErrorState, EmptyState } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

const statusSteps = ['Confirmado', 'Preparando', 'En camino', 'Entregado']

const navItems = [
  { icon: Home, label: 'Inicio', view: 'patient-feed' as const },
  { icon: ShoppingBag, label: 'Pedidos', view: 'patient-orders' as const },
  { icon: User, label: 'Perfil', view: 'patient-profile' as const },
  { icon: MessageCircle, label: 'Chat', view: 'patient-chat' as const },
]

export default function PatientOrders() {
  const { navigate } = useNavigation()
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapDialogOpen, setMapDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/orders', { limit: 20 })
      if (res.success && res.data) {
        setOrders(res.data)
      }
    } catch (err) {
      setError('No pudimos cargar tus pedidos.')
    } finally {
      setLoading(false)
    }
  }

  function getStatusInfo(status: string) {
    switch (status) {
      case 'pending': return { label: 'Pendiente', step: 1 }
      case 'confirmed': return { label: 'Confirmado', step: 1 }
      case 'processing': return { label: 'Preparando', step: 2 }
      case 'shipped': return { label: 'En camino', step: 3 }
      case 'delivered': return { label: 'Entregado', step: 4 }
      case 'cancelled': return { label: 'Cancelado', step: 0 }
      default: return { label: status, step: 1 }
    }
  }

  const handleVerMapa = (order: any) => {
    setSelectedOrder(order)
    setMapDialogOpen(true)
  }

  const handleLlamar = (phone: string) => {
    if (!phone) return
    window.open(`tel:${phone}`, '_self')
  }

  const handleVerDetalle = (order: any) => {
    setSelectedOrder(order)
    setDetailDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-[10px] border-b border-[#E0E0E0]/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('patient-feed')}><ArrowLeft size={20} className="text-[#4A4A4A]" /></button>
          <h1 className="font-nunito font-bold text-lg text-[#4A4A4A]">Mis Pedidos</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <DropLoader size={48} />
            <p className="mt-4 font-inter text-sm text-[#8A8A8A]">Cargando pedidos...</p>
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadOrders} />
        ) : orders.length === 0 ? (
          <EmptyState message="Aún no has realizado ningún pedido." icon="bag" />
        ) : (
          orders.map((order) => {
            const statusInfo = getStatusInfo(order.status)
            return (
              <OasisCard key={order.id} className="!p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-inter font-bold text-sm text-[#0E8C5E]">#{order.id.slice(-4).toUpperCase()}</div>
                    <div className="font-inter text-xs text-[#8A8A8A]">{order.pharmacy?.name} · {new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-nunito font-bold text-base text-[#0E8C5E]">C${order.totalAmount}</div>
                    <span className={`capsule px-2 py-0.5 text-[10px] font-inter font-semibold ${
                      statusInfo.step === 4 ? 'bg-[#E8F5EE] text-[#0E8C5E]' : statusInfo.step >= 3 ? 'bg-[#E0F2FE] text-[#0077B6]' : 'bg-[#FFF3E0] text-[#F4A261]'
                    }`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative mb-2">
                  <div className="flex items-center justify-between">
                    {statusSteps.map((step, i) => (
                      <div key={i} className="flex flex-col items-center flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-inter font-bold ${
                          i < statusInfo.step
                            ? 'oasis-gradient text-white'
                            : i === statusInfo.step - 1
                            ? 'border-2 border-[#0E8C5E] bg-[#E8F5EE] text-[#0E8C5E]'
                            : 'bg-[#E0E0E0] text-[#8A8A8A]'
                        }`}>
                          {i < statusInfo.step - 1 ? <Check size={10} /> : i + 1}
                        </div>
                        <span className="text-[8px] font-inter text-[#8A8A8A] mt-0.5 text-center">{step}</span>
                      </div>
                    ))}
                  </div>
                  {/* Connector line */}
                  <div className="absolute top-3 left-[12%] right-[12%] h-0.5 bg-[#E0E0E0] -z-10">
                    <div className="h-full oasis-gradient rounded-full transition-all" style={{ width: `${Math.max(0, (statusInfo.step - 1) / 3) * 100}%` }} />
                  </div>
                </div>

                {statusInfo.step === 3 && (
                  <div className="flex items-center gap-2 mt-2">
                    <OasisButton size="sm" variant="outline" className="flex-1" onClick={() => handleVerMapa(order)}>
                      <MapPin size={12} className="mr-1" /> Ver mapa
                    </OasisButton>
                    <OasisIconButton 
                      size="sm" 
                      variant="outline" 
                      className="bg-[#E8F5EE]"
                      onClick={() => handleLlamar(order.delivery?.deliveryPerson?.user?.phone)}
                      icon={<Phone size={12} className="text-[#0E8C5E]" />}
                    />
                  </div>
                )}

                <div className="flex justify-end mt-2">
                  <button className="flex items-center gap-1 text-xs font-inter text-[#0E8C5E]" onClick={() => handleVerDetalle(order)}>
                    <FileText size={12} /> Ver detalle
                  </button>
                </div>
              </OasisCard>
            )
          })
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0E0E0] h-16 flex items-center justify-around z-40">
        {navItems.map((item, i) => (
          <button
            key={i}
            onClick={() => navigate(item.view)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${item.view === 'patient-orders' ? 'text-[#0E8C5E]' : 'text-[#8A8A8A]'}`}
          >
            {item.view === 'patient-orders' && <div className="w-1 h-1 rounded-full bg-[#0E8C5E] mb-0.5" />}
            <item.icon size={18} />
            <span className="text-[9px] font-inter font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Map Placeholder Dialog */}
      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent className="rounded-[20px] max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-[#4A4A4A]">Ubicación del repartidor</DialogTitle>
            <DialogDescription className="font-inter text-[#8A8A8A]">
              Pedido #{selectedOrder?.id.slice(-4).toUpperCase()} - {selectedOrder?.pharmacy?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="w-full h-48 bg-[#E8F5EE] rounded-[16px] flex items-center justify-center relative">
              <MapPin size={32} className="text-[#0E8C5E] drop-loader" />
              <div className="absolute bottom-3 left-3 right-3 bg-white/90 rounded-[12px] p-3">
                <p className="font-inter text-xs text-[#8A8A8A]">Destino</p>
                <p className="font-inter font-semibold text-sm text-[#4A4A4A]">{selectedOrder?.deliveryAddress || 'Dirección de entrega'}</p>
              </div>
            </div>
            {selectedOrder?.delivery?.deliveryPerson && (
              <div className="flex items-center gap-3 mt-3 p-3 rounded-[12px] bg-[#FAFAFA]">
                <div className="w-10 h-10 rounded-full bg-[#E8F5EE] flex items-center justify-center font-nunito font-bold text-xs text-[#0E8C5E]">
                  {selectedOrder.delivery.deliveryPerson.user.name.split(' ').map((n:any) => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="font-inter font-semibold text-sm text-[#4A4A4A]">{selectedOrder.delivery.deliveryPerson.user.name}</p>
                  <p className="font-inter text-xs text-[#8A8A8A]">Repartidor Oasis</p>
                </div>
                <OasisIconButton
                  onClick={() => handleLlamar(selectedOrder.delivery.deliveryPerson.user.phone)}
                  icon={<Phone size={16} className="text-[#0E8C5E]" />}
                  variant="outline"
                  size="sm"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="rounded-[20px] max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-[#4A4A4A]">Detalle del pedido</DialogTitle>
            <DialogDescription className="font-inter text-[#8A8A8A]">
              #{selectedOrder?.id.slice(-4).toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="py-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="capsule px-3 py-1 text-xs font-inter font-semibold bg-[#E8F5EE] text-[#0E8C5E]">
                  {getStatusInfo(selectedOrder.status).label}
                </span>
                <span className="font-nunito font-bold text-lg text-[#0E8C5E]">C${selectedOrder.totalAmount}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#0E8C5E]" />
                  <span className="font-inter text-sm text-[#4A4A4A]">{selectedOrder.pharmacy?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#0077B6]" />
                  <span className="font-inter text-sm text-[#8A8A8A]">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-[#E0E0E0] pt-3">
                <p className="font-inter font-semibold text-xs text-[#8A8A8A] mb-2">ARTÍCULOS</p>
                {selectedOrder.items?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0E8C5E]" />
                      <span className="font-inter text-sm text-[#4A4A4A]">{item.medication?.name} x{item.quantity}</span>
                    </div>
                    <span className="font-inter text-xs text-[#8A8A8A]">C${item.totalPrice}</span>
                  </div>
                ))}
              </div>

              {selectedOrder.deliveryAddress && (
                <div className="border-t border-[#E0E0E0] pt-3">
                  <p className="font-inter font-semibold text-xs text-[#8A8A8A] mb-1">DIRECCIÓN DE ENTREGA</p>
                  <p className="font-inter text-sm text-[#4A4A4A]">{selectedOrder.deliveryAddress}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

