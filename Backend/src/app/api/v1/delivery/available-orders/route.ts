import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { safeJsonParse } from '@/lib/oasis-utils';
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { handleError } from '@/lib/handle-error';
import logger from '@/lib/logger';
import { AppError } from '@/lib/errors';
import { getClientIp, apiLimiter } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('X-Request-Id') || 'unknown';
  try {
    const ip = getClientIp(request);
    await apiLimiter.limit(ip);
    
    logger.info({ requestId, endpoint: '/api/v1/delivery/available-orders' }, 'Fetching available orders');

    const auth = await getAuthUserFromHeader(request);
    if (!auth) throw AppError.unauthorized();

    if (auth.user.role !== ROLES.DELIVERY_PERSON && auth.user.role !== ROLES.SUPERADMIN) {
      throw AppError.forbidden('Solo repartidores pueden ver órdenes disponibles');
    }

    const deliveryPerson = await db.deliveryPerson.findUnique({
      where: { userId: auth.user.id },
    });

    if (!deliveryPerson) throw AppError.notFound('Perfil de repartidor no encontrado');

    if (!deliveryPerson.isAvailable) {
      throw AppError.badRequest('Debes estar disponible para ver órdenes');
    }

    // Find orders with status 'ready_for_pickup', deliveryType='delivery', no delivery assigned
    const availableOrders = await db.order.findMany({
      where: {
        status: 'ready_for_pickup',
        deliveryType: 'delivery',
        delivery: null,
      },
      include: {
        pharmacy: { select: { name: true, address: true, latitude: true, longitude: true } },
        items: { include: { medication: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Simple filtering by zones if deliveryPerson has zones
    let filteredOrders = availableOrders;
    const personZones = safeJsonParse<string[]>(deliveryPerson.zones, []);
    
    if (personZones.length > 0) {
      filteredOrders = availableOrders.filter(order => {
        const address = order.deliveryAddress?.toLowerCase() || '';
        return personZones.some(zone => address.includes(zone.toLowerCase()));
      });
    }

    return apiSuccess(filteredOrders);
  } catch (error) {
    logger.error({ requestId, error }, 'Error fetching available orders');
    return handleError(error);
  }
}
