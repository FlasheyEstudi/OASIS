// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Pharmacy Delivery Management API
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth || auth.user.role !== ROLES.PHARMACY_ADMIN) return apiForbidden();

  const admin = await db.pharmacyAdmin.findFirst({ where: { userId: auth.user.id } });
  if (!admin) return apiForbidden();

  try {
    const deliveryPersons = await db.deliveryPerson.findMany({
      where: {
        // Here we could filter by those associated with this pharmacy
        // For MVP, we'll list those available in the same city
        user: { isActive: true }
      },
      include: { user: { select: { name: true, phone: true, avatarUrl: true } } }
    });
    return apiSuccess(deliveryPersons);
  } catch (error) {
    return apiError('Error al cargar repartidores');
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth || auth.user.role !== ROLES.PHARMACY_ADMIN) return apiForbidden();

  try {
    const { orderId, deliveryPersonId } = await request.json();

    const delivery = await db.delivery.create({
      data: {
        orderId,
        deliveryPersonId,
        status: 'assigned'
      }
    });

    await db.order.update({
      where: { id: orderId },
      data: { status: 'ready' } // Move to ready/delivering
    });

    return apiSuccess(delivery, { message: 'Repartidor asignado correctamente' });
  } catch (error) {
    return apiError('Error al asignar repartidor');
  }
}
