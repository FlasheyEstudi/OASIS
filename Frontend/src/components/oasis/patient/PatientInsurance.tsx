import { ArrowLeft, Shield, Plus, Calendar, Hash, CreditCard, CheckCircle, Info, Home, ShoppingBag, Heart, User } from 'lucide-react'
import { OasisCard, OasisButton, DropLoader, EmptyState, WaveSkeleton } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { api } from '@/lib/api-client'

export default function PatientInsurance() {
  const { navigate } = useNavigation()
  const [insurances, setInsurances] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formProvider, setFormProvider] = useState('Seguros América')
  const [formPolicy, setFormPolicy] = useState('')
  const [formExpiry, setFormExpiry] = useState('')

  useEffect(() => {
    loadInsurances()
  }, [])

  async function loadInsurances() {
    setLoading(true)
    try {
      const res = await api.get('/patient/insurance')
      if (res.success && res.data) {
        setInsurances(res.data)
      }
    } catch {
      console.error('Failed to load insurances')
    } finally {
      setLoading(false)
    }
  }

  const handleAddInsurance = async () => {
    if (!formProvider || !formPolicy) return
    try {
      const res = await api.post('/patient/insurance', {
        provider: formProvider,
        policyNumber: formPolicy,
        validUntil: formExpiry
      })
      if (res.success) {
        loadInsurances()
        setDialogOpen(false)
        setFormPolicy('')
      }
    } catch {
      alert('Error al guardar seguro')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('patient-profile')} className="w-11 h-11 rounded-2xl bg-[#FAFAFA] flex items-center justify-center text-[#4A4A4A] border border-[#F0F0F0]">
              <ArrowLeft size={20} />
            </button>
            <div>
               <h1 className="font-nunito font-black text-2xl text-[#4A4A4A]">Seguros</h1>
               <p className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest">Tus pólizas activas</p>
            </div>
          </div>
          <button 
            onClick={() => setDialogOpen(true)}
            className="w-12 h-12 rounded-full oasis-gradient text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all"
          >
             <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 space-y-6">
        {loading ? (
          <div className="space-y-6">
             {[1, 2].map(i => <WaveSkeleton key={i} className="h-56 w-full rounded-[32px]" />)}
          </div>
        ) : insurances.length === 0 ? (
          <EmptyState message="No tienes seguros registrados. Agrega uno para agilizar tus consultas." />
        ) : (
          insurances.map((ins, i) => (
            <div key={i} className="relative group perspective-1000">
               {/* Digital Insurance Card - Premium Design */}
               <div className="relative w-full h-56 rounded-[32px] p-8 overflow-hidden shadow-2xl transition-all duration-500 hover:rotate-y-6 hover:scale-[1.02]">
                  {/* Card Background (Glassmorphism & Gradients) */}
                  <div className={`absolute inset-0 z-0 ${i % 2 === 0 ? 'bg-gradient-to-br from-[#0E8C5E] to-[#0077B6]' : 'bg-gradient-to-br from-[#1E293B] to-[#4A4A4A]'}`} />
                  <div className="absolute inset-0 z-1 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                  
                  {/* Card Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between text-white">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
                              <Shield size={24} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Aseguradora</p>
                              <h3 className="font-nunito font-black text-lg">{ins.provider}</h3>
                           </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase border border-white/30">
                           {ins.isActive ? 'Póliza Activa' : 'Inactiva'}
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="space-y-1">
                           <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Número de Póliza</p>
                           <p className="font-inter font-bold text-xl tracking-wider truncate">
                              {ins.policyNumber.replace(/(.{4})/g, '$1 ')}
                           </p>
                        </div>
                        
                        <div className="flex justify-between items-end">
                           <div className="flex gap-6">
                              <div>
                                 <p className="text-[8px] font-black uppercase tracking-widest opacity-50">Vence</p>
                                 <p className="text-xs font-bold">{ins.validUntil ? new Date(ins.validUntil).toLocaleDateString() : 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-[8px] font-black uppercase tracking-widest opacity-50">Copago</p>
                                 <p className="text-xs font-bold">{ins.copayPercentage}%</p>
                              </div>
                           </div>
                           <div className="w-12 h-8 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20">
                              <CreditCard size={20} className="opacity-80" />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               
               {/* Card Actions/Info Below */}
               <div className="mt-4 px-4 flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2">
                     <CheckCircle size={12} className="text-[#0E8C5E]" />
                     <span className="text-[10px] font-bold text-[#4A4A4A] uppercase tracking-tighter">Verificado por Oasis</span>
                  </div>
                  <button className="text-[10px] font-black text-[#0077B6] uppercase underline">Ver Detalles</button>
               </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="modal-oasis max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-nunito font-black text-2xl text-[#4A4A4A]">Vincular Póliza</DialogTitle>
            <DialogDescription className="text-xs">Agrega tu seguro para obtener descuentos automáticos.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#8A8A8A] uppercase tracking-widest ml-2">Proveedor</label>
              <select 
                value={formProvider}
                onChange={(e) => setFormProvider(e.target.value)}
                className="w-full h-14 border-2 border-[#F0F0F0] bg-[#FAFAFA] px-6 font-inter text-sm text-[#4A4A4A] rounded-[24px] focus:border-[#0E8C5E] outline-none"
              >
                <option>Seguros América</option>
                <option>Mapfre</option>
                <option>ASSA</option>
                <option>Iniser</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#8A8A8A] uppercase tracking-widest ml-2">Número de Póliza</label>
              <div className="relative">
                 <Hash size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B0B0B0]" />
                 <input 
                   value={formPolicy}
                   onChange={(e) => setFormPolicy(e.target.value)}
                   className="w-full h-14 border-2 border-[#F0F0F0] bg-[#FAFAFA] pl-14 pr-6 font-inter text-sm text-[#4A4A4A] rounded-[24px] focus:border-[#0E8C5E] outline-none" 
                   placeholder="POL-000000" 
                 />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#8A8A8A] uppercase tracking-widest ml-2">Fecha Vencimiento</label>
              <div className="relative">
                 <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B0B0B0]" />
                 <input 
                   type="date" 
                   value={formExpiry}
                   onChange={(e) => setFormExpiry(e.target.value)}
                   className="w-full h-14 border-2 border-[#F0F0F0] bg-[#FAFAFA] pl-14 pr-6 font-inter text-sm text-[#4A4A4A] rounded-[24px] focus:border-[#0E8C5E] outline-none" 
                 />
              </div>
            </div>
            
            <div className="p-4 bg-[#E0F2FE] rounded-2xl flex items-start gap-3 border border-[#0077B6]/10">
               <Info size={16} className="text-[#0077B6] mt-0.5" />
               <p className="text-[10px] font-inter font-medium text-[#0077B6] leading-tight">
                  Tus datos de póliza se verificarán con la aseguradora antes de aplicarse a tus pedidos.
               </p>
            </div>
          </div>
          <DialogFooter className="flex-col gap-3">
             <OasisButton fullWidth size="lg" onClick={handleAddInsurance} disabled={!formPolicy}>
                Guardar Póliza
             </OasisButton>
             <button onClick={() => setDialogOpen(false)} className="text-[10px] font-black text-[#8A8A8A] uppercase tracking-widest">
                Cancelar
             </button>
          </DialogFooter>
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
            const isActive = 'patient-profile' === item.view
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
