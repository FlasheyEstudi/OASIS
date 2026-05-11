// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Pharmacy Promotions API
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  let pharmacyId = '';
  if (auth.user.role === ROLES.PHARMACY_ADMIN) {
    const admin = await db.pharmacyAdmin.findFirst({ where: { userId: auth.user.id } });
    pharmacyId = admin?.pharmacyId || '';
  } else {
    return apiForbidden('Solo el administrador puede ver promociones');
  }

  try {
    const promotions = await db.promotion.findMany({
      where: { pharmacyId },
      include: { items: { include: { medication: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return apiSuccess(promotions);
  } catch (error) {
    return apiError('Error al cargar promociones');
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth || auth.user.role !== ROLES.PHARMACY_ADMIN) return apiForbidden();

  const admin = await db.pharmacyAdmin.findFirst({ where: { userId: auth.user.id } });
  if (!admin) return apiForbidden();

  try {
    const { name, description, type, value, code, startDate, endDate, medicationIds } = await request.json();

    const promotion = await db.promotion.create({
      data: {
        pharmacyId: admin.pharmacyId,
        name,
        description,
        type,
        value: parseFloat(value),
        code,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        items: {
          create: medicationIds?.map((id: string) => ({ medicationId: id })) || []
        }
      }
    });

    return apiSuccess(promotion, { message: 'Promoción creada con éxito' });
  } catch (error) {
    return apiError('Error al crear promoción');
  }
}
