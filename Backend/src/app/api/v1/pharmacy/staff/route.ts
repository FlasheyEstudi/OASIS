// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Pharmacy Staff Management API
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
    const staff = await db.pharmacyStaff.findMany({
      where: { pharmacyId: admin.pharmacyId },
      include: { user: { select: { name: true, email: true, phone: true, avatarUrl: true, isActive: true } } }
    });
    return apiSuccess(staff);
  } catch (error) {
    return apiError('Error al cargar personal');
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth || auth.user.role !== ROLES.PHARMACY_ADMIN) return apiForbidden();

  const admin = await db.pharmacyAdmin.findFirst({ where: { userId: auth.user.id } });
  if (!admin) return apiForbidden();

  try {
    const { email, name, role } = await request.json();

    // In a real app, we'd send an invite. For demo, we find or create the user.
    let user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Create user with default password for demo
      // In production, this would be an invitation flow
      return apiError('El usuario debe estar registrado previamente en Oasis para ser agregado como staff');
    }

    const newStaff = await db.pharmacyStaff.create({
      data: {
        userId: user.id,
        pharmacyId: admin.pharmacyId,
        role: role || 'vendedor'
      }
    });

    return apiSuccess(newStaff, { message: 'Miembro de personal agregado' });
  } catch (error) {
    return apiError('Error al agregar personal');
  }
}
