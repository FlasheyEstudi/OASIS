'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle, XCircle, Loader2, Search, Key, Database,
  ArrowRight, Copy, Server, Shield, Activity, PlayCircle,
  BookOpen, Table2, ChevronRight, Link2, Fingerprint, KeyRound,
  Move, ZoomIn, ZoomOut, Maximize2, GitBranch, ArrowLeft,
} from 'lucide-react';

// CONTEOS REALES VERIFICADOS
const TOTAL_ENDPOINTS = 142;  // Metodos HTTP documentados en API_MODULES
const TOTAL_TABLAS = 36;      // Modelos Prisma contados
const TOTAL_MODULOS = 22;     // Carpetas primer nivel bajo /api
const TOTAL_RUTAS = 100;      // Archivos route.ts contados

interface Endpoint {
  method: string;
  path: string;
  description: string;
  auth: boolean;
  roles?: string[];
  body?: string;
  params?: string;
  queryParams?: string;
}

interface ApiModule {
  name: string;
  color: string;
  endpoints: Endpoint[];
}

interface DbField {
  name: string;
  type: string;
  isId?: boolean;
  isUnique?: boolean;
  isOptional?: boolean;
  isList?: boolean;
  default?: string;
  relation?: {
    to: string;
    type: '1:1' | '1:N' | 'N:1' | 'N:M';
    field: string;
  };
}

interface DbTable {
  name: string;
  category: string;
  fields: DbField[];
}

const API_MODULES: ApiModule[] = [
  {
    name: 'Auth',
    color: 'bg-purple-500',
    endpoints: [
      { method: 'POST', path: '/api/auth/register', description: 'Registrar nuevo usuario', auth: false, body: '{"email":"","password":"","name":"","phone":"","role":"patient"}' },
      { method: 'POST', path: '/api/auth/login', description: 'Iniciar sesion', auth: false, body: '{"email":"carlos@email.com","password":"Patient2025!"}' },
      { method: 'POST', path: '/api/auth/refresh', description: 'Refrescar token', auth: true, body: '{"refreshToken":""}' },
      { method: 'GET', path: '/api/auth/me', description: 'Obtener perfil actual', auth: true },
      { method: 'POST', path: '/api/auth/forgot-password', description: 'Solicitar reset de contrasena', auth: false, body: '{"email":"carlos@email.com"}' },
      { method: 'POST', path: '/api/auth/reset-password', description: 'Resetear contrasena con token', auth: false, body: '{"token":"","newPassword":""}' },
    ],
  },
  {
    name: 'Clinicas',
    color: 'bg-teal-500',
    endpoints: [
      { method: 'GET', path: '/api/clinics', description: 'Listar clinicas', auth: true },
      { method: 'POST', path: '/api/clinics', description: 'Crear clinica', auth: true, roles: ['superadmin', 'clinic_admin'], body: '{"name":"","phone":"","email":"","address":"","city":"Managua","department":"Managua","latitude":12.1149,"longitude":-86.2714}' },
      { method: 'GET', path: '/api/clinics/{id}', description: 'Detalle de clinica', auth: true, params: 'id' },
      { method: 'PUT', path: '/api/clinics/{id}', description: 'Actualizar clinica', auth: true, roles: ['clinic_admin', 'superadmin'], params: 'id', body: '{"name":"","phone":""}' },
      { method: 'DELETE', path: '/api/clinics/{id}', description: 'Eliminar clinica', auth: true, roles: ['superadmin'], params: 'id' },
      { method: 'GET', path: '/api/clinics/{id}/branches', description: 'Listar sucursales', auth: true, params: 'id' },
      { method: 'POST', path: '/api/clinics/{id}/branches', description: 'Crear sucursal', auth: true, roles: ['clinic_admin'], params: 'id', body: '{"name":"","address":"","city":""}' },
      { method: 'PUT', path: '/api/clinics/branches/{branchId}', description: 'Actualizar sucursal', auth: true, params: 'branchId', body: '{"name":""}' },
      { method: 'GET', path: '/api/clinics/{id}/doctors', description: 'Doctores de la clinica', auth: true, params: 'id' },
      { method: 'POST', path: '/api/clinics/{id}/doctors', description: 'Agregar doctor', auth: true, roles: ['clinic_admin'], params: 'id', body: '{"userId":"","specialty":"","licenseNumber":""}' },
      { method: 'GET', path: '/api/clinics/{id}/receptionists', description: 'Recepcionistas', auth: true, params: 'id' },
      { method: 'POST', path: '/api/clinics/{id}/receptionists', description: 'Crear recepcionista', auth: true, roles: ['clinic_admin'], params: 'id', body: '{"name":"","email":"","password":"","phone":""}' },
      { method: 'GET', path: '/api/clinics/{id}/services', description: 'Servicios', auth: true, params: 'id' },
      { method: 'POST', path: '/api/clinics/{id}/services', description: 'Crear servicio', auth: true, roles: ['clinic_admin'], params: 'id', body: '{"name":"","duration":30,"price":800}' },
      { method: 'GET', path: '/api/clinics/{id}/reports/revenue', description: 'Reporte de ingresos', auth: true, roles: ['clinic_admin'], params: 'id', queryParams: 'from=&to=&groupBy=doctor' },
      { method: 'GET', path: '/api/clinics/{id}/audit-logs', description: 'Auditoria', auth: true, roles: ['clinic_admin'], params: 'id' },
    ],
  },
  {
    name: 'Recepcionista',
    color: 'bg-pink-500',
    endpoints: [
      { method: 'GET', path: '/api/receptionist/appointments', description: 'Citas del recepcionista', auth: true, roles: ['receptionist'], queryParams: 'date=&status=&clinicId=' },
      { method: 'POST', path: '/api/receptionist/appointments', description: 'Agendar cita para paciente', auth: true, roles: ['receptionist'], body: '{"clinicId":"","doctorId":"","patientId":"","date":"2025-02-01","startTime":"09:00","endTime":"09:30"}' },
      { method: 'PUT', path: '/api/receptionist/appointments/{id}/confirm', description: 'Confirmar cita', auth: true, roles: ['receptionist'], params: 'id' },
      { method: 'POST', path: '/api/receptionist/appointments/{id}/checkin', description: 'Marcar llegada del paciente', auth: true, roles: ['receptionist'], params: 'id' },
      { method: 'POST', path: '/api/receptionist/payments/collect', description: 'Cobrar consulta', auth: true, roles: ['receptionist'], body: '{"appointmentId":"","paymentMethod":"cash","amount":800}' },
      { method: 'POST', path: '/api/receptionist/assign-doctor', description: 'Reasignar citas masivamente', auth: true, roles: ['receptionist'], body: '{"fromDoctorId":"","toDoctorId":""}' },
    ],
  },
  {
    name: 'Doctores',
    color: 'bg-blue-500',
    endpoints: [
      { method: 'GET', path: '/api/doctors', description: 'Listar doctores', auth: false, queryParams: 'clinicId=&specialty=' },
      { method: 'GET', path: '/api/doctors/{id}', description: 'Perfil del doctor', auth: false, params: 'id' },
      { method: 'PUT', path: '/api/doctors/{id}', description: 'Actualizar perfil', auth: true, roles: ['doctor'], params: 'id', body: '{"biography":"","consultationFee":900}' },
      { method: 'GET', path: '/api/doctors/{id}/patients', description: 'Pacientes asignados', auth: true, roles: ['doctor'], params: 'id' },
      { method: 'POST', path: '/api/doctors/{id}/patients', description: 'Asignar paciente', auth: true, roles: ['doctor'], params: 'id', body: '{"patientId":""}' },
      { method: 'GET', path: '/api/doctors/{id}/schedule', description: 'Horario del doctor', auth: true, params: 'id' },
      { method: 'PUT', path: '/api/doctors/{id}/schedule', description: 'Actualizar horario', auth: true, roles: ['doctor'], params: 'id', body: '{"schedule":{"lunes":{"start":"08:00","end":"17:00"}}}' },
      { method: 'GET', path: '/api/doctors/{id}/appointments', description: 'Citas del doctor', auth: true, params: 'id', queryParams: 'date=&status=' },
    ],
  },
  {
    name: 'Recetas Medicas',
    color: 'bg-amber-500',
    endpoints: [
      { method: 'POST', path: '/api/doctor/prescriptions', description: 'Crear receta', auth: true, roles: ['doctor'], body: '{"patientId":"","diagnosis":"","items":[{"medicationId":"","dosage":"1 tableta cada 8 horas","duration":"7 dias","quantity":21}]}' },
      { method: 'GET', path: '/api/doctor/prescriptions', description: 'Listar recetas del doctor', auth: true, roles: ['doctor'], queryParams: 'patientId=' },
      { method: 'GET', path: '/api/doctor/prescriptions/{id}', description: 'Detalle de receta', auth: true, params: 'id' },
      { method: 'PUT', path: '/api/doctor/prescriptions/{id}', description: 'Actualizar receta', auth: true, roles: ['doctor'], params: 'id', body: '{"notes":"","status":"active"}' },
      { method: 'POST', path: '/api/doctor/prescriptions/{id}/sign', description: 'Firmar receta digitalmente', auth: true, roles: ['doctor'], params: 'id' },
      { method: 'GET', path: '/api/prescriptions/{id}/verify', description: 'Verificar autenticidad de receta', auth: false, params: 'id', queryParams: 'patientId=&code=' },
      { method: 'POST', path: '/api/clinical-check/interactions', description: 'Verificar interacciones y alergias', auth: true, roles: ['doctor'], body: '{"patientId":"","medicationIds":["",""]}' },
    ],
  },
  {
    name: 'Teleconsulta',
    color: 'bg-indigo-500',
    endpoints: [
      { method: 'POST', path: '/api/appointments/{id}/start-teleconsult', description: 'Iniciar teleconsulta', auth: true, roles: ['doctor', 'clinic_admin'], params: 'id' },
      { method: 'GET', path: '/api/appointments/{id}/teleconsult-link', description: 'Obtener link de teleconsulta', auth: true, params: 'id' },
    ],
  },
  {
    name: 'Pacientes',
    color: 'bg-green-500',
    endpoints: [
      { method: 'GET', path: '/api/patients', description: 'Listar pacientes', auth: true, queryParams: 'search=&page=1&limit=20' },
      { method: 'GET', path: '/api/patients/{id}', description: 'Perfil del paciente', auth: true, params: 'id' },
      { method: 'PUT', path: '/api/patients/{id}', description: 'Actualizar paciente', auth: true, params: 'id', body: '{"address":"","phone":""}' },
      { method: 'GET', path: '/api/patients/{id}/history', description: 'Historial clinico unificado', auth: true, params: 'id' },
    ],
  },
  {
    name: 'Paciente (App)',
    color: 'bg-emerald-500',
    endpoints: [
      { method: 'GET', path: '/api/patient/family-members', description: 'Listar familiares', auth: true, roles: ['patient'] },
      { method: 'POST', path: '/api/patient/family-members', description: 'Agregar familiar', auth: true, roles: ['patient'], body: '{"name":"","relationship":"hijo","dateOfBirth":"2015-05-10","gender":"female"}' },
      { method: 'PUT', path: '/api/patient/family-members/{memberId}', description: 'Actualizar familiar', auth: true, roles: ['patient'], params: 'memberId', body: '{"name":""}' },
      { method: 'DELETE', path: '/api/patient/family-members/{memberId}', description: 'Eliminar familiar', auth: true, roles: ['patient'], params: 'memberId' },
      { method: 'GET', path: '/api/patient/search-medications', description: 'Buscar medicamentos (publico)', auth: false, queryParams: 'q=ibuprofeno&lat=12.1149&lng=-86.2714&radius=10' },
      { method: 'GET', path: '/api/patient/nearby-pharmacies', description: 'Farmacias cercanas', auth: false, queryParams: 'lat=12.1149&lng=-86.2714&radius=10' },
      { method: 'GET', path: '/api/patient/nearby-clinics', description: 'Clinicas cercanas', auth: false, queryParams: 'lat=12.1149&lng=-86.2714&radius=10' },
      { method: 'GET', path: '/api/patient/prescriptions', description: 'Recetas del paciente', auth: true, roles: ['patient'], queryParams: 'status=active' },
      { method: 'POST', path: '/api/patient/prescriptions/{id}/request-refill', description: 'Solicitar resurtido', auth: true, roles: ['patient'], params: 'id' },
      { method: 'GET', path: '/api/patient/refill-reminders', description: 'Recordatorios de resurtido', auth: true, roles: ['patient'] },
      { method: 'GET', path: '/api/patient/appointments', description: 'Citas del paciente', auth: true, roles: ['patient'] },
      { method: 'POST', path: '/api/patient/appointments', description: 'Agendar cita', auth: true, roles: ['patient'], body: '{"clinicId":"","doctorId":"","date":"2025-02-01","startTime":"09:00","endTime":"09:30"}' },
      { method: 'GET', path: '/api/patient/loyalty', description: 'Puntos de lealtad', auth: true, roles: ['patient'] },
      { method: 'GET', path: '/api/patient/insurance', description: 'Polizas de seguro', auth: true, roles: ['patient'] },
      { method: 'POST', path: '/api/patient/insurance', description: 'Agregar seguro', auth: true, roles: ['patient'], body: '{"provider":"","policyNumber":"","copayPercentage":20}' },
      { method: 'POST', path: '/api/patient/emergency', description: 'Boton de emergencia', auth: true, roles: ['patient'], body: '{"latitude":12.1149,"longitude":-86.2714}' },
    ],
  },
  {
    name: 'Farmacias',
    color: 'bg-red-500',
    endpoints: [
      { method: 'GET', path: '/api/pharmacies', description: 'Listar farmacias', auth: true },
      { method: 'POST', path: '/api/pharmacies', description: 'Crear farmacia', auth: true, roles: ['superadmin', 'pharmacy_admin'], body: '{"name":"","phone":"","email":"","address":"","city":"Managua","latitude":12.1364,"longitude":-86.2514}' },
      { method: 'GET', path: '/api/pharmacies/{id}', description: 'Detalle de farmacia', auth: true, params: 'id' },
      { method: 'PUT', path: '/api/pharmacies/{id}', description: 'Actualizar farmacia', auth: true, roles: ['pharmacy_admin'], params: 'id', body: '{"name":"","phone":""}' },
      { method: 'DELETE', path: '/api/pharmacies/{id}', description: 'Eliminar farmacia', auth: true, roles: ['superadmin'], params: 'id' },
      { method: 'GET', path: '/api/pharmacies/{id}/branches', description: 'Sucursales', auth: true, params: 'id' },
      { method: 'POST', path: '/api/pharmacies/{id}/branches', description: 'Crear sucursal', auth: true, roles: ['pharmacy_admin'], params: 'id', body: '{"name":"","address":"","city":""}' },
      { method: 'GET', path: '/api/pharmacies/{id}/inventory', description: 'Inventario de farmacia', auth: true, params: 'id', queryParams: 'include_branches=true&search=' },
      { method: 'GET', path: '/api/pharmacies/{id}/staff', description: 'Personal de farmacia', auth: true, params: 'id' },
      { method: 'POST', path: '/api/pharmacies/{id}/staff', description: 'Agregar personal', auth: true, roles: ['pharmacy_admin'], params: 'id', body: '{"name":"","email":"","password":"","phone":"","role":"vendedor"}' },
      { method: 'GET', path: '/api/pharmacies/{id}/promotions', description: 'Promociones', auth: true, params: 'id' },
      { method: 'POST', path: '/api/pharmacies/{id}/promotions', description: 'Crear promocion', auth: true, roles: ['pharmacy_admin'], params: 'id', body: '{"name":"","type":"percentage","value":15,"code":"","startDate":"2025-01-01","endDate":"2025-12-31"}' },
      { method: 'POST', path: '/api/pharmacies/branches/transfer-stock', description: 'Transferir stock entre sucursales', auth: true, roles: ['pharmacy_admin'], body: '{"fromPharmacyId":"","toPharmacyId":"","medicationId":"","batchNumber":"","quantity":10}' },
    ],
  },
  {
    name: 'Inventario y Lotes',
    color: 'bg-orange-500',
    endpoints: [
      { method: 'POST', path: '/api/pharmacy/inventory', description: 'Agregar lote de inventario', auth: true, roles: ['pharmacy_admin', 'pharmacy_staff'], body: '{"pharmacyId":"","medicationId":"","batchNumber":"","quantity":100,"expiryDate":"2026-06-30","costPrice":30,"sellingPrice":60}' },
      { method: 'PUT', path: '/api/pharmacy/inventory', description: 'Actualizar lote', auth: true, roles: ['pharmacy_admin'], body: '{"batchId":"","quantity":50,"sellingPrice":65}' },
      { method: 'GET', path: '/api/pharmacy/inventory/expiring', description: 'Lotes por caducar', auth: true, roles: ['pharmacy_admin'], queryParams: 'days=30&pharmacyId=' },
      { method: 'GET', path: '/api/pharmacy/medications', description: 'Catalogo de medicamentos', auth: true, queryParams: 'search=&category=' },
      { method: 'POST', path: '/api/pharmacy/medications', description: 'Crear medicamento', auth: true, roles: ['superadmin'], body: '{"name":"","genericName":"","dosageForm":"tableta","strength":"500mg","requiresPrescription":true,"category":""}' },
      { method: 'GET', path: '/api/pharmacy/medications/{id}', description: 'Detalle de medicamento', auth: true, params: 'id' },
      { method: 'PUT', path: '/api/pharmacy/medications/{id}', description: 'Actualizar medicamento', auth: true, roles: ['superadmin'], params: 'id', body: '{"name":""}' },
    ],
  },
  {
    name: 'Proveedores y Compras',
    color: 'bg-cyan-500',
    endpoints: [
      { method: 'GET', path: '/api/pharmacy/suppliers', description: 'Listar proveedores', auth: true, queryParams: 'pharmacyId=' },
      { method: 'POST', path: '/api/pharmacy/suppliers', description: 'Crear proveedor', auth: true, roles: ['pharmacy_admin'], body: '{"pharmacyId":"","name":"","contactName":"","phone":"","email":""}' },
      { method: 'GET', path: '/api/pharmacy/purchase-orders', description: 'Listar ordenes de compra', auth: true, queryParams: 'pharmacyId=&status=' },
      { method: 'POST', path: '/api/pharmacy/purchase-orders', description: 'Crear orden de compra', auth: true, roles: ['pharmacy_admin'], body: '{"pharmacyId":"","supplierId":"","items":[{"medicationId":"","quantity":50,"unitCost":30}]}' },
      { method: 'GET', path: '/api/pharmacy/purchase-orders/{id}', description: 'Detalle de orden', auth: true, params: 'id' },
      { method: 'PUT', path: '/api/pharmacy/purchase-orders/{id}/receive', description: 'Recibir mercancia', auth: true, roles: ['pharmacy_admin'], params: 'id', body: '{"items":[{"medicationId":"","receivedQuantity":50,"batchNumber":"","expiryDate":"2026-06-30"}]}' },
    ],
  },
  {
    name: 'Reportes Farmacia',
    color: 'bg-lime-600',
    endpoints: [
      { method: 'GET', path: '/api/pharmacies/{id}/reports/sales', description: 'Reporte de ventas', auth: true, roles: ['pharmacy_admin'], params: 'id', queryParams: 'from=&to=&groupBy=product' },
      { method: 'GET', path: '/api/pharmacies/{id}/reports/top-customers', description: 'Mejores clientes', auth: true, roles: ['pharmacy_admin'], params: 'id', queryParams: 'from=&to=&limit=10' },
      { method: 'GET', path: '/api/pharmacies/{id}/reports/stock-value', description: 'Valor de inventario', auth: true, roles: ['pharmacy_admin'], params: 'id' },
    ],
  },
  {
    name: 'Ordenes y Pagos',
    color: 'bg-violet-500',
    endpoints: [
      { method: 'GET', path: '/api/orders', description: 'Listar ordenes', auth: true, queryParams: 'patientId=&pharmacyId=&status=' },
      { method: 'POST', path: '/api/orders', description: 'Crear orden/pedido', auth: true, roles: ['patient'], body: '{"patientId":"","pharmacyId":"","items":[{"medicationId":"","quantity":2}],"paymentMethod":"cash","deliveryType":"delivery","deliveryAddress":""}' },
      { method: 'GET', path: '/api/orders/{id}', description: 'Detalle de orden', auth: true, params: 'id' },
      { method: 'PUT', path: '/api/orders/{id}', description: 'Actualizar estado', auth: true, roles: ['pharmacy_admin', 'pharmacy_staff'], params: 'id', body: '{"status":"confirmed"}' },
      { method: 'POST', path: '/api/orders/{id}/return', description: 'Solicitar devolucion', auth: true, roles: ['patient'], params: 'id', body: '{"reason":"Producto incorrecto"}' },
      { method: 'GET', path: '/api/pharmacy/returns', description: 'Listar devoluciones', auth: true, queryParams: 'pharmacyId=&status=' },
      { method: 'PUT', path: '/api/pharmacy/returns/{id}/approve', description: 'Aprobar/rechazar devolucion', auth: true, roles: ['pharmacy_admin'], params: 'id', body: '{"approved":true,"returnToStock":true,"refundAmount":100}' },
      { method: 'POST', path: '/api/payments/process', description: 'Procesar pago', auth: true, body: '{"orderId":"","amount":500,"paymentMethod":"card_online"}' },
      { method: 'GET', path: '/api/invoices', description: 'Listar facturas', auth: true, queryParams: 'patientId=&clinicId=&pharmacyId=' },
      { method: 'GET', path: '/api/invoices/{id}', description: 'Detalle de factura', auth: true, params: 'id' },
      { method: 'GET', path: '/api/invoices/{id}/pdf', description: 'Datos PDF de factura', auth: true, params: 'id' },
    ],
  },
  {
    name: 'Delivery / Repartidores',
    color: 'bg-yellow-600',
    endpoints: [
      { method: 'POST', path: '/api/delivery/register', description: 'Registrarse como repartidor', auth: true, roles: ['delivery_person'], body: '{"vehicleType":"moto","plateNumber":"M-123456","zones":["11001"]}' },
      { method: 'PUT', path: '/api/delivery/availability', description: 'Toggle disponibilidad', auth: true, roles: ['delivery_person'], body: '{"isAvailable":true}' },
      { method: 'GET', path: '/api/delivery/available-orders', description: 'Pedidos disponibles', auth: true, roles: ['delivery_person'] },
      { method: 'POST', path: '/api/delivery/accept-order', description: 'Aceptar pedido', auth: true, roles: ['delivery_person'], body: '{"orderId":""}' },
      { method: 'POST', path: '/api/delivery/order/{orderId}/proof', description: 'Subir prueba de entrega', auth: true, roles: ['delivery_person'], params: 'orderId', body: '{"proofPhotoUrl":"","signatureUrl":""}' },
      { method: 'POST', path: '/api/delivery/order/{orderId}/failed-delivery', description: 'Reportar intento fallido', auth: true, roles: ['delivery_person'], params: 'orderId', body: '{"reason":"Cliente no se encuentra"}' },
      { method: 'PUT', path: '/api/delivery/order/{orderId}/collect-cash', description: 'Confirmar cobro en efectivo', auth: true, roles: ['delivery_person'], params: 'orderId', body: '{"amount":500}' },
      { method: 'GET', path: '/api/delivery/earnings', description: 'Ganancias del repartidor', auth: true, roles: ['delivery_person'], queryParams: 'from=&to=' },
      { method: 'GET', path: '/api/delivery/route/{orderId}', description: 'Ruta optimizada', auth: true, roles: ['delivery_person'], params: 'orderId' },
    ],
  },
  {
    name: 'Chat',
    color: 'bg-sky-500',
    endpoints: [
      { method: 'POST', path: '/api/chats', description: 'Iniciar conversacion', auth: true, roles: ['patient'], body: '{"doctorId":"","type":"patient_doctor"}' },
      { method: 'GET', path: '/api/chats', description: 'Listar chats', auth: true },
      { method: 'GET', path: '/api/chats/{id}', description: 'Detalle de chat', auth: true, params: 'id' },
      { method: 'POST', path: '/api/chats/{id}/messages', description: 'Enviar mensaje', auth: true, params: 'id', body: '{"message":"Hola doctor"}' },
      { method: 'GET', path: '/api/chats/{id}/messages', description: 'Obtener mensajes', auth: true, params: 'id', queryParams: 'before=&limit=20' },
      { method: 'PUT', path: '/api/chats/{id}/read', description: 'Marcar como leido', auth: true, params: 'id' },
    ],
  },
  {
    name: 'Notificaciones',
    color: 'bg-rose-500',
    endpoints: [
      { method: 'GET', path: '/api/notifications', description: 'Listar notificaciones', auth: true, queryParams: 'type=&isRead=' },
      { method: 'POST', path: '/api/notifications', description: 'Crear notificacion', auth: true, body: '{"userId":"","title":"","message":"","type":"system"}' },
      { method: 'PUT', path: '/api/notifications/{id}/read', description: 'Marcar como leida', auth: true, params: 'id' },
      { method: 'PUT', path: '/api/notifications/read-all', description: 'Marcar todas como leidas', auth: true },
      { method: 'POST', path: '/api/notifications/register-device', description: 'Registrar token FCM', auth: true, body: '{"fcmToken":""}' },
    ],
  },
  {
    name: 'Resenas',
    color: 'bg-amber-600',
    endpoints: [
      { method: 'POST', path: '/api/reviews', description: 'Crear resena', auth: true, roles: ['patient'], body: '{"targetType":"doctor","targetId":"","rating":5,"comment":"Excelente doctor"}' },
      { method: 'GET', path: '/api/reviews', description: 'Listar resenas', auth: false, queryParams: 'targetType=doctor&targetId=' },
      { method: 'GET', path: '/api/reviews/{id}', description: 'Detalle de resena', auth: true, params: 'id' },
      { method: 'PUT', path: '/api/reviews/{id}', description: 'Actualizar resena', auth: true, params: 'id', body: '{"rating":4,"comment":""}' },
      { method: 'DELETE', path: '/api/reviews/{id}', description: 'Eliminar resena', auth: true, params: 'id' },
    ],
  },
  {
    name: 'Citas y Servicios',
    color: 'bg-fuchsia-500',
    endpoints: [
      { method: 'GET', path: '/api/appointments', description: 'Listar citas', auth: true, queryParams: 'clinicId=&doctorId=&patientId=&date=&status=' },
      { method: 'GET', path: '/api/appointments/{id}', description: 'Detalle de cita', auth: true, params: 'id' },
      { method: 'PUT', path: '/api/appointments/{id}', description: 'Actualizar cita', auth: true, params: 'id', body: '{"status":"cancelled","cancellationReason":""}' },
      { method: 'GET', path: '/api/services', description: 'Listar servicios', auth: true, queryParams: 'clinicId=' },
      { method: 'POST', path: '/api/services', description: 'Crear servicio', auth: true, roles: ['clinic_admin'], body: '{"clinicId":"","name":"","duration":30,"price":800}' },
      { method: 'GET', path: '/api/services/{id}', description: 'Detalle de servicio', auth: true, params: 'id' },
      { method: 'PUT', path: '/api/services/{id}', description: 'Actualizar servicio', auth: true, params: 'id', body: '{"price":900}' },
      { method: 'DELETE', path: '/api/services/{id}', description: 'Eliminar servicio', auth: true, params: 'id' },
    ],
  },
  {
    name: 'Medicamentos (Publico)',
    color: 'bg-emerald-500',
    endpoints: [
      { method: 'GET', path: '/api/medications', description: 'Buscar medicamentos', auth: false, queryParams: 'search=ibuprofeno&category=&requiresPrescription=' },
      { method: 'GET', path: '/api/medications/{id}', description: 'Detalle de medicamento', auth: false, params: 'id' },
      { method: 'PUT', path: '/api/medications/{id}', description: 'Actualizar medicamento', auth: true, roles: ['superadmin'], params: 'id', body: '{"name":""}' },
    ],
  },
  {
    name: 'Seguros',
    color: 'bg-slate-500',
    endpoints: [
      { method: 'GET', path: '/api/insurance/estimate', description: 'Estimar copago', auth: true, queryParams: 'service_type=consultation&clinic_id=&medication_ids=' },
    ],
  },
  {
    name: 'Root',
    color: 'bg-gray-500',
    endpoints: [
      { method: 'GET', path: '/api', description: 'Health check del API', auth: false },
    ],
  },
];

const TEST_ACCOUNTS = [
  { role: 'Superadmin', email: 'superadmin@oasis.nii', password: 'Oasis2025!', color: 'bg-purple-100 text-purple-800' },
  { role: 'Admin Clinica', email: 'admin@santamaria.nii', password: 'Clinic2025!', color: 'bg-teal-100 text-teal-800' },
  { role: 'Recepcionista', email: 'recepcion@santamaria.nii', password: 'Recep2025!', color: 'bg-pink-100 text-pink-800' },
  { role: 'Doctor', email: 'dr.garcia@santamaria.nii', password: 'Doctor2025!', color: 'bg-blue-100 text-blue-800' },
  { role: 'Doctora', email: 'dra.martinez@santamaria.nii', password: 'Doctor2025!', color: 'bg-blue-100 text-blue-800' },
  { role: 'Paciente', email: 'carlos@email.com', password: 'Patient2025!', color: 'bg-green-100 text-green-800' },
  { role: 'Paciente', email: 'lucia@email.com', password: 'Patient2025!', color: 'bg-green-100 text-green-800' },
  { role: 'Admin Farmacia', email: 'admin@farmaciacentral.nii', password: 'Pharmacy2025!', color: 'bg-red-100 text-red-800' },
  { role: 'Staff Farmacia', email: 'vendedor@farmaciacentral.nii', password: 'Staff2025!', color: 'bg-orange-100 text-orange-800' },
  { role: 'Repartidor', email: 'repartidor1@oasis.nii', password: 'Delivery2025!', color: 'bg-yellow-100 text-yellow-800' },
  { role: 'Repartidor', email: 'repartidor2@oasis.nii', password: 'Delivery2025!', color: 'bg-yellow-100 text-yellow-800' },
];

const DB_SCHEMA: DbTable[] = [
  // ── Usuarios y Autenticacion ──
  {
    name: 'User', category: 'Usuarios y Autenticacion',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'email', type: 'String', isUnique: true },
      { name: 'password', type: 'String' },
      { name: 'name', type: 'String' },
      { name: 'phone', type: 'String', isOptional: true },
      { name: 'role', type: 'String' },
      { name: 'avatarUrl', type: 'String', isOptional: true },
      { name: 'isActive', type: 'Boolean', default: 'true' },
      { name: 'emailVerified', type: 'Boolean', default: 'false' },
      { name: 'phoneVerified', type: 'Boolean', default: 'false' },
      { name: 'refreshToken', type: 'String', isOptional: true },
      { name: 'resetPasswordToken', type: 'String', isOptional: true },
      { name: 'resetPasswordExpires', type: 'DateTime', isOptional: true },
      { name: 'fcmToken', type: 'String', isOptional: true },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'doctor', type: 'Doctor?', isOptional: true, relation: { to: 'Doctor', type: '1:1', field: 'userId' } },
      { name: 'receptionist', type: 'Receptionist?', isOptional: true, relation: { to: 'Receptionist', type: '1:1', field: 'userId' } },
      { name: 'patient', type: 'Patient?', isOptional: true, relation: { to: 'Patient', type: '1:1', field: 'userId' } },
      { name: 'pharmacyAdmin', type: 'PharmacyAdmin?', isOptional: true, relation: { to: 'PharmacyAdmin', type: '1:1', field: 'userId' } },
      { name: 'pharmacyStaff', type: 'PharmacyStaff?', isOptional: true, relation: { to: 'PharmacyStaff', type: '1:1', field: 'userId' } },
      { name: 'deliveryPerson', type: 'DeliveryPerson?', isOptional: true, relation: { to: 'DeliveryPerson', type: '1:1', field: 'userId' } },
      { name: 'clinicAdmin', type: 'ClinicAdmin?', isOptional: true, relation: { to: 'ClinicAdmin', type: '1:1', field: 'userId' } },
      { name: 'sentMessages', type: 'Message[]', isList: true, relation: { to: 'Message', type: '1:N', field: 'senderId' } },
      { name: 'auditLogs', type: 'AuditLog[]', isList: true, relation: { to: 'AuditLog', type: '1:N', field: 'userId' } },
      { name: 'notifications', type: 'Notification[]', isList: true, relation: { to: 'Notification', type: '1:N', field: 'userId' } },
    ],
  },
  {
    name: 'ClinicAdmin', category: 'Usuarios y Autenticacion',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'userId', type: 'String', relation: { to: 'User', type: 'N:1', field: 'userId' } },
      { name: 'clinicId', type: 'String', relation: { to: 'Clinic', type: 'N:1', field: 'clinicId' } },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'user', type: 'User', relation: { to: 'User', type: '1:1', field: 'userId' } },
      { name: 'clinic', type: 'Clinic', relation: { to: 'Clinic', type: 'N:1', field: 'clinicId' } },
    ],
  },
  {
    name: 'Receptionist', category: 'Usuarios y Autenticacion',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'userId', type: 'String', relation: { to: 'User', type: 'N:1', field: 'userId' } },
      { name: 'clinicId', type: 'String', relation: { to: 'Clinic', type: 'N:1', field: 'clinicId' } },
      { name: 'isActive', type: 'Boolean', default: 'true' },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'user', type: 'User', relation: { to: 'User', type: '1:1', field: 'userId' } },
      { name: 'clinic', type: 'Clinic', relation: { to: 'Clinic', type: 'N:1', field: 'clinicId' } },
    ],
  },

  // ── Clinicas ──
  {
    name: 'Clinic', category: 'Clinicas',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'name', type: 'String' },
      { name: 'description', type: 'String', isOptional: true },
      { name: 'logoUrl', type: 'String', isOptional: true },
      { name: 'phone', type: 'String', isOptional: true },
      { name: 'email', type: 'String', isOptional: true },
      { name: 'website', type: 'String', isOptional: true },
      { name: 'parentClinicId', type: 'String', isOptional: true, relation: { to: 'Clinic', type: 'N:1', field: 'parentClinicId' } },
      { name: 'address', type: 'String', isOptional: true },
      { name: 'city', type: 'String', isOptional: true },
      { name: 'department', type: 'String', isOptional: true },
      { name: 'latitude', type: 'Float', isOptional: true },
      { name: 'longitude', type: 'Float', isOptional: true },
      { name: 'settings', type: 'Json', isOptional: true },
      { name: 'isActive', type: 'Boolean', default: 'true' },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'parentClinic', type: 'Clinic?', isOptional: true, relation: { to: 'Clinic', type: 'N:1', field: 'parentClinicId' } },
      { name: 'branches', type: 'Clinic[]', isList: true, relation: { to: 'Clinic', type: '1:N', field: 'parentClinicId' } },
      { name: 'admins', type: 'ClinicAdmin[]', isList: true, relation: { to: 'ClinicAdmin', type: '1:N', field: 'clinicId' } },
      { name: 'receptionists', type: 'Receptionist[]', isList: true, relation: { to: 'Receptionist', type: '1:N', field: 'clinicId' } },
      { name: 'doctors', type: 'Doctor[]', isList: true, relation: { to: 'Doctor', type: '1:N', field: 'clinicId' } },
      { name: 'services', type: 'Service[]', isList: true, relation: { to: 'Service', type: '1:N', field: 'clinicId' } },
      { name: 'appointments', type: 'Appointment[]', isList: true, relation: { to: 'Appointment', type: '1:N', field: 'clinicId' } },
      { name: 'invoices', type: 'Invoice[]', isList: true, relation: { to: 'Invoice', type: '1:N', field: 'clinicId' } },
      { name: 'auditLogs', type: 'AuditLog[]', isList: true, relation: { to: 'AuditLog', type: '1:N', field: 'clinicId' } },
      { name: 'chats', type: 'Chat[]', isList: true, relation: { to: 'Chat', type: '1:N', field: 'clinicId' } },
    ],
  },

  // ── Doctores ──
  {
    name: 'Doctor', category: 'Doctores',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'userId', type: 'String', relation: { to: 'User', type: 'N:1', field: 'userId' } },
      { name: 'clinicId', type: 'String', relation: { to: 'Clinic', type: 'N:1', field: 'clinicId' } },
      { name: 'specialty', type: 'String' },
      { name: 'licenseNumber', type: 'String' },
      { name: 'digitalSignatureCert', type: 'String', isOptional: true },
      { name: 'schedule', type: 'Json', isOptional: true },
      { name: 'biography', type: 'String', isOptional: true },
      { name: 'consultationFee', type: 'Float' },
      { name: 'rating', type: 'Float', default: '0' },
      { name: 'totalReviews', type: 'Int', default: '0' },
      { name: 'isActive', type: 'Boolean', default: 'true' },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'user', type: 'User', relation: { to: 'User', type: '1:1', field: 'userId' } },
      { name: 'clinic', type: 'Clinic', relation: { to: 'Clinic', type: 'N:1', field: 'clinicId' } },
      { name: 'prescriptions', type: 'Prescription[]', isList: true, relation: { to: 'Prescription', type: '1:N', field: 'doctorId' } },
      { name: 'appointments', type: 'Appointment[]', isList: true, relation: { to: 'Appointment', type: '1:N', field: 'doctorId' } },
      { name: 'doctorPatients', type: 'DoctorPatient[]', isList: true, relation: { to: 'DoctorPatient', type: '1:N', field: 'doctorId' } },
      { name: 'chats', type: 'Chat[]', isList: true, relation: { to: 'Chat', type: '1:N', field: 'doctorId' } },
    ],
  },
  {
    name: 'DoctorPatient', category: 'Doctores',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'doctorId', type: 'String', relation: { to: 'Doctor', type: 'N:1', field: 'doctorId' } },
      { name: 'patientId', type: 'String', relation: { to: 'Patient', type: 'N:1', field: 'patientId' } },
      { name: 'assignedAt', type: 'DateTime', default: 'now()' },
      { name: 'doctor', type: 'Doctor', relation: { to: 'Doctor', type: 'N:1', field: 'doctorId' } },
      { name: 'patient', type: 'Patient', relation: { to: 'Patient', type: 'N:1', field: 'patientId' } },
    ],
  },

  // ── Pacientes ──
  {
    name: 'Patient', category: 'Pacientes',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'userId', type: 'String', relation: { to: 'User', type: 'N:1', field: 'userId' } },
      { name: 'dateOfBirth', type: 'DateTime', isOptional: true },
      { name: 'gender', type: 'String', isOptional: true },
      { name: 'bloodType', type: 'String', isOptional: true },
      { name: 'allergies', type: 'Json', isOptional: true },
      { name: 'chronicConditions', type: 'Json', isOptional: true },
      { name: 'emergencyContact', type: 'String', isOptional: true },
      { name: 'familyGroupId', type: 'String', isOptional: true },
      { name: 'insuranceProvider', type: 'String', isOptional: true },
      { name: 'insurancePolicyNumber', type: 'String', isOptional: true },
      { name: 'address', type: 'String', isOptional: true },
      { name: 'city', type: 'String', isOptional: true },
      { name: 'department', type: 'String', isOptional: true },
      { name: 'latitude', type: 'Float', isOptional: true },
      { name: 'longitude', type: 'Float', isOptional: true },
      { name: 'loyaltyPoints', type: 'Int', default: '0' },
      { name: 'loyaltyLevel', type: 'String', default: '"bronze"' },
      { name: 'isActive', type: 'Boolean', default: 'true' },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'user', type: 'User', relation: { to: 'User', type: '1:1', field: 'userId' } },
      { name: 'familyMembers', type: 'FamilyMember[]', isList: true, relation: { to: 'FamilyMember', type: '1:N', field: 'patientId' } },
      { name: 'doctorPatients', type: 'DoctorPatient[]', isList: true, relation: { to: 'DoctorPatient', type: '1:N', field: 'patientId' } },
      { name: 'prescriptions', type: 'Prescription[]', isList: true, relation: { to: 'Prescription', type: '1:N', field: 'patientId' } },
      { name: 'appointments', type: 'Appointment[]', isList: true, relation: { to: 'Appointment', type: '1:N', field: 'patientId' } },
      { name: 'orders', type: 'Order[]', isList: true, relation: { to: 'Order', type: '1:N', field: 'patientId' } },
      { name: 'insurances', type: 'Insurance[]', isList: true, relation: { to: 'Insurance', type: '1:N', field: 'patientId' } },
      { name: 'chats', type: 'Chat[]', isList: true, relation: { to: 'Chat', type: '1:N', field: 'patientId' } },
      { name: 'reviews', type: 'Review[]', isList: true, relation: { to: 'Review', type: '1:N', field: 'patientId' } },
      { name: 'refillRequests', type: 'RefillRequest[]', isList: true, relation: { to: 'RefillRequest', type: '1:N', field: 'patientId' } },
    ],
  },
  {
    name: 'FamilyMember', category: 'Pacientes',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'patientId', type: 'String', relation: { to: 'Patient', type: 'N:1', field: 'patientId' } },
      { name: 'name', type: 'String' },
      { name: 'relationship', type: 'String' },
      { name: 'dateOfBirth', type: 'DateTime', isOptional: true },
      { name: 'gender', type: 'String', isOptional: true },
      { name: 'bloodType', type: 'String', isOptional: true },
      { name: 'allergies', type: 'Json', isOptional: true },
      { name: 'chronicConditions', type: 'Json', isOptional: true },
      { name: 'insuranceProvider', type: 'String', isOptional: true },
      { name: 'insurancePolicyNumber', type: 'String', isOptional: true },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'patient', type: 'Patient', relation: { to: 'Patient', type: 'N:1', field: 'patientId' } },
    ],
  },

  // ── Farmacias ──
  {
    name: 'Pharmacy', category: 'Farmacias',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'name', type: 'String' },
      { name: 'description', type: 'String', isOptional: true },
      { name: 'logoUrl', type: 'String', isOptional: true },
      { name: 'phone', type: 'String', isOptional: true },
      { name: 'email', type: 'String', isOptional: true },
      { name: 'website', type: 'String', isOptional: true },
      { name: 'parentPharmacyId', type: 'String', isOptional: true, relation: { to: 'Pharmacy', type: 'N:1', field: 'parentPharmacyId' } },
      { name: 'address', type: 'String', isOptional: true },
      { name: 'city', type: 'String', isOptional: true },
      { name: 'department', type: 'String', isOptional: true },
      { name: 'latitude', type: 'Float', isOptional: true },
      { name: 'longitude', type: 'Float', isOptional: true },
      { name: 'deliverySettings', type: 'Json', isOptional: true },
      { name: 'paymentMethods', type: 'Json', isOptional: true },
      { name: 'isActive', type: 'Boolean', default: 'true' },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'parentPharmacy', type: 'Pharmacy?', isOptional: true, relation: { to: 'Pharmacy', type: 'N:1', field: 'parentPharmacyId' } },
      { name: 'branches', type: 'Pharmacy[]', isList: true, relation: { to: 'Pharmacy', type: '1:N', field: 'parentPharmacyId' } },
      { name: 'admins', type: 'PharmacyAdmin[]', isList: true, relation: { to: 'PharmacyAdmin', type: '1:N', field: 'pharmacyId' } },
      { name: 'staff', type: 'PharmacyStaff[]', isList: true, relation: { to: 'PharmacyStaff', type: '1:N', field: 'pharmacyId' } },
      { name: 'inventoryBatches', type: 'InventoryBatch[]', isList: true, relation: { to: 'InventoryBatch', type: '1:N', field: 'pharmacyId' } },
      { name: 'suppliers', type: 'Supplier[]', isList: true, relation: { to: 'Supplier', type: '1:N', field: 'pharmacyId' } },
      { name: 'purchaseOrders', type: 'PurchaseOrder[]', isList: true, relation: { to: 'PurchaseOrder', type: '1:N', field: 'pharmacyId' } },
      { name: 'orders', type: 'Order[]', isList: true, relation: { to: 'Order', type: '1:N', field: 'pharmacyId' } },
      { name: 'chats', type: 'Chat[]', isList: true, relation: { to: 'Chat', type: '1:N', field: 'pharmacyId' } },
      { name: 'promotions', type: 'Promotion[]', isList: true, relation: { to: 'Promotion', type: '1:N', field: 'pharmacyId' } },
    ],
  },
  {
    name: 'PharmacyAdmin', category: 'Farmacias',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'userId', type: 'String', relation: { to: 'User', type: 'N:1', field: 'userId' } },
      { name: 'pharmacyId', type: 'String', relation: { to: 'Pharmacy', type: 'N:1', field: 'pharmacyId' } },
      { name: 'isActive', type: 'Boolean', default: 'true' },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'user', type: 'User', relation: { to: 'User', type: '1:1', field: 'userId' } },
      { name: 'pharmacy', type: 'Pharmacy', relation: { to: 'Pharmacy', type: 'N:1', field: 'pharmacyId' } },
    ],
  },
  {
    name: 'PharmacyStaff', category: 'Farmacias',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'userId', type: 'String', relation: { to: 'User', type: 'N:1', field: 'userId' } },
      { name: 'pharmacyId', type: 'String', relation: { to: 'Pharmacy', type: 'N:1', field: 'pharmacyId' } },
      { name: 'role', type: 'String' },
      { name: 'isActive', type: 'Boolean', default: 'true' },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'user', type: 'User', relation: { to: 'User', type: '1:1', field: 'userId' } },
      { name: 'pharmacy', type: 'Pharmacy', relation: { to: 'Pharmacy', type: 'N:1', field: 'pharmacyId' } },
    ],
  },

  // ── Medicamentos e Inventario ──
  {
    name: 'Medication', category: 'Medicamentos e Inventario',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'name', type: 'String' },
      { name: 'genericName', type: 'String', isOptional: true },
      { name: 'brand', type: 'String', isOptional: true },
      { name: 'description', type: 'String', isOptional: true },
      { name: 'dosageForm', type: 'String', isOptional: true },
      { name: 'strength', type: 'String', isOptional: true },
      { name: 'manufacturer', type: 'String', isOptional: true },
      { name: 'requiresPrescription', type: 'Boolean' },
      { name: 'controlledSubstance', type: 'Boolean', default: 'false' },
      { name: 'controlledLevel', type: 'String', isOptional: true },
      { name: 'interactionGroups', type: 'Json', isOptional: true },
      { name: 'sideEffects', type: 'Json', isOptional: true },
      { name: 'contraindications', type: 'Json', isOptional: true },
      { name: 'category', type: 'String', isOptional: true },
      { name: 'imageUrl', type: 'String', isOptional: true },
      { name: 'isActive', type: 'Boolean', default: 'true' },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'prescriptionItems', type: 'PrescriptionItem[]', isList: true, relation: { to: 'PrescriptionItem', type: '1:N', field: 'medicationId' } },
      { name: 'orderItems', type: 'OrderItem[]', isList: true, relation: { to: 'OrderItem', type: '1:N', field: 'medicationId' } },
      { name: 'inventoryBatches', type: 'InventoryBatch[]', isList: true, relation: { to: 'InventoryBatch', type: '1:N', field: 'medicationId' } },
      { name: 'purchaseOrderItems', type: 'PurchaseOrderItem[]', isList: true, relation: { to: 'PurchaseOrderItem', type: '1:N', field: 'medicationId' } },
      { name: 'promotionItems', type: 'PromotionItem[]', isList: true, relation: { to: 'PromotionItem', type: '1:N', field: 'medicationId' } },
    ],
  },
  {
    name: 'InventoryBatch', category: 'Medicamentos e Inventario',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'pharmacyId', type: 'String', relation: { to: 'Pharmacy', type: 'N:1', field: 'pharmacyId' } },
      { name: 'medicationId', type: 'String', relation: { to: 'Medication', type: 'N:1', field: 'medicationId' } },
      { name: 'batchNumber', type: 'String' },
      { name: 'quantity', type: 'Int' },
      { name: 'expiryDate', type: 'DateTime' },
      { name: 'costPrice', type: 'Float' },
      { name: 'sellingPrice', type: 'Float' },
      { name: 'supplierId', type: 'String', isOptional: true, relation: { to: 'Supplier', type: 'N:1', field: 'supplierId' } },
      { name: 'minStockAlert', type: 'Int' },
      { name: 'maxStock', type: 'Int' },
      { name: 'location', type: 'String', isOptional: true },
      { name: 'isActive', type: 'Boolean', default: 'true' },
      { name: 'receivedAt', type: 'DateTime', default: 'now()' },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'pharmacy', type: 'Pharmacy', relation: { to: 'Pharmacy', type: 'N:1', field: 'pharmacyId' } },
      { name: 'medication', type: 'Medication', relation: { to: 'Medication', type: 'N:1', field: 'medicationId' } },
      { name: 'supplier', type: 'Supplier?', isOptional: true, relation: { to: 'Supplier', type: 'N:1', field: 'supplierId' } },
    ],
  },
  {
    name: 'Supplier', category: 'Medicamentos e Inventario',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'pharmacyId', type: 'String', relation: { to: 'Pharmacy', type: 'N:1', field: 'pharmacyId' } },
      { name: 'name', type: 'String' },
      { name: 'contactName', type: 'String', isOptional: true },
      { name: 'phone', type: 'String', isOptional: true },
      { name: 'email', type: 'String', isOptional: true },
      { name: 'address', type: 'String', isOptional: true },
      { name: 'isActive', type: 'Boolean', default: 'true' },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'pharmacy', type: 'Pharmacy', relation: { to: 'Pharmacy', type: 'N:1', field: 'pharmacyId' } },
      { name: 'inventoryBatches', type: 'InventoryBatch[]', isList: true, relation: { to: 'InventoryBatch', type: '1:N', field: 'supplierId' } },
      { name: 'purchaseOrders', type: 'PurchaseOrder[]', isList: true, relation: { to: 'PurchaseOrder', type: '1:N', field: 'supplierId' } },
    ],
  },
  {
    name: 'PurchaseOrder', category: 'Medicamentos e Inventario',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'pharmacyId', type: 'String', relation: { to: 'Pharmacy', type: 'N:1', field: 'pharmacyId' } },
      { name: 'supplierId', type: 'String', relation: { to: 'Supplier', type: 'N:1', field: 'supplierId' } },
      { name: 'status', type: 'String' },
      { name: 'totalAmount', type: 'Float' },
      { name: 'notes', type: 'String', isOptional: true },
      { name: 'orderDate', type: 'DateTime' },
      { name: 'expectedDate', type: 'DateTime', isOptional: true },
      { name: 'receivedDate', type: 'DateTime', isOptional: true },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'pharmacy', type: 'Pharmacy', relation: { to: 'Pharmacy', type: 'N:1', field: 'pharmacyId' } },
      { name: 'supplier', type: 'Supplier', relation: { to: 'Supplier', type: 'N:1', field: 'supplierId' } },
      { name: 'items', type: 'PurchaseOrderItem[]', isList: true, relation: { to: 'PurchaseOrderItem', type: '1:N', field: 'purchaseOrderId' } },
    ],
  },
  {
    name: 'PurchaseOrderItem', category: 'Medicamentos e Inventario',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'purchaseOrderId', type: 'String', relation: { to: 'PurchaseOrder', type: 'N:1', field: 'purchaseOrderId' } },
      { name: 'medicationId', type: 'String', relation: { to: 'Medication', type: 'N:1', field: 'medicationId' } },
      { name: 'quantity', type: 'Int' },
      { name: 'unitCost', type: 'Float' },
      { name: 'totalCost', type: 'Float' },
      { name: 'receivedQuantity', type: 'Int' },
      { name: 'batchNumber', type: 'String', isOptional: true },
      { name: 'expiryDate', type: 'DateTime', isOptional: true },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'purchaseOrder', type: 'PurchaseOrder', relation: { to: 'PurchaseOrder', type: 'N:1', field: 'purchaseOrderId' } },
      { name: 'medication', type: 'Medication', relation: { to: 'Medication', type: 'N:1', field: 'medicationId' } },
    ],
  },

  // ── Recetas Medicas ──
  {
    name: 'Prescription', category: 'Recetas Medicas',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'doctorId', type: 'String', relation: { to: 'Doctor', type: 'N:1', field: 'doctorId' } },
      { name: 'patientId', type: 'String', relation: { to: 'Patient', type: 'N:1', field: 'patientId' } },
      { name: 'familyMemberId', type: 'String', isOptional: true },
      { name: 'date', type: 'DateTime' },
      { name: 'diagnosis', type: 'String', isOptional: true },
      { name: 'notes', type: 'String', isOptional: true },
      { name: 'digitalSignature', type: 'String', isOptional: true },
      { name: 'isControlled', type: 'Boolean', default: 'false' },
      { name: 'validUntil', type: 'DateTime', isOptional: true },
      { name: 'refillsRemaining', type: 'Int', default: '0' },
      { name: 'verificationCode', type: 'String', isOptional: true },
      { name: 'status', type: 'String' },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'doctor', type: 'Doctor', relation: { to: 'Doctor', type: 'N:1', field: 'doctorId' } },
      { name: 'patient', type: 'Patient', relation: { to: 'Patient', type: 'N:1', field: 'patientId' } },
      { name: 'items', type: 'PrescriptionItem[]', isList: true, relation: { to: 'PrescriptionItem', type: '1:N', field: 'prescriptionId' } },
      { name: 'refillRequests', type: 'RefillRequest[]', isList: true, relation: { to: 'RefillRequest', type: '1:N', field: 'prescriptionId' } },
    ],
  },
  {
    name: 'PrescriptionItem', category: 'Recetas Medicas',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'prescriptionId', type: 'String', relation: { to: 'Prescription', type: 'N:1', field: 'prescriptionId' } },
      { name: 'medicationId', type: 'String', relation: { to: 'Medication', type: 'N:1', field: 'medicationId' } },
      { name: 'dosage', type: 'String' },
      { name: 'duration', type: 'String', isOptional: true },
      { name: 'quantity', type: 'Int' },
      { name: 'instructions', type: 'String', isOptional: true },
      { name: 'isControlled', type: 'Boolean', default: 'false' },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'prescription', type: 'Prescription', relation: { to: 'Prescription', type: 'N:1', field: 'prescriptionId' } },
      { name: 'medication', type: 'Medication', relation: { to: 'Medication', type: 'N:1', field: 'medicationId' } },
    ],
  },
  {
    name: 'RefillRequest', category: 'Recetas Medicas',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'prescriptionId', type: 'String', relation: { to: 'Prescription', type: 'N:1', field: 'prescriptionId' } },
      { name: 'patientId', type: 'String', relation: { to: 'Patient', type: 'N:1', field: 'patientId' } },
      { name: 'status', type: 'String' },
      { name: 'doctorNotes', type: 'String', isOptional: true },
      { name: 'requestedAt', type: 'DateTime', default: 'now()' },
      { name: 'processedAt', type: 'DateTime', isOptional: true },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'prescription', type: 'Prescription', relation: { to: 'Prescription', type: 'N:1', field: 'prescriptionId' } },
      { name: 'patient', type: 'Patient', relation: { to: 'Patient', type: 'N:1', field: 'patientId' } },
    ],
  },

  // ── Citas y Servicios ──
  {
    name: 'Service', category: 'Citas y Servicios',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'clinicId', type: 'String', relation: { to: 'Clinic', type: 'N:1', field: 'clinicId' } },
      { name: 'name', type: 'String' },
      { name: 'description', type: 'String', isOptional: true },
      { name: 'duration', type: 'Int' },
      { name: 'price', type: 'Float' },
      { name: 'isActive', type: 'Boolean', default: 'true' },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'clinic', type: 'Clinic', relation: { to: 'Clinic', type: 'N:1', field: 'clinicId' } },
      { name: 'appointments', type: 'Appointment[]', isList: true, relation: { to: 'Appointment', type: '1:N', field: 'serviceId' } },
    ],
  },
  {
    name: 'Appointment', category: 'Citas y Servicios',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'clinicId', type: 'String', relation: { to: 'Clinic', type: 'N:1', field: 'clinicId' } },
      { name: 'doctorId', type: 'String', relation: { to: 'Doctor', type: 'N:1', field: 'doctorId' } },
      { name: 'patientId', type: 'String', relation: { to: 'Patient', type: 'N:1', field: 'patientId' } },
      { name: 'familyMemberId', type: 'String', isOptional: true },
      { name: 'serviceId', type: 'String', isOptional: true, relation: { to: 'Service', type: 'N:1', field: 'serviceId' } },
      { name: 'date', type: 'DateTime' },
      { name: 'startTime', type: 'String' },
      { name: 'endTime', type: 'String' },
      { name: 'status', type: 'String' },
      { name: 'type', type: 'String' },
      { name: 'teleconsultLink', type: 'String', isOptional: true },
      { name: 'notes', type: 'String', isOptional: true },
      { name: 'cancellationReason', type: 'String', isOptional: true },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'clinic', type: 'Clinic', relation: { to: 'Clinic', type: 'N:1', field: 'clinicId' } },
      { name: 'doctor', type: 'Doctor', relation: { to: 'Doctor', type: 'N:1', field: 'doctorId' } },
      { name: 'patient', type: 'Patient', relation: { to: 'Patient', type: 'N:1', field: 'patientId' } },
      { name: 'service', type: 'Service?', isOptional: true, relation: { to: 'Service', type: 'N:1', field: 'serviceId' } },
      { name: 'invoice', type: 'Invoice?', isOptional: true, relation: { to: 'Invoice', type: '1:1', field: 'appointmentId' } },
    ],
  },

  // ── Ordenes ──
  {
    name: 'Order', category: 'Ordenes',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'patientId', type: 'String', relation: { to: 'Patient', type: 'N:1', field: 'patientId' } },
      { name: 'pharmacyId', type: 'String', relation: { to: 'Pharmacy', type: 'N:1', field: 'pharmacyId' } },
      { name: 'prescriptionId', type: 'String', isOptional: true },
      { name: 'status', type: 'String' },
      { name: 'paymentMethod', type: 'String' },
      { name: 'paymentStatus', type: 'String' },
      { name: 'insuranceClaimId', type: 'String', isOptional: true },
      { name: 'subtotal', type: 'Float' },
      { name: 'deliveryFee', type: 'Float' },
      { name: 'tipAmount', type: 'Float', default: '0' },
      { name: 'totalAmount', type: 'Float' },
      { name: 'deliveryType', type: 'String' },
      { name: 'deliveryAddress', type: 'String', isOptional: true },
      { name: 'deliveryLatitude', type: 'Float', isOptional: true },
      { name: 'deliveryLongitude', type: 'Float', isOptional: true },
      { name: 'deliveryNotes', type: 'String', isOptional: true },
      { name: 'failedDeliveryAttempts', type: 'Int', default: '0' },
      { name: 'estimatedDeliveryTime', type: 'DateTime', isOptional: true },
      { name: 'loyaltyPointsEarned', type: 'Int', default: '0' },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'patient', type: 'Patient', relation: { to: 'Patient', type: 'N:1', field: 'patientId' } },
      { name: 'pharmacy', type: 'Pharmacy', relation: { to: 'Pharmacy', type: 'N:1', field: 'pharmacyId' } },
      { name: 'items', type: 'OrderItem[]', isList: true, relation: { to: 'OrderItem', type: '1:N', field: 'orderId' } },
      { name: 'delivery', type: 'Delivery?', isOptional: true, relation: { to: 'Delivery', type: '1:1', field: 'orderId' } },
      { name: 'returnRequest', type: 'ReturnRequest?', isOptional: true, relation: { to: 'ReturnRequest', type: '1:1', field: 'orderId' } },
      { name: 'invoice', type: 'Invoice?', isOptional: true, relation: { to: 'Invoice', type: '1:1', field: 'orderId' } },
    ],
  },
  {
    name: 'OrderItem', category: 'Ordenes',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'orderId', type: 'String', relation: { to: 'Order', type: 'N:1', field: 'orderId' } },
      { name: 'medicationId', type: 'String', relation: { to: 'Medication', type: 'N:1', field: 'medicationId' } },
      { name: 'quantity', type: 'Int' },
      { name: 'unitPrice', type: 'Float' },
      { name: 'totalPrice', type: 'Float' },
      { name: 'batchId', type: 'String', isOptional: true },
      { name: 'requiresPrescription', type: 'Boolean', default: 'false' },
      { name: 'isControlled', type: 'Boolean', default: 'false' },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'order', type: 'Order', relation: { to: 'Order', type: 'N:1', field: 'orderId' } },
      { name: 'medication', type: 'Medication', relation: { to: 'Medication', type: 'N:1', field: 'medicationId' } },
    ],
  },

  // ── Delivery ──
  {
    name: 'DeliveryPerson', category: 'Delivery',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'userId', type: 'String', relation: { to: 'User', type: 'N:1', field: 'userId' } },
      { name: 'vehicleType', type: 'String', isOptional: true },
      { name: 'plateNumber', type: 'String', isOptional: true },
      { name: 'availabilitySchedule', type: 'Json', isOptional: true },
      { name: 'zones', type: 'Json', isOptional: true },
      { name: 'rating', type: 'Float', default: '0' },
      { name: 'totalReviews', type: 'Int', default: '0' },
      { name: 'isVerified', type: 'Boolean', default: 'false' },
      { name: 'idDocument', type: 'String', isOptional: true },
      { name: 'earningsBalance', type: 'Float', default: '0' },
      { name: 'isActive', type: 'Boolean', default: 'true' },
      { name: 'isAvailable', type: 'Boolean', default: 'false' },
      { name: 'isInternal', type: 'Boolean', default: 'false' },
      { name: 'pharmacyId', type: 'String', isOptional: true },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'user', type: 'User', relation: { to: 'User', type: '1:1', field: 'userId' } },
      { name: 'deliveries', type: 'Delivery[]', isList: true, relation: { to: 'Delivery', type: '1:N', field: 'deliveryPersonId' } },
    ],
  },
  {
    name: 'Delivery', category: 'Delivery',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'orderId', type: 'String', relation: { to: 'Order', type: 'N:1', field: 'orderId' } },
      { name: 'deliveryPersonId', type: 'String', relation: { to: 'DeliveryPerson', type: 'N:1', field: 'deliveryPersonId' } },
      { name: 'status', type: 'String' },
      { name: 'routeOptimized', type: 'Json', isOptional: true },
      { name: 'proofPhotoUrl', type: 'String', isOptional: true },
      { name: 'signatureUrl', type: 'String', isOptional: true },
      { name: 'cashCollectedAmount', type: 'Float', isOptional: true },
      { name: 'pickupTime', type: 'DateTime', isOptional: true },
      { name: 'deliveryTime', type: 'DateTime', isOptional: true },
      { name: 'estimatedArrival', type: 'DateTime', isOptional: true },
      { name: 'failedReason', type: 'String', isOptional: true },
      { name: 'notes', type: 'String', isOptional: true },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'order', type: 'Order', relation: { to: 'Order', type: '1:1', field: 'orderId' } },
      { name: 'deliveryPerson', type: 'DeliveryPerson', relation: { to: 'DeliveryPerson', type: 'N:1', field: 'deliveryPersonId' } },
    ],
  },

  // ── Chat ──
  {
    name: 'Chat', category: 'Chat',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'patientId', type: 'String', relation: { to: 'Patient', type: 'N:1', field: 'patientId' } },
      { name: 'doctorId', type: 'String', isOptional: true, relation: { to: 'Doctor', type: 'N:1', field: 'doctorId' } },
      { name: 'clinicId', type: 'String', isOptional: true, relation: { to: 'Clinic', type: 'N:1', field: 'clinicId' } },
      { name: 'pharmacyId', type: 'String', isOptional: true, relation: { to: 'Pharmacy', type: 'N:1', field: 'pharmacyId' } },
      { name: 'type', type: 'String' },
      { name: 'status', type: 'String' },
      { name: 'lastMessageAt', type: 'DateTime' },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'patient', type: 'Patient', relation: { to: 'Patient', type: 'N:1', field: 'patientId' } },
      { name: 'doctor', type: 'Doctor?', isOptional: true, relation: { to: 'Doctor', type: 'N:1', field: 'doctorId' } },
      { name: 'clinic', type: 'Clinic?', isOptional: true, relation: { to: 'Clinic', type: 'N:1', field: 'clinicId' } },
      { name: 'pharmacy', type: 'Pharmacy?', isOptional: true, relation: { to: 'Pharmacy', type: 'N:1', field: 'pharmacyId' } },
      { name: 'messages', type: 'Message[]', isList: true, relation: { to: 'Message', type: '1:N', field: 'chatId' } },
    ],
  },
  {
    name: 'Message', category: 'Chat',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'chatId', type: 'String', relation: { to: 'Chat', type: 'N:1', field: 'chatId' } },
      { name: 'senderId', type: 'String', relation: { to: 'User', type: 'N:1', field: 'senderId' } },
      { name: 'message', type: 'String' },
      { name: 'attachment', type: 'String', isOptional: true },
      { name: 'isRead', type: 'Boolean', default: 'false' },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'chat', type: 'Chat', relation: { to: 'Chat', type: 'N:1', field: 'chatId' } },
      { name: 'sender', type: 'User', relation: { to: 'User', type: 'N:1', field: 'senderId' } },
    ],
  },

  // ── Facturacion ──
  {
    name: 'Invoice', category: 'Facturacion',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'appointmentId', type: 'String', isOptional: true, relation: { to: 'Appointment', type: '1:1', field: 'appointmentId' } },
      { name: 'orderId', type: 'String', isOptional: true, relation: { to: 'Order', type: '1:1', field: 'orderId' } },
      { name: 'clinicId', type: 'String', isOptional: true, relation: { to: 'Clinic', type: 'N:1', field: 'clinicId' } },
      { name: 'pharmacyId', type: 'String', isOptional: true },
      { name: 'patientId', type: 'String' },
      { name: 'invoiceNumber', type: 'String', isUnique: true },
      { name: 'type', type: 'String' },
      { name: 'subtotal', type: 'Float' },
      { name: 'tax', type: 'Float' },
      { name: 'discount', type: 'Float', default: '0' },
      { name: 'total', type: 'Float' },
      { name: 'paymentMethod', type: 'String' },
      { name: 'paymentStatus', type: 'String' },
      { name: 'insuranceAmount', type: 'Float', isOptional: true },
      { name: 'copayAmount', type: 'Float', isOptional: true },
      { name: 'pdfUrl', type: 'String', isOptional: true },
      { name: 'notes', type: 'String', isOptional: true },
      { name: 'issuedAt', type: 'DateTime' },
      { name: 'dueDate', type: 'DateTime', isOptional: true },
      { name: 'paidAt', type: 'DateTime', isOptional: true },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'appointment', type: 'Appointment?', isOptional: true, relation: { to: 'Appointment', type: '1:1', field: 'appointmentId' } },
      { name: 'order', type: 'Order?', isOptional: true, relation: { to: 'Order', type: '1:1', field: 'orderId' } },
      { name: 'clinic', type: 'Clinic?', isOptional: true, relation: { to: 'Clinic', type: 'N:1', field: 'clinicId' } },
      { name: 'returnRequests', type: 'ReturnRequest[]', isList: true, relation: { to: 'ReturnRequest', type: '1:N', field: 'invoiceId' } },
    ],
  },

  // ── Devoluciones ──
  {
    name: 'ReturnRequest', category: 'Devoluciones',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'orderId', type: 'String', relation: { to: 'Order', type: 'N:1', field: 'orderId' } },
      { name: 'patientId', type: 'String' },
      { name: 'reason', type: 'String' },
      { name: 'status', type: 'String' },
      { name: 'returnToStock', type: 'Boolean', default: 'false' },
      { name: 'refundAmount', type: 'Float' },
      { name: 'notes', type: 'String', isOptional: true },
      { name: 'invoiceId', type: 'String', isOptional: true, relation: { to: 'Invoice', type: 'N:1', field: 'invoiceId' } },
      { name: 'processedById', type: 'String', isOptional: true },
      { name: 'processedAt', type: 'DateTime', isOptional: true },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'order', type: 'Order', relation: { to: 'Order', type: 'N:1', field: 'orderId' } },
      { name: 'invoice', type: 'Invoice?', isOptional: true, relation: { to: 'Invoice', type: 'N:1', field: 'invoiceId' } },
    ],
  },

  // ── Resenas ──
  {
    name: 'Review', category: 'Resenas',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'patientId', type: 'String', relation: { to: 'Patient', type: 'N:1', field: 'patientId' } },
      { name: 'targetType', type: 'String' },
      { name: 'targetId', type: 'String' },
      { name: 'rating', type: 'Int' },
      { name: 'comment', type: 'String', isOptional: true },
      { name: 'isActive', type: 'Boolean', default: 'true' },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'patient', type: 'Patient', relation: { to: 'Patient', type: 'N:1', field: 'patientId' } },
    ],
  },

  // ── Seguros ──
  {
    name: 'Insurance', category: 'Seguros',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'patientId', type: 'String', relation: { to: 'Patient', type: 'N:1', field: 'patientId' } },
      { name: 'provider', type: 'String' },
      { name: 'policyNumber', type: 'String' },
      { name: 'coverageDetails', type: 'Json', isOptional: true },
      { name: 'copayPercentage', type: 'Float' },
      { name: 'isActive', type: 'Boolean', default: 'true' },
      { name: 'validUntil', type: 'DateTime', isOptional: true },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'patient', type: 'Patient', relation: { to: 'Patient', type: 'N:1', field: 'patientId' } },
    ],
  },

  // ── Promociones ──
  {
    name: 'Promotion', category: 'Promociones',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'pharmacyId', type: 'String', relation: { to: 'Pharmacy', type: 'N:1', field: 'pharmacyId' } },
      { name: 'name', type: 'String' },
      { name: 'description', type: 'String', isOptional: true },
      { name: 'type', type: 'String' },
      { name: 'value', type: 'Float' },
      { name: 'code', type: 'String', isOptional: true, isUnique: true },
      { name: 'minPurchase', type: 'Float', default: '0' },
      { name: 'maxDiscount', type: 'Float', isOptional: true },
      { name: 'startDate', type: 'DateTime' },
      { name: 'endDate', type: 'DateTime' },
      { name: 'usageLimit', type: 'Int', isOptional: true },
      { name: 'usageCount', type: 'Int', default: '0' },
      { name: 'isActive', type: 'Boolean', default: 'true' },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
      { name: 'pharmacy', type: 'Pharmacy', relation: { to: 'Pharmacy', type: 'N:1', field: 'pharmacyId' } },
      { name: 'items', type: 'PromotionItem[]', isList: true, relation: { to: 'PromotionItem', type: '1:N', field: 'promotionId' } },
    ],
  },
  {
    name: 'PromotionItem', category: 'Promociones',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'promotionId', type: 'String', relation: { to: 'Promotion', type: 'N:1', field: 'promotionId' } },
      { name: 'medicationId', type: 'String', isOptional: true, relation: { to: 'Medication', type: 'N:1', field: 'medicationId' } },
      { name: 'category', type: 'String', isOptional: true },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'promotion', type: 'Promotion', relation: { to: 'Promotion', type: 'N:1', field: 'promotionId' } },
      { name: 'medication', type: 'Medication?', isOptional: true, relation: { to: 'Medication', type: 'N:1', field: 'medicationId' } },
    ],
  },

  // ── Notificaciones ──
  {
    name: 'Notification', category: 'Notificaciones',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'userId', type: 'String', relation: { to: 'User', type: 'N:1', field: 'userId' } },
      { name: 'title', type: 'String' },
      { name: 'message', type: 'String' },
      { name: 'type', type: 'String' },
      { name: 'data', type: 'Json', isOptional: true },
      { name: 'isRead', type: 'Boolean', default: 'false' },
      { name: 'sentVia', type: 'String' },
      { name: 'sentAt', type: 'DateTime', default: 'now()' },
      { name: 'readAt', type: 'DateTime', isOptional: true },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'user', type: 'User', relation: { to: 'User', type: 'N:1', field: 'userId' } },
    ],
  },

  // ── Auditoria ──
  {
    name: 'AuditLog', category: 'Auditoria',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'userId', type: 'String', isOptional: true, relation: { to: 'User', type: 'N:1', field: 'userId' } },
      { name: 'clinicId', type: 'String', isOptional: true, relation: { to: 'Clinic', type: 'N:1', field: 'clinicId' } },
      { name: 'action', type: 'String' },
      { name: 'entity', type: 'String' },
      { name: 'entityId', type: 'String', isOptional: true },
      { name: 'oldValues', type: 'Json', isOptional: true },
      { name: 'newValues', type: 'Json', isOptional: true },
      { name: 'ipAddress', type: 'String', isOptional: true },
      { name: 'userAgent', type: 'String', isOptional: true },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'user', type: 'User?', isOptional: true, relation: { to: 'User', type: 'N:1', field: 'userId' } },
      { name: 'clinic', type: 'Clinic?', isOptional: true, relation: { to: 'Clinic', type: 'N:1', field: 'clinicId' } },
    ],
  },

  // ── Pagos ──
  {
    name: 'PaymentTransaction', category: 'Pagos',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'invoiceId', type: 'String', isOptional: true },
      { name: 'orderId', type: 'String', isOptional: true },
      { name: 'amount', type: 'Float' },
      { name: 'currency', type: 'String', default: '"NIO"' },
      { name: 'paymentMethod', type: 'String' },
      { name: 'status', type: 'String' },
      { name: 'gatewayResponse', type: 'Json', isOptional: true },
      { name: 'transactionRef', type: 'String', isOptional: true },
      { name: 'processedAt', type: 'DateTime', isOptional: true },
      { name: 'createdAt', type: 'DateTime', default: 'now()' },
      { name: 'updatedAt', type: 'DateTime', default: 'now()' },
    ],
  },
];

const DB_CATEGORIES = [...new Set(DB_SCHEMA.map(t => t.category))];

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; fill: string }> = {
  'Usuarios y Autenticacion': { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-800', fill: '#E9D5FF' },
  'Clinicas': { bg: 'bg-teal-100', border: 'border-teal-400', text: 'text-teal-800', fill: '#CCFBF1' },
  'Doctores': { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-800', fill: '#DBEAFE' },
  'Pacientes': { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-800', fill: '#DCFCE7' },
  'Farmacias': { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-800', fill: '#FEE2E2' },
  'Medicamentos e Inventario': { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-800', fill: '#FFEDD5' },
  'Recetas Medicas': { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-800', fill: '#FEF3C7' },
  'Citas y Servicios': { bg: 'bg-fuchsia-100', border: 'border-fuchsia-400', text: 'text-fuchsia-800', fill: '#FAE8FF' },
  'Ordenes': { bg: 'bg-violet-100', border: 'border-violet-400', text: 'text-violet-800', fill: '#EDE9FE' },
  'Delivery': { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-800', fill: '#FEF9C3' },
  'Chat': { bg: 'bg-sky-100', border: 'border-sky-400', text: 'text-sky-800', fill: '#E0F2FE' },
  'Facturacion': { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-800', fill: '#D1FAE5' },
  'Devoluciones': { bg: 'bg-rose-100', border: 'border-rose-400', text: 'text-rose-800', fill: '#FFE4E6' },
  'Resenas': { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-800', fill: '#FEF3C7' },
  'Seguros': { bg: 'bg-slate-100', border: 'border-slate-400', text: 'text-slate-800', fill: '#F1F5F9' },
  'Promociones': { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-800', fill: '#FCE7F3' },
  'Notificaciones': { bg: 'bg-rose-100', border: 'border-rose-400', text: 'text-rose-800', fill: '#FFE4E6' },
  'Auditoria': { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-800', fill: '#F3F4F6' },
  'Pagos': { bg: 'bg-lime-100', border: 'border-lime-400', text: 'text-lime-800', fill: '#ECFCCB' },
  'Proveedores': { bg: 'bg-cyan-100', border: 'border-cyan-400', text: 'text-cyan-800', fill: '#CFFAFE' },
};

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-600', POST: 'bg-blue-600', PUT: 'bg-amber-600', DELETE: 'bg-red-600', PATCH: 'bg-purple-600',
};

// Test masivo de endpoints publicos (no requieren auth)
const PUBLIC_TEST_ENDPOINTS: Endpoint[] = [
  { method: 'GET', path: '/api/medications', description: 'Medicamentos publico', auth: false, queryParams: 'search=ibuprofeno' },
  { method: 'GET', path: '/api/doctors', description: 'Listar doctores', auth: false },
  { method: 'GET', path: '/api/patient/search-medications', description: 'Buscar medicamentos', auth: false, queryParams: 'q=ibuprofeno' },
  { method: 'GET', path: '/api/patient/nearby-pharmacies', description: 'Farmacias cercanas', auth: false, queryParams: 'lat=12.1149&lng=-86.2714' },
  { method: 'GET', path: '/api/patient/nearby-clinics', description: 'Clinicas cercanas', auth: false, queryParams: 'lat=12.1149&lng=-86.2714' },
  { method: 'GET', path: '/api/reviews', description: 'Listar resenas', auth: false },
];

export default function OasisApiDashboard() {
  const [token, setToken] = useState('');
  const [response, setResponse] = useState<{ status: number; data: string; time: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null);
  const [bodyText, setBodyText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [testResults, setTestResults] = useState<Array<{ method: string; path: string; status: number; time: number; error?: string }>>([]);
  const [runningTest, setRunningTest] = useState(false);
  const [dbCategory, setDbCategory] = useState('Todos');
  const [dbSearch, setDbSearch] = useState('');
  const [dbViewMode, setDbViewMode] = useState<'tabla' | 'diagrama'>('tabla');
  const [diagramZoom, setDiagramZoom] = useState(1);
  const [diagramPan, setDiagramPan] = useState({ x: 0, y: 0 });
  const [highlightedTable, setHighlightedTable] = useState<string | null>(null);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewportRect, setViewportRect] = useState({ vx: 0, vy: 0, vw: 0, vh: 0 });
  const [focusedTable, setFocusedTable] = useState<string | null>(null);
  const diagramContainerRef = useRef<HTMLDivElement>(null);

  const documentedEndpoints = API_MODULES.reduce((sum, m) => sum + m.endpoints.length, 0);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setResponse(null);
    const start = Date.now();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      const t = data.data?.accessToken || data.data?.token || '';
      if (t) setToken(t);
      setResponse({ status: res.status, data: JSON.stringify(data, null, 2), time: Date.now() - start });
    } catch (err) {
      setResponse({ status: 0, data: `Error de conexion: ${err}`, time: Date.now() - start });
    }
    setLoading(false);
  }, []);

  const testEndpoint = useCallback(async (ep: Endpoint) => {
    setLoading(true);
    setResponse(null);
    setActiveEndpoint(ep.path + ep.method);
    const start = Date.now();
    try {
      let url = ep.path;
      if (ep.queryParams) {
        const params = new URLSearchParams();
        ep.queryParams.split('&').forEach(p => {
          const [k, v] = p.split('=');
          if (v) params.set(k, v);
        });
        url += '?' + params.toString();
      }
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (ep.auth && token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, {
        method: ep.method,
        headers,
        body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(ep.method) ? (bodyText || ep.body || undefined) : undefined,
      });
      const data = await res.json();
      setResponse({ status: res.status, data: JSON.stringify(data, null, 2), time: Date.now() - start });
    } catch (err) {
      setResponse({ status: 0, data: `Error de conexion: ${err}`, time: Date.now() - start });
    }
    setLoading(false);
  }, [token, bodyText]);

  const runMassiveTest = useCallback(async () => {
    setRunningTest(true);
    setTestResults([]);
    const results: Array<{ method: string; path: string; status: number; time: number; error?: string }> = [];

    // Login con todos los roles para tener tokens
    const roleLogins: Record<string, string> = {};
    const loginAttempts = [
      { role: 'patient', email: 'carlos@email.com', password: 'Patient2025!' },
      { role: 'superadmin', email: 'superadmin@oasis.nii', password: 'Oasis2025!' },
      { role: 'clinic_admin', email: 'admin@santamaria.nii', password: 'Clinic2025!' },
      { role: 'doctor', email: 'dr.garcia@santamaria.nii', password: 'Doctor2025!' },
      { role: 'receptionist', email: 'recepcion@santamaria.nii', password: 'Recep2025!' },
      { role: 'pharmacy_admin', email: 'admin@farmaciacentral.nii', password: 'Pharmacy2025!' },
      { role: 'pharmacy_staff', email: 'vendedor@farmaciacentral.nii', password: 'Staff2025!' },
      { role: 'delivery', email: 'repartidor1@oasis.nii', password: 'Delivery2025!' },
    ];
    for (const attempt of loginAttempts) {
      try {
        const lr = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: attempt.email, password: attempt.password }),
        });
        const ld = await lr.json();
        if (ld.data?.accessToken) roleLogins[attempt.role] = ld.data.accessToken;
      } catch { /* sin token */ }
    }

    // Seleccionar el token mas permisivo (superadmin > clinic_admin > doctor > pharmacy_admin > patient)
    const pickToken = (roles?: string[]) => {
      if (!roles || roles.length === 0) return roleLogins['superadmin'] || roleLogins['patient'] || '';
      for (const r of roles) {
        const mapped = r === 'clinic_admin' ? 'clinic_admin' : r === 'pharmacy_admin' ? 'pharmacy_admin' : r === 'pharmacy_staff' ? 'pharmacy_staff' : r === 'delivery_person' ? 'delivery' : r === 'superadmin' ? 'superadmin' : r === 'doctor' ? 'doctor' : r === 'receptionist' ? 'receptionist' : r === 'patient' ? 'patient' : r;
        if (roleLogins[mapped]) return roleLogins[mapped];
      }
      return roleLogins['superadmin'] || roleLogins['patient'] || '';
    };

    // Probar todos los endpoints documentados con el rol correcto
    for (const mod of API_MODULES) {
      for (const ep of mod.endpoints) {
        const start = Date.now();
        try {
          let url = ep.path;
          // Reemplazar {id}, {branchId}, {orderId} con IDs de prueba
          url = url.replace(/\{id\}/g, 'test-id-123');
          url = url.replace(/\{branchId\}/g, 'test-branch-123');
          url = url.replace(/\{orderId\}/g, 'test-order-123');
          url = url.replace(/\{memberId\}/g, 'test-member-123');
          if (ep.queryParams) {
            const params = new URLSearchParams();
            ep.queryParams.split('&').forEach(p => {
              const [k, v] = p.split('=');
              if (v) params.set(k, v);
            });
            url += '?' + params.toString();
          }
          const token = pickToken(ep.roles);
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (ep.auth && token) headers['Authorization'] = `Bearer ${token}`;

          const res = await fetch(url, {
            method: ep.method,
            headers,
            body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(ep.method) ? (ep.body || undefined) : undefined,
          });
          results.push({ method: ep.method, path: ep.path, status: res.status, time: Date.now() - start });
        } catch (err) {
          results.push({ method: ep.method, path: ep.path, status: 0, time: Date.now() - start, error: String(err) });
        }
        setTestResults([...results]);
      }
    }
    setRunningTest(false);
  }, []);

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); };

  const filteredModules = API_MODULES.map(m => ({
    ...m,
    endpoints: m.endpoints.filter(ep =>
      !searchFilter ||
      ep.path.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ep.method.toLowerCase().includes(searchFilter.toLowerCase())
    ),
  })).filter(m => m.endpoints.length > 0);

  const okCount = testResults.filter(r => r.status >= 200 && r.status < 300).length;
  const errCount = testResults.filter(r => r.status >= 400 || r.status === 0).length;
  const authCount = testResults.filter(r => r.status === 401).length;

  // ER Diagram: compute node positions for each table (memoized)
  const diagramLayout = useMemo(() => {
    const NODE_W = 300;
    const HEADER_H = 32;
    const FIELD_H = 22;
    const GAP_X = 400;
    const CATEGORY_HEADER_H = 40;
    const CATEGORY_PAD = 20;

    // Group tables by category
    const catGroups: Record<string, DbTable[]> = {};
    DB_SCHEMA.forEach(t => {
      if (dbCategory !== 'Todos' && t.category !== dbCategory) return;
      if (dbSearch && !t.name.toLowerCase().includes(dbSearch.toLowerCase())) return;
      if (!catGroups[t.category]) catGroups[t.category] = [];
      catGroups[t.category].push(t);
    });

    // Compute per-table heights
    const nodeHeight = (t: DbTable) => HEADER_H + t.fields.length * FIELD_H + 8;

    const nodes: Record<string, { x: number; y: number; table: DbTable; w: number; h: number }> = {};
    const catRects: { cat: string; x: number; y: number; w: number; h: number }[] = [];
    const cats = Object.keys(catGroups);
    let globalY = 40;

    cats.forEach(cat => {
      const tables = catGroups[cat];
      // Layout tables in rows of max 4
      const COLS = 4;
      const rows = Math.ceil(tables.length / COLS);

      // Compute row heights first
      const rowHeights: number[] = [];
      for (let r = 0; r < rows; r++) {
        const rowTables = tables.slice(r * COLS, (r + 1) * COLS);
        rowHeights.push(Math.max(...rowTables.map(tt => nodeHeight(tt))));
      }

      let currentY = globalY + CATEGORY_HEADER_H;
      tables.forEach((t, i) => {
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        const h = nodeHeight(t);
        nodes[t.name] = {
          x: 40 + col * GAP_X,
          y: currentY,
          table: t,
          w: NODE_W,
          h,
        };
        // If last in row, advance Y
        if ((i + 1) % COLS === 0 || i === tables.length - 1) {
          currentY += rowHeights[row] + 100;
        }
      });

      const catW = Math.min(tables.length, COLS) * GAP_X + 40;
      catRects.push({
        cat,
        x: 20,
        y: globalY,
        w: catW,
        h: currentY - globalY + 20,
      });
      globalY = currentY + CATEGORY_PAD;
    });

    // Build edges from relations (deduplicate)
    const edgeSet = new Set<string>();
    const edges: { from: string; to: string; relType: string; fromField: string; toField: string }[] = [];

    Object.values(nodes).forEach(({ table }) => {
      table.fields.forEach(f => {
        if (f.relation && nodes[f.relation.to] && f.relation.type !== '1:N') {
          const key = [table.name, f.relation.to].sort().join('->');
          if (!edgeSet.has(key)) {
            edgeSet.add(key);
            edges.push({
              from: table.name,
              to: f.relation.to,
              relType: f.relation.type,
              fromField: f.name,
              toField: f.relation.field,
            });
          }
        }
      });
    });

    const svgW = Math.max(1600, ...Object.values(nodes).map(n => n.x + n.w + 80));
    const svgH = Math.max(800, ...Object.values(nodes).map(n => n.y + n.h + 80));

    return { nodes, edges, svgW, svgH, NODE_W, HEADER_H, FIELD_H, catRects };
  }, [dbCategory, dbSearch]);

  // Focus layout: radial arrangement around a selected table
  const focusLayout = useMemo(() => {
    if (!focusedTable) return null;
    const table = DB_SCHEMA.find(t => t.name === focusedTable);
    if (!table) return null;

    const CENTER_W = 380;
    const CENTER_HEADER_H = 38;
    const CENTER_FIELD_H = 24;
    const REL_W = 280;
    const REL_HEADER_H = 34;
    const REL_FIELD_H = 22;

    // Categorize relations
    type RelInfo = { tableName: string; relType: string; direction: 'parent' | 'child' | 'peer'; field: string; fkField: string };
    const parents: RelInfo[] = [];   // N:1 - this table belongs to...
    const children: RelInfo[] = [];  // 1:N - this table has many...
    const peers: RelInfo[] = [];     // 1:1 - one-to-one

    table.fields.forEach(f => {
      if (!f.relation) return;
      const relTable = DB_SCHEMA.find(t => t.name === f.relation!.to);
      if (!relTable) return;

      if (f.relation.type === 'N:1') {
        parents.push({ tableName: f.relation.to, relType: f.relation.type, direction: 'parent', field: f.name, fkField: f.relation.field });
      } else if (f.relation.type === '1:N') {
        children.push({ tableName: f.relation.to, relType: f.relation.type, direction: 'child', field: f.name, fkField: f.relation.field });
      } else if (f.relation.type === '1:1') {
        peers.push({ tableName: f.relation.to, relType: f.relation.type, direction: 'peer', field: f.name, fkField: f.relation.field });
      }
    });

    // Also find tables that reference THIS table (reverse relations)
    DB_SCHEMA.forEach(otherTable => {
      if (otherTable.name === focusedTable) return;
      otherTable.fields.forEach(f => {
        if (!f.relation || f.relation.to !== focusedTable) return;
        // Check if already captured
        const alreadyInParents = parents.some(p => p.tableName === otherTable.name);
        const alreadyInChildren = children.some(c => c.tableName === otherTable.name);
        const alreadyInPeers = peers.some(p => p.tableName === otherTable.name);
        if (alreadyInParents || alreadyInChildren || alreadyInPeers) return;

        if (f.relation.type === 'N:1') {
          // otherTable belongs to focusedTable => focusedTable has many otherTable
          children.push({ tableName: otherTable.name, relType: '1:N', direction: 'child', field: f.relation.field, fkField: f.name });
        } else if (f.relation.type === '1:N') {
          parents.push({ tableName: otherTable.name, relType: 'N:1', direction: 'parent', field: f.relation.field, fkField: f.name });
        } else if (f.relation.type === '1:1') {
          peers.push({ tableName: otherTable.name, relType: '1:1', direction: 'peer', field: f.relation.field, fkField: f.name });
        }
      });
    });

    // Build focus nodes
    const focusNodes: Record<string, { x: number; y: number; table: DbTable; w: number; h: number; group: 'center' | 'parent' | 'child' | 'peer'; relType?: string; relField?: string; relFkField?: string }> = {};

    // Center table
    const centerH = CENTER_HEADER_H + table.fields.length * CENTER_FIELD_H + 12;
    focusNodes[focusedTable] = {
      x: 0, y: 0,
      table, w: CENTER_W, h: centerH, group: 'center',
    };

    // Compute heights for related tables - show only key fields (PK + FKs + first 3 scalar fields)
    const getKeyFields = (t: DbTable): DbField[] => {
      const pks = t.fields.filter(f => f.isId);
      const fks = t.fields.filter(f => f.relation && !f.isList);
      const lists = t.fields.filter(f => f.relation && f.isList);
      const scalars = t.fields.filter(f => !f.isId && !f.relation).slice(0, 3);
      return [...pks, ...fks, ...scalars, ...lists];
    };

    const PARENT_GAP = 50;
    const CHILD_GAP = 50;
    const PEER_GAP = 50;
    const H_GAP = 120; // horizontal distance from center

    // Layout parents (LEFT side) - top to bottom
    let parentY = -((parents.length - 1) * (200 + PARENT_GAP)) / 2;
    parents.forEach((rel, i) => {
      const relTable = DB_SCHEMA.find(t => t.name === rel.tableName);
      if (!relTable) return;
      const keyFields = getKeyFields(relTable);
      const h = REL_HEADER_H + keyFields.length * REL_FIELD_H + 10;
      focusNodes[rel.tableName] = {
        x: -REL_W - H_GAP,
        y: parentY + i * (h + PARENT_GAP),
        table: { ...relTable, fields: keyFields } as DbTable,
        w: REL_W, h, group: 'parent',
        relType: rel.relType, relField: rel.field, relFkField: rel.fkField,
      };
    });

    // Layout children (RIGHT side) - top to bottom
    let childY = -((children.length - 1) * (200 + CHILD_GAP)) / 2;
    children.forEach((rel, i) => {
      const relTable = DB_SCHEMA.find(t => t.name === rel.tableName);
      if (!relTable) return;
      const keyFields = getKeyFields(relTable);
      const h = REL_HEADER_H + keyFields.length * REL_FIELD_H + 10;
      focusNodes[rel.tableName] = {
        x: CENTER_W + H_GAP,
        y: childY + i * (h + CHILD_GAP),
        table: { ...relTable, fields: keyFields } as DbTable,
        w: REL_W, h, group: 'child',
        relType: rel.relType, relField: rel.field, relFkField: rel.fkField,
      };
    });

    // Layout peers (TOP) - left to right
    const peerStartX = -((peers.length - 1) * (REL_W + PEER_GAP)) / 2;
    peers.forEach((rel, i) => {
      const relTable = DB_SCHEMA.find(t => t.name === rel.tableName);
      if (!relTable) return;
      const keyFields = getKeyFields(relTable);
      const h = REL_HEADER_H + keyFields.length * REL_FIELD_H + 10;
      focusNodes[rel.tableName] = {
        x: peerStartX + i * (REL_W + PEER_GAP) + (CENTER_W - REL_W) / 2,
        y: -(h + 100),
        table: { ...relTable, fields: keyFields } as DbTable,
        w: REL_W, h, group: 'peer',
        relType: rel.relType, relField: rel.field, relFkField: rel.fkField,
      };
    });

    // Build edges from center to all related
    const focusEdges: { from: string; to: string; relType: string; fromField: string; toField: string; group: string }[] = [];
    [...parents, ...children, ...peers].forEach(rel => {
      focusEdges.push({
        from: focusedTable,
        to: rel.tableName,
        relType: rel.relType,
        fromField: rel.field,
        toField: rel.fkField,
        group: rel.direction,
      });
    });

    // Compute bounding box and center everything
    const allNodes = Object.values(focusNodes);
    const minX = Math.min(...allNodes.map(n => n.x));
    const maxX = Math.max(...allNodes.map(n => n.x + n.w));
    const minY = Math.min(...allNodes.map(n => n.y));
    const maxY = Math.max(...allNodes.map(n => n.y + n.h));
    const offsetX = -minX + 60;
    const offsetY = -minY + 80;

    Object.values(focusNodes).forEach(n => { n.x += offsetX; n.y += offsetY; });

    const svgW = maxX - minX + 120;
    const svgH = maxY - minY + 160;

    return {
      focusNodes, focusEdges, svgW, svgH,
      CENTER_W, CENTER_HEADER_H, CENTER_FIELD_H,
      REL_W, REL_HEADER_H, REL_FIELD_H,
      parents, children, peers,
    };
  }, [focusedTable]);

  // Wheel event with passive:false for zoom
  useEffect(() => {
    const container = diagramContainerRef.current;
    if (!container) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setDiagramZoom(z => Math.min(3, Math.max(0.15, z + (e.deltaY > 0 ? -0.1 : 0.1))));
    };
    container.addEventListener('wheel', handler, { passive: false });
    return () => container.removeEventListener('wheel', handler);
  }, []);

  // Update mini-map viewport indicator
  useEffect(() => {
    const container = diagramContainerRef.current;
    if (!container) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const vx = -diagramPan.x / diagramZoom;
    const vy = -diagramPan.y / diagramZoom;
    const vw = cw / diagramZoom;
    const vh = ch / diagramZoom;
    setViewportRect({ vx, vy, vw, vh });
  }, [diagramZoom, diagramPan]);

  // Fit to screen
  const fitToScreen = useCallback(() => {
    const container = diagramContainerRef.current;
    if (!container) return;
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    const scaleX = containerW / diagramLayout.svgW;
    const scaleY = containerH / diagramLayout.svgH;
    const scale = Math.min(scaleX, scaleY) * 0.9;
    setDiagramZoom(scale);
    setDiagramPan({ x: (containerW - diagramLayout.svgW * scale) / 2, y: (containerH - diagramLayout.svgH * scale) / 2 });
  }, [diagramLayout.svgW, diagramLayout.svgH]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Image src="/oasis-logo.png" alt="Oasis - Colibri mascot" width={36} height={36} className="rounded-full" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">OASIS API</h1>
              <p className="text-xs text-gray-500">&quot;Tu base de salud&quot; -- Backend API</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs font-mono">{TOTAL_ENDPOINTS} endpoints</Badge>
            <Badge variant="outline" className="text-xs font-mono">{TOTAL_RUTAS} rutas</Badge>
            <Badge variant="outline" className="text-xs font-mono">{TOTAL_TABLAS} tablas</Badge>
            <Badge variant="outline" className="text-xs font-mono">{TOTAL_MODULOS} modulos</Badge>
            {token && <Badge className="bg-green-600 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Autenticado</Badge>}
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        <Tabs defaultValue="credentials" className="w-full">
          <TabsList className="grid grid-cols-6 mb-6">
            <TabsTrigger value="credentials"><Key className="w-4 h-4 mr-1" />Credenciales</TabsTrigger>
            <TabsTrigger value="endpoints"><Server className="w-4 h-4 mr-1" />Endpoints</TabsTrigger>
            <TabsTrigger value="database"><Database className="w-4 h-4 mr-1" />Base de Datos</TabsTrigger>
            <TabsTrigger value="tester"><Activity className="w-4 h-4 mr-1" />Tester</TabsTrigger>
            <TabsTrigger value="masstest"><PlayCircle className="w-4 h-4 mr-1" />Test Masivo</TabsTrigger>
            <TabsTrigger value="apidoc"><BookOpen className="w-4 h-4 mr-1" />API Doc</TabsTrigger>
          </TabsList>

          {/* CREDENCIALES */}
          <TabsContent value="credentials">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Cuentas de Prueba</CardTitle>
                  <CardDescription>Haz clic en &quot;Login&quot; para autenticarte</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {TEST_ACCOUNTS.map((acc, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${acc.color} flex items-center justify-between gap-2`}>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">{acc.role}</div>
                          <div className="text-xs font-mono truncate">{acc.email}</div>
                          <div className="text-xs font-mono opacity-70">{acc.password}</div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => login(acc.email, acc.password)} disabled={loading}>
                          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Login'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Key className="w-5 h-5" />Token JWT</CardTitle>
                  <CardDescription>Token de autenticacion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Input placeholder="Pega tu token aqui o haz login" value={token} onChange={e => setToken(e.target.value)} className="font-mono text-xs" />
                    {token ? (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs text-green-700 font-medium mb-1">Token activo</p>
                        <p className="text-xs font-mono text-green-600 break-all">{token.substring(0, 60)}...</p>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs text-amber-700">Sin token. Muchos endpoints requieren autenticacion.</p>
                      </div>
                    )}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs">
                      <p className="text-blue-700 font-medium mb-1">Formato Authorization Header:</p>
                      <code className="font-mono text-blue-800">Authorization: Bearer {'<token>'}</code>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border text-xs">
                      <p className="font-medium mb-1">Flujo de Autenticacion:</p>
                      <ol className="text-gray-600 space-y-1 list-decimal list-inside">
                        <li>POST /api/auth/login -- recibir accessToken + refreshToken</li>
                        <li>Usar accessToken en header Authorization: Bearer</li>
                        <li>Al expirar (15min), POST /api/auth/refresh con refreshToken</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ENDPOINTS */}
          <TabsContent value="endpoints">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="Buscar endpoints por path, metodo o descripcion..." value={searchFilter} onChange={e => setSearchFilter(e.target.value)} className="pl-10" />
              </div>
              <Accordion type="multiple" className="space-y-2">
                {filteredModules.map((mod, mi) => (
                  <AccordionItem key={mi} value={`mod-${mi}`} className="bg-white rounded-lg border px-4">
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${mod.color}`} />
                        <span className="font-semibold text-sm">{mod.name}</span>
                        <Badge variant="secondary" className="text-xs">{mod.endpoints.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pb-2">
                        {mod.endpoints.map((ep, ei) => (
                          <div key={ei} className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors ${activeEndpoint === ep.path + ep.method ? 'bg-blue-50 ring-1 ring-blue-200' : ''}`} onClick={() => testEndpoint(ep)}>
                            <span className={`${METHOD_COLORS[ep.method] || 'bg-gray-500'} text-white text-xs font-bold px-2 py-0.5 rounded min-w-[52px] text-center`}>{ep.method}</span>
                            <code className="text-xs font-mono text-gray-700 flex-1 truncate">{ep.path}</code>
                            <span className="text-xs text-gray-400 hidden md:inline truncate max-w-[200px]">{ep.description}</span>
                            {ep.auth && <span className="text-xs text-amber-600 font-bold">AUTH</span>}
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={e => { e.stopPropagation(); copyToClipboard(ep.path); }}><Copy className="w-3 h-3" /></Button>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>

          {/* BASE DE DATOS */}
          <TabsContent value="database">
            <div className="space-y-4">
              {/* Header with stats + view toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-[#0E8C5E]" />
                    Esquema de Base de Datos
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {DB_SCHEMA.length} modelos Prisma · {DB_SCHEMA.reduce((s, t) => s + t.fields.length, 0)} campos · {DB_SCHEMA.reduce((s, t) => s + t.fields.filter(f => f.relation).length, 0)} relaciones
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* View mode toggle */}
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <Button
                      size="sm"
                      variant={dbViewMode === 'tabla' ? 'default' : 'ghost'}
                      className="h-8 text-xs rounded-none"
                      onClick={() => setDbViewMode('tabla')}
                    >
                      <Table2 className="w-3.5 h-3.5 mr-1" />Tabla
                    </Button>
                    <Button
                      size="sm"
                      variant={dbViewMode === 'diagrama' ? 'default' : 'ghost'}
                      className="h-8 text-xs rounded-none"
                      onClick={() => setDbViewMode('diagrama')}
                    >
                      <GitBranch className="w-3.5 h-3.5 mr-1" />Diagrama
                    </Button>
                  </div>
                  <div className="relative w-full sm:w-48">
                    <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar tabla..."
                      value={dbSearch}
                      onChange={e => setDbSearch(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Category filter buttons */}
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant={dbCategory === 'Todos' ? 'default' : 'outline'}
                  onClick={() => setDbCategory('Todos')}
                  className="h-7 text-xs"
                >
                  <Table2 className="w-3 h-3 mr-1" />Todos ({DB_SCHEMA.length})
                </Button>
                {DB_CATEGORIES.map(cat => {
                  const count = DB_SCHEMA.filter(t => t.category === cat).length;
                  return (
                    <Button
                      key={cat}
                      size="sm"
                      variant={dbCategory === cat ? 'default' : 'outline'}
                      onClick={() => setDbCategory(cat)}
                      className="h-7 text-xs"
                    >
                      {cat} ({count})
                    </Button>
                  );
                })}
              </div>

              {/* Tabla view */}
              {dbViewMode === 'tabla' && (
              <Accordion type="multiple" className="space-y-2">
                {DB_SCHEMA
                  .filter(t => dbCategory === 'Todos' || t.category === dbCategory)
                  .filter(t => !dbSearch || t.name.toLowerCase().includes(dbSearch.toLowerCase()))
                  .map(table => {
                    const relationFields = table.fields.filter(f => f.relation);
                    const scalarFields = table.fields.filter(f => !f.relation);
                    const pkField = table.fields.find(f => f.isId);
                    return (
                      <AccordionItem key={table.name} value={table.name} className="border rounded-lg overflow-hidden bg-white">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 [&[data-state=open]]:bg-gray-50">
                          <div className="flex items-center gap-3 text-left flex-1 min-w-0">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0E8C5E]/10 text-[#0E8C5E] shrink-0">
                              <Table2 className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-gray-900 font-mono">{table.name}</span>
                                <Badge variant="secondary" className="text-[10px] h-4 shrink-0">{table.category}</Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><Fingerprint className="w-3 h-3" />{pkField?.name || 'id'}: {pkField?.type}</span>
                                <span>{scalarFields.length} campos</span>
                                {relationFields.length > 0 && (
                                  <span className="flex items-center gap-1 text-[#0E8C5E]"><Link2 className="w-3 h-3" />{relationFields.length} rel.</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="overflow-x-auto -mx-4 px-4">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b text-left text-gray-500">
                                  <th className="py-2 pr-3 font-medium min-w-[140px]">Campo</th>
                                  <th className="py-2 pr-3 font-medium min-w-[90px]">Tipo</th>
                                  <th className="py-2 pr-3 font-medium min-w-[120px]">Constraints</th>
                                  <th className="py-2 font-medium">Relacion</th>
                                </tr>
                              </thead>
                              <tbody>
                                {table.fields.map(field => (
                                  <tr key={field.name} className={`border-b border-gray-100 ${field.isId ? 'bg-amber-50/50' : field.relation ? 'bg-sky-50/50' : ''}`}>
                                    <td className="py-1.5 pr-3">
                                      <div className="flex items-center gap-1.5">
                                        {field.isId && <KeyRound className="w-3 h-3 text-amber-600 shrink-0" />}
                                        {field.relation && <Link2 className="w-3 h-3 text-sky-600 shrink-0" />}
                                        <code className={`font-mono font-medium ${field.isId ? 'text-amber-700' : field.relation ? 'text-sky-700' : 'text-gray-800'}`}>
                                          {field.name}
                                        </code>
                                      </div>
                                    </td>
                                    <td className="py-1.5 pr-3">
                                      <code className="font-mono text-gray-600">{field.type.replace(/[\?\[\]]/g, '')}</code>
                                      {field.isList && <span className="text-gray-400 ml-0.5">[]</span>}
                                    </td>
                                    <td className="py-1.5 pr-3">
                                      <div className="flex flex-wrap gap-1">
                                        {field.isId && <Badge className="bg-amber-100 text-amber-700 text-[10px] h-4 px-1.5">PK</Badge>}
                                        {field.isUnique && <Badge className="bg-purple-100 text-purple-700 text-[10px] h-4 px-1.5">Unique</Badge>}
                                        {field.isOptional && <Badge className="bg-gray-100 text-gray-600 text-[10px] h-4 px-1.5">Optional</Badge>}
                                        {field.default && <Badge className="bg-green-100 text-green-700 text-[10px] h-4 px-1.5">= {field.default}</Badge>}
                                      </div>
                                    </td>
                                    <td className="py-1.5">
                                      {field.relation ? (
                                        <div className="flex items-center gap-1 text-sky-700">
                                          <ChevronRight className="w-3 h-3" />
                                          <code className="font-mono text-[11px]">{field.relation.to}</code>
                                          <span className="text-sky-500 text-[10px]">({field.relation.type})</span>
                                        </div>
                                      ) : (
                                        <span className="text-gray-300">—</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
              </Accordion>
              )}

              {/* Diagrama view */}
              {dbViewMode === 'diagrama' && (
              <div className="space-y-3">
                {/* Toolbar */}
                <div className="flex items-center gap-2 flex-wrap">
                  {focusedTable ? (
                    <>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setFocusedTable(null)}>
                        <ArrowLeft className="w-3.5 h-3.5 mr-1" />Volver
                      </Button>
                      <Badge className="bg-emerald-600 text-xs h-7">
                        <GitBranch className="w-3 h-3 mr-1" />Foco: {focusedTable}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        Click en tabla relacionada para cambiar foco
                      </span>
                    </>
                  ) : (
                    <div className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                      <ZoomIn className="w-3.5 h-3.5" />
                      Click en una tabla para enfocar y ver relaciones
                    </div>
                  )}
                </div>

                {/* ====== FOCUS MODE ====== */}
                {focusedTable && focusLayout && (
                <div className="relative rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/40 via-white to-indigo-50/30 overflow-auto" style={{ minHeight: '70vh' }}>
                  {/* Flow header */}
                  <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b px-4 py-2 flex items-center justify-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-indigo-500" />
                      <span className="text-sm font-bold text-indigo-700">Pertenece a ({focusLayout.parents.length})</span>
                      <span className="text-indigo-400 text-lg font-bold">&larr;</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-100 px-3 py-1 rounded-full">
                      <Fingerprint className="w-4 h-4 text-emerald-600" />
                      <span className="text-base font-extrabold text-emerald-700">{focusedTable}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-400 text-lg font-bold">&rarr;</span>
                      <span className="text-sm font-bold text-amber-700">Tiene muchos ({focusLayout.children.length})</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                    </div>
                    {focusLayout.peers.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-violet-400 text-lg font-bold">&harr;</span>
                        <span className="text-sm font-bold text-violet-700">Uno a uno ({focusLayout.peers.length})</span>
                        <span className="w-3.5 h-3.5 rounded-full bg-violet-500" />
                      </div>
                    )}
                  </div>

                  {/* Main layout: Parents | Center | Children */}
                  <div className="flex gap-3 p-4 items-start">
                    {/* LEFT: Parents (N:1 - tables this belongs to) */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="text-center">
                        <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1">
                          <span className="text-sm">&larr;</span>
                          <span className="text-sm font-bold text-indigo-700">PERTENECE A</span>
                        </div>
                      </div>
                      {focusLayout.parents.length === 0 && (
                        <div className="text-center text-xs text-gray-300 py-10 italic">Sin tablas padre</div>
                      )}
                      {focusLayout.parents.map((rel) => {
                        const relTable = DB_SCHEMA.find(t => t.name === rel.tableName);
                        if (!relTable) return null;
                        const colors = CATEGORY_COLORS[relTable.category] || { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-800', fill: '#F3F4F6' };
                        const keyFields = [...relTable.fields.filter(f => f.isId), ...relTable.fields.filter(f => f.relation && !f.isList).slice(0, 4)];
                        const otherCount = relTable.fields.length - keyFields.length;
                        return (
                          <div
                            key={`parent-${rel.tableName}-${rel.field}`}
                            onClick={() => setFocusedTable(rel.tableName)}
                            className="cursor-pointer border-2 border-indigo-300 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] bg-white hover:border-indigo-500"
                          >
                            <div className={`px-4 py-3 ${colors.bg} flex items-center justify-between`}>
                              <span className={`font-bold text-base ${colors.text}`}>{rel.tableName}</span>
                              <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2.5 py-0.5 rounded-full">N:1</span>
                            </div>
                            <div className="p-3 space-y-1">
                              {keyFields.map((f, fi) => (
                                <div key={fi} className="flex items-center gap-1.5 text-sm">
                                  {f.isId ? <span className="text-amber-600 text-xs">PK</span> : <span className="text-cyan-600 text-xs">FK</span>}
                                  <span className={f.isId ? 'font-bold text-amber-800' : 'font-semibold text-cyan-800'}>{f.name}</span>
                                  <span className="ml-auto text-gray-400 text-xs">{f.type}</span>
                                </div>
                              ))}
                              {otherCount > 0 && <div className="text-xs text-gray-400 pt-0.5">+{otherCount} campos mas</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* CENTER: Focused table (BIG) */}
                    <div className="w-[580px] flex-shrink-0">
                      {(() => {
                        const table = DB_SCHEMA.find(t => t.name === focusedTable);
                        if (!table) return null;
                        return (
                          <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-emerald-400 bg-white">
                            <div className="bg-emerald-600 px-6 py-5 text-white">
                              <div className="text-2xl font-extrabold tracking-tight">{table.name}</div>
                              <div className="text-sm opacity-80 mt-1">{table.category} &middot; {table.fields.length} campos</div>
                            </div>
                            <div className="p-4 max-h-[58vh] overflow-y-auto space-y-0" style={{ scrollbarWidth: 'thin', scrollbarColor: '#0E8C5E #f0fdf4' }}>
                              {table.fields.map((f, fi) => {
                                const isPk = f.isId;
                                const isFk = !!f.relation && !f.isList;
                                const isListField = !!f.relation && f.isList;
                                const isOpt = f.isOptional;
                                return (
                                  <div key={fi} className={`flex items-center gap-2 text-sm py-1.5 px-1 ${fi > 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-50 rounded`}>
                                    <span className="w-6 flex-shrink-0 text-center">
                                      {isPk && <span className="text-amber-600 font-bold text-xs bg-amber-50 rounded px-1">PK</span>}
                                      {isFk && !isPk && <span className="text-cyan-600 font-bold text-xs bg-cyan-50 rounded px-1">FK</span>}
                                      {isListField && !isPk && !isFk && <span className="text-violet-600 font-bold text-xs">[]</span>}
                                      {!isPk && !isFk && !isListField && <span className="text-gray-300">&middot;</span>}
                                    </span>
                                    <span className={`${isPk ? 'font-bold text-amber-900' : isFk ? 'font-semibold text-cyan-900' : isListField ? 'font-semibold text-violet-700' : 'text-gray-700'} ${isOpt ? 'italic opacity-80' : ''}`}>
                                      {f.name}
                                    </span>
                                    <span className="ml-auto text-gray-500 text-xs font-mono">{f.type.replace('?', '')}</span>
                                    {isOpt && <span className="text-xs text-gray-300">?</span>}
                                    {f.relation && (
                                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${f.relation.type === 'N:1' ? 'bg-indigo-50 text-indigo-600' : f.relation.type === '1:N' ? 'bg-amber-50 text-amber-600' : 'bg-violet-50 text-violet-600'}`}>
                                        {f.relation.type}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {/* Flow summary footer */}
                            <div className="bg-gray-50 px-4 py-3 border-t flex items-center justify-center gap-4 text-xs">
                              {focusLayout.parents.length > 0 && (
                                <span className="text-indigo-600 font-semibold">&larr; {focusLayout.parents.length} padre{focusLayout.parents.length > 1 ? 's' : ''}</span>
                              )}
                              {focusLayout.children.length > 0 && (
                                <span className="text-amber-600 font-semibold">{focusLayout.children.length} hijo{focusLayout.children.length > 1 ? 's' : ''} &rarr;</span>
                              )}
                              {focusLayout.peers.length > 0 && (
                                <span className="text-violet-600 font-semibold">&harr; {focusLayout.peers.length} par</span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* RIGHT: Children (1:N - tables this has many of) */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="text-center">
                        <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                          <span className="text-sm font-bold text-amber-700">TIENE MUCHOS</span>
                          <span className="text-sm">&rarr;</span>
                        </div>
                      </div>
                      {focusLayout.children.length === 0 && (
                        <div className="text-center text-xs text-gray-300 py-10 italic">Sin tablas hijas</div>
                      )}
                      {focusLayout.children.map((rel) => {
                        const relTable = DB_SCHEMA.find(t => t.name === rel.tableName);
                        if (!relTable) return null;
                        const colors = CATEGORY_COLORS[relTable.category] || { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-800', fill: '#F3F4F6' };
                        const keyFields = [...relTable.fields.filter(f => f.isId), ...relTable.fields.filter(f => f.relation && !f.isList).slice(0, 4)];
                        const otherCount = relTable.fields.length - keyFields.length;
                        return (
                          <div
                            key={`child-${rel.tableName}-${rel.field}`}
                            onClick={() => setFocusedTable(rel.tableName)}
                            className="cursor-pointer border-2 border-amber-300 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] bg-white hover:border-amber-500"
                          >
                            <div className={`px-4 py-3 ${colors.bg} flex items-center justify-between`}>
                              <span className={`font-bold text-base ${colors.text}`}>{rel.tableName}</span>
                              <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-full">1:N</span>
                            </div>
                            <div className="p-3 space-y-1">
                              {keyFields.map((f, fi) => (
                                <div key={fi} className="flex items-center gap-1.5 text-sm">
                                  {f.isId ? <span className="text-amber-600 text-xs">PK</span> : <span className="text-cyan-600 text-xs">FK</span>}
                                  <span className={f.isId ? 'font-bold text-amber-800' : 'font-semibold text-cyan-800'}>{f.name}</span>
                                  <span className="ml-auto text-gray-400 text-xs">{f.type}</span>
                                </div>
                              ))}
                              {otherCount > 0 && <div className="text-xs text-gray-400 pt-0.5">+{otherCount} campos mas</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Peers section (1:1) */}
                  {focusLayout.peers.length > 0 && (
                    <div className="px-4 pb-4">
                      <div className="text-center mb-2">
                        <div className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-200 rounded-full px-3 py-1">
                          <span className="text-sm">&harr;</span>
                          <span className="text-sm font-bold text-violet-700">UNO A UNO</span>
                        </div>
                      </div>
                      <div className="flex gap-3 flex-wrap justify-center">
                        {focusLayout.peers.map((rel) => {
                          const relTable = DB_SCHEMA.find(t => t.name === rel.tableName);
                          if (!relTable) return null;
                          const colors = CATEGORY_COLORS[relTable.category] || { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-800', fill: '#F3F4F6' };
                          return (
                            <div
                              key={`peer-${rel.tableName}-${rel.field}`}
                              onClick={() => setFocusedTable(rel.tableName)}
                              className="cursor-pointer border-2 border-violet-300 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] bg-white w-56 hover:border-violet-500"
                            >
                              <div className={`px-4 py-3 ${colors.bg} flex items-center justify-between`}>
                                <span className={`font-bold text-base ${colors.text}`}>{rel.tableName}</span>
                                <span className="text-xs font-bold text-violet-600 bg-violet-100 px-2.5 py-0.5 rounded-full">1:1</span>
                              </div>
                              <div className="p-3 text-xs text-gray-400">{relTable.fields.length} campos</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                )}

                {/* ====== OVERVIEW MODE ====== */}
                {!focusedTable && (
                <div className="rounded-xl border bg-gradient-to-br from-gray-50 to-emerald-50/20 p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {DB_SCHEMA
                      .filter(t => (dbCategory === 'Todos' || t.category === dbCategory) && (!dbSearch || t.name.toLowerCase().includes(dbSearch.toLowerCase())))
                      .map(table => {
                        const colors = CATEGORY_COLORS[table.category] || { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-800', fill: '#F3F4F6' };
                        const relCount = table.fields.filter(f => f.relation).length;
                        const pkFields = table.fields.filter(f => f.isId);
                        const fkFields = table.fields.filter(f => f.relation && !f.isList);
                        return (
                          <div
                            key={table.name}
                            onClick={() => setFocusedTable(table.name)}
                            className={`cursor-pointer border-2 ${colors.border} rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all hover:scale-[1.04] active:scale-[0.97] bg-white`}
                          >
                            <div className={`px-4 py-3 ${colors.bg}`}>
                              <div className={`font-bold text-base ${colors.text} truncate`}>{table.name}</div>
                              <div className="text-xs text-gray-500 truncate">{table.category}</div>
                            </div>
                            <div className="p-3 space-y-1.5">
                              <div className="flex items-center gap-2 text-base text-gray-600">
                                <span className="font-semibold">{table.fields.length}</span> campos
                                <span className="text-gray-300">&middot;</span>
                                <span className="font-semibold">{relCount}</span> rel.
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {pkFields.map(f => (
                                  <span key={f.name} className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-semibold">PK:{f.name}</span>
                                ))}
                                {fkFields.slice(0, 2).map(f => (
                                  <span key={f.name} className="text-xs bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded font-semibold">FK:{f.name}</span>
                                ))}
                                {fkFields.length > 2 && (
                                  <span className="text-xs bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded">+{fkFields.length - 2}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 p-3 mt-3 bg-white/60 rounded-lg border text-xs">
                    <span className="font-medium text-gray-700">Categorias:</span>
                    {Object.entries(CATEGORY_COLORS).filter(([cat]) => {
                      if (dbCategory !== 'Todos') return cat === dbCategory;
                      return true;
                    }).map(([cat, clrs]) => (
                      <span key={cat} className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-sm border" style={{ backgroundColor: clrs.fill, borderColor: clrs.fill }} />
                        <span className="text-gray-600">{cat}</span>
                      </span>
                    ))}
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="flex items-center gap-1"><span className="text-amber-600 font-bold text-xs">PK</span> Primary Key</span>
                    <span className="flex items-center gap-1"><span className="text-cyan-600 font-bold text-xs">FK</span> Foreign Key</span>
                    <span className="flex items-center gap-1"><span className="text-violet-600 font-bold text-xs">[]</span> Lista</span>
                  </div>
                </div>
                )}
              </div>
              )}

              {/* Technical info footer */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-1 text-xs">
                <p className="font-semibold text-amber-800">Datos Tecnicos</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 text-amber-700">
                  <span>· BD: SQLite (via Prisma ORM)</span>
                  <span>· Moneda: NIO (Cordobas)</span>
                  <span>· Distancia: km (Haversine)</span>
                  <span>· Inventario: FEFO</span>
                  <span>· JWT: Access 15min + Refresh 7d</span>
                  <span>· Campos JSON: settings, schedule, allergies, etc.</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TESTER */}
          <TabsContent value="tester">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Request Builder</CardTitle>
                  <CardDescription>Construye y envia peticiones a la API</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">URL del Endpoint</label>
                    <Input placeholder="/api/auth/login" id="test-url" className="font-mono text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Metodo HTTP</label>
                    <select id="test-method" className="w-full h-9 rounded-md border px-3 text-sm">
                      <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Body (JSON)</label>
                    <Textarea placeholder='{"key": "value"}' value={bodyText} onChange={e => setBodyText(e.target.value)} className="font-mono text-xs min-h-[120px]" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Token (auto si hiciste login)</label>
                    <Input value={token} onChange={e => setToken(e.target.value)} placeholder="Bearer token" className="font-mono text-xs" />
                  </div>
                  <Button className="w-full" onClick={() => {
                    const url = (document.getElementById('test-url') as HTMLInputElement)?.value || '/api/auth/me';
                    const method = (document.getElementById('test-method') as HTMLSelectElement)?.value || 'GET';
                    testEndpoint({ method, path: url, description: '', auth: !!token, body: bodyText || undefined } as Endpoint);
                  }} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                    Enviar Request
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response</CardTitle>
                  <CardDescription>Respuesta del servidor</CardDescription>
                </CardHeader>
                <CardContent>
                  {response ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={response.status >= 200 && response.status < 300 ? 'bg-green-600' : response.status >= 400 ? 'bg-red-600' : 'bg-amber-600'}>
                          {response.status === 0 ? 'Error de red' : `${response.status}`}
                        </Badge>
                        <span className="text-xs text-gray-500">{response.time}ms</span>
                        {response.status >= 200 && response.status < 300 && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {response.status >= 400 && <XCircle className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="h-[400px] w-full rounded-md border bg-gray-900 p-3 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4ade80 #1f2937' }}>
                        <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap break-all">{response.data}</pre>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(response.data)} className="w-full">
                        <Copy className="w-3 h-3 mr-1" /> Copiar respuesta
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                      <Server className="w-12 h-12 mb-3" />
                      <p className="text-sm">Haz clic en un endpoint o envia un request</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TEST MASIVO */}
          <TabsContent value="masstest">
            <Card>
              <CardHeader>
                <CardTitle>Test Masivo de API</CardTitle>
                <CardDescription>Ejecuta todos los endpoints documentados y muestra el resultado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button onClick={runMassiveTest} disabled={runningTest}>
                    {runningTest ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                    {runningTest ? 'Ejecutando...' : 'Ejecutar Test Masivo'}
                  </Button>
                  {testResults.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge className="bg-green-600">OK: {okCount}</Badge>
                      <Badge className="bg-amber-600">Auth: {authCount}</Badge>
                      <Badge className="bg-red-600">Error: {errCount}</Badge>
                      <Badge variant="outline">Total: {testResults.length}/{documentedEndpoints}</Badge>
                    </div>
                  )}
                </div>

                {testResults.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-[60px_1fr_80px_60px_1fr] bg-gray-100 text-xs font-bold p-2 gap-2 sticky top-0 z-10">
                      <span>Metodo</span><span>Ruta</span><span>Estado</span><span>Tiempo</span><span>Nota</span>
                    </div>
                    <div className="overflow-y-auto max-h-[500px]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#94a3b8 #f1f5f9' }}>
                      {testResults.map((r, i) => (
                        <div key={i} className={`grid grid-cols-[60px_1fr_80px_60px_1fr] text-xs p-2 gap-2 border-t ${r.status >= 200 && r.status < 300 ? 'bg-green-50' : r.status === 401 ? 'bg-amber-50' : 'bg-red-50'}`}>
                          <span className={`${METHOD_COLORS[r.method] || 'bg-gray-500'} text-white px-1.5 py-0.5 rounded text-center font-bold`}>{r.method}</span>
                          <code className="font-mono truncate">{r.path}</code>
                          <span className={`font-bold ${r.status >= 200 && r.status < 300 ? 'text-green-700' : r.status === 401 ? 'text-amber-700' : 'text-red-700'}`}>{r.status || 'ERR'}</span>
                          <span className="text-gray-500">{r.time}ms</span>
                          <span className="text-gray-500 truncate">
                            {r.error ? r.error : r.status >= 200 && r.status < 300 ? 'OK' : r.status === 401 ? 'Requiere autenticacion' : r.status === 404 ? 'No encontrado (IDs falsos)' : r.status === 422 ? 'Validacion requerida' : r.status === 400 ? 'Datos incorrectos' : 'Error'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {testResults.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg border text-sm space-y-1">
                    <p className="font-bold">Resumen del Test:</p>
                    <p>- <span className="text-green-700 font-bold">{okCount}</span> endpoints respondieron OK (200-299)</p>
                    <p>- <span className="text-amber-700 font-bold">{authCount}</span> endpoints requieren autenticacion (401) - esperado si no hay token del rol correcto</p>
                    <p>- <span className="text-red-700 font-bold">{errCount}</span> endpoints con error (400+, 0) - esperado para POST/PUT con IDs vacios</p>
                    <p className="text-gray-500 mt-2">NOTA: Los errores 400/404/422 son esperados cuando los endpoints requieren IDs reales o body con datos validos. Los endpoints GET publicos deberian responder 200.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API DOC */}
          <TabsContent value="apidoc">
            <div className="space-y-6">
              {/* General Info Header */}
              <Card className="border-l-4 border-l-[#0E8C5E]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-[#0E8C5E]">
                    <BookOpen className="w-6 h-6" />
                    Documentacion de la API - Oasis Healthtech
                  </CardTitle>
                  <CardDescription>
                    Manual completo de uso de la API REST para el equipo de frontend. {TOTAL_ENDPOINTS} endpoints documentados en {API_MODULES.length} modulos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Base URL</p>
                      <code className="text-sm font-mono text-gray-900">https://tudominio.com</code>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Autenticacion</p>
                      <code className="text-sm font-mono text-gray-900">Bearer JWT (Authorization header)</code>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Content-Type</p>
                      <code className="text-sm font-mono text-gray-900">application/json</code>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Formato de Errores</p>
                      <code className="text-sm font-mono text-gray-900">{`{ success: false, error: "..." }`}</code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Auth Flow */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Shield className="w-5 h-5 text-[#0E8C5E]" />Flujo de Autenticacion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-xs font-bold text-purple-700 mb-1">1. Login</p>
                      <code className="text-xs font-mono text-purple-900 block">POST /api/auth/login</code>
                      <p className="text-xs text-purple-600 mt-1">Enviar {`{ email, password }`}. Recibir accessToken (15min) + refreshToken (7 dias).</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-bold text-blue-700 mb-1">2. Usar Token</p>
                      <code className="text-xs font-mono text-blue-900 block">Authorization: Bearer {`<accessToken>`}</code>
                      <p className="text-xs text-blue-600 mt-1">Incluir en el header de cada peticion protegida.</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs font-bold text-green-700 mb-1">3. Refrescar</p>
                      <code className="text-xs font-mono text-green-900 block">POST /api/auth/refresh</code>
                      <p className="text-xs text-green-600 mt-1">Al expirar el accessToken, enviar refreshToken para obtener uno nuevo.</p>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                    <p className="font-semibold text-amber-700 mb-1">Roles disponibles:</p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge className="bg-purple-100 text-purple-800 text-[10px]">patient</Badge>
                      <Badge className="bg-blue-100 text-blue-800 text-[10px]">doctor</Badge>
                      <Badge className="bg-teal-100 text-teal-800 text-[10px]">clinic_admin</Badge>
                      <Badge className="bg-pink-100 text-pink-800 text-[10px]">receptionist</Badge>
                      <Badge className="bg-red-100 text-red-800 text-[10px]">pharmacy_admin</Badge>
                      <Badge className="bg-orange-100 text-orange-800 text-[10px]">pharmacy_staff</Badge>
                      <Badge className="bg-yellow-100 text-yellow-800 text-[10px]">delivery_person</Badge>
                      <Badge className="bg-gray-100 text-gray-800 text-[10px]">superadmin</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* HTTP Methods Legend */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Leyenda de Metodos HTTP</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5"><Badge className="bg-green-600 text-white text-xs font-bold">GET</Badge><span className="text-xs text-gray-600">Leer / Consultar</span></div>
                    <div className="flex items-center gap-1.5"><Badge className="bg-blue-600 text-white text-xs font-bold">POST</Badge><span className="text-xs text-gray-600">Crear / Enviar</span></div>
                    <div className="flex items-center gap-1.5"><Badge className="bg-amber-600 text-white text-xs font-bold">PUT</Badge><span className="text-xs text-gray-600">Actualizar</span></div>
                    <div className="flex items-center gap-1.5"><Badge className="bg-red-600 text-white text-xs font-bold">DELETE</Badge><span className="text-xs text-gray-600">Eliminar</span></div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <div className="flex items-center gap-1.5"><Badge variant="outline" className="text-[10px] border-[#0E8C5E] text-[#0E8C5E]">Auth</Badge><span className="text-xs text-gray-600">Requiere token</span></div>
                    <div className="flex items-center gap-1.5"><Badge variant="outline" className="text-[10px] border-gray-400 text-gray-500">Public</Badge><span className="text-xs text-gray-600">Sin autenticacion</span></div>
                    <div className="flex items-center gap-1.5"><Badge variant="outline" className="text-[10px] border-amber-500 text-amber-700">Rol</Badge><span className="text-xs text-gray-600">Requiere rol especifico</span></div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Format */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Formatos de Respuesta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-green-700 mb-1">Respuesta exitosa:</p>
                      <pre className="text-xs font-mono bg-green-50 border border-green-200 rounded p-2 text-green-900 overflow-x-auto">{`{
  "success": true,
  "data": { ... },
  "message": "Operacion exitosa"
}`}</pre>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-700 mb-1">Respuesta de error:</p>
                      <pre className="text-xs font-mono bg-red-50 border border-red-200 rounded p-2 text-red-900 overflow-x-auto">{`{
  "success": false,
  "error": "Descripcion del error",
  "statusCode": 400
}`}</pre>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Codigos de estado comunes:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-xs">
                      <div><Badge className="bg-green-600 text-white text-[10px] mr-1">200</Badge>OK</div>
                      <div><Badge className="bg-green-600 text-white text-[10px] mr-1">201</Badge>Creado</div>
                      <div><Badge className="bg-amber-600 text-white text-[10px] mr-1">400</Badge>Bad Request</div>
                      <div><Badge className="bg-amber-600 text-white text-[10px] mr-1">401</Badge>No Autorizado</div>
                      <div><Badge className="bg-amber-600 text-white text-[10px] mr-1">403</Badge>Prohibido</div>
                      <div><Badge className="bg-amber-600 text-white text-[10px] mr-1">404</Badge>No Encontrado</div>
                      <div><Badge className="bg-red-600 text-white text-[10px] mr-1">409</Badge>Conflicto</div>
                      <div><Badge className="bg-red-600 text-white text-[10px] mr-1">500</Badge>Error Servidor</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Endpoint Documentation by Module */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Server className="w-5 h-5 text-[#0E8C5E]" />
                    Endpoints por Modulo
                  </CardTitle>
                  <CardDescription>
                    Haz clic en cada modulo para expandir la documentacion completa de sus endpoints.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    {API_MODULES.map((mod, modIdx) => (
                      <AccordionItem key={modIdx} value={`module-${modIdx}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${mod.color}`} />
                            <span className="font-semibold text-sm">{mod.name}</span>
                            <Badge variant="secondary" className="text-[10px] font-mono">{mod.endpoints.length} endpoints</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-1">
                            {mod.endpoints.map((ep, epIdx) => (
                              <div key={epIdx} className="p-3 rounded-lg border bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                {/* Method + Path row */}
                                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                  <Badge className={`${METHOD_COLORS[ep.method] || 'bg-gray-600'} text-white text-xs font-bold min-w-[52px] justify-center`}>
                                    {ep.method}
                                  </Badge>
                                  <code className="text-sm font-mono font-semibold text-gray-900">{ep.path}</code>
                                  {ep.auth ? (
                                    <Badge variant="outline" className="text-[10px] border-[#0E8C5E] text-[#0E8C5E]">Auth</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[10px] border-gray-400 text-gray-500">Public</Badge>
                                  )}
                                  {ep.roles && ep.roles.map((role, ri) => (
                                    <Badge key={ri} variant="outline" className="text-[10px] border-amber-500 text-amber-700">{role}</Badge>
                                  ))}
                                </div>
                                {/* Description */}
                                <p className="text-xs text-gray-600 mb-1.5">{ep.description}</p>
                                {/* Details row */}
                                <div className="flex flex-wrap gap-2">
                                  {ep.params && (
                                    <div className="text-xs">
                                      <span className="font-semibold text-gray-500">Path params: </span>
                                      <code className="font-mono text-gray-700 bg-white px-1 rounded border">{ep.params}</code>
                                    </div>
                                  )}
                                  {ep.queryParams && (
                                    <div className="text-xs">
                                      <span className="font-semibold text-gray-500">Query: </span>
                                      <code className="font-mono text-gray-700 bg-white px-1 rounded border">{ep.queryParams}</code>
                                    </div>
                                  )}
                                </div>
                                {/* Body */}
                                {ep.body && (
                                  <div className="mt-2">
                                    <p className="text-xs font-semibold text-gray-500 mb-1">Body (JSON):</p>
                                    <pre className="text-[11px] font-mono bg-white border rounded p-2 overflow-x-auto text-gray-800 max-h-24 overflow-y-auto">{ep.body}</pre>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              {/* Quick Reference - Common Patterns */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Patrones Comunes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">Paginacion (GET /api/patients):</p>
                      <pre className="text-xs font-mono bg-gray-50 border rounded p-2 overflow-x-auto">{`?page=1&limit=20
// Respuesta:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}`}</pre>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">Busqueda (GET /api/clinics):</p>
                      <pre className="text-xs font-mono bg-gray-50 border rounded p-2 overflow-x-auto">{`?search=termino&city=Managua
&department=Managua&page=1&limit=20
// Todos los parametros son opcionales
// search busca en nombre y direccion`}</pre>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">Filtros de fecha (reportes):</p>
                      <pre className="text-xs font-mono bg-gray-50 border rounded p-2 overflow-x-auto">{`?from=2025-01-01&to=2025-12-31
&groupBy=doctor|product|day
// from/to en formato ISO (YYYY-MM-DD)
// groupBy agrupa resultados`}</pre>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">Geolocalizacion (nearby):</p>
                      <pre className="text-xs font-mono bg-gray-50 border rounded p-2 overflow-x-auto">{`?lat=12.1149&lng=-86.2714
&radius=10
// lat/lng: coordenadas del usuario
// radius: radio en kilometros
// Retorna ordenado por distancia`}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Module Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Resumen de Modulos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 font-semibold text-gray-500">Modulo</th>
                          <th className="text-center py-2 px-2 font-semibold text-gray-500">Endpoints</th>
                          <th className="text-left py-2 px-2 font-semibold text-gray-500">Auth</th>
                          <th className="text-left py-2 pl-2 font-semibold text-gray-500">Roles Principales</th>
                        </tr>
                      </thead>
                      <tbody>
                        {API_MODULES.map((mod, i) => {
                          const authEndpoints = mod.endpoints.filter(e => e.auth).length;
                          const publicEndpoints = mod.endpoints.filter(e => !e.auth).length;
                          const allRoles = [...new Set(mod.endpoints.flatMap(e => e.roles || []))];
                          return (
                            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-2 pr-4">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${mod.color}`} />
                                  <span className="font-medium">{mod.name}</span>
                                </div>
                              </td>
                              <td className="text-center py-2 px-2 font-mono">{mod.endpoints.length}</td>
                              <td className="py-2 px-2">
                                <span className="text-green-700">{authEndpoints} auth</span>
                                {publicEndpoints > 0 && <span className="text-gray-400"> / {publicEndpoints} public</span>}
                              </td>
                              <td className="py-2 pl-2">
                                <div className="flex flex-wrap gap-1">
                                  {allRoles.length > 0 ? allRoles.map((role, ri) => (
                                    <Badge key={ri} variant="outline" className="text-[9px] py-0">{role}</Badge>
                                  )) : <span className="text-gray-400">Todos los autenticados</span>}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="font-bold">
                          <td className="py-2 pr-4">Total</td>
                          <td className="text-center py-2 px-2 font-mono">{TOTAL_ENDPOINTS}</td>
                          <td className="py-2 px-2" colSpan={2}>{API_MODULES.length} modulos</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <footer className="mt-auto border-t bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Image src="/oasis-logo.png" alt="Oasis" width={20} height={20} className="rounded-full" />
            <span>OASIS -- &quot;Tu base de salud&quot;</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{TOTAL_ENDPOINTS} endpoints</span>
            <span>{TOTAL_RUTAS} rutas</span>
            <span>{TOTAL_TABLAS} tablas</span>
            <span>{TOTAL_MODULOS} modulos</span>
            <span>Nicaragua</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
