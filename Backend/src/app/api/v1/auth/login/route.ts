// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - POST /api/auth/login
// User login with JWT token generation
// ═══════════════════════════════════════════════════════════════

import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { apiSuccess } from '@/lib/api-response';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations/auth';
import { createAuditLog } from '@/lib/oasis-utils';
import { AppError } from '@/lib/errors';
import { handleError } from '@/lib/handle-error';
import { getClientIp, loginLimiter, getRateLimitHeaders } from '@/lib/rate-limit';
import logger from '@/lib/logger';

export async function POST(request: Request) {
  const requestId = request.headers.get('X-Request-Id') || 'unknown';
  
  try {
    logger.info({ requestId, method: 'POST', endpoint: '/api/v1/auth/login' }, 'Request received');

    // ── Rate Limiting ──
    const ip = getClientIp(request);
    const { success, remaining, reset } = await loginLimiter.limit(ip);

    if (!success) {
      logger.warn({ requestId, ip }, 'Rate limit exceeded for login');
      throw AppError.tooManyRequests('Demasiados intentos. Intenta de nuevo más tarde.');
    }

    const body = await request.json();
    
    // ── Validate with Zod ──
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn({ requestId, errors: parsed.error.flatten().fieldErrors }, 'Invalid login payload');
      throw AppError.badRequest('Datos de login inválidos', parsed.error.flatten().fieldErrors as any);
    }

    const { email, password } = parsed.data;

    // ── Find user by email ──
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        doctor: true,
        patient: true,
        clinicAdmin: true,
        receptionist: true,
        pharmacyAdmin: true,
        pharmacyStaff: true,
        deliveryPerson: true,
      },
    });

    if (!user) {
      logger.warn({ requestId, email }, 'Login failed: User not found');
      throw AppError.unauthorized('Credenciales inválidas');
    }

    // ── Check if user is active ──
    if (!user.isActive) {
      logger.warn({ requestId, userId: user.id }, 'Login failed: Account inactive');
      throw AppError.forbidden('Tu cuenta ha sido desactivada. Contacta al administrador.');
    }

    // ── Verify password ──
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn({ requestId, userId: user.id, email }, 'Login failed: Invalid password');
      // Audit failed login attempt
      const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      await createAuditLog({
        userId: user.id,
        action: 'login_failed',
        entity: 'User',
        entityId: user.id,
        newValues: { reason: 'invalid_password' },
        ipAddress: clientIp,
        userAgent,
      });

      throw AppError.unauthorized('Credenciales inválidas');
    }

    // ── Generate tokens ──
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // ── Update refresh token in DB (hashed) ──
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await db.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    // ── Build role-specific profile ──
    const roleProfile = getRoleProfile(user);

    // ── Audit log ──
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    await createAuditLog({
      userId: user.id,
      clinicId: roleProfile?.clinicId || undefined,
      action: 'login',
      entity: 'User',
      entityId: user.id,
      ipAddress: clientIp,
      userAgent,
    });

    logger.info({ requestId, userId: user.id, role: user.role }, 'User logged in successfully');

    // ── Return response ──
    const response = apiSuccess({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt,
      },
      roleProfile,
      accessToken,
      // refreshToken, // Still returning in body for mobile apps, but setting cookie for web
    });

    // ── Set Refresh Token Cookie ──
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Añadir headers de rate limit
    const headers = getRateLimitHeaders(remaining, reset);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    logger.error({ requestId, error, endpoint: '/api/v1/auth/login' }, 'Request failed');
    return handleError(error);
  }
}

function getRoleProfile(user: { 
  id: string; 
  role: string; 
  doctor?: { id: string; clinicId: string; specialty: string; licenseNumber: string; consultationFee: number; rating: number } | null; 
  patient?: { id: string; loyaltyPoints: number; loyaltyLevel: string; bloodType: string | null } | null; 
  clinicAdmin?: { id: string; clinicId: string } | null; 
  receptionist?: { id: string; clinicId: string } | null; 
  pharmacyAdmin?: { id: string; pharmacyId: string } | null; 
  pharmacyStaff?: { id: string; pharmacyId: string; role: string } | null; 
  deliveryPerson?: { id: string; vehicleType: string | null; isVerified: boolean; isAvailable: boolean; rating: number } | null 
}) {
  switch (user.role) {
    case 'doctor':
      return user.doctor
        ? {
            id: user.doctor.id,
            clinicId: user.doctor.clinicId,
            specialty: user.doctor.specialty,
            licenseNumber: user.doctor.licenseNumber,
            consultationFee: user.doctor.consultationFee,
            rating: user.doctor.rating,
          }
        : null;
    case 'patient':
      return user.patient
        ? {
            id: user.patient.id,
            loyaltyPoints: user.patient.loyaltyPoints,
            loyaltyLevel: user.patient.loyaltyLevel,
            bloodType: user.patient.bloodType,
          }
        : null;
    case 'clinic_admin':
      return user.clinicAdmin
        ? { id: user.clinicAdmin.id, clinicId: user.clinicAdmin.clinicId }
        : null;
    case 'receptionist':
      return user.receptionist
        ? { id: user.receptionist.id, clinicId: user.receptionist.clinicId }
        : null;
    case 'pharmacy_admin':
      return user.pharmacyAdmin
        ? { id: user.pharmacyAdmin.id, pharmacyId: user.pharmacyAdmin.pharmacyId }
        : null;
    case 'pharmacy_staff':
      return user.pharmacyStaff
        ? { id: user.pharmacyStaff.id, pharmacyId: user.pharmacyStaff.pharmacyId, staffRole: user.pharmacyStaff.role }
        : null;
    case 'delivery_person':
      return user.deliveryPerson
        ? {
            id: user.deliveryPerson.id,
            vehicleType: user.deliveryPerson.vehicleType,
            isVerified: user.deliveryPerson.isVerified,
            isAvailable: user.deliveryPerson.isAvailable,
            rating: user.deliveryPerson.rating,
          }
        : null;
    case 'superadmin':
      return { id: user.id, access: 'full' };
    default:
      return null;
  }
}
