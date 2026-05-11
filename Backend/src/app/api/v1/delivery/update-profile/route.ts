// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Delivery Person Profile Update API
// PUT /api/delivery/update-profile
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { createAuditLog } from '@/lib/oasis-utils';

export async function PUT(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  // User must have delivery_person role or be superadmin
  if (auth.user.role !== ROLES.DELIVERY_PERSON && auth.user.role !== ROLES.SUPERADMIN) {
    return apiForbidden('No tienes permiso para actualizar perfiles de repartidor');
  }

  // Find the delivery person profile
  const deliveryPerson = await db.deliveryPerson.findUnique({
    where: { userId: auth.user.id },
  });

  if (!deliveryPerson) {
    return apiNotFound('No se encontró el perfil de repartidor para este usuario');
  }

  const body = await request.json();
  const {
    vehicleType,
    plateNumber,
    availabilitySchedule,
    zones,
    idDocument,
    phone,
    name
  } = body;

  try {
    const updatedDp = await db.$transaction(async (tx) => {
      // Update delivery person specific fields
      const dp = await tx.deliveryPerson.update({
        where: { id: deliveryPerson.id },
        data: {
          vehicleType: vehicleType !== undefined ? vehicleType : undefined,
          plateNumber: plateNumber !== undefined ? plateNumber : undefined,
          availabilitySchedule: availabilitySchedule ? (typeof availabilitySchedule === 'string' ? availabilitySchedule : JSON.stringify(availabilitySchedule)) : undefined,
          zones: zones ? (typeof zones === 'string' ? zones : JSON.stringify(zones)) : undefined,
          idDocument: idDocument !== undefined ? idDocument : undefined,
        },
      });

      // Update user profile fields if provided
      if (name || phone) {
        await tx.user.update({
          where: { id: auth.user.id },
          data: {
            name: name || undefined,
            phone: phone || undefined,
          },
        });
      }

      return dp;
    });

    // Create audit log outside of transaction to avoid SQLite locks/timeouts
    createAuditLog({
      userId: auth.user.id,
      action: 'update',
      entity: 'DeliveryPerson',
      entityId: updatedDp.id,
      newValues: body,
    }).catch(err => console.error('Audit log failed:', err));

    const completeDp = await db.deliveryPerson.findUnique({
      where: { id: updatedDp.id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    return apiSuccess(completeDp);
  } catch (error: any) {
    console.error('Update profile error:', error);
    return apiError('No se pudo actualizar el perfil: ' + error.message, 500);
  }
}
