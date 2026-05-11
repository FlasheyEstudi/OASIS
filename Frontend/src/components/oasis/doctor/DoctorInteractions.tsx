'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { OasisCard, OasisButton, DropLoader, EmptyState } from '@/components/oasis/shared/shared-components'
import { AlertTriangle, Search, Shield, Heart, Pill, CheckCircle, XCircle } from 'lucide-react'

export default function DoctorInteractions() {
  const [patients, setPatients] = useState<any[]>([])
  const [medications, setMedications] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedMeds, setSelectedMeds] = useState<string[]>([])
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [patSearch, setPatSearch] = useState('')
  const [medSearch, setMedSearch] = useState('')

  async function searchPatients(q: string) {
    setPatSearch(q)
    if (q.length < 2) return
    const res = await api.get('/patients', { search: q, limit: 10 })
    if (res.success && (res as any).data) setPatients((res as any).data)
  }

  async function searchMeds(q: string) {
    setMedSearch(q)
    if (q.length < 2) return
    const res = await api.get('/pharmacy/medications', { search: q, limit: 20 })
    if (res.success && (res as any).data) setMedications((res as any).data)
  }

  function toggleMed(id: string) {
    setSelectedMeds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])
  }

  async function checkInteractions() {
    if (!selectedPatient || selectedMeds.length === 0) return
    setChecking(true)
    const res = await api.post('/clinical-check/interactions', { patientId: selectedPatient, medicationIds: selectedMeds })
    if (res.success && (res as any).data) setResults((res as any).data)
    setChecking(false)
  }

  const severityColors: Record<string, string> = { high: 'bg-[#FEE2E2] text-[#EF4444] border-[#FECACA]', medium: 'bg-[#FFF3E0] text-[#F4A261] border-[#FFE0B2]', low: 'bg-[#E0F2FF] text-[#0077B6] border-[#B3E5FC]' }
  const typeIcons: Record<string, any> = { allergy: AlertTriangle, interaction: Pill, controlled: Shield, contraindication: XCircle }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div><h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Interacciones Medicamentosas</h1><p className="font-inter text-sm text-[#8A8A8A]">Verificar interacciones, alergias y contraindicaciones</p></div>

      <div className="grid md:grid-cols-2 gap-4">
        <OasisCard hover={false}>
          <h3 className="font-nunito font-bold text-[#4A4A4A] mb-3">1. Seleccionar Paciente</h3>
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
            <input value={patSearch} onChange={e => searchPatients(e.target.value)} placeholder="Buscar paciente..."
              className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] pl-10 pr-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none" /></div>
          {patients.length > 0 && (
            <div className="mt-2 max-h-32 overflow-y-auto border border-[#E0E0E0] rounded-[14px]">
              {patients.map((p: any) => (
                <button key={p.id} onClick={() => { setSelectedPatient(p.id); setPatSearch(p.user?.name || p.id); setPatients([]) }}
                  className={`w-full text-left px-3 py-2 font-inter text-sm hover:bg-[#E8F5EE] ${selectedPatient === p.id ? 'bg-[#E8F5EE]' : ''}`}>{p.user?.name || p.id}</button>
              ))}
            </div>
          )}
        </OasisCard>

        <OasisCard hover={false}>
          <h3 className="font-nunito font-bold text-[#4A4A4A] mb-3">2. Agregar Medicamentos</h3>
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
            <input value={medSearch} onChange={e => searchMeds(e.target.value)} placeholder="Buscar medicamento..."
              className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] pl-10 pr-4 py-2.5 font-inter text-sm focus:border-[#0E8C5E] focus:outline-none" /></div>
          {medications.length > 0 && (
            <div className="mt-2 max-h-32 overflow-y-auto border border-[#E0E0E0] rounded-[14px]">
              {medications.map((m: any) => (
                <button key={m.id} onClick={() => { toggleMed(m.id); setMedSearch('') }}
                  className={`w-full text-left px-3 py-2 font-inter text-sm hover:bg-[#E8F5EE] ${selectedMeds.includes(m.id) ? 'bg-[#E8F5EE]' : ''}`}>
                  {m.name} {selectedMeds.includes(m.id) ? '✓' : ''}
                </button>
              ))}
            </div>
          )}
          {selectedMeds.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedMeds.map(id => { const med = medications.find((m: any) => m.id === id); return med ? (
                <span key={id} className="capsule px-2 py-0.5 text-xs font-inter bg-[#E8F5EE] text-[#0E8C5E]">{med.name} <button onClick={() => toggleMed(id)} className="ml-1 hover:text-[#EF4444]">x</button></span>
              ) : null })}
            </div>
          )}
        </OasisCard>
      </div>

      <div className="flex justify-center">
        <OasisButton onClick={checkInteractions} disabled={!selectedPatient || selectedMeds.length === 0 || checking} size="lg">
          <AlertTriangle size={18} /> {checking ? 'Verificando...' : 'Verificar Interacciones'}
        </OasisButton>
      </div>

      {results && (
        <OasisCard hover={false}>
          <div className="flex items-center gap-3 mb-4">
            {results.safe ? <CheckCircle size={24} className="text-[#0E8C5E]" /> : <AlertTriangle size={24} className="text-[#F4A261]" />}
            <h2 className="font-nunito font-bold text-lg text-[#4A4A4A]">{results.safe ? 'Sin advertencias' : `Se encontraron ${results.warnings?.length || 0} advertencias`}</h2>
          </div>
          {results.warnings && results.warnings.length > 0 && (
            <div className="space-y-3">
              {results.warnings.map((w: any, i: number) => {
                const Icon = typeIcons[w.type] || AlertTriangle
                return (
                  <div key={i} className={`p-3 rounded-[14px] border ${severityColors[w.severity] || severityColors.low}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={16} />
                      <span className="font-inter font-semibold text-sm capitalize">{w.type}</span>
                      <span className="capsule px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>{w.severity}</span>
                    </div>
                    <p className="font-inter text-sm">{w.message}</p>
                  </div>
                )
              })}
            </div>
          )}
          {results.summary && (
            <div className="mt-4 pt-3 border-t border-[#E0E0E0] grid grid-cols-3 gap-3 text-center">
              <div><p className="font-nunito font-bold text-lg text-[#EF4444]">{results.summary.highSeverity || 0}</p><p className="font-inter text-xs text-[#8A8A8A]">Alta</p></div>
              <div><p className="font-nunito font-bold text-lg text-[#F4A261]">{results.summary.mediumSeverity || 0}</p><p className="font-inter text-xs text-[#8A8A8A]">Media</p></div>
              <div><p className="font-nunito font-bold text-lg text-[#0077B6]">{results.summary.lowSeverity || 0}</p><p className="font-inter text-xs text-[#8A8A8A]">Baja</p></div>
            </div>
          )}
        </OasisCard>
      )}
    </div>
  )
}
