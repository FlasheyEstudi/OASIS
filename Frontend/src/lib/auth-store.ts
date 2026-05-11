import { create } from 'zustand'
import { api, setTokens, clearTokens, setUser as setUserSync, getStoredUser, getAccessToken } from './api-client'

export type AppRole = 'superadmin' | 'clinic_admin' | 'receptionist' | 'doctor' | 'patient' | 'pharmacy_admin' | 'pharmacy_staff' | 'delivery_person'

export interface AuthUser {
  id: string
  email: string
  name: string
  phone?: string
  role: AppRole
  avatarUrl?: string | null
  isActive: boolean
  emailVerified: boolean
}

export interface RoleProfile {
  clinicId?: string
  specialty?: string
  licenseNumber?: string
  consultationFee?: number
  rating?: number
  loyaltyPoints?: number
  loyaltyLevel?: string
  bloodType?: string
  pharmacyId?: string
  staffRole?: string
  vehicleType?: string
  isVerified?: boolean
  isAvailable?: boolean
  access?: string
}

// Demo user data for offline mode (when API is not available)
const DEMO_USERS: Record<string, { user: AuthUser; roleProfile: RoleProfile }> = {
  'superadmin@oasis.nii': {
    user: { id: 'demo-sa', email: 'superadmin@oasis.nii', name: 'Admin Oasis', role: 'superadmin', isActive: true, emailVerified: true },
    roleProfile: { access: 'full' }
  },
  'admin@clinicademo.nii': {
    user: { id: 'demo-ca', email: 'admin@clinicademo.nii', name: 'Admin Clínica Demo', role: 'clinic_admin', isActive: true, emailVerified: true },
    roleProfile: { clinicId: 'demo-clinic-1' }
  },
  'recepcion@clinicademo.nii': {
    user: { id: 'demo-rp', email: 'recepcion@clinicademo.nii', name: 'Ana Reyes (Demo)', role: 'receptionist', isActive: true, emailVerified: true },
    roleProfile: { clinicId: 'demo-clinic-1' }
  },
  'carlos@oasis.ni': {
    user: { id: 'demo-dr', email: 'carlos@oasis.ni', name: 'Dr. Carlos López', role: 'doctor', isActive: true, emailVerified: true },
    roleProfile: { clinicId: 'demo-clinic-1', specialty: 'Medicina General', licenseNumber: 'DEMO-001', consultationFee: 800, rating: 4.8 }
  },
  'juan@oasis.ni': {
    user: { id: 'demo-pt', email: 'juan@oasis.ni', name: 'Juan Pérez', role: 'patient', isActive: true, emailVerified: true },
    roleProfile: { loyaltyPoints: 1500, loyaltyLevel: 'plata', bloodType: 'O+' }
  },
  'admin@farmaciaoasis.ni': {
    user: { id: 'demo-pa', email: 'admin@farmaciaoasis.ni', name: 'Admin Farmacia Demo', role: 'pharmacy_admin', isActive: true, emailVerified: true },
    roleProfile: { pharmacyId: 'demo-pharmacy-1' }
  },
  'luis@oasis.ni': {
    user: { id: 'demo-dp', email: 'luis@oasis.ni', name: 'Luis Rojas', role: 'delivery_person', isActive: true, emailVerified: true },
    roleProfile: { vehicleType: 'moto', isVerified: true, isAvailable: true, rating: 4.7 }
  },
}

interface AuthState {
  user: AuthUser | null
  roleProfile: RoleProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isDemoMode: boolean

  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginDemo: (role: AppRole) => Promise<{ success: boolean }>
  logout: () => void
  initialize: () => Promise<void>
  clearError: () => void
  setUser: (user: AuthUser | null) => void
  setRoleProfile: (profile: any) => void
}

// Get the default view for each role
export function getDefaultView(role: AppRole): string {
  const viewMap: Record<AppRole, string> = {
    superadmin: 'superadmin-dashboard',
    clinic_admin: 'platform-dashboard',
    receptionist: 'receptionist-agenda',
    doctor: 'doctor-dashboard',
    patient: 'patient-feed',
    pharmacy_admin: 'pharmacy-pos',
    pharmacy_staff: 'staff-orders',
    delivery_person: 'driver-main',
  }
  return viewMap[role] || 'landing'
}

// Get demo email for a role
export function getDemoEmail(role: AppRole): string {
  const map: Record<AppRole, string> = {
    superadmin: 'superadmin@oasis.nii',
    clinic_admin: 'admin@clinicademo.nii',
    receptionist: 'recepcion@clinicademo.nii',
    doctor: 'carlos@oasis.ni',
    patient: 'juan@oasis.ni',
    pharmacy_admin: 'admin@farmaciaoasis.ni',
    pharmacy_staff: 'vendedor@farmaciacentral.nii',
    delivery_person: 'luis@oasis.ni',
  }
  return map[role]
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  roleProfile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isDemoMode: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const result = await api.post<{ user: AuthUser; roleProfile: RoleProfile; accessToken: string; refreshToken: string }>(
        '/auth/login',
        { email, password }
      )

      if (result.success && result.data) {
        const { user, roleProfile, accessToken, refreshToken } = result.data
        setTokens(accessToken, refreshToken)
        setUserSync(user)
        set({
          user,
          roleProfile,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isDemoMode: false,
        })
        return { success: true }
      } else {
        // API call failed - try demo mode
        const demoData = DEMO_USERS[email]
        if (demoData) {
          // Demo mode - login without API
          const fakeToken = `demo_${Date.now()}`
          setTokens(fakeToken, fakeToken)
          setUserSync(demoData.user)
          set({
            user: demoData.user,
            roleProfile: demoData.roleProfile,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isDemoMode: true,
          })
          return { success: true }
        }
        
        const errorMsg = (result as any).error || (result as any).message || 'Credenciales inválidas'
        set({ isLoading: false, error: errorMsg })
        return { success: false, error: errorMsg }
      }
    } catch (error: any) {
      // Network error - try demo mode
      const demoData = DEMO_USERS[email]
      if (demoData) {
        const fakeToken = `demo_${Date.now()}`
        setTokens(fakeToken, fakeToken)
        setUserSync(demoData.user)
        set({
          user: demoData.user,
          roleProfile: demoData.roleProfile,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isDemoMode: true,
        })
        return { success: true }
      }
      
      const errorMsg = error.message || 'Error de conexión'
      set({ isLoading: false, error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  loginDemo: async (role: AppRole) => {
    set({ isLoading: true, error: null })
    
    try {
      const result = await api.post<{ user: AuthUser; accessToken: string; refreshToken: string }>(
        '/auth/demo',
        { role }
      )

      if (result.success && result.data) {
        const { user, accessToken, refreshToken } = result.data
        setTokens(accessToken, refreshToken)
        setUserSync(user)
        set({ 
          user, 
          roleProfile: {}, // Will be fetched by components or in a separate call
          isAuthenticated: true, 
          isLoading: false, 
          error: null, 
          isDemoMode: true 
        })
        return { success: true }
      }
    } catch (error) {
      console.warn('Real demo login failed, trying fallback:', error)
    }

    // Demo mode fallback (offline)
    const email = getDemoEmail(role)
    const demoData = DEMO_USERS[email]
    if (!demoData) {
      set({ isLoading: false, error: 'No se pudo iniciar sesión demo' })
      return { success: false }
    }

    const fakeToken = `demo_${Date.now()}`
    setTokens(fakeToken, fakeToken)
    setUserSync(demoData.user)
    set({
      user: demoData.user,
      roleProfile: demoData.roleProfile,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      isDemoMode: true,
    })
    return { success: true }
  },

  logout: () => {
    clearTokens()
    set({
      user: null,
      roleProfile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isDemoMode: false,
    })
  },

  initialize: async () => {
    // Safety net: no matter what happens, clear loading within 5 seconds
    const safetyTimer = setTimeout(() => {
      const { isLoading } = useAuthStore.getState()
      if (isLoading) {
        console.warn('[Auth] initialize() timed out — forcing isLoading=false')
        set({ isLoading: false, isAuthenticated: false })
      }
    }, 5000)

    try {
      const token = getAccessToken()
      if (!token) {
        set({ isLoading: false, isAuthenticated: false })
        return
      }

      // Check if demo token
      if (token.startsWith('demo_')) {
        const storedUser = getStoredUser()
        if (storedUser) {
          const demoData = DEMO_USERS[storedUser.email]
          set({
            user: storedUser,
            roleProfile: demoData?.roleProfile || null,
            isAuthenticated: true,
            isLoading: false,
            isDemoMode: true,
          })
          return
        }
        clearTokens()
        set({ isLoading: false, isAuthenticated: false })
        return
      }

      // Try to get user from storage first for instant load
      const storedUser = getStoredUser()
      if (storedUser) {
        set({ user: storedUser, isAuthenticated: true, isLoading: false })
      }

      // Verify with API (api-client already has 8s timeout)
      try {
        const result = await api.get<{ user: AuthUser; roleProfile: any }>('/auth/me')
        if (result.success && result.data) {
          const { user, roleProfile } = result.data
          setUserSync(user)
          set({ user, roleProfile, isAuthenticated: true, isLoading: false, isDemoMode: false })
        } else {
          if (!storedUser) {
            clearTokens()
            set({ user: null, isAuthenticated: false, isLoading: false, isDemoMode: false })
          }
        }
      } catch {
        // Keep stored user if API fails (offline / mobile unreachable)
        if (!storedUser) {
          set({ user: null, isAuthenticated: false, isLoading: false })
        } else {
          set({ isLoading: false })
        }
      }
    } finally {
      clearTimeout(safetyTimer)
    }
  },

  clearError: () => set({ error: null }),
  setUser: (user) => {
    if (user) {
      // Sync with localStorage through api-client
      setUserSync(user)
    }
    set({ user })
  },

  setRoleProfile: (roleProfile) => set({ roleProfile })
}))
