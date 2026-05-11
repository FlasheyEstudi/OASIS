'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StarRating } from '../shared/shared-components'

const testimonials = [
  {
    name: 'María López',
    role: 'Paciente',
    initials: 'ML',
    text: 'Oasis me salvó cuando necesitaba una medicina urgente de madrugada. Encontré una farmacia 24h y me la llevaron a casa. ¡Increíble!',
    rating: 5,
  },
  {
    name: 'Dr. Carlos Ruiz',
    role: 'Médico General',
    initials: 'CR',
    text: 'Las recetas digitales me ahorran tiempo y mis pacientes llegan a la farmacia con todo listo. La teleconsulta es un game changer.',
    rating: 5,
  },
  {
    name: 'Farmacia San José',
    role: 'Farmacia',
    initials: 'FS',
    text: 'Nuestras ventas aumentaron 30% desde que nos conectamos con Oasis. El inventario inteligente nos evita quiebres de stock.',
    rating: 4,
  },
]

export default function Testimonials() {
  return (
    <>
      <div className="bg-white">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-[40px] md:h-[60px]">
          <path d="M0,40 C240,0 480,80 720,40 C960,0 1200,80 1440,40 L1440,80 L0,80 Z" fill="#E8F5EE"/>
        </svg>
      </div>
      <section className="bg-[#E8F5EE] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-nunito font-bold text-[28px] md:text-[36px] text-[#4A4A4A] mb-4">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="font-inter text-[#8A8A8A] text-base">
              Miles de nicaragüenses ya confían en Oasis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white card-oasis p-6 hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12 border-2 border-[#E8F5EE]">
                    <AvatarFallback className="bg-[#E8F5EE] text-[#0E8C5E] font-nunito font-bold text-sm">
                      {t.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-nunito font-bold text-sm text-[#4A4A4A]">{t.name}</div>
                    <div className="font-inter text-xs text-[#8A8A8A]">{t.role}</div>
                  </div>
                </div>
                <StarRating rating={t.rating} size={14} />
                <p className="font-inter text-sm text-[#4A4A4A] mt-3 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
