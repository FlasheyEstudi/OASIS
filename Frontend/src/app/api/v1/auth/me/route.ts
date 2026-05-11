// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/v1/auth/me
// Get current authenticated user
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { getAuthUserFromHeader } from '@/lib/auth';
import { apiSuccess, apiUnauthorized } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { password: _, refreshToken: __, ...userWithoutSecrets } = auth.dbUser;

  return apiSuccess(userWithoutSecrets, { message: 'Perfil recuperado correctamente' });
}
