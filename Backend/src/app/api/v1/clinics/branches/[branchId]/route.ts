// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Actualizar Sucursal de Clínica
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

interface RouteParams {
  params: Promise<{ branchId: string }>;
}

// PUT /api/clinics/branches/[branchId] - Actualizar sucursal
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.SUPERADMIN && auth.user.role !== ROLES.CLINIC_ADMIN) {
    return apiForbidden('No tienes permisos para actualizar sucursales');
  }

  const { branchId } = await params;

  const branch = await db.clinic.findUnique({ where: { id: branchId } });
  if (!branch) return apiNotFound('Sucursal no encontrada');
  if (!branch.parentClinicId) return apiError('Esta clínica no es una sucursal', 400);

  // clinic_admin solo puede actualizar sucursales de su clínica
  if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({
      where: { userId: auth.user.id },
    });
    if (!clinicAdmin || clinicAdmin.clinicId !== branch.parentClinicId) {
      return apiForbidden('No tienes acceso a esta sucursal');
    }
  }

  const body = await request.json();
  const { name, description, phone, email, address, city, department, latitude, longitude, isActive } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (phone !== undefined) data.phone = phone;
  if (email !== undefined) data.email = email;
  if (address !== undefined) data.address = address;
  if (city !== undefined) data.city = city;
  if (department !== undefined) data.department = department;
  if (latitude !== undefined) data.latitude = latitude;
  if (longitude !== undefined) data.longitude = longitude;
  if (isActive !== undefined && auth.user.role === ROLES.SUPERADMIN) data.isActive = isActive;

  const updated = await db.clinic.update({
    where: { id: branchId },
    data,
  });

  await createAuditLog({
    userId: auth.user.id,
    clinicId: branch.parentClinicId,
    action: 'update',
    entity: 'ClinicBranch',
    entityId: branchId,
    oldValues: branch,
    newValues: body,
    ipAddress: request.headers.get('x-forwarded-for') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  });

  return apiSuccess(updated);
}
