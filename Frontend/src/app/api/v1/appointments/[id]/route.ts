// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Appointment Detail API Routes
// GET /api/appointments/[id] - Get appointment details
// PUT /api/appointments/[id] - Update appointment
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// Valid status transitions per role
const STATUS_TRANSITIONS: Record<string, Record<string, string[]>> = {
  patient: {
    scheduled: ['cancelled'],
    confirmed: ['cancelled'],
  },
  doctor: {
    scheduled: ['confirmed', 'cancelled'],
    confirmed: ['checked_in', 'in_progress', 'cancelled', 'no_show'],
    checked_in: ['in_progress', 'cancelled', 'no_show'],
    in_progress: ['completed'],
  },
  receptionist: {
    scheduled: ['confirmed', 'cancelled'],
    confirmed: ['checked_in', 'cancelled', 'no_show'],
    checked_in: ['in_progress', 'cancelled', 'no_show'],
    in_progress: ['completed'],
  },
  clinic_admin: {
    scheduled: ['confirmed', 'cancelled'],
    confirmed: ['checked_in', 'cancelled', 'no_show'],
    checked_in: ['in_progress', 'cancelled', 'no_show'],
    in_progress: ['completed'],
  },
  superadmin: {
    // Superadmin can transition to any status
    scheduled: ['confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'],
    confirmed: ['checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'],
    checked_in: ['in_progress', 'completed', 'cancelled', 'no_show'],
    in_progress: ['completed', 'cancelled'],
  },
};

// GET /api/appointments/[id] - Get appointment details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const appointment = await db.appointment.findUnique({
    where: { id },
    include: {
      patient: { include: { user: { select: { id: true, name: true, avatarUrl: true, phone: true } } } },
      doctor: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      clinic: { select: { id: true, name: true, address: true, phone: true, email: true } },
      service: { select: { id: true, name: true, duration: true, price: true } },
      invoice: true,
    },
  });

  if (!appointment) return apiNotFound('Cita no encontrada');

  // Verify access
  const hasAccess = await verifyAppointmentAccess(appointment, auth);
  if (!hasAccess) return apiForbidden('No tiene acceso a esta cita');

  return apiSuccess(appointment);
}

// PUT /api/appointments/[id] - Update appointment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const appointment = await db.appointment.findUnique({ where: { id } });
  if (!appointment) return apiNotFound('Cita no encontrada');

  // Verify access
  const hasAccess = await verifyAppointmentAccess(appointment, auth);
  if (!hasAccess) return apiForbidden('No tiene acceso a esta cita');

  const body = await request.json();
  const { status, cancellationReason, notes } = body;

  // Validate status transition
  if (status) {
    const validStatuses = ['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      return apiError(`Estado inválido. Debe ser: ${validStatuses.join(', ')}`);
    }

    // Check if transition is valid for this role
    const roleKey = auth.user.role as string;
    const allowedTransitions = STATUS_TRANSITIONS[roleKey];
    if (!allowedTransitions) {
      return apiForbidden('Su rol no puede cambiar el estado de citas');
    }

    const currentStatus = appointment.status;
    const allowedNextStatuses = allowedTransitions[currentStatus];
    if (!allowedNextStatuses || !allowedNextStatuses.includes(status)) {
      return apiError(`No se puede cambiar de '${currentStatus}' a '${status}' con su rol actual`);
    }

    // If cancelling, require reason
    if (status === 'cancelled' && !cancellationReason) {
      return apiError('Se requiere un motivo de cancelación');
    }
  }

  const oldValues = {
    status: appointment.status,
    cancellationReason: appointment.cancellationReason,
    notes: appointment.notes,
  };

  const updated = await db.appointment.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(cancellationReason && { cancellationReason }),
      ...(notes !== undefined && { notes }),
    },
    include: {
      patient: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      doctor: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      clinic: { select: { id: true, name: true } },
      service: { select: { id: true, name: true } },
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    clinicId: appointment.clinicId,
    action: 'update',
    entity: 'Appointment',
    entityId: id,
    oldValues,
    newValues: { status: status ?? appointment.status, cancellationReason, notes },
  });

  return apiSuccess(updated);
}

async function verifyAppointmentAccess(
  appointment: { patientId: string; doctorId: string; clinicId: string },
  auth: NonNullable<Awaited<ReturnType<typeof getAuthUserFromHeader>>>
): Promise<boolean> {
  if (auth.user.role === ROLES.SUPERADMIN) return true;

  if (auth.user.role === ROLES.PATIENT) {
    const patient = await db.patient.findUnique({ where: { userId: auth.user.id } });
    return patient?.id === appointment.patientId;
  }

  if (auth.user.role === ROLES.DOCTOR) {
    const doctor = await db.doctor.findUnique({ where: { userId: auth.user.id } });
    return doctor?.id === appointment.doctorId;
  }

  if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({ where: { userId: auth.user.id } });
    return clinicAdmin?.clinicId === appointment.clinicId;
  }

  if (auth.user.role === ROLES.RECEPTIONIST) {
    const receptionist = await db.receptionist.findUnique({ where: { userId: auth.user.id } });
    return receptionist?.clinicId === appointment.clinicId;
  }

  return false;
}
