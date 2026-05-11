// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Servicios de Clínica API: Listar y Crear
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/clinics/[id]/services - Listar servicios
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const clinic = await db.clinic.findUnique({ where: { id } });
  if (!clinic) return apiNotFound('Clínica no encontrada');

  // clinic_admin solo puede ver servicios de su clínica
  if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({
      where: { userId: auth.user.id },
    });
    if (!clinicAdmin || clinicAdmin.clinicId !== id) {
      return apiForbidden('No tienes acceso a esta clínica');
    }
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const [services, total] = await Promise.all([
    db.service.findMany({
      where: { clinicId: id, isActive: true },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { appointments: true } },
      },
    }),
    db.service.count({ where: { clinicId: id, isActive: true } }),
  ]);

  return apiPaginated(services, page, limit, total);
}

// POST /api/clinics/[id]/services - Crear servicio
export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.SUPERADMIN && auth.user.role !== ROLES.CLINIC_ADMIN) {
    return apiForbidden('Solo clinic_admin o superadmin pueden crear servicios');
  }

  const { id } = await params;

  const clinic = await db.clinic.findUnique({ where: { id } });
  if (!clinic) return apiNotFound('Clínica no encontrada');

  // clinic_admin solo puede crear servicios en su clínica
  if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({
      where: { userId: auth.user.id },
    });
    if (!clinicAdmin || clinicAdmin.clinicId !== id) {
      return apiForbidden('Solo puedes crear servicios en tu propia clínica');
    }
  }

  const body = await request.json();
  const { name, description, duration, price } = body;

  if (!name) {
    return apiError('El nombre del servicio es requerido', 422);
  }

  const service = await db.service.create({
    data: {
      clinicId: id,
      name,
      description,
      duration: duration || 30,
      price: price || 0,
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    clinicId: id,
    action: 'create',
    entity: 'Service',
    entityId: service.id,
    newValues: body,
    ipAddress: request.headers.get('x-forwarded-for') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  });

  return apiSuccess(service, { status: 201 });
}
