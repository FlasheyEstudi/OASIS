# 🌿 Oasis — Tu Base de Salud

Plataforma healthtech nicaragüense que conecta pacientes, farmacias, clínicas y repartidores en un ecosistema digital 100% real, sin simulaciones.

---

## ⚡ Inicio Rápido (Desarrollo)

```bash
# 1 – Backend
cd Backend
npm install
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts    # poblar datos demo
npm run dev                    # http://localhost:3001

# 2 – Frontend (otra terminal)
cd Frontend
npm install
npx prisma generate
npm run dev                    # http://localhost:3000
```

---

## 🗺️ Motor de Rutas: GraphHopper

Oasis usa **GraphHopper** como motor de cálculo de rutas, 100% gratuito y autoalojable. Soporta múltiples paradas, perfiles de vehículo personalizables (moto, bicicleta, auto) y datos de calles reales de Nicaragua vía OpenStreetMap.

### Opción A — API Pública (Desarrollo inmediato)

1. Regístrate en [graphhopper.com](https://www.graphhopper.com/) y obtén una API key gratuita (500 req/día).
2. Agrega al `Backend/.env`:

```env
GRAPHHOPPER_URL="https://graphhopper.com/api/1"
GRAPHHOPPER_KEY="tu-api-key-aqui"
```

### Opción B — Self-Hosted Docker (Producción / Ilimitado)

```bash
# Descargar mapa de Nicaragua desde Geofabrik y lanzar GraphHopper
bash setup-maps.sh

# O manualmente:
mkdir -p maps
curl -L -o maps/nicaragua-latest.osm.pbf \
  https://download.geofabrik.de/central-america/nicaragua-latest.osm.pbf

docker run -d --name oasis-graphhopper \
  -v $(pwd)/maps:/data \
  -p 8989:8989 \
  graphhopper/graphhopper:latest
```

Luego en `Backend/.env`:

```env
GRAPHHOPPER_URL="http://localhost:8989"
# GRAPHHOPPER_KEY no es necesario en self-hosted
```

### Alternar entre modos

Solo cambia `GRAPHHOPPER_URL` en el `.env`. El código de `src/lib/maps-service.ts` detecta automáticamente si necesita enviar la API key.

### Verificar que funciona

```bash
# Test route: Rotonda El Periodista → Plaza Inter (Managua)
curl "http://localhost:8989/route?point=12.1142,-86.2713&point=12.1245,-86.2660&vehicle=motorcycle"
```

Respuesta esperada: JSON con `paths[0].distance` (metros) y `paths[0].points.coordinates` (GeoJSON).

---

## 🔔 Notificaciones Push (Firebase Cloud Messaging)

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Ve a Configuración del proyecto → Cuentas de servicio → Generar clave privada.
3. Pega el JSON (minificado en una línea) en `Backend/.env`:

```env
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"...",...}'
```

Sin esta variable, las notificaciones se logean en consola (modo desarrollo).

---

## 🐳 Docker Compose (Producción completa)

```bash
cp Backend/.env.example Backend/.env   # editar credenciales
docker compose up -d
```

Servicios:
- `oasis-graphhopper` → http://localhost:8989
- `oasis-backend`     → http://localhost:3001
- `oasis-frontend`    → http://localhost:3000

---

## 🛠️ Variables de Entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión SQLite | `file:./prisma/dev.db` |
| `JWT_SECRET` | Clave JWT (cambiar en prod) | `supersecreto123` |
| `GRAPHHOPPER_URL` | Motor de rutas URL | `http://localhost:8989` |
| `GRAPHHOPPER_KEY` | API key (solo API pública) | `abc123` |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | JSON de cuenta de servicio FCM | `{"type":"service_account"...}` |

---

## 🏗️ Arquitectura

```
OASIS/
├── Backend/        Next.js 16 API (puerto 3001)
│   ├── src/app/api/v1/   Endpoints REST
│   ├── src/lib/
│   │   ├── maps-service.ts   GraphHopper + Nominatim + Haversine
│   │   ├── fcm.ts            Firebase Cloud Messaging
│   │   └── socket-server.ts  Socket.IO (tracking en tiempo real)
│   └── prisma/     Schema PostgreSQL/SQLite
├── Frontend/       Next.js 16 (puerto 3000)
│   └── src/components/oasis/
│       ├── patient/    (PatientNearby, OrderTrackingMap, ...)
│       ├── driver/     (DriverActive, DriverMain, ...)
│       ├── pharmacy/   (POS, Inventory, PharmacyStaff, ...)
│       ├── doctor/     (DoctorAppointments, DoctorPrescriptions, ...)
│       └── shared/     (OasisButton, OasisCard, DropLoader, ...)
├── docker-compose.yml
└── setup-maps.sh   Descarga OSM Nicaragua + inicia GraphHopper
```

---

## 👤 Credenciales Demo

| Rol | Email | Password |
|---|---|---|
| Paciente | juan.perez@demo.com | demo123 |
| Doctor | carlos.lopez@demo.com | demo123 |
| Recepcionista | ana.ruiz@demo.com | demo123 |
| Farmacia Admin | admin.farmacia@demo.com | demo123 |
| Repartidor | luis.rojas@demo.com | demo123 |
| Superadmin | admin@oasis.com | admin123 |
