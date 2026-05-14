// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Services API Route
// GET /api/services - List services
// POST /api/services - Create service (clinic_admin)
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// GET /api/services - List services
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clinicId = searchParams.get('clinicId') || undefined;
  let page = parseInt(searchParams.get('page') || '1');
  let limit = parseInt(searchParams.get('limit') || '20');

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 20;

  const skip = (page - 1) * limit;
  const where: any = { isActive: true };
  if (clinicId) where.clinicId = clinicId;

  const [services, total] = await Promise.all([
    db.service.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    db.service.count({ where }),
  ]);

  return apiPaginated(services, page, limit, total);
}

// POST /api/services - Create service (clinic_admin only)
export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (![ROLES.CLINIC_ADMIN, ROLES.SUPERADMIN].includes(auth.user.role as any)) {
    return apiForbidden('Solo administradores de clínica pueden crear servicios');
  }

  const body = await request.json();
  const { clinicId, name, description, duration, price } = body;

  if (!clinicId || !name) {
    return apiError('clinicId y name son requeridos');
  }

  // Verify clinic exists
  const clinic = await db.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) return apiError('Clínica no encontrada', 404);

  // Clinic admin can only create services for their own clinic
  if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({ where: { userId: auth.user.id } });
    if (!clinicAdmin || clinicAdmin.clinicId !== clinicId) {
      return apiForbidden('Solo puede crear servicios para su clínica');
    }
  }

  const service = await db.service.create({
    data: {
      clinicId,
      name,
      description: description || null,
      duration: duration || 30,
      price: price || 0,
      isActive: true,
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    clinicId,
    action: 'create',
    entity: 'Service',
    entityId: service.id,
    newValues: { name, duration: duration || 30, price: price || 0 },
  });

  return apiSuccess(service, { status: 201 });
}
