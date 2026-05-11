'use client'

import {
  LayoutDashboard, Users, Stethoscope, Calendar, FileText, Clock,
  BarChart3, Shield, MapPin, LogOut, Menu, Bell,
  ChevronLeft, ChevronRight, Package, ShoppingBag, Truck,
  RotateCcw, Percent, Building2, UserCog,
  MessageCircle, Activity, Heart, Pill, Globe,
  ClipboardCheck, DollarSign, ArrowRightLeft, AlertTriangle,
  UserPlus, Clock4, Video, Wifi, Search, X, Loader2
} from 'lucide-react'
import { OasisLogo, OasisButton } from '../shared/shared-components'
import { useNavigation, AppRole, getSidebarType } from '../navigation-store'
import { useAuthStore } from '@/lib/auth-store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api-client'
import { NotificationsTray } from './NotificationsTray'

type NavItem = { id: string; label: string; icon: any }

// ... (previous items unchanged)
const superadminItems: NavItem[] = [
  { id: 'superadmin-dashboard', label: 'Dashboard Global', icon: LayoutDashboard },
  { id: 'superadmin-clinics', label: 'Clínicas', icon: Building2 },
  { id: 'superadmin-pharmacies', label: 'Farmacias', icon: Pill },
  { id: 'superadmin-users', label: 'Usuarios', icon: Users },
  { id: 'superadmin-audit', label: 'Auditoría', icon: Shield },
]

const clinicAdminItems: NavItem[] = [
  { id: 'platform-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'platform-patients', label: 'Pacientes', icon: Users },
  { id: 'platform-doctors', label: 'Doctores', icon: Stethoscope },
  { id: 'platform-appointments', label: 'Citas', icon: Calendar },
  { id: 'platform-prescriptions', label: 'Recetas', icon: FileText },
  { id: 'platform-medical-history', label: 'Historial Médico', icon: Clock },
  { id: 'platform-teleconsultation', label: 'Teleconsulta', icon: MessageCircle },
  { id: 'platform-services', label: 'Servicios', icon: Activity },
  { id: 'platform-receptionists', label: 'Recepcionistas', icon: UserPlus },
  { id: 'platform-reports', label: 'Reportes', icon: BarChart3 },
  { id: 'platform-audit', label: 'Auditoría', icon: Shield },
  { id: 'platform-branches', label: 'Sucursales', icon: Building2 },
]

const receptionistItems: NavItem[] = [
  { id: 'receptionist-agenda', label: 'Agenda del Día', icon: Calendar },
  { id: 'receptionist-checkin', label: 'Check-in', icon: ClipboardCheck },
  { id: 'receptionist-payments', label: 'Cobros', icon: DollarSign },
  { id: 'receptionist-assign', label: 'Reasignar Doctor', icon: ArrowRightLeft },
  { id: 'platform-appointments', label: 'Todas las Citas', icon: Calendar },
  { id: 'platform-patients', label: 'Pacientes', icon: Users },
]

const doctorItems: NavItem[] = [
  { id: 'doctor-dashboard', label: 'Panel Médico', icon: LayoutDashboard },
  { id: 'doctor-patients', label: 'Mis Pacientes', icon: Users },
  { id: 'doctor-appointments', label: 'Mis Citas', icon: Calendar },
  { id: 'doctor-prescriptions', label: 'Recetas', icon: FileText },
  { id: 'doctor-teleconsult', label: 'Teleconsulta', icon: Video },
  { id: 'doctor-chat', label: 'Chat', icon: MessageCircle },
  { id: 'doctor-schedule', label: 'Mi Horario', icon: Clock4 },
  { id: 'doctor-interactions', label: 'Interacciones', icon: AlertTriangle },
]

const pharmacyAdminItems: NavItem[] = [
  { id: 'pharmacy-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pharmacy-pos', label: 'Punto de Venta', icon: ShoppingBag },
  { id: 'pharmacy-inventory', label: 'Inventario', icon: Package },
  { id: 'pharmacy-orders', label: 'Pedidos', icon: FileText },
  { id: 'pharmacy-delivery', label: 'Delivery', icon: Truck },
  { id: 'pharmacy-returns', label: 'Devoluciones', icon: RotateCcw },
  { id: 'pharmacy-providers', label: 'Proveedores', icon: UserCog },
  { id: 'pharmacy-promotions', label: 'Promociones', icon: Percent },
  { id: 'pharmacy-purchase-orders', label: 'Órdenes de Compra', icon: Package },
  { id: 'pharmacy-reports', label: 'Reportes', icon: BarChart3 },
  { id: 'pharmacy-staff', label: 'Personal', icon: Users },
]

const pharmacyStaffItems: NavItem[] = [
  { id: 'staff-orders', label: 'Procesar Órdenes', icon: ShoppingBag },
  { id: 'staff-inventory', label: 'Inventario', icon: Package },
  { id: 'staff-returns', label: 'Devoluciones', icon: RotateCcw },
]

function getMenuItems(role: AppRole): NavItem[] {
  switch (role) {
    case 'superadmin': return superadminItems
    case 'clinic_admin': return clinicAdminItems
    case 'receptionist': return receptionistItems
    case 'doctor': return doctorItems
    case 'pharmacy_admin': return pharmacyAdminItems
    case 'pharmacy_staff': return pharmacyStaffItems
    default: return clinicAdminItems
  }
}

function getSectionLabel(sidebarType: string): string {
  switch (sidebarType) {
    case 'superadmin': return 'Super Admin'
    case 'clinic': return 'Clínica'
    case 'pharmacy': return 'Farmacia'
    default: return 'OASIS'
  }
}

function getRoleDisplay(role: AppRole): { title: string; initials: string; bgColor: string } {
  const displays: Record<AppRole, { title: string; initials: string; bgColor: string }> = {
    superadmin: { title: 'Super Admin', initials: 'SA', bgColor: '#4A4A4A' },
    clinic_admin: { title: 'Admin Clínica', initials: 'AC', bgColor: '#0E8C5E' },
    receptionist: { title: 'Recepcionista', initials: 'RP', bgColor: '#0077B6' },
    doctor: { title: 'Doctor', initials: 'DR', bgColor: '#0E8C5E' },
    patient: { title: 'Paciente', initials: 'PT', bgColor: '#0E8C5E' },
    pharmacy_admin: { title: 'Admin Farmacia', initials: 'AF', bgColor: '#0077B6' },
    pharmacy_staff: { title: 'Staff Farmacia', initials: 'SF', bgColor: '#0077B6' },
    delivery_person: { title: 'Repartidor', initials: 'RP', bgColor: '#F4A261' },
  }
  return displays[role]
}

function NavItem({ item, currentView, navigate, onItemClick, collapsed }: {
  item: NavItem
  currentView: string
  navigate: (view: any) => void
  onItemClick?: () => void
  collapsed?: boolean
}) {
  const isActive = currentView === item.id
  const Icon = item.icon
  return (
    <button
      onClick={() => { navigate(item.id); onItemClick?.() }}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] font-inter text-sm transition-all duration-200 group relative ${
        isActive
          ? 'bg-[#E8F5EE] text-[#0E8C5E] font-semibold'
          : 'text-[#4A4A4A] hover:bg-[#E8F5EE]/50 hover:text-[#0E8C5E]'
      } ${collapsed ? 'justify-center px-0' : ''}`}
      title={collapsed ? item.label : undefined}
    >
      {isActive && !collapsed && (
        <div className="absolute left-0 w-1.5 h-5 rounded-r-full bg-[#0E8C5E]" />
      )}
      <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-[#0E8C5E]' : 'text-[#8A8A8A] group-hover:text-[#0E8C5E]'}`} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </button>
  )
}

export function SidebarContent({ currentView, navigate, onItemClick, collapsed, role }: {
  currentView: string
  navigate: (view: any) => void
  onItemClick?: () => void
  collapsed?: boolean
  role: AppRole
}) {
  const { user, logout } = useAuthStore()
  const [globalSearch, setGlobalSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const items = getMenuItems(role)
  const sidebarType = getSidebarType(role) || 'clinic'
  const display = getRoleDisplay(role)
  const userName = user?.name || 'Usuario'
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || display.initials

  useEffect(() => {
    // Initial notifications check
    checkNotifications()
    const interval = setInterval(checkNotifications, 30000) // Polling for demo
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (globalSearch.length > 1) {
      const timer = setTimeout(performSearch, 300)
      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
    }
  }, [globalSearch])

  async function checkNotifications() {
    const res = await api.get('/notifications', { unread: true })
    if (res.success && res.data) setUnreadCount(res.data.unreadCount)
  }

  async function performSearch() {
    setSearching(true)
    const res = await api.get('/search', { q: globalSearch })
    if (res.success && res.data) setSearchResults(res.data.results)
    setSearching(false)
  }

  const handleLogout = () => {
    logout()
    navigate('login')
  }

  return (
    <div className="flex flex-col h-full py-4">
      {/* Header with Search and Bell */}
      <div className={`mb-4 ${collapsed ? 'px-2 flex flex-col items-center gap-4' : 'px-4'}`}>
        <div className="flex items-center justify-between mb-4">
          {!collapsed && <OasisLogo size="sm" />}
          {collapsed && (
             <div className="w-10 h-10 rounded-full oasis-gradient flex items-center justify-center">
                <Heart size={18} className="text-white" />
             </div>
          )}
          
          <button className="relative p-2 rounded-full hover:bg-[#E8F5EE] transition-colors group">
            <Bell size={20} className="text-[#4A4A4A] group-hover:text-[#0E8C5E]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#EF4444] border-2 border-white" />
            )}
          </button>
        </div>

        {/* Global Search Bar */}
        {!collapsed && (
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-[#FAFAFA] border-2 border-[#E0E0E0] rounded-xl px-4 py-2 pl-10 text-xs font-inter focus:border-[#0E8C5E] focus:outline-none transition-all"
            />
            {searching && <Loader2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#0E8C5E]" />}
            
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-xl shadow-xl border border-[#E0E0E0] overflow-hidden">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => { navigate(res.view); setGlobalSearch(''); setSearchResults([]) }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-[#E8F5EE] transition-colors border-b border-[#FAFAFA] last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FAFAFA] flex items-center justify-center">
                      {res.type === 'patient' ? <Users size={14} className="text-[#0E8C5E]" /> : <Pill size={14} className="text-[#0077B6]" />}
                    </div>
                    <div className="text-left">
                      <p className="font-inter font-semibold text-xs text-[#4A4A4A]">{res.title}</p>
                      <p className="font-inter text-[10px] text-[#8A8A8A]">{res.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section Label */}
      {!collapsed && (
        <div className="px-4 mb-2">
          <span className="text-[10px] font-inter font-semibold text-[#8A8A8A] uppercase tracking-wider px-3">
            {getSectionLabel(sidebarType)}
          </span>
        </div>
      )}

      {/* Nav Items */}
      <nav className={`flex-1 px-3 space-y-0.5 overflow-y-auto oasis-scroll ${collapsed ? 'px-2' : ''}`}>
        {items.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            currentView={currentView}
            navigate={navigate}
            onItemClick={onItemClick}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* User */}
      <div className={`mt-auto px-3 pt-4 border-t border-[#E0E0E0] ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'flex-col p-0 gap-1' : ''}`}>
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarFallback
              className="font-nunito font-bold text-xs text-white"
              style={{ backgroundColor: display.bgColor }}
            >
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="font-inter font-semibold text-sm text-[#4A4A4A] truncate">{userName}</div>
                <div className="font-inter text-xs text-[#8A8A8A]">{display.title}</div>
              </div>
              <button onClick={handleLogout} className="text-[#8A8A8A] hover:text-[#F4A261] transition-colors" title="Cerrar sesión">
                <LogOut size={16} />
              </button>
            </>
          )}
          {collapsed && (
            <button onClick={handleLogout} className="text-[#8A8A8A] hover:text-[#F4A261] transition-colors" title="Cerrar sesión">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PlatformSidebar({ children }: { children: React.ReactNode }) {
  const { navigate, currentView, role } = useNavigation()
  const { user, logout } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)

  const items = getMenuItems(role)
  const sidebarWidth = sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAFA]">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:block ${sidebarWidth} bg-white border-r border-[#E0E0E0] h-screen sticky top-0 transition-all duration-300 ease-in-out overflow-hidden relative`}>
        <SidebarContent
          currentView={currentView}
          navigate={navigate}
          collapsed={sidebarCollapsed}
          role={role}
        />
        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute top-5 -right-3 w-6 h-6 bg-white border border-[#E0E0E0] rounded-full flex items-center justify-center shadow-sm hover:bg-[#E8F5EE] hover:border-[#0E8C5E] transition-all z-10"
          title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {sidebarCollapsed ? <ChevronRight size={12} className="text-[#0E8C5E]" /> : <ChevronLeft size={12} className="text-[#0E8C5E]" />}
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-[#E0E0E0] px-4 h-14 flex items-center justify-between">
        <OasisLogo size="sm" />
        <div className="flex items-center gap-3">
          <button 
            className="relative"
            onClick={() => setShowNotifications(true)}
          >
            <Bell size={20} className="text-[#4A4A4A]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#EF4444]" />
          </button>
          
          <NotificationsTray open={showNotifications} onOpenChange={setShowNotifications} />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button><Menu size={22} className="text-[#4A4A4A]" /></button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px] p-0 bg-white">
              <SheetHeader className="sr-only">
                <SheetTitle>Menú de Navegación</SheetTitle>
                <SheetDescription>Accede a todas las secciones de la plataforma</SheetDescription>
              </SheetHeader>
              <SidebarContent
                currentView={currentView}
                navigate={navigate}
                onItemClick={() => setMobileOpen(false)}
                role={role}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:p-6 overflow-y-auto">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0E0E0] h-16 flex items-center justify-around px-2 z-40">
        {items.slice(0, 5).map((item) => {
          const isActive = currentView === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id as any)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-[12px] transition-all ${
                isActive ? 'text-[#0E8C5E]' : 'text-[#8A8A8A]'
              }`}
            >
              <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                {isActive && (
                  <div className="absolute -inset-1.5 bg-[#E8F5EE] rounded-full" />
                )}
                <Icon size={18} className="relative z-10" />
              </div>
              <span className="text-[9px] font-inter font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
