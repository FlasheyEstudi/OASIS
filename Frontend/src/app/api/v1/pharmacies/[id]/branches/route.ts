// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Pharmacy Branches API
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// GET /api/pharmacies/[id]/branches - List branches
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const pharmacy = await db.pharmacy.findUnique({ where: { id } });
  if (!pharmacy) return apiNotFound('Farmacia no encontrada');

  const branches = await db.pharmacy.findMany({
    where: { parentPharmacyId: id, isActive: true },
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { staff: true, inventoryBatches: true } },
    },
  });

  return apiSuccess(branches);
}

// POST /api/pharmacies/[id]/branches - Create branch
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  // Only superadmin or pharmacy_admin of this pharmacy can create branches
  let canCreate = false;
  if (auth.user.role === ROLES.SUPERADMIN) {
    canCreate = true;
  } else if (auth.user.role === ROLES.PHARMACY_ADMIN) {
    const admin = await db.pharmacyAdmin.findFirst({
      where: { userId: auth.user.id, pharmacyId: id },
    });
    canCreate = !!admin;
  }

  if (!canCreate) return apiForbidden('No autorizado para crear sucursales');

  const parentPharmacy = await db.pharmacy.findUnique({ where: { id } });
  if (!parentPharmacy) return apiNotFound('Farmacia padre no encontrada');

  const body = await request.json();
  const {
    name,
    description,
    phone,
    email,
    address,
    city,
    department,
    latitude,
    longitude,
    deliverySettings,
    paymentMethods,
  } = body;

  if (!name) {
    return apiError('El nombre de la sucursal es requerido', 400);
  }

  const branch = await db.pharmacy.create({
    data: {
      name,
      description,
      phone: phone || parentPharmacy.phone,
      email: email || parentPharmacy.email,
      address,
      city,
      department,
      latitude,
      longitude,
      parentPharmacyId: id,
      deliverySettings: deliverySettings
        ? JSON.stringify(deliverySettings)
        : parentPharmacy.deliverySettings,
      paymentMethods: paymentMethods
        ? JSON.stringify(paymentMethods)
        : parentPharmacy.paymentMethods,
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'create_branch',
    entity: 'Pharmacy',
    entityId: branch.id,
    newValues: { ...branch, parentPharmacyId: id },
  });

  return apiSuccess(branch, { status: 201 });
}
