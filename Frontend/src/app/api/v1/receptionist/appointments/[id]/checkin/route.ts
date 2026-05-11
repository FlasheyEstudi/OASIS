// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Recepcionista: Check-in de Paciente
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/receptionist/appointments/[id]/checkin - Marcar paciente llegado
export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.SUPERADMIN && auth.user.role !== ROLES.RECEPTIONIST && auth.user.role !== ROLES.CLINIC_ADMIN) {
    return apiForbidden('No tienes permisos para hacer check-in');
  }

  const { id } = await params;

  const appointment = await db.appointment.findUnique({
    where: { id },
  });

  if (!appointment) return apiNotFound('Cita no encontrada');

  // Solo se puede hacer check-in en citas confirmadas o programadas
  if (!['scheduled', 'confirmed'].includes(appointment.status)) {
    return apiError('Solo se puede hacer check-in en citas programadas o confirmadas', 400);
  }

  // Verificar que el recepcionista pertenece a la misma clínica
  if (auth.user.role === ROLES.RECEPTIONIST) {
    const receptionist = await db.receptionist.findUnique({
      where: { userId: auth.user.id },
    });
    if (!receptionist || receptionist.clinicId !== appointment.clinicId) {
      return apiForbidden('No tienes acceso a citas de esta clínica');
    }
  } else if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({
      where: { userId: auth.user.id },
    });
    if (!clinicAdmin || clinicAdmin.clinicId !== appointment.clinicId) {
      return apiForbidden('No tienes acceso a citas de esta clínica');
    }
  }

  const updated = await db.appointment.update({
    where: { id },
    data: { status: 'checked_in' },
    include: {
      patient: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
      doctor: { include: { user: { select: { id: true, name: true } } } },
      service: { select: { id: true, name: true } },
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    clinicId: appointment.clinicId,
    action: 'checkin',
    entity: 'Appointment',
    entityId: id,
    oldValues: { status: appointment.status },
    newValues: { status: 'checked_in' },
    ipAddress: request.headers.get('x-forwarded-for') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  });

  return apiSuccess(updated);
}
