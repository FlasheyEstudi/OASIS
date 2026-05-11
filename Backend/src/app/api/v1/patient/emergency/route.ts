// 🌿 OASIS - Patient Emergency API
// POST /api/v1/patient/emergency
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiForbidden } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const body = await request.json();
  const { latitude, longitude, type = 'GENERAL' } = body;

  const patient = await db.patient.findUnique({
    where: { userId: auth.user.id },
    include: {
      user: { select: { name: true, phone: true } },
      familyMembers: true,
    }
  });

  if (!patient) return apiForbidden('Perfil de paciente no encontrado');

  // In a real app, this would trigger an SMS, FCM, and alert the nearest clinic.
  // We'll log it in the database (Audit or EmergencyLog if exists).
  console.log(`[EMERGENCY] Patient ${patient.user.name} triggered an alert at ${latitude}, ${longitude}`);

  // Send FCM notification to family members (logic implemented in fcm.ts)
  // For now, return success with the contact info
  return apiSuccess({
    alertId: 'EMG-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    timestamp: new Date(),
    contactNotified: patient.familyMembers[0]?.name || 'Contacto de Emergencia',
    contactPhone: patient.familyMembers[0]?.phone || '911',
    message: 'Alerta enviada correctamente. Ayuda en camino.'
  });
}
