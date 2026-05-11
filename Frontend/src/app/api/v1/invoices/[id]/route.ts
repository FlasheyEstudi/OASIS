// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Invoice Detail API
// GET /api/invoices/[id] - Get invoice details
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
              medication: { select: { id: true, name: true, genericName: true, strength: true, dosageForm: true } },
            },
          },
          patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
          pharmacy: { select: { id: true, name: true, address: true, phone: true, email: true } },
          delivery: {
            include: {
              deliveryPerson: { include: { user: { select: { name: true, phone: true } } } },
            },
          },
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
      clinic: { select: { id: true, name: true, address: true, phone: true, email: true } },
      returnRequest: true,
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

  return apiSuccess(invoice);
}
