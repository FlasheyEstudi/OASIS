'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, OasisButton, DropLoader, EmptyState, StatusBadge } from '@/components/oasis/shared/shared-components'
import { FileText, Plus, Search, Pen, CheckCircle, Eye } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function DoctorPrescriptions() {
  const { user } = useAuthStore()
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showDetail, setShowDetail] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [patients, setPatients] = useState<any[]>([])
  const [medications, setMedications] = useState<any[]>([])
  const [form, setForm] = useState({ patientId: '', diagnosis: '', notes: '' })
  const [items, setItems] = useState<{ medicationId: string; dosage: string; duration: string; quantity: number; instructions: string }[]>([])
  const [medSearch, setMedSearch] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadPrescriptions() }, [statusFilter])

  async function loadPrescriptions() {
    if (!user?.id) return
    setLoading(true)
    const res = await api.get('/doctor/prescriptions', { status: statusFilter || undefined, limit: 30 })
    if (res.success && (res as any).data) setPrescriptions((res as any).data)
    setLoading(false)
  }

  async function loadPatients() {
    if (!user?.id) return
    const res = await api.get(`/doctors/${user.id}/patients`, { limit: 50 })
    if (res.success && (res as any).data) setPatients((res as any).data)
  }

  async function searchMeds(q: string) {
    setMedSearch(q)
    if (q.length < 2) return
    const res = await api.get('/pharmacy/medications', { search: q, limit: 10 })
    if (res.success && (res as any).data) setMedications((res as any).data)
  }

  function addItem() { setItems([...items, { medicationId: '', dosage: '', duration: '', quantity: 1, instructions: '' }]) }
  function updateItem(i: number, field: string, value: any) { setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item)) }
  function removeItem(i: number) { setItems(items.filter((_, idx) => idx !== i)) }

  async function createPrescription() {
    setSaving(true)
    const res = await api.post('/doctor/prescriptions', { ...form, items })
    if (res.success) { setShowCreate(false); setStep(1); setForm({ patientId: '', diagnosis: '', notes: '' }); setItems([]); loadPrescriptions() }
    setSaving(false)
  }

  async function signPrescription(id: string) {
    await api.post(`/doctor/prescriptions/${id}/sign`)
    loadPrescriptions()
  }

  async function viewPrescription(id: string) {
    const res = await api.get(`/doctor/prescriptions/${id}`)
    if (res.success && (res as any).data) setShowDetail((res as any).data)
  }

  const statusMap: Record<string, any> = { active: 'active', dispensed: 'completed', expired: 'inactive', cancelled: 'cancelled' }

  if (loading && prescriptions.length === 0) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Recetas</h1><p className="font-inter text-sm text-[#8A8A8A]">Crear y gestionar recetas médicas</p></div>
        <OasisButton onClick={() => { loadPatients(); setStep(1); setShowCreate(true) }}><Plus size={16} /> Nueva Receta</OasisButton>
      </div>
      <div className="flex gap-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-3 py-2 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none">
          <option value="">Todos</option><option value="active">Activas</option><option value="dispensed">Dispensadas</option><option value="expired">Expiradas</option>
        </select>
      </div>
      {prescriptions.length === 0 ? <EmptyState message="No hay recetas" /> : (
        <div className="space-y-3">
          {prescriptions.map((rx: any) => (
            <OasisCard key={rx.id} hover={false} className="py-3 px-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center"><FileText size={20} className="text-[#0E8C5E]" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter font-semibold text-sm text-[#4A4A4A]">{rx.patient?.user?.name || 'Paciente'}</p>
                  <p className="font-inter text-xs text-[#8A8A8A]">{rx.diagnosis || 'Sin diagnóstico'} - {new Date(rx.date || rx.createdAt).toLocaleDateString('es-NI')}</p>
                </div>
                <StatusBadge status={statusMap[rx.status] || 'active'} />
                <div className="flex gap-1">
                  <button onClick={() => viewPrescription(rx.id)} className="text-[#0077B6] hover:bg-[#E0F2FF] rounded-lg p-1.5"><Eye size={16} /></button>
                  {rx.status === 'active' && !rx.digitalSignature && <OasisButton variant="success" size="sm" onClick={() => signPrescription(rx.id)}><Pen size={14} /> Firmar</OasisButton>}
                </div>
              </div>
            </OasisCard>
          ))}
        </div>
      )}

      {/* Create Prescription Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="modal-oasis max-w-lg">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Nueva Receta - Paso {step}/3</DialogTitle></DialogHeader>
          {step === 1 && (
            <div className="mt-4 space-y-4">
              <div><label className="font-inter font-medium text-sm text-[#4A4A4A]">Paciente *</label>
                <select value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1">
                  <option value="">Seleccionar</option>
                  {patients.map((p: any) => <option key={p.id} value={p.id}>{p.user?.name || p.id}</option>)}
                </select></div>
              <div><label className="font-inter font-medium text-sm text-[#4A4A4A]">Diagnóstico</label>
                <textarea value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} rows={2} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1" /></div>
              <div><label className="font-inter font-medium text-sm text-[#4A4A4A]">Notas</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1" /></div>
              <div className="flex justify-end"><OasisButton onClick={() => setStep(2)} disabled={!form.patientId}>Siguiente</OasisButton></div>
            </div>
          )}
          {step === 2 && (
            <div className="mt-4 space-y-4">
              {items.map((item, i) => (
                <div key={i} className="p-3 border border-[#E0E0E0] rounded-[14px] space-y-2 relative">
                  <button onClick={() => removeItem(i)} className="absolute top-2 right-2 text-[#8A8A8A] hover:text-[#EF4444]"><X size={14} /></button>
                  <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
                    <input value={medSearch} onChange={e => searchMeds(e.target.value)} placeholder="Buscar medicamento..."
                      className="w-full input-oasis border border-[#E0E0E0] bg-[#FAFAFA] pl-9 pr-4 py-2 font-inter text-xs focus:border-[#0E8C5E] focus:outline-none" />
                    {medications.length > 0 && (
                      <div className="absolute z-10 top-full mt-1 w-full border border-[#E0E0E0] rounded-[10px] bg-white max-h-24 overflow-y-auto shadow-lg">
                        {medications.map((m: any) => <button key={m.id} onClick={() => { updateItem(i, 'medicationId', m.id); setMedSearch(m.name); setMedications([]) }}
                          className="w-full text-left px-3 py-1.5 text-xs font-inter hover:bg-[#E8F5EE]">{m.name}</button>)}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input placeholder="Dosis" value={item.dosage} onChange={e => updateItem(i, 'dosage', e.target.value)} className="input-oasis border border-[#E0E0E0] px-2 py-1.5 text-xs font-inter focus:border-[#0E8C5E] focus:outline-none" />
                    <input placeholder="Duración" value={item.duration} onChange={e => updateItem(i, 'duration', e.target.value)} className="input-oasis border border-[#E0E0E0] px-2 py-1.5 text-xs font-inter focus:border-[#0E8C5E] focus:outline-none" />
                    <input type="number" placeholder="Cant." value={item.quantity} onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)} className="input-oasis border border-[#E0E0E0] px-2 py-1.5 text-xs font-inter focus:border-[#0E8C5E] focus:outline-none" />
                  </div>
                </div>
              ))}
              <OasisButton variant="outline" onClick={addItem} fullWidth><Plus size={14} /> Agregar Medicamento</OasisButton>
              <div className="flex justify-between"><OasisButton variant="ghost" onClick={() => setStep(1)}>Atrás</OasisButton><OasisButton onClick={() => setStep(3)} disabled={items.length === 0}>Siguiente</OasisButton></div>
            </div>
          )}
          {step === 3 && (
            <div className="mt-4 space-y-4">
              <div className="bg-[#E8F5EE]/30 rounded-[14px] p-4">
                <p className="font-inter text-sm"><strong>Paciente:</strong> {patients.find(p => p.id === form.patientId)?.user?.name}</p>
                <p className="font-inter text-sm"><strong>Diagnóstico:</strong> {form.diagnosis}</p>
                <p className="font-inter text-sm mt-2"><strong>Medicamentos:</strong> {items.length}</p>
              </div>
              <div className="flex justify-between"><OasisButton variant="ghost" onClick={() => setStep(2)}>Atrás</OasisButton><OasisButton onClick={createPrescription} disabled={saving}>{saving ? 'Guardando...' : 'Crear y Firmar'}</OasisButton></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Prescription Detail */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Detalle Receta</DialogTitle></DialogHeader>
          {showDetail && (
            <div className="mt-4 space-y-3">
              <p className="font-inter text-sm"><strong>Paciente:</strong> {showDetail.patient?.user?.name}</p>
              <p className="font-inter text-sm"><strong>Diagnóstico:</strong> {showDetail.diagnosis || '-'}</p>
              <p className="font-inter text-sm"><strong>Estado:</strong> <StatusBadge status={statusMap[showDetail.status] || 'active'} /></p>
              {showDetail.digitalSignature && <p className="font-inter text-xs text-[#0E8C5E] flex items-center gap-1"><CheckCircle size={14} />Firmada digitalmente</p>}
              {showDetail.items && showDetail.items.map((it: any, i: number) => (
                <div key={i} className="bg-[#FAFAFA] rounded-[10px] p-3 text-sm font-inter">
                  <p className="font-semibold text-[#4A4A4A]">{it.medication?.name || 'Medicamento'}</p>
                  <p className="text-xs text-[#8A8A8A]">{it.dosage} - {it.duration} - Cant: {it.quantity}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function X({ size }: { size: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg> }
