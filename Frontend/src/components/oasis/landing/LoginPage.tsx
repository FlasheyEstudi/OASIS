'use client'

import React, { useState } from 'react'
import { useNavigation } from '@/components/oasis/navigation-store'
import { useAuthStore, AppRole, getDefaultView } from '@/lib/auth-store'
import { OasisLogo, OasisButton } from '@/components/oasis/shared/shared-components'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Stethoscope, Pill, Heart, Shield, UserCog, Activity, Truck, Building2, Wifi, WifiOff } from 'lucide-react'

// Splash screen
export function OasisSplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'dropping' | 'expanding' | 'fading'>('dropping')

  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase('expanding'), 800)
    const t2 = setTimeout(() => setPhase('fading'), 1800)
    const t3 = setTimeout(() => onComplete(), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white transition-opacity duration-500 ${phase === 'fading' ? 'opacity-0' : 'opacity-100'
        }`}
    >
      <div className="flex flex-col items-center">
        <div className="relative">
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${phase === 'expanding' ? 'scale-[3] opacity-0' : 'scale-100 opacity-60'
              }`}
          >
            <div className="w-20 h-20 rounded-full border-2 border-[#0E8C5E]/20" />
          </div>
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all delay-200 duration-700 ${phase === 'expanding' ? 'scale-[3] opacity-0' : 'scale-100 opacity-40'
              }`}
          >
            <div className="w-28 h-28 rounded-full border-2 border-[#0E8C5E]/15" />
          </div>
          <div
            className={`relative transition-all duration-700 ease-out ${phase === 'dropping' ? 'scale-0 -translate-y-20 opacity-0' : 'scale-100 translate-y-0 opacity-100'
              }`}
          >
            <OasisLogo size="lg" />
          </div>
        </div>
        <p
          className={`mt-6 font-inter text-[#8A8A8A] text-sm transition-all duration-500 ${phase === 'expanding' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          Tu base de salud
        </p>
        <div
          className={`mt-8 flex items-center gap-2 transition-opacity duration-300 ${phase === 'fading' ? 'opacity-0' : 'opacity-100'
            }`}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#0E8C5E]"
              style={{ animation: 'dropPulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Demo accounts grouped by organization
interface DemoAccount {
  id: AppRole
  title: string
  subtitle: string
  icon: any
  email: string
  color: string
  bg: string
}

const demoGroups = [
  {
    label: 'Sistema',
    color: '#4A4A4A',
    bg: '#F5F5F5',
    accounts: [
      { id: 'superadmin' as AppRole, title: 'Super Admin', subtitle: 'Control total del sistema', icon: Shield, email: 'superadmin@oasis.nii', color: '#4A4A4A', bg: '#F5F5F5' },
    ]
  },
  {
    label: 'Clínica Santa María',
    color: '#0E8C5E',
    bg: '#E8F5EE',
    accounts: [
      { id: 'clinic_admin' as AppRole, title: 'Admin Clínica', subtitle: 'Gestión clínica completa', icon: Building2, email: 'admin@santamaria.nii', color: '#0E8C5E', bg: '#E8F5EE' },
      { id: 'receptionist' as AppRole, title: 'Recepcionista', subtitle: 'Agenda, check-in, cobros', icon: Activity, email: 'recepcion@santamaria.nii', color: '#0077B6', bg: '#E0F2FF' },
      { id: 'doctor' as AppRole, title: 'Doctor', subtitle: 'Citas, recetas, teleconsulta', icon: Stethoscope, email: 'dr.garcia@santamaria.nii', color: '#0E8C5E', bg: '#E8F5EE' },
    ]
  },
  {
    label: 'Farmacia Central',
    color: '#0077B6',
    bg: '#E0F2FF',
    accounts: [
      { id: 'pharmacy_admin' as AppRole, title: 'Admin Farmacia', subtitle: 'Inventario, ventas, proveedores', icon: Pill, email: 'admin@farmaciacentral.nii', color: '#0077B6', bg: '#E0F2FF' },
      { id: 'pharmacy_staff' as AppRole, title: 'Staff Farmacia', subtitle: 'Procesar órdenes y dispensar', icon: UserCog, email: 'vendedor@farmaciacentral.nii', color: '#0077B6', bg: '#E0F2FF' },
    ]
  },
  {
    label: 'Personal',
    color: '#F4A261',
    bg: '#FFF3E0',
    accounts: [
      { id: 'patient' as AppRole, title: 'Paciente', subtitle: 'Tu salud en tu bolsillo', icon: Heart, email: 'carlos@email.com', color: '#0E8C5E', bg: '#E8F5EE' },
      { id: 'delivery_person' as AppRole, title: 'Repartidor', subtitle: 'Entregas y ganancias', icon: Truck, email: 'repartidor1@oasis.nii', color: '#F4A261', bg: '#FFF3E0' },
    ]
  },
]

function DemoButton({ label, role, icon: Icon, color, bg, onClick, loading }: any) {
  return (
    <button
      onClick={() => onClick(role)}
      disabled={loading}
      className="flex items-center gap-3 p-4 bg-white border-2 border-[#F0F0F0] rounded-[24px] hover:border-[#0E8C5E] hover:shadow-lg transition-all duration-300 group text-left relative overflow-hidden"
    >
      <div 
        className="w-12 h-12 rounded-[18px] flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: bg }}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" style={{ color }} />
        ) : (
          <Icon size={24} style={{ color }} className="group-hover:scale-110 transition-transform" />
        )}
      </div>
      <div>
        <span className="block font-nunito font-bold text-[#4A4A4A] text-sm group-hover:text-[#0E8C5E] transition-colors">{label}</span>
        <span className="block font-inter text-[10px] text-[#8A8A8A]">Acceso Demo</span>
      </div>
    </button>
  )
}

function ConnectionCheck() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle')
  const [details, setDetails] = useState<any>(null)

  const check = async () => {
    setStatus('checking')
    try {
      const res = await fetch('/api/v1/health')
      const json = await res.json()
      if (json.success && json.data?.database === 'connected') {
        setStatus('online')
        setDetails(json.data)
      } else {
        setStatus('offline')
      }
    } catch {
      setStatus('offline')
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={check}
        disabled={status === 'checking'}
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-inter text-xs font-semibold transition-all duration-300 ${
          status === 'online' ? 'bg-[#E8F5EE] text-[#0E8C5E]' :
          status === 'offline' ? 'bg-[#FEE2E2] text-[#DC2626]' :
          'bg-[#F5F5F5] text-[#8A8A8A] hover:bg-[#E0E0E0]'
        }`}
      >
        {status === 'checking' ? (
          <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        ) : status === 'online' ? (
          <Wifi size={14} />
        ) : status === 'offline' ? (
          <WifiOff size={14} />
        ) : (
          <Activity size={14} />
        )}
        {status === 'idle' ? 'Verificar conexión' : 
         status === 'checking' ? 'Verificando...' :
         status === 'online' ? 'Conectado a Oasis v1.0' : 'Backend fuera de línea'}
      </button>

      {status === 'online' && details && (
        <div className="flex items-center gap-4 text-[10px] font-inter text-[#8A8A8A] animate-fade-in">
          <span>DB: {details.database}</span>
          <span>Migraciones: {details.migrations}</span>
          <span>Ping: {details.responseTime}</span>
        </div>
      )}
    </div>
  )
}

export default function LoginPage() {
  const { navigate } = useNavigation()
  const { login, loginDemo, isLoading: authLoading, error: authError, clearError, isDemoMode } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [demoLoading, setDemoLoading] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    const result = await login(email, password)
    if (result.success) {
      const role = useAuthStore.getState().user?.role || 'patient'
      navigate(getDefaultView(role) as any)
    }
  }

  const handleDemoLogin = async (role: AppRole) => {
    setDemoLoading(role)
    clearError()
    const result = await loginDemo(role)
    if (result.success) {
      navigate(getDefaultView(role) as any)
    }
    setDemoLoading(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top gradient accent */}
      <div className="h-1 oasis-gradient" />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        {/* Logo */}
        <div className="mb-6 float-up">
          <OasisLogo size="lg" />
        </div>

        <p className="font-inter text-[#8A8A8A] text-sm mb-6 float-up" style={{ animationDelay: '0.1s' }}>
          Tu base de salud
        </p>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-4 float-up"
          style={{ animationDelay: '0.2s' }}
        >
          {/* Email */}
          <div className="space-y-1.5">
            <label className="font-inter font-medium text-sm text-[#4A4A4A]">Correo electrónico</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError() }}
                placeholder="tu@correo.com"
                className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] pl-10 pr-4 py-3 font-inter text-sm text-[#4A4A4A] focus:border-[#0E8C5E] focus:ring-2 focus:ring-[#0E8C5E]/20 focus:outline-none placeholder:text-[#B0B0B0] transition-all duration-200"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="font-inter font-medium text-sm text-[#4A4A4A]">Contraseña</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError() }}
                placeholder="Tu contraseña"
                className="w-full input-oasis border-2 border-[#E0E0E0] bg-[#FAFAFA] pl-10 pr-12 py-3 font-inter text-sm text-[#4A4A4A] focus:border-[#0E8C5E] focus:ring-2 focus:ring-[#0E8C5E]/20 focus:outline-none placeholder:text-[#B0B0B0] transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#4A4A4A] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {authError && (
            <div className="bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] px-4 py-3 rounded-[14px] text-sm font-inter">
              {authError}
            </div>
          )}

          {/* Forgot password */}
          <div className="flex justify-end">
            <button type="button" className="font-inter text-xs text-[#0077B6] hover:text-[#005F92] transition-colors">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full capsule oasis-gradient text-white py-3 font-inter font-semibold text-sm hover:brightness-110 active:scale-[0.97] shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {authLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Iniciar Sesión
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="w-full max-w-sm flex items-center gap-4 my-5 float-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex-1 h-px bg-[#E0E0E0]" />
          <span className="font-inter text-xs text-[#8A8A8A] whitespace-nowrap">o prueba una cuenta demo</span>
          <div className="flex-1 h-px bg-[#E0E0E0]" />
        </div>

        {/* Demo Role Selection - Grouped by organization */}
        <div className="w-full max-w-lg float-up" style={{ animationDelay: '0.4s' }}>
          <div className="space-y-4">
            {demoGroups.map((group) => (
              <div key={group.label}>
                {/* Group label */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }} />
                  <span className="font-nunito font-bold text-sm" style={{ color: group.color }}>{group.label}</span>
                </div>
                {/* Role buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {group.accounts.map((role) => {
                    const Icon = role.icon
                    const isThisLoading = demoLoading === role.id
                    return (
                      <button
                        key={role.id}
                        onClick={() => handleDemoLogin(role.id)}
                        disabled={demoLoading !== null}
                        className="flex flex-col items-center gap-1.5 p-3 card-oasis border border-[#E0E0E0] hover:border-[#0E8C5E]/30 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,102,153,0.12)] transition-all duration-200 disabled:opacity-50"
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: role.bg }}
                        >
                          {isThisLoading ? (
                            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" style={{ color: role.color }} />
                          ) : (
                            <Icon size={18} style={{ color: role.color }} />
                          )}
                        </div>
                        <div className="text-center">
                          <p className="font-nunito font-bold text-[#4A4A4A] text-[11px] leading-tight">{role.title}</p>
                          <p className="font-inter text-[9px] text-[#8A8A8A] leading-tight mt-0.5">{role.subtitle}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Demo mode notice */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-inter text-[#8A8A8A]">
            <WifiOff size={12} />
            <span>Las demos funcionan en modo offline si la API no está disponible</span>
          </div>
        </div>

        {/* Register link */}
        <p className="mt-6 font-inter text-sm text-[#8A8A8A] float-up" style={{ animationDelay: '0.5s' }}>
          ¿No tienes cuenta?{' '}
          <button
            onClick={() => navigate('register')}
            className="text-[#0E8C5E] font-semibold hover:text-[#0A6B45] transition-colors"
          >
            Regístrate
          </button>
        </p>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="font-inter text-xs text-[#B0B0B0]">
          OASIS Health Technologies &middot; Nicaragua
        </p>
      </footer>
    </div>
  )
}
