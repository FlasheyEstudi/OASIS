
'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, OasisButton, DropLoader, EmptyState, StatusBadge, OasisIconButton } from '@/components/oasis/shared/shared-components'
import { Calendar, Clock, User, Stethoscope, CheckCircle, Plus, Search, DollarSign, CreditCard, Banknote, Shield, Download, X, MoreVertical, MapPin, Video, Phone } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function ReceptionistAgenda() {
  const { roleProfile } = useAuthStore()
  const clinicId = roleProfile?.clinicId
  const [appointments, setAppointments] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showPayment, setShowPayment] = useState<any>(null)
  const [showInvoice, setShowInvoice] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [processing, setProcessing] = useState(false)
  
  // New Appointment Form
  const [form, setForm] = useState({ 
    doctorId: '', 
    patientId: '', 
    date: new Date().toISOString().split('T')[0], 
    startTime: '08:00', 
    endTime: '08:30',
    type: 'in_person'
  })
  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState<any[]>([])

  useEffect(() => {
    if (clinicId) {
      loadAppointments()
      loadDoctors()
    }
  }, [clinicId, date, statusFilter])

  async function loadAppointments() {
    setLoading(true)
    try {
      const res = await api.get('/receptionist/appointments', { 
        date, 
        status: statusFilter || undefined, 
        clinicId, 
        limit: 50 
      })
      if (res.success && res.data) setAppointments(res.data)
    } catch (err) {}
    setLoading(false)
  }

  async function loadDoctors() {
    try {
      const res = await api.get(`/clinics/${clinicId}/doctors`, { limit: 50 })
      if (res.success && res.data) setDoctors(res.data)
    } catch (err) {}
  }

  async function searchPatients(q: string) {
    setPatientSearch(q)
    if (q.length < 2) { setPatientResults([]); return }
    try {
      const res = await api.get('/patients', { search: q, limit: 10 })
      if (res.success && res.data) setPatientResults(res.data)
    } catch (err) {}
  }

  async function handleCheckin(aptId: string) {
    setProcessing(true)
    try {
      const res = await api.post(`/receptionist/appointments/${aptId}/checkin`)
      if (res.success) {
        loadAppointments()
        // Find the appointment to open payment modal
        const apt = appointments.find(a => a.id === aptId)
        if (apt) setShowPayment(apt)
      }
    } catch (err) {}
    setProcessing(false)
  }

  async function handlePayment() {
    if (!showPayment) return
    setProcessing(true)
    try {
      const res = await api.post('/receptionist/payments/collect', {
        appointmentId: showPayment.id,
        paymentMethod,
        amount: showPayment.service?.price || showPayment.doctor?.consultationFee || 25
      })
      if (res.success && res.data?.invoice) {
        setShowInvoice(res.data.invoice)
        setShowPayment(null)
        loadAppointments()
      }
    } catch (err) {
      alert('Error al procesar pago')
    }
    setProcessing(false)
  }

  async function handleCreate() {
    if (!form.doctorId || !form.patientId) return
    setProcessing(true)
    try {
      const res = await api.post('/receptionist/appointments', { ...form, clinicId })
      if (res.success) {
        setShowCreate(false)
        loadAppointments()
        setForm({ ...form, patientId: '', startTime: '08:00', endTime: '08:30' })
        setPatientSearch('')
      }
    } catch (err) {}
    setProcessing(false)
  }

  if (loading && appointments.length === 0) return <div className="flex items-center justify-center min-h-[60vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Agenda de Citas</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Gestiona el flujo de pacientes y cobros</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)}
            className="input-oasis border-2 border-[#E0E0E0] bg-white px-4 py-2 rounded-full font-inter text-sm focus:border-[#0E8C5E] outline-none" 
          />
          <OasisButton onClick={() => setShowCreate(true)} size="sm">
            <Plus size={16} className="mr-1" /> Nueva Cita
          </OasisButton>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['', 'scheduled', 'confirmed', 'checked_in', 'completed', 'cancelled'].map(st => (
           <button 
             key={st}
             onClick={() => setStatusFilter(st)}
             className={`px-4 py-1.5 rounded-full text-xs font-inter font-semibold whitespace-nowrap transition-all ${statusFilter === st ? 'bg-[#0E8C5E] text-white' : 'bg-white border border-[#E0E0E0] text-[#8A8A8A]'}`}
           >
             {st === '' ? 'Todas' : st === 'scheduled' ? 'Pendientes' : st === 'confirmed' ? 'Confirmadas' : st === 'checked_in' ? 'En Sala' : st === 'completed' ? 'Finalizadas' : 'Canceladas'}
           </button>
        ))}
      </div>

      {appointments.length === 0 ? <EmptyState message="No hay citas para este día" /> : (
        <div className="space-y-3">
          {appointments.map((apt) => {
            const initials = apt.patient?.user?.name?.split(' ').map((n:any) => n[0]).join('').slice(0, 2).toUpperCase()
            return (
              <OasisCard key={apt.id} className="!p-4 group hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-16 border-r border-[#E0E0E0] pr-4">
                    <span className="font-nunito font-bold text-lg text-[#0E8C5E] leading-none">{apt.startTime}</span>
                    <span className="text-[9px] font-inter text-[#8A8A8A] mt-1 uppercase">{apt.type === 'teleconsult' ? 'Virtual' : 'Presencial'}</span>
                  </div>
                  
                  <Avatar className="w-10 h-10 border border-[#E8F5EE]">
                    <AvatarFallback className="bg-[#E8F5EE] text-[#0E8C5E] font-nunito font-bold text-xs">{initials}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-inter font-bold text-sm text-[#4A4A4A] truncate">{apt.patient?.user?.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                       <Stethoscope size={12} className="text-[#0077B6]" />
                       <p className="text-xs font-inter text-[#8A8A8A] truncate">Dr. {apt.doctor?.user?.name?.split(' ').pop()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <StatusBadge status={apt.status === 'checked_in' ? 'active' : apt.status === 'scheduled' ? 'pending' : apt.status} />
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {apt.status === 'confirmed' && (
                        <OasisButton size="sm" className="h-8 px-3 text-[10px]" onClick={() => handleCheckin(apt.id)} disabled={processing}>
                           Check-in
                        </OasisButton>
                      )}
                      {apt.status === 'checked_in' && (
                        <OasisButton size="sm" variant="blue" className="h-8 px-3 text-[10px]" onClick={() => setShowPayment(apt)}>
                           Cobrar
                        </OasisButton>
                      )}
                      <OasisIconButton icon={<MoreVertical size={16} />} label="Más" variant="ghost" size="sm" />
                    </div>
                  </div>
                </div>
              </OasisCard>
            )
          })}
        </div>
      )}

      {/* New Appointment Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="modal-oasis max-w-lg">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Agendar Cita</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#8A8A8A] uppercase">Doctor</label>
                <select 
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] outline-none"
                  value={form.doctorId}
                  onChange={e => setForm({...form, doctorId: e.target.value})}
                >
                  <option value="">Seleccionar...</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.user.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#8A8A8A] uppercase">Tipo</label>
                <select 
                   className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] outline-none"
                   value={form.type}
                   onChange={e => setForm({...form, type: e.target.value})}
                >
                  <option value="in_person">Presencial</option>
                  <option value="teleconsult">Teleconsulta</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-bold text-[#8A8A8A] uppercase">Paciente</label>
              <div className="relative mt-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
                <input 
                  value={patientSearch} 
                  onChange={e => searchPatients(e.target.value)}
                  placeholder="Buscar paciente por nombre..."
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] pl-10 pr-4 py-2.5 font-inter text-sm rounded-[14px] focus:border-[#0E8C5E] outline-none"
                />
              </div>
              {patientResults.length > 0 && (
                <div className="absolute z-10 top-full mt-1 w-full bg-white border border-[#E0E0E0] rounded-[14px] shadow-lg overflow-hidden max-h-40 overflow-y-auto">
                  {patientResults.map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => { setForm({...form, patientId: p.id}); setPatientSearch(p.user.name); setPatientResults([]) }}
                      className="w-full text-left px-4 py-2 hover:bg-[#E8F5EE] border-b border-[#F0F0F0] last:border-0 font-inter text-sm text-[#4A4A4A]"
                    >
                      {p.user.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
               <div>
                 <label className="text-[10px] font-bold text-[#8A8A8A] uppercase">Fecha</label>
                 <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg px-2 py-2 text-xs font-inter focus:border-[#0E8C5E] outline-none" />
               </div>
               <div>
                 <label className="text-[10px] font-bold text-[#8A8A8A] uppercase">Hora Inicio</label>
                 <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg px-2 py-2 text-xs font-inter focus:border-[#0E8C5E] outline-none" />
               </div>
               <div>
                 <label className="text-[10px] font-bold text-[#8A8A8A] uppercase">Hora Fin</label>
                 <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg px-2 py-2 text-xs font-inter focus:border-[#0E8C5E] outline-none" />
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
               <OasisButton variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</OasisButton>
               <OasisButton onClick={handleCreate} disabled={processing || !form.doctorId || !form.patientId}>
                 {processing ? 'Agendando...' : 'Confirmar Cita'}
               </OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={!!showPayment} onOpenChange={() => setShowPayment(null)}>
        <DialogContent className="modal-oasis max-w-sm">
           <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Procesar Cobro</DialogTitle></DialogHeader>
           <div className="mt-4 space-y-6">
              <div className="flex flex-col items-center text-center">
                 <p className="text-xs font-inter text-[#8A8A8A]">Monto a cobrar</p>
                 <p className="font-nunito font-bold text-3xl text-[#0E8C5E]">C$ {showPayment?.service?.price || showPayment?.doctor?.consultationFee || 25}</p>
                 <p className="text-xs font-inter text-[#4A4A4A] mt-1">{showPayment?.patient?.user?.name}</p>
              </div>

              <div className="space-y-3">
                 <p className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider">Método de Pago</p>
                 <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'cash', icon: Banknote, label: 'Efectivo' },
                      { id: 'card_online', icon: CreditCard, label: 'Tarjeta' },
                      { id: 'insurance', icon: Shield, label: 'Seguro' }
                    ].map(m => (
                      <button 
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${paymentMethod === m.id ? 'border-[#0E8C5E] bg-[#E8F5EE] text-[#0E8C5E]' : 'border-[#E0E0E0] text-[#8A8A8A] hover:bg-[#FAFAFA]'}`}
                      >
                         <m.icon size={20} />
                         <span className="text-[9px] font-inter font-bold mt-1 uppercase">{m.label}</span>
                      </button>
                    ))}
                 </div>
              </div>

              <OasisButton fullWidth onClick={handlePayment} disabled={processing}>
                 {processing ? 'Procesando...' : 'Completar Pago'}
              </OasisButton>
           </div>
        </DialogContent>
      </Dialog>

      {/* Invoice View Dialog */}
      <Dialog open={!!showInvoice} onOpenChange={() => setShowInvoice(null)}>
        <DialogContent className="modal-oasis max-w-md p-0 overflow-hidden bg-white">
          {showInvoice && (
            <div className="flex flex-col">
               <div className="p-8 bg-[#0E8C5E] text-white flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                     <CheckCircle size={40} className="text-white" />
                  </div>
                  <div className="text-center">
                     <h3 className="font-nunito font-bold text-2xl">Pago Exitoso</h3>
                     <p className="text-white/80 text-sm font-inter">Factura #{showInvoice.invoiceNumber}</p>
                  </div>
               </div>
               
               <div className="p-8 space-y-6">
                  <div className="space-y-3">
                     <div className="flex justify-between text-sm font-inter"><span className="text-[#8A8A8A]">Paciente</span> <span className="font-bold text-[#4A4A4A]">{showPayment?.patient?.user?.name || 'Paciente'}</span></div>
                     <div className="flex justify-between text-sm font-inter"><span className="text-[#8A8A8A]">Método</span> <span className="font-bold text-[#4A4A4A] uppercase">{showInvoice.paymentMethod}</span></div>
                     <div className="flex justify-between text-sm font-inter"><span className="text-[#8A8A8A]">Fecha</span> <span className="font-bold text-[#4A4A4A]">{new Date(showInvoice.issuedAt).toLocaleString()}</span></div>
                  </div>

                  <div className="pt-6 border-t border-dashed border-[#E0E0E0]">
                     <div className="flex justify-between items-center">
                        <span className="font-nunito font-bold text-lg text-[#4A4A4A]">Total Pagado</span>
                        <span className="font-nunito font-bold text-2xl text-[#0E8C5E]">C$ {showInvoice.total}</span>
                     </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                     <button className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#FAFAFA] border border-[#E0E0E0] text-[#4A4A4A] font-inter font-semibold text-xs hover:bg-[#F0F0F0] transition-all">
                        <Download size={16} /> PDF
                     </button>
                     <button className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#E8F5EE] text-[#0E8C5E] font-inter font-semibold text-xs hover:shadow-md transition-all">
                        <Phone size={16} /> WhatsApp
                     </button>
                  </div>
                  
                  <OasisButton fullWidth variant="ghost" onClick={() => setShowInvoice(null)}>Cerrar</OasisButton>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
