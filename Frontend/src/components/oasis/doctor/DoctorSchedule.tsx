'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, OasisButton, DropLoader, ErrorState } from '@/components/oasis/shared/shared-components'
import { Clock4, Save, Plus, Trash2 } from 'lucide-react'

const DAYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
const DAY_LABELS: Record<string, string> = { lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado' }

interface DaySchedule { start: string; end: string; teleconsult: boolean }

export default function DoctorSchedule() {
  const { user } = useAuthStore()
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => { loadSchedule() }, [])

  async function loadSchedule() {
    if (!user?.id) return
    setLoading(true)
    const res = await api.get(`/doctors/${user.id}/schedule`)
    if (res.success && (res as any).data?.schedule) {
      try { setSchedule(typeof (res as any).data.schedule === 'string' ? JSON.parse((res as any).data.schedule) : (res as any).data.schedule) }
      catch { setSchedule({}) }
    } else {
      // Initialize empty schedule
      const empty: Record<string, DaySchedule> = {}
      DAYS.forEach(d => { empty[d] = { start: '08:00', end: '17:00', teleconsult: false } })
      setSchedule(empty)
    }
    setLoading(false)
  }

  async function saveSchedule() {
    if (!user?.id) return
    setSaving(true)
    const res = await api.put(`/doctors/${user.id}/schedule`, { schedule })
    if (res.success) { setSuccess(true); setEditing(false); setTimeout(() => setSuccess(false), 2000) }
    setSaving(false)
  }

  function updateDay(day: string, field: keyof DaySchedule, value: any) {
    setSchedule(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Mi Horario</h1><p className="font-inter text-sm text-[#8A8A8A]">Gestión de disponibilidad</p></div>
        {!editing ? <OasisButton onClick={() => setEditing(true)}><Clock4 size={16} /> Editar Horario</OasisButton>
          : <div className="flex gap-2"><OasisButton variant="ghost" onClick={() => { setEditing(false); loadSchedule() }}>Cancelar</OasisButton><OasisButton onClick={saveSchedule} disabled={saving}><Save size={16} /> {saving ? 'Guardando...' : 'Guardar'}</OasisButton></div>}
      </div>

      {success && <div className="bg-[#E8F5EE] border border-[#0E8C5E]/20 rounded-[14px] px-4 py-3 font-inter text-sm text-[#0E8C5E]">Horario actualizado exitosamente</div>}

      <div className="space-y-3">
        {DAYS.map(day => {
          const ds = schedule[day] || { start: '', end: '', teleconsult: false }
          const isWorking = ds.start && ds.end
          return (
            <OasisCard key={day} hover={false} className={`py-3 px-4 ${!isWorking ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="w-24 flex-shrink-0"><p className="font-nunito font-bold text-[#4A4A4A]">{DAY_LABELS[day]}</p></div>
                {editing ? (
                  <div className="flex items-center gap-3 flex-1 flex-wrap">
                    <input type="time" value={ds.start} onChange={e => updateDay(day, 'start', e.target.value)}
                      className="input-oasis border border-[#E0E0E0] px-3 py-1.5 text-sm font-inter focus:border-[#0E8C5E] focus:outline-none" />
                    <span className="text-[#8A8A8A]">a</span>
                    <input type="time" value={ds.end} onChange={e => updateDay(day, 'end', e.target.value)}
                      className="input-oasis border border-[#E0E0E0] px-3 py-1.5 text-sm font-inter focus:border-[#0E8C5E] focus:outline-none" />
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={ds.teleconsult} onChange={e => updateDay(day, 'teleconsult', e.target.checked)}
                        className="w-4 h-4 rounded accent-[#0E8C5E]" />
                      <span className="font-inter text-xs text-[#4A4A4A]">Teleconsulta</span>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 flex-1">
                    <span className="font-inter text-sm text-[#4A4A4A]">{isWorking ? `${ds.start} - ${ds.end}` : 'No laboral'}</span>
                    {ds.teleconsult && <span className="capsule px-2 py-0.5 text-[10px] font-inter font-semibold bg-[#E0F2FF] text-[#0077B6]">Teleconsulta</span>}
                  </div>
                )}
              </div>
            </OasisCard>
          )
        })}
      </div>
    </div>
  )
}
