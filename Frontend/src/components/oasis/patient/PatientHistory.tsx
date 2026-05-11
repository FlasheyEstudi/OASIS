'use client'

import { ArrowLeft, Clock, Stethoscope, Building2 } from 'lucide-react'
import { OasisCard } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'

const history = [
  { date: '20 Ene 2025', doctor: 'Dr. Carlos Ruiz', clinic: 'Clínica Oasis', diagnosis: 'Infección de vías urinarias', details: 'Se recetó Amoxicilina 500mg por 7 días. Control en 1 semana.' },
  { date: '15 Dic 2024', doctor: 'Dra. María Martínez', clinic: 'Clínica Oasis', diagnosis: 'Control anual', details: 'Examen completo. Valores normales.' },
  { date: '03 Nov 2024', doctor: 'Dr. Luis Hernández', clinic: 'Clínica Central', diagnosis: 'Hipertensión leve', details: 'Se recomienda dieta baja en sodio.' },
]

export default function PatientHistory() {
  const { navigate } = useNavigation()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-[10px] border-b border-[#E0E0E0]/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('patient-profile')}><ArrowLeft size={20} className="text-[#4A4A4A]" /></button>
          <h1 className="font-nunito font-bold text-lg text-[#4A4A4A]">Mi Historial Médico</h1>
        </div>
      </div>
      <div className="flex-1 px-4 py-4">
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#E8F5EE]" />
          <div className="space-y-4">
            {history.map((entry, i) => (
              <div key={i} className="relative flex gap-4">
                <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-[#E8F5EE] flex items-center justify-center border-4 border-white">
                  <div className="w-3 h-3 rounded-full oasis-gradient" />
                </div>
                <OasisCard className="flex-1 !p-4">
                  <div className="font-nunito font-bold text-sm text-[#4A4A4A] mb-1">{entry.diagnosis}</div>
                  <div className="flex items-center gap-2 text-xs font-inter text-[#8A8A8A] mb-2">
                    <span className="flex items-center gap-1"><Stethoscope size={10} /> {entry.doctor}</span>
                    <span className="flex items-center gap-1"><Building2 size={10} /> {entry.clinic}</span>
                  </div>
                  <p className="font-inter text-sm text-[#4A4A4A]">{entry.details}</p>
                  <div className="flex items-center gap-1 text-[10px] font-inter text-[#8A8A8A] mt-2">
                    <Clock size={8} /> {entry.date}
                  </div>
                </OasisCard>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
