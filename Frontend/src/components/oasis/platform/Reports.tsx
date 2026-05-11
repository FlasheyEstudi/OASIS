'use client'

import { OasisCard } from '../shared/shared-components'
import { TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react'

const monthlyData = [
  { month: 'Ago', income: 380000, expenses: 210000 },
  { month: 'Sep', income: 420000, expenses: 230000 },
  { month: 'Oct', income: 395000, expenses: 220000 },
  { month: 'Nov', income: 480000, expenses: 250000 },
  { month: 'Dic', income: 510000, expenses: 260000 },
  { month: 'Ene', income: 524800, expenses: 275000 },
]

export default function Reports() {
  const totalBilled = 2714800
  const totalCollected = 2380000
  const pending = totalBilled - totalCollected

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div>
        <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Reportes Financieros</h1>
        <p className="font-inter text-sm text-[#8A8A8A]">Resumen de ingresos y gastos</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <OasisCard className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#E8F5EE] flex items-center justify-center">
              <DollarSign size={16} className="text-[#0E8C5E]" />
            </div>
            <span className="font-inter text-xs text-[#8A8A8A]">Total Facturado</span>
          </div>
          <div className="font-nunito font-bold text-lg md:text-xl text-[#4A4A4A]">C${(totalBilled / 1000).toFixed(0)}K</div>
        </OasisCard>
        <OasisCard className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#E8F5EE] flex items-center justify-center">
              <TrendingUp size={16} className="text-[#0E8C5E]" />
            </div>
            <span className="font-inter text-xs text-[#8A8A8A]">Cobrado</span>
          </div>
          <div className="font-nunito font-bold text-lg md:text-xl text-[#0E8C5E]">C${(totalCollected / 1000).toFixed(0)}K</div>
        </OasisCard>
        <OasisCard className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#FFF3E0] flex items-center justify-center">
              <TrendingDown size={16} className="text-[#F4A261]" />
            </div>
            <span className="font-inter text-xs text-[#8A8A8A]">Pendiente</span>
          </div>
          <div className="font-nunito font-bold text-lg md:text-xl text-[#F4A261]">C${(pending / 1000).toFixed(0)}K</div>
        </OasisCard>
      </div>

      {/* Chart */}
      <OasisCard>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-nunito font-bold text-base text-[#4A4A4A]">Tendencia Mensual</h3>
          <select className="text-xs font-inter border border-[#E0E0E0] rounded-full px-3 py-1 focus:outline-none">
            <option>Últimos 6 meses</option>
            <option>Último año</option>
          </select>
        </div>
        <div className="flex items-end gap-3 h-48">
          {monthlyData.map((d, i) => {
            const maxVal = Math.max(...monthlyData.map(m => m.income))
            const incomeH = (d.income / maxVal) * 100
            const expenseH = (d.expenses / maxVal) * 100
            return (
              <div key={i} className="flex-1 flex items-end gap-1 justify-center">
                <div className="w-5 rounded-t-[8px] oasis-gradient transition-all" style={{ height: `${incomeH}%` }} />
                <div className="w-5 rounded-t-[8px] bg-[#E0E0E0] transition-all" style={{ height: `${expenseH}%` }} />
                <span className="absolute -bottom-5 text-[9px] font-inter text-[#8A8A8A]">{d.month}</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-center gap-6 mt-8">
          <div className="flex items-center gap-2 text-xs font-inter"><div className="w-3 h-3 rounded oasis-gradient" /> Ingresos</div>
          <div className="flex items-center gap-2 text-xs font-inter"><div className="w-3 h-3 rounded bg-[#E0E0E0]" /> Gastos</div>
        </div>
      </OasisCard>

      {/* Detail table */}
      <OasisCard>
        <h3 className="font-nunito font-bold text-base text-[#4A4A4A] mb-4">Detalle por Doctor</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E0E0E0]">
                <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-4 py-2">Doctor</th>
                <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-4 py-2">Consultas</th>
                <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-4 py-2">Ingresos</th>
                <th className="text-left font-inter font-semibold text-xs text-[#8A8A8A] px-4 py-2">Cobrado</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Dr. Carlos Ruiz', consults: 86, income: 'C$215,000', collected: 'C$198,000' },
                { name: 'Dra. María Martínez', consults: 64, income: 'C$180,000', collected: 'C$165,000' },
                { name: 'Dr. Luis Hernández', consults: 42, income: 'C$129,800', collected: 'C$110,000' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-[#E0E0E0]/50 hover:bg-[#E8F5EE]/20 transition-colors">
                  <td className="px-4 py-3 font-inter font-medium text-sm text-[#4A4A4A]">{row.name}</td>
                  <td className="px-4 py-3 font-inter text-sm text-[#8A8A8A]">{row.consults}</td>
                  <td className="px-4 py-3 font-inter text-sm text-[#4A4A4A]">{row.income}</td>
                  <td className="px-4 py-3 font-inter text-sm text-[#0E8C5E]">{row.collected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </OasisCard>
    </div>
  )
}
