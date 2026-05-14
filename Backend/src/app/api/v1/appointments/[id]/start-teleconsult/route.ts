// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - POST /api/appointments/[id]/start-teleconsult
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { id } = await params;

    // 1. Verificar existencia de la cita
    const appointment = await db.appointment.findUnique({
      where: { id },
      include: { doctor: true }
    });

    if (!appointment) return apiNotFound('Cita no encontrada');

    // 2. Verificar que el usuario sea el doctor asignado
    const doctor = await db.doctor.findUnique({ where: { userId: auth.user.id } });
    if (!doctor || doctor.id !== appointment.doctorId) {
      if (auth.user.role !== ROLES.SUPERADMIN) {
        return apiForbidden('Solo el doctor asignado puede iniciar la teleconsulta');
      }
    }

    // 3. Devolver 501 (Not Implemented) según requerimiento de BUG-001.4
    // Pero con validaciones previas completadas.
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Teleconsulta no disponible aún. Estamos trabajando en la integración con el motor de video.',
      code: 501
    }), { 
      status: 501,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error starting teleconsult:', error);
    return apiError('Error al iniciar teleconsulta');
  }
}
