'use client'

import { useState, useEffect } from 'react'
import { Plus, Tag, Edit, Trash2, Calendar, Loader2 } from 'lucide-react'
import { OasisCard, OasisButton, OasisIconButton, StatusBadge, HeartbeatCheck, DropLoader, EmptyState, ErrorState } from '../shared/shared-components'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { api } from '@/lib/api-client'

export default function Promotions() {
  const [promotions, setPromotions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [form, setForm] = useState({
    name: '',
    type: 'percentage',
    value: '',
    code: '',
    startDate: '',
    endDate: '',
    medicationIds: [] as string[]
  })

  useEffect(() => {
    loadPromotions()
  }, [])

  async function loadPromotions() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/pharmacy/promotions')
      if (res.success && res.data) {
        setPromotions(res.data)
      } else {
        setError(res.message || 'Error al cargar promociones')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePromotion = async () => {
    setSaving(true)
    try {
      const res = await api.post('/pharmacy/promotions', form)
      if (res.success) {
        setCreateSuccess(true)
        setTimeout(() => {
          setCreateSuccess(false)
          setDialogOpen(false)
          setForm({ name: '', type: 'percentage', value: '', code: '', startDate: '', endDate: '', medicationIds: [] })
          loadPromotions()
        }, 1500)
      }
    } catch (err) {
      alert('Error al crear promoción')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><DropLoader size={48} /></div>
  if (error) return <ErrorState message={error} onRetry={loadPromotions} />

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Promociones</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">{promotions.length} campañas configuradas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setCreateSuccess(false) }}>
          <DialogTrigger asChild>
            <OasisButton size="sm"><Plus size={16} className="mr-1" /> Crear Promoción</OasisButton>
          </DialogTrigger>
          <DialogContent className="modal-oasis max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Nueva Promoción</DialogTitle>
            </DialogHeader>
            {createSuccess ? (
              <div className="py-8 text-center">
                <HeartbeatCheck size={56} />
                <h3 className="font-nunito font-bold text-lg text-[#4A4A4A] mt-3">Promoción Creada</h3>
                <p className="font-inter text-sm text-[#8A8A8A] mt-1">La oferta ya está disponible para los pacientes</p>
              </div>
            ) : (
            <div className="space-y-4 mt-4">
              <div>
                <label className="font-inter font-medium text-xs text-[#8A8A8A] ml-2">Nombre de Campaña</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 focus:border-[#0E8C5E] outline-none" placeholder="Ej: Oferta de Verano" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-inter font-medium text-xs text-[#8A8A8A] ml-2">Tipo de Descuento</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1">
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto fijo (C$)</option>
                    <option value="2x1">2x1</option>
                  </select>
                </div>
                <div>
                  <label className="font-inter font-medium text-xs text-[#8A8A8A] ml-2">Valor</label>
                  <input value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1" placeholder="25" type="number" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-inter font-medium text-xs text-[#8A8A8A] ml-2">Fecha Inicio</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1" />
                </div>
                <div>
                  <label className="font-inter font-medium text-xs text-[#8A8A8A] ml-2">Fecha Fin</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1" />
                </div>
              </div>
              <div>
                 <label className="font-inter font-medium text-xs text-[#8A8A8A] ml-2">Código de Cupón (Opcional)</label>
                 <input value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1 font-bold text-[#0E8C5E] uppercase" placeholder="OASIS2025" />
              </div>
              <OasisButton className="w-full" onClick={handleCreatePromotion} disabled={saving || !form.name || !form.value}>
                {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                Guardar Promoción
              </OasisButton>
            </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white card-oasis overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-[#E0E0E0]">
              <th className="text-left font-inter font-bold text-[10px] text-[#8A8A8A] uppercase tracking-wider px-6 py-4">Promoción</th>
              <th className="text-left font-inter font-bold text-[10px] text-[#8A8A8A] uppercase tracking-wider px-6 py-4 hidden md:table-cell">Detalle</th>
              <th className="text-left font-inter font-bold text-[10px] text-[#8A8A8A] uppercase tracking-wider px-6 py-4 hidden md:table-cell">Código</th>
              <th className="text-left font-inter font-bold text-[10px] text-[#8A8A8A] uppercase tracking-wider px-6 py-4 hidden md:table-cell">Vigencia</th>
              <th className="text-left font-inter font-bold text-[10px] text-[#8A8A8A] uppercase tracking-wider px-6 py-4">Estado</th>
              <th className="text-right font-inter font-bold text-[10px] text-[#8A8A8A] uppercase tracking-wider px-6 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {promotions.length === 0 ? (
              <tr><td colSpan={6} className="py-20"><EmptyState message="No hay promociones activas" /></td></tr>
            ) : promotions.map((p) => (
              <tr key={p.id} className="border-b border-[#E0E0E0]/50 hover:bg-[#E8F5EE]/10 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E8F5EE] flex items-center justify-center"><Tag size={14} className="text-[#0E8C5E]" /></div>
                    <span className="font-inter font-bold text-sm text-[#4A4A4A]">{p.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                   <div className="font-inter text-xs text-[#4A4A4A]">
                     {p.type === 'percentage' ? `${p.value}% de descuento` : p.type === 'fixed' ? `C$${p.value} de descuento` : '2x1'}
                   </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                   <span className="font-inter font-bold text-xs text-[#0E8C5E] bg-[#E8F5EE] px-2 py-1 rounded-md">{p.code || 'SIN CÓDIGO'}</span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                   <div className="flex items-center gap-1 font-inter text-[10px] text-[#8A8A8A]">
                     <Calendar size={10} /> {new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}
                   </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={new Date(p.endDate) < new Date() ? 'completed' : 'active'} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <OasisIconButton icon={<Edit size={14} />} variant="ghost" size="sm" label="Editar" onClick={() => {}} />
                    <OasisIconButton icon={<Trash2 size={14} />} variant="ghost" size="sm" label="Eliminar" onClick={() => {}} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
