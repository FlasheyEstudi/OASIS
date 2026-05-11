'use client'

import { Check, Search, Bell, Shield, Smartphone, Pill, MapPin } from 'lucide-react'
import { OasisButton, WaveDivider } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'

const patientBenefits = [
  'Encuentra medicamentos en farmacias cercanas',
  'Recibe delivery o recoge en persona',
  'Recetas digitales siempre a la mano',
  'Recordatorios de toma automáticos',
  'Perfil familiar para cuidar a los tuyos',
]

export default function SectionForPatients() {
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
                {/* Phone with search */}
                <div className="w-[180px] sm:w-[210px] h-[320px] sm:h-[370px] bg-white rounded-[28px] shadow-xl border-4 border-[#E8F5EE] mx-auto overflow-hidden">
                  <div className="h-full bg-gradient-to-b from-[#E8F5EE]/50 to-white p-3 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full oasis-gradient flex items-center justify-center">
                        <svg width="12" height="15" viewBox="0 0 14 18" fill="none"><path d="M7 0C7 0 0 9 0 12.5C0 15.642 3.134 18 7 18C10.866 18 14 15.642 14 12.5C14 9 7 0 7 0Z" fill="white"/></svg>
                      </div>
                      <span className="font-nunito font-bold text-[#0E8C5E] text-xs">Oasis</span>
                    </div>
                    <div className="bg-white rounded-[12px] p-2 mb-2 border border-[#E0E0E0]">
                      <div className="flex items-center gap-2">
                        <Search size={12} className="text-[#8A8A8A]" />
                        <span className="text-[9px] text-[#8A8A8A] font-inter">Busca tu medicamento...</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 flex-1">
                      {[1,2,3].map(i => (
                        <div key={i} className="bg-white rounded-[10px] p-2 border border-[#E8F5EE]">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#E8F5EE] flex items-center justify-center"><Pill size={8} className="text-[#0E8C5E]" /></div>
                            <div className="flex-1">
                              <div className="h-1.5 w-14 bg-[#E8F5EE] rounded-full mb-0.5" />
                              <div className="h-1 w-10 bg-[#E0E0E0] rounded-full" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Nav bar */}
                    <div className="flex justify-around mt-2 pt-2 border-t border-[#E8F5EE]">
                      {[Smartphone, Bell, Shield].map((Icon, j) => (
                        <div key={j} className="w-5 h-5 rounded-full bg-[#E8F5EE] flex items-center justify-center">
                          <Icon size={9} className="text-[#0E8C5E]" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute top-4 -right-2 bg-white rounded-[14px] p-2 shadow-lg border border-[#E8F5EE]">
                  <div className="flex items-center gap-1.5">
                    <Check size={10} className="text-[#0E8C5E]" />
                    <span className="text-[8px] font-inter text-[#0E8C5E] font-semibold">Delivery</span>
                  </div>
                </div>
                <div className="absolute bottom-20 -left-4 bg-white rounded-[14px] p-2 shadow-lg border border-[#E8F5EE]">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={10} className="text-[#0E8C5E]" />
                    <span className="text-[8px] font-inter text-[#4A4A4A]">3 farmacias</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <span className="capsule bg-white text-[#0E8C5E] px-4 py-1.5 text-xs font-inter font-semibold inline-block mb-4">
                Para Pacientes
              </span>
              <h2 className="font-nunito font-bold text-[24px] md:text-[32px] text-[#4A4A4A] mb-4 leading-tight">
                Tu salud, en la palma de tu mano
              </h2>
              <p className="font-inter text-[#8A8A8A] text-base mb-8 max-w-md mx-auto lg:mx-0">
                Encuentra medicamentos, gestiona recetas y cuida a tu familia desde tu teléfono.
              </p>
              <div className="space-y-3 mb-8 max-w-md mx-auto lg:mx-0">
                {patientBenefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#0E8C5E] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} className="text-white" />
                    </div>
                    <span className="font-inter text-sm text-[#4A4A4A]">{b}</span>
                  </div>
                ))}
              </div>
              <OasisButton variant="outline" onClick={() => navigate('register')}>
                Crear cuenta gratis
              </OasisButton>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
