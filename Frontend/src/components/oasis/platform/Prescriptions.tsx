'use client'

import { useState } from 'react'
import { Search, Plus, X, AlertTriangle, PenTool, Eye, Pill } from 'lucide-react'
import { OasisCard, OasisButton } from '../shared/shared-components'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const medications = [
  { name: 'Amoxicilina 500mg', dose: '1 cápsula', duration: '7 días' },
  { name: 'Ibuprofeno 400mg', dose: '1 tableta', duration: '5 días' },
]

const addedMeds = [
  { id: 1, name: 'Amoxicilina 500mg', dose: '1 cápsula cada 8 horas', duration: '7 días' },
  { id: 2, name: 'Paracetamol 500mg', dose: '2 tabletas cada 6 horas', duration: '3 días' },
]

const allergies = ['Penicilina']

export default function Prescriptions() {
  const [searchMed, setSearchMed] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [signOpen, setSignOpen] = useState(false)

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Recetas Médicas</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Crear y firmar recetas digitales</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Patient & Diagnosis */}
        <div className="space-y-4">
          <OasisCard>
            <h3 className="font-nunito font-bold text-base text-[#4A4A4A] mb-4">Datos del Paciente</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-inter text-xs text-[#8A8A8A]">Nombre</label>
                  <div className="font-inter font-medium text-sm text-[#4A4A4A]">María López</div>
                </div>
                <div>
                  <label className="font-inter text-xs text-[#8A8A8A]">Edad</label>
                  <div className="font-inter font-medium text-sm text-[#4A4A4A]">34 años</div>
                </div>
              </div>
              {allergies.length > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-[14px] bg-[#FFF3E0] border border-[#F4A261]/30">
                  <AlertTriangle size={16} className="text-[#F4A261] flex-shrink-0" />
                  <span className="font-inter text-sm text-[#4A4A4A]">Alergias: <strong>{allergies.join(', ')}</strong></span>
                </div>
              )}
            </div>
          </OasisCard>

          <OasisCard>
            <h3 className="font-nunito font-bold text-base text-[#4A4A4A] mb-4">Diagnóstico</h3>
            <textarea
              className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-3 font-inter text-sm rounded-[14px] focus:border-[#0E8C5E] focus:outline-none resize-none"
              rows={4}
              placeholder="Escriba el diagnóstico..."
              defaultValue="Infección de vías urinarias. Paciente presenta dolor al orinar y fiebre leve."
            />
          </OasisCard>

          {/* Interaction alert */}
          <div className="flex items-center gap-3 p-4 rounded-[16px] bg-[#FFF3E0] border border-[#F4A261]/30">
            <div className="w-10 h-10 rounded-full bg-[#F4A261]/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-[#F4A261]" />
            </div>
            <div>
              <div className="font-inter font-semibold text-sm text-[#4A4A4A]">Posible interacción</div>
              <div className="font-inter text-xs text-[#8A8A8A]">Ibuprofeno puede potenciar el efecto de Amoxicilina en pacientes con historial renal.</div>
            </div>
          </div>
        </div>

        {/* Right: Medications */}
        <div className="space-y-4">
          <OasisCard>
            <h3 className="font-nunito font-bold text-base text-[#4A4A4A] mb-4">Medicamentos</h3>
            {/* Search */}
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
              <input
                value={searchMed}
                onChange={(e) => setSearchMed(e.target.value)}
                placeholder="Buscar medicamento..."
                className="w-full input-oasis border-2 border-[#E0E0E0] bg-white px-4 py-2.5 pl-10 text-sm font-inter rounded-full focus:border-[#0E8C5E] focus:outline-none"
              />
            </div>

            {/* Added medications */}
            <div className="space-y-3">
              {addedMeds.map((med) => (
                <div key={med.id} className="p-3 rounded-[14px] bg-[#E8F5EE]/30 border border-[#E8F5EE]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-inter font-semibold text-sm text-[#4A4A4A]">{med.name}</span>
                    <button className="p-1 rounded-full hover:bg-[#FEE2E2] text-[#8A8A8A] hover:text-[#EF4444] transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-inter text-[10px] text-[#8A8A8A]">Dosis</label>
                      <input className="w-full border border-[#E0E0E0] rounded-[10px] px-2 py-1 text-xs font-inter" defaultValue={med.dose} />
                    </div>
                    <div>
                      <label className="font-inter text-[10px] text-[#8A8A8A]">Duración</label>
                      <input className="w-full border border-[#E0E0E0] rounded-[10px] px-2 py-1 text-xs font-inter" defaultValue={med.duration} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <OasisButton variant="outline" size="sm" className="w-full mt-3">
              <Plus size={14} className="mr-1" /> Agregar Medicamento
            </OasisButton>
          </OasisCard>

          {/* Action buttons */}
          <div className="flex gap-3">
            <OasisButton variant="outline" className="flex-1" onClick={() => setPreviewOpen(true)}>
              <Eye size={16} className="mr-2" /> Previsualizar
            </OasisButton>
            <OasisButton className="flex-1" onClick={() => setSignOpen(true)}>
              <PenTool size={16} className="mr-2" /> Firmar Digitalmente
            </OasisButton>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="modal-oasis max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Vista Previa de Receta</DialogTitle>
          </DialogHeader>
          <div className="bg-white rounded-[20px] border-2 border-[#E8F5EE] p-6 mt-4 relative">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <svg width="200" height="260" viewBox="0 0 40 52" fill="none">
                <path d="M20 0C20 0 0 25 0 35C0 43.284 8.954 50 20 50C31.046 50 40 43.284 40 35C40 25 20 0 20 0Z" fill="#0E8C5E"/>
              </svg>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E0E0E0]">
                <svg width="20" height="26" viewBox="0 0 36 47" fill="none">
                  <path d="M18 0C18 0 0 22.5 0 31.5C0 39.784 8.059 47 18 47C27.941 47 36 39.784 36 31.5C36 22.5 18 0 18 0Z" fill="url(#prevGrad)"/>
                  <defs><linearGradient id="prevGrad" x1="0" y1="0" x2="36" y2="47" gradientUnits="userSpaceOnUse"><stop stopColor="#0E8C5E"/><stop offset="1" stopColor="#0077B6"/></linearGradient></defs>
                </svg>
                <span className="font-nunito font-bold text-[#0E8C5E] text-sm">Oasis Health - Receta Digital</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-inter mb-4">
                <div><span className="text-[#8A8A8A]">Paciente:</span> María López</div>
                <div><span className="text-[#8A8A8A]">Fecha:</span> 20 Ene 2025</div>
                <div><span className="text-[#8A8A8A]">Doctor:</span> Dr. Carlos Ruiz</div>
                <div><span className="text-[#8A8A8A]">Clínica:</span> Clínica Oasis</div>
              </div>
              <div className="text-xs font-inter text-[#8A8A8A] mb-2">Diagnóstico:</div>
              <div className="text-xs font-inter text-[#4A4A4A] mb-4">Infección de vías urinarias</div>
              <div className="space-y-2">
                {addedMeds.map((med) => (
                  <div key={med.id} className="flex items-center gap-2 text-xs font-inter p-2 rounded-[10px] bg-[#E8F5EE]/30">
                    <Pill size={14} className="text-[#0E8C5E]" />
                    <span className="font-semibold">{med.name}</span>
                    <span className="text-[#8A8A8A]">— {med.dose}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sign Modal */}
      <Dialog open={signOpen} onOpenChange={setSignOpen}>
        <DialogContent className="modal-oasis max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Firma Digital</DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-center space-y-4">
            <p className="font-inter text-sm text-[#8A8A8A]">Ingresa tu PIN de 4 dígitos para firmar esta receta</p>
            <div className="flex justify-center gap-3">
              {[0,1,2,3].map(i => (
                <input key={i} className="w-12 h-12 text-center text-xl font-nunito font-bold border-2 border-[#E0E0E0] rounded-[14px] focus:border-[#0E8C5E] focus:outline-none" maxLength={1} type="password" />
              ))}
            </div>
            <OasisButton className="w-full" onClick={() => setSignOpen(false)}>
              Confirmar Firma
            </OasisButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
