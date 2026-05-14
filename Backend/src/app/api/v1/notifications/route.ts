// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Notifications API
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    const notifications = await db.notification.findMany({
      where: {
        userId: auth.user.id,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = await db.notification.count({
      where: { userId: auth.user.id, isRead: false },
    });

    return apiSuccess({ notifications, unreadCount });
  } catch (error) {
    return apiError('Error al cargar notificaciones');
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  try {
    const { id, readAll } = await request.json();

    if (readAll) {
      await db.notification.updateMany({
        where: { userId: auth.user.id, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
      return apiSuccess(null, { message: 'Todas las notificaciones marcadas como leídas' });
    }

    if (id) {
      const notification = await db.notification.update({
        where: { id, userId: auth.user.id },
        data: { isRead: true, readAt: new Date() },
      });
      return apiSuccess(notification);
    }

    return apiError('ID de notificación requerido');
  } catch (error) {
    return apiError('Error al actualizar notificación');
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  // Solo superadmins pueden crear notificaciones arbitrarias por API
  // El sistema las crea internamente llamando a db.notification.create
  if (auth.user.role !== 'superadmin') {
    return apiForbidden('No tiene permisos para crear notificaciones');
  }

  try {
    const { userId, title, message, type } = await request.json();
    if (!userId || !title || !message) {
      return apiError('userId, title y message son requeridos');
    }

    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || 'system',
        isRead: false
      }
    });

    return apiSuccess(notification, { status: 201 });
  } catch (error) {
    return apiError('Error al crear notificación');
  }
}
