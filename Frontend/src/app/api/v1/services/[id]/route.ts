// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Service Detail API Routes
// GET /api/services/[id] - Get service detail
// PUT /api/services/[id] - Update service
// DELETE /api/services/[id] - Soft delete service
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// GET /api/services/[id] - Get service detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const service = await db.service.findUnique({
    where: { id },
    include: {
      clinic: { select: { id: true, name: true, address: true, phone: true } },
    },
  });

  if (!service || !service.isActive) return apiNotFound('Servicio no encontrado');

  return apiSuccess(service);
}

// PUT /api/services/[id] - Update service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (![ROLES.CLINIC_ADMIN, ROLES.SUPERADMIN].includes(auth.user.role as string)) {
    return apiForbidden('Solo administradores de clínica pueden actualizar servicios');
  }

  const { id } = await params;

  const service = await db.service.findUnique({ where: { id } });
  if (!service) return apiNotFound('Servicio no encontrado');

  // Clinic admin can only update their own clinic's services
  if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({ where: { userId: auth.user.id } });
    if (!clinicAdmin || clinicAdmin.clinicId !== service.clinicId) {
      return apiForbidden('Solo puede actualizar servicios de su clínica');
    }
  }

  const body = await request.json();
  const { name, description, duration, price } = body;

  const oldValues = {
    name: service.name,
    description: service.description,
    duration: service.duration,
    price: service.price,
  };

  const updated = await db.service.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(duration !== undefined && { duration }),
      ...(price !== undefined && { price }),
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    clinicId: service.clinicId,
    action: 'update',
    entity: 'Service',
    entityId: id,
    oldValues,
    newValues: { name, description, duration, price },
  });

  return apiSuccess(updated);
}

// DELETE /api/services/[id] - Soft delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (![ROLES.CLINIC_ADMIN, ROLES.SUPERADMIN].includes(auth.user.role as string)) {
    return apiForbidden('Solo administradores de clínica pueden eliminar servicios');
  }

  const { id } = await params;

  const service = await db.service.findUnique({ where: { id } });
  if (!service) return apiNotFound('Servicio no encontrado');

  // Clinic admin can only delete their own clinic's services
  if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({ where: { userId: auth.user.id } });
    if (!clinicAdmin || clinicAdmin.clinicId !== service.clinicId) {
      return apiForbidden('Solo puede eliminar servicios de su clínica');
    }
  }

  // Check if service has upcoming appointments
  const upcomingAppointments = await db.appointment.count({
    where: {
      serviceId: id,
      status: { in: ['scheduled', 'confirmed'] },
    },
  });

  if (upcomingAppointments > 0) {
    return apiError('No se puede eliminar el servicio porque tiene citas programadas');
  }

  // Soft delete
  const deleted = await db.service.update({
    where: { id },
    data: { isActive: false },
  });

  await createAuditLog({
    userId: auth.user.id,
    clinicId: service.clinicId,
    action: 'delete',
    entity: 'Service',
    entityId: id,
    oldValues: { name: service.name, isActive: true },
    newValues: { isActive: false },
  });

  return apiSuccess({ message: 'Servicio eliminado exitosamente' });
}
