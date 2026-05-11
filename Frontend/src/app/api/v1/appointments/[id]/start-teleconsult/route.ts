import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// POST /api/appointments/[id]/start-teleconsult - Iniciar teleconsulta
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { id } = await params;

    const appointment = await db.appointment.findUnique({
      where: { id },
      include: { doctor: true, patient: true },
    });

    if (!appointment) return apiNotFound('Cita no encontrada');

    // Solo el doctor asignado o admin de clínica pueden iniciar
    const isDoctor = appointment.doctor.userId === auth.user.id;
    const isClinicAdmin = auth.user.role === ROLES.CLINIC_ADMIN;
    const isSuperadmin = auth.user.role === ROLES.SUPERADMIN;

    if (!isDoctor && !isClinicAdmin && !isSuperadmin) {
      return apiForbidden('Solo el doctor asignado o admin de clínica puede iniciar la teleconsulta');
    }

    // Generar link de Jitsi Meet para MVP
    const teleconsultLink = `https://meet.jit.si/oasis-${appointment.id}`;

    // Actualizar cita
    const updated = await db.appointment.update({
      where: { id },
      data: {
        type: 'teleconsult',
        teleconsultLink,
        status: 'in_progress',
      },
    });

    // Crear notificación para el paciente
    await db.notification.create({
      data: {
        userId: appointment.patient.userId,
        title: 'Teleconsulta iniciada',
        message: 'Tu doctor ha iniciado la teleconsulta. Únete ahora.',
        type: 'appointment',
        data: JSON.stringify({ appointmentId: id, teleconsultLink }),
        sentVia: 'in_app',
      },
    });

    await createAuditLog({
      userId: auth.user.id,
      clinicId: appointment.clinicId,
      action: 'start_teleconsult',
      entity: 'Appointment',
      entityId: id,
    });

    return apiSuccess({
      appointment: updated,
      teleconsultLink,
      message: 'Teleconsulta iniciada exitosamente',
    });
  } catch (error) {
    console.error('Error al iniciar teleconsulta:', error);
    return apiError('Error al iniciar teleconsulta', 500);
  }
}
