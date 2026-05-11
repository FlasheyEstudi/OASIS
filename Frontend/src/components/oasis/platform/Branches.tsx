
'use client'

import { useState, useEffect } from 'react'
import { Plus, MapPin, Phone, Edit, Trash2, Search, Loader2 } from 'lucide-react'
import { OasisCard, OasisButton, StatusBadge, DropLoader, ErrorState } from '../shared/shared-components'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuthStore } from '@/lib/auth-store'
import { api } from '@/lib/api-client'
import dynamic from 'next/dynamic'

// Map components (client-side only)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const MapEvents = dynamic(() => import('react-leaflet').then(mod => {
  const { useMapEvents } = mod
  return function MapEvents({ onClick }: { onClick: (lat: number, lng: number) => void }) {
    useMapEvents({
      click(e) {
        onClick(e.latlng.lat, e.latlng.lng)
      },
    })
    return null
  }
}), { ssr: false })

export default function Branches() {
  const { roleProfile } = useAuthStore()
  const clinicId = roleProfile?.clinicId
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [form, setForm] = useState({
    id: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    latitude: 12.1364,
    longitude: -86.2514
  })

  useEffect(() => {
    if (clinicId) loadBranches()
  }, [clinicId])

  async function loadBranches() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/clinics/${clinicId}/branches`)
      if (res.success && res.data) {
        setBranches(res.data)
      }
    } catch (err) {
      setError('No pudimos cargar las sucursales.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!form.name || !form.address) return
    setSaving(true)
    try {
      const endpoint = form.id 
        ? `/clinics/branches/${form.id}` 
        : `/clinics/${clinicId}/branches`
      
      const method = form.id ? 'put' : 'post'
      const res = await (api as any)[method](endpoint, form)
      
      if (res.success) {
        setDialogOpen(false)
        loadBranches()
        resetForm()
      }
    } catch (err) {
      alert('Error al guardar sucursal')
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setForm({
      id: '',
      name: '',
      address: '',
      phone: '',
      email: '',
      latitude: 12.1364,
      longitude: -86.2514
    })
  }

  function openEdit(branch: any) {
    setForm({
      id: branch.id,
      name: branch.name,
      address: branch.address || '',
      phone: branch.phone || '',
      email: branch.email || '',
      latitude: branch.latitude || 12.1364,
      longitude: branch.longitude || -86.2514
    })
    setDialogOpen(true)
  }

  const filtered = branches.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))

  if (loading && branches.length === 0) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>
  if (error) return <ErrorState message={error} onRetry={loadBranches} />

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Sucursales</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">{branches.length} sucursales registradas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <OasisButton size="sm"><Plus size={16} className="mr-1" /> Nueva Sucursal</OasisButton>
          </DialogTrigger>
          <DialogContent className="modal-oasis max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">
                {form.id ? 'Editar Sucursal' : 'Nueva Sucursal'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <div>
                  <label className="font-inter font-medium text-sm text-[#4A4A4A]">Nombre</label>
                  <input 
                    className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" 
                    placeholder="Nombre de la sucursal" 
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="font-inter font-medium text-sm text-[#4A4A4A]">Dirección</label>
                  <input 
                    className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" 
                    placeholder="Dirección completa" 
                    value={form.address}
                    onChange={e => setForm({...form, address: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-inter font-medium text-sm text-[#4A4A4A]">Teléfono</label>
                    <input 
                      className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" 
                      placeholder="2255-0000" 
                      value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="font-inter font-medium text-sm text-[#4A4A4A]">Email</label>
                    <input 
                      className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] focus:outline-none" 
                      placeholder="sucursal@oasis.ni" 
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <OasisButton variant="ghost" onClick={() => setDialogOpen(false)}>Cancelar</OasisButton>
                  <OasisButton onClick={handleSave} disabled={saving || !form.name || !form.address}>
                    {saving ? <Loader2 className="animate-spin" size={16} /> : 'Guardar Sucursal'}
                  </OasisButton>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-inter font-medium text-sm text-[#4A4A4A]">Ubicación en Mapa</label>
                <div className="h-[280px] rounded-[20px] overflow-hidden border-2 border-[#E8F5EE]">
                  <MapContainer 
                    center={[form.latitude, form.longitude]} 
                    zoom={15} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[form.latitude, form.longitude]} />
                    <MapEvents onClick={(lat, lng) => setForm({...form, latitude: lat, longitude: lng})} />
                  </MapContainer>
                </div>
                <p className="text-[10px] font-inter text-[#8A8A8A] text-center italic">Haz clic en el mapa para ajustar la ubicación precisa</p>
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
          placeholder="Buscar sucursal..." 
          className="w-full input-oasis border-2 border-[#E0E0E0] bg-white px-4 py-2.5 pl-10 text-sm font-inter rounded-full focus:border-[#0E8C5E] focus:outline-none" 
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 bg-[#E8F5EE] rounded-full flex items-center justify-center mb-4">
            <MapPin size={40} className="text-[#0E8C5E]" />
          </div>
          <p className="font-nunito font-bold text-lg text-[#4A4A4A]">No se encontraron sucursales</p>
          <p className="font-inter text-sm text-[#8A8A8A]">Añade tu primera sucursal para comenzar.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <OasisCard key={b.id} className="group hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-nunito font-bold text-base text-[#4A4A4A]">{b.name}</h3>
                  <p className="text-[10px] font-inter text-[#8A8A8A]">ID: {b.id.slice(-6).toUpperCase()}</p>
                </div>
                <StatusBadge status={b.isActive ? 'active' : 'inactive'} />
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-xs font-inter text-[#8A8A8A]">
                  <MapPin size={14} className="text-[#0E8C5E] mt-0.5 shrink-0" /> 
                  <span className="line-clamp-2">{b.address || 'Sin dirección'}</span>
                </div>
                {b.phone && (
                  <div className="flex items-center gap-2 text-xs font-inter text-[#8A8A8A]">
                    <Phone size={14} className="text-[#0077B6] shrink-0" /> {b.phone}
                  </div>
                )}
              </div>
              <div className="h-24 rounded-[14px] bg-[#E8F5EE] overflow-hidden relative border border-[#E0E0E0]/50">
                 {/* Mini static map view */}
                 <div className="absolute inset-0 flex items-center justify-center text-[10px] font-inter text-[#0E8C5E] bg-[#E8F5EE]">
                    Ubicada en: {b.latitude.toFixed(4)}, {b.longitude.toFixed(4)}
                 </div>
              </div>
              <div className="flex justify-end mt-3 gap-2">
                <button 
                  onClick={() => openEdit(b)}
                  className="p-2 rounded-full hover:bg-[#E8F5EE] text-[#8A8A8A] hover:text-[#0E8C5E] transition-colors"
                >
                  <Edit size={16} />
                </button>
              </div>
            </OasisCard>
          ))}
        </div>
      )}
    </div>
  )
}
