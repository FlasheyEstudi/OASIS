'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, DropLoader, ErrorState } from '@/components/oasis/shared/shared-components'
import { BarChart3, DollarSign, Package, TrendingUp } from 'lucide-react'

export default function PharmacyReports() {
  const { roleProfile } = useAuthStore()
  const pharmacyId = roleProfile?.pharmacyId
  const [tab, setTab] = useState<'sales' | 'stock' | 'customers'>('sales')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  useEffect(() => { loadData() }, [tab, from, to])

  async function loadData() {
    setLoading(true)
    const res = await api.get('/pharmacy/reports', { type: tab, from: from || undefined, to: to || undefined })
    if (res.success && (res as any).data) setData((res as any).data)
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div><h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Reportes</h1><p className="font-inter text-sm text-[#8A8A8A]">Análisis de ventas y métricas</p></div>

      <div className="flex gap-2 flex-wrap">
        {[{ key: 'sales', label: 'Ventas', icon: DollarSign }, { key: 'stock', label: 'Inventario', icon: Package }, { key: 'customers', label: 'Clientes', icon: TrendingUp }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`capsule px-4 py-2 font-inter font-semibold text-sm transition-all ${tab === t.key ? 'oasis-gradient text-white shadow-md' : 'bg-[#E8F5EE] text-[#0E8C5E]'}`}>
            <t.icon size={16} className="inline mr-1.5" />{t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <div><label className="font-inter text-xs text-[#8A8A8A]">Desde</label><input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input-oasis border border-[#E0E0E0] px-3 py-1.5 text-sm font-inter focus:border-[#0E8C5E] focus:outline-none" /></div>
        <div><label className="font-inter text-xs text-[#8A8A8A]">Hasta</label><input type="date" value={to} onChange={e => setTo(e.target.value)} className="input-oasis border border-[#E0E0E0] px-3 py-1.5 text-sm font-inter focus:border-[#0E8C5E] focus:outline-none" /></div>
      </div>

      {tab === 'sales' && data?.summary && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <OasisCard hover={false}><div className="text-center"><p className="font-nunito font-bold text-2xl text-[#0E8C5E]">C${data.summary.totalSales?.toLocaleString() || 0}</p><p className="font-inter text-xs text-[#8A8A8A]">Ventas Totales</p></div></OasisCard>
            <OasisCard hover={false}><div className="text-center"><p className="font-nunito font-bold text-2xl text-[#0077B6]">{data.summary.totalItems || 0}</p><p className="font-inter text-xs text-[#8A8A8A]">Items Vendidos</p></div></OasisCard>
            <OasisCard hover={false}><div className="text-center"><p className="font-nunito font-bold text-2xl text-[#F4A261]">C${data.summary.averageTicket?.toLocaleString() || 0}</p><p className="font-inter text-xs text-[#8A8A8A]">Ticket Promedio</p></div></OasisCard>
          </div>
          {data.groups?.length > 0 && (
            <OasisCard hover={false}>
              <h3 className="font-nunito font-bold text-[#4A4A4A] mb-3">Detalle por Grupo</h3>
              <div className="space-y-2">{data.groups.map((g: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-2 rounded-[10px] hover:bg-[#E8F5EE]/30">
                  <span className="font-inter text-sm text-[#4A4A4A]">{g.name || g._id || 'Grupo'}</span>
                  <span className="font-inter font-semibold text-sm text-[#0E8C5E]">C${g.total?.toLocaleString() || g.totalSales?.toLocaleString() || 0}</span>
                </div>
              ))}</div>
            </OasisCard>
          )}
        </>
      )}

      {tab === 'stock' && data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <OasisCard hover={false}><div className="text-center"><p className="font-nunito font-bold text-2xl text-[#0E8C5E]">C${data.totalCostValue?.toLocaleString() || 0}</p><p className="font-inter text-xs text-[#8A8A8A]">Valor Costo</p></div></OasisCard>
          <OasisCard hover={false}><div className="text-center"><p className="font-nunito font-bold text-2xl text-[#0077B6]">C${data.totalSellingValue?.toLocaleString() || 0}</p><p className="font-inter text-xs text-[#8A8A8A]">Valor Venta</p></div></OasisCard>
          <OasisCard hover={false}><div className="text-center"><p className="font-nunito font-bold text-2xl text-[#F4A261]">C${data.potentialProfit?.toLocaleString() || 0}</p><p className="font-inter text-xs text-[#8A8A8A]">Ganancia Potencial</p></div></OasisCard>
          <OasisCard hover={false}><div className="text-center"><p className="font-nunito font-bold text-2xl text-[#EF4444]">{data.lowStockItems || 0}</p><p className="font-inter text-xs text-[#8A8A8A]">Stock Bajo</p></div></OasisCard>
        </div>
      )}

      {tab === 'customers' && data && Array.isArray(data) && (
        <OasisCard hover={false}>
          <h3 className="font-nunito font-bold text-[#4A4A4A] mb-3">Top Clientes</h3>
          <div className="space-y-2">{data.map((c: any, i: number) => (
            <div key={i} className="flex justify-between items-center p-2 rounded-[10px] hover:bg-[#E8F5EE]/30">
              <div><span className="font-inter font-semibold text-sm text-[#4A4A4A]">{c.user?.name || c.name || 'Cliente'}</span><span className="font-inter text-xs text-[#8A8A8A] ml-2">{c.totalOrders || 0} pedidos</span></div>
              <span className="font-inter font-semibold text-sm text-[#0E8C5E]">C${c.totalSpent?.toLocaleString() || 0}</span>
            </div>
          ))}</div>
        </OasisCard>
      )}
    </div>
  )
}
