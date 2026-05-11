// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Chat Detail API Route
// GET /api/chats/[id] - Get chat details
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const chat = await db.chat.findUnique({
    where: { id },
    include: {
      patient: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      doctor: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      pharmacy: { select: { id: true, name: true, logoUrl: true, phone: true, email: true } },
      clinic: { select: { id: true, name: true, logoUrl: true, phone: true, email: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
        },
      },
    },
  });

  if (!chat) return apiNotFound('Chat no encontrado');

  // Verify the user is a participant
  const isParticipant = await verifyChatParticipant(chat, auth);
  if (!isParticipant) return apiForbidden('No tiene acceso a este chat');

  return apiSuccess(chat);
}

async function verifyChatParticipant(
  chat: {
    patientId: string;
    doctorId: string | null;
    pharmacyId: string | null;
    clinicId: string | null;
  },
  auth: NonNullable<Awaited<ReturnType<typeof getAuthUserFromHeader>>>
): Promise<boolean> {
  // Superadmin can access any chat
  if (auth.user.role === ROLES.SUPERADMIN) return true;

  // Patient check
  if (auth.user.role === ROLES.PATIENT) {
    const patient = await db.patient.findUnique({ where: { userId: auth.user.id } });
    return patient?.id === chat.patientId;
  }

  // Doctor check
  if (auth.user.role === ROLES.DOCTOR) {
    const doctor = await db.doctor.findUnique({ where: { userId: auth.user.id } });
    return doctor?.id === chat.doctorId;
  }

  // Pharmacy admin/staff check
  if (auth.user.role === ROLES.PHARMACY_ADMIN || auth.user.role === ROLES.PHARMACY_STAFF) {
    const pharmacyAdmin = await db.pharmacyAdmin.findUnique({ where: { userId: auth.user.id } });
    const pharmacyStaff = await db.pharmacyStaff.findUnique({ where: { userId: auth.user.id } });
    const userPharmacyId = pharmacyAdmin?.pharmacyId || pharmacyStaff?.pharmacyId;
    return userPharmacyId === chat.pharmacyId;
  }

  // Clinic admin check
  if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({ where: { userId: auth.user.id } });
    return clinicAdmin?.clinicId === chat.clinicId;
  }

  return false;
}
