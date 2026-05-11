'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { OasisCard, OasisButton, DropLoader, EmptyState } from '@/components/oasis/shared/shared-components'
import { Clock, Pill, RefreshCw, Bell } from 'lucide-react'

export default function PatientReminders() {
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refilling, setRefilling] = useState<string | null>(null)

  useEffect(() => { loadReminders() }, [])

  async function loadReminders() {
    setLoading(true)
    const res = await api.get('/patient/refill-reminders')
    if (res.success && (res as any).data) setReminders(Array.isArray((res as any).data) ? (res as any).data : [])
    setLoading(false)
  }

  async function requestRefill(prescriptionId: string) {
    setRefilling(prescriptionId)
    await api.post(`/patient/prescriptions/${prescriptionId}/request-refill`, { notes: 'Solicitado desde recordatorios' })
    loadReminders()
    setRefilling(null)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div><h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Recordatorios</h1><p className="font-inter text-sm text-[#8A8A8A]">Recordatorios de recarga de medicamentos</p></div>
      {reminders.length === 0 ? <EmptyState message="No tienes recordatorios pendientes" /> : (
        <div className="space-y-3">
          {reminders.map((r: any, i: number) => (
            <OasisCard key={r.id || i} hover={false} className="py-3 px-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFF3E0] flex items-center justify-center"><Bell size={20} className="text-[#F4A261]" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter font-semibold text-sm text-[#4A4A4A]">{r.prescription?.items?.[0]?.medication?.name || 'Medicamento'}</p>
                  <p className="font-inter text-xs text-[#8A8A8A]">Receta del {r.prescription?.date ? new Date(r.prescription.date).toLocaleDateString('es-NI') : '-'}</p>
                </div>
                {r.prescriptionId && (
                  <OasisButton variant="outline" size="sm" onClick={() => requestRefill(r.prescriptionId)} disabled={refilling === r.prescriptionId}>
                    <RefreshCw size={14} /> {refilling === r.prescriptionId ? '...' : 'Solicitar Recarga'}
                  </OasisButton>
                )}
              </div>
            </OasisCard>
          ))}
        </div>
      )}
    </div>
  )
}
