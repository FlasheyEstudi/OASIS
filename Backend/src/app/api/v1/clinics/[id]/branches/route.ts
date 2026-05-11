// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Sucursales de Clínica API: Listar y Crear
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/clinics/[id]/branches - Listar sucursales
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const clinic = await db.clinic.findUnique({ where: { id } });
  if (!clinic) return apiNotFound('Clínica no encontrada');

  // clinic_admin solo puede ver sucursales de su clínica
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

  const [branches, total] = await Promise.all([
    db.clinic.findMany({
      where: { parentClinicId: id, isActive: true },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { doctors: true, services: true } },
      },
    }),
    db.clinic.count({ where: { parentClinicId: id, isActive: true } }),
  ]);

  return apiPaginated(branches, page, limit, total);
}

// POST /api/clinics/[id]/branches - Crear sucursal
export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.SUPERADMIN && auth.user.role !== ROLES.CLINIC_ADMIN) {
    return apiForbidden('No tienes permisos para crear sucursales');
  }

  const { id } = await params;

  const parentClinic = await db.clinic.findUnique({ where: { id } });
  if (!parentClinic) return apiNotFound('Clínica principal no encontrada');

  // clinic_admin solo puede crear sucursales de su propia clínica
  if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({
      where: { userId: auth.user.id },
    });
    if (!clinicAdmin || clinicAdmin.clinicId !== id) {
      return apiForbidden('Solo puedes crear sucursales de tu propia clínica');
    }
  }

  const body = await request.json();
  const { name, description, phone, email, address, city, department, latitude, longitude } = body;

  if (!name) {
    return apiError('El nombre de la sucursal es requerido', 422);
  }

  const branch = await db.clinic.create({
    data: {
      name,
      description: description || `${parentClinic.name} - ${name}`,
      logoUrl: parentClinic.logoUrl,
      phone,
      email,
      address,
      city,
      department,
      latitude,
      longitude,
      settings: parentClinic.settings,
      parentClinicId: id,
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    clinicId: id,
    action: 'create',
    entity: 'ClinicBranch',
    entityId: branch.id,
    newValues: { ...body, parentClinicId: id },
    ipAddress: request.headers.get('x-forwarded-for') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  });

  return apiSuccess(branch, { status: 201 });
}
