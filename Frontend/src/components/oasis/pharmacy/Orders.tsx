'use client'

import { useState, useEffect } from 'react'
import { GripVertical, Clock, Package, Truck, CheckCircle, RefreshCcw } from 'lucide-react'
import { OasisCard, DropLoader, EmptyState, ErrorState } from '../shared/shared-components'
import { api } from '@/lib/api-client'

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled'

const columns: { id: OrderStatus; label: string; icon: any; color: string }[] = [
  { id: 'pending', label: 'Pendientes', icon: Clock, color: '#F4A261' },
  { id: 'preparing', label: 'Preparando', icon: Package, color: '#0077B6' },
  { id: 'ready', label: 'Listos', icon: RefreshCcw, color: '#0E8C5E' },
  { id: 'delivered', label: 'Entregados', icon: CheckCircle, color: '#0E8C5E' },
]

export default function PharmacyOrders() {
  const [orderList, setOrderList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/orders', { limit: 50 })
      if (res.success && res.data) {
        setOrderList(res.data)
      } else {
        setError(res.message || 'Error al cargar pedidos')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const moveOrder = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await api.patch(`/orders/${orderId}`, { status: newStatus })
      if (res.success) {
        loadOrders()
      }
    } catch (err) {
      alert('Error al actualizar estado')
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><DropLoader size={48} /></div>
  if (error) return <ErrorState message={error} onRetry={loadOrders} />

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Gestión de Pedidos</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Flujo de trabajo Kanban en tiempo real</p>
        </div>
        <button onClick={loadOrders} className="p-2 rounded-full hover:bg-[#E8F5EE] transition-colors">
          <RefreshCcw size={18} className="text-[#0E8C5E]" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colOrders = orderList.filter(o => {
            if (col.id === 'ready') return o.status === 'ready' || o.status === 'delivering'
            return o.status === col.id
          })
          
          return (
            <div key={col.id} className="min-w-[280px]">
              <div className="flex items-center gap-2 mb-4 px-1">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: `${col.color}15` }}>
                  <col.icon size={16} style={{ color: col.color }} />
                </div>
                <span className="font-nunito font-bold text-[#4A4A4A]">{col.label}</span>
                <span className="ml-auto capsule bg-white border border-[#E0E0E0] text-[#8A8A8A] px-2 py-0.5 text-[10px] font-inter font-bold">{colOrders.length}</span>
              </div>

              <div className="space-y-4 min-h-[500px] bg-[#F2F2F2]/50 p-2 rounded-2xl border-2 border-dashed border-[#E0E0E0]">
                {colOrders.length === 0 ? (
                   <p className="text-center py-12 text-[10px] font-inter text-[#8A8A8A] uppercase tracking-widest">Sin pedidos</p>
                ) : (
                  colOrders.map((order) => (
                    <OasisCard key={order.id} className="!p-4 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-inter font-bold text-[10px] text-[#0E8C5E] px-2 py-0.5 bg-[#E8F5EE] rounded-full">#{order.id.slice(-4).toUpperCase()}</span>
                        <div className="flex items-center gap-1 text-[10px] font-inter text-[#8A8A8A]">
                          <Clock size={10} /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      
                      <div className="font-inter font-bold text-sm text-[#4A4A4A] mb-0.5">{order.patient?.user?.name}</div>
                      <div className="font-inter text-[10px] text-[#8A8A8A] mb-3 flex items-center gap-1">
                         {order.deliveryType === 'delivery' ? <Truck size={10} /> : <Package size={10} />}
                         {order.deliveryType === 'delivery' ? 'Entrega a domicilio' : 'Recoger en tienda'}
                      </div>

                      <div className="space-y-1.5 mb-4 border-l-2 border-[#E0E0E0] pl-3 py-1">
                        {order.items.map((item: any, j: number) => (
                          <div key={j} className="text-[11px] font-inter text-[#4A4A4A] flex justify-between">
                            <span className="truncate max-w-[120px]">{item.medication?.name}</span>
                            <span className="font-bold text-[#0E8C5E]">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#FAFAFA]">
                        <span className="font-nunito font-extrabold text-sm text-[#4A4A4A]">C${order.totalAmount}</span>
                        
                        {col.id === 'pending' && (
                          <OasisButton size="sm" className="h-7 px-3 text-[10px]" onClick={() => moveOrder(order.id, 'preparing')}>
                            Preparar
                          </OasisButton>
                        )}
                        {col.id === 'preparing' && (
                          <OasisButton size="sm" className="h-7 px-3 text-[10px] bg-[#0077B6]" onClick={() => moveOrder(order.id, 'ready')}>
                            Listo
                          </OasisButton>
                        )}
                        {col.id === 'ready' && order.deliveryType === 'delivery' && order.status !== 'delivering' && (
                           <OasisButton size="sm" className="h-7 px-3 text-[10px] bg-[#F4A261]" onClick={() => moveOrder(order.id, 'delivering')}>
                              Enviar
                           </OasisButton>
                        )}
                        {(order.status === 'ready' || order.status === 'delivering') && (
                           <OasisButton size="sm" className="h-7 px-3 text-[10px]" onClick={() => moveOrder(order.id, 'delivered')}>
                              Entregado
                           </OasisButton>
                        )}
                      </div>
                    </OasisCard>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
