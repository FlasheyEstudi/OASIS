// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - POST /api/auth/refresh
// Refresh access token using a valid refresh token with ROTATION
// ═══════════════════════════════════════════════════════════════

import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { apiSuccess, apiError } from '@/lib/api-response';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';
import { AppError } from '@/lib/errors';
import { handleError } from '@/lib/handle-error';
import logger from '@/lib/logger';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const requestId = request.headers.get('X-Request-Id') || 'unknown';
  
  try {
    logger.info({ requestId, endpoint: '/api/v1/auth/refresh' }, 'Refresh token request received');

    // ── Get token from Cookie or Body ──
    const cookieStore = await cookies();
    let refreshToken = cookieStore.get('refreshToken')?.value;
    
    if (!refreshToken) {
      try {
        const body = await request.json();
        refreshToken = body.refreshToken;
      } catch (e) {
        // Body is optional if cookie exists
      }
    }

    if (!refreshToken) {
      throw AppError.unauthorized('Token de refresco es requerido');
    }

    // ── Verify refresh token ──
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      logger.warn({ requestId }, 'Invalid or expired refresh token');
      throw AppError.unauthorized('Token de refresco inválido o expirado');
    }

    // ── Find user ──
    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw AppError.notFound('Usuario no encontrado');
    }

    if (!user.isActive) {
      throw AppError.forbidden('Tu cuenta ha sido desactivada');
    }

    // ── Verify that the refresh token matches the hashed one in DB ──
    const isTokenMatch = user.refreshToken ? await bcrypt.compare(refreshToken, user.refreshToken) : false;

    if (!isTokenMatch) {
      // SECURITY ALERT: Token reuse or invalid token detected
      // Invalidate all sessions for this user for safety
      await db.user.update({
        where: { id: user.id },
        data: { refreshToken: null },
      });

      await createAuditLog({
        userId: user.id,
        action: 'refresh_token_reuse_detected',
        entity: 'User',
        entityId: user.id,
        newValues: { reason: 'token_mismatch_possible_reuse' },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      logger.fatal({ requestId, userId: user.id }, 'CRITICAL: Refresh token reuse detected. User sessions invalidated.');
      throw AppError.unauthorized('Token de refresco comprometido. Por favor inicie sesión de nuevo.');
    }

    // ── Generate new tokens (ROTATION) ──
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // ── Update stored refresh token (hashed) ──
    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await db.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedNewRefreshToken },
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

    logger.info({ requestId, userId: user.id }, 'Token rotated successfully');

    // ── Return response ──
    const response = apiSuccess({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken, // Still returning for mobile apps
    });

    // ── Set New Refresh Token Cookie ──
    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    logger.error({ requestId, error }, 'Error in token refresh');
    return handleError(error);
  }
}
