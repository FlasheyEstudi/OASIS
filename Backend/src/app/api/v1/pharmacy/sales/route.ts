// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - POS Sale API
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  // Find the pharmacyId for this user
  let pharmacyId = '';
  if (auth.user.role === ROLES.PHARMACY_ADMIN) {
    const admin = await db.pharmacyAdmin.findFirst({ where: { userId: auth.user.id } });
    pharmacyId = admin?.pharmacyId || '';
  } else if (auth.user.role === ROLES.PHARMACY_STAFF) {
    const staff = await db.pharmacyStaff.findFirst({ where: { userId: auth.user.id } });
    pharmacyId = staff?.pharmacyId || '';
  }

  if (!pharmacyId) return apiForbidden('No tienes una farmacia asociada');

  try {
    const { items, paymentMethod, customerId, subtotal, total } = await request.json();

    // items: [{ inventoryBatchId, quantity, price }]

    const sale = await db.$transaction(async (tx) => {
      // 1. Create the sale/order record
      const order = await tx.order.create({
        data: {
          pharmacyId,
          patientId: customerId || null,
          totalAmount: total || subtotal,
          status: 'delivered', // POS sales are immediate
          paymentStatus: 'paid',
          paymentMethod: paymentMethod || 'cash',
          type: 'pos',
          items: {
            create: items.map((it: any) => ({
              medicationId: it.medicationId,
              quantity: it.quantity,
              unitPrice: it.price,
              totalPrice: it.price * it.quantity,
            })),
          },
        },
      });

      // 2. Update inventory
      for (const item of items) {
        // Decrease stock from batches
        // For simplicity in the demo, we just subtract from the first available batch
        const batch = await tx.inventoryBatch.findFirst({
          where: { pharmacyId, medicationId: item.medicationId, quantity: { gte: item.quantity } },
          orderBy: { expiryDate: 'asc' }
        });

        if (batch) {
          await tx.inventoryBatch.update({
            where: { id: batch.id },
            data: { quantity: { decrement: item.quantity } }
          });
        }
      }

      return order;
    });

    return apiSuccess(sale, { message: 'Venta realizada con éxito' });

  } catch (error) {
    console.error('Error processing POS sale:', error);
    return apiError('Error al procesar la venta', 500);
  }
}
