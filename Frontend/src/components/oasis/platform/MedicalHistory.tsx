'use client'

import { Paperclip } from 'lucide-react'
import { OasisCard } from '../shared/shared-components'

const timeline = [
  { date: '20 Ene 2025', doctor: 'Dr. Carlos Ruiz', clinic: 'Clínica Oasis', diagnosis: 'Infección de vías urinarias', details: 'Paciente presenta dolor al orinar y fiebre leve. Se recetó Amoxicilina 500mg por 7 días.', attachments: ['Receta #0012'] },
  { date: '15 Dic 2024', doctor: 'Dra. María Martínez', clinic: 'Clínica Oasis', diagnosis: 'Control anual', details: 'Examen físico completo. Todos los valores dentro del rango normal.', attachments: [] },
  { date: '03 Nov 2024', doctor: 'Dr. Luis Hernández', clinic: 'Clínica Central', diagnosis: 'Hipertensión leve', details: 'Presión arterial 140/90. Se recomienda dieta baja en sodio y monitoreo.', attachments: ['Receta #0098', 'Examen de laboratorio'] },
  { date: '20 Sep 2024', doctor: 'Dr. Carlos Ruiz', clinic: 'Clínica Oasis', diagnosis: 'Dolor lumbar', details: 'Esguince lumbar leve. Ibuprofeno 400mg por 5 días y reposo.', attachments: ['Receta #0087'] },
]

export default function MedicalHistory() {
  return (
    <div className="p-4 md:p-0 space-y-6 pb-24 md:pb-0">
      <div>
        <h1 className="font-nunito font-bold text-2xl text-[#4A4A4A]">Historial Médico</h1>
        <p className="font-inter text-sm text-[#8A8A8A]">María López - Línea de tiempo</p>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 md:left-8 top-0 bottom-0 w-0.5 bg-[#E8F5EE]" />

        <div className="space-y-6">
          {timeline.map((entry, i) => (
            <div key={i} className="relative flex gap-4 md:gap-6">
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0">
                <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-[#E8F5EE] flex items-center justify-center border-4 border-white shadow-sm">
                  <div className="w-3 h-3 rounded-full oasis-gradient" />
                </div>
              </div>

              {/* Card */}
              <OasisCard className="flex-1 !p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-nunito font-bold text-base text-[#4A4A4A]">{entry.diagnosis}</div>
                    <div className="font-inter text-xs text-[#8A8A8A]">{entry.date}</div>
                  </div>
                  <span className="capsule bg-[#E8F5EE] text-[#0E8C5E] px-3 py-1 text-[10px] font-inter font-semibold">
                    {entry.doctor}
                  </span>
                </div>
                <p className="font-inter text-sm text-[#4A4A4A] mb-3">{entry.details}</p>
                {entry.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.attachments.map((att, j) => (
                      <span key={j} className="flex items-center gap-1 capsule bg-[#FAFAFA] border border-[#E0E0E0] px-3 py-1 text-xs font-inter text-[#4A4A4A]">
                        {att}
                      </span>
                    ))}
                  </div>
                )}
              </OasisCard>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
