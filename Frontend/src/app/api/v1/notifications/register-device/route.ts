// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Register FCM Device Token
// POST /api/notifications/register-device - Register FCM device token
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized } from '@/lib/api-response';
import { getAuthUserFromHeader } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const body = await request.json();
  const { fcmToken } = body;

  if (!fcmToken || typeof fcmToken !== 'string' || fcmToken.trim().length === 0) {
    return apiError('fcmToken es requerido');
  }

  // Update user's FCM token
  await db.user.update({
    where: { id: auth.user.id },
    data: { fcmToken: fcmToken.trim() },
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'update',
    entity: 'User',
    entityId: auth.user.id,
    newValues: { fcmTokenRegistered: true },
  });

  return apiSuccess({ message: 'Token FCM registrado exitosamente' });
}
