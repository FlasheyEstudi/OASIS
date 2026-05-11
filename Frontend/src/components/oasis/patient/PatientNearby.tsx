'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { OasisCard, DropLoader, EmptyState } from '@/components/oasis/shared/shared-components'
import { MapPin, Pill, Building2, Star, Navigation, Stethoscope, Wifi } from 'lucide-react'

export default function PatientNearby() {
  const [tab, setTab] = useState<'pharmacies' | 'clinics'>('pharmacies')
  const [pharmacies, setPharmacies] = useState<any[]>([])
  const [clinics, setClinics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [tab])

  async function loadData() {
    setLoading(true)
    // Default coords for Managua, Nicaragua
    const lat = 12.136; const lng = -86.251
    if (tab === 'pharmacies') {
      const res = await api.get('/patient/nearby-pharmacies', { lat, lng, radius: 20 })
      if (res.success && (res as any).data) setPharmacies((res as any).data)
    } else {
      const res = await api.get('/patient/nearby-clinics', { lat, lng, radius: 20 })
      if (res.success && (res as any).data) setClinics((res as any).data)
    }
    setLoading(false)
  }

  const data = tab === 'pharmacies' ? pharmacies : clinics

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div><h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Cerca de Mí</h1><p className="font-inter text-sm text-[#8A8A8A]">Farmacias y clínicas cercanas a tu ubicación</p></div>

      <div className="flex gap-2">
        <button onClick={() => setTab('pharmacies')} className={`capsule px-4 py-2 font-inter font-semibold text-sm transition-all ${tab === 'pharmacies' ? 'oasis-gradient text-white shadow-md' : 'bg-[#E0F2FF] text-[#0077B6]'}`}>
          <Pill size={16} className="inline mr-1.5" />Farmacias
        </button>
        <button onClick={() => setTab('clinics')} className={`capsule px-4 py-2 font-inter font-semibold text-sm transition-all ${tab === 'clinics' ? 'oasis-gradient text-white shadow-md' : 'bg-[#E8F5EE] text-[#0E8C5E]'}`}>
          <Building2 size={16} className="inline mr-1.5" />Clínicas
        </button>
      </div>

      {loading ? <div className="flex justify-center py-12"><DropLoader size={40} /></div> :
        data.length === 0 ? <EmptyState message={`No se encontraron ${tab === 'pharmacies' ? 'farmacias' : 'clínicas'} cercanas`} /> : (
          <div className="space-y-3">
            {data.map((item: any) => (
              <OasisCard key={item.id} hover={false} className="py-3 px-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tab === 'pharmacies' ? 'bg-[#E0F2FF]' : 'bg-[#E8F5EE]'}`}>
                    {tab === 'pharmacies' ? <Pill size={20} className="text-[#0077B6]" /> : <Building2 size={20} className="text-[#0E8C5E]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter font-semibold text-sm text-[#4A4A4A]">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <MapPin size={12} className="text-[#8A8A8A]" />
                      <span className="font-inter text-xs text-[#8A8A8A]">{item.distance ? `${item.distance.toFixed(1)} km` : item.city || ''}</span>
                      {item.address && <span className="font-inter text-xs text-[#8A8A8A]">- {item.address}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {item.rating > 0 && <div className="flex items-center gap-1"><Star size={12} className="text-[#F4A261]" fill="#F4A261" /><span className="font-inter text-xs text-[#4A4A4A]">{item.rating.toFixed(1)}</span></div>}
                    {tab === 'pharmacies' && item.activeInventoryCount !== undefined && (
                      <p className="font-inter text-[10px] text-[#8A8A8A]">{item.activeInventoryCount} productos</p>
                    )}
                    {tab === 'clinics' && item._count?.doctors !== undefined && (
                      <p className="font-inter text-[10px] text-[#8A8A8A]">{item._count.doctors} doctores</p>
                    )}
                    {tab === 'clinics' && item.telemedicineEnabled && (
                      <span className="inline-flex items-center gap-0.5 capsule px-1.5 py-0.5 text-[9px] font-inter bg-[#E0F2FF] text-[#0077B6] mt-0.5"><Wifi size={8} />Telemedicina</span>
                    )}
                  </div>
                </div>
              </OasisCard>
            ))}
          </div>
        )
      }
    </div>
  )
}
