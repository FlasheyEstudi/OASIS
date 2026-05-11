// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Pharmacy Returns API (List)
// GET /api/pharmacy/returns?pharmacyId=&status=&page=&limit=
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiForbidden, apiError, apiPaginated } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (
    auth.user.role !== ROLES.PHARMACY_ADMIN &&
    auth.user.role !== ROLES.PHARMACY_STAFF &&
    auth.user.role !== ROLES.SUPERADMIN
  ) {
    return apiForbidden('Solo personal de farmacia puede ver devoluciones');
  }

  const { searchParams } = new URL(request.url);
  const pharmacyIdParam = searchParams.get('pharmacyId');
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  // Determine pharmacy ID from user role
  let pharmacyId = pharmacyIdParam;
  if (auth.user.role === ROLES.PHARMACY_ADMIN) {
    const pharmacyAdmin = await db.pharmacyAdmin.findUnique({ where: { userId: auth.user.id } });
    if (!pharmacyAdmin) return apiError('Perfil de administrador de farmacia no encontrado', 404);
    pharmacyId = pharmacyAdmin.pharmacyId;
  } else if (auth.user.role === ROLES.PHARMACY_STAFF) {
    const pharmacyStaff = await db.pharmacyStaff.findUnique({ where: { userId: auth.user.id } });
    if (!pharmacyStaff) return apiError('Perfil de personal de farmacia no encontrado', 404);
    pharmacyId = pharmacyStaff.pharmacyId;
  }

  if (!pharmacyId) return apiError('ID de farmacia requerido', 422);

  const where: Record<string, unknown> = {
    order: { pharmacyId },
  };
  if (status) where.status = status;

  const [returns, total] = await Promise.all([
    db.returnRequest.findMany({
      where,
      include: {
        order: {
          include: {
            items: { include: { medication: { select: { name: true, genericName: true } } } },
            patient: { include: { user: { select: { name: true, phone: true } } } },
            invoice: true,
          },
        },
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.returnRequest.count({ where }),
  ]);

  return apiPaginated(returns, page, limit, total);
}
