// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Pharmacy Staff API
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';
import { hash } from 'bcryptjs';

// Helper: check if user can manage this pharmacy's staff
async function canManageStaff(userId: string, role: string, pharmacyId: string): Promise<boolean> {
  if (role === ROLES.SUPERADMIN) return true;
  if (role === ROLES.PHARMACY_ADMIN) {
    const admin = await db.pharmacyAdmin.findFirst({ where: { userId, pharmacyId } });
    return !!admin;
  }
  return false;
}

// GET /api/pharmacies/[id]/staff - List pharmacy staff
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  // pharmacy_staff can also read staff list
  const canRead =
    auth.user.role === ROLES.SUPERADMIN ||
    auth.user.role === ROLES.PHARMACY_ADMIN ||
    auth.user.role === ROLES.PHARMACY_STAFF;

  if (!canRead) return apiForbidden('No autorizado');

  // Obtener todo en una sola tanda de consultas optimizadas
  const [staff, admins] = await Promise.all([
    db.pharmacyStaff.findMany({
      where: { pharmacyId: id, isActive: true },
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.pharmacyAdmin.findMany({
      where: { pharmacyId: id, isActive: true },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            isActive: true,
          },
        },
      },
    }),
  ]);

  return apiSuccess({
    admins: admins.map((a) => ({ ...a, role: 'pharmacy_admin' })),
    staff,
  });
}

// POST /api/pharmacies/[id]/staff - Add staff member
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const authorized = await canManageStaff(auth.user.id, auth.user.role, id);
  if (!authorized) return apiForbidden('No autorizado para agregar personal');

  const pharmacy = await db.pharmacy.findUnique({ where: { id } });
  if (!pharmacy) return apiNotFound('Farmacia no encontrada');

  const body = await request.json();
  const { name, email, password, phone, role: staffRole } = body;

  if (!name || !email || !password) {
    return apiError('Nombre, email y contraseña son requeridos', 400);
  }

  // Check if email already exists
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return apiError('Ya existe un usuario con este email', 409);
  }

  const hashedPassword = await hash(password, 12);

  // Create User + PharmacyStaff in a transaction
  const result = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: ROLES.PHARMACY_STAFF,
      },
    });

    const staff = await tx.pharmacyStaff.create({
      data: {
        userId: user.id,
        pharmacyId: id,
        role: staffRole || 'vendedor',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return staff;
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'create',
    entity: 'PharmacyStaff',
    entityId: result.id,
    newValues: { staffId: result.id, pharmacyId: id, staffRole: staffRole || 'vendedor' },
  });

  return apiSuccess(result, { status: 201 });
}
