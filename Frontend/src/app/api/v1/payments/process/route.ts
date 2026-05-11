// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Payment Processing API
// POST /api/payments/process
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { createAuditLog } from '@/lib/oasis-utils';

export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const body = await request.json();
  const { orderId, invoiceId, amount, paymentMethod, currency = 'NIO' } = body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return apiError('Monto de pago inválido', 422);
  }

  if (!paymentMethod) return apiError('Método de pago requerido', 422);

  const validPaymentMethods = ['cash', 'card_online', 'card_on_delivery', 'insurance'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    return apiError(`Método de pago inválido. Válidos: ${validPaymentMethods.join(', ')}`, 422);
  }

  // Must provide orderId or invoiceId
  if (!orderId && !invoiceId) {
    return apiError('Se requiere orderId o invoiceId', 422);
  }

  // Resolve order and invoice
  let order = null;
  let invoice = null;

  if (orderId) {
    order = await db.order.findUnique({
      where: { id: orderId },
      include: { invoice: true, patient: true },
    });
    if (!order) return apiNotFound('Orden no encontrada');
    invoice = order.invoice;
  }

  if (invoiceId) {
    invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: { order: true },
    });
    if (!invoice) return apiNotFound('Factura no encontrada');
    if (!order) order = invoice.order;
  }

  // Access control
  if (auth.user.role === ROLES.PATIENT) {
    const patient = await db.patient.findUnique({ where: { userId: auth.user.id } });
    if (!patient || (order && patient.id !== order.patientId)) {
      return apiForbidden('No autorizado para procesar este pago');
    }
  }

  // Check if already paid
  if (invoice && invoice.paymentStatus === 'paid') {
    return apiError('La factura ya está pagada', 400);
  }

  // Process payment based on method
  let transactionStatus = 'pending';
  let gatewayResponse: Record<string, unknown> | null = null;
  let transactionRef: string | null = null;

  switch (paymentMethod) {
    case 'card_online': {
      // Simulated payment gateway integration
      const success = true; // MVP: always succeeds
      transactionStatus = success ? 'completed' : 'failed';
      transactionRef = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      gatewayResponse = {
        provider: 'simulated_gateway',
        status: success ? 'approved' : 'declined',
        authCode: `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        timestamp: new Date().toISOString(),
      };
      break;
    }

    case 'cash': {
      transactionStatus = 'completed';
      transactionRef = `CASH-${Date.now()}`;
      gatewayResponse = { method: 'cash', collectedAt: new Date().toISOString() };
      break;
    }

    case 'card_on_delivery': {
      transactionStatus = 'pending'; // Will be confirmed on delivery
      transactionRef = `COD-${Date.now()}`;
      gatewayResponse = { method: 'card_on_delivery', status: 'pending_collection' };
      break;
    }

    case 'insurance': {
      // Calculate copay
      let copayAmount = amount;
      if (order && order.patientId) {
        const patient = await db.patient.findUnique({
          where: { id: order.patientId },
          include: { insurances: { where: { isActive: true } } },
        });
        const activeInsurance = patient?.insurances[0];
        if (activeInsurance) {
          const copayPct = activeInsurance.copayPercentage || 0;
          copayAmount = amount * (copayPct / 100);
        }
      }
      transactionStatus = 'completed';
      transactionRef = `INS-${Date.now()}`;
      gatewayResponse = {
        method: 'insurance',
        originalAmount: amount,
        copayAmount,
        copayPercentage: ((copayAmount / amount) * 100).toFixed(2) + '%',
        timestamp: new Date().toISOString(),
      };
      break;
    }
  }

  // Create payment transaction and update order/invoice
  const result = await db.$transaction(async (tx) => {
    const paymentTx = await tx.paymentTransaction.create({
      data: {
        orderId: order?.id || null,
        invoiceId: invoice?.id || null,
        amount,
        currency,
        paymentMethod,
        status: transactionStatus,
        gatewayResponse: gatewayResponse ? JSON.stringify(gatewayResponse) : null,
        transactionRef,
        processedAt: transactionStatus === 'completed' ? new Date() : null,
      },
    });

    // Update invoice payment status
    if (invoice && transactionStatus === 'completed') {
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paymentStatus: 'paid',
          paidAt: new Date(),
          paymentMethod,
          ...(paymentMethod === 'insurance' && gatewayResponse
            ? {
                insuranceAmount: (gatewayResponse as Record<string, unknown>).originalAmount
                  ? amount - ((gatewayResponse as Record<string, unknown>).copayAmount as number)
                  : null,
                copayAmount: (gatewayResponse as Record<string, unknown>).copayAmount as number,
              }
            : {}),
        },
      });
    }

    // Update order payment status
    if (order && transactionStatus === 'completed') {
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'paid' },
      });
    }

    await createAuditLog({
      userId: auth.user.id,
      action: 'create',
      entity: 'PaymentTransaction',
      entityId: paymentTx.id,
      newValues: {
        orderId: order?.id,
        invoiceId: invoice?.id,
        amount,
        currency,
        paymentMethod,
        status: transactionStatus,
        transactionRef,
      },
    });

    return paymentTx;
  });

  const completePayment = await db.paymentTransaction.findUnique({
    where: { id: result.id },
  });

  return apiSuccess(completePayment, { status: 201 });
}
