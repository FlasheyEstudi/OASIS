// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Chat Messages API Routes
// GET /api/chats/[id]/messages - Get messages (paginated, cursor-based)
// POST /api/chats/[id]/messages - Send message
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

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

// GET /api/chats/[id]/messages - Get messages (paginated, cursor-based)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id: chatId } = await params;
  const { searchParams } = new URL(request.url);

  // Cursor-based pagination
  const before = searchParams.get('before') || undefined; // message ID cursor
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

  // Verify chat exists and user is participant
  const chat = await db.chat.findUnique({ where: { id: chatId } });
  if (!chat) return apiNotFound('Chat no encontrado');

  const isParticipant = await verifyParticipant(chatId, auth.user.id, auth.user.role);
  if (!isParticipant) return apiForbidden('No tiene acceso a este chat');

  // Build where clause for cursor-based pagination
  let where: Record<string, unknown> = { chatId };

  if (before) {
    // Get the cursor message to find its createdAt
    const cursorMessage = await db.message.findUnique({ where: { id: before } });
    if (cursorMessage) {
      where.createdAt = { lt: cursorMessage.createdAt };
    }
  }

  const messages = await db.message.findMany({
    where,
    select: {
      id: true,
      message: true,
      attachment: true,
      createdAt: true,
      senderId: true,
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  // Reverse to show oldest first in the result (more natural for chat)
  const reversedMessages = messages.reverse();

  // Determine if there are more messages
  const hasMore = messages.length === limit;

  return apiSuccess({
    messages: reversedMessages,
    hasMore,
    oldestMessageId: reversedMessages[0]?.id || null,
  });
}

// POST /api/chats/[id]/messages - Send message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id: chatId } = await params;

  // Verify chat exists and is active
  const chat = await db.chat.findUnique({ where: { id: chatId } });
  if (!chat) return apiNotFound('Chat no encontrado');
  if (chat.status !== 'active') return apiError('El chat está cerrado o archivado');

  // Verify user is participant
  const isParticipant = await verifyParticipant(chatId, auth.user.id, auth.user.role);
  if (!isParticipant) return apiForbidden('No puede enviar mensajes en este chat');

  const body = await request.json();
  const { message, attachment } = body;

  if (!message && !attachment) {
    return apiError('El mensaje o el adjunto es requerido');
  }

  if (message && message.length > 2000) {
    return apiError('El mensaje no puede exceder 2000 caracteres');
  }

  // Create message
  const newMessage = await db.message.create({
    data: {
      chatId,
      senderId: auth.user.id,
      message: message || '',
      attachment: attachment || null,
      isRead: false,
    },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
    },
  });

  // Update chat's lastMessageAt
  await db.chat.update({
    where: { id: chatId },
    data: { lastMessageAt: new Date() },
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'create',
    entity: 'Message',
    entityId: newMessage.id,
    newValues: { chatId, messageLength: message?.length || 0, hasAttachment: !!attachment },
  });

  return apiSuccess(newMessage, { status: 201 });
}
