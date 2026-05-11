'use client'

import { FileText, MapPin, Truck, ArrowRight } from 'lucide-react'

const steps = [
  {
    icon: FileText,
    title: 'Tu doctor crea la receta digital',
    desc: 'Sin papeles, sin filas. Tu receta llega directo a tu teléfono.',
    color: '#0E8C5E',
  },
  {
    icon: MapPin,
    title: 'Oasis busca la farmacia ideal',
    desc: 'Comparamos precios, disponibilidad y distancia para ti.',
    color: '#0077B6',
  },
  {
    icon: Truck,
    title: 'Recibe tu medicina o recógela',
    desc: 'Delivery a tu puerta o pickup en la farmacia, tú decides.',
    color: '#0E8C5E',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-nunito font-bold text-[28px] md:text-[36px] text-[#4A4A4A] mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="font-inter text-[#8A8A8A] text-base md:text-lg max-w-xl mx-auto">
            Tres simples pasos para tener tu medicina cuando la necesitas
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-6 relative">
          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center">
              {/* Step card */}
              <div className="bg-white card-oasis p-8 max-w-[320px] w-full hover:-translate-y-1 transition-all duration-200">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ backgroundColor: `${step.color}15` }}
                >
                  <step.icon size={28} style={{ color: step.color }} />
                </div>
                <div className="font-nunito font-bold text-xs text-white w-6 h-6 rounded-full oasis-gradient flex items-center justify-center mx-auto mb-3">
                  {i + 1}
                </div>
                <h3 className="font-nunito font-bold text-lg text-[#4A4A4A] mb-2">{step.title}</h3>
                <p className="font-inter text-sm text-[#8A8A8A] leading-relaxed">{step.desc}</p>
              </div>

              {/* Connector arrow - desktop */}
              {i < 2 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="relative">
                    {/* Wavy line SVG */}
                    <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
                      <path
                        d="M0 10C5 4, 10 4, 15 10C20 16, 25 16, 30 10C33 6, 36 6, 40 10"
                        stroke="#0E8C5E"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                        opacity="0.4"
                      />
                    </svg>
                    <ArrowRight size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#0E8C5E] opacity-40" />
                  </div>
                </div>
              )}

              {/* Connector arrow - mobile */}
              {i < 2 && (
                <div className="md:hidden flex justify-center py-2">
                  <svg width="20" height="40" viewBox="0 0 20 40" fill="none">
                    <path
                      d="M10 0C6 5, 6 10, 10 15C14 20, 14 25, 10 30C8 33, 8 36, 10 40"
                      stroke="#0E8C5E"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.4"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
