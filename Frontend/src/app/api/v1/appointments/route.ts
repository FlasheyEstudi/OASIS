// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Appointments API Route
// GET /api/appointments - List appointments (filtered by role)
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

// GET /api/appointments - List appointments (filtered)
export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const clinicId = searchParams.get('clinicId') || undefined;
  const doctorId = searchParams.get('doctorId') || undefined;
  const patientId = searchParams.get('patientId') || undefined;
  const date = searchParams.get('date') || undefined;
  const status = searchParams.get('status') || undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const skip = (page - 1) * limit;

  let where: Record<string, unknown> = {};

  // Apply filters
  if (clinicId) where.clinicId = clinicId;
  if (doctorId) where.doctorId = doctorId;
  if (patientId) where.patientId = patientId;
  if (status) where.status = status;
  if (date) {
    const dateObj = new Date(date);
    const nextDay = new Date(dateObj);
    nextDay.setDate(nextDay.getDate() + 1);
    where.date = { gte: dateObj, lt: nextDay };
  }

  // Role-based scope
  if (auth.user.role === ROLES.PATIENT) {
    const patient = await db.patient.findUnique({ where: { userId: auth.user.id } });
    if (!patient) return apiError('Perfil de paciente no encontrado', 404);
    where.patientId = patient.id;
  } else if (auth.user.role === ROLES.DOCTOR) {
    const doctor = await db.doctor.findUnique({ where: { userId: auth.user.id } });
    if (!doctor) return apiError('Perfil de doctor no encontrado', 404);
    where.doctorId = doctor.id;
  } else if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({ where: { userId: auth.user.id } });
    if (!clinicAdmin) return apiError('No tiene clínica asignada', 404);
    where.clinicId = clinicAdmin.clinicId;
  } else if (auth.user.role === ROLES.RECEPTIONIST) {
    const receptionist = await db.receptionist.findUnique({ where: { userId: auth.user.id } });
    if (!receptionist) return apiError('No tiene clínica asignada', 404);
    where.clinicId = receptionist.clinicId;
  } else if (auth.user.role === ROLES.SUPERADMIN) {
    // No filter - can see all
  } else {
    return apiForbidden('No tiene permisos para ver citas');
  }

  const [appointments, total] = await Promise.all([
    db.appointment.findMany({
      where,
      include: {
        patient: { include: { user: { select: { id: true, name: true, avatarUrl: true, phone: true } } } },
        doctor: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        clinic: { select: { id: true, name: true, address: true } },
        service: { select: { id: true, name: true, duration: true, price: true } },
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    db.appointment.count({ where }),
  ]);

  return apiPaginated(appointments, page, limit, total);
}
