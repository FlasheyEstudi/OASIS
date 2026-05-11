// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Invoices API (List)
// GET /api/invoices?patientId=&clinicId=&pharmacyId=&status=&page=&limit=
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiForbidden, apiError, apiPaginated } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const patientIdParam = searchParams.get('patientId');
  const clinicId = searchParams.get('clinicId');
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
  } else if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({ where: { userId: auth.user.id } });
    if (!clinicAdmin) return apiError('Perfil de administrador de clínica no encontrado', 404);
    where.clinicId = clinicAdmin.clinicId;
  } else if (auth.user.role === ROLES.RECEPTIONIST) {
    const receptionist = await db.receptionist.findUnique({ where: { userId: auth.user.id } });
    if (!receptionist) return apiError('Perfil de recepcionista no encontrado', 404);
    where.clinicId = receptionist.clinicId;
  }

  // Additional filters (only if user has access)
  if (patientIdParam && auth.user.role !== ROLES.PATIENT) where.patientId = patientIdParam;
  if (clinicId && auth.user.role !== ROLES.CLINIC_ADMIN && auth.user.role !== ROLES.RECEPTIONIST) {
    where.clinicId = clinicId;
  }
  if (pharmacyId && auth.user.role !== ROLES.PHARMACY_ADMIN && auth.user.role !== ROLES.PHARMACY_STAFF) {
    where.pharmacyId = pharmacyId;
  }
  if (status) where.paymentStatus = status;

  const [invoices, total] = await Promise.all([
    db.invoice.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            status: true,
            deliveryType: true,
            pharmacy: { select: { id: true, name: true } },
          },
        },
        appointment: {
          select: {
            id: true,
            status: true,
            doctor: { select: { user: { select: { name: true } } } },
            clinic: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.invoice.count({ where }),
  ]);

  return apiPaginated(invoices, page, limit, total);
}
