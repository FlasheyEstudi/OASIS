'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    q: '¿Oasis es gratuito para los pacientes?',
    a: 'Sí, crear una cuenta y buscar medicamentos es completamente gratis. Solo pagas por los medicamentos que compres, al precio de la farmacia.',
  },
  {
    q: '¿Cómo funciona el delivery de medicamentos?',
    a: 'Cuando haces un pedido, la farmacia lo prepara y un repartidor lo lleva a tu puerta. Puedes rastrear tu pedido en tiempo real desde la app.',
  },
  {
    q: '¿Mis recetas médicas están seguras en Oasis?',
    a: 'Absolutamente. Usamos encriptación de grado bancario y cumplimos con todas las normativas de protección de datos de salud.',
  },
  {
    q: '¿Puedo usar Oasis para mi familia?',
    a: '¡Claro! Puedes agregar perfiles familiares y gestionar las recetas y recordatorios de cada miembro desde tu cuenta.',
  },
  {
    q: '¿Qué farmacias participan en Oasis?',
    a: 'Trabajamos con una red creciente de farmacias en Managua y otras ciudades de Nicaragua. Cada día se suman más.',
  },
  {
    q: '¿Cómo puede mi farmacia o clínica unirse a Oasis?',
    a: 'Solo necesitas crear una cuenta, seleccionar tu rol como farmacia o clínica, y nuestro equipo te contactará para la configuración.',
  },
]

export default function FAQ() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-nunito font-bold text-[28px] md:text-[36px] text-[#4A4A4A] mb-4">
            Preguntas frecuentes
          </h2>
          <p className="font-inter text-[#8A8A8A] text-base">
            Todo lo que necesitas saber sobre Oasis
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-white card-oasis border-0 px-6 !rounded-[20px] overflow-hidden"
            >
              <AccordionTrigger className="font-nunito font-bold text-sm md:text-base text-[#4A4A4A] hover:text-[#0E8C5E] hover:no-underline py-5 text-left">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="font-inter text-sm text-[#8A8A8A] leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
