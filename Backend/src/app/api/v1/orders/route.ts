// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Orders API (List & Create)
// GET /api/orders?patientId=&pharmacyId=&status=&page=&limit=
// POST /api/orders
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiPaginated } from '@/lib/api-response';
import { calculateLoyaltyPoints, getLoyaltyLevel, generateInvoiceNumber, createAuditLog } from '@/lib/oasis-utils';

const DELIVERY_FEE = 50; // NIO flat fee for MVP

// ─── GET /api/orders ────────────────────────────────────────
export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');
  const pharmacyId = searchParams.get('pharmacyId');
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const where: Record<string, unknown> = {};

  // Role-based filtering
  if (auth.user.role === ROLES.PATIENT) {
    const patient = await db.patient.findUnique({ where: { userId: auth.user.id } });
    if (!patient) return apiError('Perfil de paciente no encontrado', 404);
    where.patientId = patient.id;
  } else if (auth.user.role === ROLES.PHARMACY_ADMIN) {
    const pharmacyAdmin = await db.pharmacyAdmin.findUnique({ where: { userId: auth.user.id } });
    if (!pharmacyAdmin) return apiError('Perfil de administrador de farmacia no encontrado', 404);
    where.pharmacyId = pharmacyAdmin.pharmacyId;
  } else if (auth.user.role === ROLES.PHARMACY_STAFF) {
    const pharmacyStaff = await db.pharmacyStaff.findUnique({ where: { userId: auth.user.id } });
    if (!pharmacyStaff) return apiError('Perfil de personal de farmacia no encontrado', 404);
    where.pharmacyId = pharmacyStaff.pharmacyId;
  } else if (auth.user.role === ROLES.DELIVERY_PERSON) {
    // Delivery persons see orders assigned to them
    const deliveryPerson = await db.deliveryPerson.findUnique({ where: { userId: auth.user.id } });
    if (!deliveryPerson) return apiError('Perfil de repartidor no encontrado', 404);
    where.delivery = { deliveryPersonId: deliveryPerson.id };
  }

  // Additional filters
  if (patientId && auth.user.role !== ROLES.PATIENT) where.patientId = patientId;
  if (pharmacyId && auth.user.role !== ROLES.PHARMACY_ADMIN && auth.user.role !== ROLES.PHARMACY_STAFF) {
    where.pharmacyId = pharmacyId;
  }
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        pharmacy: { select: { id: true, name: true, address: true, phone: true } },
        items: { include: { medication: { select: { id: true, name: true, genericName: true, strength: true, dosageForm: true } } } },
        delivery: { include: { deliveryPerson: { include: { user: { select: { name: true, phone: true } } } } } },
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.order.count({ where }),
  ]);

  return apiPaginated(orders, page, limit, total);
}

// ─── POST /api/orders ───────────────────────────────────────
export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.PATIENT && auth.user.role !== ROLES.SUPERADMIN) {
    return apiError('Solo los pacientes pueden crear órdenes', 403);
  }

  const body = await request.json();
  const {
    patientId: bodyPatientId,
    pharmacyId,
    prescriptionId,
    items,
    paymentMethod = 'cash',
    deliveryType = 'delivery',
    deliveryAddress,
    deliveryLatitude,
    deliveryLongitude,
    deliveryNotes,
  } = body;

  if (!pharmacyId || !items || !Array.isArray(items) || items.length === 0) {
    return apiError('farmaciaId, e items son requeridos', 422);
  }

  // Resolve patient
  const patient = bodyPatientId
    ? await db.patient.findUnique({ where: { id: bodyPatientId } })
    : await db.patient.findUnique({ where: { userId: auth.user.id } });

  if (!patient) return apiError('Paciente no encontrado', 404);
  if (bodyPatientId && patient.userId !== auth.user.id && auth.user.role !== ROLES.SUPERADMIN) {
    return apiError('No autorizado para crear órdenes para otro paciente', 403);
  }

  // Validate pharmacy
  const pharmacy = await db.pharmacy.findUnique({ where: { id: pharmacyId } });
  if (!pharmacy || !pharmacy.isActive) return apiError('Farmacia no encontrada o inactiva', 404);

  // Validate delivery address for delivery orders
  if (deliveryType === 'delivery' && !deliveryAddress) {
    return apiError('Dirección de entrega requerida para pedidos a domicilio', 422);
  }

  // ── Step 1: Validate prescription for controlled medications ──
  const medicationIds = items.map((item: { medicationId: string; quantity: number }) => item.medicationId);
  const medications = await db.medication.findMany({
    where: { id: { in: medicationIds } },
  });

  const controlledMedications = medications.filter((m) => m.controlledSubstance || m.requiresPrescription);
  if (controlledMedications.length > 0 && !prescriptionId) {
    return apiError(
      'Se requiere receta médica para medicamentos controlados: ' +
        controlledMedications.map((m) => m.name).join(', '),
      422
    );
  }

  if (prescriptionId) {
    const prescription = await db.prescription.findUnique({
      where: { id: prescriptionId },
      include: { items: true },
    });

    if (!prescription) return apiError('Receta no encontrada', 404);
    if (prescription.patientId !== patient.id) return apiError('La receta no pertenece a este paciente', 403);
    if (prescription.status !== 'active') return apiError('La receta no está activa', 400);
    if (prescription.validUntil && new Date(prescription.validUntil) < new Date()) {
      return apiError('La receta ha expirado', 400);
    }

    // Verify controlled medications are in the prescription
    const prescribedMedIds = prescription.items.map((pi) => pi.medicationId);
    for (const cm of controlledMedications) {
      if (!prescribedMedIds.includes(cm.id)) {
        return apiError(`El medicamento controlado "${cm.name}" no está en la receta`, 422);
      }
    }
  }

  // ── Step 2: Check stock availability and gather prices ──
  const orderItemsData: Array<{
    medicationId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    requiresPrescription: boolean;
    isControlled: boolean;
    batchId: string;
  }> = [];

  let subtotal = 0;

  for (const item of items) {
    const medication = medications.find((m) => m.id === item.medicationId);
    if (!medication) return apiError(`Medicamento no encontrado: ${item.medicationId}`, 404);

    // Find available batches (FEFO - First Expired First Out)
    const batches = await db.inventoryBatch.findMany({
      where: {
        pharmacyId,
        medicationId: item.medicationId,
        quantity: { gt: 0 },
        isActive: true,
        expiryDate: { gt: new Date() }, // Not expired
      },
      orderBy: { expiryDate: 'asc' }, // FEFO: earliest expiry first
    });

    let remainingQty = item.quantity;
    let itemTotal = 0;
    let batchAllocated = false;

    for (const batch of batches) {
      if (remainingQty <= 0) break;

      const allocQty = Math.min(remainingQty, batch.quantity);
      itemTotal += allocQty * batch.sellingPrice;
      remainingQty -= allocQty;

      orderItemsData.push({
        medicationId: item.medicationId,
        quantity: allocQty,
        unitPrice: batch.sellingPrice,
        totalPrice: allocQty * batch.sellingPrice,
        requiresPrescription: medication.requiresPrescription,
        isControlled: medication.controlledSubstance,
        batchId: batch.id,
      });

      batchAllocated = true;
    }

    if (remainingQty > 0) {
      return apiError(
        `Stock insuficiente para "${medication.name}". Faltan ${remainingQty} unidades.`,
        422
      );
    }

    subtotal += itemTotal;
  }

  // ── Step 3: Calculate totals ──
  const deliveryFee = deliveryType === 'delivery' ? DELIVERY_FEE : 0;
  const totalAmount = subtotal + deliveryFee;

  // ── Step 4-8: Create order in transaction ──
  const result = await db.$transaction(async (tx) => {
    // Create order
    const order = await tx.order.create({
      data: {
        patientId: patient.id,
        pharmacyId,
        prescriptionId: prescriptionId || null,
        status: 'pending',
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
        subtotal,
        deliveryFee,
        totalAmount,
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : null,
        deliveryLatitude: deliveryType === 'delivery' ? deliveryLatitude : null,
        deliveryLongitude: deliveryType === 'delivery' ? deliveryLongitude : null,
        deliveryNotes: deliveryType === 'delivery' ? deliveryNotes : null,
        items: {
          create: orderItemsData.map((oi) => ({
            medicationId: oi.medicationId,
            quantity: oi.quantity,
            unitPrice: oi.unitPrice,
            totalPrice: oi.totalPrice,
            batchId: oi.batchId,
            requiresPrescription: oi.requiresPrescription,
            isControlled: oi.isControlled,
          })),
        },
      },
      include: { items: true },
    });

    // Step 5: Deduct inventory (FEFO)
    for (const oi of orderItemsData) {
      await tx.inventoryBatch.update({
        where: { id: oi.batchId },
        data: { quantity: { decrement: oi.quantity } },
      });
    }

    // Step 6: Create invoice
    const invoiceNumber = generateInvoiceNumber();
    await tx.invoice.create({
      data: {
        orderId: order.id,
        pharmacyId,
        patientId: patient.id,
        invoiceNumber,
        type: 'medication',
        subtotal,
        tax: 0,
        discount: 0,
        total: totalAmount,
        paymentMethod,
        paymentStatus: 'pending',
        issuedAt: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Step 7: Award loyalty points
    const currentLevel = patient.loyaltyLevel || 'bronce';
    const pointsEarned = calculateLoyaltyPoints(totalAmount, currentLevel);
    await tx.patient.update({
      where: { id: patient.id },
      data: {
        loyaltyPoints: { increment: pointsEarned },
      },
    });

    // Update loyalty level if needed
    const updatedPoints = patient.loyaltyPoints + pointsEarned;
    const newLevel = getLoyaltyLevel(updatedPoints);
    if (newLevel !== currentLevel) {
      await tx.patient.update({
        where: { id: patient.id },
        data: { loyaltyLevel: newLevel },
      });
    }

    // Update order with loyalty points earned
    await tx.order.update({
      where: { id: order.id },
      data: { loyaltyPointsEarned: pointsEarned },
    });

    // Step 8: Create audit log
    await createAuditLog({
      userId: auth.user.id,
      action: 'create',
      entity: 'Order',
      entityId: order.id,
      newValues: {
        orderId: order.id,
        patientId: patient.id,
        pharmacyId,
        totalAmount,
        itemsCount: orderItemsData.length,
        deliveryType,
        paymentMethod,
        loyaltyPointsEarned: pointsEarned,
      },
    });

    return order;
  });

  // Fetch complete order with relations
  const completeOrder = await db.order.findUnique({
    where: { id: result.id },
    include: {
      patient: { include: { user: { select: { name: true, phone: true } } } },
      pharmacy: { select: { id: true, name: true, address: true, phone: true } },
      items: { include: { medication: { select: { id: true, name: true, genericName: true, strength: true } } } },
      invoice: true,
    },
  });

  return apiSuccess(completeOrder, { status: 201 });
}
