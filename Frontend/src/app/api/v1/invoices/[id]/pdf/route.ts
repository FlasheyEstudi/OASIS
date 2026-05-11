// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Invoice PDF API
// GET /api/invoices/[id]/pdf - Generate/get invoice PDF URL
// For MVP, returns invoice data (PDF generation would use a library in production)
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          items: {
            include: {
              medication: { select: { name: true, genericName: true, strength: true, dosageForm: true } },
            },
          },
          patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
          pharmacy: { select: { id: true, name: true, address: true, phone: true, email: true, logoUrl: true } },
        },
      },
      appointment: {
        include: {
          doctor: { include: { user: { select: { name: true } } } },
          service: { select: { name: true, price: true } },
          clinic: { select: { id: true, name: true, address: true, phone: true } },
          patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
        },
      },
      clinic: { select: { id: true, name: true, address: true, phone: true, email: true, logoUrl: true } },
    },
  });

  if (!invoice) return apiNotFound('Factura no encontrada');

  // Access control
  if (auth.user.role === ROLES.PATIENT) {
    const patient = await db.patient.findUnique({ where: { userId: auth.user.id } });
    if (!patient || patient.id !== invoice.patientId) {
      return apiForbidden('No tienes acceso a esta factura');
    }
  } else if (auth.user.role === ROLES.PHARMACY_ADMIN || auth.user.role === ROLES.PHARMACY_STAFF) {
    const staff = await db.pharmacyAdmin.findUnique({ where: { userId: auth.user.id } }) ||
                  await db.pharmacyStaff.findUnique({ where: { userId: auth.user.id } });
    if (staff && invoice.pharmacyId && staff.pharmacyId !== invoice.pharmacyId) {
      return apiForbidden('No tienes acceso a esta factura');
    }
  } else if (auth.user.role === ROLES.CLINIC_ADMIN || auth.user.role === ROLES.RECEPTIONIST) {
    const staff = await db.clinicAdmin.findUnique({ where: { userId: auth.user.id } }) ||
                  await db.receptionist.findUnique({ where: { userId: auth.user.id } });
    if (staff && invoice.clinicId && staff.clinicId !== invoice.clinicId) {
      return apiForbidden('No tienes acceso a esta factura');
    }
  }

  // For MVP: we provide both structured data AND a simulated PDF buffer
  const pdfData = {
    invoiceNumber: invoice.invoiceNumber,
    issuedAt: invoice.issuedAt,
    dueDate: invoice.dueDate,
    paidAt: invoice.paidAt,
    paymentStatus: invoice.paymentStatus,
    paymentMethod: invoice.paymentMethod,
    type: invoice.type,

    // Seller info
    seller: invoice.order
      ? {
          name: invoice.order.pharmacy.name,
          address: invoice.order.pharmacy.address,
          phone: invoice.order.pharmacy.phone,
          email: invoice.order.pharmacy.email,
          logoUrl: invoice.order.pharmacy.logoUrl,
        }
      : invoice.clinic
        ? {
            name: invoice.clinic.name,
            address: invoice.clinic.address,
            phone: invoice.clinic.phone,
            email: invoice.clinic.email,
            logoUrl: invoice.clinic.logoUrl,
          }
        : null,

    // Buyer info
    buyer: invoice.order
      ? {
          name: invoice.order.patient.user.name,
          email: invoice.order.patient.user.email,
          phone: invoice.order.patient.user.phone,
        }
      : invoice.appointment
        ? {
            name: invoice.appointment.patient.user.name,
            email: invoice.appointment.patient.user.email,
            phone: invoice.appointment.patient.user.phone,
          }
        : null,

    // Line items
    items: invoice.order
      ? invoice.order.items.map((item) => ({
          description: `${item.medication.name}${item.medication.strength ? ` ${item.medication.strength}` : ''}${item.medication.dosageForm ? ` (${item.medication.dosageForm})` : ''}`,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        }))
      : invoice.appointment?.service
        ? [{
            description: invoice.appointment.service.name,
            quantity: 1,
            unitPrice: invoice.appointment.service.price,
            totalPrice: invoice.appointment.service.price,
          }]
        : [],

    // Totals
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    discount: invoice.discount,
    total: invoice.total,
    insuranceAmount: invoice.insuranceAmount,
    copayAmount: invoice.copayAmount,
    currency: 'NIO',

    // PDF URL (if previously generated)
    pdfUrl: invoice.pdfUrl,

    // MVP note
    _mvpNote: 'En producción, este endpoint generaría un PDF usando puppeteer/jsPDF. Los datos están estructurados para renderizado del lado del cliente.',
  };

  return apiSuccess(pdfData);
}
