'use client'

import React, { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, DropLoader, ErrorState, OasisButton } from '@/components/oasis/shared/shared-components'
import { DollarSign, Package, TrendingUp } from 'lucide-react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend
} from 'recharts'
import { Calendar, Download, Filter, FileSpreadsheet, FileText, ChevronRight } from 'lucide-react'

export default function PharmacyReports() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState<'sales' | 'stock' | 'customers'>('sales')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0])
  const [to, setTo] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => { loadData() }, [tab, from, to])

  async function loadData() {
    setLoading(true)
    try {
      const res = await api.get('/pharmacy/reports', { type: tab, from, to })
      if (res.success) setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = (format: 'pdf' | 'excel') => {
     alert(`Exportando reporte en formato ${format.toUpperCase()}...`)
  }

  if (loading && !data) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-8 pb-24 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Reportes de Farmacia</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Análisis avanzado de operaciones y finanzas</p>
        </div>
        <div className="flex items-center gap-2">
           <OasisButton variant="outline" size="sm" onClick={() => exportReport('excel')}>
              <FileSpreadsheet size={16} className="mr-1.5" /> Excel
           </OasisButton>
           <OasisButton variant="outline" size="sm" onClick={() => exportReport('pdf')}>
              <FileText size={16} className="mr-1.5" /> PDF
           </OasisButton>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex gap-1 bg-[#FAFAFA] p-1 rounded-2xl border border-[#F0F0F0]">
          {[
            { key: 'sales', label: 'Ventas', icon: DollarSign },
            { key: 'stock', label: 'Inventario', icon: Package },
            { key: 'customers', label: 'Pacientes', icon: TrendingUp }
          ].map(t => (
            <button 
              key={t.key} 
              onClick={() => setTab(t.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-inter font-bold text-xs transition-all ${tab === t.key ? 'oasis-gradient text-white shadow-lg shadow-[#0E8C5E]/20' : 'text-[#8A8A8A] hover:bg-[#E8F5EE] hover:text-[#0E8C5E]'}`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>
        
        <div className="flex-1 flex gap-3 md:justify-end">
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-[#8A8A8A] uppercase ml-1">Desde</label>
             <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
                <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input-oasis border-2 border-[#F0F0F0] pl-9 pr-3 py-2 text-xs font-bold" />
             </div>
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-[#8A8A8A] uppercase ml-1">Hasta</label>
             <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
                <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input-oasis border-2 border-[#F0F0F0] pl-9 pr-3 py-2 text-xs font-bold" />
             </div>
          </div>
        </div>
      </div>

      {loading && data ? (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-3xl"><DropLoader size={40} /></div>
      ) : null}

      {tab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <OasisCard className="!p-6 border-l-4 border-l-[#0E8C5E]">
               <p className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest mb-1">Ingresos Totales</p>
               <h3 className="font-nunito font-black text-3xl text-[#4A4A4A]">C${data?.summary?.totalSales?.toLocaleString() || 0}</h3>
               <div className="flex items-center gap-1 mt-2 text-[#0E8C5E] text-[10px] font-bold">
                  <TrendingUp size={12} /> +12% vs periodo anterior
               </div>
            </OasisCard>
            <OasisCard className="!p-6 border-l-4 border-l-[#0077B6]">
               <p className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest mb-1">Ordenes Completadas</p>
               <h3 className="font-nunito font-black text-3xl text-[#4A4A4A]">{data?.summary?.totalOrders || 0}</h3>
               <p className="text-[10px] text-[#8A8A8A] font-inter mt-2">Ticket promedio: C${data?.summary?.averageTicket?.toFixed(2)}</p>
            </OasisCard>
            <OasisCard className="!p-6 border-l-4 border-l-[#F4A261]">
               <p className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest mb-1">Margen de Ganancia</p>
               <h3 className="font-nunito font-black text-3xl text-[#4A4A4A]">32.4%</h3>
               <div className="w-full bg-[#FAFAFA] h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-[#F4A261] h-full" style={{ width: '32.4%' }} />
               </div>
            </OasisCard>
          </div>

          <OasisCard className="!p-6 h-[400px]">
             <h3 className="font-nunito font-bold text-[#4A4A4A] mb-6">Tendencia de Ventas Diarias</h3>
             <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={data?.dailyTrends || []}>
                   <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#0E8C5E" stopOpacity={0.1}/>
                         <stop offset="95%" stopColor="#0E8C5E" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                   <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8A8A8A' }} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8A8A8A' }} />
                   <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                     labelStyle={{ fontWeight: 'bold', fontFamily: 'Nunito' }}
                   />
                   <Area type="monotone" dataKey="total" stroke="#0E8C5E" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
             </ResponsiveContainer>
          </OasisCard>
        </div>
      )}

      {tab === 'stock' && (
        <div className="grid lg:grid-cols-2 gap-6">
           <OasisCard className="!p-6">
              <h3 className="font-nunito font-bold text-[#4A4A4A] mb-6">Valoración de Inventario</h3>
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <div>
                       <p className="text-[10px] font-bold text-[#8A8A8A] uppercase">Valor a Precio Costo</p>
                       <p className="font-nunito font-black text-2xl text-[#4A4A4A]">C${data?.totalCostValue?.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-[#8A8A8A] uppercase">Valor a Precio Venta</p>
                       <p className="font-nunito font-black text-2xl text-[#0E8C5E]">C${data?.totalSellingValue?.toLocaleString()}</p>
                    </div>
                 </div>
                 <div className="p-4 rounded-2xl bg-[#E8F5EE] border border-[#0E8C5E]/10">
                    <p className="text-xs font-inter text-[#4A4A4A]">Ganancia Potencial Estimada</p>
                    <p className="font-nunito font-black text-3xl text-[#0E8C5E] mt-1">C${data?.potentialProfit?.toLocaleString()}</p>
                 </div>
              </div>
           </OasisCard>

           <OasisCard className="!p-6">
              <h3 className="font-nunito font-bold text-[#4A4A4A] mb-6">Categorías más Rentables</h3>
              <ResponsiveContainer width="100%" height={250}>
                 <BarChart data={data?.categoryProfit || [
                    { name: 'Antibióticos', profit: 45000 },
                    { name: 'Vitaminas', profit: 32000 },
                    { name: 'Analgésicos', profit: 28000 },
                    { name: 'Gastro', profit: 15000 }
                 ]}>
                    <XAxis dataKey="name" hide />
                    <Tooltip cursor={{ fill: '#E8F5EE' }} contentStyle={{ borderRadius: '12px' }} />
                    <Bar dataKey="profit" radius={[8, 8, 0, 0]}>
                       { (data?.categoryProfit || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={['#0E8C5E', '#0077B6', '#F4A261', '#EF4444'][index % 4]} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </OasisCard>
        </div>
      )}

      {tab === 'customers' && (
        <OasisCard className="!p-0 overflow-hidden">
           <div className="p-6 border-b border-[#F0F0F0] flex items-center justify-between">
              <h3 className="font-nunito font-bold text-[#4A4A4A]">Pacientes con Mayor Frecuencia</h3>
              <span className="text-[10px] font-bold text-[#8A8A8A] uppercase">{data?.length || 0} PACIENTES</span>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-[#FAFAFA] border-b border-[#F0F0F0]">
                    <tr>
                       <th className="px-6 py-4 text-[10px] font-bold text-[#8A8A8A] uppercase">Paciente</th>
                       <th className="px-6 py-4 text-[10px] font-bold text-[#8A8A8A] uppercase">Visitas</th>
                       <th className="px-6 py-4 text-[10px] font-bold text-[#8A8A8A] uppercase">Gasto Total</th>
                       <th className="px-6 py-4 text-[10px] font-bold text-[#8A8A8A] uppercase">Ticket Promedio</th>
                       <th className="px-6 py-4 text-[10px] font-bold text-[#8A8A8A] uppercase"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-[#F0F0F0]">
                    {(data || []).map((c: any, i: number) => (
                       <tr key={i} className="hover:bg-[#E8F5EE]/20 transition-colors">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#E8F5EE] flex items-center justify-center font-nunito font-bold text-[#0E8C5E] text-xs">
                                   {c.user?.name?.slice(0,2).toUpperCase()}
                                </div>
                                <span className="font-inter font-bold text-sm text-[#4A4A4A]">{c.user?.name}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 font-inter text-sm text-[#4A4A4A]">{c.totalOrders}</td>
                          <td className="px-6 py-4 font-nunito font-bold text-sm text-[#0E8C5E]">C${c.totalSpent?.toLocaleString()}</td>
                          <td className="px-6 py-4 font-inter text-xs text-[#8A8A8A]">C${(c.totalSpent / c.totalOrders).toFixed(2)}</td>
                          <td className="px-6 py-4 text-right">
                             <button className="p-2 rounded-full hover:bg-white transition-colors text-[#8A8A8A]">
                                <ChevronRight size={16} />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </OasisCard>
      )}
    </div>
  )
}
