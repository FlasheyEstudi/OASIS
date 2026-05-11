import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

// GET /api/appointments/[id]/teleconsult-link - Obtener link de teleconsulta
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { id } = await params;

    const appointment = await db.appointment.findUnique({
      where: { id },
      include: { doctor: { include: { user: true } }, patient: true },
    });

    if (!appointment) return apiNotFound('Cita no encontrada');

    // Solo el doctor asignado, el paciente, o admin pueden ver el link
    const isDoctor = appointment.doctor.userId === auth.user.id;
    const isPatient = appointment.patient.userId === auth.user.id;
    const isClinicAdmin = auth.user.role === ROLES.CLINIC_ADMIN;
    const isSuperadmin = auth.user.role === ROLES.SUPERADMIN;

    if (!isDoctor && !isPatient && !isClinicAdmin && !isSuperadmin) {
      return apiForbidden('No autorizado para ver esta teleconsulta');
    }

    if (!appointment.teleconsultLink) {
      return apiError('Esta cita no tiene teleconsulta configurada', 404);
    }

    return apiSuccess({
      teleconsultLink: appointment.teleconsultLink,
      appointment: {
        id: appointment.id,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        type: appointment.type,
        doctorName: appointment.doctor.user?.name,
      },
    });
  } catch (error) {
    console.error('Error al obtener link de teleconsulta:', error);
    return apiError('Error al obtener link de teleconsulta', 500);
  }
}
