import React, { useState, useEffect } from 'react'
import { ArrowLeft, QrCode, RefreshCw, CheckCircle, FileText, Calendar, User, Pill, Activity, ChevronDown, ChevronUp, Search, Clock, Home, ShoppingBag, Heart } from 'lucide-react'
import { OasisCard, OasisButton, OasisIconButton, StatusBadge, DropLoader, ErrorState, EmptyState, WaveSkeleton } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { api } from '@/lib/api-client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

export default function PatientPrescriptions() {
  const { navigate } = useNavigation()
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRx, setSelectedRx] = useState<any>(null)
  const [refillDialogOpen, setRefillDialogOpen] = useState(false)
  const [refillRx, setRefillRx] = useState<any>(null)
  const [refillSuccess, setRefillSuccess] = useState(false)

  useEffect(() => {
    loadPrescriptions()
  }, [])

  async function loadPrescriptions() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/patient/prescriptions')
      if (res.success && res.data) {
        setPrescriptions(res.data)
      }
    } catch (err) {
      setError('No pudimos cargar tus recetas médicas.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefillClick = (rx: any) => {
    setRefillRx(rx)
    setRefillSuccess(false)
    setRefillDialogOpen(true)
  }

  const handleConfirmRefill = async () => {
    if (!refillRx) return
    try {
       // In a real app, this would be a POST to /patient/prescriptions/:id/refill
       await new Promise(r => setTimeout(r, 1000))
       setRefillSuccess(true)
    } catch {
       alert('Error al solicitar reabastecimiento')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 space-y-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('patient-feed')} className="w-10 h-10 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#4A4A4A] hover:bg-[#F0F0F0] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-nunito font-bold text-xl text-[#4A4A4A]">Mis Recetas</h1>
        </div>
      </div>

      <div className="flex-1 px-6 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <WaveSkeleton key={i} className="h-32 w-full rounded-[24px]" />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadPrescriptions} />
        ) : prescriptions.length === 0 ? (
          <EmptyState message="No tienes recetas registradas aún. Zumbi recomienda visitar a un profesional pronto." />
        ) : (
          <>
            {prescriptions.map((rx) => (
              <OasisCard 
                key={rx.id} 
                className={`transition-all duration-300 ${selectedRx?.id === rx.id ? 'ring-2 ring-[#0E8C5E]' : ''}`}
                onClick={() => setSelectedRx(selectedRx?.id === rx.id ? null : rx)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-[#0E8C5E] flex-shrink-0">
                      <FileText size={22} />
                    </div>
                    <div>
                      <h3 className="font-nunito font-bold text-[#4A4A4A]">{rx.doctor?.user?.name || 'Dr. Desconocido'}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-[#8A8A8A]">
                          <Calendar size={10} /> {new Date(rx.createdAt).toLocaleDateString()}
                        </div>
                        <StatusBadge status={rx.status === 'active' ? 'active' : 'completed'} />
                      </div>
                    </div>
                  </div>
                  {selectedRx?.id === rx.id ? <ChevronUp size={20} className="text-[#B0B0B0]" /> : <ChevronDown size={20} className="text-[#B0B0B0]" />}
                </div>

                <div className="mt-3">
                   <p className="font-inter text-xs text-[#8A8A8A] line-clamp-1">
                      {rx.items?.map((i: any) => i.medication?.name).join(', ') || 'Sin medicamentos listados'}
                   </p>
                </div>

                {selectedRx?.id === rx.id && (
                  <div className="mt-6 pt-6 border-t border-[#F0F0F0] space-y-6 animate-fade-in">
                    <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-[#F0F0F0]">
                       <div className="flex items-center gap-2 mb-2">
                          <Activity size={16} className="text-[#0077B6]" />
                          <p className="text-[10px] font-bold text-[#0077B6] uppercase">Diagnóstico & Notas</p>
                       </div>
                       <p className="font-inter text-sm text-[#4A4A4A] font-medium mb-1">{rx.diagnosis || 'Consulta General'}</p>
                       <p className="font-inter text-xs text-[#8A8A8A] italic">"{rx.notes || 'Siga las instrucciones del médico'}"</p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-[#8A8A8A] uppercase px-1">Medicamentos Recetados</p>
                      {rx.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-white border border-[#F0F0F0] rounded-xl">
                          <div className="w-8 h-8 rounded-lg bg-[#E8F5EE] flex items-center justify-center text-[#0E8C5E] flex-shrink-0">
                            <Pill size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="font-inter font-bold text-sm text-[#4A4A4A]">{item.medication?.name}</p>
                            <p className="font-inter text-xs text-[#8A8A8A]">{item.dosage} · {item.duration}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-bold text-[#0E8C5E]">{item.quantity} UNID.</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col items-center gap-4 bg-[#E8F5EE] p-6 rounded-[32px]">
                      <div className="relative group">
                         <div className="absolute -inset-2 bg-white rounded-[24px] blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
                         <div className="relative bg-white p-4 rounded-[24px] shadow-sm">
                            <QrCodeDisplay prescriptionId={rx.id} />
                         </div>
                      </div>
                      <p className="text-[10px] font-bold text-[#0E8C5E] text-center uppercase tracking-widest">Código de Validación Oasis</p>
                    </div>

                    <div className="flex gap-2">
                      <OasisButton fullWidth size="md" onClick={() => navigate('patient-search')}>
                         <Search size={16} className="mr-2" /> Buscar en Farmacias
                      </OasisButton>
                      {(rx.refillsLeft > 0 || rx.status === 'active') && (
                         <OasisIconButton 
                           size="lg" 
                           variant="primary" 
                           onClick={() => handleRefillClick(rx)}
                           icon={<RefreshCw size={20} />}
                         />
                      )}
                    </div>
                  </div>
                )}
              </OasisCard>
            ))}
          </>
        )}
      </div>

      {/* Refill Dialog */}
      <Dialog open={refillDialogOpen} onOpenChange={setRefillDialogOpen}>
        <DialogContent className="modal-oasis max-w-sm">
          {refillSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#E8F5EE] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle size={40} className="text-[#0E8C5E]" />
              </div>
              <div>
                 <h3 className="font-nunito font-bold text-xl text-[#4A4A4A]">Solicitud Enviada</h3>
                 <p className="font-inter text-sm text-[#8A8A8A] mt-1 px-4">
                    Tu médico recibirá la solicitud de reabastecimiento en instantes.
                 </p>
              </div>
              <OasisButton fullWidth onClick={() => setRefillDialogOpen(false)}>
                Entendido
              </OasisButton>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-nunito font-bold text-xl">Solicitar Reabastecimiento</DialogTitle>
                <DialogDescription className="font-inter text-sm">
                  ¿Deseas enviar una solicitud al {refillRx?.doctor?.user?.name} para renovar esta receta?
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#F0F0F0] space-y-3">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-[#8A8A8A] uppercase">Receta ID</span>
                      <span className="font-inter text-xs font-bold text-[#4A4A4A]">#{refillRx?.id.slice(-6).toUpperCase()}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-[#8A8A8A] uppercase">Reabastecimientos</span>
                      <span className="font-inter text-xs font-bold text-[#0E8C5E]">{refillRx?.refillsLeft || 0} Restantes</span>
                   </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <OasisButton fullWidth variant="ghost" onClick={() => setRefillDialogOpen(false)}>
                  Cancelar
                </OasisButton>
                <OasisButton fullWidth onClick={handleConfirmRefill}>
                  Enviar Solicitud
                </OasisButton>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-6 pt-2 bg-white/80 backdrop-blur-md z-40 border-t border-[#F0F0F0]/50">
        <div className="bg-[#4A4A4A] rounded-[32px] h-16 flex items-center justify-around px-2 shadow-2xl">
          {[
            { icon: Home, label: 'Inicio', view: 'patient-feed' as const },
            { icon: ShoppingBag, label: 'Pedidos', view: 'patient-orders' as const },
            { icon: Heart, label: 'Recetas', view: 'patient-prescriptions' as const },
            { icon: User, label: 'Perfil', view: 'patient-profile' as const },
          ].map((item, i) => {
            const isActive = 'patient-prescriptions' === item.view
            return (
              <button
                key={i}
                onClick={() => navigate(item.view)}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${
                  isActive ? 'bg-[#0E8C5E] text-white scale-110' : 'text-white/40 hover:text-white/60'
                }`}
              >
                <item.icon size={22} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function QrCodeDisplay({ prescriptionId }: { prescriptionId: string }) {
  const [qr, setQr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchQr() {
      try {
        const res = await api.get(`/prescriptions/${prescriptionId}/qr`)
        if (res.success && res.data.qrBase64) {
          setQr(res.data.qrBase64)
        }
      } catch (e) {
        console.error('Failed to load QR:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchQr()
  }, [prescriptionId])

  if (loading) return <div className="w-[120px] h-[120px] bg-[#FAFAFA] animate-pulse rounded-lg" />
  if (!qr) return <QrCode size={120} className="text-[#B0B0B0]" />

  return (
    <img 
      src={qr} 
      alt="Prescription QR Code" 
      className="w-[120px] h-[120px] object-contain"
    />
  )
}
