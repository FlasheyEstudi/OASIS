'use client'

import React, { useState, useEffect } from 'react'
import { useNavigation, isPlatformView } from '@/components/oasis/navigation-store'
import { useAuthStore, getDefaultView } from '@/lib/auth-store'
import AuthProvider from '@/components/oasis/auth/AuthProvider'

// Landing & Auth
import LandingPage from '@/components/oasis/landing/LandingPage'
import RegisterPage from '@/components/oasis/landing/RegisterPage'
import LoginPage, { OasisSplashScreen } from '@/components/oasis/landing/LoginPage'

// Platform Layout
import PlatformSidebar from '@/components/oasis/platform/PlatformSidebar'

// Platform Screens (Clinic Admin)
import Dashboard from '@/components/oasis/platform/Dashboard'
import Patients from '@/components/oasis/platform/Patients'
import Doctors from '@/components/oasis/platform/Doctors'
import Appointments from '@/components/oasis/platform/Appointments'
import Prescriptions from '@/components/oasis/platform/Prescriptions'
import MedicalHistory from '@/components/oasis/platform/MedicalHistory'
import Teleconsultation from '@/components/oasis/platform/Teleconsultation'
import Reports from '@/components/oasis/platform/Reports'
import Audit from '@/components/oasis/platform/Audit'
import Branches from '@/components/oasis/platform/Branches'
import Services from '@/components/oasis/platform/Services'
import Receptionists from '@/components/oasis/platform/Receptionists'

// SuperAdmin Screens
import SuperAdminDashboard from '@/components/oasis/superadmin/SuperAdminDashboard'
import SuperAdminClinics from '@/components/oasis/superadmin/SuperAdminClinics'
import SuperAdminPharmacies from '@/components/oasis/superadmin/SuperAdminPharmacies'
import SuperAdminUsers from '@/components/oasis/superadmin/SuperAdminUsers'
import SuperAdminAudit from '@/components/oasis/superadmin/SuperAdminAudit'

// Receptionist Screens
import ReceptionistAgenda from '@/components/oasis/receptionist/ReceptionistAgenda'
import ReceptionistCheckin from '@/components/oasis/receptionist/ReceptionistCheckin'
import ReceptionistPayments from '@/components/oasis/receptionist/ReceptionistPayments'
import ReceptionistAssign from '@/components/oasis/receptionist/ReceptionistAssign'

// Doctor Screens
import DoctorDashboard from '@/components/oasis/doctor/DoctorDashboard'
import DoctorPatients from '@/components/oasis/doctor/DoctorPatients'
import DoctorAppointments from '@/components/oasis/doctor/DoctorAppointments'
import DoctorPrescriptions from '@/components/oasis/doctor/DoctorPrescriptions'
import DoctorTeleconsult from '@/components/oasis/doctor/DoctorTeleconsult'
import DoctorChat from '@/components/oasis/doctor/DoctorChat'
import DoctorSchedule from '@/components/oasis/doctor/DoctorSchedule'
import DoctorInteractions from '@/components/oasis/doctor/DoctorInteractions'

// Pharmacy Screens
import Inventory from '@/components/oasis/pharmacy/Inventory'
import POS from '@/components/oasis/pharmacy/POS'
import PharmacyDashboard from '@/components/oasis/pharmacy/PharmacyDashboard'
import PharmacyOrders from '@/components/oasis/pharmacy/Orders'
import Delivery from '@/components/oasis/pharmacy/Delivery'
import Returns from '@/components/oasis/pharmacy/Returns'
import Providers from '@/components/oasis/pharmacy/Providers'
import Promotions from '@/components/oasis/pharmacy/Promotions'
import PurchaseOrders from '@/components/oasis/pharmacy/PurchaseOrders'
import PharmacyReports from '@/components/oasis/pharmacy/PharmacyReports'
import PharmacyStaff from '@/components/oasis/pharmacy/PharmacyStaff'

// Patient Screens
import PatientFeed from '@/components/oasis/patient/PatientFeed'
import PatientSearch from '@/components/oasis/patient/PatientSearch'
import PatientOrders from '@/components/oasis/patient/PatientOrders'
import PatientProfile from '@/components/oasis/patient/PatientProfile'
import PatientFamily from '@/components/oasis/patient/PatientFamily'
import PatientHistory from '@/components/oasis/patient/PatientHistory'
import PatientPrescriptions from '@/components/oasis/patient/PatientPrescriptions'
import PatientChat from '@/components/oasis/patient/PatientChat'
import PatientInsurance from '@/components/oasis/patient/PatientInsurance'
import PatientEmergency from '@/components/oasis/patient/PatientEmergency'
import PatientAppointments from '@/components/oasis/patient/PatientAppointments'
import PatientReminders from '@/components/oasis/patient/PatientReminders'
import PatientReviews from '@/components/oasis/patient/PatientReviews'
import PatientLoyalty from '@/components/oasis/patient/PatientLoyalty'
import PatientNearby from '@/components/oasis/patient/PatientNearby'

// Driver Screens
import DriverMain from '@/components/oasis/driver/DriverMain'
import DriverEarnings from '@/components/oasis/driver/DriverEarnings'
import DriverProfile from '@/components/oasis/driver/DriverProfile'

// Resolve which component to render for a given view
function resolveView(view: string): React.ReactNode {
  switch (view) {
    // ─── SuperAdmin ─────────────────────
    case 'superadmin-dashboard': return <SuperAdminDashboard />
    case 'superadmin-clinics': return <SuperAdminClinics />
    case 'superadmin-pharmacies': return <SuperAdminPharmacies />
    case 'superadmin-users': return <SuperAdminUsers />
    case 'superadmin-audit': return <SuperAdminAudit />

    // ─── Clinic Admin ───────────────────
    case 'platform-dashboard': return <Dashboard />
    case 'platform-patients': return <Patients />
    case 'platform-doctors': return <Doctors />
    case 'platform-appointments': return <Appointments />
    case 'platform-prescriptions': return <Prescriptions />
    case 'platform-medical-history': return <MedicalHistory />
    case 'platform-teleconsultation': return <Teleconsultation />
    case 'platform-services': return <Services />
    case 'platform-receptionists': return <Receptionists />
    case 'platform-reports': return <Reports />
    case 'platform-audit': return <Audit />
    case 'platform-branches': return <Branches />

    // ─── Receptionist ───────────────────
    case 'receptionist-agenda': return <ReceptionistAgenda />
    case 'receptionist-checkin': return <ReceptionistCheckin />
    case 'receptionist-payments': return <ReceptionistPayments />
    case 'receptionist-assign': return <ReceptionistAssign />

    // ─── Doctor ─────────────────────────
    case 'doctor-dashboard': return <DoctorDashboard />
    case 'doctor-patients': return <DoctorPatients />
    case 'doctor-appointments': return <DoctorAppointments />
    case 'doctor-prescriptions': return <DoctorPrescriptions />
    case 'doctor-teleconsult': return <DoctorTeleconsult />
    case 'doctor-chat': return <DoctorChat />
    case 'doctor-schedule': return <DoctorSchedule />
    case 'doctor-interactions': return <DoctorInteractions />

    // ─── Pharmacy Admin ─────────────────
    case 'pharmacy-dashboard': return <PharmacyDashboard />
    case 'pharmacy-pos': return <POS />
    case 'pharmacy-inventory': return <Inventory />
    case 'pharmacy-orders': return <PharmacyOrders />
    case 'pharmacy-delivery': return <Delivery />
    case 'pharmacy-returns': return <Returns />
    case 'pharmacy-providers': return <Providers />
    case 'pharmacy-promotions': return <Promotions />
    case 'pharmacy-purchase-orders': return <PurchaseOrders />
    case 'pharmacy-reports': return <PharmacyReports />
    case 'pharmacy-staff': return <PharmacyStaff />

    // ─── Pharmacy Staff ─────────────────
    case 'staff-orders': return <POS />
    case 'staff-inventory': return <Inventory />
    case 'staff-returns': return <Returns />

    // ─── Patient ────────────────────────
    case 'patient-feed': return <PatientFeed />
    case 'patient-search': return <PatientSearch />
    case 'patient-orders': return <PatientOrders />
    case 'patient-profile': return <PatientProfile />
    case 'patient-family': return <PatientFamily />
    case 'patient-history': return <PatientHistory />
    case 'patient-prescriptions': return <PatientPrescriptions />
    case 'patient-chat': return <PatientChat />
    case 'patient-insurance': return <PatientInsurance />
    case 'patient-emergency': return <PatientEmergency />
    case 'patient-appointments': return <PatientAppointments />
    case 'patient-reminders': return <PatientReminders />
    case 'patient-reviews': return <PatientReviews />
    case 'patient-loyalty': return <PatientLoyalty />
    case 'patient-nearby': return <PatientNearby />

    // ─── Driver ─────────────────────────
    case 'driver-main': return <DriverMain />
    case 'driver-earnings': return <DriverEarnings />
    case 'driver-profile': return <DriverProfile />

    default: return <Dashboard />
  }
}

function AppContent() {
  const { currentView } = useNavigation()
  const { isAuthenticated, user } = useAuthStore()

  // Landing & Auth (always accessible)
  if (currentView === 'landing') return <LandingPage />
  if (currentView === 'login') return <LoginPage />
  if (currentView === 'register') return <RegisterPage />

  // Patient views (mobile layout, no sidebar)
  if (currentView.startsWith('patient-')) {
    return <>{resolveView(currentView)}</>
  }

  // Driver views (mobile layout, no sidebar)
  if (currentView.startsWith('driver-')) {
    return <>{resolveView(currentView)}</>
  }

  // All other views (superadmin, clinic_admin, receptionist, doctor, pharmacy_admin, pharmacy_staff)
  // go through the PlatformSidebar
  return (
    <PlatformSidebar>
      {resolveView(currentView)}
    </PlatformSidebar>
  )
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2600)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <OasisSplashScreen onComplete={() => setShowSplash(false)} />
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
