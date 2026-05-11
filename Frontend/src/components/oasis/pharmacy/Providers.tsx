'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Phone, Pill, Search, Mail, MapPin, Loader2, PackagePlus, FileText, ChevronRight } from 'lucide-react'
import { OasisCard, OasisButton, HeartbeatCheck, DropLoader, EmptyState } from '../shared/shared-components'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { api } from '@/lib/api-client'

export default function Providers() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  
  // New Order Item State
  const [items, setItems] = useState([{ name: '', quantity: 1 }])

  useEffect(() => {
    loadSuppliers()
  }, [])

  async function loadSuppliers() {
    setLoading(true)
    try {
      const res = await api.get('/pharmacy/suppliers')
      if (res.success) setSuppliers(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrder = async () => {
    if (!selectedSupplier) return
    setCreating(true)
    try {
      const res = await api.post('/pharmacy/purchase-orders', {
        supplierId: selectedSupplier,
        items
      })
      if (res.success) {
        setOrderSuccess(true)
        setTimeout(() => {
          setOrderSuccess(false)
          setDialogOpen(false)
          setItems([{ name: '', quantity: 1 }])
        }, 2000)
      }
    } catch (err) {
      alert('Error al crear orden')
    } finally {
      setCreating(false)
    }
  }

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.contactName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Proveedores</h1>
          <p className="font-inter text-sm text-[#8A8A8A]">Gestión de suministros y órdenes de compra</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar proveedor..."
              className="pl-9 pr-4 py-2 bg-[#FAFAFA] border-2 border-[#F0F0F0] rounded-xl text-xs font-inter focus:border-[#0E8C5E] outline-none w-64"
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <OasisButton><Plus size={16} className="mr-2" /> Nueva Orden</OasisButton>
            </DialogTrigger>
            <DialogContent className="modal-oasis max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-nunito font-bold text-xl">Generar Orden de Compra</DialogTitle>
              </DialogHeader>
              {orderSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <HeartbeatCheck size={72} />
                  <div>
                    <h3 className="font-nunito font-black text-2xl text-[#4A4A4A]">¡Orden Enviada!</h3>
                    <p className="font-inter text-sm text-[#8A8A8A]">El proveedor recibirá la solicitud de inmediato.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 mt-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8A8A8A] uppercase ml-1">Seleccionar Proveedor</label>
                    <select 
                      value={selectedSupplier}
                      onChange={(e) => setSelectedSupplier(e.target.value)}
                      className="w-full bg-[#FAFAFA] border-2 border-[#F0F0F0] rounded-2xl px-4 py-3 text-sm font-inter outline-none focus:border-[#0E8C5E]"
                    >
                      <option value="">-- Elegir Proveedor --</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <label className="text-xs font-bold text-[#8A8A8A] uppercase ml-1">Productos a Solicitar</label>
                       <button onClick={() => setItems([...items, { name: '', quantity: 1 }])} className="text-[10px] font-bold text-[#0E8C5E] hover:underline">+ Agregar Otro</button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {items.map((it, idx) => (
                        <div key={idx} className="flex gap-2">
                           <input 
                             placeholder="Nombre del medicamento"
                             className="flex-[3] bg-[#FAFAFA] border border-[#F0F0F0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#0E8C5E]"
                             value={it.name}
                             onChange={(e) => {
                               const newItems = [...items]
                               newItems[idx].name = e.target.value
                               setItems(newItems)
                             }}
                           />
                           <input 
                             type="number"
                             placeholder="Cant"
                             className="flex-1 bg-[#FAFAFA] border border-[#F0F0F0] rounded-xl px-3 py-2 text-xs text-center outline-none focus:border-[#0E8C5E]"
                             value={it.quantity}
                             onChange={(e) => {
                               const newItems = [...items]
                               newItems[idx].quantity = parseInt(e.target.value)
                               setItems(newItems)
                             }}
                           />
                        </div>
                      ))}
                    </div>
                  </div>

                  <OasisButton fullWidth size="lg" onClick={handleCreateOrder} disabled={!selectedSupplier || creating}>
                    {creating ? <Loader2 size={18} className="animate-spin mr-2" /> : <PackagePlus size={18} className="mr-2" />}
                    Confirmar Pedido a Proveedor
                  </OasisButton>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><DropLoader size={48} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState message="No se encontraron proveedores registrados" icon="search" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <OasisCard key={s.id} className="group hover:border-[#0E8C5E]/20 border-2 border-transparent transition-all !p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F5EE] flex items-center justify-center text-[#0E8C5E] group-hover:scale-110 transition-transform">
                   <FileText size={24} />
                </div>
                <div className="flex gap-2">
                   <a href={`tel:${s.phone}`} className="w-8 h-8 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#8A8A8A] hover:text-[#0E8C5E] hover:bg-[#E8F5EE] transition-all">
                      <Phone size={14} />
                   </a>
                   <a href={`mailto:${s.email}`} className="w-8 h-8 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#8A8A8A] hover:text-[#0E8C5E] hover:bg-[#E8F5EE] transition-all">
                      <Mail size={14} />
                   </a>
                </div>
              </div>
              
              <h3 className="font-nunito font-bold text-base text-[#4A4A4A] line-clamp-1">{s.name}</h3>
              <p className="font-inter text-xs text-[#8A8A8A] mb-4">{s.contactName || 'Sin contacto asignado'}</p>
              
              <div className="space-y-2 mb-6">
                 <div className="flex items-center gap-2 text-[10px] text-[#8A8A8A] font-medium">
                    <MapPin size={12} className="text-[#0E8C5E]" />
                    <span className="truncate">{s.address || 'Nicaragua'}</span>
                 </div>
                 <div className="flex items-center gap-2 text-[10px] text-[#8A8A8A] font-medium">
                    <Pill size={12} className="text-[#0E8C5E]" />
                    <span>Especialidad: {s.category || 'General'}</span>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#F0F0F0]">
                 <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest">Última Compra: 12 May</span>
                 <button className="text-[#0E8C5E] hover:underline text-xs font-bold flex items-center">
                    Historial <ChevronRight size={14} />
                 </button>
              </div>
            </OasisCard>
          ))}
        </div>
      )}
    </div>
  )
}
