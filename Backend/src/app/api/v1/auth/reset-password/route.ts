// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - POST /api/auth/reset-password
// Reset password using a valid reset token
// ═══════════════════════════════════════════════════════════════

import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiValidation } from '@/lib/api-response';
import { createAuditLog } from '@/lib/oasis-utils';

const PASSWORD_MIN_LENGTH = 6;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    // ── Validate required fields ──
    const errors: Record<string, string> = {};
    if (!token) errors.token = 'Token de restablecimiento es requerido';
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < PASSWORD_MIN_LENGTH) {
      errors.newPassword = `La nueva contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;
    }

    if (Object.keys(errors).length > 0) {
      return apiValidation('Error de validación', errors);
    }

    // ── Find user by reset token ──
    const user = await db.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return apiError('Token de restablecimiento inválido o expirado', 400);
    }

    // ── Hash new password ──
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // ── Update password and clear reset token ──
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        refreshToken: null, // Invalidate all existing sessions
      },
    });

    // ── Audit log ──
    await createAuditLog({
      userId: user.id,
      action: 'reset_password',
      entity: 'User',
      entityId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return apiSuccess({
      message: 'Contraseña restablecida exitosamente',
    });
  } catch (error) {
    console.error('[AUTH] Reset password error:', error);
    return apiError('Error interno del servidor', 500);
  }
}
