'use client'

import { Check, Calendar, FileText, BarChart3, Video, Users } from 'lucide-react'
import { OasisButton, WaveDivider } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'

const clinicBenefits = [
  'Gestión de citas y agenda médica',
  'Recetas digitales firmadas electrónicamente',
  'Reportes financieros y auditoría completa',
  'Teleconsulta vía WhatsApp integrada',
  'Gestión de múltiples sucursales',
]

export default function SectionForClinics() {
  const { navigate } = useNavigation()

  return (
    <>
      <WaveDivider color="#E8F5EE" />
      <section className="bg-[#E8F5EE] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Illustration */}
            <div className="flex justify-center order-2 lg:order-1">
              <div className="relative w-[260px] h-[360px] sm:w-[300px] sm:h-[420px]">
                {/* Dashboard mockup */}
                <div className="w-[240px] sm:w-[280px] h-[340px] sm:h-[380px] bg-white rounded-[20px] shadow-xl border-2 border-white mx-auto overflow-hidden p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full oasis-gradient flex items-center justify-center">
                      <Users size={10} className="text-white" />
                    </div>
                    <span className="font-nunito font-bold text-[#0E8C5E] text-xs">Clínica</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { icon: Calendar, label: 'Citas hoy', val: '18', color: '#0E8C5E' },
                      { icon: FileText, label: 'Recetas', val: '45', color: '#0077B6' },
                      { icon: BarChart3, label: 'Ingresos', val: 'C$52K', color: '#0E8C5E' },
                      { icon: Video, label: 'Telecons.', val: '6', color: '#0077B6' },
                    ].map((m, i) => (
                      <div key={i} className="bg-[#E8F5EE]/50 rounded-[12px] p-2">
                        <m.icon size={10} style={{ color: m.color }} className="mb-1" />
                        <div className="font-nunito font-bold text-xs" style={{ color: m.color }}>{m.val}</div>
                        <div className="text-[8px] font-inter text-[#8A8A8A]">{m.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Calendar mockup */}
                  <div className="bg-[#E8F5EE]/30 rounded-[12px] p-2 mb-3">
                    <div className="text-[8px] font-inter text-[#8A8A8A] mb-1">Agenda de hoy</div>
                    <div className="space-y-1">
                      {['09:00 - María López', '10:30 - Juan Pérez', '11:00 - Ana Gómez'].map((apt, i) => (
                        <div key={i} className="bg-white rounded-[8px] p-1.5 flex items-center gap-1.5">
                          <div className="w-1 h-4 rounded-full oasis-gradient" />
                          <span className="text-[7px] font-inter text-[#4A4A4A]">{apt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute top-8 -right-4 bg-white rounded-[14px] p-2 shadow-lg border border-[#E8F5EE]">
                  <div className="flex items-center gap-1.5">
                    <Check size={10} className="text-[#0E8C5E]" />
                    <span className="text-[8px] font-inter text-[#0E8C5E] font-semibold">Receta firmada</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <span className="capsule bg-white text-[#0E8C5E] px-4 py-1.5 text-xs font-inter font-semibold inline-block mb-4">
                Para Clínicas
              </span>
              <h2 className="font-nunito font-bold text-[24px] md:text-[32px] text-[#4A4A4A] mb-4 leading-tight">
                Administra tu clínica de forma inteligente
              </h2>
              <p className="font-inter text-[#8A8A8A] text-base mb-8 max-w-md mx-auto lg:mx-0">
                Citas, recetas, doctores, finanzas y más, todo en una plataforma diseñada para clínicas nicaragüenses.
              </p>
              <div className="space-y-3 mb-8 max-w-md mx-auto lg:mx-0">
                {clinicBenefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#0E8C5E] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} className="text-white" />
                    </div>
                    <span className="font-inter text-sm text-[#4A4A4A]">{b}</span>
                  </div>
                ))}
              </div>
              <OasisButton variant="outline" onClick={() => navigate('register')}>
                Registrar mi clínica
              </OasisButton>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
