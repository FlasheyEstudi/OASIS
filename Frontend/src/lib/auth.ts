// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Utilidades de Autenticación JWT
// ═══════════════════════════════════════════════════════════════

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'oasis-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'oasis-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Tipos de roles del sistema
export const ROLES = {
  SUPERADMIN: 'superadmin',
  CLINIC_ADMIN: 'clinic_admin',
  RECEPTIONIST: 'receptionist',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  PHARMACY_ADMIN: 'pharmacy_admin',
  PHARMACY_STAFF: 'pharmacy_staff',
  DELIVERY_PERSON: 'delivery_person',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Permisos por rol
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  superadmin: ['*'],
  clinic_admin: [
    'clinic:read', 'clinic:write', 'clinic:delete',
    'doctor:read', 'doctor:write',
    'receptionist:read', 'receptionist:write',
    'appointment:read', 'appointment:write',
    'service:read', 'service:write',
    'report:read', 'audit:read',
    'patient:read',
  ],
  receptionist: [
    'appointment:read', 'appointment:write',
    'patient:read',
    'payment:collect',
    'appointment:reassign',
  ],
  doctor: [
    'patient:read', 'patient:write',
    'prescription:read', 'prescription:write', 'prescription:sign',
    'appointment:read',
    'chat:read', 'chat:write',
    'clinical-check:read',
  ],
  patient: [
    'own:profile', 'own:orders', 'own:appointments',
    'own:prescriptions', 'own:family', 'own:insurance',
    'own:loyalty', 'own:emergency', 'own:chat',
    'medication:search', 'pharmacy:search',
    'review:write',
  ],
  pharmacy_admin: [
    'pharmacy:read', 'pharmacy:write', 'pharmacy:delete',
    'inventory:read', 'inventory:write',
    'supplier:read', 'supplier:write',
    'purchase-order:read', 'purchase-order:write',
    'order:read', 'order:write',
    'staff:read', 'staff:write',
    'report:read', 'promotion:read', 'promotion:write',
    'return:read', 'return:write',
  ],
  pharmacy_staff: [
    'inventory:read', 'inventory:write',
    'order:read', 'order:write',
    'return:read',
    'payment:collect',
  ],
  delivery_person: [
    'delivery:read', 'delivery:write',
    'own:availability', 'own:earnings',
    'own:proof', 'own:route',
  ],
};

export function hasPermission(role: string, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes('*') || permissions.includes(permission);
}

// Obtener usuario autenticado desde el header Authorization
export async function getAuthUser(): Promise<{
  user: JWTPayload & { id: string };
  dbUser: Awaited<ReturnType<typeof db.user.findUnique>>;
} | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) return null;

    const payload = verifyAccessToken(token);
    if (!payload) return null;

    const dbUser = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!dbUser || !dbUser.isActive) return null;

    return {
      user: { ...payload, id: payload.userId },
      dbUser,
    };
  } catch {
    return null;
  }
}

// Obtener usuario autenticado desde el header Authorization (para apps móviles)
export async function getAuthUserFromHeader(request: Request): Promise<{
  user: JWTPayload & { id: string };
  dbUser: Awaited<ReturnType<typeof db.user.findUnique>>;
} | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      // Fallback a cookies
      return getAuthUser();
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    if (!payload) return null;

    const dbUser = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!dbUser || !dbUser.isActive) return null;

    return {
      user: { ...payload, id: payload.userId },
      dbUser,
    };
  } catch {
    return null;
  }
}

// Verificar que el usuario tiene uno de los roles permitidos
export function requireRoles(auth: ReturnType<typeof getAuthUserFromHeader> extends Promise<infer T> ? T : never, roles: string[]): { authorized: boolean; error?: string } {
  // This is a sync helper, auth should be awaited first
  if (!auth) {
    return { authorized: false, error: 'No autenticado' };
  }
  if (!roles.includes(auth.user.role) && auth.user.role !== 'superadmin') {
    return { authorized: false, error: 'No autorizado para esta acción' };
  }
  return { authorized: true };
}
