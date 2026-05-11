// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Doctores de Clínica API: Listar y Agregar
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/clinics/[id]/doctors - Listar doctores de la clínica
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const clinic = await db.clinic.findUnique({ where: { id } });
  if (!clinic) return apiNotFound('Clínica no encontrada');

  // clinic_admin solo puede ver doctores de su clínica
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
  const specialty = searchParams.get('specialty') || '';
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { clinicId: id, isActive: true };
  if (specialty) where.specialty = { contains: specialty };

  const [doctors, total] = await Promise.all([
    db.doctor.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
        _count: { select: { appointments: true } },
      },
    }),
    db.doctor.count({ where }),
  ]);

  return apiPaginated(doctors, page, limit, total);
}

// POST /api/clinics/[id]/doctors - Agregar doctor a la clínica
export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.SUPERADMIN && auth.user.role !== ROLES.CLINIC_ADMIN) {
    return apiForbidden('No tienes permisos para agregar doctores');
  }

  const { id } = await params;

  const clinic = await db.clinic.findUnique({ where: { id } });
  if (!clinic) return apiNotFound('Clínica no encontrada');

  // clinic_admin solo puede agregar doctores a su clínica
  if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({
      where: { userId: auth.user.id },
    });
    if (!clinicAdmin || clinicAdmin.clinicId !== id) {
      return apiForbidden('Solo puedes agregar doctores a tu propia clínica');
    }
  }

  const body = await request.json();
  const { name, email, password, phone, specialty, licenseNumber, biography, consultationFee, schedule } = body;

  if (!name || !email || !password || !specialty || !licenseNumber) {
    return apiError('Campos requeridos: name, email, password, specialty, licenseNumber', 422);
  }

  // Verificar que el email no existe
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return apiError('Ya existe un usuario con este email', 409);
  }

  // Verificar que el licenseNumber no existe
  const existingDoctor = await db.doctor.findUnique({ where: { licenseNumber } });
  if (existingDoctor) {
    return apiError('Ya existe un doctor con este número de licencia', 409);
  }

  // Crear usuario y doctor en transacción
  const result = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password, // En producción, hashear con bcrypt
        phone,
        role: ROLES.DOCTOR,
      },
    });

    const doctor = await tx.doctor.create({
      data: {
        userId: user.id,
        clinicId: id,
        specialty,
        licenseNumber,
        biography,
        consultationFee: consultationFee || 0,
        schedule: schedule ? JSON.stringify(schedule) : null,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
      },
    });

    return doctor;
  });

  await createAuditLog({
    userId: auth.user.id,
    clinicId: id,
    action: 'create',
    entity: 'Doctor',
    entityId: result.id,
    newValues: { name, email, specialty, licenseNumber },
    ipAddress: request.headers.get('x-forwarded-for') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  });

  return apiSuccess(result, { status: 201 });
}
