'use client'

import { OasisLogo } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'

const footerLinks = [
  {
    title: 'Producto',
    links: ['Para Pacientes', 'Para Farmacias', 'Para Clínicas', 'Descargar App', 'Precios'],
  },
  {
    title: 'Empresa',
    links: ['Sobre Nosotros', 'Blog', 'Carreras', 'Prensa', 'Contacto'],
  },
  {
    title: 'Legal',
    links: ['Términos de Servicio', 'Política de Privacidad', 'Política de Cookies', 'Regulación de Salud'],
  },
]

export default function Footer() {
  const { navigate } = useNavigation()

  return (
    <footer className="bg-[#0A6B45] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <svg width="28" height="36" viewBox="0 0 36 47" fill="none">
                <path d="M18 0C18 0 0 22.5 0 31.5C0 39.784 8.059 47 18 47C27.941 47 36 39.784 36 31.5C36 22.5 18 0 18 0Z" fill="white" opacity="0.9"/>
                <ellipse cx="12" cy="29" rx="4" ry="5" fill="#0A6B45" opacity="0.3"/>
              </svg>
              <span className="font-nunito font-bold text-white text-xl">Oasis</span>
            </div>
            <p className="font-inter text-sm text-white/70 leading-relaxed mb-6">
              Tu salud, más cerca que nunca. La plataforma de salud digital que conecta a Nicaragua.
            </p>
            {/* Social circles */}
            <div className="flex items-center gap-3">
              {['f', '𝕏', 'in', 'ig'].map((s, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <span className="text-xs font-inter font-semibold text-white">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section, i) => (
            <div key={i}>
              <h4 className="font-nunito font-bold text-sm mb-4">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <button
                      onClick={() => link === 'Descargar App' ? navigate('register') : undefined}
                      className="font-inter text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-inter text-xs text-white/40">
            © 2025 Oasis Health. Todos los derechos reservados.
          </p>
          <p className="font-nunito font-bold text-sm text-white/50">
            Tu base de salud
          </p>
        </div>
      </div>
    </footer>
  )
}
