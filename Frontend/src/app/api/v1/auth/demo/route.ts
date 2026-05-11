// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - POST /api/v1/auth/demo
// Quick demo access without password
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, demoUserId } = body;

    if (!role && !demoUserId) {
      return apiError('Se requiere role o demoUserId', 400);
    }

    let user;

    if (demoUserId) {
      user = await db.user.findFirst({
        where: { id: demoUserId, isDemoUser: true }
      });
    } else {
      user = await db.user.findFirst({
        where: { role, isDemoUser: true }
      });
    }

    if (!user) {
      return apiError(`No se encontró un usuario demo para el rol: ${role}`, 404);
    }

    // Generar tokens reales
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Guardar refresh token en DB
    await db.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    // Quitar password de la respuesta
    const { password, refreshToken: _, ...userWithoutPassword } = user;

    return apiSuccess({
      accessToken,
      refreshToken,
      user: userWithoutPassword
    }, { message: 'Acceso demo concedido exitosamente' });

  } catch (error) {
    console.error('Demo auth error:', error);
    return apiError('Error interno en acceso demo', 500);
  }
}
