'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/auth-store'
import { OasisCard, OasisButton, DropLoader, EmptyState, StatusBadge } from '@/components/oasis/shared/shared-components'
import { Package, Plus, Search, Eye, Truck, CheckCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function PurchaseOrders() {
  const { roleProfile } = useAuthStore()
  const pharmacyId = roleProfile?.pharmacyId
  const [orders, setOrders] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [medications, setMedications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'pending' | 'received'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [showDetail, setShowDetail] = useState<any>(null)
  const [showReceive, setShowReceive] = useState<string | null>(null)
  const [form, setForm] = useState({ supplierId: '', items: [{ medicationId: '', quantity: 1, unitCost: 0 }] })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadOrders(); loadSuppliers(); loadMedications() }, [tab])

  async function loadOrders() {
    setLoading(true)
    const statusMap: Record<string, string> = { pending: 'pending', received: 'received', all: '' }
    const res = await api.get('/pharmacy/purchase-orders', { pharmacyId, status: statusMap[tab] || undefined, limit: 30 })
    if (res.success && (res as any).data) setOrders((res as any).data)
    setLoading(false)
  }

  async function loadSuppliers() {
    const res = await api.get('/pharmacy/suppliers', { pharmacyId })
    if (res.success && (res as any).data) setSuppliers((res as any).data)
  }

  async function loadMedications() {
    const res = await api.get('/pharmacy/medications', { limit: 100 })
    if (res.success && (res as any).data) setMedications((res as any).data)
  }

  async function createOrder() {
    setSaving(true)
    await api.post('/pharmacy/purchase-orders', { pharmacyId, ...form })
    setShowCreate(false); setForm({ supplierId: '', items: [{ medicationId: '', quantity: 1, unitCost: 0 }] }); loadOrders(); setSaving(false)
  }

  async function viewOrder(id: string) {
    const res = await api.get(`/pharmacy/purchase-orders/${id}`)
    if (res.success && (res as any).data) setShowDetail((res as any).data)
  }

  async function receiveOrder(id: string) {
    await api.put(`/pharmacy/purchase-orders/${id}/receive`, { items: form.items })
    setShowReceive(null); loadOrders()
  }

  function addItem() { setForm({ ...form, items: [...form.items, { medicationId: '', quantity: 1, unitCost: 0 }] }) }
  function updateItem(i: number, f: string, v: any) { setForm({ ...form, items: form.items.map((it, idx) => idx === i ? { ...it, [f]: v } : it) }) }

  const statusMap: Record<string, any> = { pending: 'pending', received: 'completed', partial: 'active', cancelled: 'cancelled' }

  if (loading && orders.length === 0) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Órdenes de Compra</h1><p className="font-inter text-sm text-[#8A8A8A]">Compras a proveedores</p></div>
        <OasisButton onClick={() => setShowCreate(true)}><Plus size={16} /> Nueva Orden</OasisButton>
      </div>
      <div className="flex gap-2">
        {[{ key: 'all', label: 'Todas' }, { key: 'pending', label: 'Pendientes' }, { key: 'received', label: 'Recibidas' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`capsule px-4 py-2 font-inter font-semibold text-sm transition-all ${tab === t.key ? 'oasis-gradient text-white shadow-md' : 'bg-[#E8F5EE] text-[#0E8C5E]'}`}>{t.label}</button>
        ))}
      </div>
      {orders.length === 0 ? <EmptyState message="No hay órdenes de compra" /> : (
        <div className="space-y-3">
          {orders.map((o: any) => (
            <OasisCard key={o.id} hover={false} className="py-3 px-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#E0F2FF] flex items-center justify-center"><Package size={20} className="text-[#0077B6]" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter font-semibold text-sm text-[#4A4A4A]">{o.supplier?.name || 'Proveedor'}</p>
                  <p className="font-inter text-xs text-[#8A8A8A]">{o.items?.length || 0} items - {new Date(o.createdAt).toLocaleDateString('es-NI')}</p>
                </div>
                <StatusBadge status={statusMap[o.status] || 'pending'} />
                <div className="flex gap-1">
                  <button onClick={() => viewOrder(o.id)} className="text-[#0077B6] hover:bg-[#E0F2FF] rounded-lg p-1.5"><Eye size={16} /></button>
                  {o.status === 'pending' && <OasisButton variant="blue" size="sm" onClick={() => setShowReceive(o.id)}><Truck size={14} /> Recibir</OasisButton>}
                </div>
              </div>
            </OasisCard>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Nueva Orden de Compra</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><label className="font-inter font-medium text-sm text-[#4A4A4A]">Proveedor *</label>
              <select value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1">
                <option value="">Seleccionar</option>
                {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select></div>
            {form.items.map((item, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <select value={item.medicationId} onChange={e => updateItem(i, 'medicationId', e.target.value)} className="input-oasis border border-[#E0E0E0] px-2 py-1.5 text-xs font-inter focus:border-[#0E8C5E] focus:outline-none">
                  <option value="">Medicamento</option>
                  {medications.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <input type="number" placeholder="Cant." value={item.quantity} onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)} className="input-oasis border border-[#E0E0E0] px-2 py-1.5 text-xs font-inter focus:border-[#0E8C5E] focus:outline-none" />
                <input type="number" placeholder="Costo" value={item.unitCost} onChange={e => updateItem(i, 'unitCost', parseFloat(e.target.value) || 0)} className="input-oasis border border-[#E0E0E0] px-2 py-1.5 text-xs font-inter focus:border-[#0E8C5E] focus:outline-none" />
              </div>
            ))}
            <OasisButton variant="outline" size="sm" onClick={addItem}><Plus size={14} /> Item</OasisButton>
            <div className="flex gap-3 justify-end">
              <OasisButton variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</OasisButton>
              <OasisButton onClick={createOrder} disabled={!form.supplierId || saving}>{saving ? 'Creando...' : 'Crear Orden'}</OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Detalle Orden</DialogTitle></DialogHeader>
          {showDetail && <div className="mt-4 space-y-2">
            <p className="font-inter text-sm"><strong>Proveedor:</strong> {showDetail.supplier?.name}</p>
            <p className="font-inter text-sm"><strong>Estado:</strong> <StatusBadge status={statusMap[showDetail.status] || 'pending'} /></p>
            {showDetail.items?.map((it: any, i: number) => (
              <div key={i} className="bg-[#FAFAFA] rounded-[10px] p-2 text-sm font-inter"><strong>{it.medication?.name}</strong> - Cant: {it.quantity} - C${it.unitCost}</div>
            ))}
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  )
}
