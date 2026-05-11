// 🌿 OASIS - Pharmacy Delivery Config API
// GET & PUT /api/v1/pharmacy/delivery/config
import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { db } from '@/lib/db';
import { getAuthUserFromHeader } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiError('No autorizado', 401);
    const user = auth.user;

    const pharmacyStaff = await db.pharmacyStaff.findUnique({
      where: { userId: user.id },
      include: { pharmacy: true }
    });

    const pharmacyAdmin = await db.pharmacyAdmin.findUnique({
      where: { userId: user.id },
      include: { pharmacy: true }
    });

    const pharmacy = (pharmacyStaff?.pharmacy || pharmacyAdmin?.pharmacy);
    if (!pharmacy) return apiError('Farmacia no encontrada', 404);

    const settings = pharmacy.deliverySettings ? JSON.parse(pharmacy.deliverySettings) : {
      enabled: true,
      fee: 50,
      radius: 10,
      internalOnly: true
    };

    return apiSuccess(settings);
  } catch (error) {
    console.error('[Delivery Config GET] Error:', error);
    return apiError('Error al obtener configuración', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiError('No autorizado', 401);
    const user = auth.user;

    const pharmacyAdmin = await db.pharmacyAdmin.findUnique({
      where: { userId: user.id }
    });

    if (!pharmacyAdmin) return apiError('Solo los administradores pueden cambiar la configuración', 403);

    const body = await request.json();
    
    // Update pharmacy delivery settings
    await db.pharmacy.update({
      where: { id: pharmacyAdmin.pharmacyId },
      data: {
        deliverySettings: JSON.stringify({
          enabled: body.enabled ?? true,
          fee: body.fee ?? 50,
          radius: body.radius ?? 10,
          internalOnly: body.internalOnly ?? true
        })
      }
    });

    return apiSuccess({ message: 'Configuración actualizada correctamente' });
  } catch (error) {
    console.error('[Delivery Config PUT] Error:', error);
    return apiError('Error al guardar configuración', 500);
  }
}
