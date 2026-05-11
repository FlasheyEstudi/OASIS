// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - POST /api/auth/refresh
// Refresh access token using a valid refresh token
// ═══════════════════════════════════════════════════════════════

import { db } from '@/lib/db';
import { apiSuccess, apiError, apiValidation } from '@/lib/api-response';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    // ── Validate required field ──
    if (!refreshToken) {
      return apiValidation('Token de refresco es requerido', {
        refreshToken: 'Token de refresco es requerido',
      });
    }

    // ── Verify refresh token ──
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return apiError('Token de refresco inválido o expirado', 401);
    }

    // ── Find user and verify stored refresh token matches ──
    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return apiError('Usuario no encontrado', 404);
    }

    if (!user.isActive) {
      return apiError('Tu cuenta ha sido desactivada', 403);
    }

    // ── Verify that the refresh token matches the one stored in DB ──
    if (user.refreshToken !== refreshToken) {
      // Token reuse detected — clear all tokens for security
      await db.user.update({
        where: { id: user.id },
        data: { refreshToken: null },
      });

      await createAuditLog({
        userId: user.id,
        action: 'refresh_token_reuse',
        entity: 'User',
        entityId: user.id,
        newValues: { reason: 'token_reuse_detected' },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      return apiError('Token de refresco comprometido. Por favor inicie sesión de nuevo.', 401);
    }

    // ── Generate new access token ──
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // ── Rotate refresh token ──
    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // ── Update stored refresh token ──
    await db.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    // ── Audit log ──
    await createAuditLog({
      userId: user.id,
      action: 'token_refresh',
      entity: 'User',
      entityId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // ── Return new tokens ──
    return apiSuccess({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('[AUTH] Refresh error:', error);
    return apiError('Error interno del servidor', 500);
  }
}
