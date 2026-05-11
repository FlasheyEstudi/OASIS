// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Suppliers API
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// Helper: check if user can manage suppliers for this pharmacy
async function canManageSuppliers(userId: string, role: string, pharmacyId: string): Promise<boolean> {
  if (role === ROLES.SUPERADMIN) return true;
  if (role === ROLES.PHARMACY_ADMIN) {
    const admin = await db.pharmacyAdmin.findFirst({ where: { userId, pharmacyId } });
    return !!admin;
  }
  return false;
}

async function canReadSuppliers(userId: string, role: string, pharmacyId: string): Promise<boolean> {
  if (role === ROLES.SUPERADMIN) return true;
  if (role === ROLES.PHARMACY_ADMIN) {
    const admin = await db.pharmacyAdmin.findFirst({ where: { userId, pharmacyId } });
    return !!admin;
  }
  if (role === ROLES.PHARMACY_STAFF) {
    const staff = await db.pharmacyStaff.findFirst({ where: { userId, pharmacyId } });
    return !!staff;
  }
  return false;
}

// GET /api/pharmacy/suppliers - List suppliers
export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const pharmacyId = searchParams.get('pharmacyId') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const isActive = searchParams.get('isActive');

  if (!pharmacyId) {
    return apiError('pharmacyId es requerido', 400);
  }

  const authorized = await canReadSuppliers(auth.user.id, auth.user.role, pharmacyId);
  if (!authorized) return apiForbidden('No autorizado para ver proveedores');

  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { pharmacyId };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { contactName: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (isActive !== null && isActive !== undefined && isActive !== '') {
    where.isActive = isActive === 'true';
  }

  const [suppliers, total] = await Promise.all([
    db.supplier.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { purchaseOrders: true, inventoryBatches: true } },
      },
    }),
    db.supplier.count({ where }),
  ]);

  return apiPaginated(suppliers, page, limit, total);
}

// POST /api/pharmacy/suppliers - Create supplier
export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const body = await request.json();
  const { pharmacyId, name, contactName, phone, email, address } = body;

  if (!pharmacyId || !name) {
    return apiError('pharmacyId y nombre son requeridos', 400);
  }

  const authorized = await canManageSuppliers(auth.user.id, auth.user.role, pharmacyId);
  if (!authorized) return apiForbidden('No autorizado para crear proveedores');

  const pharmacy = await db.pharmacy.findUnique({ where: { id: pharmacyId } });
  if (!pharmacy) return apiNotFound('Farmacia no encontrada');

  const supplier = await db.supplier.create({
    data: {
      pharmacyId,
      name,
      contactName,
      phone,
      email,
      address,
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'create',
    entity: 'Supplier',
    entityId: supplier.id,
    newValues: supplier,
  });

  return apiSuccess(supplier, { status: 201 });
}
