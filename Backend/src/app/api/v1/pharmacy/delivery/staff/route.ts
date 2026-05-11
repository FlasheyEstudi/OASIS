// 🌿 OASIS - Pharmacy Delivery Staff API
// POST /api/v1/pharmacy/delivery/staff
import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { db } from '@/lib/db';
import { getAuthUserFromHeader } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiError('No autorizado', 401);
    const user = auth.user;

    const pharmacyAdmin = await db.pharmacyAdmin.findUnique({
      where: { userId: user.id }
    });

    if (!pharmacyAdmin) return apiError('Solo los administradores pueden agregar repartidores', 403);

    const body = await request.json();
    const { name, phone, vehicle } = body;

    if (!name || !phone) {
      return apiError('Nombre y teléfono son obligatorios', 400);
    }

    // In a real system, we'd create a User first. 
    // For this implementation, we'll find or create a mock user record.
    const newUser = await db.user.create({
      data: {
        name,
        phone,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@oasis-internal.com`,
        role: 'delivery_person', // Use correct role from ROLES
        isActive: true
      }
    });

    const deliveryPerson = await db.deliveryPerson.create({
      data: {
        userId: newUser.id,
        vehicleType: vehicle || 'Motocicleta',
        status: 'online',
        isInternal: true
      }
    });

    return apiSuccess(deliveryPerson, { message: 'Repartidor interno agregado' });
  } catch (error) {
    console.error('[Delivery Staff POST] Error:', error);
    return apiError('Error al crear repartidor', 500);
  }
}
