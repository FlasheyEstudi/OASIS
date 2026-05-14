// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET/PUT /api/doctors/[id]/schedule - Doctor's schedule
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog, safeJsonParse } from '@/lib/oasis-utils';
import { AppError } from '@/lib/errors';
import { handleError } from '@/lib/handle-error';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const doctor = await db.doctor.findUnique({
      where: { id },
      select: {
        id: true,
        schedule: true,
        specialty: true,
        user: {
          select: { name: true },
        },
      },
    });

    if (!doctor) {
      throw AppError.notFound('Doctor no encontrado');
    }

    const schedule = safeJsonParse(doctor.schedule, null);

    return apiSuccess({
      doctorId: doctor.id,
      doctorName: doctor.user.name,
      specialty: doctor.specialty,
      schedule,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthUserFromHeader(request);

    if (!auth) {
      throw AppError.unauthorized();
    }

    const doctor = await db.doctor.findUnique({ where: { id } });
    if (!doctor) {
      throw AppError.notFound('Doctor no encontrado');
    }

    // Only the doctor themselves or superadmin can update schedule
    const isOwnProfile = doctor.userId === auth.user.id;
    const isSuperadmin = auth.user.role === ROLES.SUPERADMIN;

    if (!isOwnProfile && !isSuperadmin) {
      throw AppError.forbidden('Solo el doctor o un superadmin puede actualizar el horario');
    }

    const body = await request.json();
    const { schedule } = body;

    if (!schedule) {
      throw AppError.badRequest('Horario es requerido');
    }

    // Validate schedule structure
    const scheduleStr = typeof schedule === 'string' ? schedule : JSON.stringify(schedule);

    // Validate it's valid JSON using safeJsonParse
    const isValidJson = safeJsonParse(scheduleStr, null) !== null;
    if (!isValidJson && scheduleStr !== 'null') {
      throw AppError.badRequest('El horario debe ser un JSON válido');
    }

    const oldSchedule = doctor.schedule;

    const updatedDoctor = await db.doctor.update({
      where: { id },
      data: { schedule: scheduleStr },
      select: {
        id: true,
        schedule: true,
      },
    });

    const parsedSchedule = safeJsonParse(updatedDoctor.schedule, null);

    await createAuditLog({
      userId: auth.user.id,
      clinicId: doctor.clinicId,
      action: 'update',
      entity: 'DoctorSchedule',
      entityId: id,
      oldValues: oldSchedule ? { schedule: oldSchedule } : undefined,
      newValues: { schedule: scheduleStr },
    });

    return apiSuccess({
      doctorId: updatedDoctor.id,
      schedule: parsedSchedule,
    });
  } catch (error) {
    return handleError(error);
  }
}
