'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Clock, 
  Package, 
  Truck, 
  CheckCircle, 
  RefreshCcw,
  User,
  Phone,
  MapPin,
  Pill,
  Trash2,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { OasisCard, OasisButton, DropLoader, EmptyState, ErrorState, StatusBadge } from '../shared/shared-components'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { api } from '@/lib/api-client'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const COLUMNS = [
  { id: 'pending', title: 'Pendientes', color: '#8A8A8A' },
  { id: 'preparing', title: 'En Preparación', color: '#F4A261' },
  { id: 'ready', title: 'Listo para Entrega', color: '#0077B6' },
  { id: 'delivered', title: 'Entregado', color: '#0E8C5E' },
]

function SortableOrderCard({ order, onClick }: { order: any; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-3"
    >
      <OasisCard 
        className={`!p-3 border-2 ${isDragging ? 'border-[#0E8C5E] shadow-xl' : 'border-transparent'} hover:border-[#0E8C5E]/20 transition-all cursor-grab active:cursor-grabbing`}
        onClick={onClick}
      >
        <div className="flex justify-between items-start mb-2">
           <span className="text-[10px] font-bold font-inter text-[#8A8A8A]">#{order.id.slice(-6).toUpperCase()}</span>
           <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${order.deliveryType === 'delivery' ? 'bg-[#E0F2FF] text-[#0077B6]' : 'bg-[#E8F5EE] text-[#0E8C5E]'}`}>
             {order.deliveryType === 'delivery' ? 'Domicilio' : 'Retiro'}
           </span>
        </div>
        <h4 className="font-nunito font-bold text-sm text-[#4A4A4A] truncate">{order.patient?.user?.name}</h4>
        <p className="text-[10px] font-inter text-[#8A8A8A] mt-1">{order.items?.length || 0} productos • C${order.totalAmount}</p>
        <div className="flex items-center gap-1 mt-2">
           <Clock size={10} className="text-[#B0B0B0]" />
           <span className="text-[9px] font-inter text-[#B0B0B0]">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </OasisCard>
    </div>
  )
}

export default function PharmacyOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [deliveryFilter, setDeliveryFilter] = useState('all')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/orders', { limit: 50 })
      if (res.success && res.data) {
        setOrders(res.data)
      } else {
        setError(res.message || 'Error al cargar pedidos')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const orderId = active.id
    const newStatus = over.id

    // Check if dragging over a column
    if (COLUMNS.some(col => col.id === newStatus)) {
      const order = orders.find(o => o.id === orderId)
      if (order && order.status !== newStatus) {
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o))
        
        try {
          await api.patch(`/orders/${orderId}`, { status: newStatus })
        } catch (err) {
          // Revert on error
          loadOrders()
        }
      }
    }
  }

  const filteredOrders = orders.filter(o => {
    if (deliveryFilter === 'all') return true
    return o.deliveryType === deliveryFilter
  })

  const getOrdersByStatus = (status: string) => filteredOrders.filter(o => o.status === status)

  if (error) return <ErrorState message={error} onRetry={loadOrders} />

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-0 h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Gestión de Pedidos</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Flujo Kanban para farmacia</p>
        </div>
        <div className="flex bg-[#FAFAFA] p-1 rounded-xl border border-[#E0E0E0]">
           {['all', 'delivery', 'pickup'].map(f => (
             <button 
               key={f}
               onClick={() => setDeliveryFilter(f)}
               className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider ${deliveryFilter === f ? 'bg-white text-[#0E8C5E] shadow-sm' : 'text-[#8A8A8A]'}`}
             >
               {f === 'all' ? 'Todos' : f === 'delivery' ? 'Domicilio' : 'Pick-up'}
             </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><DropLoader size={48} /></div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-hidden">
            {COLUMNS.map((col) => (
              <div key={col.id} className="flex flex-col h-full bg-[#FAFAFA] rounded-3xl p-3 border border-[#F0F0F0]">
                <div className="flex items-center justify-between mb-4 px-2">
                   <h3 className="font-nunito font-bold text-sm text-[#4A4A4A] flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                      {col.title}
                   </h3>
                   <span className="text-[10px] font-bold text-[#8A8A8A] bg-white px-2 py-0.5 rounded-full border border-[#F0F0F0]">
                      {getOrdersByStatus(col.id).length}
                   </span>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide px-0.5">
                  <SortableContext
                    id={col.id}
                    items={getOrdersByStatus(col.id).map(o => o.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {getOrdersByStatus(col.id).map((order) => (
                      <SortableOrderCard 
                        key={order.id} 
                        order={order} 
                        onClick={() => setSelectedOrder(order)} 
                      />
                    ))}
                    {getOrdersByStatus(col.id).length === 0 && (
                      <div className="h-24 border-2 border-dashed border-[#E0E0E0] rounded-2xl flex items-center justify-center opacity-30">
                        <span className="text-[10px] font-inter uppercase tracking-widest">Colocar aquí</span>
                      </div>
                    )}
                  </SortableContext>
                </div>
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="w-64 rotate-2">
                 <OasisCard className="!p-3 border-2 border-[#0E8C5E] shadow-2xl opacity-90 scale-105">
                    <p className="font-nunito font-bold text-sm">Moviendo Pedido...</p>
                 </OasisCard>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="modal-oasis max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-xl flex items-center justify-between pr-8">
               <span>Detalle del Pedido</span>
               <StatusBadge status={selectedOrder?.status} />
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto px-1">
               <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#E8F5EE]/50 border border-[#0E8C5E]/10">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-[#0E8C5E]">
                     <User size={24} />
                  </div>
                  <div>
                     <p className="font-nunito font-bold text-[#4A4A4A]">{selectedOrder.patient?.user?.name}</p>
                     <p className="font-inter text-xs text-[#8A8A8A]">{selectedOrder.patient?.user?.phone || 'Sin teléfono'}</p>
                  </div>
                  <OasisButton variant="secondary" size="sm" className="ml-auto h-8 w-8 !p-0" onClick={() => window.open(`tel:${selectedOrder.patient?.user?.phone}`)}>
                     <Phone size={14} />
                  </OasisButton>
               </div>

               <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                     <h4 className="font-nunito font-bold text-sm text-[#8A8A8A] uppercase">Productos</h4>
                     <span className="text-[10px] font-bold text-[#0E8C5E]">{selectedOrder.items?.length || 0} ITEMS</span>
                  </div>
                  <div className="space-y-2">
                     {selectedOrder.items?.map((it: any, i: number) => (
                       <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-[#FAFAFA] border border-[#F0F0F0] hover:border-[#0E8C5E]/20 transition-all">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0E8C5E] shadow-sm"><Pill size={16} /></div>
                             <div>
                               <p className="font-inter font-bold text-xs text-[#4A4A4A]">{it.medication?.name}</p>
                               <p className="font-inter text-[10px] text-[#8A8A8A]">{it.quantity} unidades • C${it.unitPrice}</p>
                             </div>
                          </div>
                          <span className="font-inter font-bold text-xs text-[#0E8C5E]">C${it.totalPrice}</span>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#F0F0F0] space-y-3">
                  <div className="flex items-center gap-2 text-[#8A8A8A]">
                     <MapPin size={14} />
                     <span className="text-[10px] font-bold uppercase tracking-wider">Logística de Entrega</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-inter font-bold text-[#4A4A4A]">{selectedOrder.deliveryType === 'delivery' ? 'Domicilio' : 'Retiro en Sucursal'}</p>
                    <p className="text-xs font-inter text-[#8A8A8A]">{selectedOrder.deliveryAddress || 'Sin dirección especificada'}</p>
                  </div>
               </div>

               <div className="flex gap-3 pt-2">
                  <OasisButton variant="outline" fullWidth onClick={() => setSelectedOrder(null)}>Cerrar</OasisButton>
                  <OasisButton fullWidth onClick={() => {
                    const nextStatusMap: any = { 'pending': 'preparing', 'preparing': 'ready', 'ready': 'delivered' }
                    const nextStatus = nextStatusMap[selectedOrder.status]
                    if (nextStatus) {
                       api.patch(`/orders/${selectedOrder.id}`, { status: nextStatus }).then(() => {
                         setSelectedOrder(null)
                         loadOrders()
                       })
                    }
                  }} disabled={selectedOrder.status === 'delivered'}>
                     {selectedOrder.status === 'pending' ? 'Empezar Preparación' : 
                      selectedOrder.status === 'preparing' ? 'Marcar como Listo' : 
                      selectedOrder.status === 'ready' ? 'Confirmar Entrega' : 'Entregado'}
                  </OasisButton>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
