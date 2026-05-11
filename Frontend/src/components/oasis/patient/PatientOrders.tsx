import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, Phone, FileText, Check, Home, ShoppingBag, User, MessageCircle, Truck, Package, Clock, Receipt, CreditCard, ChevronRight, XCircle, Pill, Heart } from 'lucide-react'
import { OasisCard, OasisButton, OasisIconButton, DropLoader, ErrorState, EmptyState, WaveSkeleton } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { oasisToast } from '@/lib/oasis-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import OrderTrackingMap from './OrderTrackingMap'

const statusSteps = [
  { label: 'Confirmado', icon: Check },
  { label: 'Preparando', icon: Package },
  { label: 'En camino', icon: Truck },
  { label: 'Entregado', icon: Home },
]

const OasisDropAnimation = () => (
  <div className="flex flex-col items-center justify-center py-4">
    <motion.div
      initial={{ y: -50, opacity: 0, scale: 0.5 }}
      animate={{ 
        y: [0, -20, 0],
        scale: [1, 1.2, 1],
        opacity: 1,
        borderRadius: ["50% 50% 50% 50%", "30% 70% 70% 30% / 30% 30% 70% 70%", "50% 50% 50% 50%"]
      }}
      transition={{ 
        y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
        borderRadius: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
      }}
      className="w-12 h-16 bg-[#0E8C5E] relative shadow-lg"
      style={{ 
        clipPath: "path('M24 0C10.7452 0 0 10.7452 0 24C0 37.2548 24 64 24 64C24 64 48 37.2548 48 24C48 10.7452 37.2548 0 24 0Z')" 
      }}
    />
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-4 font-nunito font-bold text-[#0E8C5E] text-sm animate-pulse"
    >
      Generando Factura...
    </motion.p>
  </div>
)

export default function PatientOrders() {
  const { navigate } = useNavigation()
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapDialogOpen, setMapDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    setLoading(true)
    setError(null)
    try {
      console.log('[PatientOrders] Cargando pedidos...')
      const res = await api.get('/orders', { limit: 20 })
      console.log('[PatientOrders] Respuesta API:', res)
      if (res.success && res.data) {
        setOrders(Array.isArray(res.data) ? res.data : [])
      } else {
        console.warn('[PatientOrders] API falló o no devolvió datos:', res)
      }
    } catch (err) {
      console.error('[PatientOrders] Error cargando pedidos:', err)
      setError('No pudimos cargar tus pedidos.')
    } finally {
      setLoading(false)
    }
  }

  function getStatusIndex(status: string) {
    switch (status) {
      case 'pending':
      case 'confirmed': return 1
      case 'processing': return 2
      case 'shipped': return 3
      case 'delivered': return 4
      case 'cancelled': return 0
      default: return 1
    }
  }

  const handleVerMapa = (order: any) => {
    setSelectedOrder(order)
    setMapDialogOpen(true)
  }

  const handleVerDetalle = (order: any) => {
    setSelectedOrder(order)
    setDetailDialogOpen(true)
  }

  const handleDownloadInvoice = async (orderId: string, invoiceId: string) => {
    if (!invoiceId) {
      oasisToast.error('Error', 'No se encontró la factura para este pedido.')
      return
    }

    setDownloadingInvoiceId(orderId)
    
    // Aesthetic delay to let the animation "wow" the user
    setTimeout(() => {
      window.open(`/api/v1/invoices/${invoiceId}/pdf`, '_blank')
      setTimeout(() => setDownloadingInvoiceId(null), 2000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 space-y-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('patient-feed')} className="w-10 h-10 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#4A4A4A] hover:bg-[#F0F0F0] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-nunito font-bold text-xl text-[#4A4A4A]">Mis Pedidos</h1>
        </div>
      </div>

      <div className="flex-1 px-6 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <WaveSkeleton key={i} className="h-44 w-full rounded-[24px]" />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadOrders} />
        ) : orders.length === 0 ? (
          <EmptyState message="Aún no tienes pedidos activos. Zumbi está listo para ayudarte con tu primera compra." />
        ) : (
          orders.map((order) => {
            const stepIdx = getStatusIndex(order.status)
            return (
              <OasisCard key={order.id} className="group overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        stepIdx === 4 ? 'bg-[#E8F5EE] text-[#0E8C5E]' : 'bg-[#E0F2FE] text-[#0077B6]'
                     }`}>
                        {stepIdx === 4 ? <Check size={20} /> : <ShoppingBag size={20} />}
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                          <p className="font-inter font-bold text-xs text-[#0E8C5E] uppercase tracking-tighter">ORDEN #{order.id.slice(-6).toUpperCase()}</p>
                          {stepIdx === 4 && (
                            <span className="bg-[#E8F5EE] text-[#0E8C5E] text-[8px] font-black px-2 py-0.5 rounded-full border border-[#0E8C5E]/20 flex items-center gap-1">
                              <Check size={8} strokeWidth={3} /> ENTREGADO
                            </span>
                          )}
                        </div>
                        <p className="font-nunito font-bold text-[#4A4A4A]">{order.pharmacy?.name || 'Farmacia Oasis'}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="font-nunito font-black text-lg text-[#4A4A4A]">C${order.totalAmount}</p>
                     <p className="font-inter text-[10px] text-[#8A8A8A] font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Progress Visualizer */}
                <div className="relative flex items-center justify-between mb-6 px-2">
                   {/* Background Line */}
                   <div className="absolute top-4 left-0 right-0 h-1 bg-[#F0F0F0] -z-0 rounded-full mx-6" />
                   {/* Active Line */}
                   <div 
                      className="absolute top-4 left-0 h-1 oasis-gradient -z-0 rounded-full mx-6 transition-all duration-1000" 
                      style={{ width: `calc(${((stepIdx - 1) / 3) * 100}% - 12px)` }} 
                   />
                   
                   {statusSteps.map((step, i) => {
                      const active = i < stepIdx
                      const current = i === stepIdx - 1
                      return (
                        <div key={i} className="relative z-10 flex flex-col items-center gap-1.5">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                              active ? 'oasis-gradient text-white shadow-md' : 'bg-[#F0F0F0] text-[#B0B0B0]'
                           } ${current ? 'scale-110 ring-4 ring-[#E8F5EE]' : ''}`}>
                              <step.icon size={14} />
                           </div>
                           <span className={`text-[9px] font-bold uppercase tracking-wider ${active ? 'text-[#0E8C5E]' : 'text-[#B0B0B0]'}`}>
                              {step.label}
                           </span>
                        </div>
                      )
                   })}
                </div>

                <div className="flex gap-2 pt-2">
                   <OasisButton fullWidth size="sm" onClick={() => handleVerDetalle(order)}>
                      Ver Detalle
                   </OasisButton>
                   {stepIdx === 3 && (
                      <OasisButton variant="blue" size="sm" onClick={() => handleVerMapa(order)}>
                         Rastrear
                      </OasisButton>
                   )}
                </div>
              </OasisCard>
            )
          })
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="modal-oasis max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-xl">Detalle de Compra</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="py-4 space-y-6">
              <div className="flex items-center justify-between bg-[#FAFAFA] p-4 rounded-2xl border border-[#F0F0F0]">
                 <div className="flex items-center gap-3">
                    <Receipt size={24} className="text-[#0E8C5E]" />
                    <div>
                       <p className="text-[10px] font-bold text-[#8A8A8A] uppercase">Total Pagado</p>
                       <p className="font-nunito font-black text-xl text-[#0E8C5E]">C${selectedOrder.totalAmount}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-[#8A8A8A] uppercase">Método</p>
                    <div className="flex items-center gap-1 justify-end">
                       <CreditCard size={12} className="text-[#0077B6]" />
                       <p className="font-inter text-xs font-bold text-[#4A4A4A]">Oasis Pay</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-3">
                 <p className="font-nunito font-bold text-sm text-[#4A4A4A] px-1">Medicamentos</p>
                 <div className="space-y-2">
                    {selectedOrder.items?.map((item: any, i: number) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-white border border-[#F0F0F0] rounded-xl">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-[#E8F5EE] flex items-center justify-center text-[#0E8C5E]">
                                <Pill size={16} />
                             </div>
                             <div>
                                <p className="font-inter font-bold text-xs text-[#4A4A4A]">{item.medication?.name || 'Medicamento'}</p>
                                <p className="font-inter text-[10px] text-[#8A8A8A]">Cant: {item.quantity}</p>
                             </div>
                          </div>
                          <p className="font-inter font-bold text-xs text-[#4A4A4A]">C${item.totalPrice}</p>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="space-y-2">
                 <p className="font-nunito font-bold text-sm text-[#4A4A4A] px-1">Destino</p>
                 <div className="flex items-center gap-3 p-3 bg-[#E8F5EE]/30 rounded-xl">
                    <MapPin size={20} className="text-[#0E8C5E]" />
                    <p className="font-inter text-xs text-[#4A4A4A]">{selectedOrder.deliveryAddress || 'Dirección guardada'}</p>
                 </div>
              </div>

               <div className="flex flex-col gap-3">
                  <AnimatePresence mode="wait">
                    {downloadingInvoiceId === selectedOrder.id ? (
                      <OasisDropAnimation key="animation" />
                    ) : (
                      <OasisButton 
                        key="button"
                        fullWidth 
                        variant="outline" 
                        size="md"
                        onClick={() => handleDownloadInvoice(selectedOrder.id, selectedOrder.invoice?.id)}
                        disabled={!selectedOrder.invoice}
                      >
                         Descargar Factura
                      </OasisButton>
                    )}
                  </AnimatePresence>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Map/Tracking Dialog */}
      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
         <DialogContent className="modal-oasis max-w-sm p-0 overflow-hidden">
            <DialogHeader className="sr-only">
               <DialogTitle>Seguimiento de Pedido</DialogTitle>
               <DialogDescription>Mapa en tiempo real del repartidor</DialogDescription>
            </DialogHeader>
            <div className="relative h-72 bg-[#E8F5EE]">
               {selectedOrder && (
                  <OrderTrackingMap 
                    orderId={selectedOrder.id} 
                    initialLocation={[12.136, -86.251]} 
                  />
               )}
               
               <button 
                  onClick={() => setMapDialogOpen(false)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#4A4A4A] shadow-xl z-[1000]"
               >
                  <XCircle size={24} />
               </button>
            </div>

            <div className="p-6 space-y-6">
               <div className="flex items-center justify-between">
                  <div>
                     <h3 className="font-nunito font-bold text-lg text-[#4A4A4A]">Repartidor en camino</h3>
                     <p className="font-inter text-xs text-[#8A8A8A]">Llega en aproximadamente 8 min</p>
                  </div>
                  <div className="w-12 h-12 rounded-full oasis-gradient flex items-center justify-center text-white">
                     <Truck size={24} />
                  </div>
               </div>

               <div className="flex items-center gap-4 p-4 bg-[#FAFAFA] rounded-2xl border border-[#F0F0F0]">
                  <div className="w-12 h-12 rounded-full bg-[#E8F5EE] border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                     <User size={32} className="text-[#0E8C5E] mt-2" />
                  </div>
                  <div className="flex-1">
                     <p className="font-nunito font-bold text-[#4A4A4A]">Roberto Sánchez</p>
                     <p className="font-inter text-[10px] font-bold text-[#0E8C5E]">RATING 4.9 ★</p>
                  </div>
                  <button 
                    onClick={() => window.open('tel:+50588880000', '_self')}
                    className="w-10 h-10 rounded-full bg-white border border-[#F0F0F0] flex items-center justify-center text-[#0E8C5E] shadow-sm hover:scale-105 transition-all"
                  >
                     <Phone size={18} />
                  </button>
               </div>

               <OasisButton fullWidth onClick={() => navigate('patient-chat')}>
                  Enviar Mensaje
               </OasisButton>
            </div>
         </DialogContent>
      </Dialog>
      
      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-6 pt-2 bg-white/80 backdrop-blur-md z-40 border-t border-[#F0F0F0]/50">
        <div className="bg-[#4A4A4A] rounded-[32px] h-16 flex items-center justify-around px-2 shadow-2xl">
          {[
            { icon: Home, label: 'Inicio', view: 'patient-feed' as const },
            { icon: ShoppingBag, label: 'Pedidos', view: 'patient-orders' as const },
            { icon: Heart, label: 'Recetas', view: 'patient-prescriptions' as const },
            { icon: User, label: 'Perfil', view: 'patient-profile' as const },
          ].map((item, i) => {
            const isActive = 'patient-orders' === item.view
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

