'use client'

import { MessageCircle, Phone, Video, ExternalLink } from 'lucide-react'
import { OasisCard, OasisButton } from '../shared/shared-components'

const teleconsultations = [
  { patient: 'María López', time: '10:30 AM', type: 'Seguimiento', status: 'Pendiente', initials: 'ML' },
  { patient: 'Carlos Sánchez', time: '02:00 PM', type: 'Consulta General', status: 'En espera', initials: 'CS' },
]

export default function Teleconsultation() {
  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div>
        <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Teleconsulta</h1>
        <p className="font-inter text-sm text-[#8A8A8A]">Conecta con tus pacientes vía WhatsApp</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {teleconsultations.map((tc, i) => (
          <OasisCard key={i}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#E8F5EE] flex items-center justify-center font-nunito font-bold text-[#0E8C5E]">
                {tc.initials}
              </div>
              <div>
                <div className="font-nunito font-bold text-base text-[#4A4A4A]">{tc.patient}</div>
                <div className="font-inter text-xs text-[#8A8A8A]">{tc.type} · {tc.time}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`capsule px-3 py-1 text-xs font-inter font-semibold ${
                tc.status === 'Pendiente' ? 'bg-[#FFF3E0] text-[#F4A261]' : 'bg-[#E8F5EE] text-[#0E8C5E]'
              }`}>
                {tc.status}
              </span>
            </div>
            <OasisButton className="w-full" onClick={() => window.open('https://wa.me/?text=Hola, soy el Dr. Carlos Ruiz de Clínica Oasis. Estoy listo para tu teleconsulta.', '_blank')}>
              <MessageCircle size={16} className="mr-2" /> Iniciar Teleconsulta
            </OasisButton>
            <p className="font-inter text-[10px] text-[#8A8A8A] text-center mt-2">
              Se abrirá WhatsApp con un mensaje predefinido
            </p>
          </OasisCard>
        ))}
      </div>

      <OasisCard>
        <h3 className="font-nunito font-bold text-base text-[#4A4A4A] mb-4">Instrucciones</h3>
        <div className="space-y-3">
          {[
            'Presiona "Iniciar Teleconsulta" para abrir WhatsApp',
            'Se enviará un mensaje automático al paciente',
            'Comparte fotos, recetas o instrucciones por chat',
            'Al finalizar, registra las notas de la consulta',
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[10px] font-nunito font-bold text-[#0E8C5E]">{i + 1}</div>
              <span className="font-inter text-sm text-[#4A4A4A]">{step}</span>
            </div>
          ))}
        </div>
      </OasisCard>
    </div>
  )
}
