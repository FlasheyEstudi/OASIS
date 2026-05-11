
'use client'

import { useState, useEffect } from 'react'
import { Calendar, DollarSign, TrendingUp, Download, PieChart as PieChartIcon, BarChart3, ChevronDown } from 'lucide-react'
import { OasisCard, DropLoader, ErrorState } from '../shared/shared-components'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'

export default function Reports() {
  const { roleProfile } = useAuthStore()
  const clinicId = roleProfile?.clinicId
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [groupBy, setGroupBy] = useState<'doctor' | 'service'>('doctor')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

  useEffect(() => {
    if (clinicId) loadReport()
  }, [clinicId, groupBy])

  async function loadReport() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/clinics/${clinicId}/reports/revenue`, { 
        groupBy,
        from: dateRange.from,
        to: dateRange.to
      })
      if (res.success && res.data) {
        setData(res.data)
      }
    } catch (err) {
      setError('No pudimos cargar los reportes financieros.')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !data) return <div className="flex items-center justify-center min-h-[60vh]"><DropLoader size={48} /></div>
  if (error) return <ErrorState message={error} onRetry={loadReport} />
  if (!data) return null

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Reportes Financieros</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Análisis de ingresos y productividad</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex bg-[#E8F5EE] p-1 rounded-full">
              <button 
                onClick={() => setGroupBy('doctor')}
                className={`px-4 py-1.5 rounded-full text-xs font-inter font-semibold transition-all ${groupBy === 'doctor' ? 'bg-[#0E8C5E] text-white shadow-md' : 'text-[#0E8C5E]'}`}
              >
                Por Doctor
              </button>
              <button 
                onClick={() => setGroupBy('service')}
                className={`px-4 py-1.5 rounded-full text-xs font-inter font-semibold transition-all ${groupBy === 'service' ? 'bg-[#0E8C5E] text-white shadow-md' : 'text-[#0E8C5E]'}`}
              >
                Por Servicio
              </button>
           </div>
           <button className="p-2 bg-white border border-[#E0E0E0] rounded-full text-[#8A8A8A] hover:text-[#0E8C5E] hover:bg-[#E8F5EE] transition-all">
             <Download size={18} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OasisCard className="md:col-span-1 flex flex-col justify-between">
           <div>
              <div className="w-10 h-10 rounded-full bg-[#E8F5EE] flex items-center justify-center mb-4">
                <DollarSign size={20} className="text-[#0E8C5E]" />
              </div>
              <h3 className="font-inter text-sm text-[#8A8A8A] mb-1">Ingresos Totales (Periodo)</h3>
              <p className="font-nunito font-bold text-3xl text-[#4A4A4A]">C$ {data.totalRevenue?.toLocaleString() || 0}</p>
           </div>
           <div className="mt-6 flex items-center gap-2 text-xs font-inter text-[#0E8C5E] bg-[#E8F5EE] px-3 py-1.5 rounded-lg w-fit">
              <TrendingUp size={14} /> +12.5% vs mes anterior
           </div>
        </OasisCard>

        <OasisCard className="md:col-span-2">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-nunito font-bold text-lg text-[#4A4A4A]">Distribución de Ingresos</h3>
              <BarChart3 size={18} className="text-[#8A8A8A]" />
           </div>
           <div className="flex items-end gap-3 h-48">
              {data.summary?.map((item: any, i: number) => {
                const maxVal = Math.max(...data.summary.map((s: any) => s.total)) || 1
                const height = (item.total / maxVal) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full relative bg-[#FAFAFA] rounded-t-[14px] overflow-hidden" style={{ height: '160px' }}>
                      <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-[#0E8C5E] to-[#0077B6] rounded-t-[10px] transition-all duration-500 group-hover:opacity-80"
                        style={{ height: `${Math.max(5, height)}%` }}
                      >
                         <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#4A4A4A] text-white text-[10px] px-2 py-0.5 rounded font-bold">
                            C${item.total}
                         </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-inter text-[#8A8A8A] truncate w-full text-center">
                      {groupBy === 'doctor' ? item.doctor?.name?.split(' ')[0] : item.service?.name}
                    </span>
                  </div>
                )
              })}
           </div>
        </OasisCard>
      </div>

      <OasisCard>
        <div className="flex items-center justify-between mb-6">
           <h3 className="font-nunito font-bold text-lg text-[#4A4A4A]">Detalle por {groupBy === 'doctor' ? 'Doctor' : 'Servicio'}</h3>
           <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#8A8A8A]" />
              <span className="text-xs font-inter text-[#8A8A8A]">Últimos 30 días</span>
              <ChevronDown size={14} className="text-[#8A8A8A]" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F0F0F0] text-left">
                <th className="pb-3 text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest">{groupBy === 'doctor' ? 'Médico' : 'Servicio'}</th>
                <th className="pb-3 text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest">Atenciones</th>
                <th className="pb-3 text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest">Participación</th>
                <th className="pb-3 text-right text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest">Total Generado</th>
              </tr>
            </thead>
            <tbody>
              {data.summary?.map((item: any, i: number) => {
                const percentage = ((item.total / (data.totalRevenue || 1)) * 100).toFixed(1)
                return (
                  <tr key={i} className="border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#E8F5EE] flex items-center justify-center text-[#0E8C5E] font-bold text-xs">
                          {groupBy === 'doctor' ? item.doctor?.name?.[0] : item.service?.name?.[0]}
                        </div>
                        <span className="font-inter font-medium text-sm text-[#4A4A4A]">
                          {groupBy === 'doctor' ? item.doctor?.name : item.service?.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 font-inter text-sm text-[#4A4A4A]">{item._count || item.count || 0}</td>
                    <td className="py-4">
                       <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[#E8F5EE] rounded-full max-w-[100px] overflow-hidden">
                             <div className="h-full bg-[#0E8C5E] rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <span className="text-[10px] font-inter text-[#8A8A8A]">{percentage}%</span>
                       </div>
                    </td>
                    <td className="py-4 text-right font-nunito font-bold text-sm text-[#4A4A4A]">C$ {item.total?.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </OasisCard>
    </div>
  )
}
