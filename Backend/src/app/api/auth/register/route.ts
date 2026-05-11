// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - POST /api/auth/register
// User registration with role-specific record creation
// ═══════════════════════════════════════════════════════════════

import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiValidation } from '@/lib/api-response';
import { generateAccessToken, generateRefreshToken, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

const VALID_ROLES = Object.values(ROLES);
const PASSWORD_MIN_LENGTH = 6;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone, role, clinicId, specialty, licenseNumber, pharmacyId } = body;

    // ── Validate required fields ──
    const errors: Record<string, string> = {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      errors.email = 'Email válido es requerido';
    }
    if (!password || typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
      errors.password = `Contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.name = 'Nombre es requerido';
    }
    if (!role || !VALID_ROLES.includes(role)) {
      errors.role = `Rol inválido. Roles válidos: ${VALID_ROLES.join(', ')}`;
    }

    // ── Validate role-specific fields ──
    if (role === ROLES.DOCTOR) {
      if (!clinicId) errors.clinicId = 'clinicId es requerido para doctores';
      if (!specialty) errors.specialty = 'Especialidad es requerida para doctores';
      if (!licenseNumber) errors.licenseNumber = 'Número de licencia es requerido para doctores';
    }
    if (role === ROLES.CLINIC_ADMIN) {
      if (!clinicId) errors.clinicId = 'clinicId es requerido para administradores de clínica';
    }
    if (role === ROLES.RECEPTIONIST) {
      if (!clinicId) errors.clinicId = 'clinicId es requerido para recepcionistas';
    }
    if (role === ROLES.PHARMACY_ADMIN) {
      if (!pharmacyId) errors.pharmacyId = 'pharmacyId es requerido para administradores de farmacia';
    }
    if (role === ROLES.PHARMACY_STAFF) {
      if (!pharmacyId) errors.pharmacyId = 'pharmacyId es requerido para personal de farmacia';
    }

    if (Object.keys(errors).length > 0) {
      return apiValidation('Error de validación', errors);
    }

    // ── Check email uniqueness ──
    const existingUser = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return apiError('Este email ya está registrado', 409);
    }

    // ── Validate referenced entities exist ──
    if (clinicId) {
      const clinic = await db.clinic.findUnique({ where: { id: clinicId } });
      if (!clinic) {
        return apiError('Clínica no encontrada', 404);
      }
    }
    if (pharmacyId) {
      const pharmacy = await db.pharmacy.findUnique({ where: { id: pharmacyId } });
      if (!pharmacy) {
        return apiError('Farmacia no encontrada', 404);
      }
    }
    if (role === ROLES.DOCTOR && licenseNumber) {
      const existingDoctor = await db.doctor.findUnique({ where: { licenseNumber } });
      if (existingDoctor) {
        return apiError('Este número de licencia ya está registrado', 409);
      }
    }

    // ── Hash password ──
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ── Create user and role-specific record in a transaction ──
    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          name: name.trim(),
          phone: phone?.trim() || null,
          role,
        },
      });

      // Create role-specific record
      switch (role) {
        case ROLES.PATIENT:
          await tx.patient.create({
            data: { userId: newUser.id },
          });
          break;
        case ROLES.DOCTOR:
          await tx.doctor.create({
            data: {
              userId: newUser.id,
              clinicId,
              specialty,
              licenseNumber,
            },
          });
          break;
        case ROLES.CLINIC_ADMIN:
          await tx.clinicAdmin.create({
            data: {
              userId: newUser.id,
              clinicId,
            },
          });
          break;
        case ROLES.RECEPTIONIST:
          await tx.receptionist.create({
            data: {
              userId: newUser.id,
              clinicId,
            },
          });
          break;
        case ROLES.PHARMACY_ADMIN:
          await tx.pharmacyAdmin.create({
            data: {
              userId: newUser.id,
              pharmacyId,
            },
          });
          break;
        case ROLES.PHARMACY_STAFF:
          await tx.pharmacyStaff.create({
            data: {
              userId: newUser.id,
              pharmacyId,
              role: 'vendedor',
            },
          });
          break;
        case ROLES.DELIVERY_PERSON:
          await tx.deliveryPerson.create({
            data: { userId: newUser.id },
          });
          break;
        // superadmin doesn't need a separate record
      }

      return newUser;
    });

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

    // ── Store refresh token ──
    await db.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // ── Audit log ──
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    await createAuditLog({
      userId: user.id,
      clinicId: clinicId || undefined,
      action: 'register',
      entity: 'User',
      entityId: user.id,
      newValues: { email: user.email, name: user.name, role: user.role },
      ipAddress: clientIp,
      userAgent,
    });

    // ── Return response (without password) ──
    return apiSuccess(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[AUTH] Register error:', error);
    return apiError('Error interno del servidor', 500);
  }
}
