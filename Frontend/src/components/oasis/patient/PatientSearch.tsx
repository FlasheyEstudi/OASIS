import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Plus, ChevronRight, User as UserIcon, Phone, Hash, Heart, Shield, Home, ShoppingBag, User, Search, QrCode, MapPin, Clock, Star, CheckCircle, Loader2, Pill, Info } from 'lucide-react'
import { OasisCard, OasisButton, OasisIconButton, DropLoader, ErrorState, WaveSkeleton, EmptyState } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { api } from '@/lib/api-client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export default function PatientSearch() {
  const { navigate } = useNavigation()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrScanning, setQrScanning] = useState(false)
  const [qrResult, setQrResult] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const searchTimeout = useRef<any>(null)

  useEffect(() => {
    if (query.length >= 2) {
      if (searchTimeout.current) clearTimeout(searchTimeout.current)
      searchTimeout.current = setTimeout(() => {
        performSearch()
      }, 500)
    } else {
      setResults([])
    }
  }, [query])

  async function performSearch() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/patient/search-medications', { 
        q: query, 
        lat: 12.136, 
        lng: -86.251,
        radius: 15
      })
      if (res.success && res.data) {
        setResults(res.data)
      }
    } catch (err) {
      setError('Error al realizar la búsqueda')
    } finally {
      setLoading(false)
    }
  }

  const handleQrScan = () => {
    setQrDialogOpen(true)
    setQrScanning(true)
    setQrResult(null)
  }

  useEffect(() => {
    if (qrScanning) {
      const timer = setTimeout(() => {
        setQrScanning(false)
        setQrResult('Receta validada: Amoxicilina 500mg')
        setQuery('Amoxicilina')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [qrScanning])

  return (
    <div className="min-h-screen bg-white flex flex-col pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 space-y-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('patient-feed')} className="w-10 h-10 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#4A4A4A] hover:bg-[#F0F0F0] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-nunito font-bold text-xl text-[#4A4A4A]">Buscar Salud</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A8A] group-focus-within:text-[#0E8C5E] transition-colors">
              <Search size={20} />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="¿Qué medicamento buscas?"
              className="w-full h-14 border-2 border-[#F0F0F0] bg-[#FAFAFA] pl-12 pr-4 font-inter text-sm text-[#4A4A4A] rounded-[22px] focus:border-[#0E8C5E] focus:bg-white outline-none transition-all"
              autoFocus
            />
          </div>
          <button 
            onClick={handleQrScan}
            className="w-14 h-14 rounded-[22px] bg-[#E8F5EE] text-[#0E8C5E] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm"
          >
            <QrCode size={24} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <WaveSkeleton key={i} className="h-32 w-full rounded-[24px]" />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={performSearch} />
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
             <div className="w-24 h-24 rounded-full bg-[#FAFAFA] flex items-center justify-center">
                <Pill size={40} className="text-[#E0E0E0]" />
             </div>
             <div>
                <p className="font-nunito font-bold text-[#4A4A4A]">
                   {query.length < 2 ? 'Escribe para buscar' : `No hay resultados para "${query}"`}
                </p>
                <p className="font-inter text-xs text-[#8A8A8A]">Prueba con un nombre genérico o comercial</p>
             </div>
          </div>
        ) : (
          results.map((med) => (
            <div key={med.id} className="space-y-4">
               <div className="flex items-center gap-2 px-2">
                  <div className="w-1 h-4 bg-[#0E8C5E] rounded-full" />
                  <span className="font-nunito font-extrabold text-sm text-[#4A4A4A] uppercase tracking-wider">
                     {med.name} <span className="text-[#8A8A8A] font-normal lowercase">- {med.strength}</span>
                  </span>
               </div>
               
               {med.pharmacies.map((p: any, idx: number) => {
                  const isExpanded = expandedId === `${med.id}-${idx}`
                  return (
                    <OasisCard 
                      key={idx} 
                      className={`transition-all duration-300 ${isExpanded ? 'border-[#0E8C5E]' : ''}`}
                      onClick={() => setExpandedId(isExpanded ? null : `${med.id}-${idx}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-[#0E8C5E] flex-shrink-0">
                            <MapPin size={22} />
                          </div>
                          <div>
                            <h4 className="font-nunito font-bold text-[#4A4A4A]">{p.pharmacyName}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                               <div className="flex items-center gap-1 text-[10px] font-bold text-[#0E8C5E] bg-[#E8F5EE] px-1.5 py-0.5 rounded-md">
                                  <Clock size={10} /> 25 MIN
                               </div>
                               <span className="text-[10px] font-bold text-[#8A8A8A]">{p.distance?.toFixed(1)} KM</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="font-nunito font-black text-lg text-[#0E8C5E]">C${p.sellingPrice}</p>
                           <p className={`text-[10px] font-bold ${p.quantity > 5 ? 'text-[#0E8C5E]' : 'text-[#F4A261]'}`}>
                              STOCK: {p.quantity} UNID.
                           </p>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-[#F0F0F0] space-y-4 animate-fade-in">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <p className="text-[10px] font-bold text-[#8A8A8A] uppercase">Presentación</p>
                                 <p className="text-xs font-inter text-[#4A4A4A]">{med.presentation || 'Caja de 30 tabs'}</p>
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[10px] font-bold text-[#8A8A8A] uppercase">Laboratorio</p>
                                 <p className="text-xs font-inter text-[#4A4A4A]">Generifarma</p>
                              </div>
                           </div>
                           
                           <div className="bg-[#FAFAFA] p-3 rounded-xl border border-[#F0F0F0]">
                              <div className="flex items-center gap-2 mb-1">
                                 <Info size={12} className="text-[#0077B6]" />
                                 <p className="text-[10px] font-bold text-[#0077B6] uppercase">Indicación Médica</p>
                              </div>
                              <p className="text-[11px] font-inter text-[#4A4A4A] italic">"Tomar 1 cápsula cada 8 horas por 7 días"</p>
                           </div>

                           <div className="flex gap-2">
                              <OasisButton fullWidth size="sm" onClick={() => navigate('patient-orders')}>
                                 Pedir Delivery
                              </OasisButton>
                              <OasisButton fullWidth variant="outline" size="sm" onClick={() => navigate('patient-orders')}>
                                 Recoger Aquí
                              </OasisButton>
                           </div>
                        </div>
                      )}
                      
                      {!isExpanded && (
                         <div className="mt-2 flex justify-end">
                            <span className="text-[10px] font-bold text-[#0E8C5E] flex items-center gap-1 group">
                               Ver detalles <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                            </span>
                         </div>
                      )}
                    </OasisCard>
                  )
               })}
            </div>
          ))
        )}
      </div>

      {/* QR Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="modal-oasis max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-xl text-center">Escanear Receta</DialogTitle>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center gap-6">
            <div className="relative w-56 h-56 rounded-[32px] overflow-hidden border-4 border-white shadow-2xl">
               <div className="absolute inset-0 bg-[#4A4A4A] opacity-20" />
               <div className="absolute inset-0 flex items-center justify-center">
                  {qrScanning ? (
                     <div className="relative w-full h-full">
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0E8C5E] animate-[scanLine_2s_ease-in-out_infinite]" />
                        <Loader2 size={48} className="text-[#0E8C5E] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
                     </div>
                  ) : (
                     <CheckCircle size={64} className="text-[#0E8C5E] animate-bounce" />
                  )}
               </div>
            </div>
            
            <div className="text-center space-y-2">
               <h3 className="font-nunito font-bold text-lg text-[#4A4A4A]">
                  {qrScanning ? 'Sincronizando...' : '¡Receta Encontrada!'}
               </h3>
               <p className="font-inter text-sm text-[#8A8A8A] px-4">
                  {qrScanning 
                    ? 'Apunta al código QR de Oasis en tu hoja de consulta.' 
                    : 'Hemos detectado los medicamentos de tu última consulta.'}
               </p>
            </div>

            {!qrScanning && (
               <OasisButton fullWidth onClick={() => setQrDialogOpen(false)}>
                  Ver Resultados
               </OasisButton>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

