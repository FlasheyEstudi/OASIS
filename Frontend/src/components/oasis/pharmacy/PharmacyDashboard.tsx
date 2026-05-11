'use client'

import { useState, useEffect } from 'react'
import { LayoutDashboard, ShoppingBag, Package, AlertTriangle, TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react'
import { OasisCard, OasisButton, DropLoader, ErrorState, EmptyState } from '../shared/shared-components'
import { api } from '@/lib/api-client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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
        // Normalize chart data to ensure 7 days even if empty
        const normalizedChart = res.data.chartData || []
        setData({ ...res.data, chartData: normalizedChart })
      } else {
        setError(res.message || 'Error al cargar datos')
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="p-6 space-y-6">
       <div className="flex justify-between items-center"><div className="h-8 w-48 bg-gray-100 animate-pulse rounded-lg" /><div className="h-8 w-24 bg-gray-100 animate-pulse rounded-lg" /></div>
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />)}
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-100 animate-pulse rounded-2xl" />
          <div className="lg:col-span-2 h-64 bg-gray-100 animate-pulse rounded-2xl" />
       </div>
    </div>
  )
  if (error) return <ErrorState message={error} onRetry={loadDashboard} />
  if (!data) return <EmptyState message="No hay datos disponibles" />

  const metrics = [
    { title: 'Ventas de Hoy', value: `C$${data.metrics.todayTotal.toLocaleString()}`, icon: TrendingUp, color: '#0E8C5E', trend: `${data.metrics.todayCount} pedidos`, isPositive: true },
    { title: 'Pedidos Pendientes', value: data.metrics.pendingOrders, icon: Clock, color: '#F4A261', trend: 'Por procesar', isPositive: true },
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
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${m.color}15` }}>
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
            <h3 className="font-nunito font-bold text-[#4A4A4A]">Alertas Prioritarias</h3>
            <span className="capsule px-2 py-0.5 text-[10px] font-bold bg-[#FEE2E2] text-[#EF4444]">ACCIÓN REQUERIDA</span>
          </div>
          <div className="space-y-3">
            {data.alerts.length === 0 ? (
              <div className="py-8 text-center">
                 <div className="w-12 h-12 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-2"><CheckCircle className="text-[#0E8C5E]" size={20} /></div>
                 <p className="text-xs text-[#8A8A8A]">Todo en orden por ahora</p>
              </div>
            ) : (
              data.alerts.map((alert: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-[16px] bg-[#FAFAFA] border border-[#E0E0E0]/50 hover:border-[#0E8C5E]/30 transition-all">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${alert.severity === 'high' ? 'bg-[#FEE2E2] text-[#EF4444]' : 'bg-[#FFF3E0] text-[#F4A261]'}`}>
                    <AlertTriangle size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-[11px] text-[#4A4A4A] font-bold truncate">{alert.message}</p>
                    <p className="font-inter text-[9px] text-[#8A8A8A] uppercase tracking-wider">Stock Crítico</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </OasisCard>

        {/* Weekly Activity (Curved Area Chart) */}
        <OasisCard className="lg:col-span-2">
           <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-nunito font-bold text-[#4A4A4A]">Ventas Semanales</h3>
                <p className="text-[10px] text-[#8A8A8A] font-inter">Tendencia de ingresos en Córdobas</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#0E8C5E]" />
                  <span className="text-[10px] font-inter text-[#8A8A8A]">Ingresos</span>
                </div>
              </div>
           </div>
           
           <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0E8C5E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0E8C5E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#8A8A8A' }} 
                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8A8A8A' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px', fontFamily: 'Inter' }}
                    formatter={(value: any) => [`C$${value}`, 'Ventas']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#0E8C5E" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </OasisCard>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OasisCard className="flex items-center justify-between p-6 cursor-pointer hover:shadow-xl transition-all border-l-4 border-l-[#0E8C5E]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#E8F5EE] flex items-center justify-center shadow-inner">
              <ShoppingBag className="text-[#0E8C5E]" />
            </div>
            <div>
              <h4 className="font-nunito font-bold text-[#4A4A4A]">Punto de Venta</h4>
              <p className="font-inter text-xs text-[#8A8A8A]">Nueva venta rápida</p>
            </div>
          </div>
          <OasisButton variant="ghost" size="sm">Abrir POS</OasisButton>
        </OasisCard>

        <OasisCard className="flex items-center justify-between p-6 cursor-pointer hover:shadow-xl transition-all border-l-4 border-l-[#0077B6]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#E0F2FF] flex items-center justify-center shadow-inner">
              <Package className="text-[#0077B6]" />
            </div>
            <div>
              <h4 className="font-nunito font-bold text-[#4A4A4A]">Gestión de Stock</h4>
              <p className="font-inter text-xs text-[#8A8A8A]">Revisar inventario completo</p>
            </div>
          </div>
          <OasisButton variant="ghost" size="sm">Ver Stock</OasisButton>
        </OasisCard>
      </div>
    </div>
  )
}
