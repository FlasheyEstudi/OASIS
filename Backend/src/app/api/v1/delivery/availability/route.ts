// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Delivery Availability Toggle API
// PUT /api/delivery/availability
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';

export async function PUT(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.DELIVERY_PERSON && auth.user.role !== ROLES.SUPERADMIN) {
    return apiForbidden('Solo repartidores pueden cambiar disponibilidad');
  }

  const body = await request.json();
  const { isAvailable } = body;

  if (typeof isAvailable !== 'boolean') {
    return apiError('isAvailable (boolean) es requerido', 422);
  }

  const deliveryPerson = await db.deliveryPerson.findUnique({
    where: { userId: auth.user.id },
  });

  if (!deliveryPerson) return apiNotFound('Perfil de repartidor no encontrado');

  const updated = await db.deliveryPerson.update({
    where: { id: deliveryPerson.id },
    data: { isAvailable },
    include: {
      user: { select: { name: true, phone: true } },
    },
  });

  return apiSuccess(updated);
}
