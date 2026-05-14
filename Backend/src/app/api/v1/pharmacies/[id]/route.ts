// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Pharmacy API: Get, Update, Delete
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// Helper: check if user can manage this pharmacy
async function canManagePharmacy(userId: string, role: string, pharmacyId: string): Promise<boolean> {
  if (role === ROLES.SUPERADMIN) return true;
  if (role === ROLES.PHARMACY_ADMIN) {
    const admin = await db.pharmacyAdmin.findFirst({
      where: { userId, pharmacyId },
    });
    return !!admin;
  }
  return false;
}

// GET /api/pharmacies/[id] - Get pharmacy details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  // Permitir acceso público

  const { id } = await params;

  const pharmacy = await db.pharmacy.findUnique({
    where: { id },
    include: {
      admins: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
      staff: { where: { isActive: true }, include: { user: { select: { id: true, name: true, email: true } } } },
      branches: { where: { isActive: true } },
      _count: {
        select: {
          inventoryBatches: { where: { isActive: true, quantity: { gt: 0 } } },
          orders: true,
          suppliers: { where: { isActive: true } },
          purchaseOrders: true,
          promotions: { where: { isActive: true } },
        },
      },
    },
  });

  if (!pharmacy) return apiNotFound('Farmacia no encontrada');

  return apiSuccess(pharmacy);
}

// PUT /api/pharmacies/[id] - Update pharmacy
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const authorized = await canManagePharmacy(auth.user.id, auth.user.role, id);
  if (!authorized) return apiForbidden('No autorizado para modificar esta farmacia');

  const existing = await db.pharmacy.findUnique({ where: { id } });
  if (!existing) return apiNotFound('Farmacia no encontrada');

  const body = await request.json();
  const {
    name,
    description,
    logoUrl,
    phone,
    email,
    website,
    address,
    city,
    department,
    latitude,
    longitude,
    deliverySettings,
    paymentMethods,
    isActive,
  } = body;

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
  if (phone !== undefined) updateData.phone = phone;
  if (email !== undefined) updateData.email = email;
  if (website !== undefined) updateData.website = website;
  if (address !== undefined) updateData.address = address;
  if (city !== undefined) updateData.city = city;
  if (department !== undefined) updateData.department = department;
  if (latitude !== undefined) updateData.latitude = latitude;
  if (longitude !== undefined) updateData.longitude = longitude;
  if (deliverySettings !== undefined) updateData.deliverySettings = JSON.stringify(deliverySettings);
  if (paymentMethods !== undefined) updateData.paymentMethods = JSON.stringify(paymentMethods);
  if (isActive !== undefined) updateData.isActive = isActive;

  const pharmacy = await db.pharmacy.update({
    where: { id },
    data: updateData,
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'update',
    entity: 'Pharmacy',
    entityId: id,
    oldValues: existing,
    newValues: pharmacy,
  });

  return apiSuccess(pharmacy);
}

// DELETE /api/pharmacies/[id] - Soft delete (superadmin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.SUPERADMIN) {
    return apiForbidden('Solo el superadmin puede eliminar farmacias');
  }

  const { id } = await params;

  const existing = await db.pharmacy.findUnique({ where: { id } });
  if (!existing) return apiNotFound('Farmacia no encontrada');

  const pharmacy = await db.pharmacy.update({
    where: { id },
    data: { isActive: false },
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'soft_delete',
    entity: 'Pharmacy',
    entityId: id,
    oldValues: existing,
    newValues: pharmacy,
  });

  return apiSuccess({ message: 'Farmacia desactivada exitosamente' });
}
