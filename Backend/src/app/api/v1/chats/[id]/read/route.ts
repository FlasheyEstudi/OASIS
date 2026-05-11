// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Chat Mark Read API Route
// PUT /api/chats/[id]/read - Mark messages as read
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

// Helper: verify user is participant in chat
async function verifyParticipant(chatId: string, userId: string, role: string): Promise<boolean> {
  const chat = await db.chat.findUnique({ where: { id: chatId } });
  if (!chat) return false;

  if (role === ROLES.SUPERADMIN) return true;

  if (role === ROLES.PATIENT) {
    const patient = await db.patient.findUnique({ where: { userId } });
    return patient?.id === chat.patientId;
  }

  if (role === ROLES.DOCTOR) {
    const doctor = await db.doctor.findUnique({ where: { userId } });
    return doctor?.id === chat.doctorId;
  }

  if (role === ROLES.PHARMACY_ADMIN || role === ROLES.PHARMACY_STAFF) {
    const pharmacyAdmin = await db.pharmacyAdmin.findUnique({ where: { userId } });
    const pharmacyStaff = await db.pharmacyStaff.findUnique({ where: { userId } });
    const userPharmacyId = pharmacyAdmin?.pharmacyId || pharmacyStaff?.pharmacyId;
    return userPharmacyId === chat.pharmacyId;
  }

  if (role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({ where: { userId } });
    return clinicAdmin?.clinicId === chat.clinicId;
  }

  return false;
}

// PUT /api/chats/[id]/read - Mark all unread messages as read for current user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id: chatId } = await params;

  // Verify chat exists
  const chat = await db.chat.findUnique({ where: { id: chatId } });
  if (!chat) return apiNotFound('Chat no encontrado');

  // Verify user is participant
  const isParticipant = await verifyParticipant(chatId, auth.user.id, auth.user.role);
  if (!isParticipant) return apiForbidden('No tiene acceso a este chat');

  // Mark all unread messages NOT sent by the current user as read
  const result = await db.message.updateMany({
    where: {
      chatId,
      senderId: { not: auth.user.id },
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return apiSuccess({
    markedAsRead: result.count,
    chatId,
  });
}
