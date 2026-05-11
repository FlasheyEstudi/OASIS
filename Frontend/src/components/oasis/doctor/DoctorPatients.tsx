
'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, OasisButton, DropLoader, EmptyState, StatusBadge, OasisIconButton } from '@/components/oasis/shared/shared-components'
import { Users, Search, Plus, Heart, FileText, ChevronRight, Calendar, ArrowLeft, Paperclip, MessageSquare, PlusCircle, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function DoctorPatients() {
  const { user } = useAuthStore()
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  // Add entry form
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [entryForm, setEntryForm] = useState({ diagnosis: '', notes: '' })
  const [savingEntry, setSavingEntry] = useState(false)

  useEffect(() => { loadPatients() }, [search])

  async function loadPatients() {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await api.get(`/doctors/${user.id}/patients`, { search: search || undefined, limit: 50 })
      if (res.success && res.data) setPatients(res.data)
    } catch (err) {}
    setLoading(false)
  }

  async function loadHistory(patient: any) {
    setSelectedPatient(patient)
    setLoadingHistory(true)
    try {
      const res = await api.get(`/patients/${patient.id}/history`)
      if (res.success && res.data) {
        // Backend returns an object with 'history' array and 'patient' details
        setHistory(res.data.history || [])
      }
    } catch (err) {}
    setLoadingHistory(false)
  }

  async function handleAddEntry() {
    if (!entryForm.diagnosis) return
    setSavingEntry(true)
    try {
      const res = await api.post(`/patients/${selectedPatient.id}/history`, {
        ...entryForm,
        doctorId: user?.id
      })
      if (res.success) {
        setShowAddEntry(false)
        setEntryForm({ diagnosis: '', notes: '' })
        loadHistory(selectedPatient)
      }
    } catch (err) {}
    setSavingEntry(false)
  }

  if (loading && patients.length === 0) return <div className="flex items-center justify-center min-h-[60vh]"><DropLoader size={48} /></div>

  if (selectedPatient) {
    return (
      <div className="p-4 md:p-0 space-y-6 animate-in fade-in duration-300">
        <button onClick={() => setSelectedPatient(null)} className="flex items-center gap-2 text-[#8A8A8A] hover:text-[#0E8C5E] transition-colors font-inter text-sm">
          <ArrowLeft size={16} /> Volver a lista de pacientes
        </button>

        <div className="flex flex-col md:flex-row gap-6">
           {/* Patient Summary Card */}
           <div className="w-full md:w-80 space-y-4">
              <OasisCard className="!p-6 flex flex-col items-center text-center">
                 <Avatar className="w-24 h-24 border-4 border-[#E8F5EE] mb-4">
                    <AvatarFallback className="bg-[#E8F5EE] text-[#0E8C5E] font-nunito font-bold text-3xl">
                       {selectedPatient.user.name.split(' ').map((n:any) => n[0]).join('')}
                    </AvatarFallback>
                 </Avatar>
                 <h2 className="font-nunito font-bold text-xl text-[#4A4A4A]">{selectedPatient.user.name}</h2>
                 <p className="font-inter text-xs text-[#8A8A8A]">{selectedPatient.user.email}</p>
                 <div className="flex gap-2 mt-4">
                    <StatusBadge status="active" />
                    <span className="bg-[#FEE2E2] text-[#EF4444] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{selectedPatient.bloodType || 'RH+'}</span>
                 </div>
              </OasisCard>

              <OasisCard className="!p-4 space-y-4">
                 <h3 className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest border-b border-[#F0F0F0] pb-2">Información Clínica</h3>
                 <div className="space-y-3">
                    <div>
                       <p className="text-[10px] font-inter text-[#8A8A8A]">Alergias</p>
                       <p className="text-xs font-inter font-bold text-[#EF4444]">{selectedPatient.allergies ? JSON.parse(selectedPatient.allergies).join(', ') : 'Ninguna reportada'}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-inter text-[#8A8A8A]">Condiciones Crónicas</p>
                       <p className="text-xs font-inter font-bold text-[#4A4A4A]">{selectedPatient.chronicConditions ? JSON.parse(selectedPatient.chronicConditions).join(', ') : 'Ninguna reportada'}</p>
                    </div>
                 </div>
              </OasisCard>
           </div>

           {/* Timeline Section */}
           <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="font-nunito font-bold text-xl text-[#4A4A4A]">Línea de Tiempo Médica</h2>
                 <OasisButton size="sm" onClick={() => setShowAddEntry(true)}>
                    <Plus size={16} className="mr-1" /> Nueva Entrada
                 </OasisButton>
              </div>

              {loadingHistory ? (
                <div className="flex justify-center py-20"><DropLoader size={32} /></div>
              ) : history.length === 0 ? (
                <EmptyState message="No hay registros históricos para este paciente" />
              ) : (
                <div className="relative pl-8 md:pl-12 pb-10">
                   {/* Vertical Curved Line */}
                   <div className="absolute left-[19px] md:left-[31px] top-4 bottom-0 w-[3px] bg-gradient-to-b from-[#0E8C5E] via-[#0077B6] to-[#E8F5EE] rounded-full" />
                   
                   <div className="space-y-8">
                      {history.map((entry, i) => (
                        <div key={entry.id} className="relative group">
                           {/* Timeline Dot */}
                           <div className="absolute -left-[30px] md:-left-[46px] top-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border-4 border-[#E8F5EE] shadow-sm flex items-center justify-center transition-transform group-hover:scale-125 z-10">
                              <div className="w-2 h-2 rounded-full bg-[#0E8C5E]" />
                           </div>

                           <OasisCard className="!p-5 hover:border-[#0E8C5E]/30 transition-all">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                                 <div>
                                    <h4 className="font-inter font-bold text-base text-[#4A4A4A]">{entry.diagnosis}</h4>
                                    <div className="flex items-center gap-2 text-[10px] font-inter text-[#8A8A8A]">
                                       <Calendar size={12} className="text-[#0E8C5E]" />
                                       {new Date(entry.createdAt).toLocaleString('es-NI', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2 px-3 py-1 bg-[#F8FAF9] rounded-full border border-[#E8F5EE]">
                                    <Avatar className="w-5 h-5">
                                       <AvatarFallback className="bg-[#0E8C5E] text-white text-[8px] font-bold">DR</AvatarFallback>
                                    </Avatar>
                                    <span className="text-[10px] font-inter font-bold text-[#4A4A4A]">Dr. {entry.doctor?.user?.name?.split(' ').pop()}</span>
                                 </div>
                              </div>
                              <p className="font-inter text-sm text-[#4A4A4A] leading-relaxed mb-4">{entry.notes || 'Sin notas adicionales'}</p>
                              
                              <div className="flex flex-wrap gap-2 pt-3 border-t border-[#F0F0F0]">
                                 <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAFAFA] border border-[#E0E0E0] text-[10px] font-inter text-[#8A8A8A] hover:bg-[#F0F0F0] transition-colors">
                                    <Paperclip size={12} /> Ver adjuntos (0)
                                 </button>
                                 <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAFAFA] border border-[#E0E0E0] text-[10px] font-inter text-[#8A8A8A] hover:bg-[#F0F0F0] transition-colors">
                                    <FileText size={12} /> Receta asociada
                                 </button>
                              </div>
                           </OasisCard>
                        </div>
                      ))}
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* Add Entry Modal */}
        <Dialog open={showAddEntry} onOpenChange={setShowAddEntry}>
           <DialogContent className="modal-oasis max-w-md">
              <DialogHeader>
                 <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Nueva Entrada de Historial</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                 <div>
                    <label className="text-[10px] font-bold text-[#8A8A8A] uppercase">Diagnóstico / Motivo</label>
                    <input 
                      value={entryForm.diagnosis}
                      onChange={e => setEntryForm({...entryForm, diagnosis: e.target.value})}
                      className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] outline-none"
                      placeholder="Ej: Infección respiratoria leve"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-[#8A8A8A] uppercase">Evolución y Notas</label>
                    <textarea 
                       value={entryForm.notes}
                       onChange={e => setEntryForm({...entryForm, notes: e.target.value})}
                       className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-3 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] outline-none resize-none"
                       rows={4}
                       placeholder="Detalles de la consulta, síntomas, examen físico..."
                    />
                 </div>
                 <div className="flex gap-3 pt-2">
                    <OasisButton variant="ghost" className="flex-1" onClick={() => setShowAddEntry(false)}>Cancelar</OasisButton>
                    <OasisButton className="flex-1" onClick={handleAddEntry} disabled={savingEntry || !entryForm.diagnosis}>
                       {savingEntry ? <Loader2 className="animate-spin" size={16} /> : 'Guardar Entrada'}
                    </OasisButton>
                 </div>
              </div>
           </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Mis Pacientes</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Seguimiento clínico y expedientes digitales</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Buscar paciente..."
            className="w-full input-oasis border-2 border-[#E0E0E0] bg-white px-4 py-2 pl-10 rounded-full font-inter text-sm focus:border-[#0E8C5E] outline-none" 
          />
        </div>
      </div>

      {patients.length === 0 ? <EmptyState message="No tienes pacientes asignados actualmente" /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
           {patients.map((p) => (
             <OasisCard key={p.id} className="group hover:bg-[#E8F5EE]/10 transition-all cursor-pointer" onClick={() => loadHistory(p)}>
                <div className="flex items-center gap-4">
                   <Avatar className="w-12 h-12 border-2 border-[#E8F5EE] group-hover:scale-105 transition-transform">
                      <AvatarFallback className="bg-[#E8F5EE] text-[#0E8C5E] font-nunito font-bold">
                         {p.user.name.split(' ').map((n:any) => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                   </Avatar>
                   <div className="flex-1 min-w-0">
                      <h3 className="font-inter font-bold text-sm text-[#4A4A4A] truncate">{p.user.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-[10px] font-inter text-[#8A8A8A] uppercase">Cédula: {p.id.slice(-8).toUpperCase()}</span>
                         <div className="w-1 h-1 rounded-full bg-[#E0E0E0]" />
                         <span className="text-[10px] font-inter text-[#0E8C5E] font-bold uppercase">{p.bloodType || 'RH+'}</span>
                      </div>
                   </div>
                   <ChevronRight size={16} className="text-[#E0E0E0] group-hover:text-[#0E8C5E] group-hover:translate-x-1 transition-all" />
                </div>
                <div className="mt-4 flex gap-2 overflow-hidden">
                   {p.allergies && JSON.parse(p.allergies).slice(0, 2).map((a:string, i:number) => (
                     <span key={i} className="text-[9px] font-inter font-bold px-2 py-0.5 bg-[#FEE2E2] text-[#EF4444] rounded-full uppercase truncate">
                        {a}
                     </span>
                   ))}
                </div>
             </OasisCard>
           ))}
        </div>
      )}
    </div>
  )
}
