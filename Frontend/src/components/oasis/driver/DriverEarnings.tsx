'use client'

import { ArrowLeft, TrendingUp, Calendar } from 'lucide-react'
import { OasisCard } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'

const weeklyEarnings = [
  { day: 'Lun', amount: 320 },
  { day: 'Mar', amount: 450 },
  { day: 'Mié', amount: 280 },
  { day: 'Jue', amount: 510 },
  { day: 'Vie', amount: 390 },
  { day: 'Sáb', amount: 480 },
  { day: 'Dom', amount: 200 },
]

const recentDeliveries = [
  { id: '#0010', amount: 65, time: 'Hoy 08:45 AM' },
  { id: '#0009', amount: 80, time: 'Hoy 07:30 AM' },
  { id: '#0008', amount: 55, time: 'Ayer 05:15 PM' },
  { id: '#0007', amount: 70, time: 'Ayer 03:00 PM' },
]

export default function DriverEarnings() {
  const { navigate } = useNavigation()
  const total = weeklyEarnings.reduce((s, d) => s + d.amount, 0)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-[10px] border-b border-[#E0E0E0]/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('driver-main')}><ArrowLeft size={20} className="text-[#4A4A4A]" /></button>
          <h1 className="font-nunito font-bold text-lg text-[#4A4A4A]">Ganancias</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Total card */}
        <div className="oasis-gradient rounded-[20px] p-6 text-white">
          <div className="font-inter text-sm opacity-80 mb-1">Balance Total</div>
          <div className="font-nunito font-bold text-3xl mb-2">C${total.toLocaleString()}</div>
          <div className="flex items-center gap-2 text-sm font-inter opacity-80">
            <TrendingUp size={14} />
            +18% vs semana anterior
          </div>
        </div>

        {/* Weekly chart */}
        <OasisCard>
          <h3 className="font-nunito font-bold text-base text-[#4A4A4A] mb-4">Ingresos Semanales</h3>
          <div className="flex items-end gap-2 h-32">
            {weeklyEarnings.map((d, i) => {
              const maxVal = Math.max(...weeklyEarnings.map(w => w.amount))
              const h = (d.amount / maxVal) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative" style={{ height: '100px' }}>
                    <div className="absolute bottom-0 w-full rounded-t-[8px] oasis-gradient" style={{ height: `${h}%` }} />
                  </div>
                  <span className="text-[9px] font-inter text-[#8A8A8A]">{d.day}</span>
                </div>
              )
            })}
          </div>
        </OasisCard>

        {/* Recent deliveries */}
        <OasisCard>
          <h3 className="font-nunito font-bold text-base text-[#4A4A4A] mb-3">Entregas Recientes</h3>
          <div className="space-y-2">
            {recentDeliveries.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#FAFAFA]">
                <div>
                  <div className="font-inter font-semibold text-sm text-[#4A4A4A]">{d.id}</div>
                  <div className="font-inter text-xs text-[#8A8A8A]">{d.time}</div>
                </div>
                <div className="font-nunito font-bold text-sm text-[#0E8C5E]">+C${d.amount}</div>
              </div>
            ))}
          </div>
        </OasisCard>
      </div>
    </div>
  )
}
