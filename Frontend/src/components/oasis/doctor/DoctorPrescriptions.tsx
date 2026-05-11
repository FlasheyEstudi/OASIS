
'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, OasisButton, DropLoader, EmptyState, StatusBadge, OasisIconButton } from '@/components/oasis/shared/shared-components'
import { FileText, Plus, Search, Pen, CheckCircle, Eye, AlertTriangle, X, ChevronRight, Hash, Send, Download, Printer } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function DoctorPrescriptions() {
  const { user } = useAuthStore()
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showDetail, setShowDetail] = useState<any>(null)
  const [showSignModal, setShowSignModal] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [patients, setPatients] = useState<any[]>([])
  const [medications, setMedications] = useState<any[]>([])
  const [medResults, setMedResults] = useState<any[]>([])
  const [form, setForm] = useState({ patientId: '', diagnosis: '', notes: '' })
  const [items, setItems] = useState<any[]>([])
  const [medSearch, setMedSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [pin, setPin] = useState('')
  const [clinicalWarnings, setClinicalWarnings] = useState<any[]>([])
  const [checkingSafety, setCheckingSafety] = useState(false)

  useEffect(() => { loadPrescriptions() }, [statusFilter])

  async function loadPrescriptions() {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await api.get('/doctor/prescriptions', { status: statusFilter || undefined, limit: 30 })
      if (res.success && res.data) setPrescriptions(res.data)
    } catch (err) {}
    setLoading(false)
  }

  async function loadPatients() {
    if (!user?.id) return
    try {
      const res = await api.get(`/doctors/${user.id}/patients`, { limit: 50 })
      if (res.success && res.data) setPatients(res.data)
    } catch (err) {}
  }

  async function searchMeds(q: string) {
    setMedSearch(q)
    if (q.length < 2) { setMedResults([]); return }
    try {
      const res = await api.get('/pharmacy/medications', { search: q, limit: 10 })
      if (res.success && res.data) setMedResults(res.data)
    } catch (err) {}
  }

  function addItem(med: any) {
    if (items.find(it => it.medicationId === med.id)) return
    setItems([...items, { 
      medicationId: med.id, 
      name: med.name, 
      genericName: med.genericName,
      dosage: '', 
      duration: '', 
      quantity: 1, 
      instructions: '' 
    }])
    setMedSearch('')
    setMedResults([])
    checkSafety([...items, { medicationId: med.id }])
  }

  function updateItem(i: number, field: string, value: any) {
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  function removeItem(i: number) {
    const newItems = items.filter((_, idx) => idx !== i)
    setItems(newItems)
    checkSafety(newItems)
  }

  async function checkSafety(currentItems: any[]) {
    if (!form.patientId || currentItems.length === 0) {
      setClinicalWarnings([])
      return
    }
    setCheckingSafety(true)
    try {
      const res = await api.post('/clinical-check/interactions', {
        patientId: form.patientId,
        medicationIds: currentItems.map(it => it.medicationId)
      })
      if (res.success && res.data) {
        setClinicalWarnings(res.data.warnings || [])
      }
    } catch (err) {}
    setCheckingSafety(false)
  }

  async function createPrescription() {
    setSaving(true)
    try {
      const res = await api.post('/doctor/prescriptions', { ...form, items })
      if (res.success) {
        setShowCreate(false)
        setStep(1)
        setForm({ patientId: '', diagnosis: '', notes: '' })
        setItems([])
        setClinicalWarnings([])
        loadPrescriptions()
        // Open sign modal immediately if successfully created as draft
        if (res.data?.id) setShowSignModal(res.data)
      }
    } catch (err) {
      alert('Error al crear receta')
    }
    setSaving(false)
  }

  async function handleSign() {
    if (pin !== '1234') { // Demo PIN verification
      alert('PIN incorrecto. Intenta con 1234')
      return
    }
    setSaving(true)
    try {
      const res = await api.post(`/doctor/prescriptions/${showSignModal.id}/sign`, { pin })
      if (res.success) {
        setShowSignModal(null)
        setPin('')
        loadPrescriptions()
      }
    } catch (err) {
      alert('Error al firmar receta')
    }
    setSaving(false)
  }

  async function viewPrescription(id: string) {
    try {
      const res = await api.get(`/doctor/prescriptions/${id}`)
      if (res.success && res.data) setShowDetail(res.data)
    } catch (err) {}
  }

  if (loading && prescriptions.length === 0) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Recetas Médicas</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Emisión y control de prescripciones digitales</p>
        </div>
        <OasisButton onClick={() => { loadPatients(); setStep(1); setShowCreate(true) }}>
          <Plus size={16} className="mr-1" /> Nueva Receta
        </OasisButton>
      </div>

      <div className="flex gap-3">
        {['', 'active', 'dispensed', 'expired'].map(status => (
           <button 
             key={status}
             onClick={() => setStatusFilter(status)}
             className={`px-4 py-1.5 rounded-full text-xs font-inter font-semibold transition-all ${statusFilter === status ? 'bg-[#0E8C5E] text-white' : 'bg-white border border-[#E0E0E0] text-[#8A8A8A] hover:bg-[#E8F5EE] hover:text-[#0E8C5E]'}`}
           >
             {status === '' ? 'Todas' : status === 'active' ? 'Activas' : status === 'dispensed' ? 'Entregadas' : 'Expiradas'}
           </button>
        ))}
      </div>

      {prescriptions.length === 0 ? <EmptyState message="No hay recetas registradas" /> : (
        <div className="grid gap-3">
          {prescriptions.map((rx) => (
            <OasisCard key={rx.id} className="!p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#0E8C5E]">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-inter font-bold text-sm text-[#4A4A4A] truncate">{rx.patient?.user?.name}</p>
                    <span className="text-[10px] font-mono text-[#8A8A8A] bg-[#FAFAFA] px-1.5 rounded border">#{rx.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <p className="font-inter text-xs text-[#8A8A8A] truncate">{rx.diagnosis || 'Consulta General'}</p>
                  <p className="text-[10px] font-inter text-[#8A8A8A] mt-0.5">{new Date(rx.createdAt).toLocaleDateString('es-NI')} • {rx.items?.length || 0} meds</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <StatusBadge status={rx.status === 'dispensed' ? 'completed' : rx.status} />
                   <div className="flex gap-1">
                      <OasisIconButton icon={<Eye size={14} />} label="Ver" variant="ghost" size="sm" onClick={() => viewPrescription(rx.id)} />
                      {rx.status === 'active' && !rx.digitalSignature && (
                        <OasisButton size="sm" className="h-8 px-3 text-[10px]" onClick={() => setShowSignModal(rx)}>
                          <Pen size={12} className="mr-1" /> Firmar
                        </OasisButton>
                      )}
                   </div>
                </div>
              </div>
            </OasisCard>
          ))}
        </div>
      )}

      {/* Create Prescription Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="modal-oasis max-w-4xl p-0 overflow-hidden">
          <div className="flex h-[80vh] md:h-[600px]">
            {/* Sidebar with Steps */}
            <div className="w-16 md:w-48 bg-[#FAFAFA] border-r border-[#E0E0E0] p-4 flex flex-col gap-6">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-nunito font-bold text-sm transition-all ${step >= s ? 'bg-[#0E8C5E] text-white shadow-lg scale-110' : 'bg-[#E0E0E0] text-[#8A8A8A]'}`}>
                    {s}
                  </div>
                  <span className={`hidden md:block font-inter text-xs font-semibold ${step >= s ? 'text-[#0E8C5E]' : 'text-[#8A8A8A]'}`}>
                    {s === 1 ? 'Paciente' : s === 2 ? 'Medicamentos' : 'Finalizar'}
                  </span>
                </div>
              ))}
            </div>

            {/* Main Form Content */}
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-[#E0E0E0] flex items-center justify-between">
                <h2 className="font-nunito font-bold text-xl text-[#4A4A4A]">Crear Receta Digital</h2>
                <button onClick={() => setShowCreate(false)} className="text-[#8A8A8A] hover:text-[#4A4A4A]"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 oasis-scroll">
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <label className="font-inter font-bold text-sm text-[#4A4A4A]">Seleccionar Paciente</label>
                      <select 
                        value={form.patientId} 
                        onChange={e => { setForm({ ...form, patientId: e.target.value }); setClinicalWarnings([]) }} 
                        className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-3 font-inter text-sm rounded-[14px] mt-2 focus:border-[#0E8C5E] focus:outline-none"
                      >
                        <option value="">Buscar en mis pacientes...</option>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.user.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="font-inter font-bold text-sm text-[#4A4A4A]">Diagnóstico Sugerido</label>
                      <textarea 
                        value={form.diagnosis} 
                        onChange={e => setForm({ ...form, diagnosis: e.target.value })} 
                        rows={3} 
                        placeholder="Descripción breve del motivo de la prescripción..."
                        className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-3 font-inter text-sm rounded-[14px] mt-2 focus:border-[#0E8C5E] focus:outline-none resize-none" 
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="relative">
                      <label className="font-inter font-bold text-sm text-[#4A4A4A]">Añadir Medicamentos</label>
                      <div className="relative mt-2">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
                        <input 
                          value={medSearch} 
                          onChange={e => searchMeds(e.target.value)} 
                          placeholder="Buscar por nombre o compuesto genérico..."
                          className="w-full input-oasis border-2 border-[#E0E0E0] bg-white px-4 py-2.5 pl-10 font-inter text-sm rounded-full focus:border-[#0E8C5E] focus:outline-none shadow-sm" 
                        />
                        {medResults.length > 0 && (
                          <div className="absolute z-20 top-full mt-2 w-full bg-white border border-[#E0E0E0] rounded-[18px] shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                            {medResults.map(m => (
                              <button key={m.id} onClick={() => addItem(m)} className="w-full text-left px-5 py-3 hover:bg-[#E8F5EE] border-b border-[#F0F0F0] last:border-0 transition-colors">
                                <p className="font-inter font-bold text-sm text-[#4A4A4A]">{m.name}</p>
                                <p className="text-[10px] font-inter text-[#8A8A8A] uppercase">{m.genericName} • {m.brand}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {items.map((it, idx) => (
                        <div key={it.medicationId} className="p-4 bg-white border-2 border-[#E8F5EE] rounded-[20px] shadow-sm relative group">
                          <button onClick={() => removeItem(idx)} className="absolute top-3 right-3 text-[#8A8A8A] hover:text-[#EF4444] p-1 rounded-full hover:bg-[#FEE2E2] transition-all">
                             <X size={16} />
                          </button>
                          <div className="pr-8">
                             <p className="font-inter font-bold text-sm text-[#4A4A4A]">{it.name}</p>
                             <p className="text-[10px] font-inter text-[#0E8C5E] uppercase mb-3">{it.genericName}</p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                             <div>
                               <label className="text-[9px] font-bold text-[#8A8A8A] uppercase">Dosis</label>
                               <input value={it.dosage} onChange={e => updateItem(idx, 'dosage', e.target.value)} placeholder="Ej: 500mg" className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg px-2 py-1.5 text-xs font-inter focus:border-[#0E8C5E] outline-none" />
                             </div>
                             <div>
                               <label className="text-[9px] font-bold text-[#8A8A8A] uppercase">Frecuencia</label>
                               <input value={it.duration} onChange={e => updateItem(idx, 'duration', e.target.value)} placeholder="Ej: c/8h" className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg px-2 py-1.5 text-xs font-inter focus:border-[#0E8C5E] outline-none" />
                             </div>
                             <div>
                               <label className="text-[9px] font-bold text-[#8A8A8A] uppercase">Cant.</label>
                               <input type="number" value={it.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg px-2 py-1.5 text-xs font-inter focus:border-[#0E8C5E] outline-none" />
                             </div>
                             <div className="md:col-span-1">
                               <label className="text-[9px] font-bold text-[#8A8A8A] uppercase">Días</label>
                               <input value={it.instructions} onChange={e => updateItem(idx, 'instructions', e.target.value)} placeholder="Ej: 7 días" className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg px-2 py-1.5 text-xs font-inter focus:border-[#0E8C5E] outline-none" />
                             </div>
                          </div>
                          {clinicalWarnings.some(w => w.medicationId === it.medicationId) && (
                            <div className="mt-3 flex items-start gap-2 bg-[#FFF3E0] p-2 rounded-lg border border-[#F4A261]/30">
                               <AlertTriangle size={14} className="text-[#F4A261] shrink-0 mt-0.5" />
                               <p className="text-[10px] font-inter text-[#4A4A4A]">{clinicalWarnings.find(w => w.medicationId === it.medicationId)?.message}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {clinicalWarnings.length > 0 && items.length > 0 && (
                      <div className="bg-[#FEE2E2] p-4 rounded-[18px] border border-[#EF4444]/20 flex items-start gap-3">
                        <AlertTriangle size={20} className="text-[#EF4444] shrink-0" />
                        <div>
                          <p className="font-inter font-bold text-xs text-[#4A4A4A]">Riesgo Clínico Detectado</p>
                          <p className="font-inter text-[10px] text-[#4A4A4A] mt-0.5">Se han detectado {clinicalWarnings.length} posibles interacciones o alergias. Por favor, revisa la prescripción antes de continuar.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <OasisCard className="!bg-[#E8F5EE]/30 !border-[#0E8C5E]/20">
                       <h3 className="font-nunito font-bold text-sm text-[#0E8C5E] mb-3">Resumen de Receta</h3>
                       <div className="space-y-2">
                         <div className="flex justify-between text-xs font-inter"><span className="text-[#8A8A8A]">Paciente:</span> <span className="font-bold text-[#4A4A4A]">{patients.find(p => p.id === form.patientId)?.user.name}</span></div>
                         <div className="flex justify-between text-xs font-inter"><span className="text-[#8A8A8A]">Diagnóstico:</span> <span className="font-bold text-[#4A4A4A]">{form.diagnosis || 'Consulta General'}</span></div>
                         <div className="flex justify-between text-xs font-inter"><span className="text-[#8A8A8A]">Medicamentos:</span> <span className="font-bold text-[#4A4A4A]">{items.length}</span></div>
                       </div>
                    </OasisCard>
                    <div className="space-y-2">
                      <p className="text-[10px] font-inter text-[#8A8A8A] text-center italic">Al confirmar, la receta se guardará como borrador y podrás firmarla digitalmente para activarla.</p>
                      <OasisButton fullWidth onClick={createPrescription} disabled={saving}>
                        {saving ? <Loader2 className="animate-spin" size={16} /> : 'Guardar y Continuar a Firma'}
                      </OasisButton>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-[#E0E0E0] bg-[#FAFAFA] flex items-center justify-between">
                <OasisButton variant="ghost" onClick={() => step > 1 && setStep(step - 1)} disabled={step === 1}>
                   Regresar
                </OasisButton>
                {step < 3 && (
                  <OasisButton onClick={() => setStep(step + 1)} disabled={step === 1 ? !form.patientId : items.length === 0}>
                    Siguiente <ChevronRight size={16} className="ml-1" />
                  </OasisButton>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Signature PIN Dialog */}
      <Dialog open={!!showSignModal} onOpenChange={(open) => { if(!open) setShowSignModal(null) }}>
         <DialogContent className="modal-oasis max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A] text-center">Firma Digital Oasis</DialogTitle>
            </DialogHeader>
            <div className="mt-4 flex flex-col items-center gap-6">
               <div className="w-16 h-16 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#0E8C5E] animate-pulse">
                  <Pen size={32} />
               </div>
               <div className="text-center">
                  <p className="font-inter text-sm text-[#4A4A4A]">Ingresa tu PIN de seguridad para autorizar la receta de <strong>{showSignModal?.patient?.user?.name}</strong>.</p>
                  <p className="text-[10px] font-inter text-[#8A8A8A] mt-1">(Usa 1234 para la demo)</p>
               </div>
               <div className="flex gap-2 justify-center">
                  {[0,1,2,3].map(i => (
                    <div key={i} className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center font-nunito font-bold text-xl transition-all ${pin.length > i ? 'border-[#0E8C5E] bg-[#E8F5EE] text-[#0E8C5E]' : 'border-[#E0E0E0] bg-[#FAFAFA]'}`}>
                       {pin.length > i ? '•' : ''}
                    </div>
                  ))}
               </div>
               <div className="grid grid-cols-3 gap-3 w-full">
                  {[1,2,3,4,5,6,7,8,9].map(n => (
                    <button key={n} onClick={() => pin.length < 4 && setPin(pin + n)} className="h-12 rounded-xl border border-[#E0E0E0] font-nunito font-bold text-[#4A4A4A] hover:bg-[#E8F5EE] hover:border-[#0E8C5E] transition-all">{n}</button>
                  ))}
                  <button onClick={() => setPin('')} className="h-12 rounded-xl border border-[#E0E0E0] font-nunito font-bold text-[#EF4444] hover:bg-[#FEE2E2]">C</button>
                  <button onClick={() => pin.length < 4 && setPin(pin + '0')} className="h-12 rounded-xl border border-[#E0E0E0] font-nunito font-bold text-[#4A4A4A] hover:bg-[#E8F5EE]">0</button>
                  <button onClick={() => setPin(pin.slice(0, -1))} className="h-12 rounded-xl border border-[#E0E0E0] font-nunito font-bold text-[#8A8A8A] hover:bg-[#FAFAFA]">⌫</button>
               </div>
               <OasisButton fullWidth disabled={pin.length < 4 || saving} onClick={handleSign}>
                  {saving ? <Loader2 className="animate-spin" size={16} /> : 'Firmar Receta'}
               </OasisButton>
            </div>
         </DialogContent>
      </Dialog>

      {/* Prescription Detail & Document View */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="modal-oasis max-w-2xl p-0 overflow-hidden bg-white">
          {showDetail && (
            <div className="flex flex-col md:flex-row h-[90vh] md:h-[550px]">
               {/* Document Preview */}
               <div className="flex-1 p-8 overflow-y-auto relative bg-[#f8faf9] border-r border-[#E0E0E0]">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                     <FileText size={160} />
                  </div>
                  <div className="relative space-y-8">
                     <div className="flex justify-between items-start">
                        <div>
                           <h2 className="font-nunito font-bold text-2xl text-[#0E8C5E]">Oasis</h2>
                           <p className="text-[10px] font-inter text-[#8A8A8A] uppercase tracking-widest">Receta Digital Certificada</p>
                        </div>
                        {showDetail.digitalSignature && (
                          <div className="bg-[#E8F5EE] border border-[#0E8C5E]/20 rounded-lg p-2 flex items-center gap-2">
                             <CheckCircle size={14} className="text-[#0E8C5E]" />
                             <span className="text-[10px] font-bold text-[#0E8C5E] uppercase">Firmada Digitalmente</span>
                          </div>
                        )}
                     </div>

                     <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E0E0E0]/50">
                        <div>
                           <p className="text-[9px] font-bold text-[#8A8A8A] uppercase mb-1">Paciente</p>
                           <p className="font-inter font-bold text-sm text-[#4A4A4A]">{showDetail.patient?.user?.name}</p>
                           <p className="text-[10px] font-inter text-[#8A8A8A]">Cédula: {showDetail.patient?.id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-bold text-[#8A8A8A] uppercase mb-1">Fecha Emisión</p>
                           <p className="font-inter font-bold text-sm text-[#4A4A4A]">{new Date(showDetail.createdAt).toLocaleDateString('es-NI')}</p>
                           <p className="text-[10px] font-inter text-[#8A8A8A]">Expira: {new Date(new Date(showDetail.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-NI')}</p>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <p className="text-[9px] font-bold text-[#8A8A8A] uppercase">Prescripción</p>
                        {showDetail.items?.map((it: any, i: number) => (
                           <div key={i} className="flex gap-4 p-3 bg-white border border-[#E0E0E0] rounded-xl shadow-sm">
                              <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] flex items-center justify-center text-[#4A4A4A] font-bold text-xs">{i+1}</div>
                              <div className="flex-1">
                                 <p className="font-inter font-bold text-sm text-[#4A4A4A]">{it.medication?.name}</p>
                                 <p className="text-xs font-inter text-[#0E8C5E]">{it.dosage} • {it.duration}</p>
                                 <p className="text-[10px] font-inter text-[#8A8A8A] mt-1 italic">{it.instructions || 'Indicaciones usuales'}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[10px] font-bold text-[#8A8A8A]">CANT.</p>
                                 <p className="font-nunito font-bold text-lg text-[#4A4A4A]">{it.quantity}</p>
                              </div>
                           </div>
                        ))}
                     </div>

                     <div className="pt-8 flex justify-between items-end border-t border-[#E0E0E0]/50">
                        <div>
                           <p className="text-[9px] font-bold text-[#8A8A8A] uppercase mb-1">Médico Tratante</p>
                           <p className="font-inter font-bold text-sm text-[#4A4A4A]">{showDetail.doctor?.user?.name}</p>
                           <p className="text-[10px] font-inter text-[#8A8A8A]">{showDetail.doctor?.specialty} • Cod: {showDetail.doctor?.licenseNumber || 'N/A'}</p>
                        </div>
                        {showDetail.qrCode && (
                          <div className="bg-white p-2 rounded-xl border-2 border-[#E8F5EE]">
                             <img src={showDetail.qrCode} alt="QR Receta" className="w-20 h-20" />
                          </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Actions Panel */}
               <div className="w-full md:w-56 p-6 flex flex-col gap-3 bg-white">
                  <h3 className="font-nunito font-bold text-sm text-[#4A4A4A] mb-2">Acciones</h3>
                  <button className="flex items-center gap-3 w-full p-3 rounded-xl bg-[#E8F5EE] text-[#0E8C5E] font-inter font-semibold text-xs hover:shadow-md transition-all">
                     <Download size={16} /> Descargar PDF
                  </button>
                  <button className="flex items-center gap-3 w-full p-3 rounded-xl border border-[#E0E0E0] text-[#4A4A4A] font-inter font-semibold text-xs hover:bg-[#FAFAFA] transition-all">
                     <Send size={16} /> Enviar WhatsApp
                  </button>
                  <button className="flex items-center gap-3 w-full p-3 rounded-xl border border-[#E0E0E0] text-[#4A4A4A] font-inter font-semibold text-xs hover:bg-[#FAFAFA] transition-all">
                     <Printer size={16} /> Imprimir Receta
                  </button>
                  <div className="mt-auto pt-6 border-t border-[#F0F0F0]">
                     <p className="text-[9px] font-inter text-[#8A8A8A] leading-tight">Esta receta es un documento legal electrónico inmutable. Verificación vía QR habilitada.</p>
                  </div>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Loader2({ size, className }: { size: number; className?: string }) {
  return <Loader2Icon size={size} className={className} />
}
import { Loader2 as Loader2Icon } from 'lucide-react'
