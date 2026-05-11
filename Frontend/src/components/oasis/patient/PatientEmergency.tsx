'use client'

import { useState } from 'react'
import { ArrowLeft, Phone, Siren, MapPin, Clock, User, CheckCircle, Shield, AlertCircle } from 'lucide-react'
import { OasisButton, OasisIconButton, HeartbeatCheck, DropLoader } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'

export default function PatientEmergency() {
  const { navigate } = useNavigation()
  const [confirming, setConfirming] = useState(false)
  const [sent, setSent] = useState(false)
  const [sentTime, setSentTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)

  const handleSendAlert = async () => {
    setLoading(true)
    try {
      const { api } = await import('@/lib/api-client')
      let location = { lat: 0, lng: 0 }
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => 
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
          )
          location = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        } catch (e) { console.warn('Could not get GPS for emergency') }
      }

      const res = await api.post('/patient/emergency', { 
        latitude: location.lat, 
        longitude: location.lng 
      })
      
      if (res.success) {
        setResponse(res.data)
        const now = new Date()
        setSentTime(`${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`)
        setSent(true)
      }
    } catch (err) {
      console.error('Emergency alert failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCall911 = () => {
    window.location.href = 'tel:911'
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-[10px] border-b border-[#E0E0E0]/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('patient-profile')}><ArrowLeft size={20} className="text-[#4A4A4A]" /></button>
          <h1 className="font-nunito font-bold text-lg text-[#F4A261]">Emergencia</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {sent ? (
          <div className="text-center float-up w-full max-w-sm">
            <HeartbeatCheck size={80} color="#0E8C5E" />
            <h2 className="font-nunito font-bold text-2xl text-[#0E8C5E] mt-6 mb-2">Alerta enviada</h2>
            <p className="font-inter text-sm text-[#8A8A8A] mb-6">Tu contacto de emergencia ha sido notificado.</p>

            {/* Emergency Response Info */}
            <div className="space-y-3 text-left">
              <div className="p-4 rounded-[16px] bg-[#E8F5EE] space-y-3">
                <h3 className="font-nunito font-bold text-sm text-[#0E8C5E] flex items-center gap-2">
                  <Shield size={16} /> Información de respuesta
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <User size={14} className="text-[#0E8C5E]" />
                    <div>
                      <p className="font-inter font-semibold text-xs text-[#4A4A4A]">Contacto notificado</p>
                      <p className="font-inter text-xs text-[#8A8A8A]">{response?.contactNotified || 'Cargando...'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={14} className="text-[#F4A261]" />
                    <div>
                      <p className="font-inter font-semibold text-xs text-[#4A4A4A]">Hora de alerta</p>
                      <p className="font-inter text-xs text-[#8A8A8A]">{sentTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle size={14} className="text-[#0E8C5E]" />
                    <div>
                      <p className="font-inter font-semibold text-xs text-[#4A4A4A]">Estado</p>
                      <p className="font-inter text-xs text-[#0E8C5E]">{response?.message || 'Notificación recibida'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <OasisButton 
                className="w-full bg-[#0E8C5E]"
                onClick={() => window.location.href = `tel:${response?.contactPhone || '911'}`}
              >
                 <Phone size={16} className="mr-2" /> Llamar a {response?.contactNotified?.split(' ')[0] || 'Contacto'}
              </OasisButton>

              <div className="p-3 rounded-[12px] bg-[#FFF3E0] flex items-center gap-2">
                <AlertCircle size={14} className="text-[#F4A261]" />
                <span className="font-inter text-[10px] font-bold text-[#F4A261] uppercase">Emergencia real? Llama al 911 directamente</span>
              </div>
            </div>

            <OasisButton variant="outline" className="mt-4 w-full" onClick={() => { setSent(false); setConfirming(false); }}>
              Volver
            </OasisButton>
          </div>
        ) : confirming ? (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-[#FFF3E0] flex items-center justify-center mx-auto ripple-effect" />
              <Siren size={48} className="text-[#F4A261] absolute inset-0 m-auto" />
            </div>
            <h2 className="font-nunito font-bold text-xl text-[#4A4A4A]">Enviar alerta a tu contacto de emergencia?</h2>
            <p className="font-inter text-sm text-[#8A8A8A]">Se notificara a Carlos Lopez (Esposo) y se compartira tu ubicacion.</p>
            <div className="flex gap-3">
              <OasisButton variant="ghost" onClick={() => setConfirming(false)}>Cancelar</OasisButton>
              <OasisButton 
                onClick={handleSendAlert} 
                className="bg-[#F4A261] hover:bg-[#E09640]"
                disabled={loading}
              >
                {loading ? <DropLoader size={20} color="#FFF" /> : <><Phone size={16} className="mr-2" /> Enviar Alerta</>}
              </OasisButton>
            </div>
            
            <OasisButton variant="outline" className="w-full border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10" onClick={handleCall911}>
               <Phone size={16} className="mr-2" /> Llamar 911 Directo
            </OasisButton>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-32 h-32 rounded-full bg-[#FFF3E0] flex items-center justify-center mx-auto drop-loader">
              <Siren size={48} className="text-[#F4A261]" />
            </div>
            <div>
              <h2 className="font-nunito font-bold text-2xl text-[#4A4A4A] mb-2">Boton de Emergencia</h2>
              <p className="font-inter text-sm text-[#8A8A8A]">Presiona para alertar a tu contacto de emergencia</p>
            </div>
            <button
              onClick={() => setConfirming(true)}
              className="w-40 h-40 rounded-full bg-[#F4A261] text-white flex items-center justify-center mx-auto shadow-xl hover:scale-105 transition-transform active:scale-95"
            >
              <span className="font-nunito font-bold text-lg">SOS</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
