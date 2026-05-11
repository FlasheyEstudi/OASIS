'use client'

import { useState } from 'react'
import { Menu, X, Download, LogIn } from 'lucide-react'
import { OasisLogo } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'

export default function Header() {
  const { navigate } = useNavigation()
  const [open, setOpen] = useState(false)

  const navLinks = [
    { label: 'Inicio', action: () => navigate('landing') },
    { label: 'Para Pacientes', action: () => {} },
    { label: 'Para Farmacias', action: () => {} },
    { label: 'Para Clínicas', action: () => {} },
    { label: 'Sobre Nosotros', action: () => {} },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-[10px] border-b border-[#E0E0E0]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <button onClick={() => navigate('landing')} className="flex items-center">
            <OasisLogo size="sm" />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className="font-inter text-sm text-[#4A4A4A] hover:text-[#0E8C5E] transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0E8C5E] transition-all duration-200 group-hover:w-full rounded-full" />
              </button>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('login')}
              className="flex items-center gap-2 px-4 py-2.5 font-inter font-medium text-sm text-[#0E8C5E] hover:bg-[#E8F5EE] capsule transition-all duration-200"
            >
              <LogIn size={16} />
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate('register')}
              className="flex items-center gap-2 capsule oasis-gradient text-white px-5 py-2.5 font-inter font-semibold text-sm hover:scale-103 transition-transform duration-200 shadow-md"
            >
              <Download size={16} />
              Descargar App
            </button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <button className="p-2 text-[#4A4A4A]">
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-white rounded-l-[24px] p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-[#E0E0E0]">
                  <OasisLogo size="sm" />
                </div>
                <nav className="flex-1 p-6 space-y-2">
                  {navLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => { link.action(); setOpen(false) }}
                      className="w-full text-left px-4 py-3 rounded-[14px] font-inter text-[#4A4A4A] hover:bg-[#E8F5EE] hover:text-[#0E8C5E] transition-all duration-200"
                    >
                      {link.label}
                    </button>
                  ))}
                </nav>
                <div className="p-6 space-y-3">
                  <button
                    onClick={() => { navigate('login'); setOpen(false) }}
                    className="w-full capsule border-2 border-[#0E8C5E] text-[#0E8C5E] py-3 font-inter font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#E8F5EE] transition-all duration-200"
                  >
                    <LogIn size={16} />
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => { navigate('register'); setOpen(false) }}
                    className="w-full capsule oasis-gradient text-white py-3 font-inter font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Descargar App
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
