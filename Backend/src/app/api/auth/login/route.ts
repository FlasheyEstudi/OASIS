// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - POST /api/auth/login
// User login with JWT token generation
// ═══════════════════════════════════════════════════════════════

import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiValidation } from '@/lib/api-response';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // ── Validate required fields ──
    if (!email || !password) {
      return apiValidation('Email y contraseña son requeridos', {
        ...( !email && { email: 'Email es requerido' }),
        ...( !password && { password: 'Contraseña es requerida' }),
      });
    }

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
      return apiError('Credenciales inválidas', 401);
    }

    // ── Check if user is active ──
    if (!user.isActive) {
      return apiError('Tu cuenta ha sido desactivada. Contacta al administrador.', 403);
    }

    // ── Verify password ──
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
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

      return apiError('Credenciales inválidas', 401);
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

    // ── Update refresh token in DB ──
    await db.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // ── Build role-specific profile ──
    const roleProfile = getRoleProfile(user);

    // ── Audit log ──
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    await createAuditLog({
      userId: user.id,
      clinicId: roleProfile.clinicId || undefined,
      action: 'login',
      entity: 'User',
      entityId: user.id,
      ipAddress: clientIp,
      userAgent,
    });

    // ── Return response ──
    return apiSuccess({
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
      refreshToken,
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    return apiError('Error interno del servidor', 500);
  }
}

function getRoleProfile(user: { role: string; doctor?: { clinicId: string; specialty: string; licenseNumber: string; consultationFee: number; rating: number } | null; patient?: { loyaltyPoints: number; loyaltyLevel: string; bloodType: string | null } | null; clinicAdmin?: { clinicId: string } | null; receptionist?: { clinicId: string } | null; pharmacyAdmin?: { pharmacyId: string } | null; pharmacyStaff?: { pharmacyId: string; role: string } | null; deliveryPerson?: { vehicleType: string | null; isVerified: boolean; isAvailable: boolean; rating: number } | null }) {
  switch (user.role) {
    case 'doctor':
      return user.doctor
        ? {
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
            loyaltyPoints: user.patient.loyaltyPoints,
            loyaltyLevel: user.patient.loyaltyLevel,
            bloodType: user.patient.bloodType,
          }
        : null;
    case 'clinic_admin':
      return user.clinicAdmin
        ? { clinicId: user.clinicAdmin.clinicId }
        : null;
    case 'receptionist':
      return user.receptionist
        ? { clinicId: user.receptionist.clinicId }
        : null;
    case 'pharmacy_admin':
      return user.pharmacyAdmin
        ? { pharmacyId: user.pharmacyAdmin.pharmacyId }
        : null;
    case 'pharmacy_staff':
      return user.pharmacyStaff
        ? { pharmacyId: user.pharmacyStaff.pharmacyId, staffRole: user.pharmacyStaff.role }
        : null;
    case 'delivery_person':
      return user.deliveryPerson
        ? {
            vehicleType: user.deliveryPerson.vehicleType,
            isVerified: user.deliveryPerson.isVerified,
            isAvailable: user.deliveryPerson.isAvailable,
            rating: user.deliveryPerson.rating,
          }
        : null;
    case 'superadmin':
      return { access: 'full' };
    default:
      return null;
  }
}
