
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { sendPushNotification } from '@/lib/fcm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.DELIVERY_PERSON && auth.user.role !== ROLES.SUPERADMIN) {
    return apiForbidden('Solo repartidores pueden actualizar el estado de entrega');
  }

  const { orderId } = await params;
  const { status } = await request.json();

  if (!status) return apiError('Estado requerido', 422);

  const statusMap: Record<string, string> = {
    'picked_up': 'delivering',
    'in_transit': 'delivering',
    'delivered': 'delivered'
  };

  const deliveryStatusMap: Record<string, string> = {
    'picked_up': 'picked_up',
    'in_transit': 'in_transit',
    'delivered': 'delivered'
  };

  if (!deliveryStatusMap[status]) {
    return apiError('Estado de entrega inválido', 422);
  }

  const delivery = await db.delivery.findUnique({
    where: { orderId },
    include: { order: { include: { patient: true } } }
  });

  if (!delivery) return apiNotFound('Entrega no encontrada');

  if (auth.user.role === ROLES.DELIVERY_PERSON) {
    const dp = await db.deliveryPerson.findUnique({ where: { userId: auth.user.id } });
    if (!dp || dp.id !== delivery.deliveryPersonId) {
      return apiForbidden('No tienes permiso para actualizar esta entrega');
    }
  }

  const result = await db.$transaction(async (tx) => {
    const updatedDelivery = await tx.delivery.update({
      where: { orderId },
      data: { 
        status: deliveryStatusMap[status],
        pickupTime: status === 'picked_up' ? new Date() : undefined,
        deliveryTime: status === 'delivered' ? new Date() : undefined
      }
    });

    const orderStatus = statusMap[status];
    if (orderStatus) {
      await tx.order.update({
        where: { id: orderId },
        data: { status: orderStatus }
      });
    }

    if (status === 'delivered') {
      await tx.deliveryPerson.update({
        where: { id: delivery.deliveryPersonId },
        data: { earningsBalance: { increment: 80 } }
      });
    }

    return updatedDelivery;
  });

  // Pillar 5: Firebase Cloud Messaging Push Notification
  const patientUserId = (delivery.order as any).patient?.userId;
  if (patientUserId) {
    let title = 'Actualización de tu pedido Oasis';
    let body = `Tu pedido ${orderId.slice(-4).toUpperCase()} cambió a ${status}`;
    
    if (status === 'picked_up') {
      title = '¡Pedido en Camino!';
      body = 'El repartidor recogió tu pedido en la farmacia. Puedes rastrearlo en tiempo real.';
    } else if (status === 'delivered') {
      title = '¡Pedido Entregado!';
      body = 'Tu pedido ha llegado a su destino. ¡Que te mejores pronto!';
    } else if (status === 'in_transit') {
      title = 'Repartidor cerca';
      body = 'Tu repartidor está avanzando hacia tu ubicación.';
    }

    // Fire and forget push notification
    sendPushNotification(patientUserId, title, body, { orderId, status }).catch(e => console.error(e));
  }

  return apiSuccess(result);
}
