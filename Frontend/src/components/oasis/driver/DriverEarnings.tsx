
'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, TrendingUp, Calendar, Loader2, Package } from 'lucide-react'
import { OasisCard, DropLoader, EmptyState, WaveSkeleton } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { api } from '@/lib/api-client'

export default function DriverEarnings() {
  const { navigate } = useNavigation()
  const [loading, setLoading] = useState(true)
  const [earningsData, setEarningsData] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    loadEarnings()
  }, [])

  async function loadEarnings() {
    setLoading(true)
    try {
      const from = new Date()
      from.setDate(from.getDate() - 7)
      const to = new Date()
      
      const [earningsRes, historyRes] = await Promise.all([
        api.get('/delivery/earnings', { 
          from: from.toISOString().split('T')[0], 
          to: to.toISOString().split('T')[0] 
        }),
        api.get('/delivery/my-deliveries')
      ])

      if (earningsRes.success) setEarningsData(earningsRes.data)
      if (historyRes.success) setHistory(historyRes.data)
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }

  const totalBalance = earningsData?.totalAmount || 0
  const dailyEarnings = earningsData?.dailyEarnings || []

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-[10px] border-b border-[#F0F0F0] px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('driver-main')} className="w-10 h-10 rounded-2xl bg-[#FAFAFA] flex items-center justify-center text-[#4A4A4A]">
             <ArrowLeft size={20} />
          </button>
          <h1 className="font-nunito font-bold text-xl text-[#4A4A4A]">Mis Ganancias</h1>
        </div>
      </div>

      {loading ? (
        <div className="p-6 space-y-6">
           <WaveSkeleton className="h-40 rounded-[32px]" />
           <WaveSkeleton className="h-60 rounded-[32px]" />
           <div className="space-y-3">
              {[1, 2, 3].map(i => <WaveSkeleton key={i} className="h-20 rounded-[20px]" />)}
           </div>
        </div>
      ) : (
        <div className="px-6 py-6 space-y-6">
          {/* Total balance card */}
          <div className="oasis-gradient rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
             <div className="relative z-10">
                <p className="font-inter text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Balance Acumulado</p>
                <h2 className="font-nunito font-bold text-4xl mb-4">C${totalBalance.toLocaleString()}</h2>
                <div className="flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                   <TrendingUp size={14} /> +12% esta semana
                </div>
             </div>
          </div>

          {/* Weekly chart */}
          <OasisCard className="p-6">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-nunito font-bold text-lg text-[#4A4A4A]">Ingresos Semanales</h3>
               <button className="text-[10px] font-bold text-[#0E8C5E] uppercase tracking-wider">Ver detalles</button>
            </div>
            
            {dailyEarnings.length === 0 ? (
               <div className="h-32 flex items-center justify-center text-[#B0B0B0] font-inter text-sm italic">
                  No hay datos para este período
               </div>
            ) : (
               <div className="flex items-end gap-3 h-40 pt-4">
                  {dailyEarnings.map((d: any, i: number) => {
                  const maxVal = Math.max(...dailyEarnings.map((w: any) => w.amount), 1)
                  const h = (d.amount / maxVal) * 100
                  return (
                     <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full relative h-32 flex items-end">
                           <div 
                              className="w-full rounded-t-xl oasis-gradient transition-all duration-500 group-hover:scale-x-110" 
                              style={{ height: `${Math.max(h, 5)}%` }} 
                           />
                           {h > 0 && (
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 bg-[#4A4A4A] text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                 C${d.amount}
                              </div>
                           )}
                        </div>
                        <span className="text-[10px] font-bold text-[#8A8A8A] uppercase">{d.day}</span>
                     </div>
                  )
                  })}
               </div>
            )}
          </OasisCard>

          {/* Recent Deliveries */}
          <div className="space-y-4">
             <h3 className="font-nunito font-bold text-lg text-[#4A4A4A] flex items-center gap-2">
                <Calendar size={20} className="text-[#0077B6]" /> Historial Reciente
             </h3>
             {history.length === 0 ? (
                <EmptyState message="Aún no has realizado entregas. ¡Acepta tu primer pedido hoy!" />
             ) : (
                <div className="space-y-3">
                   {history.filter(h => h.status === 'delivered').map((item, i) => (
                      <OasisCard key={item.id} className="p-4 flex items-center justify-between border border-[#F0F0F0]">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] flex items-center justify-center text-[#4A4A4A]">
                               <Package size={24} />
                            </div>
                            <div>
                               <p className="font-nunito font-bold text-[#4A4A4A]">#{item.id.slice(-4).toUpperCase()}</p>
                               <p className="font-inter text-xs text-[#8A8A8A]">{new Date(item.updatedAt).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="font-nunito font-bold text-[#0E8C5E]">+C$80.00</p>
                            <p className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider">Completado</p>
                         </div>
                      </OasisCard>
                   ))}
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  )
}
