// 🌿 OASIS - Patient Medical History API
// GET /api/v1/patient/history
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiForbidden } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.PATIENT) {
    return apiForbidden('Solo pacientes pueden ver su historial');
  }

  const patient = await db.patient.findUnique({
    where: { userId: auth.user.id },
  });

  if (!patient) return apiSuccess([]); // No profile yet

  // In a real schema, we'd have a MedicalHistory model. 
  // If not, we'll return the prescriptions and appointments as history.
  const history = await db.prescription.findMany({
    where: { patientId: patient.id },
    include: {
      doctor: { include: { user: { select: { name: true } } } },
      items: { include: { medication: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return apiSuccess(history.map(h => ({
    id: h.id,
    date: h.createdAt,
    type: 'Consulta Médica',
    doctor: h.doctor.user.name,
    diagnosis: h.diagnosis || 'Consulta de rutina',
    treatment: h.items.map(i => i.medication.name).join(', '),
    notes: h.notes,
  })));
}
