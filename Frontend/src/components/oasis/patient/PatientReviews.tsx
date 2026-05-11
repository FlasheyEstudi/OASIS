'use client'
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { OasisCard, OasisButton, DropLoader, EmptyState, StarRating } from '@/components/oasis/shared/shared-components'
import { Star, Pen, Trash2, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function PatientReviews() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'my' | 'write'>('my')
  const [showWrite, setShowWrite] = useState(false)
  const [form, setForm] = useState({ targetType: 'doctor', targetId: '', rating: 5, comment: '' })
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchQ, setSearchQ] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadReviews() }, [])

  async function loadReviews() {
    setLoading(true)
    const res = await api.get('/reviews', { page: 1, limit: 30 })
    if (res.success && (res as any).data) setReviews((res as any).data)
    setLoading(false)
  }

  async function searchTarget(q: string) {
    setSearchQ(q)
    if (q.length < 2) return
    if (form.targetType === 'doctor') {
      const res = await api.get('/doctors', { search: q, limit: 10 })
      if (res.success && (res as any).data) setSearchResults((res as any).data)
    } else if (form.targetType === 'pharmacy') {
      const res = await api.get('/pharmacies', { search: q, limit: 10 })
      if (res.success && (res as any).data) setSearchResults((res as any).data)
    } else {
      const res = await api.get('/clinics', { search: q, limit: 10 })
      if (res.success && (res as any).data) setSearchResults((res as any).data)
    }
  }

  async function submitReview() {
    setSaving(true)
    const res = await api.post('/reviews', form)
    if (res.success) { setShowWrite(false); setForm({ targetType: 'doctor', targetId: '', rating: 5, comment: '' }); loadReviews() }
    setSaving(false)
  }

  async function deleteReview(id: string) {
    await api.delete(`/reviews/${id}`)
    loadReviews()
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><DropLoader size={48} /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Reseñas</h1><p className="font-inter text-sm text-[#8A8A8A]">Tus reseñas de doctores y farmacias</p></div>
        <OasisButton onClick={() => setShowWrite(true)}><Pen size={16} /> Escribir Reseña</OasisButton>
      </div>

      {reviews.length === 0 ? <EmptyState message="No has escrito reseñas todavía" /> : (
        <div className="space-y-3">
          {reviews.map((r: any) => (
            <OasisCard key={r.id} hover={false} className="py-3 px-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFF3E0] flex items-center justify-center"><Star size={20} className="text-[#F4A261]" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><span className="font-inter font-semibold text-sm text-[#4A4A4A] capitalize">{r.targetType}</span><StarRating rating={r.rating} size={14} /></div>
                  <p className="font-inter text-xs text-[#8A8A8A] mt-0.5">{r.comment || 'Sin comentario'}</p>
                </div>
                <button onClick={() => deleteReview(r.id)} className="text-[#8A8A8A] hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-[#FEE2E2] transition-colors"><Trash2 size={16} /></button>
              </div>
            </OasisCard>
          ))}
        </div>
      )}

      <Dialog open={showWrite} onOpenChange={setShowWrite}>
        <DialogContent className="modal-oasis max-w-md">
          <DialogHeader><DialogTitle className="font-nunito font-bold text-xl text-[#4A4A4A]">Escribir Reseña</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><label className="font-inter font-medium text-sm text-[#4A4A4A]">Tipo</label>
              <select value={form.targetType} onChange={e => { setForm({ ...form, targetType: e.target.value, targetId: '' }); setSearchResults([]) }}
                className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1">
                <option value="doctor">Doctor</option><option value="clinic">Clínica</option><option value="pharmacy">Farmacia</option>
              </select></div>
            <div><label className="font-inter font-medium text-sm text-[#4A4A4A]">Buscar</label>
              <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
                <input value={searchQ} onChange={e => searchTarget(e.target.value)} placeholder={`Buscar ${form.targetType}...`}
                  className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] pl-10 pr-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1" /></div>
              {searchResults.length > 0 && (
                <div className="mt-1 border border-[#E0E0E0] rounded-[14px] max-h-24 overflow-y-auto">
                  {searchResults.map((s: any) => (
                    <button key={s.id} onClick={() => { setForm({ ...form, targetId: s.id }); setSearchQ(s.user?.name || s.name || ''); setSearchResults([]) }}
                      className="w-full text-left px-3 py-2 text-sm font-inter hover:bg-[#E8F5EE]">{s.user?.name || s.name}</button>
                  ))}
                </div>
              )}
            </div>
            <div><label className="font-inter font-medium text-sm text-[#4A4A4A]">Calificación</label>
              <div className="flex gap-2 mt-2">{[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setForm({ ...form, rating: s })} className="transition-transform hover:scale-110"><Star size={28} fill={s <= form.rating ? '#F4A261' : 'none'} stroke={s <= form.rating ? '#F4A261' : '#E0E0E0'} /></button>
              ))}</div></div>
            <div><label className="font-inter font-medium text-sm text-[#4A4A4A]">Comentario</label>
              <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} rows={3}
                className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] px-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none mt-1" /></div>
            <div className="flex gap-3 justify-end">
              <OasisButton variant="ghost" onClick={() => setShowWrite(false)}>Cancelar</OasisButton>
              <OasisButton onClick={submitReview} disabled={!form.targetId || saving}>{saving ? 'Enviando...' : 'Publicar'}</OasisButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
