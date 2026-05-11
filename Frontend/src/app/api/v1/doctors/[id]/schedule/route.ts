// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET/PUT /api/doctors/[id]/schedule - Doctor's schedule
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

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
      return apiNotFound('Doctor no encontrado');
    }

    let schedule = null;
    if (doctor.schedule) {
      try {
        schedule = JSON.parse(doctor.schedule);
      } catch {
        schedule = doctor.schedule;
      }
    }

    return apiSuccess({
      doctorId: doctor.id,
      doctorName: doctor.user.name,
      specialty: doctor.specialty,
      schedule,
    });
  } catch (error) {
    console.error('Error getting doctor schedule:', error);
    return apiError('Error al obtener horario del doctor', 500);
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
      return apiUnauthorized();
    }

    const doctor = await db.doctor.findUnique({ where: { id } });
    if (!doctor) {
      return apiNotFound('Doctor no encontrado');
    }

    // Only the doctor themselves or superadmin can update schedule
    const isOwnProfile = doctor.userId === auth.user.id;
    const isSuperadmin = auth.user.role === ROLES.SUPERADMIN;

    if (!isOwnProfile && !isSuperadmin) {
      return apiForbidden('Solo el doctor o un superadmin puede actualizar el horario');
    }

    const body = await request.json();
    const { schedule } = body;

    if (!schedule) {
      return apiError('Horario es requerido', 422);
    }

    // Validate schedule structure
    const scheduleStr = typeof schedule === 'string' ? schedule : JSON.stringify(schedule);

    // Try to parse to validate it's valid JSON
    try {
      JSON.parse(scheduleStr);
    } catch {
      return apiError('El horario debe ser un JSON válido', 422);
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

    let parsedSchedule = null;
    try {
      parsedSchedule = JSON.parse(updatedDoctor.schedule!);
    } catch {
      parsedSchedule = updatedDoctor.schedule;
    }

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
    console.error('Error updating doctor schedule:', error);
    return apiError('Error al actualizar horario del doctor', 500);
  }
}
