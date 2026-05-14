// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Pharmacies API: List & Create
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// GET /api/pharmacies - List pharmacies
export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || '';
  const department = searchParams.get('department') || '';
  const isActive = searchParams.get('isActive');

  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }
  if (city) where.city = { contains: city };
  if (department) where.department = { contains: department };
  
  if (isActive !== null && isActive !== undefined && isActive !== '') {
    where.isActive = isActive === 'true';
  } else if (!auth) {
    // Si no está autenticado, solo ver activas
    where.isActive = true;
  }

  // Non-superadmin users only see their own pharmacy
  if (auth) {
    if (auth.user.role === ROLES.PHARMACY_ADMIN) {
      const admin = await db.pharmacyAdmin.findFirst({
        where: { userId: auth.user.id },
      });
      if (admin) {
        where.id = admin.pharmacyId;
      }
    } else if (auth.user.role === ROLES.PHARMACY_STAFF) {
      const staff = await db.pharmacyStaff.findFirst({
        where: { userId: auth.user.id },
      });
      if (staff) {
        where.id = staff.pharmacyId;
      }
    }
  }

  const [pharmacies, total] = await Promise.all([
    db.pharmacy.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { branches: true, staff: true, inventoryBatches: true } },
      },
    }),
    db.pharmacy.count({ where }),
  ]);

  return apiPaginated(pharmacies, page, limit, total);
}

// POST /api/pharmacies - Create pharmacy (superadmin, pharmacy_admin)
export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (![ROLES.SUPERADMIN, ROLES.PHARMACY_ADMIN].includes(auth.user.role as any)) {
    return apiError('No autorizado para crear farmacias', 403);
  }

  const body = await request.json();
  const {
    name,
    description,
    logoUrl,
    phone,
    email,
    website,
    parentPharmacyId,
    address,
    city,
    department,
    latitude,
    longitude,
    deliverySettings,
    paymentMethods,
  } = body;

  if (!name) {
    return apiError('El nombre de la farmacia es requerido', 400);
  }

  // Validate parent pharmacy exists if specified
  if (parentPharmacyId) {
    const parent = await db.pharmacy.findUnique({ where: { id: parentPharmacyId } });
    if (!parent) return apiError('Farmacia padre no encontrada', 404);
  }

  const pharmacy = await db.pharmacy.create({
    data: {
      name,
      description,
      logoUrl,
      phone,
      email,
      website,
      parentPharmacyId,
      address,
      city,
      department,
      latitude,
      longitude,
      deliverySettings: deliverySettings ? JSON.stringify(deliverySettings) : null,
      paymentMethods: paymentMethods ? JSON.stringify(paymentMethods) : null,
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'create',
    entity: 'Pharmacy',
    entityId: pharmacy.id,
    newValues: pharmacy,
  });

  return apiSuccess(pharmacy, { status: 201 });
}
