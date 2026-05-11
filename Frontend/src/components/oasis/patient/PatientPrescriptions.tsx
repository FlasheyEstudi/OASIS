'use client'

import { useState } from 'react'
import { ArrowLeft, QrCode, RefreshCw, CheckCircle } from 'lucide-react'
import { OasisCard, OasisButton, OasisIconButton, StatusBadge } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

const prescriptions = [
  { id: 1, date: '20 Ene 2025', doctor: 'Dr. Carlos Ruiz', meds: 'Amoxicilina 500mg, Paracetamol 500mg', status: 'active' as const, refills: 2 },
  { id: 2, date: '03 Nov 2024', doctor: 'Dr. Luis Hernández', meds: 'Losartán 50mg', status: 'active' as const, refills: 5 },
  { id: 3, date: '15 Jul 2024', doctor: 'Dra. María Martínez', meds: 'Ibuprofeno 400mg', status: 'completed' as const, refills: 0 },
]

export default function PatientPrescriptions() {
  const { navigate } = useNavigation()
  const [selectedRx, setSelectedRx] = useState<typeof prescriptions[0] | null>(null)
  const [refillDialogOpen, setRefillDialogOpen] = useState(false)
  const [refillRx, setRefillRx] = useState<typeof prescriptions[0] | null>(null)
  const [refillSuccess, setRefillSuccess] = useState(false)
  const [refilledIds, setRefilledIds] = useState<Set<number>>(new Set())

  const handleRefillClick = (rx: typeof prescriptions[0]) => {
    setRefillRx(rx)
    setRefillSuccess(false)
    setRefillDialogOpen(true)
  }

  const handleConfirmRefill = () => {
    if (refillRx) {
      setRefillSuccess(true)
      setRefilledIds(prev => new Set([...prev, refillRx.id]))
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-[10px] border-b border-[#E0E0E0]/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('patient-profile')}><ArrowLeft size={20} className="text-[#4A4A4A]" /></button>
          <h1 className="font-nunito font-bold text-lg text-[#4A4A4A]">Mis Recetas</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-3">
        {prescriptions.map((rx) => (
          <OasisCard key={rx.id} className="!p-4" onClick={() => setSelectedRx(selectedRx?.id === rx.id ? null : rx)}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-inter text-xs text-[#8A8A8A]">{rx.date}</span>
              <StatusBadge status={rx.status} />
            </div>
            <div className="font-inter font-semibold text-sm text-[#4A4A4A] mb-1">{rx.doctor}</div>
            <div className="font-inter text-xs text-[#8A8A8A] mb-3">{rx.meds}</div>

            {selectedRx?.id === rx.id && (
              <div className="pt-3 border-t border-[#E0E0E0] space-y-3">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="w-40 h-40 bg-[#E8F5EE] rounded-[16px] flex items-center justify-center">
                    <QrCode size={60} className="text-[#0E8C5E]" />
                  </div>
                </div>
                <p className="text-center text-[10px] font-inter text-[#8A8A8A]">Muestra este QR en la farmacia</p>
                {rx.refills > 0 && (
                  <OasisButton
                    variant={refilledIds.has(rx.id) ? 'success' : 'outline'}
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!refilledIds.has(rx.id)) {
                        handleRefillClick(rx)
                      }
                    }}
                    disabled={refilledIds.has(rx.id)}
                  >
                    {refilledIds.has(rx.id) ? (
                      <><CheckCircle size={14} className="mr-1" /> Reabastecimiento solicitado</>
                    ) : (
                      <><RefreshCw size={14} className="mr-1" /> Solicitar reabastecimiento ({rx.refills} restantes)</>
                    )}
                  </OasisButton>
                )}
              </div>
            )}
          </OasisCard>
        ))}
      </div>

      {/* Refill Confirmation Dialog */}
      <Dialog open={refillDialogOpen} onOpenChange={setRefillDialogOpen}>
        <DialogContent className="rounded-[20px] max-w-sm">
          {refillSuccess ? (
            <div className="py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#E8F5EE] flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-[#0E8C5E]" />
              </div>
              <h3 className="font-nunito font-bold text-lg text-[#0E8C5E] mb-2">Solicitud enviada</h3>
              <p className="font-inter text-sm text-[#8A8A8A] mb-4">
                Tu solicitud de reabastecimiento para <strong className="text-[#4A4A4A]">{refillRx?.meds}</strong> ha sido procesada.
              </p>
              <p className="font-inter text-xs text-[#8A8A8A] mb-4">
                Recibirás una notificación cuando esté lista para recoger.
              </p>
              <OasisButton onClick={() => setRefillDialogOpen(false)} className="w-full">
                Entendido
              </OasisButton>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-nunito font-bold text-[#4A4A4A]">Solicitar reabastecimiento</DialogTitle>
                <DialogDescription className="font-inter text-[#8A8A8A]">
                  Confirma la solicitud de reabastecimiento de tu receta
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-3">
                <div className="p-3 rounded-[12px] bg-[#FAFAFA] space-y-2">
                  <div className="flex justify-between">
                    <span className="font-inter text-xs text-[#8A8A8A]">Doctor</span>
                    <span className="font-inter text-sm text-[#4A4A4A]">{refillRx?.doctor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-inter text-xs text-[#8A8A8A]">Medicamentos</span>
                    <span className="font-inter text-sm text-[#4A4A4A]">{refillRx?.meds}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-inter text-xs text-[#8A8A8A]">Reabastecimientos restantes</span>
                    <span className="font-inter text-sm text-[#0E8C5E] font-semibold">{refillRx?.refills}</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <OasisButton variant="ghost" onClick={() => setRefillDialogOpen(false)}>
                  Cancelar
                </OasisButton>
                <OasisButton onClick={handleConfirmRefill}>
                  <RefreshCw size={14} className="mr-1" /> Confirmar solicitud
                </OasisButton>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
