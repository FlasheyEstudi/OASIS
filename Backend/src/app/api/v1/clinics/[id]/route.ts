// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Clínica Individual API: Obtener, Actualizar, Eliminar
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/clinics/[id] - Obtener detalles de clínica
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthUserFromHeader(request);
  // Permitir acceso público

  const { id } = await params;

  const clinic = await db.clinic.findUnique({
    where: { id },
    include: {
      admins: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
      branches: { where: { isActive: true } },
      _count: {
        select: {
          doctors: { where: { isActive: true } },
          receptionists: { where: { isActive: true } },
          services: { where: { isActive: true } },
          appointments: true,
        },
      },
      parentClinic: { select: { id: true, name: true } },
    },
  });

  if (!clinic) return apiNotFound('Clínica no encontrada');

  // clinic_admin solo puede ver su propia clínica (si está autenticado)
  if (auth && auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({
      where: { userId: auth.user.id },
    });
    if (!clinicAdmin || clinicAdmin.clinicId !== id) {
      return apiForbidden('No tienes acceso a esta clínica');
    }
  }

  return apiSuccess(clinic);
}

// PUT /api/clinics/[id] - Actualizar clínica
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  // Verificar permisos
  if (auth.user.role !== ROLES.SUPERADMIN && auth.user.role !== ROLES.CLINIC_ADMIN) {
    return apiForbidden('No tienes permisos para actualizar esta clínica');
  }

  // clinic_admin solo puede actualizar su propia clínica
  if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({
      where: { userId: auth.user.id },
    });
    if (!clinicAdmin || clinicAdmin.clinicId !== id) {
      return apiForbidden('No tienes acceso a esta clínica');
    }
  }

  const existing = await db.clinic.findUnique({ where: { id } });
  if (!existing) return apiNotFound('Clínica no encontrada');
  if (!existing.isActive) return apiError('No se puede actualizar una clínica inactiva', 400);

  const body = await request.json();
  const { name, description, logoUrl, phone, email, website, address, city, department, latitude, longitude, settings, isActive } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (logoUrl !== undefined) data.logoUrl = logoUrl;
  if (phone !== undefined) data.phone = phone;
  if (email !== undefined) data.email = email;
  if (website !== undefined) data.website = website;
  if (address !== undefined) data.address = address;
  if (city !== undefined) data.city = city;
  if (department !== undefined) data.department = department;
  if (latitude !== undefined) data.latitude = latitude;
  if (longitude !== undefined) data.longitude = longitude;
  if (settings !== undefined) data.settings = JSON.stringify(settings);
  // Solo superadmin puede cambiar isActive
  if (isActive !== undefined && auth.user.role === ROLES.SUPERADMIN) data.isActive = isActive;

  const clinic = await db.clinic.update({
    where: { id },
    data,
  });

  await createAuditLog({
    userId: auth.user.id,
    clinicId: id,
    action: 'update',
    entity: 'Clinic',
    entityId: id,
    oldValues: existing,
    newValues: body,
    ipAddress: request.headers.get('x-forwarded-for') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  });

  return apiSuccess(clinic);
}

// DELETE /api/clinics/[id] - Soft delete (solo superadmin)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.SUPERADMIN) {
    return apiForbidden('Solo un superadmin puede eliminar clínicas');
  }

  const { id } = await params;

  const existing = await db.clinic.findUnique({ where: { id } });
  if (!existing) return apiNotFound('Clínica no encontrada');
  if (!existing.isActive) return apiError('La clínica ya está inactiva', 400);

  const clinic = await db.clinic.update({
    where: { id },
    data: { isActive: false },
  });

  await createAuditLog({
    userId: auth.user.id,
    clinicId: id,
    action: 'delete',
    entity: 'Clinic',
    entityId: id,
    oldValues: existing,
    ipAddress: request.headers.get('x-forwarded-for') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  });

  return apiSuccess({ message: 'Clínica desactivada exitosamente' });
}
