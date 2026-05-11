'use client'

import { Download, ArrowRight, Pill } from 'lucide-react'
import { OasisButton } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'

// New OASIS Drop with Network Nodes - reusable inline SVG
function OasisDropWithNodes({ size = 40, className = '' }: { size?: number; className?: string }) {
  const h = size * 1.2
  return (
    <svg width={size} height={h} viewBox="0 0 64 78" fill="none" className={className}>
      <defs>
        <linearGradient id={`dropGrad-${size}`} x1="16" y1="4" x2="48" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0E8C5E" />
          <stop offset="1" stopColor="#0A6B45" />
        </linearGradient>
        <linearGradient id={`nodeGrad1-${size}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#0077B6" />
          <stop offset="1" stopColor="#005F92" />
        </linearGradient>
      </defs>
      {/* Left curve */}
      <path d="M32 4C32 4 14 24 14 40C14 50.5 22 56 32 56C32 56 26 54 24 46C22 38 26 20 32 4Z" fill={`url(#dropGrad-${size})`} />
      {/* Right curve */}
      <path d="M32 4C32 4 50 24 50 40C50 50.5 42 56 32 56C32 56 38 54 40 46C42 38 38 20 32 4Z" fill={`url(#dropGrad-${size})`} />
      {/* Inner highlight */}
      <ellipse cx="26" cy="32" rx="5" ry="10" fill="white" opacity="0.18" />
      {/* Network lines */}
      <path d="M26 54C22 58 18 60 14 62" stroke="#0077B6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M32 56C32 60 32 62 32 66" stroke="#0077B6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M38 54C42 58 46 60 50 62" stroke="#0077B6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      {/* Cross connections */}
      <path d="M14 62C20 66 26 66 32 66" stroke="#0077B6" strokeWidth="1" strokeLinecap="round" opacity="0.25" strokeDasharray="2 2" />
      <path d="M50 62C44 66 38 66 32 66" stroke="#0077B6" strokeWidth="1" strokeLinecap="round" opacity="0.25" strokeDasharray="2 2" />
      {/* Nodes */}
      <circle cx="14" cy="64" r="4" fill={`url(#nodeGrad1-${size})`} opacity="0.9" />
      <circle cx="32" cy="68" r="4" fill="#0077B6" opacity="0.9" />
      <circle cx="50" cy="64" r="4" fill={`url(#nodeGrad1-${size})`} opacity="0.9" />
      {/* Node white dots */}
      <circle cx="14" cy="64" r="1.5" fill="white" opacity="0.5" />
      <circle cx="32" cy="68" r="1.5" fill="white" opacity="0.5" />
      <circle cx="50" cy="64" r="1.5" fill="white" opacity="0.5" />
    </svg>
  )
}

export default function Hero() {
  const { navigate } = useNavigation()

  return (
    <section className="relative overflow-hidden bg-gradient-radial from-[#E8F5EE]/60 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h1 className="font-nunito font-bold text-[28px] sm:text-[36px] md:text-[42px] lg:text-[48px] leading-tight text-[#4A4A4A] mb-6">
              Encuentra tu medicina en segundos,{' '}
              <span className="oasis-gradient-text">no en horas</span>
            </h1>
            <p className="font-inter font-light text-[16px] sm:text-[18px] md:text-[20px] text-[#4A4A4A]/80 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Oasis conecta tu receta médica con la farmacia más cercana que tiene todo lo que necesitas. Delivery o pickup.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <OasisButton size="lg" onClick={() => navigate('register')}>
                Comienza gratis
                <ArrowRight size={18} className="ml-2 inline" />
              </OasisButton>
            </div>
            <p className="mt-4 font-inter text-xs text-[#8A8A8A] text-center lg:text-left">
              Sin tarjeta de crédito · Cancela cuando quieras
            </p>
          </div>

          {/* Illustration - Phone mockup with new logo */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-[280px] h-[400px] sm:w-[320px] sm:h-[450px] lg:w-[360px] lg:h-[500px]">
              {/* Phone mockup */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[200px] sm:w-[230px] lg:w-[260px] h-[360px] sm:h-[410px] lg:h-[460px] bg-white rounded-[30px] shadow-2xl border-4 border-[#E8F5EE] overflow-hidden relative">
                  {/* Phone screen content */}
                  <div className="h-full bg-gradient-to-b from-[#E8F5EE] to-white p-4 flex flex-col">
                    {/* App header with new logo */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full oasis-gradient flex items-center justify-center">
                        <OasisDropWithNodes size={14} />
                      </div>
                      <span className="font-nunito font-bold text-[#0E8C5E] text-sm">Oasis</span>
                    </div>
                    <div className="bg-white rounded-[14px] p-3 mb-3 border border-[#E0E0E0]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#E8F5EE] flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0E8C5E" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        </div>
                        <span className="text-[10px] text-[#8A8A8A] font-inter">Busca tu medicamento...</span>
                      </div>
                    </div>
                    {/* Fake med cards */}
                    <div className="space-y-2 flex-1">
                      {[1,2,3].map(i => (
                        <div key={i} className="bg-white rounded-[12px] p-2.5 border border-[#E8F5EE] flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#E8F5EE] flex items-center justify-center"><Pill size={10} className="text-[#0E8C5E]" /></div>
                          <div className="flex-1">
                            <div className="h-2 w-16 bg-[#E8F5EE] rounded-full mb-1" />
                            <div className="h-1.5 w-12 bg-[#E0E0E0] rounded-full" />
                          </div>
                          <div className="text-[8px] font-inter font-semibold text-[#0E8C5E]">C$150</div>
                        </div>
                      ))}
                    </div>
                    {/* Bottom nav dots (network nodes) */}
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <div className="w-2 h-2 rounded-full bg-[#0E8C5E]" />
                      <div className="w-1 h-1 rounded-full bg-[#0077B6] opacity-40" />
                      <div className="w-2 h-2 rounded-full bg-[#0077B6] opacity-30" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating logo drop with network nodes - main */}
              <div className="absolute top-6 right-0 sm:right-2 drop-loader">
                <OasisDropWithNodes size={48} />
              </div>

              {/* Medium floating logo */}
              <div className="absolute bottom-20 left-0 drop-loader" style={{ animationDelay: '0.5s' }}>
                <OasisDropWithNodes size={24} />
              </div>

              {/* Small floating node-only decoration */}
              <div className="absolute top-28 left-2 drop-loader" style={{ animationDelay: '1s' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="4" fill="#0077B6" opacity="0.3" />
                  <circle cx="4" cy="16" r="2.5" fill="#0E8C5E" opacity="0.2" />
                  <circle cx="16" cy="16" r="2.5" fill="#0E8C5E" opacity="0.2" />
                  <path d="M8 12L4 16" stroke="#0077B6" strokeWidth="0.8" opacity="0.3" />
                  <path d="M12 12L16 16" stroke="#0077B6" strokeWidth="0.8" opacity="0.3" />
                </svg>
              </div>

              {/* Another small network node cluster */}
              <div className="absolute bottom-40 right-6 drop-loader" style={{ animationDelay: '0.8s' }}>
                <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
                  <circle cx="6" cy="9" r="3" fill="#0E8C5E" opacity="0.15" />
                  <circle cx="18" cy="9" r="3" fill="#0077B6" opacity="0.2" />
                  <path d="M9 9L15 9" stroke="#0077B6" strokeWidth="0.8" opacity="0.3" strokeDasharray="2 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-[40px] md:h-[60px]">
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}
