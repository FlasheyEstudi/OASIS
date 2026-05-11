import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiValidation } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// POST /api/receptionist/assign-doctor - Reasignar citas masivamente
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const allowedRoles = [ROLES.RECEPTIONIST, ROLES.CLINIC_ADMIN, ROLES.SUPERADMIN];
    if (!allowedRoles.includes(auth.user.role as typeof ROLES[keyof typeof ROLES])) {
      return apiForbidden('Solo recepcionistas o administradores pueden reasignar citas');
    }

    const body = await request.json();
    const { fromDoctorId, toDoctorId, appointmentIds, date, clinicId } = body;

    if (!toDoctorId) {
      return apiValidation('Se requiere toDoctorId (doctor destino)');
    }

    // Verificar doctor destino existe
    const targetDoctor = await db.doctor.findUnique({
      where: { id: toDoctorId },
    });

    if (!targetDoctor) return apiNotFound('Doctor destino no encontrado');

    let appointmentsToReassign: string[] = [];

    if (appointmentIds && Array.isArray(appointmentIds)) {
      // Reasignación selectiva por IDs
      appointmentsToReassign = appointmentIds;
    } else if (fromDoctorId) {
      // Reasignar todas las citas de un doctor (ej: doctor se enfermó)
      const where: Record<string, unknown> = {
        doctorId: fromDoctorId,
        status: 'scheduled',
      };
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        where.date = { gte: startOfDay, lte: endOfDay };
      }
      if (clinicId) {
        where.clinicId = clinicId;
      }

      const appointments = await db.appointment.findMany({
        where,
        select: { id: true },
      });
      appointmentsToReassign = appointments.map(a => a.id);
    } else {
      return apiValidation('Se requiere fromDoctorId o appointmentIds');
    }

    if (appointmentsToReassign.length === 0) {
      return apiSuccess({
        reassigned: 0,
        message: 'No se encontraron citas para reasignar',
      });
    }

    // Reasignar citas
    const result = await db.appointment.updateMany({
      where: { id: { in: appointmentsToReassign } },
      data: { doctorId: toDoctorId },
    });

    await createAuditLog({
      userId: auth.user.id,
      clinicId: clinicId || targetDoctor.clinicId,
      action: 'mass_reassign_appointments',
      entity: 'Appointment',
      newValues: {
        fromDoctorId,
        toDoctorId,
        count: result.count,
        appointmentIds: appointmentsToReassign,
      },
    });

    return apiSuccess({
      reassigned: result.count,
      fromDoctorId,
      toDoctorId,
      message: `${result.count} cita(s) reasignada(s) exitosamente`,
    });
  } catch (error) {
    console.error('Error al reasignar citas:', error);
    return apiError('Error al reasignar citas', 500);
  }
}
