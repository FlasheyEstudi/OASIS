'use client'

import { useState } from 'react'
import { Check, Clock, DollarSign, Calendar as CalIcon, User, Phone, Banknote, CreditCard, Shield, CheckCircle2 } from 'lucide-react'
import { OasisCard, OasisButton, OasisIconButton, StatusBadge } from '../shared/shared-components'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const initialAppointments = [
  { id: 1, patient: 'María López', doctor: 'Dr. Ruiz', time: '09:00 AM', type: 'Consulta General', status: 'pending' as const, initials: 'ML' },
  { id: 2, patient: 'Juan Pérez', doctor: 'Dr. Ruiz', time: '09:45 AM', type: 'Seguimiento', status: 'completed' as const, initials: 'JP' },
  { id: 3, patient: 'Ana Gómez', doctor: 'Dra. Martínez', time: '10:30 AM', type: 'Teleconsulta', status: 'pending' as const, initials: 'AG' },
  { id: 4, patient: 'Roberto Díaz', doctor: 'Dr. Ruiz', time: '11:00 AM', type: 'Primera Vez', status: 'pending' as const, initials: 'RD' },
  { id: 5, patient: 'Laura Torres', doctor: 'Dra. Martínez', time: '11:45 AM', type: 'Consulta General', status: 'cancelled' as const, initials: 'LT' },
  { id: 6, patient: 'Carlos Sánchez', doctor: 'Dr. Hernández', time: '01:00 PM', type: 'Cardiología', status: 'pending' as const, initials: 'CS' },
]

const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00']

const doctorOptions = ['Dr. Ruiz', 'Dra. Martínez', 'Dr. Hernández']
const typeOptions = ['Consulta General', 'Seguimiento', 'Teleconsulta', 'Primera Vez', 'Especialidad']

export default function Appointments() {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [selectedApt, setSelectedApt] = useState<typeof initialAppointments[0] | null>(null)
  const [chargeOpen, setChargeOpen] = useState(false)
  const [checkedIn, setCheckedIn] = useState<Set<number>>(new Set())
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [chargeSuccess, setChargeSuccess] = useState(false)

  // Nueva Cita modal state
  const [newAptOpen, setNewAptOpen] = useState(false)
  const [newAptForm, setNewAptForm] = useState({
    patient: '',
    doctor: doctorOptions[0],
    date: '',
    time: '',
    type: typeOptions[0],
    notes: '',
  })

  const handleCheckIn = (id: number) => {
    setCheckedIn(prev => new Set(prev).add(id))
  }

  const handleNewApt = () => {
    if (!newAptForm.patient.trim()) return
    const nameParts = newAptForm.patient.trim().split(' ')
    const initials = nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : newAptForm.patient.trim().slice(0, 2).toUpperCase()
    const newApt = {
      id: Date.now(),
      patient: newAptForm.patient.trim(),
      doctor: newAptForm.doctor,
      time: newAptForm.time || '09:00 AM',
      type: newAptForm.type,
      status: 'pending' as const,
      initials,
    }
    setAppointments(prev => [...prev, newApt])
    setNewAptForm({ patient: '', doctor: doctorOptions[0], date: '', time: '', type: typeOptions[0], notes: '' })
    setNewAptOpen(false)
  }

  const handleCharge = () => {
    setChargeSuccess(true)
    setTimeout(() => {
      setChargeSuccess(false)
      setChargeOpen(false)
      setSelectedPayment(null)
    }, 1800)
  }

  const openChargeModal = (apt: typeof initialAppointments[0]) => {
    setSelectedApt(apt)
    setSelectedPayment(null)
    setChargeSuccess(false)
    setChargeOpen(true)
  }

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Citas</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Gestión de citas del día</p>
        </div>
        <OasisButton size="sm" onClick={() => setNewAptOpen(true)}>
          <CalIcon size={16} className="mr-1" /> Nueva Cita
        </OasisButton>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar view */}
        <OasisCard className="lg:col-span-1">
          <h3 className="font-nunito font-bold text-base text-[#4A4A4A] mb-4">Agenda - Hoy</h3>
          <div className="space-y-1 max-h-96 overflow-y-auto oasis-scroll">
            {timeSlots.map((slot) => {
              const apt = appointments.find(a => a.time.replace(' AM','').replace(' PM','') === slot || 
                (slot === '09:00' && a.time === '09:00 AM'))
              const isOccupied = !!apt
              return (
                <div key={slot} className={`flex items-center gap-2 p-2 rounded-[10px] text-xs font-inter ${
                  isOccupied ? 'bg-[#E8F5EE]/50' : 'bg-[#FAFAFA]'
                }`}>
                  <span className="text-[#8A8A8A] w-12 flex-shrink-0">{slot}</span>
                  {isOccupied ? (
                    <div className="flex-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0E8C5E]" />
                      <span className="text-[#4A4A4A] font-medium truncate">{apt.patient}</span>
                    </div>
                  ) : (
                    <span className="text-[#E0E0E0]">Disponible</span>
                  )}
                </div>
              )
            })}
          </div>
        </OasisCard>

        {/* Appointments list */}
        <OasisCard className="lg:col-span-2">
          <h3 className="font-nunito font-bold text-base text-[#4A4A4A] mb-4">Citas de Hoy</h3>
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-4 p-4 rounded-[16px] bg-[#FAFAFA] hover:bg-[#E8F5EE]/30 transition-colors">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-[#E8F5EE] text-[#0E8C5E] font-nunito font-bold text-xs">{apt.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-inter font-semibold text-sm text-[#4A4A4A]">{apt.patient}</div>
                  <div className="font-inter text-xs text-[#8A8A8A]">{apt.doctor} · {apt.type}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-inter font-semibold text-sm text-[#0E8C5E]">{apt.time}</div>
                  <StatusBadge status={apt.status} />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {apt.status === 'pending' && !checkedIn.has(apt.id) && (
                    <OasisButton size="sm" onClick={() => handleCheckIn(apt.id)}>
                      <Check size={14} className="mr-1" /> Check-in
                    </OasisButton>
                  )}
                  {checkedIn.has(apt.id) && (
                    <span className="text-xs font-inter text-[#0E8C5E] font-semibold bg-[#E8F5EE] px-3 py-1 rounded-full">Check-in</span>
                  )}
                  {apt.status === 'completed' && (
                    <button
                      onClick={() => openChargeModal(apt)}
                      className="capsule bg-[#0077B6] text-white px-3 py-1.5 text-xs font-inter font-semibold hover:scale-103 transition-transform"
                    >
                      <DollarSign size={12} className="inline mr-1" /> Cobrar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </OasisCard>
      </div>

      {/* Nueva Cita Modal */}
      <Dialog open={newAptOpen} onOpenChange={setNewAptOpen}>
        <DialogContent className="modal-oasis max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Nueva Cita</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="font-inter font-medium text-sm text-[#4A4A4A]">Nombre del Paciente</label>
              <input
                className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none"
                placeholder="Nombre completo del paciente"
                value={newAptForm.patient}
                onChange={(e) => setNewAptForm(prev => ({ ...prev, patient: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Doctor</label>
                <select
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none"
                  value={newAptForm.doctor}
                  onChange={(e) => setNewAptForm(prev => ({ ...prev, doctor: e.target.value }))}
                >
                  {doctorOptions.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Tipo de Cita</label>
                <select
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none"
                  value={newAptForm.type}
                  onChange={(e) => setNewAptForm(prev => ({ ...prev, type: e.target.value }))}
                >
                  {typeOptions.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Fecha</label>
                <input
                  type="date"
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none"
                  value={newAptForm.date}
                  onChange={(e) => setNewAptForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Hora</label>
                <input
                  type="time"
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none"
                  value={newAptForm.time}
                  onChange={(e) => setNewAptForm(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="font-inter font-medium text-sm text-[#4A4A4A]">Notas</label>
              <textarea
                className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none resize-none"
                rows={3}
                placeholder="Notas adicionales sobre la cita..."
                value={newAptForm.notes}
                onChange={(e) => setNewAptForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <OasisButton variant="ghost" onClick={() => setNewAptOpen(false)}>Cancelar</OasisButton>
              <OasisButton onClick={handleNewApt} disabled={!newAptForm.patient.trim()}>
                <CalIcon size={16} className="mr-1" /> Crear Cita
              </OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Charge Modal */}
      <Dialog open={chargeOpen} onOpenChange={(open) => { if (!open) { setChargeOpen(false); setChargeSuccess(false); setSelectedPayment(null) } }}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Cobrar Consulta</DialogTitle>
          </DialogHeader>
          {selectedApt && (
            <div className="space-y-4 mt-4">
              {chargeSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#E8F5EE] flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-[#0E8C5E]" />
                  </div>
                  <p className="font-nunito font-bold text-lg text-[#0E8C5E]">Cobro exitoso</p>
                  <p className="font-inter text-sm text-[#8A8A8A]">Factura generada correctamente</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-[14px] bg-[#E8F5EE]/50">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-[#0E8C5E] text-white font-nunito font-bold text-xs">{selectedApt.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-inter font-semibold text-sm">{selectedApt.patient}</div>
                      <div className="font-inter text-xs text-[#8A8A8A]">{selectedApt.type}</div>
                    </div>
                  </div>
                  <div>
                    <label className="font-inter font-medium text-sm text-[#4A4A4A]">Monto</label>
                    <input className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" placeholder="C$500" />
                  </div>
                  <div>
                    <label className="font-inter font-medium text-sm text-[#4A4A4A] mb-2 block">Método de pago</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'Efectivo', icon: <Banknote size={20} className='mx-auto text-[#0E8C5E]' /> },
                        { key: 'Tarjeta', icon: <CreditCard size={20} className='mx-auto text-[#0077B6]' /> },
                        { key: 'Seguro', icon: <Shield size={20} className='mx-auto text-[#0E8C5E]' /> },
                      ].map((m) => (
                        <button
                          key={m.key}
                          onClick={() => setSelectedPayment(m.key)}
                          className={`p-3 rounded-[14px] border-2 text-center transition-all text-sm font-inter ${
                            selectedPayment === m.key
                              ? 'border-[#0E8C5E] bg-[#E8F5EE] shadow-sm'
                              : 'border-[#E0E0E0] hover:border-[#0E8C5E] hover:bg-[#E8F5EE]/50'
                          }`}
                        >
                          {m.icon}
                          <span className={`text-xs ${selectedPayment === m.key ? 'text-[#0E8C5E] font-semibold' : ''}`}>{m.key}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <OasisButton className="w-full" onClick={handleCharge} disabled={!selectedPayment}>
                    <DollarSign size={16} className="mr-1" /> Cobrar y Facturar
                  </OasisButton>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
