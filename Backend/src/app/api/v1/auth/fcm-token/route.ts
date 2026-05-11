// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - FCM Token Registration API
// POST /api/v1/auth/fcm-token - Save device token for push notifications
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return apiError('El token FCM es obligatorio y debe ser un texto', 400);
    }

    // Guardar el token en el usuario
    await db.user.update({
      where: { id: auth.user.id },
      data: { fcmToken: token }
    });

    return apiSuccess({ success: true }, { message: 'Token de notificaciones registrado correctamente' });
  } catch (error) {
    console.error('[FCM API ERROR]', error);
    return apiError('Error al registrar token de notificaciones', 500);
  }
}
