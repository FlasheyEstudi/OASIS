
'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Clock, DollarSign, Search, Loader2, Zap } from 'lucide-react'
import { OasisCard, OasisButton, OasisIconButton, StatusBadge, DropLoader, ErrorState } from '../shared/shared-components'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuthStore } from '@/lib/auth-store'
import { api } from '@/lib/api-client'

export default function Services() {
  const { roleProfile } = useAuthStore()
  const clinicId = roleProfile?.clinicId
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    duration: 30,
    price: 25,
    isActive: true
  })

  useEffect(() => {
    if (clinicId) loadServices()
  }, [clinicId])

  async function loadServices() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/clinics/${clinicId}/services`)
      if (res.success && res.data) {
        setServices(res.data)
      }
    } catch (err) {
      setError('No pudimos cargar los servicios.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!form.name || form.price <= 0) return
    setSaving(true)
    try {
      const endpoint = form.id 
        ? `/services/${form.id}` 
        : `/clinics/${clinicId}/services`
      
      const method = form.id ? 'put' : 'post'
      const res = await (api as any)[method](endpoint, form)
      
      if (res.success) {
        setDialogOpen(false)
        loadServices()
        resetForm()
      }
    } catch (err) {
      alert('Error al guardar servicio')
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setForm({
      id: '',
      name: '',
      description: '',
      duration: 30,
      price: 25,
      isActive: true
    })
  }

  function openEdit(service: any) {
    setForm({
      id: service.id,
      name: service.name,
      description: service.description || '',
      duration: service.duration || 30,
      price: service.price || 25,
      isActive: service.isActive
    })
    setDialogOpen(true)
  }

  const filtered = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.description?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading && services.length === 0) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>
  if (error) return <ErrorState message={error} onRetry={loadServices} />

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Servicios y Tarifas</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">{services.length} servicios configurados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <OasisButton size="sm"><Plus size={16} className="mr-1" /> Nuevo Servicio</OasisButton>
          </DialogTrigger>
          <DialogContent className="modal-oasis max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">
                {form.id ? 'Editar Servicio' : 'Nuevo Servicio'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Nombre del Servicio</label>
                <input 
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" 
                  placeholder="Ej: Consulta General"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>
              <div>
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Descripción</label>
                <textarea 
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none h-20 resize-none" 
                  placeholder="Detalles del servicio..."
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-inter font-medium text-sm text-[#4A4A4A]">Duración (min)</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
                    <input 
                      className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 pl-10 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" 
                      type="number"
                      value={form.duration}
                      onChange={e => setForm({...form, duration: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div>
                  <label className="font-inter font-medium text-sm text-[#4A4A4A]">Precio ($)</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
                    <input 
                      className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 pl-10 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" 
                      type="number"
                      value={form.price}
                      onChange={e => setForm({...form, price: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <OasisButton variant="ghost" onClick={() => setDialogOpen(false)}>Cancelar</OasisButton>
                <OasisButton onClick={handleSave} disabled={saving || !form.name}>
                  {saving ? <Loader2 className="animate-spin" size={16} /> : 'Guardar Servicio'}
                </OasisButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
        <input 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Buscar servicio..." 
          className="w-full input-oasis border-2 border-[#E0E0E0] bg-white px-4 py-2.5 pl-10 text-sm font-inter rounded-full focus:border-[#0E8C5E] focus:outline-none" 
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((s) => (
          <OasisCard key={s.id} className="group hover:bg-[#E8F5EE]/10 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-[#0E8C5E] group-hover:scale-110 transition-transform">
                <Zap size={20} />
              </div>
              <StatusBadge status={s.isActive ? 'active' : 'inactive'} />
            </div>
            <h3 className="font-nunito font-bold text-base text-[#4A4A4A] mb-1">{s.name}</h3>
            <p className="font-inter text-xs text-[#8A8A8A] line-clamp-2 h-8 mb-4">{s.description || 'Sin descripción'}</p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#F0F0F0]">
              <div className="flex flex-col">
                <span className="text-[10px] font-inter text-[#8A8A8A] uppercase">Precio</span>
                <span className="font-nunito font-bold text-lg text-[#0E8C5E]">${s.price}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-inter text-[#8A8A8A] uppercase">Duración</span>
                <span className="font-inter font-semibold text-sm text-[#4A4A4A]">{s.duration} min</span>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <OasisIconButton 
                icon={<Edit size={14} />} 
                label="Editar" 
                variant="ghost" 
                size="sm"
                onClick={() => openEdit(s)}
              />
            </div>
          </OasisCard>
        ))}
      </div>
    </div>
  )
}
