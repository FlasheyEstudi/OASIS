import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiValidation } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog, generateInvoiceNumber } from '@/lib/oasis-utils';

// POST /api/receptionist/payments/collect - Cobrar consulta
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const allowedRoles = [ROLES.RECEPTIONIST, ROLES.CLINIC_ADMIN, ROLES.SUPERADMIN];
    if (!allowedRoles.includes(auth.user.role as typeof ROLES[keyof typeof ROLES])) {
      return apiForbidden('Solo recepcionistas o administradores pueden cobrar consultas');
    }

    const body = await request.json();
    const { appointmentId, paymentMethod, amount } = body;

    if (!appointmentId || !paymentMethod) {
      return apiValidation('Se requiere appointmentId y paymentMethod');
    }

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: true,
        patient: true,
        service: true,
        clinic: true,
      },
    });

    if (!appointment) return apiNotFound('Cita no encontrada');

    // Determinar monto
    const totalAmount = amount || appointment.service?.price || appointment.doctor.consultationFee || 0;

    if (totalAmount <= 0) {
      return apiValidation('El monto debe ser mayor a 0');
    }

    // Crear factura
    const invoice = await db.invoice.create({
      data: {
        appointmentId,
        clinicId: appointment.clinicId,
        patientId: appointment.patientId,
        invoiceNumber: generateInvoiceNumber(),
        type: 'consultation',
        subtotal: totalAmount,
        tax: 0, // Exento o según configuración
        discount: 0,
        total: totalAmount,
        paymentMethod,
        paymentStatus: 'paid',
        paidAt: new Date(),
        issuedAt: new Date(),
      },
    });

    // Actualizar estado de la cita
    await db.appointment.update({
      where: { id: appointmentId },
      data: { status: 'completed' },
    });

    await createAuditLog({
      userId: auth.user.id,
      clinicId: appointment.clinicId,
      action: 'payment_collect',
      entity: 'Invoice',
      entityId: invoice.id,
      newValues: { amount: totalAmount, paymentMethod, appointmentId },
    });

    return apiSuccess({
      invoice,
      message: 'Pago registrado exitosamente',
    });
  } catch (error) {
    console.error('Error al cobrar consulta:', error);
    return apiError('Error al procesar el cobro', 500);
  }
}
