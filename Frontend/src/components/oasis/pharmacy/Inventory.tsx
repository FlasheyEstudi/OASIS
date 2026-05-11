'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit, ChevronDown, ChevronUp, Check, AlertTriangle, Pill, Loader2 } from 'lucide-react'
import { OasisCard, OasisButton, HeartbeatCheck, DropLoader, EmptyState, ErrorState } from '../shared/shared-components'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'

const categories = ['Todos', 'Antibióticos', 'Analgésicos', 'Gastroenterología', 'Cardiología', 'Endocrinología']

function getStockColor(stock: number, max: number) {
  const pct = stock / max
  if (pct > 0.5) return '#0E8C5E'
  if (pct > 0.2) return '#F4A261'
  return '#EF4444'
}

function getExpiryStatus(date: string) {
  const now = new Date()
  const exp = new Date(date)
  const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return { label: 'Vencido', color: '#EF4444', bg: '#FEE2E2' }
  if (diff < 90) return { label: 'Próximo a vencer', color: '#F4A261', bg: '#FFF3E0' }
  return { label: 'OK', color: '#0E8C5E', bg: '#E8F5EE' }
}

export default function Inventory() {
  const { user } = useAuthStore()
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [addLoteOpen, setAddLoteOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [loteSuccess, setLoteSuccess] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    medicationId: '',
    batchNumber: '',
    quantity: '',
    costPrice: '',
    sellingPrice: '',
    expiryDate: ''
  })
  const [medicationSearch, setMedicationSearch] = useState('')
  const [medicationResults, setMedicationResults] = useState<any[]>([])

  useEffect(() => {
    loadInventory()
  }, [selectedCategory, search])

  const searchMedications = async (q: string) => {
    if (q.length < 2) {
      setMedicationResults([])
      return
    }
    try {
      const res = await api.get('/medications', { search: q, limit: 10 })
      if (res.success) setMedicationResults(res.data)
    } catch (err) {
      console.error('Search error', err)
    }
  }

  async function loadInventory() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/pharmacy/inventory', { 
        search, 
        category: selectedCategory === 'Todos' ? undefined : selectedCategory,
        limit: 100 
      })
      if (res.success && res.data) {
        setItems(res.data)
      }
    } catch (err) {
      setError('Error al cargar el inventario.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      medicationId: item.medicationId,
      batchNumber: item.batchNumber,
      quantity: item.quantity.toString(),
      costPrice: item.costPrice?.toString() || '',
      sellingPrice: item.sellingPrice.toString(),
      expiryDate: item.expiryDate.split('T')[0]
    })
    setEditOpen(true)
  }

  const handleSaveLote = async () => {
    setSaving(true)
    try {
      const res = await api.post('/pharmacy/inventory', {
        ...formData,
        quantity: parseInt(formData.quantity),
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice)
      })
      if (res.success) {
        setLoteSuccess(true)
        setTimeout(() => {
          setLoteSuccess(false)
          setAddLoteOpen(false)
          setFormData({ medicationId: '', batchNumber: '', quantity: '', costPrice: '', sellingPrice: '', expiryDate: '' })
          loadInventory()
        }, 1500)
      }
    } catch (err) {
      alert('Error al guardar lote')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      const res = await api.put(`/pharmacy/inventory/${editingItem.id}`, {
        ...formData,
        quantity: parseInt(formData.quantity),
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice)
      })
      if (res.success) {
        setEditSuccess(true)
        setTimeout(() => {
          setEditSuccess(false)
          setEditOpen(false)
          setEditingItem(null)
          loadInventory()
        }, 1500)
      }
    } catch (err) {
      alert('Error al editar lote')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Gestión de Inventario</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">{items.length} lotes registrados</p>
        </div>
        <OasisButton size="sm" onClick={() => setAddLoteOpen(true)}>
          <Plus size={16} className="mr-1" /> Agregar Lote
        </OasisButton>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
        <input 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Buscar medicamento..." 
          className="w-full border-2 border-[#E0E0E0] bg-white px-4 py-2.5 pl-10 text-sm font-inter rounded-full focus:border-[#0E8C5E] focus:outline-none" 
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`capsule px-4 py-2 text-sm font-inter font-semibold transition-all whitespace-nowrap ${
              selectedCategory === cat ? 'oasis-gradient text-white shadow-md' : 'bg-[#E8F5EE] text-[#0E8C5E] hover:bg-[#D1EBDD]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><DropLoader size={48} /></div>
      ) : items.length === 0 ? (
        <EmptyState message="No se encontraron medicamentos en el inventario" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            const expiry = getExpiryStatus(item.expiryDate)
            const isExpanded = expanded === item.id

            return (
              <OasisCard key={item.id} className="group !p-0 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-[#0E8C5E]">
                      <Pill size={20} />
                    </div>
                    <div className="text-right">
                      <p className="font-nunito font-bold text-lg text-[#0E8C5E]">C${item.sellingPrice}</p>
                      <span className="text-[10px] font-inter text-[#8A8A8A]">Precio de venta</span>
                    </div>
                  </div>
                  <h3 className="font-nunito font-bold text-[#4A4A4A] group-hover:text-[#0E8C5E] transition-colors line-clamp-1">{item.medication?.name}</h3>
                  <p className="font-inter text-xs text-[#8A8A8A] mb-4">{item.medication?.category || 'General'}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-inter font-bold text-[#8A8A8A] uppercase">Stock actual</span>
                      <span className="text-xs font-inter font-bold text-[#4A4A4A]">{item.quantity} und.</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F2F2F2] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((item.quantity / (item.maxStock || 100)) * 100, 100)}%`,
                          backgroundColor: getStockColor(item.quantity, item.maxStock || 100)
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: expiry.bg }}>
                       <span className="text-[10px] font-inter font-bold" style={{ color: expiry.color }}>{expiry.label}</span>
                       <span className="text-[10px] font-inter" style={{ color: expiry.color }}>{new Date(item.expiryDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setExpanded(isExpanded ? null : item.id)}
                    className="w-full mt-4 flex items-center justify-center gap-1 text-[10px] font-inter font-bold text-[#8A8A8A] hover:text-[#4A4A4A] transition-colors"
                  >
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {isExpanded ? 'Ver menos' : 'Ver detalles'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-[#F2F2F2] space-y-3 bg-[#FAFAFA]">
                    <div className="grid grid-cols-2 gap-2">
                       <div className="text-[10px] font-inter text-[#8A8A8A]">Lote: <span className="font-bold text-[#4A4A4A]">{item.batchNumber}</span></div>
                       <div className="text-[10px] font-inter text-[#8A8A8A]">Costo: <span className="font-bold text-[#4A4A4A]">C${item.costPrice}</span></div>
                    </div>
                    <div className="text-[10px] font-inter text-[#8A8A8A]">Proveedor: <span className="font-bold text-[#4A4A4A]">{item.supplier?.name || 'N/A'}</span></div>
                    <div className="flex gap-2">
                      <OasisButton variant="outline" size="sm" className="flex-1 h-8 text-[10px]" onClick={() => handleEdit(item)}>
                        <Edit size={10} className="mr-1" /> Editar
                      </OasisButton>
                    </div>
                  </div>
                )}
              </OasisCard>
            )
          })}
        </div>
      )}

      <Dialog open={addLoteOpen} onOpenChange={(open) => { setAddLoteOpen(open); if (!open) setLoteSuccess(false) }}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl">Registrar Lote</DialogTitle></DialogHeader>
          {loteSuccess ? (
            <div className="py-8 text-center">
              <HeartbeatCheck size={56} />
              <h3 className="font-nunito font-bold text-lg text-[#4A4A4A] mt-3">¡Inventario Actualizado!</h3>
              <p className="font-inter text-sm text-[#8A8A8A] mt-1">El nuevo lote se ha vinculado correctamente</p>
            </div>
          ) : (
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs font-inter text-[#8A8A8A] ml-2">Medicamento (Catálogo)</label>
              <div className="relative mt-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
                <input 
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 pl-9 font-inter text-sm rounded-[14px] outline-none focus:border-[#0E8C5E]"
                  placeholder="Buscar en el catálogo..."
                  value={medicationSearch}
                  onChange={(e) => {
                    setMedicationSearch(e.target.value)
                    searchMedications(e.target.value)
                  }}
                />
                {medicationResults.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-[#E0E0E0] rounded-[14px] shadow-xl max-h-48 overflow-y-auto">
                    {medicationResults.map((m: any) => (
                      <button 
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setFormData({...formData, medicationId: m.id})
                          setMedicationSearch(m.name)
                          setMedicationResults([])
                        }}
                        className="w-full text-left px-4 py-2 text-sm font-inter hover:bg-[#E8F5EE] transition-colors flex flex-col"
                      >
                        <span className="font-bold text-[#4A4A4A]">{m.name}</span>
                        <span className="text-[10px] text-[#8A8A8A]">{m.genericName} - {m.strength}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-inter text-[#8A8A8A] ml-2">Nº de Lote</label>
                <input value={formData.batchNumber} onChange={e => setFormData({...formData, batchNumber: e.target.value})} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1" placeholder="Ej: L-101" />
              </div>
              <div>
                <label className="text-xs font-inter text-[#8A8A8A] ml-2">Cantidad Inicial</label>
                <input value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1" type="number" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-inter text-[#8A8A8A] ml-2">Precio Costo (C$)</label>
                <input value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1" type="number" />
              </div>
              <div>
                <label className="text-xs font-inter text-[#8A8A8A] ml-2">Precio Venta (C$)</label>
                <input value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1" type="number" />
              </div>
            </div>
            <div>
              <label className="text-xs font-inter text-[#8A8A8A] ml-2">Fecha de Caducidad</label>
              <input value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1" type="date" />
            </div>
            <OasisButton className="w-full h-12" onClick={handleSaveLote} disabled={saving || !formData.medicationId}>
               {saving ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
               Guardar en Inventario
            </OasisButton>
          </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) { setEditSuccess(false); setEditingItem(null) } }}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl">Ajustar Inventario</DialogTitle></DialogHeader>
          {editSuccess ? (
            <div className="py-8 text-center">
              <HeartbeatCheck size={56} />
              <h3 className="font-nunito font-bold text-lg text-[#4A4A4A] mt-3">Ajuste Exitoso</h3>
              <p className="font-inter text-sm text-[#8A8A8A] mt-1">Los datos se han sincronizado correctamente</p>
            </div>
          ) : editingItem && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-inter text-[#8A8A8A] ml-2">Cantidad</label>
                  <input value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1" type="number" />
                </div>
                <div>
                  <label className="text-xs font-inter text-[#8A8A8A] ml-2">Precio Venta</label>
                  <input value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm rounded-[14px] mt-1" type="number" />
                </div>
              </div>
              <OasisButton className="w-full h-12" onClick={handleSaveEdit} disabled={saving}>
                 {saving ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                 Guardar Cambios
              </OasisButton>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
