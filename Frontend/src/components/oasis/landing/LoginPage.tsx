'use client'

import React, { useState, useEffect } from 'react'
import { useNavigation } from '@/components/oasis/navigation-store'
import { useAuthStore, AppRole, getDefaultView } from '@/lib/auth-store'
import { OasisLogo, OasisButton, HeartbeatCheck, DropLoader } from '@/components/oasis/shared/shared-components'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Stethoscope, Pill, Heart, Shield, UserCog, Activity, Truck, Building2, Wifi, WifiOff, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

// Splash screen
export function OasisSplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'dropping' | 'expanding' | 'fading'>('dropping')

  useEffect(() => {
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
      <div className="absolute inset-0 oasis-gradient opacity-5" />
      <div className="flex flex-col items-center relative z-10">
        <div className="relative">
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${phase === 'expanding' ? 'scale-[4] opacity-0' : 'scale-100 opacity-60'
              }`}
          >
            <div className="w-24 h-24 rounded-full border-2 border-[#0E8C5E]/20" />
          </div>
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all delay-200 duration-1000 ${phase === 'expanding' ? 'scale-[4] opacity-0' : 'scale-100 opacity-40'
              }`}
          >
            <div className="w-32 h-32 rounded-full border-2 border-[#0E8C5E]/15" />
          </div>
          <div
            className={`relative transition-all duration-800 ease-out ${phase === 'dropping' ? 'scale-0 -translate-y-24 opacity-0' : 'scale-110 translate-y-0 opacity-100'
              }`}
          >
            <OasisLogo size="lg" />
          </div>
        </div>
        <p
          className={`mt-10 font-nunito font-bold text-[#0E8C5E] text-lg tracking-wider transition-all duration-700 delay-300 ${phase === 'expanding' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          TU BASE DE SALUD
        </p>
        <div
          className={`mt-12 flex items-center gap-3 transition-opacity duration-300 ${phase === 'fading' ? 'opacity-0' : 'opacity-100'
            }`}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-[#0E8C5E]"
              style={{ animation: 'dropPulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ConnectionCheck() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle')
  const [details, setDetails] = useState<any>(null)
  const [open, setOpen] = useState(false)

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={check}
          className="flex items-center gap-2 px-4 py-2 bg-[#FAFAFA] border border-[#E0E0E0] rounded-full font-inter text-xs font-semibold text-[#8A8A8A] hover:bg-[#F0F0F0] transition-all"
        >
          <Wifi size={14} />
          Verificar conexión
        </button>
      </DialogTrigger>
      <DialogContent className="modal-oasis max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-nunito font-bold text-xl">Estado del Ecosistema</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            {status === 'checking' ? (
              <DropLoader size={48} />
            ) : status === 'online' ? (
              <CheckCircle2 size={56} className="text-[#0E8C5E]" />
            ) : (
              <AlertTriangle size={56} className="text-[#F4A261]" />
            )}
            <h3 className="font-nunito font-bold text-lg text-[#4A4A4A]">
              {status === 'checking' ? 'Sincronizando...' : status === 'online' ? 'Sistemas Operativos' : 'Error de Conexión'}
            </h3>
            <p className="font-inter text-sm text-[#8A8A8A]">
              {status === 'online' ? 'Todos los servicios de Oasis están listos para la demo.' : 'No se pudo establecer contacto con el backend.'}
            </p>
          </div>

          {status === 'online' && details && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Base de Datos', val: details.database, ok: details.database === 'connected' },
                { label: 'Migraciones', val: details.migrations, ok: true },
                { label: 'Latencia', val: details.responseTime, ok: true },
                { label: 'Usuarios Demo', val: '25 activos', ok: true },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-[#FAFAFA] rounded-2xl border border-[#F0F0F0]">
                  <p className="text-[10px] font-bold text-[#8A8A8A] uppercase mb-0.5">{item.label}</p>
                  <p className={`font-inter text-xs font-bold ${item.ok ? 'text-[#0E8C5E]' : 'text-[#EF4444]'}`}>{item.val}</p>
                </div>
              ))}
            </div>
          )}

          <OasisButton fullWidth onClick={() => { if (status !== 'checking') check() }}>
            {status === 'checking' ? 'Verificando...' : 'Volver a intentar'}
          </OasisButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function LoginPage() {
  const { navigate } = useNavigation()
  const { login, loginDemo, isLoading: authLoading, error: authError, clearError } = useAuthStore()
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
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <div className="absolute top-0 left-0 right-0 h-[300px] oasis-gradient opacity-[0.03] -z-10" style={{ borderRadius: '0 0 50% 50% / 0 0 100% 100%' }} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-8 relative">
           <div className="absolute -inset-4 bg-[#E8F5EE] rounded-full blur-2xl opacity-50 animate-pulse" />
           <OasisLogo size="lg" />
        </div>

        {/* Login Form */}
        <div className="w-full max-w-sm space-y-8 float-up">
          <div className="text-center space-y-2">
            <h1 className="font-nunito font-black text-3xl text-[#4A4A4A]">Bienvenido a Oasis</h1>
            <p className="font-inter text-[#8A8A8A] text-sm italic">"Tu base de salud"</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="font-inter font-bold text-[11px] text-[#8A8A8A] uppercase tracking-wider ml-2">Correo electrónico</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A8A]">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError() }}
                  placeholder="ejemplo@oasis.ni"
                  className="w-full h-14 border-2 border-[#F0F0F0] bg-[#FAFAFA] pl-12 pr-4 font-inter text-sm text-[#4A4A4A] rounded-[22px] focus:border-[#0E8C5E] focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-inter font-bold text-[11px] text-[#8A8A8A] uppercase tracking-wider ml-2">Contraseña</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A8A]">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError() }}
                  placeholder="••••••••"
                  className="w-full h-14 border-2 border-[#F0F0F0] bg-[#FAFAFA] pl-12 pr-12 font-inter text-sm text-[#4A4A4A] rounded-[22px] focus:border-[#0E8C5E] focus:bg-white outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#4A4A4A]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="bg-[#FFF3E0] border border-[#F4A261]/20 text-[#F4A261] px-4 py-3 rounded-[20px] text-xs font-inter flex items-center gap-2">
                <Info size={14} /> {authError}
              </div>
            )}

            <OasisButton fullWidth size="lg" disabled={authLoading}>
              {authLoading ? <DropLoader size={24} color="#FFF" /> : <>Entrar <ArrowRight size={18} className="ml-2" /></>}
            </OasisButton>
          </form>

          <div className="space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#F0F0F0]" /></div>
              <span className="relative px-4 bg-white text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest">Acceso Rápido Demo</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'patient', label: 'Soy Paciente', icon: Heart, bg: '#E8F5EE', color: '#0E8C5E' },
                { id: 'doctor', label: 'Soy Doctor', icon: Stethoscope, bg: '#E0F2FE', color: '#0077B6' },
                { id: 'pharmacy_admin', label: 'Soy Farmacia', icon: Pill, bg: '#FFF3E0', color: '#F4A261' },
                { id: 'delivery_person', label: 'Soy Repartidor', icon: Truck, bg: '#F5F5F5', color: '#4A4A4A' },
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleDemoLogin(role.id as AppRole)}
                  disabled={demoLoading !== null}
                  className="flex items-center gap-3 p-3 bg-white border-2 border-[#F0F0F0] rounded-[24px] hover:border-[#0E8C5E] hover:shadow-xl transition-all group"
                >
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: role.bg }}>
                    {demoLoading === role.id ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" style={{ color: role.color }} /> : <role.icon size={20} style={{ color: role.color }} />}
                  </div>
                  <span className="font-nunito font-bold text-xs text-[#4A4A4A] group-hover:text-[#0E8C5E]">{role.label}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center gap-6">
              <ConnectionCheck />
              
              <p className="font-inter text-sm text-[#8A8A8A]">
                ¿No tienes cuenta?{' '}
                <button onClick={() => navigate('register')} className="text-[#0E8C5E] font-bold hover:underline">Regístrate</button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-6 text-center">
        <p className="font-inter text-[10px] text-[#B0B0B0] uppercase tracking-widest">
          OASIS HEALTH TECHNOLOGIES &middot; NICARAGUA
        </p>
      </footer>
    </div>
  )
}
