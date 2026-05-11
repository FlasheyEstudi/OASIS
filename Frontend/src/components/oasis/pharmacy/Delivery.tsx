'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { OasisCard, OasisIconButton, DropLoader, EmptyState, ErrorState } from '../shared/shared-components'
import { Phone, Bike, RefreshCcw } from 'lucide-react'
import { api } from '@/lib/api-client'

export default function Delivery() {
  const [deliveryInterno, setDeliveryInterno] = useState(true)
  const [deliveryExterno, setDeliveryExterno] = useState(false)
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDrivers()
  }, [])

  async function loadDrivers() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/pharmacy/delivery')
      if (res.success && res.data) {
        setDrivers(res.data)
      } else {
        setError(res.message || 'Error al cargar repartidores')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><DropLoader size={48} /></div>
  if (error) return <ErrorState message={error} onRetry={loadDrivers} />

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Logística de Entrega</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Control de repartidores y rutas</p>
        </div>
        <button onClick={loadDrivers} className="p-2 rounded-full hover:bg-[#E8F5EE] transition-colors">
          <RefreshCcw size={18} className="text-[#0E8C5E]" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Toggles */}
        <div className="lg:col-span-1 space-y-4">
          <OasisCard>
            <h3 className="font-nunito font-bold text-base text-[#4A4A4A] mb-4">Modo de Operación</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-[14px] bg-[#E8F5EE]/30">
                <div>
                  <div className="font-inter font-semibold text-sm text-[#4A4A4A]">Delivery Interno</div>
                  <div className="font-inter text-[10px] text-[#8A8A8A] uppercase font-bold">Personal Propio</div>
                </div>
                <Switch checked={deliveryInterno} onCheckedChange={setDeliveryInterno} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-[14px] bg-[#F2F2F2]">
                <div>
                  <div className="font-inter font-semibold text-sm text-[#4A4A4A]">Red Oasis</div>
                  <div className="font-inter text-[10px] text-[#8A8A8A] uppercase font-bold">Repartidores Externos</div>
                </div>
                <Switch checked={deliveryExterno} onCheckedChange={setDeliveryExterno} />
              </div>
            </div>
          </OasisCard>
        </div>

        {/* Drivers list */}
        <div className="lg:col-span-2">
          <OasisCard>
            <h3 className="font-nunito font-bold text-base text-[#4A4A4A] mb-4">Personal de Entrega</h3>
            <div className="space-y-3">
              {drivers.length === 0 ? (
                <EmptyState message="No hay repartidores disponibles en tu zona" />
              ) : (
                drivers.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-[18px] bg-[#FAFAFA] border border-[#E0E0E0]/50 hover:border-[#0E8C5E]/30 transition-all group">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#E8F5EE] flex items-center justify-center">
                      {d.user?.avatarUrl ? (
                         <img src={d.user.avatarUrl} alt={d.user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-nunito font-bold text-[#0E8C5E]">{d.user?.name?.slice(0,2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-inter font-bold text-sm text-[#4A4A4A] truncate">{d.user?.name}</div>
                      <div className="flex items-center gap-3 text-[10px] font-inter text-[#8A8A8A]">
                        <span className="flex items-center gap-1 font-bold uppercase"><Bike size={12} className="text-[#0E8C5E]" /> {d.vehicleType || 'Moto'}</span>
                        <span className="font-medium">{d.licensePlate || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="capsule px-2 py-0.5 text-[9px] font-bold bg-[#E8F5EE] text-[#0E8C5E] uppercase border border-[#0E8C5E]/20">Disponible</span>
                      <a href={`tel:${d.user?.phone}`} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#8A8A8A] hover:text-[#0E8C5E] hover:bg-[#E8F5EE] transition-all">
                        <Phone size={14} />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </OasisCard>
        </div>
      </div>
    </div>
  )
}
