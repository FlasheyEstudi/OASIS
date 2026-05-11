// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Clínicas API: Listar y Crear
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// GET /api/clinics - Listar clínicas
export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || '';
  const department = searchParams.get('department') || '';
  const isActive = searchParams.get('isActive');

  const skip = (page - 1) * limit;

  // superadmin ve todas, clinic_admin ve solo su clínica
  const where: Record<string, unknown> = {};

  if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({
      where: { userId: auth.user.id },
    });
    if (!clinicAdmin) return apiSuccess([]);
    where.id = clinicAdmin.clinicId;
  }

  if (search) {
    where.name = { contains: search };
  }
  if (city) {
    where.city = { contains: city };
  }
  if (department) {
    where.department = { contains: department };
  }
  if (isActive !== null && isActive !== undefined && isActive !== '') {
    where.isActive = isActive === 'true';
  }

  // Solo mostrar clínicas raíz (sin parentClinicId) por defecto
  if (!searchParams.get('includeBranches')) {
    where.parentClinicId = null;
  }

  const [clinics, total] = await Promise.all([
    db.clinic.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { doctors: true, branches: true, services: true } },
        admins: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    }),
    db.clinic.count({ where }),
  ]);

  return apiPaginated(clinics, page, limit, total);
}

// POST /api/clinics - Crear clínica
export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  // Solo superadmin y clinic_admin pueden crear clínicas
  if (auth.user.role !== ROLES.SUPERADMIN && auth.user.role !== ROLES.CLINIC_ADMIN) {
    return apiForbidden('Solo superadmin o clinic_admin pueden crear clínicas');
  }

  const body = await request.json();
  const { name, description, logoUrl, phone, email, website, address, city, department, latitude, longitude, settings, parentClinicId } = body;

  if (!name) {
    return apiError('El nombre de la clínica es requerido', 422);
  }

  // Si es clinic_admin, la clínica se crea como sucursal de la suya
  let resolvedParentId = parentClinicId || null;
  if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({
      where: { userId: auth.user.id },
    });
    if (!clinicAdmin) return apiForbidden('No tienes una clínica asignada');
    if (!resolvedParentId) {
      resolvedParentId = clinicAdmin.clinicId;
    } else {
      // Verificar que el parentClinicId es la clínica del admin
      if (resolvedParentId !== clinicAdmin.clinicId) {
        return apiForbidden('Solo puedes crear sucursales de tu propia clínica');
      }
    }
  }

  const clinic = await db.clinic.create({
    data: {
      name,
      description,
      logoUrl,
      phone,
      email,
      website,
      address,
      city,
      department,
      latitude,
      longitude,
      settings: settings ? JSON.stringify(settings) : null,
      parentClinicId: resolvedParentId,
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    clinicId: clinic.id,
    action: 'create',
    entity: 'Clinic',
    entityId: clinic.id,
    newValues: body,
    ipAddress: request.headers.get('x-forwarded-for') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  });

  return apiSuccess(clinic, { status: 201 });
}
