// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - POST /api/auth/forgot-password
// Generate a password reset token for the user
// ═══════════════════════════════════════════════════════════════

import crypto from 'crypto';
import { db } from '@/lib/db';
import { apiSuccess, apiValidation } from '@/lib/api-response';
import { createAuditLog } from '@/lib/oasis-utils';

const RESET_TOKEN_EXPIRY_HOURS = 1;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // ── Validate required field ──
    if (!email || typeof email !== 'string') {
      return apiValidation('Email es requerido', {
        email: 'Email válido es requerido',
      });
    }

    // ── Find user by email ──
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // ── Always return success to prevent email enumeration ──
    if (!user) {
      return apiSuccess({
        message: 'Si el email está registrado, recibirás instrucciones para restablecer tu contraseña',
      });
    }

    // ── Generate reset token ──
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // ── Store reset token in user record ──
    await db.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires,
      },
    });

    // ── Audit log ──
    await createAuditLog({
      userId: user.id,
      action: 'forgot_password',
      entity: 'User',
      entityId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // ── In production, send email with reset link ──
    // For MVP, the reset token is returned for testing purposes
    // In production: send email with link like: ${BASE_URL}/reset-password?token=${resetToken}
    console.log(`[AUTH] Password reset token for ${user.email}: ${resetToken}`);

    return apiSuccess({
      message: 'Si el email está registrado, recibirás instrucciones para restablecer tu contraseña',
      // Include token in development for testing
      ...(process.env.NODE_ENV !== 'production' && { resetToken }),
    });
  } catch (error) {
    console.error('[AUTH] Forgot password error:', error);
    // Still return success to prevent information leakage
    return apiSuccess({
      message: 'Si el email está registrado, recibirás instrucciones para restablecer tu contraseña',
    });
  }
}
