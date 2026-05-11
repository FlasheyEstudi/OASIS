'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { OasisCard, DropLoader, ErrorState } from '@/components/oasis/shared/shared-components'
import { Award, TrendingUp, Gift, Star } from 'lucide-react'

export default function PatientLoyalty() {
  const [loyalty, setLoyalty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadLoyalty() }, [])

  async function loadLoyalty() {
    setLoading(true)
    const res = await api.get('/patient/loyalty')
    if (res.success && (res as any).data) setLoyalty((res as any).data)
    else setError('Error cargando programa de lealtad')
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>
  if (error) return <ErrorState message={error} onRetry={loadLoyalty} />

  const levelColors: Record<string, string> = { bronce: '#CD7F32', plata: '#C0C0C0', oro: '#FFD700', diamante: '#B9F2FF' }
  const level = loyalty?.level || 'bronce'
  const points = loyalty?.points || 0
  const nextLevel = loyalty?.nextLevel

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div><h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Lealtad</h1><p className="font-inter text-sm text-[#8A8A8A]">Puntos y beneficios</p></div>

      <OasisCard className="text-center py-8">
        <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${levelColors[level]}20` }}>
          <Award size={40} style={{ color: levelColors[level] }} />
        </div>
        <p className="font-nunito font-bold text-4xl text-[#0E8C5E]">{points.toLocaleString()}</p>
        <p className="font-inter text-sm text-[#8A8A8A] mt-1">puntos acumulados</p>
        <div className="mt-3 inline-block capsule px-4 py-1.5 font-inter font-bold text-sm" style={{ backgroundColor: `${levelColors[level]}20`, color: levelColors[level] }}>
          Nivel {level.charAt(0).toUpperCase() + level.slice(1)}
        </div>
        {nextLevel && (
          <div className="mt-4 max-w-xs mx-auto">
            <div className="flex justify-between text-xs font-inter text-[#8A8A8A] mb-1">
              <span>{level}</span><span>{nextLevel.name}</span>
            </div>
            <div className="w-full bg-[#E0E0E0] rounded-full h-2">
              <div className="oasis-gradient rounded-full h-2 transition-all" style={{ width: `${Math.min(100, (points / (nextLevel.pointsNeeded + points)) * 100)}%` }} />
            </div>
            <p className="font-inter text-xs text-[#8A8A8A] mt-1">Faltan {nextLevel.pointsNeeded} puntos para {nextLevel.name}</p>
          </div>
        )}
      </OasisCard>

      <div className="grid md:grid-cols-2 gap-4">
        <OasisCard>
          <h2 className="font-nunito font-bold text-lg text-[#4A4A4A] mb-3 flex items-center gap-2"><TrendingUp size={18} /> Estadísticas</h2>
          <div className="space-y-2">
            <div className="flex justify-between font-inter text-sm"><span className="text-[#8A8A8A]">Total pedidos</span><span className="font-semibold text-[#4A4A4A]">{loyalty?.stats?.totalOrders || 0}</span></div>
            <div className="flex justify-between font-inter text-sm"><span className="text-[#8A8A8A]">Total gastado</span><span className="font-semibold text-[#4A4A4A]">C${loyalty?.stats?.totalSpent || 0}</span></div>
            <div className="flex justify-between font-inter text-sm"><span className="text-[#8A8A8A]">Puntos ganados</span><span className="font-semibold text-[#0E8C5E]">{loyalty?.stats?.totalPointsEarned || 0}</span></div>
          </div>
        </OasisCard>

        <OasisCard>
          <h2 className="font-nunito font-bold text-lg text-[#4A4A4A] mb-3 flex items-center gap-2"><Gift size={18} /> Beneficios</h2>
          <div className="space-y-2">
            {(loyalty?.benefits || ['1 punto por cada córdoba', 'Descuentos exclusivos', 'Envío gratis en pedidos mayores a C$500']).map((b: string, i: number) => (
              <div key={i} className="flex items-center gap-2"><Star size={14} className="text-[#F4A261]" /><span className="font-inter text-sm text-[#4A4A4A]">{b}</span></div>
            ))}
          </div>
        </OasisCard>
      </div>
    </div>
  )
}
