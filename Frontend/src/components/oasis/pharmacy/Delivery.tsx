'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { OasisCard, OasisButton, DropLoader, EmptyState, ErrorState } from '../shared/shared-components'
import { Bike, Phone, RefreshCcw, MapPin, DollarSign, Target, UserPlus, Send, Loader2 } from 'lucide-react'
import { api } from '@/lib/api-client'
import { oasisToast } from '@/lib/oasis-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

export default function Delivery() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState({
    enabled: true,
    fee: 50,
    radius: 5,
    internalOnly: true
  })
  const [saving, setSaving] = useState(false)
  const [showAddDriver, setShowAddDriver] = useState(false)
  const [newDriver, setNewDriver] = useState({ name: '', phone: '', vehicle: 'Motocicleta' })
  const [creatingDriver, setCreatingDriver] = useState(false)

  useEffect(() => {
    loadDrivers()
    loadConfig()
  }, [])

  async function loadConfig() {
    try {
      const res = await api.get('/pharmacy/delivery/config')
      if (res.success && res.data) setConfig(res.data)
    } catch (err) {}
  }

  async function loadDrivers() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/pharmacy/delivery')
      if (res.success && res.data) {
        setDrivers(res.data)
      } else {
        setError(res.message || 'Error al cargar repartidores')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      await api.put('/pharmacy/delivery/config', config)
      oasisToast.success('Configuración Guardada', 'Los ajustes de entrega se han actualizado.')
    } catch (err) {
      oasisToast.error('Error al Guardar', 'No se pudieron sincronizar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddDriver = async () => {
    if (!newDriver.name || !newDriver.phone) {
      oasisToast.error('Datos Incompletos', 'Nombre y teléfono son requeridos.')
      return
    }
    setCreatingDriver(true)
    try {
      const res = await api.post('/pharmacy/delivery/staff', newDriver)
      if (res.success) {
        oasisToast.success('Repartidor Añadido', `${newDriver.name} ha sido registrado.`)
        setShowAddDriver(false)
        setNewDriver({ name: '', phone: '', vehicle: 'Motocicleta' })
        loadDrivers()
      } else {
        oasisToast.error('Error', res.message || 'No se pudo añadir al repartidor.')
      }
    } catch (err) {
      oasisToast.error('Error de Conexión', 'Intenta de nuevo más tarde.')
    } finally {
      setCreatingDriver(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><DropLoader size={48} /></div>
  if (error) return <ErrorState message={error} onRetry={loadDrivers} />

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Logística de Entrega</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Control de flota y configuración de servicio</p>
        </div>
        <OasisButton variant="outline" size="sm" onClick={loadDrivers}>
          <RefreshCcw size={16} className="mr-1" /> Actualizar
        </OasisButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Configuration Column */}
        <div className="lg:col-span-4 space-y-4">
          <OasisCard className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-nunito font-bold text-[#4A4A4A]">Configuración</h3>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider">{config.enabled ? 'Activo' : 'Pausado'}</span>
                 <Switch checked={config.enabled} onCheckedChange={(val) => setConfig({...config, enabled: val})} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                 <label className="text-[11px] font-bold text-[#8A8A8A] uppercase ml-1">Costo de Envío (C$)</label>
                 <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0E8C5E]" />
                    <input 
                      type="number" 
                      value={config.fee} 
                      onChange={e => setConfig({...config, fee: parseInt(e.target.value)})}
                      className="w-full bg-[#FAFAFA] border-2 border-[#F0F0F0] rounded-xl px-4 py-2.5 pl-9 text-sm font-bold focus:border-[#0E8C5E] outline-none" 
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[11px] font-bold text-[#8A8A8A] uppercase ml-1">Radio de Cobertura (KM)</label>
                 <div className="relative">
                    <Target size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0077B6]" />
                    <input 
                      type="number" 
                      value={config.radius} 
                      onChange={e => setConfig({...config, radius: parseInt(e.target.value)})}
                      className="w-full bg-[#FAFAFA] border-2 border-[#F0F0F0] rounded-xl px-4 py-2.5 pl-9 text-sm font-bold focus:border-[#0077B6] outline-none" 
                    />
                 </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#E8F5EE]/50 border border-[#0E8C5E]/10 space-y-2">
                 <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#4A4A4A]">Solo Personal Interno</span>
                    <Switch checked={config.internalOnly} onCheckedChange={(val) => setConfig({...config, internalOnly: val})} />
                 </div>
                 <p className="text-[10px] text-[#8A8A8A]">Deshabilite para usar la red de repartidores independientes de Oasis.</p>
              </div>
            </div>

            <OasisButton fullWidth onClick={handleSaveConfig} disabled={saving}>
               {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : 'Guardar Cambios'}
            </OasisButton>
          </OasisCard>

          <OasisCard className="bg-[#0E8C5E] text-white overflow-hidden relative">
             <div className="relative z-10">
               <h4 className="font-nunito font-bold text-lg mb-1">Rutas Activas</h4>
               <p className="text-xs opacity-80 mb-4">4 entregas en curso</p>
               <OasisButton variant="blue" size="sm" className="bg-white/20 hover:bg-white/30 border-0 text-white">
                  Ver Mapa en Vivo
               </OasisButton>
             </div>
             <MapPin className="absolute -right-4 -bottom-4 opacity-10" size={100} />
          </OasisCard>
        </div>

        {/* Fleet Column */}
        <div className="lg:col-span-8 space-y-4">
          <OasisCard>
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-nunito font-bold text-[#4A4A4A]">Flota de Repartidores</h3>
               <OasisButton variant="secondary" size="sm" onClick={() => setShowAddDriver(true)}>
                  <UserPlus size={14} className="mr-1.5" /> Agregar Personal
               </OasisButton>
            </div>

            <div className="space-y-3">
              {drivers.length === 0 ? (
                <EmptyState message="No has registrado repartidores internos todavía." />
              ) : (
                drivers.map((d, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-[#FAFAFA] border border-[#F0F0F0] hover:border-[#0E8C5E]/30 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center relative">
                      {d.user?.avatarUrl ? (
                         <img src={d.user.avatarUrl} alt={d.user.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <div className="w-full h-full rounded-2xl bg-[#E8F5EE] flex items-center justify-center font-nunito font-black text-[#0E8C5E]">
                           {d.user?.name?.slice(0,2).toUpperCase()}
                        </div>
                      )}
                      <div className={`absolute -right-1 -bottom-1 w-4 h-4 rounded-full border-2 border-white ${d.status === 'online' ? 'bg-[#0E8C5E]' : d.status === 'busy' ? 'bg-[#F4A261]' : 'bg-[#8A8A8A]'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-nunito font-bold text-base text-[#4A4A4A] truncate">{d.user?.name}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#8A8A8A] uppercase tracking-tight">
                           <Bike size={12} className="text-[#0E8C5E]" /> {d.vehicleType || 'Motocicleta'}
                        </span>
                        <span className="text-[10px] font-medium text-[#B0B0B0]">• {d.licensePlate || 'NICA-000'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                       <div className="text-right mr-2 hidden sm:block">
                          <p className="text-[10px] font-bold text-[#4A4A4A] uppercase tracking-tighter">Estado</p>
                          <p className={`text-[11px] font-bold ${d.status === 'online' ? 'text-[#0E8C5E]' : 'text-[#8A8A8A]'}`}>
                            {d.status === 'online' ? 'DISPONIBLE' : d.status === 'busy' ? 'EN RUTA' : 'OFFLINE'}
                          </p>
                       </div>
                       <a href={`tel:${d.user?.phone}`} className="w-10 h-10 rounded-full bg-white border border-[#E0E0E0] flex items-center justify-center text-[#8A8A8A] hover:text-[#0E8C5E] hover:bg-[#E8F5EE] transition-all">
                          <Phone size={16} />
                       </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </OasisCard>

          {/* Quick Task Assignment */}
          <OasisCard className="bg-[#E0F2FF]/40 border-dashed border-2 border-[#0077B6]/20">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-[#0077B6] text-white flex items-center justify-center">
                      <Send size={18} />
                   </div>
                   <div>
                      <h4 className="font-nunito font-bold text-sm text-[#4A4A4A]">Asignación Manual</h4>
                      <p className="text-[10px] text-[#8A8A8A] font-inter">Asigna un pedido pendiente a un repartidor disponible.</p>
                   </div>
                </div>
                <OasisButton variant="blue" size="sm">Seleccionar Pedido</OasisButton>
             </div>
          </OasisCard>
        </div>
      </div>
      {/* Add Driver Modal */}
      <Dialog open={showAddDriver} onOpenChange={setShowAddDriver}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader>
            <DialogTitle className="font-nunito font-bold text-xl">Nuevo Repartidor</DialogTitle>
            <DialogDescription className="text-xs font-inter">Registra un nuevo miembro para tu flota interna.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
             <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#8A8A8A] uppercase">Nombre Completo</label>
                <input 
                  value={newDriver.name}
                  onChange={e => setNewDriver({...newDriver, name: e.target.value})}
                  className="w-full bg-[#FAFAFA] border-2 border-[#F0F0F0] rounded-xl px-4 py-2.5 text-sm font-bold focus:border-[#0E8C5E] outline-none" 
                  placeholder="Ej: Juan Pérez"
                />
             </div>
             <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#8A8A8A] uppercase">Teléfono de Contacto</label>
                <input 
                  value={newDriver.phone}
                  onChange={e => setNewDriver({...newDriver, phone: e.target.value})}
                  className="w-full bg-[#FAFAFA] border-2 border-[#F0F0F0] rounded-xl px-4 py-2.5 text-sm font-bold focus:border-[#0E8C5E] outline-none" 
                  placeholder="+505 0000 0000"
                />
             </div>
             <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#8A8A8A] uppercase">Vehículo</label>
                <select 
                  value={newDriver.vehicle}
                  onChange={e => setNewDriver({...newDriver, vehicle: e.target.value})}
                  className="w-full bg-[#FAFAFA] border-2 border-[#F0F0F0] rounded-xl px-4 py-2.5 text-sm font-bold focus:border-[#0E8C5E] outline-none appearance-none"
                >
                   <option value="Motocicleta">Motocicleta</option>
                   <option value="Automóvil">Automóvil</option>
                   <option value="Bicicleta">Bicicleta</option>
                </select>
             </div>
          </div>

          <DialogFooter className="flex gap-2">
             <OasisButton variant="outline" fullWidth onClick={() => setShowAddDriver(false)}>Cancelar</OasisButton>
             <OasisButton fullWidth onClick={handleAddDriver} disabled={creatingDriver}>
                {creatingDriver ? <Loader2 size={16} className="animate-spin mr-2" /> : 'Registrar Repartidor'}
             </OasisButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
