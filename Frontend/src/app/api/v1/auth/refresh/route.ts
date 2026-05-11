// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - POST /api/v1/auth/refresh
// Refresh access token using refresh token
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return apiError('Refresh token es requerido', 400);
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return apiUnauthorized('Token de refresco inválido o expirado');
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return apiUnauthorized('Token de refresco no coincide');
    }

    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return apiSuccess({ accessToken: newAccessToken }, { message: 'Token renovado exitosamente' });

  } catch (error) {
    return apiError('Error al refrescar token', 500);
  }
}
