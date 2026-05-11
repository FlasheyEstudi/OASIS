'use client'

import { useState } from 'react'
import { User, Mail, Phone, Lock, Eye, EyeOff, Heart, Pill, Building2, ArrowLeft } from 'lucide-react'
import { OasisButton, OasisInput, OasisLogo, DropLoader, HeartbeatCheck } from '../shared/shared-components'
import { useNavigation } from '../navigation-store'

const roles = [
  { id: 'patient' as const, label: 'Paciente', icon: Heart, color: '#0E8C5E', desc: 'Busca medicamentos y cuida tu salud' },
  { id: 'pharmacy' as const, label: 'Farmacia', icon: Pill, color: '#0077B6', desc: 'Gestiona tu inventario y ventas' },
  { id: 'clinic' as const, label: 'Clínica', icon: Building2, color: '#0E8C5E', desc: 'Administra citas, doctores y recetas' },
]

type Role = 'patient' | 'pharmacy' | 'clinic'

export default function RegisterPage() {
  const { navigate } = useNavigation()
  const [role, setRole] = useState<Role>('patient')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (form.name.length < 3) e.name = 'Mínimo 3 caracteres'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
    if (!/^\d{8}$/.test(form.phone)) e.phone = '8 dígitos requeridos'
    if (form.password.length < 8) e.password = 'Mínimo 8 caracteres'
    if (form.password !== form.confirm) e.confirm = 'Las contraseñas no coinciden'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => {
        if (role === 'patient') navigate('patient-feed')
        else if (role === 'pharmacy') navigate('pharmacy-inventory')
        else navigate('platform-dashboard')
      }, 1200)
    }, 2000)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center float-up">
          <HeartbeatCheck size={72} />
          <h2 className="font-nunito font-bold text-2xl text-[#4A4A4A] mt-6 mb-2">¡Cuenta creada!</h2>
          <p className="font-inter text-[#8A8A8A]">Bienvenido al ecosistema de salud más humano de Nicaragua</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Illustration */}
      <div className="hidden md:flex md:w-5/12 oasis-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="text-center relative z-10">
          {/* New logo: Drop with network nodes */}
          <svg width="160" height="200" viewBox="0 0 64 78" fill="none" className="mx-auto mb-8 drop-loader">
            <defs>
              <linearGradient id="regDropGrad" x1="16" y1="4" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="white" stopOpacity="0.3" />
                <stop offset="1" stopColor="white" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {/* Left curve */}
            <path d="M32 4C32 4 14 24 14 40C14 50.5 22 56 32 56C32 56 26 54 24 46C22 38 26 20 32 4Z" fill="url(#regDropGrad)" />
            {/* Right curve */}
            <path d="M32 4C32 4 50 24 50 40C50 50.5 42 56 32 56C32 56 38 54 40 46C42 38 38 20 32 4Z" fill="url(#regDropGrad)" />
            {/* Outline */}
            <path d="M32 4C32 4 14 24 14 40C14 50.5 22 56 32 56C42 56 50 50.5 50 40C50 24 32 4 32 4Z" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3" />
            {/* Inner highlight */}
            <ellipse cx="26" cy="32" rx="5" ry="10" fill="white" opacity="0.08" />
            {/* Network lines */}
            <path d="M26 54C22 58 18 60 14 62" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
            <path d="M32 56C32 60 32 62 32 66" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
            <path d="M38 54C42 58 46 60 50 62" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
            {/* Cross connections */}
            <path d="M14 62C20 66 26 66 32 66" stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.15" strokeDasharray="2 2" />
            <path d="M50 62C44 66 38 66 32 66" stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.15" strokeDasharray="2 2" />
            {/* Nodes */}
            <circle cx="14" cy="64" r="4" fill="white" opacity="0.3" />
            <circle cx="32" cy="68" r="4" fill="white" opacity="0.4" />
            <circle cx="50" cy="64" r="4" fill="white" opacity="0.3" />
            {/* Node icons */}
            <rect x="12" y="61" width="4" height="6" rx="1" fill="white" opacity="0.5" />
            <rect x="11" y="62" width="6" height="4" rx="1" fill="white" opacity="0.5" />
            <path d="M30 66C30 64 31 63 32 64.5C33 63 34 64 34 66C34 68 32 70 32 70C32 70 30 68 30 66Z" fill="white" opacity="0.5" />
            <rect x="48" y="63" width="4" height="2.5" rx="1.25" fill="white" opacity="0.5" transform="rotate(-30 50 64.25)" />
          </svg>
          <h2 className="font-nunito font-bold text-3xl text-white mb-3">
            Únete al ecosistema de salud más humano de Nicaragua
          </h2>
          <p className="font-inter font-light text-white/70 text-base">
            Conectamos pacientes, doctores y farmacias para que la salud esté más cerca que nunca.
          </p>
        </div>
        {/* Decorative drops with network style */}
        <div className="absolute top-8 right-8 opacity-10">
          <svg width="50" height="65" viewBox="0 0 64 78" fill="none">
            <path d="M32 4C32 4 14 24 14 40C14 50.5 22 56 32 56C42 56 50 50.5 50 40C50 24 32 4 32 4Z" fill="white"/>
            <circle cx="14" cy="64" r="3" fill="white" opacity="0.5" />
            <circle cx="32" cy="68" r="3" fill="white" opacity="0.5" />
            <circle cx="50" cy="64" r="3" fill="white" opacity="0.5" />
          </svg>
        </div>
        <div className="absolute bottom-12 left-12 opacity-10">
          <svg width="35" height="46" viewBox="0 0 64 78" fill="none">
            <path d="M32 4C32 4 14 24 14 40C14 50.5 22 56 32 56C42 56 50 50.5 50 40C50 24 32 4 32 4Z" fill="white"/>
            <circle cx="14" cy="64" r="3" fill="white" opacity="0.5" />
            <circle cx="32" cy="68" r="3" fill="white" opacity="0.5" />
            <circle cx="50" cy="64" r="3" fill="white" opacity="0.5" />
          </svg>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-2 text-[#8A8A8A] font-inter text-sm mb-8 hover:text-[#0E8C5E] transition-colors"
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </button>

          <div className="flex items-center gap-2 mb-2">
            <OasisLogo size="sm" />
          </div>
          <h1 className="font-nunito font-bold text-2xl md:text-3xl text-[#4A4A4A] mb-2">Crear cuenta</h1>
          <p className="font-inter text-sm text-[#8A8A8A] mb-8">Selecciona tu rol y completa tus datos</p>

          {/* Role Selection */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`p-3 rounded-[16px] border-2 transition-all duration-200 text-center hover:scale-103 ${
                  role === r.id
                    ? 'border-[#0E8C5E] bg-[#E8F5EE]'
                    : 'border-[#E0E0E0] bg-white hover:border-[#0E8C5E]/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  role === r.id ? 'bg-[#0E8C5E]' : 'bg-[#E8F5EE]'
                }`}>
                  <r.icon size={18} className={role === r.id ? 'text-white' : 'text-[#0E8C5E]'} />
                </div>
                <div className={`font-nunito font-bold text-xs ${
                  role === r.id ? 'text-[#0E8C5E]' : 'text-[#4A4A4A]'
                }`}>
                  {r.label}
                </div>
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="space-y-4">
            <OasisInput
              label="Nombre completo"
              icon={<User size={16} />}
              placeholder="Ej: María López"
              value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) validate() }}
              error={errors.name}
            />
            <OasisInput
              label="Email"
              icon={<Mail size={16} />}
              type="email"
              placeholder="maria@ejemplo.com"
              value={form.email}
              onChange={(e) => { setForm({ ...form, email: e.target.value }); if (errors.email) validate() }}
              error={errors.email}
            />
            <OasisInput
              label="Teléfono"
              icon={<Phone size={16} />}
              type="tel"
              placeholder="88888888"
              value={form.phone}
              onChange={(e) => { setForm({ ...form, phone: e.target.value }); if (errors.phone) validate() }}
              error={errors.phone}
            />
            <div className="relative">
              <OasisInput
                label="Contraseña"
                icon={<Lock size={16} />}
                type={showPass ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={(e) => { setForm({ ...form, password: e.target.value }); if (errors.password) validate() }}
                error={errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-[38px] text-[#8A8A8A] hover:text-[#0E8C5E]"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="relative">
              <OasisInput
                label="Confirmar contraseña"
                icon={<Lock size={16} />}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repite tu contraseña"
                value={form.confirm}
                onChange={(e) => { setForm({ ...form, confirm: e.target.value }); if (errors.confirm) validate() }}
                error={errors.confirm}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-[38px] text-[#8A8A8A] hover:text-[#0E8C5E]"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8">
            {loading ? (
              <div className="flex items-center justify-center py-3">
                <DropLoader size={48} />
              </div>
            ) : (
              <OasisButton size="lg" className="w-full" onClick={handleSubmit}>
                Crear cuenta
              </OasisButton>
            )}
          </div>

          <p className="mt-6 text-center font-inter text-xs text-[#8A8A8A]">
            Al crear una cuenta, aceptas nuestros{' '}
            <span className="text-[#0E8C5E] cursor-pointer">Términos de Servicio</span> y{' '}
            <span className="text-[#0E8C5E] cursor-pointer">Política de Privacidad</span>
          </p>
          <p className="mt-3 text-center font-inter text-sm text-[#8A8A8A]">
            ¿Ya tienes cuenta?{' '}
            <button onClick={() => navigate('login')} className="text-[#0E8C5E] font-semibold hover:text-[#0A6B45] transition-colors">
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
