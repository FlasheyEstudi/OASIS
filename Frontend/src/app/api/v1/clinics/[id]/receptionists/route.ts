// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Recepcionistas de Clínica API: Listar y Crear
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/clinics/[id]/receptionists - Listar recepcionistas
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const clinic = await db.clinic.findUnique({ where: { id } });
  if (!clinic) return apiNotFound('Clínica no encontrada');

  // clinic_admin solo puede ver recepcionistas de su clínica
  if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({
      where: { userId: auth.user.id },
    });
    if (!clinicAdmin || clinicAdmin.clinicId !== id) {
      return apiForbidden('No tienes acceso a esta clínica');
    }
  }

  // receptionist solo puede ver recepcionistas de su clínica
  if (auth.user.role === ROLES.RECEPTIONIST) {
    const receptionist = await db.receptionist.findUnique({
      where: { userId: auth.user.id },
    });
    if (!receptionist || receptionist.clinicId !== id) {
      return apiForbidden('No tienes acceso a esta clínica');
    }
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const [receptionists, total] = await Promise.all([
    db.receptionist.findMany({
      where: { clinicId: id, isActive: true },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
      },
    }),
    db.receptionist.count({ where: { clinicId: id, isActive: true } }),
  ]);

  return apiPaginated(receptionists, page, limit, total);
}

// POST /api/clinics/[id]/receptionists - Crear recepcionista
export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.SUPERADMIN && auth.user.role !== ROLES.CLINIC_ADMIN) {
    return apiForbidden('Solo clinic_admin o superadmin pueden crear recepcionistas');
  }

  const { id } = await params;

  const clinic = await db.clinic.findUnique({ where: { id } });
  if (!clinic) return apiNotFound('Clínica no encontrada');

  // clinic_admin solo puede crear recepcionistas en su clínica
  if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({
      where: { userId: auth.user.id },
    });
    if (!clinicAdmin || clinicAdmin.clinicId !== id) {
      return apiForbidden('Solo puedes crear recepcionistas en tu propia clínica');
    }
  }

  const body = await request.json();
  const { name, email, password, phone } = body;

  if (!name || !email || !password) {
    return apiError('Campos requeridos: name, email, password', 422);
  }

  // Verificar que el email no existe
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return apiError('Ya existe un usuario con este email', 409);
  }

  // Crear usuario y recepcionista en transacción
  const result = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password, // En producción, hashear con bcrypt
        phone,
        role: ROLES.RECEPTIONIST,
      },
    });

    const receptionist = await tx.receptionist.create({
      data: {
        userId: user.id,
        clinicId: id,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
      },
    });

    return receptionist;
  });

  await createAuditLog({
    userId: auth.user.id,
    clinicId: id,
    action: 'create',
    entity: 'Receptionist',
    entityId: result.id,
    newValues: { name, email },
    ipAddress: request.headers.get('x-forwarded-for') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  });

  return apiSuccess(result, { status: 201 });
}
