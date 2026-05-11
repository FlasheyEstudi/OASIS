// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Delivery Person Registration API
// POST /api/delivery/register
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from '@/lib/api-response';
import { createAuditLog } from '@/lib/oasis-utils';

export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  // User must have delivery_person role
  if (auth.user.role !== ROLES.DELIVERY_PERSON && auth.user.role !== ROLES.SUPERADMIN) {
    return apiForbidden('Solo usuarios con rol de repartidor pueden registrarse');
  }

  // Check if already registered
  const existing = await db.deliveryPerson.findUnique({
    where: { userId: auth.user.id },
  });
  if (existing) {
    return apiError('Ya estás registrado como repartidor', 400);
  }

  const body = await request.json();
  const {
    vehicleType,
    plateNumber,
    availabilitySchedule,
    zones,
    isInternal,
    pharmacyId,
    idDocument,
  } = body;

  // If internal delivery person, verify pharmacy
  if (isInternal && pharmacyId) {
    const pharmacy = await db.pharmacy.findUnique({ where: { id: pharmacyId } });
    if (!pharmacy) return apiError('Farmacia no encontrada', 404);
  }

  const deliveryPerson = await db.$transaction(async (tx) => {
    const dp = await tx.deliveryPerson.create({
      data: {
        userId: auth.user.id,
        vehicleType: vehicleType || null,
        plateNumber: plateNumber || null,
        availabilitySchedule: availabilitySchedule ? JSON.stringify(availabilitySchedule) : null,
        zones: zones ? JSON.stringify(zones) : null,
        isInternal: isInternal || false,
        pharmacyId: isInternal ? (pharmacyId || null) : null,
        idDocument: idDocument || null,
        isAvailable: false,
        isActive: true,
      },
    });

    await createAuditLog({
      userId: auth.user.id,
      action: 'create',
      entity: 'DeliveryPerson',
      entityId: dp.id,
      newValues: {
        vehicleType,
        plateNumber,
        isInternal,
        pharmacyId,
      },
    });

    return dp;
  });

  const completeDp = await db.deliveryPerson.findUnique({
    where: { id: deliveryPerson.id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      pharmacy: { select: { id: true, name: true } },
    },
  });

  return apiSuccess(completeDp, { status: 201 });
}
