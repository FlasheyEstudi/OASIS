# 🌿 OASIS — Puente Backend ↔ Frontend (Auditoría Completa)

## "Tu Base de Salud" — Estado Actual del Backend y Plan de Conexión

---

## 📊 RESUMEN EJECUTIVO

| Métrica | Valor |
|---|---|
| **Endpoints Diseñados (API Manual)** | 142 |
| **Endpoints Implementados (Código Real)** | 1 (GET /api → "Hello, world!") |
| **Tablas Diseñadas (36 modelos)** | 36 |
| **Tablas Implementadas (Prisma Schema)** | 5 (User, Clinic, Pharmacy, AuditLog, Post) |
| **Tablas Faltantes** | 31 |
| **Roles del Sistema** | 8 |
| **Endpoints Públicos** | 10 |
| **Módulos API** | 22 |
| **Estado del Backend** | ❌ NO IMPLEMENTADO — Solo especificación |
| **Estado del Frontend** | ⚠️ PARCIAL — Demo mode con datos falsos |

---

## 🔴 VEREDICTO: EL BACKEND NO ESTÁ FUNCIONAL

El archivo `upload/API_MANUAL.md` es un **documento de diseño**, NO código implementado. El backend real consiste únicamente en:

```typescript
// src/app/api/route.ts — LO ÚNICO QUE EXISTE
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ message: "Hello, world!" });
}
```

**No hay un solo endpoint funcional.** El frontend actualmente opera en **modo demo** con datos hardcodeados en `src/lib/auth-store.ts`.

---

## 🗄️ BRECHA DE BASE DE DATOS

### Schema Actual (5 modelos — DENORMALIZADO)

| Modelo | Campos | Problema |
|---|---|---|
| **User** | id, email, name, password, phone, role + campos doctor/patient/pharmacy/delivery inline | ❌ Todo en un solo modelo, sin relaciones normalizadas |
| **Clinic** | id, name, phone, email, address, city, department, lat/lng, parentClinicId | ⚠️ Falta description, logoUrl, website, settings, department |
| **Pharmacy** | id, name, phone, email, address, city, lat/lng | ❌ Falta parentPharmacyId, deliverySettings, paymentMethods |
| **AuditLog** | id, action, entity, entityId, details, userId, clinicId, pharmacyId | ⚠️ Básico pero funcional |
| **Post** | id, title, content, published, authorId | ❌ Innecesario, no pertenece a OASIS |

### Schema Requerido (36 modelos — NORMALIZADO)

Los 31 modelos faltantes:

| # | Modelo | Estado | Criticidad |
|---|---|---|---|
| 1 | **Doctor** | ❌ Faltante | 🔴 Crítico — Separado de User con specialty, licenseNumber, schedule, digitalSignatureCert |
| 2 | **Patient** | ❌ Faltante | 🔴 Crítico — Separado de User con dateOfBirth, gender, allergies, chronicConditions, emergencyContact |
| 3 | **ClinicAdmin** | ❌ Faltante | 🟡 Medio — Vincula User a Clinic |
| 4 | **Receptionist** | ❌ Faltante | 🟡 Medio — Vincula User a Clinic |
| 5 | **PharmacyAdmin** | ❌ Faltante | 🟡 Medio — Vincula User a Pharmacy |
| 6 | **PharmacyStaff** | ❌ Faltante | 🟡 Medio — Vincula User a Pharmacy |
| 7 | **DeliveryPerson** | ❌ Faltante | 🔴 Crítico — vehicleType, plateNumber, zones, rating, earningsBalance |
| 8 | **FamilyMember** | ❌ Faltante | 🟡 Medio — Perfil familiar del paciente |
| 9 | **DoctorPatient** | ❌ Faltante | 🔴 Crítico — Relación M:N doctor↔paciente |
| 10 | **Medication** | ❌ Faltante | 🔴 Crítico — Catálogo de medicamentos |
| 11 | **InventoryBatch** | ❌ Faltante | 🔴 Crítico — Lotes con expiryDate, batchNumber |
| 12 | **Supplier** | ❌ Faltante | 🟡 Medio — Proveedores de farmacia |
| 13 | **PurchaseOrder** | ❌ Faltante | 🟡 Medio — Órdenes de compra |
| 14 | **PurchaseOrderItem** | ❌ Faltante | 🟡 Medio — Items de OC |
| 15 | **Service** | ❌ Faltante | 🔴 Crítico — Servicios de clínica |
| 16 | **Appointment** | ❌ Faltante | 🔴 Crítico — Citas médicas |
| 17 | **Prescription** | ❌ Faltante | 🔴 Crítico — Recetas médicas |
| 18 | **PrescriptionItem** | ❌ Faltante | 🔴 Crítico — Items de receta |
| 19 | **RefillRequest** | ❌ Faltante | 🟢 Bajo — Recargas de receta |
| 20 | **Order** | ❌ Faltante | 🔴 Crítico — Órdenes de compra de medicamentos |
| 21 | **OrderItem** | ❌ Faltante | 🔴 Crítico — Items de orden |
| 22 | **Delivery** | ❌ Faltante | 🔴 Crítico — Entregas |
| 23 | **Chat** | ❌ Faltante | 🟡 Medio — Conversaciones |
| 24 | **Message** | ❌ Faltante | 🟡 Medio — Mensajes de chat |
| 25 | **Invoice** | ❌ Faltante | 🔴 Crítico — Facturación |
| 26 | **ReturnRequest** | ❌ Faltante | 🟡 Medio — Devoluciones |
| 27 | **Review** | ❌ Faltante | 🟡 Medio — Reseñas polimórficas |
| 28 | **Insurance** | ❌ Faltante | 🟡 Medio — Pólizas de seguro |
| 29 | **Promotion** | ❌ Faltante | 🟡 Medio — Promociones/cupones |
| 30 | **PromotionItem** | ❌ Faltante | 🟢 Bajo — Items de promoción |
| 31 | **Notification** | ❌ Faltante | 🟡 Medio — Notificaciones push |
| 32 | **PaymentTransaction** | ❌ Faltante | 🔴 Crítico — Transacciones de pago |

---

## 📋 CATÁLOGO COMPLETO DE ENDPOINTS (142 del API Manual)

### ✅ Módulo 4.1 — Auth (6 endpoints)

| # | Método | Path | Auth | Roles | Estado Implementación |
|---|---|---|---|---|---|
| 1 | POST | `/api/auth/register` | No | Público | ❌ No implementado |
| 2 | POST | `/api/auth/login` | No | Público | ❌ No implementado |
| 3 | POST | `/api/auth/refresh` | No | Público (con token) | ❌ No implementado |
| 4 | GET | `/api/auth/me` | ✅ | Todos | ❌ No implementado |
| 5 | POST | `/api/auth/forgot-password` | No | Público | ❌ No implementado |
| 6 | POST | `/api/auth/reset-password` | No | Público (con token) | ❌ No implementado |

### ✅ Módulo 4.2 — Clínicas (16 endpoints)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| 7 | GET | `/api/clinics` | ✅ | Todos | ❌ |
| 8 | POST | `/api/clinics` | ✅ | superadmin, clinic_admin | ❌ |
| 9 | GET | `/api/clinics/{id}` | ✅ | Todos | ❌ |
| 10 | PUT | `/api/clinics/{id}` | ✅ | clinic_admin, superadmin | ❌ |
| 11 | DELETE | `/api/clinics/{id}` | ✅ | superadmin | ❌ |
| 12 | GET | `/api/clinics/{id}/branches` | ✅ | Todos | ❌ |
| 13 | POST | `/api/clinics/{id}/branches` | ✅ | clinic_admin, superadmin | ❌ |
| 14 | PUT | `/api/clinics/branches/{branchId}` | ✅ | clinic_admin, superadmin | ❌ |
| 15 | GET | `/api/clinics/{id}/doctors` | ✅ | Todos | ❌ |
| 16 | POST | `/api/clinics/{id}/doctors` | ✅ | clinic_admin, superadmin | ❌ |
| 17 | GET | `/api/clinics/{id}/receptionists` | ✅ | superadmin, clinic_admin, receptionist | ❌ |
| 18 | POST | `/api/clinics/{id}/receptionists` | ✅ | clinic_admin, superadmin | ❌ |
| 19 | GET | `/api/clinics/{id}/services` | ✅ | Todos | ❌ |
| 20 | POST | `/api/clinics/{id}/services` | ✅ | clinic_admin, superadmin | ❌ |
| 21 | GET | `/api/clinics/{id}/reports/revenue` | ✅ | clinic_admin, superadmin | ❌ |
| 22 | GET | `/api/clinics/{id}/audit-logs` | ✅ | clinic_admin, superadmin | ❌ |

### ✅ Módulo 4.3 — Recepcionista (6 endpoints)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| 23 | GET | `/api/receptionist/appointments` | ✅ | receptionist, clinic_admin, superadmin | ❌ |
| 24 | POST | `/api/receptionist/appointments` | ✅ | receptionist, clinic_admin, superadmin | ❌ |
| 25 | PUT | `/api/receptionist/appointments/{id}/confirm` | ✅ | receptionist, clinic_admin, superadmin | ❌ |
| 26 | POST | `/api/receptionist/appointments/{id}/checkin` | ✅ | receptionist, clinic_admin, superadmin | ❌ |
| 27 | POST | `/api/receptionist/payments/collect` | ✅ | receptionist, clinic_admin, superadmin | ❌ |
| 28 | POST | `/api/receptionist/assign-doctor` | ✅ | receptionist, clinic_admin, superadmin | ❌ |

### ✅ Módulo 4.4 — Doctores (8 endpoints)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| 29 | GET | `/api/doctors` | No | Público | ❌ |
| 30 | GET | `/api/doctors/{id}` | No | Público | ❌ |
| 31 | PUT | `/api/doctors/{id}` | ✅ | Propio doctor, superadmin | ❌ |
| 32 | GET | `/api/doctors/{id}/patients` | ✅ | Propio doctor, clinic_admin, superadmin | ❌ |
| 33 | POST | `/api/doctors/{id}/patients` | ✅ | Propio doctor, clinic_admin, superadmin | ❌ |
| 34 | GET | `/api/doctors/{id}/schedule` | No | Público | ❌ |
| 35 | PUT | `/api/doctors/{id}/schedule` | ✅ | Propio doctor, superadmin | ❌ |
| 36 | GET | `/api/doctors/{id}/appointments` | ✅ | Doctor, clinic_admin, receptionist, superadmin | ❌ |

### ✅ Módulo 4.5 — Recetas Médicas (7 endpoints)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| 37 | POST | `/api/doctor/prescriptions` | ✅ | doctor, superadmin | ❌ |
| 38 | GET | `/api/doctor/prescriptions` | ✅ | doctor, patient, clinic_admin, superadmin | ❌ |
| 39 | GET | `/api/doctor/prescriptions/{id}` | ✅ | Doctor emisor, patient, clinic_admin, superadmin | ❌ |
| 40 | PUT | `/api/doctor/prescriptions/{id}` | ✅ | Doctor emisor, superadmin | ❌ |
| 41 | POST | `/api/doctor/prescriptions/{id}/sign` | ✅ | Doctor emisor, superadmin | ❌ |
| 42 | GET | `/api/prescriptions/{id}/verify` | No | Público | ❌ |
| 43 | POST | `/api/clinical-check/interactions` | ✅ | doctor, superadmin | ❌ |

### ✅ Módulo 4.6 — Teleconsulta (2 endpoints)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| 44 | POST | `/api/appointments/{id}/start-teleconsult` | ✅ | doctor, clinic_admin, superadmin | ❌ |
| 45 | GET | `/api/appointments/{id}/teleconsult-link` | ✅ | Doctor, patient, clinic_admin, superadmin | ❌ |

### ✅ Módulo 4.7 — Pacientes Admin (4 endpoints)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| 46 | GET | `/api/patients` | ✅ | Todos (filtrado) | ❌ |
| 47 | GET | `/api/patients/{id}` | ✅ | Propio patient, doctor, clinic_admin, receptionist, superadmin | ❌ |
| 48 | PUT | `/api/patients/{id}` | ✅ | Propio patient, doctor, clinic_admin, superadmin | ❌ |
| 49 | GET | `/api/patients/{id}/history` | ✅ | Propio patient, doctor, clinic_admin, superadmin | ❌ |

### ✅ Módulo 4.8 — Paciente App (16 endpoints)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| 50 | GET | `/api/patient/family-members` | ✅ | patient, superadmin | ❌ |
| 51 | POST | `/api/patient/family-members` | ✅ | patient, superadmin | ❌ |
| 52 | PUT | `/api/patient/family-members/{memberId}` | ✅ | patient, superadmin | ❌ |
| 53 | DELETE | `/api/patient/family-members/{memberId}` | ✅ | patient, superadmin | ❌ |
| 54 | GET | `/api/patient/search-medications` | Opcional | Público | ❌ |
| 55 | GET | `/api/patient/nearby-pharmacies` | Opcional | Público | ❌ |
| 56 | GET | `/api/patient/nearby-clinics` | Opcional | Público | ❌ |
| 57 | GET | `/api/patient/prescriptions` | ✅ | patient, doctor, superadmin | ❌ |
| 58 | POST | `/api/patient/prescriptions/{id}/request-refill` | ✅ | patient, superadmin | ❌ |
| 59 | GET | `/api/patient/refill-reminders` | ✅ | patient, superadmin | ❌ |
| 60 | GET | `/api/patient/appointments` | ✅ | patient, doctor, superadmin | ❌ |
| 61 | POST | `/api/patient/appointments` | ✅ | patient, superadmin | ❌ |
| 62 | GET | `/api/patient/loyalty` | ✅ | patient, superadmin | ❌ |
| 63 | GET | `/api/patient/insurance` | ✅ | patient, superadmin | ❌ |
| 64 | POST | `/api/patient/insurance` | ✅ | patient, superadmin | ❌ |
| 65 | POST | `/api/patient/emergency` | ✅ | patient, superadmin | ❌ |

### ✅ Módulo 4.9 — Farmacias (13 endpoints)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| 66 | GET | `/api/pharmacies` | ✅ | Todos | ❌ |
| 67 | POST | `/api/pharmacies` | ✅ | superadmin, pharmacy_admin | ❌ |
| 68 | GET | `/api/pharmacies/{id}` | ✅ | Todos | ❌ |
| 69 | PUT | `/api/pharmacies/{id}` | ✅ | pharmacy_admin, superadmin | ❌ |
| 70 | DELETE | `/api/pharmacies/{id}` | ✅ | superadmin | ❌ |
| 71 | GET | `/api/pharmacies/{id}/branches` | ✅ | Todos | ❌ |
| 72 | POST | `/api/pharmacies/{id}/branches` | ✅ | pharmacy_admin, superadmin | ❌ |
| 73 | GET | `/api/pharmacies/{id}/inventory` | ✅ | pharmacy_admin, pharmacy_staff, superadmin | ❌ |
| 74 | GET | `/api/pharmacies/{id}/staff` | ✅ | pharmacy_admin, superadmin | ❌ |
| 75 | POST | `/api/pharmacies/{id}/staff` | ✅ | pharmacy_admin, superadmin | ❌ |
| 76 | GET | `/api/pharmacies/{id}/promotions` | ✅ | Todos | ❌ |
| 77 | POST | `/api/pharmacies/{id}/promotions` | ✅ | pharmacy_admin, superadmin | ❌ |
| 78 | POST | `/api/pharmacies/branches/transfer-stock` | ✅ | pharmacy_admin, superadmin | ❌ |

### ✅ Módulo 4.10 — Inventario (7 endpoints)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| 79 | POST | `/api/pharmacy/inventory` | ✅ | pharmacy_admin, pharmacy_staff, superadmin | ❌ |
| 80 | PUT | `/api/pharmacy/inventory` | ✅ | pharmacy_admin, superadmin | ❌ |
| 81 | GET | `/api/pharmacy/inventory/expiring` | ✅ | pharmacy_admin, superadmin | ❌ |
| 82 | GET | `/api/pharmacy/medications` | ✅ | Todos | ❌ |
| 83 | POST | `/api/pharmacy/medications` | ✅ | superadmin | ❌ |
| 84 | GET | `/api/pharmacy/medications/{id}` | ✅ | Todos | ❌ |
| 85 | PUT | `/api/pharmacy/medications/{id}` | ✅ | superadmin | ❌ |

### ✅ Módulo 4.11 — Proveedores (6 endpoints)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| 86 | GET | `/api/pharmacy/suppliers` | ✅ | pharmacy_admin, superadmin | ❌ |
| 87 | POST | `/api/pharmacy/suppliers` | ✅ | pharmacy_admin, superadmin | ❌ |
| 88 | GET | `/api/pharmacy/purchase-orders` | ✅ | pharmacy_admin, superadmin | ❌ |
| 89 | POST | `/api/pharmacy/purchase-orders` | ✅ | pharmacy_admin, superadmin | ❌ |
| 90 | GET | `/api/pharmacy/purchase-orders/{id}` | ✅ | pharmacy_admin, superadmin | ❌ |
| 91 | PUT | `/api/pharmacy/purchase-orders/{id}/receive` | ✅ | pharmacy_admin, superadmin | ❌ |

### ✅ Módulo 4.12 — Reportes Farmacia (3 endpoints)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| 92 | GET | `/api/pharmacies/{id}/reports/sales` | ✅ | pharmacy_admin, superadmin | ❌ |
| 93 | GET | `/api/pharmacies/{id}/reports/top-customers` | ✅ | pharmacy_admin, superadmin | ❌ |
| 94 | GET | `/api/pharmacies/{id}/reports/stock-value` | ✅ | pharmacy_admin, superadmin | ❌ |

### ✅ Módulo 4.13 — Órdenes y Pagos (11 endpoints)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| 95 | GET | `/api/orders` | ✅ | Todos (filtrado) | ❌ |
| 96 | POST | `/api/orders` | ✅ | patient, superadmin | ❌ |
| 97 | GET | `/api/orders/{id}` | ✅ | Owner patient, pharmacy, superadmin | ❌ |
| 98 | PUT | `/api/orders/{id}` | ✅ | pharmacy_admin, pharmacy_staff, superadmin | ❌ |
| 99 | POST | `/api/orders/{id}/return` | ✅ | patient, superadmin | ❌ |
| 100 | GET | `/api/pharmacy/returns` | ✅ | pharmacy_admin, pharmacy_staff, superadmin | ❌ |
| 101 | PUT | `/api/pharmacy/returns/{id}/approve` | ✅ | pharmacy_admin, superadmin | ❌ |
| 102 | POST | `/api/payments/process` | ✅ | Todos | ❌ |
| 103 | GET | `/api/invoices` | ✅ | Todos (filtrado) | ❌ |
| 104 | GET | `/api/invoices/{id}` | ✅ | Todos (contextual) | ❌ |
| 105 | GET | `/api/invoices/{id}/pdf` | ✅ | Todos (contextual) | ❌ |

### ✅ Módulo 4.14 — Delivery (9 endpoints)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| 106 | POST | `/api/delivery/register` | ✅ | delivery_person, superadmin | ❌ |
| 107 | PUT | `/api/delivery/availability` | ✅ | delivery_person, superadmin | ❌ |
| 108 | GET | `/api/delivery/available-orders` | ✅ | delivery_person, superadmin | ❌ |
| 109 | POST | `/api/delivery/accept-order` | ✅ | delivery_person, superadmin | ❌ |
| 110 | POST | `/api/delivery/order/{orderId}/proof` | ✅ | delivery_person, superadmin | ❌ |
| 111 | POST | `/api/delivery/order/{orderId}/failed-delivery` | ✅ | delivery_person, superadmin | ❌ |
| 112 | PUT | `/api/delivery/order/{orderId}/collect-cash` | ✅ | delivery_person, superadmin | ❌ |
| 113 | GET | `/api/delivery/earnings` | ✅ | delivery_person, superadmin | ❌ |
| 114 | GET | `/api/delivery/route/{orderId}` | ✅ | delivery_person, superadmin | ❌ |

### ✅ Módulo 4.15 — Chat (6 endpoints)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| 115 | POST | `/api/chats` | ✅ | patient, superadmin | ❌ |
| 116 | GET | `/api/chats` | ✅ | Todos | ❌ |
| 117 | GET | `/api/chats/{id}` | ✅ | Participantes, superadmin | ❌ |
| 118 | POST | `/api/chats/{id}/messages` | ✅ | Participantes, superadmin | ❌ |
| 119 | GET | `/api/chats/{id}/messages` | ✅ | Participantes, superadmin | ❌ |
| 120 | PUT | `/api/chats/{id}/read` | ✅ | Participantes | ❌ |

### ✅ Módulo 4.16 — Notificaciones (5 endpoints)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| 121 | GET | `/api/notifications` | ✅ | Todos | ❌ |
| 122 | POST | `/api/notifications` | ✅ | superadmin, clinic_admin, pharmacy_admin | ❌ |
| 123 | PUT | `/api/notifications/{id}/read` | ✅ | Dueño | ❌ |
| 124 | PUT | `/api/notifications/read-all` | ✅ | Todos | ❌ |
| 125 | POST | `/api/notifications/register-device` | ✅ | Todos | ❌ |

### ✅ Módulo 4.17 — Reseñas (5 endpoints)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| 126 | POST | `/api/reviews` | ✅ | patient, superadmin | ❌ |
| 127 | GET | `/api/reviews` | No | Público | ❌ |
| 128 | GET | `/api/reviews/{id}` | ✅ | Todos | ❌ |
| 129 | PUT | `/api/reviews/{id}` | ✅ | Dueño, superadmin | ❌ |
| 130 | DELETE | `/api/reviews/{id}` | ✅ | Dueño, superadmin | ❌ |

### ✅ Módulo 4.18 — Citas y Servicios (8 endpoints)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| 131 | GET | `/api/appointments` | ✅ | Todos (filtrado) | ❌ |
| 132 | GET | `/api/appointments/{id}` | ✅ | Participantes, clinic_admin, receptionist, superadmin | ❌ |
| 133 | PUT | `/api/appointments/{id}` | ✅ | clinic_admin, receptionist, doctor, superadmin | ❌ |
| 134 | GET | `/api/services` | ✅ | Todos | ❌ |
| 135 | POST | `/api/services` | ✅ | clinic_admin, superadmin | ❌ |
| 136 | GET | `/api/services/{id}` | ✅ | Todos | ❌ |
| 137 | PUT | `/api/services/{id}` | ✅ | clinic_admin, superadmin | ❌ |
| 138 | DELETE | `/api/services/{id}` | ✅ | clinic_admin, superadmin | ❌ |

### ✅ Módulo 4.19 — Medicamentos Público (3 endpoints)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| 139 | GET | `/api/medications` | No | Público | ❌ |
| 140 | GET | `/api/medications/{id}` | No | Público | ❌ |
| 141 | PUT | `/api/medications/{id}` | ✅ | superadmin | ❌ |

### ✅ Módulo 4.20 — Seguros (1 endpoint)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| 142 | GET | `/api/insurance/estimate` | ✅ | Todos | ❌ |

### ✅ Módulo 4.21 — Root (1 endpoint)

| # | Método | Path | Auth | Roles | Estado |
|---|---|---|---|---|---|
| — | GET | `/api` | No | Público | ✅ Existe (pero devuelve "Hello, world!" en vez del health check especificado) |

---

## 🔍 ANÁLISIS CRUZADO: Plan del Usuario vs API Manual

El usuario propuso expandir a **123+ endpoints** adicionales. Comparando con el API Manual existente:

### ✅ Ya cubiertos en el API Manual (los "nuevos" del usuario ya estaban)

| Endpoint del Usuario | Ya existe como | Nota |
|---|---|---|
| POST /api/clinics/:id/branches | #13 | ✅ Mismo endpoint |
| GET /api/clinics/:id/branches | #12 | ✅ Mismo endpoint |
| PUT /api/clinics/branches/:branchId | #14 | ✅ Mismo endpoint |
| GET /api/clinics/:id/reports/revenue | #21 | ✅ Mismo endpoint |
| GET /api/clinics/:id/audit-logs | #22 | ✅ Mismo endpoint |
| POST /api/clinics/:id/receptionists | #18 | ✅ Mismo endpoint |
| GET /api/receptionist/appointments | #23 | ✅ Mismo endpoint |
| POST /api/receptionist/appointments | #24 | ✅ Mismo endpoint |
| PUT /api/receptionist/appointments/:id/confirm | #25 | ✅ Mismo endpoint |
| POST /api/receptionist/appointments/:id/checkin | #26 | ✅ Mismo endpoint |
| POST /api/receptionist/payments/collect | #27 | ✅ Mismo endpoint |
| POST /api/receptionist/assign-doctor | #28 | ✅ Mismo endpoint |
| POST /api/appointments/:id/start-teleconsult | #44 | ✅ Mismo endpoint |
| GET /api/appointments/:id/teleconsult-link | #45 | ✅ Mismo endpoint |
| POST /api/doctor/prescriptions/:id/sign | #41 | ✅ Mismo endpoint |
| GET /api/prescriptions/:id/verify | #42 | ✅ Mismo endpoint |
| POST /api/clinical-check/interactions | #43 | ✅ Mismo endpoint |
| POST /api/patient/family-members | #51 | ✅ Mismo endpoint |
| GET /api/patient/family-members | #50 | ✅ Mismo endpoint |
| PUT /api/patient/family-members/:memberId | #52 | ✅ Mismo endpoint |
| POST /api/chats | #115 | ✅ Mismo endpoint |
| GET /api/chats | #116 | ✅ Mismo endpoint |
| POST /api/chats/:id/messages | #118 | ✅ Mismo endpoint |
| GET /api/chats/:id/messages | #119 | ✅ Mismo endpoint |
| POST /api/patient/prescriptions/:id/request-refill | #58 | ✅ Mismo endpoint |
| GET /api/patient/refill-reminders | #59 | ✅ Mismo endpoint |
| GET /api/patient/loyalty | #62 | ✅ Mismo endpoint |
| POST /api/patient/insurance | #64 | ✅ Mismo endpoint |
| GET /api/insurance/estimate | #142 | ✅ Mismo endpoint |
| POST /api/pharmacies/:id/branches | #72 | ✅ Mismo endpoint |
| GET /api/pharmacies/:id/branches | #71 | ✅ Mismo endpoint |
| GET /api/pharmacies/:id/inventory | #73 | ✅ Mismo endpoint |
| POST /api/pharmacies/branches/transfer-stock | #78 | ✅ Mismo endpoint |
| GET /api/pharmacy/inventory/expiring | #81 | ✅ Mismo endpoint |
| GET /api/pharmacies/:id/reports/sales | #92 | ✅ Mismo endpoint |
| GET /api/pharmacies/:id/reports/top-customers | #93 | ✅ Mismo endpoint |
| GET /api/pharmacies/:id/reports/stock-value | #94 | ✅ Mismo endpoint |
| GET /api/pharmacy/suppliers | #86 | ✅ Mismo endpoint |
| POST /api/pharmacy/suppliers | #87 | ✅ Mismo endpoint |
| POST /api/pharmacy/purchase-orders | #89 | ✅ Mismo endpoint |
| PUT /api/pharmacy/purchase-orders/:id/receive | #91 | ✅ Mismo endpoint |
| POST /api/payments/process | #102 | ✅ Mismo endpoint |
| PUT /api/delivery/order/:orderId/collect-cash | #112 | ✅ Mismo endpoint |
| POST /api/orders/:id/return | #99 | ✅ Mismo endpoint |
| PUT /api/pharmacy/returns/:id/approve | #101 | ✅ Mismo endpoint |
| PUT /api/delivery/availability | #107 | ✅ Mismo endpoint |
| GET /api/delivery/earnings | #113 | ✅ Mismo endpoint |
| POST /api/delivery/order/:orderId/proof | #110 | ✅ Mismo endpoint |
| POST /api/delivery/order/:orderId/failed-delivery | #111 | ✅ Mismo endpoint |
| GET /api/delivery/route/:orderId | #114 | ✅ Mismo endpoint |
| POST /api/patient/emergency | #65 | ✅ Mismo endpoint |
| POST /api/reviews (extendido) | #126 | ✅ Ya soporta targetType: doctor, clinic, pharmacy, delivery_person, order |

### ❌ NO cubiertos en el API Manual (endpoints genuinamente nuevos del usuario)

| Endpoint Propuesto | Módulo | Prioridad | Observación |
|---|---|---|---|
| GET /api/receptionist/appointments (ya cubierto) | Recepcionista | — | Duplicado |
| DELETE /api/patient/family-members/{memberId} | Paciente App | 🟢 Bajo | **YA EXISTE** como #53 |
| GET /api/chats/{id} | Chat | 🟡 Medio | **YA EXISTE** como #117 |
| PUT /api/chats/{id}/read | Chat | 🟡 Medio | **YA EXISTE** como #120 |

### 🆕 Endpoints genuinamente NUEVOS propuestos por el usuario (NO en API Manual)

| Endpoint | Módulo | Prioridad | Justificación |
|---|---|---|---|
| DELETE /api/pharmacy/suppliers/{id} | Proveedores | 🟡 Medio | Falta endpoint DELETE para eliminar proveedores |
| GET /api/pharmacy/suppliers/{id} | Proveedores | 🟡 Medio | Falta endpoint GET detalle de proveedor |
| PUT /api/pharmacy/suppliers/{id} | Proveedores | 🟡 Medio | Falta endpoint PUT para actualizar proveedor |
| DELETE /api/orders/{id} | Órdenes | 🟡 Medio | No hay cancelación directa de orden por parte del paciente |
| GET /api/delivery/profile | Delivery | 🟢 Bajo | Perfil del repartidor (se puede obtener de /auth/me) |
| PUT /api/delivery/profile | Delivery | 🟢 Bajo | Actualizar perfil del repartidor |
| GET /api/superadmin/stats | Superadmin | 🟡 Medio | Dashboard global de métricas (no existe como endpoint único) |
| GET /api/superadmin/users | Superadmin | 🟡 Medio | Gestión de usuarios (no existe endpoint dedicado) |
| DELETE /api/superadmin/users/{id} | Superadmin | 🟡 Medio | Desactivar usuario |

### 📊 Resumen del Análisis Cruzado

| Categoría | Cantidad |
|---|---|
| Endpoints del usuario ya en API Manual | 53 |
| Endpoints del usuario que SÍ existen (falsos nuevos) | 4 |
| Endpoints genuinamente nuevos propuestos | 9 |
| **Total endpoints API Manual** | **142** |
| **Total con nuevos propuestos** | **151** |

---

## 🔴 PROBLEMAS CRÍTICOS DEL API MANUAL

### 1. Falta DELETE para varios recursos

| Recurso | Tiene DELETE | Necesario |
|---|---|---|
| Clinics | ✅ (#11) | Sí |
| Pharmacies | ✅ (#70) | Sí |
| Services | ✅ (#138) | Sí |
| Reviews | ✅ (#130) | Sí |
| Family Members | ✅ (#53) | Sí |
| **Suppliers** | ❌ | 🔴 Sí — No se puede eliminar un proveedor |
| **Purchase Orders** | ❌ | 🟡 No — Se cancelan con PUT status |
| **Medications** | ❌ | 🟡 Opcional — Se desactivan con PUT |
| **Orders** | ❌ | 🟡 Opcional — Se cancelan con PUT status |
| **Promotions** | ❌ | 🟡 Opcional — Se desactivan con PUT/fecha |

### 2. Falta GET detalle para proveedores

El API Manual solo tiene `GET /api/pharmacy/suppliers` (lista). Falta:
- `GET /api/pharmacy/suppliers/{id}` — Detalle de un proveedor
- `PUT /api/pharmacy/suppliers/{id}` — Actualizar proveedor
- `DELETE /api/pharmacy/suppliers/{id}` — Eliminar proveedor

### 3. No hay endpoint de gestión de usuarios para superadmin

El superadmin no puede:
- Ver lista de todos los usuarios
- Desactivar un usuario
- Cambiar el rol de un usuario

Se necesita:
- `GET /api/superadmin/users` — Lista de usuarios con filtros
- `PUT /api/superadmin/users/{id}` — Actualizar usuario (rol, estado)
- `DELETE /api/superadmin/users/{id}` — Desactivar usuario

### 4. No hay endpoint de dashboard/estadísticas globales

El superadmin necesita métricas agregadas:
- `GET /api/superadmin/stats` — Dashboard global
- `GET /api/superadmin/dashboard` — Métricas de uso

### 5. Falta PUT/DELETE para promotions

Solo hay GET y POST para promotions. Falta:
- `PUT /api/pharmacies/{id}/promotions/{promoId}` — Actualizar promoción
- `DELETE /api/pharmacies/{id}/promotions/{promoId}` — Eliminar promoción

### 6. El modelo Pharmacy no tiene parentPharmacyId en el schema actual

El API Manual especifica `parentPharmacyId` para cadenas de farmacias, pero el schema Prisma actual no lo tiene.

### 7. Falta PATCH para actualizaciones parciales

Todos los PUT requieren enviar el objeto completo. Sería útil tener PATCH para actualizaciones parciales en recursos grandes.

---

## 🏗️ ESTADO DEL FRONTEND ACTUAL

### Archivos Clave del Frontend

| Archivo | Estado | Observación |
|---|---|---|
| `src/lib/api-client.ts` | ✅ Funcional | Cliente HTTP con JWT, auto-refresh, manejo de errores |
| `src/lib/auth-store.ts` | ⚠️ Demo mode | Funciona pero cae a datos falsos cuando API no responde |
| `src/stores/navigation.js` | ⚠️ Parcial | Navegación definida pero vistas no implementadas |
| `src/components/shared/PlatformSidebar.tsx` | ⚠️ Parcial | Menú por roles pero sin funcionalidad real |
| `src/pages/page.tsx` | ⚠️ Parcial | Routing definido pero componentes vacíos |
| `src/components/auth/LoginPage.tsx` | ⚠️ Parcial | Login con demo pero solo 3 roles demo |

### Componentes Frontend que Necesitan Construirse

| Rol | Componente | Prioridad |
|---|---|---|
| superadmin | Dashboard global, gestión usuarios, auditoría, config | 🔴 Alta |
| clinic_admin | Dashboard clínica, doctores, recepcionistas, servicios, reportes | 🔴 Alta |
| receptionist | Agenda citas, check-in, cobros, reasignación | 🔴 Alta |
| doctor | Panel médico, pacientes, recetas, teleconsulta, chat | 🔴 Alta |
| patient | Buscar médicos/farmacias, citas, recetas, pedidos, lealtad, seguros, emergencia | 🔴 Alta |
| pharmacy_admin | Dashboard, inventario, personal, proveedores, OC, promociones, reportes, devoluciones | 🔴 Alta |
| pharmacy_staff | Inventario, procesar órdenes, dispensar | 🟡 Media |
| delivery_person | Disponibilidad, órdenes, comprobante, ganancias, ruta | 🟡 Media |

---

## 📐 PLAN DE IMPLEMENTACIÓN: BACKEND PRIMERO

### Fase 1: Schema + Seed (Base)

1. **Expandir Prisma Schema** de 5 a 36+ modelos
2. **Crear seed** con las 11 cuentas de prueba
3. **Ejecutar** `bun run db:push` para crear tablas

### Fase 2: Auth + Middleware (Núcleo)

4. **JWT middleware** — Verificar token en cada request protegida
5. **POST /api/auth/register** — Registro con creación automática de perfil de rol
6. **POST /api/auth/login** — Login con JWT + roleProfile
7. **POST /api/auth/refresh** — Rotación de refresh tokens
8. **GET /api/auth/me** — Perfil completo con datos de rol
9. **POST /api/auth/forgot-password** — Reset con token
10. **POST /api/auth/reset-password** — Confirmar reset

### Fase 3: Core Médico (Clínica)

11. CRUD Clínicas + sucursales
12. CRUD Doctores + horarios
13. CRUD Pacientes + historial
14. CRUD Citas + estados
15. CRUD Recetas + firma digital
16. CRUD Servicios

### Fase 4: Core Farmacia

17. CRUD Farmacias + sucursales
18. CRUD Inventario (lotes)
19. CRUD Medicamentos
20. CRUD Proveedores
21. CRUD Órdenes de compra

### Fase 5: E-Commerce + Delivery

22. CRUD Órdenes
23. Pagos + facturación
24. Delivery + tracking
25. Devoluciones

### Fase 6: Comunicación + Extras

26. Chat + mensajes
27. Notificaciones
28. Reseñas
29. Seguros + copagos
30. Lealtad + promociones

---

## 🔌 CONEXIÓN FRONTEND ↔ BACKEND

### Arquitectura de Conexión

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Zustand  │  │TanStack  │  │  api-client.ts   │  │
│  │ Auth     │  │ Query    │  │  (fetch + JWT)   │  │
│  │ Store    │  │ (cache)  │  │                  │  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│       │             │                  │             │
│       └─────────────┴──────────────────┘             │
│                          │                            │
│                    /api/* requests                    │
│                    Bearer <token>                     │
└──────────────────────────┬───────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                    BACKEND                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │Middleware│→ │ Route    │→ │   Prisma ORM     │  │
│  │ (JWT)   │  │ Handlers │  │   (SQLite)       │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│                                                     │
│  /api/auth/*                                        │
│  /api/clinics/*                                     │
│  /api/doctors/*                                     │
│  /api/patients/*                                    │
│  /api/pharmacies/*                                  │
│  /api/orders/*                                      │
│  /api/delivery/*                                    │
│  /api/chats/*                                       │
│  ... (142 endpoints)                                │
└─────────────────────────────────────────────────────┘
```

### Patrón de Conexión por Módulo

```typescript
// Ejemplo: Módulo de Citas (Appointments)

// 1. Frontend hook (TanStack Query)
export function useAppointments(filters?: AppointmentFilters) {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: async () => {
      const result = await api.get<PaginatedData<Appointment>>('/appointments', filters)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })
}

// 2. Mutations
export function useCreateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAppointmentDTO) =>
      api.post<Appointment>('/patient/appointments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

// 3. Uso en componente
function AppointmentList() {
  const { data, isLoading } = useAppointments({ status: 'scheduled' })
  const createAppointment = useCreateAppointment()
  // ...
}
```

### Mapeo de Roles → Vistas → Endpoints

| Rol | Vista Principal | Endpoints Primarios |
|---|---|---|
| **superadmin** | Dashboard global | GET /api/clinics, GET /api/pharmacies, GET /api/superadmin/users, GET /api/superadmin/stats |
| **clinic_admin** | Dashboard clínica | GET /api/clinics/{id}, GET /api/clinics/{id}/doctors, GET /api/clinics/{id}/reports/revenue, GET /api/clinics/{id}/audit-logs |
| **receptionist** | Agenda | GET /api/receptionist/appointments, POST /api/receptionist/appointments, POST /api/receptionist/appointments/{id}/checkin, POST /api/receptionist/payments/collect |
| **doctor** | Panel médico | GET /api/doctors/{id}/appointments, POST /api/doctor/prescriptions, POST /api/clinical-check/interactions, POST /api/appointments/{id}/start-teleconsult |
| **patient** | App paciente | GET /api/doctors, POST /api/patient/appointments, GET /api/patient/prescriptions, POST /api/orders, GET /api/patient/loyalty, GET /api/patient/nearby-pharmacies |
| **pharmacy_admin** | Dashboard farmacia | GET /api/pharmacies/{id}/inventory, POST /api/pharmacy/inventory, GET /api/pharmacy/purchase-orders, GET /api/pharmacies/{id}/reports/sales, POST /api/pharmacies/{id}/promotions |
| **pharmacy_staff** | Ventas | GET /api/pharmacies/{id}/inventory, GET /api/orders, PUT /api/orders/{id}, GET /api/pharmacy/returns |
| **delivery_person** | Entregas | PUT /api/delivery/availability, GET /api/delivery/available-orders, POST /api/delivery/accept-order, POST /api/delivery/order/{orderId}/proof, GET /api/delivery/earnings |

---

## 🎯 PROMPT PARA IA — CONSTRUIR BACKEND + FRONTEND COMPLETO

---

### INSTRUCCIONES PARA IA: Construir el Backend y Frontend de OASIS

Eres una IA que va a construir el backend Y frontend completo de **OASIS — "Tu Base de Salud"**, una plataforma de salud digital para Nicaragua.

#### CONTEXTO CRÍTICO

- **Estado actual**: El backend NO existe. Solo hay un API Manual (upload/API_MANUAL.md) con 142 endpoints documentados y un schema Prisma con 5 modelos básicos.
- **Frontend actual**: Opera en modo demo con datos hardcodeados. Necesita conectarse a la API real.
- **Proyecto**: Next.js 16 + App Router + TypeScript 5 + Tailwind CSS 4 + shadcn/ui + Prisma ORM (SQLite)

#### PASO 1: CONSTRUIR EL BACKEND (Prioridad #1)

1. **Expandir Prisma Schema** a los 36 modelos documentados en el API Manual sección 5
2. **Crear seed** (`prisma/seed.ts`) con las 11 cuentas de prueba
3. **Ejecutar** `bun run db:push` para crear las tablas
4. **Implementar middleware JWT** en `src/middleware.ts`
5. **Implementar TODOS los endpoints** como Next.js App Router route handlers en `src/app/api/`
6. **Seguir exactamente** el API Manual para request/response formats, códigos de error, y permisos por rol

#### PASO 2: CONECTAR EL FRONTEND

7. **Actualizar api-client.ts** si es necesario
8. **Remover modo demo** del auth-store.ts
9. **Crear hooks TanStack Query** para cada módulo
10. **Implementar componentes** para cada vista de cada rol
11. **Conectar formularios** con validación (react-hook-form + zod)

#### REGLAS

- **Source of truth**: `upload/API_MANUAL.md` — Consulta ese documento para TODO
- **NO uses mock data** — Todo debe conectarse a la API real
- **JWT flow**: Login → access token (15min) + refresh token (7d) → auto-refresh en 401
- **Paginación**: Todos los listados usan page/limit del servidor
- **Permisos**: Cada endpoint valida el rol del usuario autenticado
- **Errores**: Formato `{ success: false, error: "mensaje", message?: "detalle" }`
- **Sin emojis en UI** — Solo iconos Lucide
- **Responsive** — Mobile-first, especialmente paciente y repartidor
- **8 roles**: superadmin, clinic_admin, receptionist, doctor, patient, pharmacy_admin, pharmacy_staff, delivery_person
- **Role grouping**: receptionist+doctor van bajo sidebar de clínica; pharmacy_staff va bajo sidebar de farmacia

#### CUENTAS DE PRUEBA

| Rol | Email | Password |
|---|---|---|
| superadmin | superadmin@oasis.nii | Oasis2025! |
| clinic_admin | admin@santamaria.nii | Clinic2025! |
| receptionist | recepcion@santamaria.nii | Recep2025! |
| doctor | dr.garcia@santamaria.nii | Doctor2025! |
| patient | carlos@email.com | Patient2025! |
| pharmacy_admin | admin@farmaciacentral.nii | Pharmacy2025! |
| pharmacy_staff | vendedor@farmaciacentral.nii | Staff2025! |
| delivery_person | repartidor1@oasis.nii | Delivery2025! |

#### PALETA DE COLORES

- Verde Oasis: #0E8C5E
- Verde Menta: #E8F5EE
- Azul Conecta: #0077B6
- Blanco Nube: #FFFFFF
- Gris Piedra: #4A4A4A
- Naranja Suave: #F4A261

#### BORDER RADIUS

- Botones: 50px
- Tarjetas: 20px
- Inputs: 14px
- Modales: 24px

#### ENDPOINTS ADICIONALES (no en API Manual pero necesarios)

- `GET /api/superadmin/users` — Lista de usuarios con filtros (rol, estado, búsqueda)
- `PUT /api/superadmin/users/{id}` — Actualizar usuario (rol, estado)
- `DELETE /api/superadmin/users/{id}` — Desactivar usuario (soft delete)
- `GET /api/superadmin/stats` — Dashboard global de métricas
- `GET /api/pharmacy/suppliers/{id}` — Detalle de proveedor
- `PUT /api/pharmacy/suppliers/{id}` — Actualizar proveedor
- `DELETE /api/pharmacy/suppliers/{id}` — Eliminar proveedor
- `PUT /api/pharmacies/{id}/promotions/{promoId}` — Actualizar promoción
- `DELETE /api/pharmacies/{id}/promotions/{promoId}` — Eliminar promoción

---

## 📊 MÉTRICAS DE PROGRESO

### Para trackear implementación

- [ ] Prisma Schema expandido (0/36 modelos)
- [ ] Seed con datos de prueba (0/11 cuentas)
- [ ] Middleware JWT (0/1)
- [ ] Endpoints Auth (0/6)
- [ ] Endpoints Clínicas (0/16)
- [ ] Endpoints Recepcionista (0/6)
- [ ] Endpoints Doctores (0/8)
- [ ] Endpoints Recetas (0/7)
- [ ] Endpoints Teleconsulta (0/2)
- [ ] Endpoints Pacientes Admin (0/4)
- [ ] Endpoints Paciente App (0/16)
- [ ] Endpoints Farmacias (0/13)
- [ ] Endpoints Inventario (0/7)
- [ ] Endpoints Proveedores (0/6)
- [ ] Endpoints Reportes Farmacia (0/3)
- [ ] Endpoints Órdenes y Pagos (0/11)
- [ ] Endpoints Delivery (0/9)
- [ ] Endpoints Chat (0/6)
- [ ] Endpoints Notificaciones (0/5)
- [ ] Endpoints Reseñas (0/5)
- [ ] Endpoints Citas y Servicios (0/8)
- [ ] Endpoints Medicamentos Público (0/3)
- [ ] Endpoints Seguros (0/1)
- [ ] Endpoints Root (0/1)
- [ ] Endpoints Adicionales (0/9)
- [ ] Frontend hooks TanStack Query (0/22 módulos)
- [ ] Frontend componentes por rol (0/8 roles)

**TOTAL: 142 + 9 = 151 endpoints por implementar + 36 modelos + 8 roles de UI**

---

*Documento generado para OASIS v1.0 — Auditoría Backend-Frontend*
*142 endpoints documentados · 36 tablas diseñadas · 22 módulos · 8 roles*
*0 endpoints implementados · 5 modelos actuales · Backend NO funcional*
