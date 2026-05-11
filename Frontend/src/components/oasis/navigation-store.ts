import { create } from 'zustand'
import { AppRole } from '@/lib/auth-store'

export type { AppRole }

// All views in the app
export type AppView = 
  | 'landing' 
  | 'login' 
  | 'register'
  // Superadmin
  | 'superadmin-dashboard'
  | 'superadmin-clinics'
  | 'superadmin-pharmacies'
  | 'superadmin-users'
  | 'superadmin-audit'
  // Clinic Admin
  | 'platform-dashboard'
  | 'platform-patients'
  | 'platform-doctors'
  | 'platform-appointments'
  | 'platform-prescriptions'
  | 'platform-medical-history'
  | 'platform-teleconsultation'
  | 'platform-reports'
  | 'platform-audit'
  | 'platform-branches'
  | 'platform-services'
  | 'platform-receptionists'
  // Receptionist (uses clinic sidebar)
  | 'receptionist-agenda'
  | 'receptionist-checkin'
  | 'receptionist-payments'
  | 'receptionist-assign'
  // Doctor (uses clinic sidebar)
  | 'doctor-dashboard'
  | 'doctor-patients'
  | 'doctor-appointments'
  | 'doctor-prescriptions'
  | 'doctor-teleconsult'
  | 'doctor-chat'
  | 'doctor-schedule'
  | 'doctor-interactions'
  // Pharmacy Admin
  | 'pharmacy-dashboard'
  | 'pharmacy-pos'
  | 'pharmacy-inventory'
  | 'pharmacy-orders'
  | 'pharmacy-delivery'
  | 'pharmacy-returns'
  | 'pharmacy-providers'
  | 'pharmacy-promotions'
  | 'pharmacy-purchase-orders'
  | 'pharmacy-reports'
  | 'pharmacy-staff'
  // Pharmacy Staff (uses pharmacy sidebar)
  | 'staff-orders'
  | 'staff-inventory'
  | 'staff-returns'
  // Patient
  | 'patient-feed'
  | 'patient-search'
  | 'patient-orders'
  | 'patient-profile'
  | 'patient-family'
  | 'patient-history'
  | 'patient-prescriptions'
  | 'patient-reminders'
  | 'patient-chat'
  | 'patient-reviews'
  | 'patient-loyalty'
  | 'patient-insurance'
  | 'patient-emergency'
  | 'patient-appointments'
  | 'patient-nearby'
  // Driver
  | 'driver-main'
  | 'driver-earnings'
  | 'driver-profile'

interface NavigationState {
  currentView: AppView
  navigate: (view: AppView) => void
  role: AppRole
  setRole: (role: AppRole) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

// Determine the sidebar type for a given role
export function getSidebarType(role: AppRole): 'superadmin' | 'clinic' | 'pharmacy' | 'patient' | 'driver' | null {
  if (role === 'superadmin') return 'superadmin'
  if (role === 'clinic_admin' || role === 'receptionist' || role === 'doctor') return 'clinic'
  if (role === 'pharmacy_admin' || role === 'pharmacy_staff') return 'pharmacy'
  if (role === 'patient') return 'patient'
  if (role === 'delivery_person') return 'driver'
  return null
}

// Determine role from view
function getRoleFromView(view: AppView): AppRole {
  if (view.startsWith('superadmin-')) return 'superadmin'
  if (view.startsWith('platform-')) return 'clinic_admin'
  if (view.startsWith('receptionist-')) return 'receptionist'
  if (view.startsWith('doctor-')) return 'doctor'
  if (view.startsWith('patient-')) return 'patient'
  if (view.startsWith('pharmacy-')) return 'pharmacy_admin'
  if (view.startsWith('staff-')) return 'pharmacy_staff'
  if (view.startsWith('driver-')) return 'delivery_person'
  return 'patient'
}

// Check if a view should be rendered inside the platform sidebar
export function isPlatformView(view: AppView): boolean {
  const sidebarType = getSidebarType(getRoleFromView(view))
  return sidebarType === 'superadmin' || sidebarType === 'clinic' || sidebarType === 'pharmacy'
}

export const useNavigation = create<NavigationState>((set, get) => ({
  currentView: 'landing',
  navigate: (view) => {
    const role = getRoleFromView(view)
    set({ currentView: view, role, sidebarOpen: false, mobileMenuOpen: false })
  },
  role: 'patient',
  setRole: (role) => set({ role }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}))
