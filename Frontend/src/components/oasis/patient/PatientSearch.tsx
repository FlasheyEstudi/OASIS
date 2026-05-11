'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, ArrowLeft, QrCode, MapPin, Clock, Star, CheckCircle, Loader2 } from 'lucide-react'
import { OasisCard, OasisButton, OasisIconButton, DropLoader, ErrorState } from '../shared/shared-components'
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
  const [recogerDialogOpen, setRecogerDialogOpen] = useState(false)
  const [recogerPharmacy, setRecogerPharmacy] = useState<any>(null)
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
      // Use Managua coordinates for demo
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
        setQrResult('Medicamento encontrado')
        // In a real app, we would use the QR code to search
        setQuery('Amoxicilina')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [qrScanning])

  const handleRecoger = (pharmacy: any) => {
    setRecogerPharmacy(pharmacy)
    setRecogerDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-[10px] border-b border-[#E0E0E0]/50 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('patient-feed')} className="text-[#4A4A4A]">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nombre del medicamento..."
              className="w-full border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 pl-10 text-sm font-inter rounded-full focus:border-[#0E8C5E] focus:outline-none"
              autoFocus
            />
          </div>
          <OasisIconButton
            onClick={handleQrScan}
            icon={<QrCode size={16} className="text-[#0E8C5E]" />}
            variant="ghost"
            size="sm"
            className="bg-[#E8F5EE]"
          />
        </div>
        <p className="text-xs font-inter text-[#8A8A8A] text-center">Escanea el QR de tu receta o escribe el medicamento</p>
      </div>

      {/* Results */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <DropLoader size={48} />
            <p className="mt-4 font-inter text-sm text-[#8A8A8A]">Buscando farmacias...</p>
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={performSearch} />
        ) : results.length === 0 ? (
          <div className="py-20 text-center">
            {query.length < 2 ? (
              <p className="font-inter text-sm text-[#8A8A8A]">Escribe el nombre de un medicamento para comenzar</p>
            ) : (
              <p className="font-inter text-sm text-[#8A8A8A]">No encontramos resultados para "{query}"</p>
            )}
          </div>
        ) : (
          <>
            <h3 className="font-nunito font-bold text-base text-[#4A4A4A]">
              {results.length} medicamentos encontrados
            </h3>

            {results.map((med, i) => (
              <div key={med.id} className="space-y-3">
                <div className="font-inter text-xs font-bold text-[#0E8C5E] uppercase tracking-wider">{med.name} - {med.strength}</div>
                {med.pharmacies.map((p: any, j: number) => (
                  <OasisCard key={j}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-nunito font-bold text-sm text-[#4A4A4A]">{p.pharmacyName}</div>
                        <div className="flex items-center gap-3 text-xs font-inter text-[#8A8A8A] mt-0.5">
                          <span className="flex items-center gap-1"><MapPin size={10} /> {p.distance ? `${p.distance.toFixed(1)} km` : '---'}</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> 30 min</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-nunito font-bold text-lg text-[#0E8C5E]">C${p.sellingPrice}</div>
                        <div className="text-[10px] font-inter text-[#8A8A8A]">Stock: {p.quantity}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <OasisButton size="sm" className="flex-1" onClick={() => navigate('patient-orders')}>
                        Pedir aquí
                      </OasisButton>
                      <OasisButton variant="outline" size="sm" className="flex-1" onClick={() => handleRecoger(p)}>
                        Recoger
                      </OasisButton>
                    </div>
                  </OasisCard>
                ))}
              </div>
            ))}
          </>
        )}
      </div>

      {/* QR Scan Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="rounded-[20px] max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-[#4A4A4A]">Escanear QR</DialogTitle>
            <DialogDescription className="font-inter text-[#8A8A8A]">
              Apunta la cámara al código QR de tu receta médica
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            {qrScanning ? (
              <>
                <div className="w-40 h-40 bg-[#E8F5EE] rounded-[16px] flex items-center justify-center mb-4">
                  <Loader2 size={40} className="text-[#0E8C5E] animate-spin" />
                </div>
                <p className="font-inter text-sm text-[#8A8A8A]">Escaneando...</p>
              </>
            ) : qrResult ? (
              <>
                <div className="w-40 h-40 bg-[#E8F5EE] rounded-[16px] flex items-center justify-center mb-4">
                  <CheckCircle size={48} className="text-[#0E8C5E]" />
                </div>
                <p className="font-nunito font-bold text-base text-[#0E8C5E]">{qrResult}</p>
                <p className="font-inter text-xs text-[#8A8A8A] mt-1">Sincronizando con inventario cercano...</p>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Recoger Confirmation Dialog */}
      <Dialog open={recogerDialogOpen} onOpenChange={setRecogerDialogOpen}>
        <DialogContent className="rounded-[20px] max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-[#4A4A4A]">Recoger en farmacia</DialogTitle>
            <DialogDescription className="font-inter text-[#8A8A8A]">
              Confirma que deseas recoger tu pedido
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {recogerPharmacy && (
              <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#E8F5EE] mb-4">
                <MapPin size={20} className="text-[#0E8C5E]" />
                <div>
                  <p className="font-inter font-semibold text-sm text-[#4A4A4A]">{recogerPharmacy.pharmacyName}</p>
                  <p className="font-inter text-xs text-[#8A8A8A]">El pedido estará listo en 15-20 min</p>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <OasisButton variant="ghost" className="flex-1" onClick={() => setRecogerDialogOpen(false)}>
                Cancelar
              </OasisButton>
              <OasisButton className="flex-1" onClick={() => { setRecogerDialogOpen(false); navigate('patient-orders'); }}>
                Confirmar recoger
              </OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

