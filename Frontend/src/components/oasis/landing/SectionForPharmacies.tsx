'use client'

import { Check, TrendingUp, Package, Users, BarChart3, Pill } from 'lucide-react'
import { OasisButton, WaveDivider } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'

const pharmacyBenefits = [
  'Aumenta tus ventas con más pacientes conectados',
  'Gestión de inventario inteligente en tiempo real',
  'Punto de venta rápido y sencillo',
  'Delivery gestionado desde la plataforma',
  'Reportes financieros y de ventas detallados',
]

export default function SectionForPharmacies() {
  const { navigate } = useNavigation()

  return (
    <>
      <WaveDivider color="#FFFFFF" flip />
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="text-center lg:text-left">
              <span className="capsule bg-[#E8F5EE] text-[#0E8C5E] px-4 py-1.5 text-xs font-inter font-semibold inline-block mb-4">
                Para Farmacias
              </span>
              <h2 className="font-nunito font-bold text-[24px] md:text-[32px] text-[#4A4A4A] mb-4 leading-tight">
                Tu farmacia, siempre conectada
              </h2>
              <p className="font-inter text-[#8A8A8A] text-base mb-8 max-w-md mx-auto lg:mx-0">
                Gestiona inventario, ventas y delivery desde una sola plataforma diseñada para farmacias nicaragüenses.
              </p>
              <div className="space-y-3 mb-8 max-w-md mx-auto lg:mx-0">
                {pharmacyBenefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#0E8C5E] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} className="text-white" />
                    </div>
                    <span className="font-inter text-sm text-[#4A4A4A]">{b}</span>
                  </div>
                ))}
              </div>
              <OasisButton variant="outline" onClick={() => navigate('register')}>
                Registrar mi farmacia
              </OasisButton>
            </div>

            {/* Illustration */}
            <div className="flex justify-center">
              <div className="relative w-[260px] h-[360px] sm:w-[300px] sm:h-[420px]">
                {/* Dashboard mockup */}
                <div className="w-[240px] sm:w-[280px] h-[340px] sm:h-[380px] bg-white rounded-[20px] shadow-xl border-2 border-[#E8F5EE] mx-auto overflow-hidden p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full oasis-gradient flex items-center justify-center">
                      <Package size={10} className="text-white" />
                    </div>
                    <span className="font-nunito font-bold text-[#0E8C5E] text-xs">Inventario</span>
                  </div>
                  {/* Metric cards */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { label: 'Productos', val: '342', color: '#0E8C5E' },
                      { label: 'Ventas hoy', val: 'C$8,450', color: '#0077B6' },
                      { label: 'Pedidos', val: '23', color: '#0E8C5E' },
                      { label: 'Alertas', val: '5', color: '#F4A261' },
                    ].map((m, i) => (
                      <div key={i} className="bg-[#E8F5EE]/50 rounded-[12px] p-2 text-center">
                        <div className="font-nunito font-bold text-xs" style={{ color: m.color }}>{m.val}</div>
                        <div className="text-[8px] font-inter text-[#8A8A8A]">{m.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Fake chart */}
                  <div className="bg-[#E8F5EE]/30 rounded-[12px] p-2 mb-3">
                    <div className="text-[8px] font-inter text-[#8A8A8A] mb-1">Ventas semanales</div>
                    <svg viewBox="0 0 200 50" className="w-full h-[40px]">
                      <path d="M0,40 C20,35 40,30 60,25 C80,20 100,30 120,15 C140,10 160,20 180,10 L200,15" stroke="#0E8C5E" strokeWidth="2" fill="none"/>
                      <path d="M0,40 C20,35 40,30 60,25 C80,20 100,30 120,15 C140,10 160,20 180,10 L200,15 L200,50 L0,50 Z" fill="url(#pharmGrad)" opacity="0.2"/>
                      <defs>
                        <linearGradient id="pharmGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop stopColor="#0E8C5E" stopOpacity="0.3"/>
                          <stop offset="1" stopColor="#0E8C5E" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  {/* Fake items */}
                  <div className="space-y-1.5">
                    {[1,2,3].map(i => (
                      <div key={i} className="bg-[#E8F5EE]/30 rounded-[10px] p-1.5 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#E8F5EE] flex items-center justify-center"><Pill size={7} className="text-[#0E8C5E]" /></div>
                        <div className="flex-1">
                          <div className="h-1.5 w-12 bg-[#E8F5EE] rounded-full" />
                        </div>
                        <BarChart3 size={8} className="text-[#8A8A8A]" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute top-6 -left-2 bg-white rounded-[14px] p-2 shadow-lg border border-[#E8F5EE]">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={10} className="text-[#0E8C5E]" />
                    <span className="text-[8px] font-inter text-[#0E8C5E] font-semibold">+24% ventas</span>
                  </div>
                </div>
                <div className="absolute bottom-28 -right-2 bg-white rounded-[14px] p-2 shadow-lg border border-[#E8F5EE]">
                  <div className="flex items-center gap-1.5">
                    <Users size={10} className="text-[#0077B6]" />
                    <span className="text-[8px] font-inter text-[#0077B6] font-semibold">156 pacientes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
