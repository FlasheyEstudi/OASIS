// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Mark Notification as Read
// PUT /api/notifications/[id]/read - Mark notification as read
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const notification = await db.notification.findUnique({ where: { id } });
  if (!notification) return apiNotFound('Notificación no encontrada');

  // Only the notification owner or superadmin can mark as read
  if (notification.userId !== auth.user.id && auth.user.role !== 'superadmin') {
    return apiForbidden('No puede marcar esta notificación como leída');
  }

  const updated = await db.notification.update({
    where: { id },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return apiSuccess(updated);
}
