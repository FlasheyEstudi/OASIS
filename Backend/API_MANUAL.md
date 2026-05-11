# 🌿 OASIS — Manual de API v1.0

## "Tu Base de Salud" — Plataforma de Salud Nicaragüense

---

| Campo | Valor |
|---|---|
| **Proyecto** | OASIS — Tu Base de Salud |
| **Versión** | 1.0.0 |
| **Framework** | Next.js 16 (App Router) |
| **Base URL** | `/api` |
| **Lenguaje** | TypeScript 5 |
| **Base de Datos** | SQLite via Prisma ORM |
| **Total de Endpoints** | 142 |
| **Tablas de BD** | 36 |
| **Módulos** | 22 |
| **Roles** | 8 |

### Descripción General

OASIS es una plataforma integral de salud digital para Nicaragua que conecta pacientes, doctores, clínicas, farmacias y repartidores en un ecosistema unificado. El backend provee APIs RESTful para la gestión completa de citas médicas, recetas electrónicas, dispensación de medicamentos, delivery, pagos, facturación y comunicación en tiempo real.

### Los 8 Roles del Sistema

| # | Rol | Identificador | Descripción |
|---|---|---|---|
| 1 | **Super Administrador** | `superadmin` | Acceso total al sistema |
| 2 | **Admin de Clínica** | `clinic_admin` | Gestiona su clínica, doctores, servicios |
| 3 | **Recepcionista** | `receptionist` | Gestiona citas y pagos en su clínica |
| 4 | **Doctor** | `doctor` | Atiende pacientes, emite recetas |
| 5 | **Paciente** | `patient` | Agenda citas, compra medicamentos |
| 6 | **Admin de Farmacia** | `pharmacy_admin` | Gestiona su farmacia, inventario, personal |
| 7 | **Staff de Farmacia** | `pharmacy_staff` | Opera inventario y ventas |
| 8 | **Repartidor** | `delivery_person` | Realiza entregas de medicamentos |

---

## Tabla de Contenidos

1. [Autenticación](#1-autenticación)
2. [Cuentas de Prueba](#2-cuentas-de-prueba)
3. [Formato de Respuestas](#3-formato-de-respuestas)
4. [Endpoints por Módulo](#4-endpoints-por-módulo)
   - 4.1 [Auth (6 endpoints)](#41-auth)
   - 4.2 [Clínicas (15 endpoints)](#42-clínicas)
   - 4.3 [Recepcionista (6 endpoints)](#43-recepcionista)
   - 4.4 [Doctores (8 endpoints)](#44-doctores)
   - 4.5 [Recetas Médicas (7 endpoints)](#45-recetas-médicas)
   - 4.6 [Teleconsulta (2 endpoints)](#46-teleconsulta)
   - 4.7 [Pacientes Admin (4 endpoints)](#47-pacientes-admin)
   - 4.8 [Paciente App (16 endpoints)](#48-paciente-app)
   - 4.9 [Farmacias (13 endpoints)](#49-farmacias)
   - 4.10 [Inventario (7 endpoints)](#410-inventario)
   - 4.11 [Proveedores (6 endpoints)](#411-proveedores)
   - 4.12 [Reportes Farmacia (3 endpoints)](#412-reportes-farmacia)
   - 4.13 [Órdenes y Pagos (11 endpoints)](#413-órdenes-y-pagos)
   - 4.14 [Delivery (9 endpoints)](#414-delivery)
   - 4.15 [Chat (6 endpoints)](#415-chat)
   - 4.16 [Notificaciones (5 endpoints)](#416-notificaciones)
   - 4.17 [Reseñas (5 endpoints)](#417-reseñas)
   - 4.18 [Citas y Servicios (8 endpoints)](#418-citas-y-servicios)
   - 4.19 [Medicamentos Público (3 endpoints)](#419-medicamentos-público)
   - 4.20 [Seguros (1 endpoint)](#420-seguros)
   - 4.21 [Root (1 endpoint)](#421-root)
5. [Esquema de Base de Datos](#5-esquema-de-base-de-datos)
6. [Permisos por Rol](#6-permisos-por-rol)
7. [Prompt para IA — Construir Frontend](#7-prompt-para-ia--construir-frontend)

---

## 1. Autenticación

### Mecanismo JWT

El sistema utiliza **JSON Web Tokens (JWT)** con un par de tokens:

| Token | Duración | Uso |
|---|---|---|
| **Access Token** | 15 minutos | Autenticación en cada request |
| **Refresh Token** | 7 días | Renovar access token sin re-login |

### Headers Requeridos

Todos los endpoints protegidos requieren el header:

```
Authorization: Bearer <access_token>
```

**Fallback:** Si no se envía el header `Authorization`, el sistema busca la cookie `access_token`.

### Flujo Completo de Autenticación

```
1. POST /api/auth/login  →  { accessToken, refreshToken, user, roleProfile }
2. Almacenar accessToken y refreshToken en el cliente
3. Enviar accessToken en cada request: Authorization: Bearer <accessToken>
4. Cuando accessToken expire (15 min) → POST /api/auth/refresh { refreshToken }
5. Recibir nuevo par { accessToken, refreshToken } (rotación automática)
6. Si refresh token expira o se compromete → POST /api/auth/login de nuevo
```

### Seguridad

- Contraseñas hasheadas con bcrypt (12 rounds)
- Refresh tokens se almacenan en BD y se rotan en cada uso
- Si se detecta reuso de refresh token, se invalidan todas las sesiones del usuario
- Auditoría de intentos de login fallidos

---

## 2. Cuentas de Prueba

| # | Rol | Email | Contraseña | Organización |
|---|---|---|---|---|
| 1 | Superadmin | `superadmin@oasis.nii` | `Oasis2025!` | Oasis |
| 2 | Admin Clínica | `admin@santamaria.nii` | `Clinic2025!` | Clínica Santa María |
| 3 | Recepcionista | `recepcion@santamaria.nii` | `Recep2025!` | Clínica Santa María |
| 4 | Doctor | `dr.garcia@santamaria.nii` | `Doctor2025!` | Clínica Santa María |
| 5 | Doctora | `dra.martinez@santamaria.nii` | `Doctor2025!` | Clínica Santa María |
| 6 | Paciente | `carlos@email.com` | `Patient2025!` | — |
| 7 | Paciente | `lucia@email.com` | `Patient2025!` | — |
| 8 | Admin Farmacia | `admin@farmaciacentral.nii` | `Pharmacy2025!` | Farmacia Central |
| 9 | Staff Farmacia | `vendedor@farmaciacentral.nii` | `Staff2025!` | Farmacia Central |
| 10 | Repartidor | `repartidor1@oasis.nii` | `Delivery2025!` | Oasis |
| 11 | Repartidor | `repartidor2@oasis.nii` | `Delivery2025!` | Oasis |

### Ejemplo Rápido de Login

```bash
# Login como paciente
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carlos@email.com","password":"Patient2025!"}'

# Usar el token recibido
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

---

## 3. Formato de Respuestas

### Respuesta Exitosa

```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}
```

### Respuesta de Error

```json
{
  "success": false,
  "error": "Mensaje descriptivo del error",
  "message": "Descripción legible"
}
```

### Respuesta de Validación (422)

```json
{
  "success": false,
  "error": "Error de validación",
  "details": {
    "campo": "Descripción del error específico"
  }
}
```

### Respuesta Paginada

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Códigos de Estado HTTP

| Código | Significado | Cuándo ocurre |
|---|---|---|
| `200` | OK | Operación exitosa |
| `201` | Created | Recurso creado |
| `400` | Bad Request | Datos inválidos, estado incorrecto |
| `401` | Unauthorized | No autenticado o token expirado |
| `403` | Forbidden | Sin permisos para esta acción |
| `404` | Not Found | Recurso no encontrado |
| `409` | Conflict | Conflicto (duplicado, horario ocupado) |
| `422` | Unprocessable Entity | Error de validación de campos |
| `500` | Internal Server Error | Error del servidor |

---

## 4. Endpoints por Módulo

---

### 4.1 Auth

#### 4.1.1 POST /api/auth/register

Registra un nuevo usuario con creación automática del registro específico del rol.

| Propiedad | Valor |
|---|---|
| **Autenticación** | No requerida |
| **Roles** | Público |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `email` | string | ✅ | Email válido y único |
| `password` | string | ✅ | Mínimo 6 caracteres |
| `name` | string | ✅ | Nombre completo |
| `phone` | string | ❌ | Teléfono |
| `role` | string | ✅ | Uno de: `superadmin`, `clinic_admin`, `receptionist`, `doctor`, `patient`, `pharmacy_admin`, `pharmacy_staff`, `delivery_person` |
| `clinicId` | string | Condicional | Requerido para `doctor`, `clinic_admin`, `receptionist` |
| `specialty` | string | Condicional | Requerido para `doctor` |
| `licenseNumber` | string | Condicional | Requerido para `doctor`, debe ser único |
| `pharmacyId` | string | Condicional | Requerido para `pharmacy_admin`, `pharmacy_staff` |

**Respuesta Exitosa (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "nuevo@email.com",
      "name": "Nombre Completo",
      "phone": "+50512345678",
      "role": "patient",
      "isActive": true,
      "emailVerified": false,
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Ejemplo curl:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@email.com",
    "password": "Password123!",
    "name": "María López",
    "phone": "+50588889999",
    "role": "patient"
  }'
```

**Errores:** `409` Email/licencia ya registrados, `404` Clínica/farmacia no encontrada, `422` Validación, `500` Error interno

---

#### 4.1.2 POST /api/auth/login

Autentica un usuario y devuelve tokens JWT junto con el perfil del rol.

| Propiedad | Valor |
|---|---|
| **Autenticación** | No requerida |
| **Roles** | Público |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `email` | string | ✅ | Email del usuario |
| `password` | string | ✅ | Contraseña |

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "dr.garcia@santamaria.nii",
      "name": "Dr. García",
      "phone": "+50512345678",
      "role": "doctor",
      "avatarUrl": null,
      "isActive": true,
      "emailVerified": false,
      "phoneVerified": false,
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "roleProfile": {
      "clinicId": "clx...",
      "specialty": "Cardiología",
      "licenseNumber": "MED-12345",
      "consultationFee": 500,
      "rating": 4.5
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**`roleProfile` varía según el rol:**
- `doctor`: `{ clinicId, specialty, licenseNumber, consultationFee, rating }`
- `patient`: `{ loyaltyPoints, loyaltyLevel, bloodType }`
- `clinic_admin`: `{ clinicId }`
- `receptionist`: `{ clinicId }`
- `pharmacy_admin`: `{ pharmacyId }`
- `pharmacy_staff`: `{ pharmacyId, staffRole }`
- `delivery_person`: `{ vehicleType, isVerified, isAvailable, rating }`
- `superadmin`: `{ access: "full" }`

**Ejemplo curl:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carlos@email.com","password":"Patient2025!"}'
```

**Errores:** `401` Credenciales inválidas, `403` Cuenta desactivada, `422` Campos requeridos, `500` Error interno

---

#### 4.1.3 POST /api/auth/refresh

Renueva el access token usando un refresh token válido. El refresh token se rota automáticamente.

| Propiedad | Valor |
|---|---|
| **Autenticación** | No requerida (usa refreshToken en body) |
| **Roles** | Público (con token válido) |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `refreshToken` | string | ✅ | Refresh token JWT |

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...(nuevo)",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...(nuevo)"
  }
}
```

**Ejemplo curl:**

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJhbGciOiJIUzI1NiIs..."}'
```

**Errores:** `401` Token inválido/expirado o comprometido, `403` Cuenta desactivada, `404` Usuario no encontrado

---

#### 4.1.4 GET /api/auth/me

Obtiene el perfil completo del usuario autenticado con datos específicos del rol.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "dr.garcia@santamaria.nii",
      "name": "Dr. García",
      "phone": "+50512345678",
      "role": "doctor",
      "avatarUrl": null,
      "isActive": true,
      "emailVerified": false,
      "phoneVerified": false,
      "doctor": {
        "id": "clx...",
        "clinicId": "clx...",
        "specialty": "Cardiología",
        "licenseNumber": "MED-12345",
        "clinic": {
          "id": "clx...",
          "name": "Clínica Santa María",
          "city": "Managua"
        }
      }
    }
  }
}
```

**Ejemplo curl:**

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

**Errores:** `401` No autenticado

---

#### 4.1.5 POST /api/auth/forgot-password

Genera un token de restablecimiento de contraseña. Siempre retorna éxito para prevenir enumeración de emails.

| Propiedad | Valor |
|---|---|
| **Autenticación** | No requerida |
| **Roles** | Público |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `email` | string | ✅ | Email registrado |

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "message": "Si el email está registrado, recibirás instrucciones para restablecer tu contraseña",
    "resetToken": "token_solo_en_desarrollo"
  }
}
```

> **Nota:** El campo `resetToken` solo se incluye en entorno de desarrollo.

**Errores:** `422` Email requerido

---

#### 4.1.6 POST /api/auth/reset-password

Restablece la contraseña usando un token válido recibido por email.

| Propiedad | Valor |
|---|---|
| **Autenticación** | No requerida |
| **Roles** | Público (con token válido) |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `token` | string | ✅ | Token de restablecimiento |
| `newPassword` | string | ✅ | Nueva contraseña (mínimo 6 caracteres) |

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "message": "Contraseña restablecida exitosamente"
  }
}
```

**Errores:** `400` Token inválido/expirado, `422` Validación

---

### 4.2 Clínicas

#### 4.2.1 GET /api/clinics

Lista clínicas. superadmin ve todas, clinic_admin solo la suya.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `search` | string | Buscar por nombre |
| `city` | string | Filtrar por ciudad |
| `department` | string | Filtrar por departamento |
| `isActive` | boolean | Filtrar por estado activo |
| `page` | integer | Página (default: 1) |
| `limit` | integer | Items por página (default: 20) |

**Respuesta (200):** Lista paginada de clínicas con conteo de doctores, sucursales y servicios.

```bash
curl "http://localhost:3000/api/clinics?city=Managua&page=1&limit=10" \
  -H "Authorization: Bearer <accessToken>"
```

**Errores:** `401` No autenticado

---

#### 4.2.2 POST /api/clinics

Crea una nueva clínica o sucursal.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `superadmin`, `clinic_admin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `name` | string | ✅ | Nombre de la clínica |
| `phone` | string | ❌ | Teléfono |
| `email` | string | ❌ | Email |
| `address` | string | ❌ | Dirección |
| `city` | string | ❌ | Ciudad |
| `department` | string | ❌ | Departamento |
| `latitude` | float | ❌ | Latitud GPS |
| `longitude` | float | ❌ | Longitud GPS |
| `parentClinicId` | string | ❌ | ID de clínica padre (para sucursales) |

**Ejemplo curl:**

```bash
curl -X POST http://localhost:3000/api/clinics \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Clínica Nueva","city":"León","department":"León"}'
```

**Errores:** `403` Sin permisos, `422` Nombre requerido, `500` Error interno

---

#### 4.2.3 GET /api/clinics/{id}

Obtiene detalles de una clínica con admins, sucursales y conteos.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**URL Parameters:** `id` — ID de la clínica

**Respuesta:** Objeto de clínica con `admins`, `branches`, `_count` (doctors, receptionists, services, appointments)

```bash
curl http://localhost:3000/api/clinics/clx123 \
  -H "Authorization: Bearer <accessToken>"
```

**Errores:** `403` Sin acceso, `404` Clínica no encontrada

---

#### 4.2.4 PUT /api/clinics/{id}

Actualiza datos de una clínica.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `clinic_admin` (solo su clínica), `superadmin` |

**URL Parameters:** `id` — ID de la clínica

**Request Body:** Mismos campos que POST. Solo superadmin puede cambiar `isActive`.

**Errores:** `403` Sin permisos, `404` No encontrada, `400` Clínica inactiva

---

#### 4.2.5 DELETE /api/clinics/{id}

Desactiva una clínica (soft delete).

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `superadmin` |

**URL Parameters:** `id` — ID de la clínica

**Respuesta:** `{ success: true, data: { message: "Clínica desactivada exitosamente" } }`

**Errores:** `403` Solo superadmin, `404` No encontrada, `400` Ya inactiva

---

#### 4.2.6 GET /api/clinics/{id}/branches

Lista sucursales de una clínica.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**URL Parameters:** `id` — ID de la clínica

**Query Parameters:** `page`, `limit`

**Respuesta:** Lista paginada de sucursales con conteo de doctores y servicios.

---

#### 4.2.7 POST /api/clinics/{id}/branches

Crea una sucursal para una clínica.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `clinic_admin` (de la clínica padre), `superadmin` |

**URL Parameters:** `id` — ID de la clínica padre

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `name` | string | ✅ | Nombre de la sucursal |
| `address` | string | ❌ | Dirección |
| `city` | string | ❌ | Ciudad |

**Errores:** `403` Sin permisos, `404` Clínica padre no encontrada, `422` Nombre requerido

---

#### 4.2.8 PUT /api/clinics/branches/{branchId}

Actualiza datos de una sucursal.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `clinic_admin` (de la clínica padre), `superadmin` |

**URL Parameters:** `branchId` — ID de la sucursal

**Request Body:** `{ name?, address? }`. Solo superadmin puede cambiar `isActive`.

---

#### 4.2.9 GET /api/clinics/{id}/doctors

Lista doctores de una clínica.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**URL Parameters:** `id` — ID de la clínica

**Query Parameters:** `specialty`, `page`, `limit`

**Respuesta:** Lista paginada de doctores con datos de usuario y conteo de citas.

---

#### 4.2.10 POST /api/clinics/{id}/doctors

Agrega un doctor a la clínica, creando usuario y perfil de doctor.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `clinic_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la clínica

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `userId` | string | ❌ | ID de usuario existente (alternativa) |
| `specialty` | string | ✅ | Especialidad |
| `licenseNumber` | string | ✅ | Número de licencia (único) |

Si se usa sin `userId`, el sistema crea el usuario. En ese caso también se requieren: `name`, `email`, `password`. Opcionales: `phone`, `biography`, `consultationFee`, `schedule`.

**Errores:** `409` Email o licencia duplicados, `404` Clínica no encontrada, `422` Validación

---

#### 4.2.11 GET /api/clinics/{id}/receptionists

Lista recepcionistas de una clínica.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `superadmin`, `clinic_admin`, `receptionist` |

**URL Parameters:** `id` — ID de la clínica

**Query Parameters:** `page`, `limit`

---

#### 4.2.12 POST /api/clinics/{id}/receptionists

Crea un recepcionista para la clínica.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `clinic_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la clínica

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `name` | string | ✅ | Nombre |
| `email` | string | ✅ | Email (único) |
| `password` | string | ✅ | Contraseña |
| `phone` | string | ❌ | Teléfono |

**Errores:** `409` Email ya existe, `404` Clínica no encontrada

---

#### 4.2.13 GET /api/clinics/{id}/services

Lista servicios de una clínica.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**URL Parameters:** `id` — ID de la clínica

**Query Parameters:** `page`, `limit`

---

#### 4.2.14 POST /api/clinics/{id}/services

Crea un servicio para la clínica.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `clinic_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la clínica

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `name` | string | ✅ | Nombre del servicio |
| `duration` | integer | ❌ | Duración en minutos (default: 30) |
| `price` | float | ❌ | Precio (default: 0) |

---

#### 4.2.15 GET /api/clinics/{id}/reports/revenue

Reporte de ingresos de la clínica.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `clinic_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la clínica

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `from` | string | Fecha inicio (YYYY-MM-DD) |
| `to` | string | Fecha fin (YYYY-MM-DD) |
| `groupBy` | string | `doctor` o `service` (default: service) |

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "clinic": { "id", "name" },
    "period": { "from", "to" },
    "summary": {
      "totalRevenue": 50000,
      "totalSubtotal": 45000,
      "totalTax": 5000,
      "totalDiscount": 0,
      "totalInsurance": 0,
      "invoiceCount": 25
    },
    "groups": [...],
    "invoices": [...]
  }
}
```

**Errores:** `403` Sin permisos, `404` Clínica no encontrada

---

#### 4.2.16 GET /api/clinics/{id}/audit-logs

Trail de auditoría de la clínica.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `clinic_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la clínica

**Query Parameters:** `page`, `limit`, `action`, `entity`, `userId`

**Respuesta:** Lista paginada de registros de auditoría con datos de usuario.

---

### 4.3 Recepcionista

#### 4.3.1 GET /api/receptionist/appointments

Lista citas para el recepcionista, filtradas por su clínica.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `receptionist`, `clinic_admin`, `superadmin` |

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `date` | string | Filtrar por fecha |
| `status` | string | Filtrar por estado |
| `clinicId` | string | Filtrar por clínica |
| `doctorId` | string | Filtrar por doctor |
| `page` | integer | Página |
| `limit` | integer | Items por página |

**Respuesta:** Citas con datos de paciente, doctor, servicio e invoice.

```bash
curl "http://localhost:3000/api/receptionist/appointments?date=2025-03-01&status=scheduled" \
  -H "Authorization: Bearer <accessToken>"
```

---

#### 4.3.2 POST /api/receptionist/appointments

Crea una cita para un paciente.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `receptionist`, `clinic_admin`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `clinicId` | string | ✅ | ID de la clínica |
| `doctorId` | string | ✅ | ID del doctor |
| `patientId` | string | ✅ | ID del paciente |
| `date` | string | ✅ | Fecha (YYYY-MM-DD) |
| `startTime` | string | ✅ | Hora inicio (HH:mm) |
| `endTime` | string | ✅ | Hora fin (HH:mm) |

**Errores:** `409` Conflicto de horario, `404` Doctor/paciente no encontrado

---

#### 4.3.3 PUT /api/receptionist/appointments/{id}/confirm

Confirma una cita programada.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `receptionist`, `clinic_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la cita

**Errores:** `400` Solo se pueden confirmar citas en estado "scheduled"

```bash
curl -X PUT http://localhost:3000/api/receptionist/appointments/clx123/confirm \
  -H "Authorization: Bearer <accessToken>"
```

---

#### 4.3.4 POST /api/receptionist/appointments/{id}/checkin

Marca la llegada del paciente (check-in).

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `receptionist`, `clinic_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la cita

**Errores:** `400` Solo se puede hacer check-in en citas programadas o confirmadas

---

#### 4.3.5 POST /api/receptionist/payments/collect

Cobra una consulta, genera factura y marca cita como completada.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `receptionist`, `clinic_admin`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `appointmentId` | string | ✅ | ID de la cita |
| `paymentMethod` | string | ✅ | Método de pago (cash, card_online, insurance) |
| `amount` | number | ❌ | Monto (default: precio del servicio o tarifa del doctor) |

**Respuesta:** `{ invoice, message: "Pago registrado exitosamente" }`

```bash
curl -X POST http://localhost:3000/api/receptionist/payments/collect \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"appointmentId":"clx123","paymentMethod":"cash","amount":500}'
```

---

#### 4.3.6 POST /api/receptionist/assign-doctor

Reasigna citas masivamente a otro doctor.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `receptionist`, `clinic_admin`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `fromDoctorId` | string | Condicional | Doctor origen |
| `toDoctorId` | string | ✅ | Doctor destino |
| `appointmentIds` | string[] | Condicional | IDs de citas a reasignar |

**Respuesta:** `{ reassigned: number, fromDoctorId, toDoctorId, message }`

---

### 4.4 Doctores

#### 4.4.1 GET /api/doctors

Lista doctores activos. Endpoint público.

| Propiedad | Valor |
|---|---|
| **Autenticación** | No requerida (público) |
| **Roles** | Público |

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `clinicId` | string | Filtrar por clínica |
| `specialty` | string | Filtrar por especialidad |
| `search` | string | Buscar por nombre, especialidad, biografía |
| `page` | integer | Página |
| `limit` | integer | Items por página |

**Respuesta:** Doctores con datos de usuario y clínica, ordenados por rating.

```bash
curl "http://localhost:3000/api/doctors?specialty=Cardiología&search=garcia"
```

---

#### 4.4.2 GET /api/doctors/{id}

Obtiene perfil completo del doctor con reseñas.

| Propiedad | Valor |
|---|---|
| **Autenticación** | No requerida (público) |
| **Roles** | Público |

**URL Parameters:** `id` — ID del doctor

**Respuesta:** Perfil del doctor con `schedule` (parseado), `reviews` (últimas 10), datos de clínica.

---

#### 4.4.3 PUT /api/doctors/{id}

Actualiza perfil del doctor.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | El propio doctor, `superadmin` |

**URL Parameters:** `id` — ID del doctor

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `biography` | string | ❌ | Biografía |
| `consultationFee` | float | ❌ | Tarifa de consulta |
| `specialty` | string | ❌ | Especialidad |

**Errores:** `403` No es el doctor o superadmin, `404` Doctor no encontrado

---

#### 4.4.4 GET /api/doctors/{id}/patients

Lista pacientes asignados al doctor.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | El propio doctor, `clinic_admin` (misma clínica), `superadmin` |

**URL Parameters:** `id` — ID del doctor

**Query Parameters:** `search`, `page`, `limit`

---

#### 4.4.5 POST /api/doctors/{id}/patients

Asigna un paciente al doctor.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | El propio doctor, `clinic_admin`, `superadmin` |

**URL Parameters:** `id` — ID del doctor

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `patientId` | string | ✅ | ID del paciente |

**Errores:** `409` Paciente ya asignado, `404` Paciente no encontrado

---

#### 4.4.6 GET /api/doctors/{id}/schedule

Obtiene el horario del doctor.

| Propiedad | Valor |
|---|---|
| **Autenticación** | No requerida (público) |
| **Roles** | Público |

**URL Parameters:** `id` — ID del doctor

**Respuesta:** `{ doctorId, doctorName, specialty, schedule }`

---

#### 4.4.7 PUT /api/doctors/{id}/schedule

Actualiza el horario del doctor.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | El propio doctor, `superadmin` |

**URL Parameters:** `id` — ID del doctor

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `schedule` | object | ✅ | Horario JSON válido |

**Formato del schedule:**
```json
{
  "lunes": { "start": "08:00", "end": "17:00", "teleconsult": true },
  "martes": { "start": "08:00", "end": "17:00", "teleconsult": false },
  "miercoles": { "start": "08:00", "end": "13:00", "teleconsult": true }
}
```

**Errores:** `422` Horario debe ser JSON válido

---

#### 4.4.8 GET /api/doctors/{id}/appointments

Lista citas del doctor.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Doctor, `clinic_admin`, `receptionist`, `superadmin` |

**URL Parameters:** `id` — ID del doctor

**Query Parameters:** `date`, `status`, `page`, `limit`

---

### 4.5 Recetas Médicas

#### 4.5.1 POST /api/doctor/prescriptions

Crea una receta médica con uno o más medicamentos.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `doctor`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `patientId` | string | ✅ | ID del paciente |
| `diagnosis` | string | ❌ | Diagnóstico |
| `notes` | string | ❌ | Notas |
| `items` | array | ✅ | Lista de medicamentos |
| `items[].medicationId` | string | ✅ | ID del medicamento |
| `items[].dosage` | string | ✅ | Dosis (ej: "1 tableta cada 8 horas") |
| `items[].duration` | string | ❌ | Duración (ej: "7 días") |
| `items[].quantity` | number | ✅ | Cantidad |
| `items[].instructions` | string | ❌ | Instrucciones adicionales |
| `items[].isControlled` | boolean | ❌ | Medicamento controlado |

**Respuesta (201):** Receta con items, datos de paciente y doctor, `verificationCode` generado automáticamente.

**Ejemplo curl:**

```bash
curl -X POST http://localhost:3000/api/doctor/prescriptions \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "clx_patient",
    "diagnosis": "Hipertensión arterial",
    "notes": "Control en 2 semanas",
    "items": [
      {
        "medicationId": "clx_med1",
        "dosage": "1 tableta cada 12 horas",
        "duration": "30 días",
        "quantity": 60,
        "instructions": "Tomar con alimentos"
      }
    ]
  }'
```

**Errores:** `403` Solo doctores, `404` Paciente/medicamento no encontrado, `422` Validación

---

#### 4.5.2 GET /api/doctor/prescriptions

Lista recetas médicas.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `doctor` (solo las suyas), `patient` (solo las suyas), `clinic_admin`, `superadmin` |

**Query Parameters:** `patientId`, `status`, `page`, `limit`

---

#### 4.5.3 GET /api/doctor/prescriptions/{id}

Obtiene detalle completo de una receta.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Doctor que la emitió, paciente, `clinic_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la receta

**Respuesta:** Receta con items, medicamentos (incluyendo `controlledSubstance`, `controlledLevel`), paciente, doctor y clínica.

---

#### 4.5.4 PUT /api/doctor/prescriptions/{id}

Actualiza una receta activa.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Doctor que la emitió, `superadmin` |

**URL Parameters:** `id` — ID de la receta

**Request Body:** `diagnosis`, `notes`, `status`

**Errores:** `400` Solo se pueden actualizar recetas activas, `403` Solo el doctor que emitió la receta

---

#### 4.5.5 POST /api/doctor/prescriptions/{id}/sign

Firma digitalmente una receta activa.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Doctor que la emitió, `superadmin` |

**URL Parameters:** `id` — ID de la receta

**Respuesta:** Receta firmada con `signatureInfo: { signedBy, signedAt, signatureHash }`

**Errores:** `400` Receta ya firmada o no activa

---

#### 4.5.6 GET /api/prescriptions/{id}/verify

Verifica la autenticidad y validez de una receta médica.

| Propiedad | Valor |
|---|---|
| **Autenticación** | No requerida (público) |
| **Roles** | Público |

**URL Parameters:** `id` — ID de la receta

**Query Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `code` | string | ✅ | Código de verificación |
| `patientId` | string | ❌ | Verificar que coincide con paciente |

**Respuesta Exitosa:**

```json
{
  "valid": true,
  "prescription": {
    "id": "clx...",
    "date": "2025-01-01",
    "diagnosis": "Hipertensión",
    "isControlled": false,
    "status": "active",
    "validUntil": "2025-02-01",
    "refillsRemaining": 2,
    "isSigned": true,
    "hasRefills": true,
    "patient": { "id": "clx...", "name": "Carlos Pérez" },
    "doctor": { "id": "clx...", "name": "Dr. García", "licenseNumber": "MED-12345" },
    "items": [...]
  }
}
```

**Errores:** `400` Código no coincide / receta cancelada/expirada, `404` Receta no encontrada, `422` Código requerido

---

#### 4.5.7 POST /api/clinical-check/interactions

Verifica interacciones medicamentosas, alergias y contraindicaciones.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `doctor`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `patientId` | string | ✅ | ID del paciente |
| `medicationIds` | string[] | ✅ | IDs de medicamentos a verificar |

**Respuesta:**

```json
{
  "safe": false,
  "warnings": [
    {
      "type": "allergy",
      "severity": "high",
      "message": "El paciente es alérgico a la Penicilina",
      "medicationId": "clx..."
    },
    {
      "type": "interaction",
      "severity": "medium",
      "message": "Interacción entre Medicamento A y Medicamento B",
      "medicationId": "clx..."
    }
  ],
  "summary": {
    "totalWarnings": 2,
    "highSeverity": 1,
    "mediumSeverity": 1,
    "lowSeverity": 0
  }
}
```

**Tipos de advertencias:** `allergy`, `interaction`, `controlled`, `contraindication`
**Severidades:** `high`, `medium`, `low`

---

### 4.6 Teleconsulta

#### 4.6.1 POST /api/appointments/{id}/start-teleconsult

Inicia una teleconsulta, generando un enlace de Jitsi Meet.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `doctor`, `clinic_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la cita

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "teleconsultLink": "https://meet.jit.si/oasis-teleconsult-clx123",
    "appointmentId": "clx...",
    "status": "in_progress"
  }
}
```

**Errores:** `400` La cita no es de teleconsulta, `403` Sin permisos, `404` Cita no encontrada

---

#### 4.6.2 GET /api/appointments/{id}/teleconsult-link

Obtiene el enlace de la teleconsulta.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Doctor, paciente de la cita, `clinic_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la cita

**Respuesta:** `{ teleconsultLink, appointmentId, status }`

**Errores:** `400` No se ha iniciado la teleconsulta, `404` Cita no encontrada

---

### 4.7 Pacientes Admin

#### 4.7.1 GET /api/patients

Lista pacientes según el rol del usuario.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados (doctor ve los suyos, clinic_admin ve los de su clínica, superadmin ve todos) |

**Query Parameters:** `search` (nombre, email, teléfono, póliza, ciudad), `page`, `limit`

```bash
curl "http://localhost:3000/api/patients?search=carlos&page=1&limit=20" \
  -H "Authorization: Bearer <accessToken>"
```

---

#### 4.7.2 GET /api/patients/{id}

Obtiene perfil completo del paciente con familiares, doctores y seguros.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | El propio paciente, doctor asignado, `clinic_admin`, `receptionist`, `superadmin` |

**URL Parameters:** `id` — ID del paciente

**Respuesta:** Paciente con `familyMembers`, `doctorPatients` (con datos de doctor), `insurances`

---

#### 4.7.3 PUT /api/patients/{id}

Actualiza perfil del paciente.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | El propio paciente, doctor asignado, `clinic_admin`, `superadmin` |

**URL Parameters:** `id` — ID del paciente

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `address` | string | ❌ | Dirección |
| `phone` | string | ❌ | Teléfono |
| `allergies` | array | ❌ | Lista de alergias (JSON) |
| `chronicConditions` | array | ❌ | Condiciones crónicas (JSON) |

---

#### 4.7.4 GET /api/patients/{id}/history

Historial clínico unificado.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | El propio paciente, doctor asignado, `clinic_admin`, `superadmin` |

**URL Parameters:** `id` — ID del paciente

**Respuesta:**

```json
{
  "patient": {
    "id": "clx...",
    "dateOfBirth": "1990-05-15",
    "gender": "male",
    "bloodType": "O+",
    "allergies": ["Penicilina"],
    "chronicConditions": ["Hipertensión"],
    "emergencyContact": { "name": "Ana", "phone": "+505...", "relationship": "esposa" }
  },
  "prescriptions": [...],
  "appointments": [...],
  "summary": {
    "totalPrescriptions": 10,
    "activePrescriptions": 3,
    "totalAppointments": 15,
    "completedAppointments": 12,
    "upcomingAppointments": 2,
    "pendingRefillRequests": 1
  }
}
```

---

### 4.8 Paciente App

#### 4.8.1 GET /api/patient/family-members

Lista familiares del paciente.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `patient`, `superadmin` |

---

#### 4.8.2 POST /api/patient/family-members

Agrega un familiar al perfil del paciente.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `patient`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `name` | string | ✅ | Nombre del familiar |
| `relationship` | string | ✅ | Parentesco (hijo, hija, padre, madre, esposo/a, otro) |
| `dateOfBirth` | string | ❌ | Fecha de nacimiento |
| `gender` | string | ❌ | Género |
| `bloodType` | string | ❌ | Tipo de sangre |
| `allergies` | array | ❌ | Alergias |

**Ejemplo curl:**

```bash
curl -X POST http://localhost:3000/api/patient/family-members \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana López","relationship":"esposa","bloodType":"A+","gender":"female"}'
```

---

#### 4.8.3 PUT /api/patient/family-members/{memberId}

Actualiza datos de un familiar.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `patient`, `superadmin` |

**URL Parameters:** `memberId` — ID del familiar

**Request Body:** Mismos campos que POST (todos opcionales).

---

#### 4.8.4 DELETE /api/patient/family-members/{memberId}

Elimina un familiar del perfil del paciente.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `patient`, `superadmin` |

**URL Parameters:** `memberId` — ID del familiar

---

#### 4.8.5 GET /api/patient/search-medications

Busca medicamentos por nombre, genérico o marca. Con coordenadas muestra farmacias cercanas con stock.

| Propiedad | Valor |
|---|---|
| **Autenticación** | Opcional (mejora resultados si autenticado) |
| **Roles** | Público |

**Query Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `q` | string | ✅ | Búsqueda (mínimo 2 caracteres) |
| `lat` | float | ❌ | Latitud del usuario |
| `lng` | float | ❌ | Longitud del usuario |
| `radius` | float | ❌ | Radio de búsqueda en km (default: 10) |

**Respuesta:** Medicamentos con `minPrice`, `availablePharmacies`, y lista de farmacias con `distance`, `sellingPrice`, `quantity`, `expiryDate`.

```bash
curl "http://localhost:3000/api/patient/search-medications?q=amoxicilina&lat=12.136&lng=-86.251"
```

---

#### 4.8.6 GET /api/patient/nearby-pharmacies

Busca farmacias cercanas con inventario activo.

| Propiedad | Valor |
|---|---|
| **Autenticación** | Opcional |
| **Roles** | Público |

**Query Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `lat` | float | ✅ | Latitud |
| `lng` | float | ✅ | Longitud |
| `radius` | float | ❌ | Radio en km (default: 10) |
| `medicationId` | string | ❌ | Filtrar por disponibilidad de medicamento |

**Respuesta:** Farmacias con `distance`, `activeInventoryCount`, `paymentMethods`, `deliverySettings`, y si se filtra por medicamento: `medicationAvailable`, `medicationPrice`, `medicationQuantity`.

**Errores:** `422` lat y lng requeridos

---

#### 4.8.7 GET /api/patient/nearby-clinics

Busca clínicas cercanas con doctores y servicios.

| Propiedad | Valor |
|---|---|
| **Autenticación** | Opcional |
| **Roles** | Público |

**Query Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `lat` | float | ✅ | Latitud |
| `lng` | float | ✅ | Longitud |
| `radius` | float | ❌ | Radio en km (default: 10) |
| `specialty` | string | ❌ | Filtrar por especialidad |

**Respuesta:** Clínicas con distancia, conteo de doctores/servicios, lista de doctores, `telemedicineEnabled`.

**Errores:** `422` lat y lng requeridos

---

#### 4.8.8 GET /api/patient/prescriptions

Lista recetas del paciente.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `patient`, `doctor`, `superadmin` |

**Query Parameters:** `status`, `page`, `limit`

**Respuesta:** Recetas con doctor, items, medicamentos y última solicitud de recarga.

---

#### 4.8.9 POST /api/patient/prescriptions/{id}/request-refill

Solicita una recarga de receta médica.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `patient`, `superadmin` |

**URL Parameters:** `id` — ID de la receta

**Request Body:** `notes` (opcional)

**Proceso:** Decrementa `refillsRemaining`, crea `RefillRequest`, notifica al doctor.

**Errores:** `400` Receta no activa / sin recargas / expirada, `403` Receta no te pertenece, `409` Solicitud pendiente ya existe

---

#### 4.8.10 GET /api/patient/refill-reminders

Lista recordatorios de recarga de medicamentos.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `patient`, `superadmin` |

**Respuesta:** Lista de recordatorios de recarga con datos de receta y medicamento.

---

#### 4.8.11 GET /api/patient/appointments

Lista citas del paciente.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `patient`, `doctor`, `superadmin` |

**Query Parameters:** `status`, `page`, `limit`

---

#### 4.8.12 POST /api/patient/appointments

Agenda una cita médica.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `patient`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `clinicId` | string | ✅ | ID de la clínica |
| `doctorId` | string | ✅ | ID del doctor |
| `date` | string | ✅ | Fecha |
| `startTime` | string | ✅ | Hora inicio |
| `endTime` | string | ✅ | Hora fin |
| `serviceId` | string | ❌ | ID del servicio |

**Proceso:** Crea cita, establece relación doctor-paciente (upsert), notifica al doctor.

**Errores:** `409` Conflicto de horario, `404` Clínica/doctor/servicio no encontrado

---

#### 4.8.13 GET /api/patient/loyalty

Obtiene información del programa de lealtad.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `patient`, `superadmin` |

**Respuesta:**

```json
{
  "points": 3500,
  "level": "plata",
  "levelInfo": { "name": "plata", "multiplier": 1.5, "pointsRange": "2000 - 4999" },
  "nextLevel": { "name": "oro", "pointsNeeded": 1500, "multiplier": 2 },
  "stats": { "totalOrders": 15, "totalSpent": 8500, "totalPointsEarned": 3500 },
  "benefits": ["1.5 puntos por cada córdoba", "Descuento 5%", "Envío gratis >C$500"]
}
```

**Niveles:** bronce (0-1999, ×1), plata (2000-4999, ×1.5), oro (5000-9999, ×2), diamante (10000+, ×3)

---

#### 4.8.14 GET /api/patient/insurance

Lista pólizas de seguro del paciente.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `patient`, `superadmin` |

**Respuesta:** Lista de pólizas de seguro con `provider`, `policyNumber`, `coverageDetails`, `copayPercentage`, `isActive`, `validUntil`.

---

#### 4.8.15 POST /api/patient/insurance

Agrega una póliza de seguro.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `patient`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `provider` | string | ✅ | Proveedor del seguro |
| `policyNumber` | string | ✅ | Número de póliza |
| `copayPercentage` | float | ❌ | Porcentaje de copago |
| `coverageDetails` | object | ❌ | Detalles de cobertura (JSON) |

**Errores:** `409` Número de póliza ya existe, `422` Validación

---

#### 4.8.16 POST /api/patient/emergency

Botón de emergencia — envía alerta con ubicación.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `patient`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `latitude` | float | ✅ | Latitud actual |
| `longitude` | float | ✅ | Longitud actual |

**Proceso:** Crea notificación de emergencia, notifica a contacto de emergencia y doctores asignados.

**Respuesta:** `{ success: true, data: { message: "Alerta de emergencia enviada" } }`

---

### 4.9 Farmacias

#### 4.9.1 GET /api/pharmacies

Lista farmacias.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**Query Parameters:** `search`, `city`, `department`, `page`, `limit`

```bash
curl "http://localhost:3000/api/pharmacies?city=Managua" \
  -H "Authorization: Bearer <accessToken>"
```

---

#### 4.9.2 POST /api/pharmacies

Crea una nueva farmacia.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `superadmin`, `pharmacy_admin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `name` | string | ✅ | Nombre de la farmacia |
| `phone` | string | ❌ | Teléfono |
| `email` | string | ❌ | Email |
| `address` | string | ❌ | Dirección |
| `city` | string | ❌ | Ciudad |
| `latitude` | float | ❌ | Latitud GPS |
| `longitude` | float | ❌ | Longitud GPS |

**Errores:** `403` Sin permisos, `422` Nombre requerido

---

#### 4.9.3 GET /api/pharmacies/{id}

Obtiene detalles de una farmacia.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**URL Parameters:** `id` — ID de la farmacia

**Respuesta:** Farmacia con `admins`, `branches`, `_count`, `staff`

---

#### 4.9.4 PUT /api/pharmacies/{id}

Actualiza datos de una farmacia.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la farmacia

**Request Body:** Mismos campos que POST (todos opcionales).

---

#### 4.9.5 DELETE /api/pharmacies/{id}

Desactiva una farmacia (soft delete).

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `superadmin` |

**URL Parameters:** `id` — ID de la farmacia

**Errores:** `403` Solo superadmin, `404` No encontrada

---

#### 4.9.6 GET /api/pharmacies/{id}/branches

Lista sucursales de una farmacia.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**URL Parameters:** `id` — ID de la farmacia

---

#### 4.9.7 POST /api/pharmacies/{id}/branches

Crea una sucursal para una farmacia.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la farmacia

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `name` | string | ✅ | Nombre de la sucursal |
| `address` | string | ❌ | Dirección |
| `city` | string | ❌ | Ciudad |

---

#### 4.9.8 GET /api/pharmacies/{id}/inventory

Inventario de una farmacia.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `pharmacy_staff`, `superadmin` |

**URL Parameters:** `id` — ID de la farmacia

**Query Parameters:** `include_branches`, `search`

**Respuesta:** Lista de lotes de inventario con datos de medicamento, cantidad, precio, fecha de vencimiento.

---

#### 4.9.9 GET /api/pharmacies/{id}/staff

Lista personal de la farmacia.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la farmacia

---

#### 4.9.10 POST /api/pharmacies/{id}/staff

Agrega personal a la farmacia.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la farmacia

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `name` | string | ✅ | Nombre |
| `email` | string | ✅ | Email (único) |
| `password` | string | ✅ | Contraseña |
| `phone` | string | ❌ | Teléfono |
| `role` | string | ✅ | Rol del staff (vendedor, cajero, auxiliar) |

---

#### 4.9.11 GET /api/pharmacies/{id}/promotions

Lista promociones de la farmacia.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**URL Parameters:** `id` — ID de la farmacia

---

#### 4.9.12 POST /api/pharmacies/{id}/promotions

Crea una promoción/cupón.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la farmacia

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `name` | string | ✅ | Nombre de la promoción |
| `type` | string | ✅ | Tipo: `percentage`, `fixed`, `bogo`, `loyalty_discount` |
| `value` | float | ✅ | Valor del descuento |
| `code` | string | ❌ | Código de cupón |
| `startDate` | string | ✅ | Fecha inicio |
| `endDate` | string | ✅ | Fecha fin |
| `minPurchase` | float | ❌ | Compra mínima |

---

#### 4.9.13 POST /api/pharmacies/branches/transfer-stock

Transfiere stock entre sucursales/farmacias.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `fromPharmacyId` | string | ✅ | Farmacia origen |
| `toPharmacyId` | string | ✅ | Farmacia destino |
| `medicationId` | string | ✅ | ID del medicamento |
| `batchNumber` | string | ✅ | Número de lote |
| `quantity` | integer | ✅ | Cantidad a transferir |

**Errores:** `400` Stock insuficiente, `404` Farmacia/lote no encontrado

---

### 4.10 Inventario

#### 4.10.1 POST /api/pharmacy/inventory

Agrega un lote de medicamentos al inventario.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `pharmacy_staff`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `pharmacyId` | string | ✅ | ID de la farmacia |
| `medicationId` | string | ✅ | ID del medicamento |
| `batchNumber` | string | ✅ | Número de lote |
| `quantity` | integer | ✅ | Cantidad |
| `expiryDate` | string | ✅ | Fecha de vencimiento |
| `costPrice` | float | ✅ | Precio de costo |
| `sellingPrice` | float | ✅ | Precio de venta |

**Errores:** `404` Farmacia/medicamento no encontrado, `409` Lote duplicado, `422` Validación

---

#### 4.10.2 PUT /api/pharmacy/inventory

Actualiza un lote de inventario.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `batchId` | string | ✅ | ID del lote |
| `quantity` | integer | ❌ | Nueva cantidad |
| `sellingPrice` | float | ❌ | Nuevo precio de venta |

**Errores:** `404` Lote no encontrado

---

#### 4.10.3 GET /api/pharmacy/inventory/expiring

Lista lotes próximos a vencer.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `superadmin` |

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `days` | integer | Días hasta vencimiento (default: 90) |
| `pharmacyId` | string | Filtrar por farmacia |

**Respuesta:** Lista de lotes con datos de medicamento y farmacia, ordenados por fecha de vencimiento.

---

#### 4.10.4 GET /api/pharmacy/medications

Catálogo de medicamentos del sistema.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**Query Parameters:** `search`, `category`

---

#### 4.10.5 POST /api/pharmacy/medications

Crea un nuevo medicamento en el catálogo.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `name` | string | ✅ | Nombre del medicamento |
| `genericName` | string | ❌ | Nombre genérico |
| `dosageForm` | string | ❌ | Forma (tablet, capsule, syrup, etc.) |
| `strength` | string | ❌ | Concentración (500mg, 10ml, etc.) |
| `requiresPrescription` | boolean | ❌ | Requiere receta (default: false) |
| `category` | string | ❌ | Categoría |

---

#### 4.10.6 GET /api/pharmacy/medications/{id}

Detalle de un medicamento.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**URL Parameters:** `id` — ID del medicamento

---

#### 4.10.7 PUT /api/pharmacy/medications/{id}

Actualiza un medicamento del catálogo.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `superadmin` |

**URL Parameters:** `id` — ID del medicamento

**Request Body:** Mismos campos que POST (todos opcionales).

---

### 4.11 Proveedores

#### 4.11.1 GET /api/pharmacy/suppliers

Lista proveedores.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `superadmin` |

**Query Parameters:** `pharmacyId`

---

#### 4.11.2 POST /api/pharmacy/suppliers

Crea un proveedor.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `pharmacyId` | string | ✅ | ID de la farmacia |
| `name` | string | ✅ | Nombre del proveedor |
| `contactName` | string | ❌ | Nombre del contacto |
| `phone` | string | ❌ | Teléfono |
| `email` | string | ❌ | Email |

---

#### 4.11.3 GET /api/pharmacy/purchase-orders

Lista órdenes de compra.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `superadmin` |

**Query Parameters:** `pharmacyId`, `status`

---

#### 4.11.4 POST /api/pharmacy/purchase-orders

Crea una orden de compra.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `pharmacyId` | string | ✅ | ID de la farmacia |
| `supplierId` | string | ✅ | ID del proveedor |
| `items` | array | ✅ | Lista de items |
| `items[].medicationId` | string | ✅ | ID del medicamento |
| `items[].quantity` | integer | ✅ | Cantidad |
| `items[].unitCost` | float | ✅ | Costo unitario |

---

#### 4.11.5 GET /api/pharmacy/purchase-orders/{id}

Detalle de una orden de compra.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la orden de compra

**Respuesta:** Orden con items, proveedor y datos de farmacia.

---

#### 4.11.6 PUT /api/pharmacy/purchase-orders/{id}/receive

Recibe mercancía de una orden de compra.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la orden de compra

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `items` | array | ✅ | Lista de items recibidos |
| `items[].medicationId` | string | ✅ | ID del medicamento |
| `items[].receivedQuantity` | integer | ✅ | Cantidad recibida |
| `items[].batchNumber` | string | ❌ | Número de lote |
| `items[].expiryDate` | string | ❌ | Fecha de vencimiento |

**Proceso:** Crea lotes de inventario, actualiza estado de la orden.

---

### 4.12 Reportes Farmacia

#### 4.12.1 GET /api/pharmacies/{id}/reports/sales

Reporte de ventas de la farmacia.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la farmacia

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `from` | string | Fecha inicio |
| `to` | string | Fecha fin |
| `groupBy` | string | `medication`, `category`, `day` |

**Respuesta:** `{ pharmacy, period, summary: { totalSales, totalItems, averageTicket }, groups }`

---

#### 4.12.2 GET /api/pharmacies/{id}/reports/top-customers

Top clientes de la farmacia.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la farmacia

**Query Parameters:** `from`, `to`, `limit`

---

#### 4.12.3 GET /api/pharmacies/{id}/reports/stock-value

Valor del inventario actual.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la farmacia

**Respuesta:** `{ totalCostValue, totalSellingValue, potentialProfit, batchCount, medicationCount, lowStockItems, expiringItems }`

---

### 4.13 Órdenes y Pagos

#### 4.13.1 GET /api/orders

Lista órdenes.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados (paciente ve las suyas, farmacia las de su farmacia, superadmin todas) |

**Query Parameters:** `patientId`, `pharmacyId`, `status`, `page`, `limit`

---

#### 4.13.2 POST /api/orders

Crea una orden de compra de medicamentos.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `patient`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `patientId` | string | ✅ | ID del paciente |
| `pharmacyId` | string | ✅ | ID de la farmacia |
| `items` | array | ✅ | Lista de medicamentos |
| `items[].medicationId` | string | ✅ | ID del medicamento |
| `items[].quantity` | integer | ✅ | Cantidad |
| `paymentMethod` | string | ✅ | Método: `cash`, `card_online`, `card_on_delivery`, `insurance` |
| `deliveryType` | string | ❌ | `delivery` o `pickup` (default: delivery) |
| `deliveryAddress` | string | ❌ | Dirección de entrega |
| `prescriptionId` | string | ❌ | ID de receta asociada |

**Ejemplo curl:**

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "clx_patient",
    "pharmacyId": "clx_pharmacy",
    "items": [
      {"medicationId": "clx_med1", "quantity": 2}
    ],
    "paymentMethod": "cash",
    "deliveryType": "delivery",
    "deliveryAddress": "Casa #15, Barrio Centro, Managua"
  }'
```

**Errores:** `404` Farmacia/medicamento no encontrado, `422` Sin items, `409` Medicamento requiere receta

---

#### 4.13.3 GET /api/orders/{id}

Detalle de una orden.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Paciente dueño, farmacia, superadmin |

**URL Parameters:** `id` — ID de la orden

**Respuesta:** Orden con items, medicamentos, datos de paciente, farmacia, delivery e invoice.

---

#### 4.13.4 PUT /api/orders/{id}

Actualiza estado de una orden.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `pharmacy_staff`, `superadmin` |

**URL Parameters:** `id` — ID de la orden

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `status` | string | ✅ | Nuevo estado: `confirmed`, `preparing`, `ready`, `delivering`, `delivered`, `cancelled` |

**Errores:** `400` Transición de estado inválida, `403` Sin permisos

---

#### 4.13.5 POST /api/orders/{id}/return

Solicita una devolución.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `patient`, `superadmin` |

**URL Parameters:** `id` — ID de la orden

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `reason` | string | ✅ | Motivo de la devolución |

**Errores:** `400` Orden no elegible para devolución, `403` No es tu orden

---

#### 4.13.6 GET /api/pharmacy/returns

Lista solicitudes de devolución.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `pharmacy_staff`, `superadmin` |

**Query Parameters:** `pharmacyId`, `status`

---

#### 4.13.7 PUT /api/pharmacy/returns/{id}/approve

Aprueba o rechaza una devolución.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `pharmacy_admin`, `superadmin` |

**URL Parameters:** `id` — ID de la devolución

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `approved` | boolean | ✅ | Aprobar o rechazar |
| `returnToStock` | boolean | ❌ | Devolver al inventario |
| `refundAmount` | float | ❌ | Monto de reembolso |

---

#### 4.13.8 POST /api/payments/process

Procesa un pago.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `orderId` | string | ❌ | ID de la orden (si aplica) |
| `invoiceId` | string | ❌ | ID de la factura (si aplica) |
| `amount` | float | ✅ | Monto |
| `paymentMethod` | string | ✅ | Método de pago |

**Respuesta:** `{ transaction: { id, amount, currency, status, transactionRef }, message }`

---

#### 4.13.9 GET /api/invoices

Lista facturas.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados (filtra según rol) |

**Query Parameters:** `patientId`, `clinicId`, `pharmacyId`, `page`, `limit`

---

#### 4.13.10 GET /api/invoices/{id}

Detalle de una factura.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados (según contexto) |

**URL Parameters:** `id` — ID de la factura

**Respuesta:** Factura con datos completos de items, paciente, entidad emisora.

---

#### 4.13.11 GET /api/invoices/{id}/pdf

Obtiene datos para generar PDF de la factura.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados (según contexto) |

**URL Parameters:** `id` — ID de la factura

**Respuesta:** Datos estructurados para renderizar PDF de la factura.

---

### 4.14 Delivery

#### 4.14.1 POST /api/delivery/register

Registra un repartidor con sus datos de vehículo.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `delivery_person`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `vehicleType` | string | ❌ | `moto`, `bicicleta`, `auto`, `a_pie` |
| `plateNumber` | string | ❌ | Número de placa |
| `zones` | array | ❌ | Zonas de cobertura |
| `isInternal` | boolean | ❌ | Empleado de farmacia (default: false) |
| `pharmacyId` | string | ❌ | Si es interno, ID de la farmacia |

---

#### 4.14.2 PUT /api/delivery/availability

Cambia disponibilidad del repartidor.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `delivery_person`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `isAvailable` | boolean | ✅ | Disponibilidad actual |

---

#### 4.14.3 GET /api/delivery/available-orders

Lista órdenes disponibles para entrega.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `delivery_person`, `superadmin` |

**Respuesta:** Lista de órdenes listas para entrega con datos de farmacia y dirección.

---

#### 4.14.4 POST /api/delivery/accept-order

Acepta una orden para entrega.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `delivery_person`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `orderId` | string | ✅ | ID de la orden |

**Proceso:** Crea registro de `Delivery`, cambia estado de la orden a `delivering`.

**Errores:** `409` Orden ya asignada, `400` Orden no disponible

---

#### 4.14.5 POST /api/delivery/order/{orderId}/proof

Sube comprobante de entrega.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `delivery_person`, `superadmin` |

**URL Parameters:** `orderId` — ID de la orden

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `proofPhotoUrl` | string | ❌ | URL de foto de comprobante |
| `signatureUrl` | string | ❌ | URL de firma digital |

**Proceso:** Marca delivery como entregado, actualiza estado de la orden.

---

#### 4.14.6 POST /api/delivery/order/{orderId}/failed-delivery

Reporta entrega fallida.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `delivery_person`, `superadmin` |

**URL Parameters:** `orderId` — ID de la orden

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `reason` | string | ✅ | Motivo del fallo |

---

#### 4.14.7 PUT /api/delivery/order/{orderId}/collect-cash

Registra cobro de efectivo.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `delivery_person`, `superadmin` |

**URL Parameters:** `orderId` — ID de la orden

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `amount` | float | ✅ | Monto cobrado |

---

#### 4.14.8 GET /api/delivery/earnings

Obtiene ganancias del repartidor.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `delivery_person`, `superadmin` |

**Query Parameters:** `from`, `to`

**Respuesta:** `{ totalEarnings, deliveryCount, averageEarningPerDelivery, deliveries: [...] }`

---

#### 4.14.9 GET /api/delivery/route/{orderId}

Obtiene ruta optimizada para la entrega.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `delivery_person`, `superadmin` |

**URL Parameters:** `orderId` — ID de la orden

**Respuesta:** `{ route, distance, estimatedTime, waypoints }`

---

### 4.15 Chat

#### 4.15.1 POST /api/chats

Inicia una conversación.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `patient`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `doctorId` | string | ❌ | ID del doctor (para chat paciente-doctor) |
| `pharmacyId` | string | ❌ | ID de la farmacia (para chat paciente-farmacia) |
| `clinicId` | string | ❌ | ID de la clínica (para chat paciente-clínica) |
| `type` | string | ✅ | `patient_doctor`, `patient_pharmacy`, `patient_clinic` |

**Respuesta:** Chat creado o existente con datos del participante.

---

#### 4.15.2 GET /api/chats

Lista conversaciones del usuario.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**Query Parameters:** `type`, `page`, `limit`

**Respuesta:** Lista de chats con último mensaje y datos del participante.

---

#### 4.15.3 GET /api/chats/{id}

Detalle de una conversación.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Participantes del chat, `superadmin` |

**URL Parameters:** `id` — ID del chat

---

#### 4.15.4 POST /api/chats/{id}/messages

Envía un mensaje en una conversación.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Participantes del chat, `superadmin` |

**URL Parameters:** `id` — ID del chat

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `message` | string | ✅ | Contenido del mensaje |
| `attachment` | string | ❌ | URL de archivo adjunto |

---

#### 4.15.5 GET /api/chats/{id}/messages

Obtiene mensajes de una conversación.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Participantes del chat, `superadmin` |

**URL Parameters:** `id` — ID del chat

**Query Parameters:** `before` (cursor para paginación), `limit`

**Respuesta:** Lista de mensajes con datos del remitente, ordenados por fecha.

---

#### 4.15.6 PUT /api/chats/{id}/read

Marca mensajes como leídos.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Participantes del chat |

**URL Parameters:** `id` — ID del chat

---

### 4.16 Notificaciones

#### 4.16.1 GET /api/notifications

Lista notificaciones del usuario.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**Query Parameters:** `type`, `isRead`, `page`, `limit`

---

#### 4.16.2 POST /api/notifications

Crea una notificación.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `superadmin`, `clinic_admin`, `pharmacy_admin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `userId` | string | ✅ | ID del usuario destinatario |
| `title` | string | ✅ | Título |
| `message` | string | ✅ | Contenido |
| `type` | string | ✅ | `appointment`, `medication`, `order`, `system`, `emergency` |

---

#### 4.16.3 PUT /api/notifications/{id}/read

Marca una notificación como leída.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Dueño de la notificación |

**URL Parameters:** `id` — ID de la notificación

---

#### 4.16.4 PUT /api/notifications/read-all

Marca todas las notificaciones como leídas.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

---

#### 4.16.5 POST /api/notifications/register-device

Registra token FCM para notificaciones push.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `fcmToken` | string | ✅ | Firebase Cloud Messaging token |

---

### 4.17 Reseñas

#### 4.17.1 POST /api/reviews

Crea una reseña.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `patient`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `targetType` | string | ✅ | `doctor`, `clinic`, `pharmacy`, `delivery_person`, `order` |
| `targetId` | string | ✅ | ID de la entidad reseñada |
| `rating` | integer | ✅ | Calificación 1-5 |
| `comment` | string | ❌ | Comentario |

**Errores:** `409` Ya reseñaste esta entidad, `422` Validación

---

#### 4.17.2 GET /api/reviews

Lista reseñas. Endpoint público.

| Propiedad | Valor |
|---|---|
| **Autenticación** | No requerida (público) |
| **Roles** | Público |

**Query Parameters:** `targetType`, `targetId`, `page`, `limit`

---

#### 4.17.3 GET /api/reviews/{id}

Detalle de una reseña.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**URL Parameters:** `id` — ID de la reseña

---

#### 4.17.4 PUT /api/reviews/{id}

Actualiza una reseña propia.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Dueño de la reseña, `superadmin` |

**URL Parameters:** `id` — ID de la reseña

**Request Body:** `rating`, `comment` (opcionales)

---

#### 4.17.5 DELETE /api/reviews/{id}

Elimina una reseña.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Dueño de la reseña, `superadmin` |

**URL Parameters:** `id` — ID de la reseña

---

### 4.18 Citas y Servicios

#### 4.18.1 GET /api/appointments

Lista citas.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados (filtra según rol) |

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `clinicId` | string | Filtrar por clínica |
| `doctorId` | string | Filtrar por doctor |
| `patientId` | string | Filtrar por paciente |
| `date` | string | Filtrar por fecha |
| `status` | string | Filtrar por estado |
| `page` | integer | Página |
| `limit` | integer | Items por página |

---

#### 4.18.2 GET /api/appointments/{id}

Detalle de una cita.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Participantes de la cita, `clinic_admin`, `receptionist`, `superadmin` |

**URL Parameters:** `id` — ID de la cita

**Respuesta:** Cita con datos de paciente, doctor, clínica, servicio e invoice.

---

#### 4.18.3 PUT /api/appointments/{id}

Actualiza una cita.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `clinic_admin`, `receptionist`, `doctor`, `superadmin` |

**URL Parameters:** `id` — ID de la cita

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `status` | string | ❌ | Nuevo estado |
| `cancellationReason` | string | ❌ | Motivo de cancelación |

**Errores:** `400` Transición de estado inválida, `403` Sin permisos

---

#### 4.18.4 GET /api/services

Lista servicios.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**Query Parameters:** `clinicId`, `page`, `limit`

---

#### 4.18.5 POST /api/services

Crea un servicio.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `clinic_admin`, `superadmin` |

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `clinicId` | string | ✅ | ID de la clínica |
| `name` | string | ✅ | Nombre del servicio |
| `duration` | integer | ❌ | Duración en minutos |
| `price` | float | ❌ | Precio |

---

#### 4.18.6 GET /api/services/{id}

Detalle de un servicio.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**URL Parameters:** `id` — ID del servicio

---

#### 4.18.7 PUT /api/services/{id}

Actualiza un servicio.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `clinic_admin`, `superadmin` |

**URL Parameters:** `id` — ID del servicio

**Request Body:** `name`, `duration`, `price` (opcionales)

---

#### 4.18.8 DELETE /api/services/{id}

Elimina un servicio (soft delete).

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `clinic_admin`, `superadmin` |

**URL Parameters:** `id` — ID del servicio

---

### 4.19 Medicamentos Público

#### 4.19.1 GET /api/medications

Busca medicamentos. Endpoint público.

| Propiedad | Valor |
|---|---|
| **Autenticación** | No requerida (público) |
| **Roles** | Público |

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `search` | string | Buscar por nombre |
| `category` | string | Filtrar por categoría |
| `requiresPrescription` | boolean | Filtrar por requiere receta |

```bash
curl "http://localhost:3000/api/medications?search=amoxicilina&category=antibióticos"
```

---

#### 4.19.2 GET /api/medications/{id}

Detalle de un medicamento. Endpoint público.

| Propiedad | Valor |
|---|---|
| **Autenticación** | No requerida (público) |
| **Roles** | Público |

**URL Parameters:** `id` — ID del medicamento

---

#### 4.19.3 PUT /api/medications/{id}

Actualiza un medicamento.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | `superadmin` |

**URL Parameters:** `id` — ID del medicamento

**Request Body:** Campos actualizables del medicamento.

---

### 4.20 Seguros

#### 4.20.1 GET /api/insurance/estimate

Estima el copago del seguro.

| Propiedad | Valor |
|---|---|
| **Autenticación** | ✅ Requerida |
| **Roles** | Todos los autenticados |

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `service_type` | string | Tipo de servicio (consultation, medication, etc.) |
| `clinic_id` | string | ID de la clínica |
| `medication_ids` | string | IDs de medicamentos (separados por coma) |

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "estimatedCost": 500,
    "copayAmount": 100,
    "copayPercentage": 20,
    "insuranceCoverage": 400,
    "provider": "Seguro Nicaragüense",
    "policyNumber": "POL-12345"
  }
}
```

---

### 4.21 Root

#### 4.21.1 GET /api

Health check del API.

| Propiedad | Valor |
|---|---|
| **Autenticación** | No requerida |
| **Roles** | Público |

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "name": "OASIS API",
    "version": "1.0.0",
    "description": "Tu Base de Salud — Plataforma de Salud Nicaragüense",
    "status": "healthy",
    "endpoints": 142,
    "modules": 22
  }
}
```

```bash
curl http://localhost:3000/api
```

---

## 5. Esquema de Base de Datos

### Resumen: 36 Tablas

| # | Tabla | Descripción | Relaciones principales |
|---|---|---|---|
| 1 | `User` | Usuarios del sistema | → Doctor, Patient, ClinicAdmin, Receptionist, PharmacyAdmin, PharmacyStaff, DeliveryPerson, Message, AuditLog, Notification |
| 2 | `ClinicAdmin` | Admin de clínica | → User, Clinic |
| 3 | `Clinic` | Clínicas y sucursales | → ClinicAdmin, Receptionist, Doctor, Service, Appointment, Invoice, AuditLog, Chat |
| 4 | `Receptionist` | Recepcionistas | → User, Clinic |
| 5 | `Doctor` | Doctores | → User, Clinic, Prescription, Appointment, DoctorPatient, Chat |
| 6 | `Patient` | Pacientes | → User, FamilyMember, DoctorPatient, Prescription, Appointment, Order, Insurance, Chat, Review, RefillRequest |
| 7 | `FamilyMember` | Familiares del paciente | → Patient |
| 8 | `DoctorPatient` | Relación doctor-paciente | → Doctor, Patient |
| 9 | `Pharmacy` | Farmacias y sucursales | → PharmacyAdmin, PharmacyStaff, InventoryBatch, Supplier, PurchaseOrder, Order, Chat, Promotion |
| 10 | `PharmacyAdmin` | Admin de farmacia | → User, Pharmacy |
| 11 | `PharmacyStaff` | Staff de farmacia | → User, Pharmacy |
| 12 | `Medication` | Catálogo de medicamentos | → PrescriptionItem, OrderItem, InventoryBatch, PurchaseOrderItem, PromotionItem |
| 13 | `InventoryBatch` | Lotes de inventario | → Pharmacy, Medication, Supplier |
| 14 | `Supplier` | Proveedores | → Pharmacy, InventoryBatch, PurchaseOrder |
| 15 | `PurchaseOrder` | Órdenes de compra | → Pharmacy, Supplier, PurchaseOrderItem |
| 16 | `PurchaseOrderItem` | Items de orden de compra | → PurchaseOrder, Medication |
| 17 | `Prescription` | Recetas médicas | → Doctor, Patient, PrescriptionItem, RefillRequest |
| 18 | `PrescriptionItem` | Items de receta | → Prescription, Medication |
| 19 | `RefillRequest` | Solicitudes de recarga | → Prescription, Patient |
| 20 | `Service` | Servicios de clínica | → Clinic, Appointment |
| 21 | `Appointment` | Citas médicas | → Clinic, Doctor, Patient, Service, Invoice |
| 22 | `Order` | Órdenes de medicamentos | → Patient, Pharmacy, OrderItem, Delivery, ReturnRequest, Invoice |
| 23 | `OrderItem` | Items de orden | → Order, Medication |
| 24 | `DeliveryPerson` | Repartidores | → User, Delivery |
| 25 | `Delivery` | Entregas | → Order, DeliveryPerson |
| 26 | `Chat` | Conversaciones | → Patient, Doctor, Clinic, Pharmacy, Message |
| 27 | `Message` | Mensajes de chat | → Chat, User (sender) |
| 28 | `Invoice` | Facturas | → Appointment, Order, Clinic, ReturnRequest |
| 29 | `ReturnRequest` | Solicitudes de devolución | → Order, Invoice |
| 30 | `Review` | Reseñas | → Patient |
| 31 | `Insurance` | Pólizas de seguro | → Patient |
| 32 | `Promotion` | Promociones/cupones | → Pharmacy, PromotionItem |
| 33 | `PromotionItem` | Items de promoción | → Promotion, Medication |
| 34 | `Notification` | Notificaciones | → User |
| 35 | `AuditLog` | Registro de auditoría | → User, Clinic |
| 36 | `PaymentTransaction` | Transacciones de pago | (independiente, referencia orderId/invoiceId) |

### Detalle de Campos por Tabla

#### User
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | String | @id @default(cuid()) |
| `email` | String | @unique |
| `password` | String | — |
| `name` | String | — |
| `phone` | String? | — |
| `role` | String | superadmin, clinic_admin, receptionist, doctor, patient, pharmacy_admin, pharmacy_staff, delivery_person |
| `avatarUrl` | String? | — |
| `isActive` | Boolean | @default(true) |
| `emailVerified` | Boolean | @default(false) |
| `phoneVerified` | Boolean | @default(false) |
| `refreshToken` | String? | — |
| `resetPasswordToken` | String? | — |
| `resetPasswordExpires` | DateTime? | — |
| `fcmToken` | String? | — |
| `createdAt` | DateTime | @default(now()) |
| `updatedAt` | DateTime | @updatedAt |

#### Clinic
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | String | @id @default(cuid()) |
| `name` | String | — |
| `description` | String? | — |
| `logoUrl` | String? | — |
| `phone` | String? | — |
| `email` | String? | — |
| `website` | String? | — |
| `parentClinicId` | String? | FK → Clinic (autosreferencia) |
| `address` | String? | — |
| `city` | String? | — |
| `department` | String? | — |
| `latitude` | Float? | — |
| `longitude` | Float? | — |
| `settings` | String? | JSON |
| `isActive` | Boolean | @default(true) |
| `createdAt` | DateTime | @default(now()) |
| `updatedAt` | DateTime | @updatedAt |

#### Doctor
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | String | @id @default(cuid()) |
| `userId` | String | @unique, FK → User |
| `clinicId` | String | FK → Clinic |
| `specialty` | String | — |
| `licenseNumber` | String | @unique |
| `digitalSignatureCert` | String? | — |
| `schedule` | String? | JSON |
| `biography` | String? | — |
| `consultationFee` | Float | @default(0) |
| `rating` | Float | @default(0) |
| `totalReviews` | Int | @default(0) |
| `isActive` | Boolean | @default(true) |

#### Patient
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | String | @id @default(cuid()) |
| `userId` | String | @unique, FK → User |
| `dateOfBirth` | DateTime? | — |
| `gender` | String? | male, female, other |
| `bloodType` | String? | — |
| `allergies` | String? | JSON array |
| `chronicConditions` | String? | JSON array |
| `emergencyContact` | String? | JSON { name, phone, relationship } |
| `familyGroupId` | String? | — |
| `insuranceProvider` | String? | — |
| `insurancePolicyNumber` | String? | — |
| `address` | String? | — |
| `city` | String? | — |
| `department` | String? | — |
| `latitude` | Float? | — |
| `longitude` | Float? | — |
| `loyaltyPoints` | Int | @default(0) |
| `loyaltyLevel` | String | @default("bronce") — bronce, plata, oro, diamante |
| `isActive` | Boolean | @default(true) |

#### Pharmacy
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | String | @id @default(cuid()) |
| `name` | String | — |
| `description` | String? | — |
| `logoUrl` | String? | — |
| `phone` | String? | — |
| `email` | String? | — |
| `website` | String? | — |
| `parentPharmacyId` | String? | FK → Pharmacy (autosreferencia) |
| `address` | String? | — |
| `city` | String? | — |
| `department` | String? | — |
| `latitude` | Float? | — |
| `longitude` | Float? | — |
| `deliverySettings` | String? | JSON |
| `paymentMethods` | String? | JSON |
| `isActive` | Boolean | @default(true) |

#### Medication
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | String | @id @default(cuid()) |
| `name` | String | — |
| `genericName` | String? | — |
| `brand` | String? | — |
| `description` | String? | — |
| `dosageForm` | String? | tablet, capsule, syrup, injection, etc. |
| `strength` | String? | 500mg, 10ml, etc. |
| `manufacturer` | String? | — |
| `requiresPrescription` | Boolean | @default(false) |
| `controlledSubstance` | Boolean | @default(false) |
| `controlledLevel` | String? | I, II, III, IV, V |
| `interactionGroups` | String? | JSON array |
| `sideEffects` | String? | JSON array |
| `contraindications` | String? | JSON array |
| `category` | String? | — |
| `imageUrl` | String? | — |
| `isActive` | Boolean | @default(true) |

#### InventoryBatch
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | String | @id @default(cuid()) |
| `pharmacyId` | String | FK → Pharmacy |
| `medicationId` | String | FK → Medication |
| `batchNumber` | String | — |
| `quantity` | Int | @default(0) |
| `expiryDate` | DateTime | — |
| `costPrice` | Float | @default(0) |
| `sellingPrice` | Float | @default(0) |
| `supplierId` | String? | FK → Supplier |
| `minStockAlert` | Int | @default(10) |
| `maxStock` | Int | @default(1000) |
| `location` | String? | Estante/bodega |
| `isActive` | Boolean | @default(true) |
| `receivedAt` | DateTime | @default(now()) |
| **Unique** | | `@@unique([pharmacyId, medicationId, batchNumber])` |

#### Appointment
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | String | @id @default(cuid()) |
| `clinicId` | String | FK → Clinic |
| `doctorId` | String | FK → Doctor |
| `patientId` | String | FK → Patient |
| `familyMemberId` | String? | — |
| `serviceId` | String? | FK → Service |
| `date` | DateTime | — |
| `startTime` | String | "09:00" |
| `endTime` | String | "09:30" |
| `status` | String | scheduled, confirmed, checked_in, in_progress, completed, cancelled, no_show |
| `type` | String | @default("presencial") — presencial, teleconsult |
| `teleconsultLink` | String? | — |
| `notes` | String? | — |
| `cancellationReason` | String? | — |

#### Order
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | String | @id @default(cuid()) |
| `patientId` | String | FK → Patient |
| `pharmacyId` | String | FK → Pharmacy |
| `prescriptionId` | String? | — |
| `status` | String | pending, confirmed, preparing, ready, delivering, delivered, cancelled, returned |
| `paymentMethod` | String | @default("cash") — cash, card_online, card_on_delivery, insurance |
| `paymentStatus` | String | @default("pending") — pending, paid, failed, refunded |
| `insuranceClaimId` | String? | — |
| `subtotal` | Float | @default(0) |
| `deliveryFee` | Float | @default(0) |
| `tipAmount` | Float | @default(0) |
| `totalAmount` | Float | @default(0) |
| `deliveryType` | String | @default("delivery") — delivery, pickup |
| `deliveryAddress` | String? | — |
| `deliveryLatitude` | Float? | — |
| `deliveryLongitude` | Float? | — |
| `loyaltyPointsEarned` | Int | @default(0) |

#### Prescription
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | String | @id @default(cuid()) |
| `doctorId` | String | FK → Doctor |
| `patientId` | String | FK → Patient |
| `familyMemberId` | String? | — |
| `date` | DateTime | @default(now()) |
| `diagnosis` | String? | — |
| `notes` | String? | — |
| `digitalSignature` | String? | Hash de firma digital |
| `isControlled` | Boolean | @default(false) |
| `validUntil` | DateTime? | — |
| `refillsRemaining` | Int | @default(0) |
| `verificationCode` | String? | @unique |
| `status` | String | @default("active") — active, dispensed, expired, cancelled |

#### Delivery / DeliveryPerson
| Campo (DeliveryPerson) | Tipo | Restricciones |
|---|---|---|
| `id` | String | @id @default(cuid()) |
| `userId` | String | @unique, FK → User |
| `vehicleType` | String? | moto, bicicleta, auto, a_pie |
| `plateNumber` | String? | — |
| `availabilitySchedule` | String? | JSON |
| `zones` | String? | JSON array |
| `rating` | Float | @default(0) |
| `totalReviews` | Int | @default(0) |
| `isVerified` | Boolean | @default(false) |
| `idDocument` | String? | — |
| `earningsBalance` | Float | @default(0) |
| `isActive` | Boolean | @default(true) |
| `isAvailable` | Boolean | @default(false) — disponibilidad en tiempo real |
| `isInternal` | Boolean | @default(false) |
| `pharmacyId` | String? | — |

#### Invoice
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | String | @id @default(cuid()) |
| `appointmentId` | String? | @unique, FK → Appointment |
| `orderId` | String? | @unique, FK → Order |
| `clinicId` | String? | FK → Clinic |
| `pharmacyId` | String? | — |
| `patientId` | String | — |
| `invoiceNumber` | String | @unique |
| `type` | String | @default("consultation") — consultation, medication, mixed |
| `subtotal` | Float | @default(0) |
| `tax` | Float | @default(0) |
| `discount` | Float | @default(0) |
| `total` | Float | @default(0) |
| `paymentMethod` | String | @default("cash") |
| `paymentStatus` | String | @default("pending") — pending, paid, partial, refunded |
| `insuranceAmount` | Float? | — |
| `copayAmount` | Float? | — |
| `pdfUrl` | String? | — |

#### Review
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | String | @id @default(cuid()) |
| `patientId` | String | FK → Patient |
| `targetType` | String | doctor, clinic, pharmacy, delivery_person, order |
| `targetId` | String | Polimórfico |
| `rating` | Int | 1-5 |
| `comment` | String? | — |
| `isActive` | Boolean | @default(true) |

#### Notification
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | String | @id @default(cuid()) |
| `userId` | String | FK → User |
| `title` | String | — |
| `message` | String | — |
| `type` | String | appointment, medication, order, system, emergency |
| `data` | String? | JSON |
| `isRead` | Boolean | @default(false) |
| `sentVia` | String | @default("push") — push, whatsapp, sms, email, in_app |
| `sentAt` | DateTime | @default(now()) |
| `readAt` | DateTime? | — |

#### PaymentTransaction
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | String | @id @default(cuid()) |
| `invoiceId` | String? | — |
| `orderId` | String? | — |
| `amount` | Float | — |
| `currency` | String | @default("NIO") — Córdobas nicaragüenses |
| `paymentMethod` | String | cash, card_online, card_on_delivery, insurance |
| `status` | String | @default("pending") — pending, completed, failed, refunded |
| `gatewayResponse` | String? | JSON |
| `transactionRef` | String? | @unique |
| `processedAt` | DateTime? | — |

---

## 6. Permisos por Rol

### ROLE_PERMISSIONS (Constante del Sistema)

```typescript
const ROLE_PERMISSIONS: Record<string, string[]> = {
  superadmin: ['*'],  // Acceso total

  clinic_admin: [
    'clinic:read', 'clinic:write', 'clinic:delete',
    'doctor:read', 'doctor:write',
    'receptionist:read', 'receptionist:write',
    'appointment:read', 'appointment:write',
    'service:read', 'service:write',
    'report:read', 'audit:read',
    'patient:read',
  ],

  receptionist: [
    'appointment:read', 'appointment:write',
    'patient:read',
    'payment:collect',
    'appointment:reassign',
  ],

  doctor: [
    'patient:read', 'patient:write',
    'prescription:read', 'prescription:write', 'prescription:sign',
    'appointment:read',
    'chat:read', 'chat:write',
    'clinical-check:read',
  ],

  patient: [
    'own:profile', 'own:orders', 'own:appointments',
    'own:prescriptions', 'own:family', 'own:insurance',
    'own:loyalty', 'own:emergency', 'own:chat',
    'medication:search', 'pharmacy:search',
    'review:write',
  ],

  pharmacy_admin: [
    'pharmacy:read', 'pharmacy:write', 'pharmacy:delete',
    'inventory:read', 'inventory:write',
    'supplier:read', 'supplier:write',
    'purchase-order:read', 'purchase-order:write',
    'order:read', 'order:write',
    'staff:read', 'staff:write',
    'report:read', 'promotion:read', 'promotion:write',
    'return:read', 'return:write',
  ],

  pharmacy_staff: [
    'inventory:read', 'inventory:write',
    'order:read', 'order:write',
    'return:read',
    'payment:collect',
  ],

  delivery_person: [
    'delivery:read', 'delivery:write',
    'own:availability', 'own:earnings',
    'own:proof', 'own:route',
  ],
};
```

### Resumen de Accesos por Rol

| Módulo | superadmin | clinic_admin | receptionist | doctor | patient | pharmacy_admin | pharmacy_staff | delivery_person |
|---|---|---|---|---|---|---|---|---|
| Clínicas | CRUD | R/W (suya) | — | — | — | — | — | — |
| Doctores | CRUD | R/W | — | R/W (propio) | — | — | — | — |
| Recepcionistas | CRUD | R/W | R (suya) | — | — | — | — | — |
| Pacientes | CRUD | R | R | R/W (asignados) | R/W (propio) | — | — | — |
| Citas | CRUD | R/W | R/W | R | R/W (propias) | — | — | — |
| Recetas | CRUD | R | — | R/W/Sign | R (propias) | — | — | — |
| Farmacias | CRUD | — | — | — | — | CRUD (suya) | — | — |
| Inventario | CRUD | — | — | — | — | R/W | R/W | — |
| Órdenes | CRUD | — | — | — | R/W (propias) | R/W | R/W | — |
| Delivery | CRUD | — | — | — | — | — | — | R/W (propias) |
| Pagos | CRUD | — | Collect | — | — | — | Collect | — |
| Chat | CRUD | — | — | R/W | R/W | — | — | — |
| Reseñas | CRUD | — | — | — | R/W | — | — | — |
| Notificaciones | CRUD | — | — | — | — | — | — | — |
| Reportes | R | R | — | — | — | R | — | — |
| Medicamentos | CRUD | — | — | — | Search | — | — | — |
| Seguros | R | — | — | — | R/W | — | — | — |
| Promociones | CRUD | — | — | — | — | R/W | — | — |
| Proveedores | CRUD | — | — | — | — | R/W | — | — |
| Devoluciones | CRUD | — | — | — | Solicitar | R/W | R | — |
| Auditoría | R | R | — | — | — | — | — | — |

---

## 7. PROMPT PARA IA — CONSTRUIR FRONTEND

---

### INSTRUCCIONES PARA IA: Construir el Frontend de OASIS

Eres una IA que va a construir el frontend completo de **OASIS — "Tu Base de Salud"**, una plataforma de salud digital para Nicaragua. Este es un proyecto Next.js 16 con App Router.

#### Arquitectura

- **Frontend:** Next.js 16 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui
- **Backend:** Ya construido — API REST en `/api` con 142 endpoints
- **Base URL:** `/api` (mismo origen, no se necesita CORS)
- **Autenticación:** JWT (access token 15min + refresh token 7d)
- **State Management:** Zustand (auth) + TanStack Query (data)
- **Base de datos:** SQLite con Prisma ORM — 36 tablas

#### Flujo de Autenticación

```
1. POST /api/auth/login → { accessToken, refreshToken, user, roleProfile }
2. Guardar tokens en Zustand + cookies
3. En cada request: Authorization: Bearer <accessToken>
4. Si 401 → POST /api/auth/refresh → nuevo par de tokens
5. Si refresh falla → redirigir a login
```

#### Los 8 Roles y sus Vistas Principales

1. **superadmin** — Dashboard global: métricas de todas las clínicas y farmacias, gestión de usuarios, auditoría, configuración del sistema
2. **clinic_admin** — Dashboard de clínica: doctores, recepcionistas, servicios, citas, reportes de ingresos, auditoría
3. **receptionist** — Panel de recepción: agenda de citas, check-in de pacientes, cobros, reasignación de doctores
4. **doctor** — Panel médico: lista de pacientes, citas del día, recetas médicas, teleconsulta, chat con pacientes, verificación de interacciones
5. **patient** — App de paciente: buscar médicos/farmacias/medicamentos, agendar citas, ver recetas, pedir medicamentos, programa de lealtad, seguros, botón de emergencia, chat
6. **pharmacy_admin** — Dashboard de farmacia: inventario, personal, proveedores, órdenes de compra, promociones, reportes de ventas, devoluciones
7. **pharmacy_staff** — Panel de ventas: inventario, procesar órdenes, dispensar medicamentos
8. **delivery_person** — App de repartidor: disponibilidad, órdenes disponibles, aceptar entregas, comprobante de entrega, ganancias, ruta optimizada

#### Cuentas de Prueba

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

#### Patrones UI Clave

- **Login:** Formulario email/password → POST /api/auth/login → redirect según rol
- **Dashboard por rol:** Cada rol tiene su propio layout/sidebar con navegación específica
- **Tablas con paginación:** Usar TanStack Query + paginación del servidor (page/limit)
- **Formularios:** react-hook-form + zod para validación
- **Notificaciones:** Toast con sonner, badge de notificaciones no leídas
- **Búsqueda:** Debounce en campos de búsqueda con TanStack Query
- **Teleconsulta:** Integración con Jitsi Meet via iframe
- **Mapas:** Para farmacias/clínicas cercanas (lat/lng disponible)
- **Responsive:** Mobile-first, especialmente para paciente y repartidor

#### Endpoints Más Usados por Rol

**Paciente:**
- GET /api/doctors (buscar doctores)
- POST /api/patient/appointments (agendar cita)
- GET /api/patient/prescriptions (mis recetas)
- POST /api/orders (comprar medicamentos)
- GET /api/patient/loyalty (mis puntos)
- GET /api/patient/nearby-pharmacies (farmacias cercanas)

**Doctor:**
- GET /api/doctors/{id}/appointments (mis citas)
- POST /api/doctor/prescriptions (crear receta)
- POST /api/clinical-check/interactions (verificar interacciones)
- POST /api/appointments/{id}/start-teleconsult (iniciar teleconsulta)
- GET /api/doctors/{id}/patients (mis pacientes)

**Recepcionista:**
- GET /api/receptionist/appointments (citas del día)
- POST /api/receptionist/appointments (crear cita)
- POST /api/receptionist/appointments/{id}/checkin (check-in)
- POST /api/receptionist/payments/collect (cobrar)

**Admin Farmacia:**
- GET /api/pharmacies/{id}/inventory (inventario)
- POST /api/pharmacy/inventory (agregar lote)
- GET /api/pharmacy/purchase-orders (órdenes de compra)
- GET /api/pharmacies/{id}/reports/sales (reportes)
- POST /api/pharmacies/{id}/promotions (promociones)

**Repartidor:**
- PUT /api/delivery/availability (cambiar disponibilidad)
- GET /api/delivery/available-orders (órdenes disponibles)
- POST /api/delivery/accept-order (aceptar orden)
- POST /api/delivery/order/{orderId}/proof (comprobante)
- GET /api/delivery/earnings (ganancias)

#### Esquema de Base de Datos (Referencia)

El backend tiene 36 tablas. Las más importantes para el frontend:

- `User` — Autenticación y perfiles (8 roles)
- `Clinic` / `Pharmacy` — Entidades organizacionales con sucursales
- `Doctor` / `Patient` — Perfiles médicos con relaciones
- `Appointment` — Citas con estados (scheduled→confirmed→checked_in→in_progress→completed)
- `Prescription` / `PrescriptionItem` — Recetas con firma digital y código de verificación
- `Order` / `OrderItem` — Órdenes de medicamentos con delivery
- `InventoryBatch` — Inventario por lote con fechas de vencimiento
- `Invoice` / `PaymentTransaction` — Facturación y pagos
- `Delivery` / `DeliveryPerson` — Entregas con comprobante
- `Chat` / `Message` — Mensajería entre pacientes y doctores/farmacias
- `Review` — Reseñas polimórficas (doctor, clínica, farmacia)
- `Notification` — Push notifications con FCM
- `Insurance` — Pólizas de seguro con copago

#### Este manual es la fuente de verdad

Consulta este documento para cualquier detalle sobre endpoints, request/response formats, autenticación, permisos y estructura de datos. Todos los 142 endpoints están documentados con sus parámetros, respuestas y códigos de error.

---

*Documento generado para OASIS v1.0 — Tu Base de Salud, Plataforma de Salud Nicaragüense*
*142 endpoints · 36 tablas · 22 módulos · 8 roles*
