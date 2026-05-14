import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiForbidden } from '@/lib/api-response';
import { handleError } from '@/lib/handle-error';
import { AppError } from '@/lib/errors';
import logger from '@/lib/logger';
import { safeJsonParse } from '@/lib/oasis-utils';

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('X-Request-Id') || 'unknown';
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) throw AppError.unauthorized();
    if (auth.user.role !== ROLES.SUPERADMIN) throw AppError.forbidden();

    const patients = await db.patient.findMany({
      where: {
        OR: [
          { allergies_legacy: { not: null } },
          { chronicConditions_legacy: { not: null } },
        ],
      },
    });

    let migratedPatients = 0;
    let totalAllergies = 0;
    let totalConditions = 0;

    for (const patient of patients) {
      const legacyAllergies = safeJsonParse<string[]>(patient.allergies_legacy, []);
      const legacyConditions = safeJsonParse<string[]>(patient.chronicConditions_legacy, []);

      // Migrate Allergies
      if (legacyAllergies.length > 0) {
        await db.allergy.createMany({
          data: legacyAllergies.map(name => ({
            patientId: patient.id,
            name: name,
            severity: 'moderate',
          })),
        });
        totalAllergies += legacyAllergies.length;
      }

      // Migrate Chronic Conditions
      if (legacyConditions.length > 0) {
        await db.chronicCondition.createMany({
          data: legacyConditions.map(name => ({
            patientId: patient.id,
            name: name,
          })),
        });
        totalConditions += legacyConditions.length;
      }

      // Clear legacy fields
      await db.patient.update({
        where: { id: patient.id },
        data: {
          allergies_legacy: null,
          chronicConditions_legacy: null,
        },
      });

      migratedPatients++;
    }

    logger.info({ requestId, migratedPatients, totalAllergies, totalConditions }, 'Clinical data migration completed');

    return apiSuccess({
      success: true,
      migratedPatients,
      totalAllergies,
      totalConditions,
    });
  } catch (error) {
    logger.error({ requestId, error }, 'Error migrating clinical data');
    return handleError(error);
  }
}
