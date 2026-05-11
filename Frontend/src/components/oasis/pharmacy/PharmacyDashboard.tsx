'use client'

import { useState, useEffect } from 'react'
import { LayoutDashboard, ShoppingBag, Package, AlertTriangle, TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react'
import { OasisCard, OasisButton, DropLoader, ErrorState, EmptyState } from '../shared/shared-components'
import { api } from '@/lib/api-client'

export default function PharmacyDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/pharmacy/dashboard')
      if (res.success && res.data) {
        setData(res.data)
      } else {
        setError(res.message || 'Error al cargar datos')
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><DropLoader size={48} /></div>
  if (error) return <ErrorState message={error} onRetry={loadDashboard} />
  if (!data) return <EmptyState message="No hay datos disponibles" />

  const metrics = [
    { title: 'Ventas de Hoy', value: `C$${data.metrics.todayTotal.toLocaleString()}`, icon: TrendingUp, color: '#0E8C5E', trend: '+12%', isPositive: true },
    { title: 'Pedidos Pendientes', value: data.metrics.pendingOrders, icon: Clock, color: '#F4A261', trend: 'Hoy', isPositive: true },
    { title: 'Stock Bajo', value: data.metrics.lowStockCount, icon: AlertTriangle, color: '#EF4444', trend: 'Crítico', isPositive: false },
    { title: 'Por Vencer (30d)', value: data.metrics.expiringSoonCount, icon: Package, color: '#0077B6', trend: 'Atención', isPositive: false },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Dashboard de Farmacia</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Resumen operativo en tiempo real</p>
        </div>
        <OasisButton variant="outline" size="sm" onClick={loadDashboard}>
          Actualizar
        </OasisButton>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <OasisCard key={i} className="relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-inter text-xs text-[#8A8A8A] mb-1">{m.title}</p>
                <h3 className="font-nunito font-bold text-2xl text-[#4A4A4A]">{m.value}</h3>
                <div className={`mt-2 flex items-center gap-1 text-[10px] font-inter font-bold uppercase ${m.isPositive ? 'text-[#0E8C5E]' : 'text-[#EF4444]'}`}>
                   {m.trend}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${m.color}15` }}>
                <m.icon size={20} style={{ color: m.color }} />
              </div>
            </div>
            {/* Background Accent */}
            <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full transition-all duration-500 group-hover:scale-110" style={{ backgroundColor: `${m.color}05` }} />
          </OasisCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Section */}
        <OasisCard className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-nunito font-bold text-[#4A4A4A]">Alertas de Stock</h3>
            <span className="capsule px-2 py-0.5 text-[10px] font-bold bg-[#FEE2E2] text-[#EF4444]">CRÍTICO</span>
          </div>
          <div className="space-y-3">
            {data.alerts.length === 0 ? (
              <p className="text-center py-8 text-xs text-[#8A8A8A]">Todo en orden por ahora</p>
            ) : (
              data.alerts.map((alert: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-[14px] bg-[#FAFAFA] border border-[#E0E0E0]/50 hover:border-[#0E8C5E]/30 transition-all">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${alert.severity === 'high' ? 'bg-[#FEE2E2] text-[#EF4444]' : 'bg-[#FFF3E0] text-[#F4A261]'}`}>
                    <AlertTriangle size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-xs text-[#4A4A4A] font-semibold truncate">{alert.message}</p>
                    <p className="font-inter text-[10px] text-[#8A8A8A]">Acción sugerida: Reponer lote</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </OasisCard>

        {/* Weekly Activity (Placeholder for Chart) */}
        <OasisCard className="lg:col-span-2">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-nunito font-bold text-[#4A4A4A]">Rendimiento Semanal</h3>
              <select className="bg-transparent font-inter text-xs text-[#8A8A8A] focus:outline-none cursor-pointer">
                <option>Últimos 7 días</option>
                <option>Últimos 30 días</option>
              </select>
           </div>
           
           <div className="h-[200px] w-full flex items-end justify-between px-2">
              {data.chartData.map((d: any, i: number) => (
                <div key={i} className="flex flex-col items-center gap-2 group">
                  <div 
                    className="w-8 sm:w-12 bg-[#0E8C5E]/20 rounded-t-lg transition-all duration-500 hover:bg-[#0E8C5E] cursor-help relative" 
                    style={{ height: `${(d.amount / Math.max(...data.chartData.map((x: any) => x.amount || 1))) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#4A4A4A] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      C${d.amount}
                    </div>
                  </div>
                  <span className="text-[10px] font-inter text-[#8A8A8A]">{d.date.slice(5)}</span>
                </div>
              ))}
           </div>
        </OasisCard>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OasisCard className="flex items-center justify-between p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-[#0E8C5E]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#E8F5EE] flex items-center justify-center">
              <ShoppingBag className="text-[#0E8C5E]" />
            </div>
            <div>
              <h4 className="font-nunito font-bold text-[#4A4A4A]">Punto de Venta</h4>
              <p className="font-inter text-xs text-[#8A8A8A]">Nueva venta rápida</p>
            </div>
          </div>
          <OasisButton variant="ghost" size="sm">Ir ahora</OasisButton>
        </OasisCard>

        <OasisCard className="flex items-center justify-between p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-[#0077B6]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#E0F2FF] flex items-center justify-center">
              <Package className="text-[#0077B6]" />
            </div>
            <div>
              <h4 className="font-nunito font-bold text-[#4A4A4A]">Gestión de Stock</h4>
              <p className="font-inter text-xs text-[#8A8A8A]">Revisar inventario completo</p>
            </div>
          </div>
          <OasisButton variant="ghost" size="sm">Ir ahora</OasisButton>
        </OasisCard>
      </div>
    </div>
  )
}
