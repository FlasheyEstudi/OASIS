// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Mark All Notifications as Read
// PUT /api/notifications/read-all - Mark all notifications as read
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiUnauthorized } from '@/lib/api-response';
import { getAuthUserFromHeader } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const now = new Date();

  const result = await db.notification.updateMany({
    where: {
      userId: auth.user.id,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: now,
    },
  });

  return apiSuccess({
    markedAsRead: result.count,
  });
}
