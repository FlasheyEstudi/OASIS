# OASIS Frontend Implementation Plan

## Contexto
- **Backend**: Ya construido, API REST con 142 endpoints en `/api`
- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **NO tocar backend** - Solo consumir la API existente

---

## FASE 1: Infraestructura Frontend (API Client + Auth)

### 1.1 API Client (`src/lib/api-client.ts`)
- Fetch wrapper con base URL `/api`
- Interceptor: adjuntar `Authorization: Bearer <accessToken>` en cada request
- Interceptor: si 401, intentar refresh automático y reintentar
- Manejo de errores tipado: `{ success, data, error, message, details }`
- Soporte para respuestas paginadas

### 1.2 Auth Store (`src/lib/auth-store.ts`)
- Zustand store con: user, role, roleProfile, accessToken, refreshToken
- `login(email, password)` → POST /api/auth/login → guardar tokens + user
- `logout()` → limpiar todo, redirigir a /login
- `refreshTokens()` → POST /api/auth/refresh → rotar tokens
- `getMe()` → GET /api/auth/me → sincronizar perfil
- Persistencia en cookies (httpOnly no posible desde client, usar localStorage como fallback)

### 1.3 Auth Provider (`src/components/oasis/auth/AuthProvider.tsx`)
- Componente que envuelve la app
- Al cargar: verificar si hay token guardado → GET /api/auth/me
- Si token expirado → intentar refresh
- Si refresh falla → limpiar y mostrar login

---

## FASE 2: Hooks TanStack Query por Módulo

### 2.1 Auth Hooks (`src/lib/hooks/use-auth.ts`)
- `useLogin()` - mutation POST /api/auth/login
- `useRegister()` - mutation POST /api/auth/register
- `useMe()` - query GET /api/auth/me
- `useForgotPassword()` - mutation POST /api/auth/forgot-password
- `useResetPassword()` - mutation POST /api/auth/reset-password

### 2.2 Clinic Hooks (`src/lib/hooks/use-clinics.ts`)
- `useClinics(filters)` - query GET /api/clinics
- `useClinic(id)` - query GET /api/clinics/{id}
- `useCreateClinic()` - mutation POST /api/clinics
- `useUpdateClinic()` - mutation PUT /api/clinics/{id}
- `useClinicDoctors(id)` - query GET /api/clinics/{id}/doctors
- `useClinicBranches(id)` - query GET /api/clinics/{id}/branches
- `useClinicServices(id)` - query GET /api/clinics/{id}/services
- `useClinicRevenue(id)` - query GET /api/clinics/{id}/reports/revenue
- `useClinicAuditLogs(id)` - query GET /api/clinics/{id}/audit-logs

### 2.3 Doctor Hooks (`src/lib/hooks/use-doctors.ts`)
- `useDoctors(filters)` - query GET /api/doctors (público)
- `useDoctor(id)` - query GET /api/doctors/{id}
- `useUpdateDoctor()` - mutation PUT /api/doctors/{id}
- `useDoctorPatients(id)` - query GET /api/doctors/{id}/patients
- `useDoctorSchedule(id)` - query GET /api/doctors/{id}/schedule
- `useUpdateDoctorSchedule()` - mutation PUT /api/doctors/{id}/schedule
- `useDoctorAppointments(id)` - query GET /api/doctors/{id}/appointments

### 2.4 Patient Hooks (`src/lib/hooks/use-patients.ts`)
- `usePatients(filters)` - query GET /api/patients
- `usePatient(id)` - query GET /api/patients/{id}
- `useUpdatePatient()` - mutation PUT /api/patients/{id}
- `usePatientHistory(id)` - query GET /api/patients/{id}/history

### 2.5 Patient App Hooks (`src/lib/hooks/use-patient-app.ts`)
- `usePatientFamilyMembers()` - query GET /api/patient/family-members
- `useAddFamilyMember()` - mutation POST /api/patient/family-members
- `useSearchMedications(query, lat, lng)` - query GET /api/patient/search-medications
- `useNearbyPharmacies(lat, lng)` - query GET /api/patient/nearby-pharmacies
- `useNearbyClinics(lat, lng)` - query GET /api/patient/nearby-clinics
- `usePatientPrescriptions()` - query GET /api/patient/prescriptions
- `useRequestRefill()` - mutation POST /api/patient/prescriptions/{id}/request-refill
- `usePatientAppointments()` - query GET /api/patient/appointments
- `useBookAppointment()` - mutation POST /api/patient/appointments
- `usePatientLoyalty()` - query GET /api/patient/loyalty
- `usePatientInsurances()` - query GET /api/patient/insurances
- `usePatientEmergencyContacts()` - query GET /api/patient/emergency-contacts

### 2.6 Receptionist Hooks (`src/lib/hooks/use-receptionist.ts`)
- `useReceptionistAppointments(filters)` - query GET /api/receptionist/appointments
- `useCreateAppointment()` - mutation POST /api/receptionist/appointments
- `useConfirmAppointment()` - mutation PUT /api/receptionist/appointments/{id}/confirm
- `useCheckinAppointment()` - mutation POST /api/receptionist/appointments/{id}/checkin
- `useCollectPayment()` - mutation POST /api/receptionist/payments/collect
- `useAssignDoctor()` - mutation POST /api/receptionist/assign-doctor

### 2.7 Prescription Hooks (`src/lib/hooks/use-prescriptions.ts`)
- `usePrescriptions(filters)` - query GET /api/doctor/prescriptions
- `usePrescription(id)` - query GET /api/doctor/prescriptions/{id}
- `useCreatePrescription()` - mutation POST /api/doctor/prescriptions
- `useUpdatePrescription()` - mutation PUT /api/doctor/prescriptions/{id}
- `useSignPrescription()` - mutation POST /api/doctor/prescriptions/{id}/sign
- `useVerifyPrescription(code)` - query GET /api/prescriptions/{id}/verify
- `useCheckInteractions()` - mutation POST /api/clinical-check/interactions

### 2.8 Pharmacy Hooks (`src/lib/hooks/use-pharmacy.ts`)
- `usePharmacy(id)` - query GET /api/pharmacies/{id}
- `usePharmacyInventory(pharmacyId)` - query GET /api/pharmacies/{id}/inventory
- `useAddInventoryBatch()` - mutation POST /api/pharmacy/inventory
- `usePharmacyPurchaseOrders()` - query GET /api/pharmacy/purchase-orders
- `useCreatePurchaseOrder()` - mutation POST /api/pharmacy/purchase-orders
- `usePharmacySalesReport(pharmacyId)` - query GET /api/pharmacies/{id}/reports/sales
- `usePharmacyPromotions(pharmacyId)` - query GET /api/pharmacies/{id}/promotions
- `useCreatePromotion()` - mutation POST /api/pharmacies/{id}/promotions

### 2.9 Order Hooks (`src/lib/hooks/use-orders.ts`)
- `useCreateOrder()` - mutation POST /api/orders
- `useOrder(id)` - query GET /api/orders/{id}
- `useMyOrders()` - query GET /api/orders/my-orders
- `useProcessOrder()` - mutation POST /api/orders/{id}/process
- `useCancelOrder()` - mutation POST /api/orders/{id}/cancel

### 2.10 Delivery Hooks (`src/lib/hooks/use-delivery.ts`)
- `useUpdateAvailability()` - mutation PUT /api/delivery/availability
- `useAvailableOrders()` - query GET /api/delivery/available-orders
- `useAcceptOrder()` - mutation POST /api/delivery/accept-order
- `useSubmitProof()` - mutation POST /api/delivery/order/{orderId}/proof
- `useDeliveryEarnings()` - query GET /api/delivery/earnings

### 2.11 Chat Hooks (`src/lib/hooks/use-chat.ts`)
- `useConversations()` - query GET /api/chat/conversations
- `useMessages(conversationId)` - query GET /api/chat/conversations/{id}/messages
- `useSendMessage()` - mutation POST /api/chat/conversations/{id}/messages

### 2.12 Notification Hooks (`src/lib/hooks/use-notifications.ts`)
- `useNotifications()` - query GET /api/notifications
- `useMarkNotificationRead()` - mutation PUT /api/notifications/{id}/read
- `useRegisterFcmToken()` - mutation POST /api/notifications/register-token

### 2.13 Review Hooks (`src/lib/hooks/use-reviews.ts`)
- `useReviews(targetType, targetId)` - query GET /api/reviews
- `useCreateReview()` - mutation POST /api/reviews

---

## FASE 3: Layouts por Rol (8 roles)

### 3.1 Superadmin Layout
- Sidebar: Dashboard, Clínicas, Farmacias, Usuarios, Auditoría, Configuración
- Vista principal: métricas globales, lista de clínicas/farmacias, gestión de usuarios

### 3.2 Clinic Admin Layout  
- Sidebar: Dashboard, Doctores, Recepcionistas, Pacientes, Servicios, Citas, Reportes, Sucursales, Auditoría
- Ya parcialmente implementado (platform-dashboard, etc.)

### 3.3 Receptionist Layout
- Sidebar: Agenda, Check-in, Cobros, Reasignar Doctor, Pacientes
- Vista principal: agenda del día con acciones rápidas

### 3.4 Doctor Layout
- Sidebar: Citas del Día, Mis Pacientes, Recetas, Teleconsulta, Chat, Horario, Verificar Interacciones
- Vista principal: lista de citas de hoy

### 3.5 Patient Layout (ya existe parcialmente)
- Bottom nav: Inicio, Buscar, Órdenes, Chat, Perfil
- Ya implementado, necesita conectarse al API

### 3.6 Pharmacy Admin Layout
- Sidebar: Dashboard, Inventario, Personal, Pedidos, Órdenes de Compra, Proveedores, Promociones, Devoluciones, Reportes Ventas, Delivery
- Ya parcialmente implementado

### 3.7 Pharmacy Staff Layout
- Sidebar: Inventario, Procesar Órdenes, Dispensar, Devoluciones
- Simplificado del pharmacy admin

### 3.8 Delivery Person Layout
- Bottom nav: Órdenes, Ganancias, Perfil
- Ya parcialmente implementado

---

## FASE 4: Páginas Nuevas Necesarias

### 4.1 Superadmin
- `SuperadminDashboard.tsx` - Métricas globales de todas las clínicas/farmacias
- `SuperadminClinics.tsx` - CRUD de clínicas
- `SuperadminPharmacies.tsx` - CRUD de farmacias  
- `SuperadminUsers.tsx` - Gestión de usuarios por rol
- `SuperadminAudit.tsx` - Auditoría global

### 4.2 Receptionist
- `ReceptionistAgenda.tsx` - Agenda del día con check-in, cobro, reasignar
- `ReceptionistCheckin.tsx` - Lista de pacientes por llegar
- `ReceptionistPayments.tsx` - Cobros y facturación
- `ReceptionistAssignDoctor.tsx` - Reasignar citas

### 4.3 Doctor
- `DoctorDashboard.tsx` - Citas del día, pacientes recientes
- `DoctorPatients.tsx` - Mis pacientes con historial
- `DoctorPrescriptions.tsx` - Crear/gestionar recetas con firma digital
- `DoctorTeleconsult.tsx` - Teleconsulta con Jitsi Meet iframe
- `DoctorChat.tsx` - Chat con pacientes
- `DoctorSchedule.tsx` - Gestión de horario
- `DoctorInteractions.tsx` - Verificar interacciones medicamentosas

### 4.4 Pharmacy Staff
- `StaffInventory.tsx` - Inventario simplificado
- `StaffOrders.tsx` - Procesar órdenes/dispensar
- `StaffReturns.tsx` - Devoluciones

---

## FASE 5: Conectar Componentes Existentes al API

### 5.1 LoginPage → POST /api/auth/login
- Email/password → API login → guardar tokens → redirect por rol
- Cuentas demo pre-llenadas del manual

### 5.2 Dashboard → GET /api/clinics/{id}/reports/revenue + /api/receptionist/appointments
- Métricas reales de la clínica/farmacia

### 5.3 Appointments → GET/POST /api/receptionist/appointments
- Lista real de citas con paginación
- Crear cita con doctores/pacientes reales
- Check-in → POST /api/receptionist/appointments/{id}/checkin
- Cobrar → POST /api/receptionist/payments/collect

### 5.4 Patients → GET/PUT /api/patients
- Lista real con búsqueda
- Perfil con historial → GET /api/patients/{id}/history

### 5.5 Doctors → GET/POST /api/doctors + /api/clinics/{id}/doctors
- Lista real con especialidades
- Registrar doctor → POST /api/clinics/{id}/doctors

### 5.6 Prescriptions → GET/POST /api/doctor/prescriptions
- Crear receta con medicamentos reales
- Firmar → POST /api/doctor/prescriptions/{id}/sign
- Verificar interacciones → POST /api/clinical-check/interactions

### 5.7 POS → POST /api/orders + /api/orders/{id}/process
- Carrito real con medicamentos del inventario
- Procesar orden con pago

### 5.8 Patient Search → GET /api/patient/search-medications
- Búsqueda real de medicamentos
- Farmacias cercanas → GET /api/patient/nearby-pharmacies

### 5.9 Patient Chat → GET/POST /api/chat/conversations
- Conversaciones reales
- Mensajes en tiempo real

### 5.10 Delivery → PUT /api/delivery/availability + GET /api/delivery/available-orders
- Toggle disponibilidad real
- Órdenes disponibles reales

---

## FASE 6: Mejoras UI/UX Pendientes

- Teleconsulta: iframe de Jitsi Meet
- Mapas: integración para farmacias/clínicas cercanas (lat/lng)
- Notificaciones: badge con conteo de no leídas
- Búsqueda con debounce en todos los campos
- Tablas con paginación server-side
- Formularios con react-hook-form + zod
- Toast notifications con sonner para feedback de acciones

---

## Orden de Implementación (Prioridad)

1. **API Client + Auth Store + Auth Provider** (sin esto no funciona nada)
2. **Login conectado al API real** (con las cuentas de prueba)
3. **Navigation store actualizado con 8 roles**
4. **Layouts por rol** (sidebars específicos)
5. **Hooks TanStack Query** (por módulo, según necesidad)
6. **Páginas nuevas** (superadmin, receptionist, doctor)
7. **Conectar componentes existentes** al API real
8. **Mejoras UI** (teleconsulta, mapas, notificaciones)
