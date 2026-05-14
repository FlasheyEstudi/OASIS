// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Utilidades Compartidas
// ═══════════════════════════════════════════════════════════════

export function safeJsonParse<T>(
  input: string | null | undefined,
  fallback: T
): T {
  if (!input) return fallback;
  try {
    const parsed = JSON.parse(input);
    return parsed as T;
  } catch (error) {
    console.warn(
      `[safeJsonParse] JSON corrupto detectado, ` +
      `usando fallback. Input: "${String(input).substring(0, 80)}..."`
    );
    return fallback;
  }
}

import { db } from '@/lib/db';

interface AuditLogParams {
  userId?: string;
  clinicId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

export async function createAuditLog(params: AuditLogParams) {
  return db.auditLog.create({
    data: {
      userId: params.userId,
      clinicId: params.clinicId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
      newValues: params.newValues ? JSON.stringify(params.newValues) : (params.details ? JSON.stringify(params.details) : null),
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}

import crypto from 'node:crypto';

// Utilidad para hash de firma digital (Criptográfica real)
export function generateSignatureHash(data: string): string {
  // En producción, esto usaría la llave privada del doctor/clínica
  // Para este nivel de auditoría, implementamos un HMAC robusto que garantiza integridad
  const secret = process.env.SIGNATURE_SECRET || 'oasis-health-mision-critica-2026';
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  const hash = hmac.digest('hex').toUpperCase();
  
  return `SIG-${hash.substring(0, 12)}-${Date.now()}`;
}

// Calcular distancia entre dos coordenadas (Haversine)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Generar código de verificación único para recetas
export function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generar número de factura
export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `FAC-${year}${month}-${random}`;
}

// Calcular puntos de lealtad (1 punto = 1 córdoba)
export function calculateLoyaltyPoints(amount: number, level: string): number {
  const multipliers: Record<string, number> = {
    bronce: 1,
    plata: 1.5,
    oro: 2,
    diamante: 3,
  };
  const multiplier = multipliers[level] || 1;
  return Math.floor(amount * multiplier);
}

// Determinar nivel de lealtad según puntos
export function getLoyaltyLevel(points: number): string {
  if (points >= 10000) return 'diamante';
  if (points >= 5000) return 'oro';
  if (points >= 2000) return 'plata';
  return 'bronce';
}
