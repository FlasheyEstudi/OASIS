# 🌿 Documentación Técnica: Oasis Aura Backend

Este documento proporciona una visión técnica completa del backend de **Oasis Aura**, diseñado para que desarrolladores puedan entender, auditar y extender la plataforma sin necesidad de explorar el código fuente inicialmente.

---

## 1. VISTA GENERAL

### Resumen
Oasis Aura es una plataforma de salud integral que conecta pacientes, doctores, clínicas y farmacias. Permite la gestión de citas médicas, generación de recetas digitales firmadas, pedidos de medicamentos con seguimiento en tiempo real, control de inventario FEFO y validación clínica automática de interacciones medicamentosas.

### Stack Tecnológico
*   **Lenguaje:** TypeScript 5.x
*   **Framework:** Next.js 16.1.1 (App Router)
*   **ORM:** Prisma 6.11.1
*   **Base de Datos:** SQLite (Entorno de desarrollo) / PostgreSQL (Recomendado para Prod)
*   **Autenticación:** JWT (JSON Web Tokens) + NextAuth 4.24.11
*   **Comunicación Real-time:** Socket.io 4.8.3
*   **Generación de Documentos:** PDFKit
*   **Notificaciones:** Firebase Cloud Messaging (FCM)
*   **Geolocalización:** GraphHopper API / Nominatim (OSM)

### Arquitectura
El proyecto sigue una arquitectura **basada en Next.js App Router** con separación de responsabilidades:
*   **Capa de Rutas (API):** Define los endpoints y maneja el flujo de entrada/salida.
*   **Capa de Lógica (Lib/Services):** Servicios especializados para mapas, PDFs, notificaciones y utilidades compartidas.
*   **Capa de Datos:** Prisma Client para interactuar con la base de datos de forma segura.
*   **Middlewares:** Control de CORS y pre-flight requests.

### Flujo de Request
1.  **Entrada:** Request HTTP llega al middleware (CORS).
2.  **Auth:** La ruta API valida el token JWT (Header `Authorization` o Cookie `access_token`).
3.  **Validación:** Se extraen y validan parámetros (Zod o validación manual).
4.  **Lógica:** Se ejecuta la lógica de negocio usando Prisma y servicios externos.
5.  **Audit:** Se registra la acción en la tabla `AuditLog`.
6.  **Salida:** Respuesta estandarizada mediante `api-response.ts`.

---

## 2. ESTRUCTURA DE ARCHIVOS

```text
Backend/
├── prisma/                 # Configuración de base de datos
│   ├── schema.prisma       # Modelos de datos y relaciones (Single source of truth)
│   └── seed.ts             # Script de población inicial
├── src/
│   ├── app/
│   │   └── api/            # Endpoints de la API REST
│   │       ├── auth/       # Registro, login, recovery
│   │       ├── v1/         # Endpoints versión 1 (Core del negocio)
│   │       └── route.ts    # Health check principal
│   ├── lib/                # Lógica centralizada y servicios
│   │   ├── api-response.ts # Estandarización de respuestas HTTP
│   │   ├── auth.ts         # Manejo de JWT, roles y permisos
│   │   ├── db.ts           # Instancia única de Prisma Client
│   │   ├── fcm.ts          # Integración con Firebase Push Notifications
│   │   ├── maps-service.ts # Ruteo y geolocalización (GraphHopper)
│   │   ├── pdf-service.ts  # Generación de recetas y facturas PDF
│   │   ├── storage.ts      # Manejo de archivos (Storage en DB)
│   │   └── oasis-utils.ts  # Lógica de lealtad, auditoría y cálculos
│   ├── middleware.ts       # Middleware global (CORS)
│   └── socket-server.ts    # Servidor independiente para tracking en tiempo real
├── .env                    # Variables de entorno críticas
└── package.json            # Dependencias y scripts
```

---

## 3. VARIABLES DE ENTORNO

| Variable | Descripción | Tipo | Ejemplo | Requerida |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | String de conexión a DB | String | `file:./dev.db` | Sí |
| `JWT_SECRET` | Llave para firmar tokens de acceso | String | `oasis-secret-xyz` | Sí |
| `JWT_REFRESH_SECRET` | Llave para tokens de refresco | String | `oasis-refresh-xyz` | Sí |
| `SIGNATURE_SECRET` | Llave para hash de firmas digitales | String | `oasis-sig-key` | No (Default) |
| `GRAPHHOPPER_URL` | Servidor de mapas | URL | `https://graphhopper.com/api/1` | No |
| `GRAPHHOPPER_KEY` | API Key de GraphHopper | String | `abc-123` | Si es Public |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Credenciales de Firebase Admin | JSON String | `{"project_id":...}` | No (Mock dev) |

---

## 4. BASE DE DATOS

El sistema cuenta con más de 30 modelos. Aquí los principales:

### **User**
Almacena la identidad central de cualquier usuario.
*   `id`, `email`, `password` (hashed), `role` (superadmin, doctor, patient, etc.), `fcmToken`, `isActive`.

### **Patient**
Extensión del usuario con datos clínicos.
*   `loyaltyPoints`, `loyaltyLevel` (bronce, plata, oro, diamante), `bloodType`, `allergies` (JSON), `chronicConditions` (JSON).

### **Medication**
Catálogo de productos farmacéuticos.
*   `requiresPrescription` (Boolean), `controlledSubstance` (Boolean), `interactionGroups` (JSON para validación clínica).

### **Prescription**
Recetas emitidas por doctores.
*   `verificationCode` (Unique), `digitalSignature` (Hash criptográfico), `status` (active, expired, used).

### **Order**
Pedidos de farmacia.
*   `status` (pending, paid, preparing, out_for_delivery, delivered), `totalAmount`, `loyaltyPointsEarned`.

### **InventoryBatch**
Control de stock por lotes (FEFO).
*   `expiryDate`, `quantity`, `sellingPrice`.

### Diagrama de Relaciones (Simplificado)
```text
User ──(1:1)──> Patient ──(1:N)──> Prescription ──(1:N)──> PrescriptionItem
User ──(1:1)──> Doctor ──(1:N)──> Prescription
Patient ──(1:N)──> Order ──(1:N)──> OrderItem
Pharmacy ──(1:N)──> InventoryBatch ──(1:1)──> Medication
Order ──(1:1)──> Delivery ──(N:1)──> DeliveryPerson
```

---

## 5. AUTENTICACIÓN

*   **Método:** JWT con expiración de 2h (Access) y 7d (Refresh).
*   **Roles:**
    *   `superadmin`: Acceso total.
    *   `doctor`: Gestiona sus pacientes, crea recetas, chats médicos.
    *   `patient`: Gestiona su perfil, citas, pedidos y familia.
    *   `pharmacy_admin/staff`: Gestiona inventario, pedidos y facturas.
    *   `delivery_person`: Gestiona sus entregas y ubicación en tiempo real.
*   **Seguridad:** Verificación cruzada entre el token JWT y el registro en DB en cada request (`getAuthUserFromHeader`).

---

## 6. MIDDLEWARES

### `middleware.ts`
*   **Función:** Maneja CORS (Cross-Origin Resource Sharing).
*   **Aplicación:** Todas las rutas `/api/:path*`.
*   **Lógica:** Permite métodos GET, POST, PUT, DELETE, OPTIONS y cabeceras de autorización.

---

## 7. API ENDPOINTS (MÁS RELEVANTES)

### [POST] `/api/v1/auth/login`
*   **Qué hace:** Autentica al usuario y devuelve tokens + perfil de rol.
*   **Request Body:** `{"email": "paciente@oasis.com", "password": "password123"}`
*   **Lógica:** Verifica hash con bcrypt, genera JWT, actualiza `refreshToken` en DB y registra auditoría.

### [POST] `/api/v1/orders`
*   **Qué hace:** Crea un pedido de farmacia con validación crítica.
*   **Lógica de Negocio:**
    1. Verifica si requiere receta (si hay medicamentos controlados).
    2. Valida stock en lotes (FEFO - el que expira antes sale primero).
    3. Ejecuta **Transacción Atómica**: Crea orden, descuenta inventario, crea factura, asigna puntos de lealtad.

### [POST] `/api/v1/clinical-check/interactions`
*   **Qué hace:** Verifica riesgos médicos antes de recetar/comprar.
*   **Validaciones:**
    *   Cruza medicamentos con alergias del paciente.
    *   Detecta interacciones entre los medicamentos solicitados (`interactionGroups`).
    *   Cruza con medicamentos de recetas activas que el paciente ya está tomando.

---

## 8. SERVICIOS EXTERNOS

1.  **Firebase Cloud Messaging (FCM):** Notificaciones push. Si falta la API Key, el sistema entra en modo `Mock` (imprime en consola).
2.  **GraphHopper:** Motor de ruteo para repartidores. Incluye algoritmo `Greedy Nearest-Neighbor` para optimizar rutas de múltiples paradas.
3.  **PDFKit:** Generación dinámica de documentos legales (Recetas y Facturas) con inyección de hash de firma digital.

---

## 9. SEGURIDAD

*   **CORS:** Configuración explícita en middleware.
*   **Criptografía:** `bcryptjs` para passwords, `crypto` (HMAC-SHA256) para firmas digitales.
*   **Inyección:** Uso de Prisma ORM que parametriza todas las consultas SQL automáticamente.
*   **Validación:** Verificación de propiedad (ej. un paciente no puede ver recetas de otro a menos que sea su familiar autorizado).

---

## 10. SCRIPTS (package.json)

*   `npm run dev`: Inicia el servidor de desarrollo en puerto 3001.
*   `npm run db:push`: Sincroniza el esquema de Prisma con la DB sin migraciones (rápido para dev).
*   `npm run db:migrate`: Genera y aplica migraciones (producción).
*   `npm run db:seed`: Puebla la base de datos con datos de prueba.

---

## 11. ERRORES Y BUGS DETECTADOS

| Archivo | Problema | Severidad | Solución |
| :--- | :--- | :--- | :--- |
| `clinical-check/interactions/route.ts` | `JSON.parse` inseguro en campos de texto de la DB. | **ALTA** | Usar una utilidad de parseo seguro con `try-catch` o validar con Zod. |
| `orders/route.ts` | `DELIVERY_FEE` es una constante hardcoded de 50. | **MEDIA** | Mover a tabla de configuración de farmacia o variable de entorno. |
| `middleware.ts` | CORS permite `origin: '*'` por defecto. | **MEDIA** | Configurar lista blanca de dominios en producción. |
| `storage-service.ts` | Guarda archivos (Buffer) directamente en la tabla `File` de SQLite. | **ALTA** | En producción, esto causará problemas de performance y tamaño de DB. Migrar a S3/Google Storage. |
| `schema.prisma` | El modelo `Patient` usa `String?` para alergias en lugar de una tabla relacional. | **MEDIA** | Crear tabla `Allergy` para evitar inconsistencias de texto y errores de parseo. |

---

**Nota Final:** El sistema es robusto y está bien estructurado para un MVP avanzado, pero requiere migrar el almacenamiento de archivos y endurecer el parseo de datos JSON en la DB antes de escalar.
