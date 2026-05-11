// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Recepcionista: Citas API (Listar y Crear)
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// GET /api/receptionist/appointments - Listar citas para recepcionista
export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.SUPERADMIN && auth.user.role !== ROLES.RECEPTIONIST && auth.user.role !== ROLES.CLINIC_ADMIN) {
    return apiForbidden('No tienes permisos para ver citas');
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const date = searchParams.get('date') || '';
  const status = searchParams.get('status') || '';
  const clinicId = searchParams.get('clinicId') || '';
  const doctorId = searchParams.get('doctorId') || '';
  const skip = (page - 1) * limit;

  // Determinar clínica del recepcionista
  let resolvedClinicId = clinicId;

  if (auth.user.role === ROLES.RECEPTIONIST) {
    const receptionist = await db.receptionist.findUnique({
      where: { userId: auth.user.id },
    });
    if (!receptionist) return apiForbidden('No tienes una clínica asignada');
    resolvedClinicId = receptionist.clinicId;
  } else if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({
      where: { userId: auth.user.id },
    });
    if (!clinicAdmin) return apiForbidden('No tienes una clínica asignada');
    resolvedClinicId = clinicAdmin.clinicId;
  }

  if (!resolvedClinicId) {
    return apiError('clinicId es requerido', 422);
  }

  const where: Record<string, unknown> = { clinicId: resolvedClinicId };
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    where.date = { gte: startOfDay, lte: endOfDay };
  }
  if (status) where.status = status;
  if (doctorId) where.doctorId = doctorId;

  const [appointments, total] = await Promise.all([
    db.appointment.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
      include: {
        patient: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
          },
        },
        doctor: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
          },
        },
        service: { select: { id: true, name: true, price: true, duration: true } },
        invoice: { select: { id: true, invoiceNumber: true, total: true, paymentStatus: true } },
      },
    }),
    db.appointment.count({ where }),
  ]);

  return apiPaginated(appointments, page, limit, total);
}

// POST /api/receptionist/appointments - Crear cita para paciente
export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.SUPERADMIN && auth.user.role !== ROLES.RECEPTIONIST && auth.user.role !== ROLES.CLINIC_ADMIN) {
    return apiForbidden('No tienes permisos para crear citas');
  }

  const body = await request.json();
  const { patientId, doctorId, clinicId, serviceId, date, startTime, endTime, type, notes, familyMemberId } = body;

  if (!patientId || !doctorId || !clinicId || !date || !startTime || !endTime) {
    return apiError('Campos requeridos: patientId, doctorId, clinicId, date, startTime, endTime', 422);
  }

  // Verificar que el recepcionista pertenece a la clínica
  if (auth.user.role === ROLES.RECEPTIONIST) {
    const receptionist = await db.receptionist.findUnique({
      where: { userId: auth.user.id },
    });
    if (!receptionist || receptionist.clinicId !== clinicId) {
      return apiForbidden('Solo puedes crear citas en tu clínica');
    }
  } else if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({
      where: { userId: auth.user.id },
    });
    if (!clinicAdmin || clinicAdmin.clinicId !== clinicId) {
      return apiForbidden('Solo puedes crear citas en tu clínica');
    }
  }

  // Verificar que el doctor pertenece a la clínica
  const doctor = await db.doctor.findFirst({
    where: { id: doctorId, clinicId, isActive: true },
  });
  if (!doctor) return apiNotFound('Doctor no encontrado en esta clínica');

  // Verificar que el paciente existe
  const patient = await db.patient.findUnique({ where: { id: patientId } });
  if (!patient) return apiNotFound('Paciente no encontrado');

  // Verificar que no hay conflicto de horario
  const appointmentDate = new Date(date);
  const conflictingAppointment = await db.appointment.findFirst({
    where: {
      doctorId,
      date: appointmentDate,
      startTime,
      status: { in: ['scheduled', 'confirmed', 'checked_in', 'in_progress'] },
    },
  });
  if (conflictingAppointment) {
    return apiError('El doctor ya tiene una cita en este horario', 409);
  }

  const appointment = await db.appointment.create({
    data: {
      clinicId,
      doctorId,
      patientId,
      serviceId,
      familyMemberId,
      date: appointmentDate,
      startTime,
      endTime,
      type: type || 'presencial',
      notes,
      status: 'scheduled',
    },
    include: {
      patient: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      },
      doctor: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
      service: { select: { id: true, name: true, price: true } },
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    clinicId,
    action: 'create',
    entity: 'Appointment',
    entityId: appointment.id,
    newValues: { patientId, doctorId, date, startTime, endTime, type },
    ipAddress: request.headers.get('x-forwarded-for') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  });

  return apiSuccess(appointment, { status: 201 });
}
