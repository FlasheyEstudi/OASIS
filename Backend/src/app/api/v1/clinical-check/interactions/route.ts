import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiValidation } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { safeJsonParse } from '@/lib/oasis-utils';
import { AppError } from '@/lib/errors';
import { handleError } from '@/lib/handle-error';

// POST /api/clinical-check/interactions - Verificar interacciones medicamentosas y alergias
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) throw AppError.unauthorized();

    const body = await request.json();
    const { patientId, medicationIds } = body;

    if (!patientId || !medicationIds || !Array.isArray(medicationIds) || medicationIds.length === 0) {
      throw AppError.badRequest('Se requiere patientId y medicationIds (array)');
    }

    const warnings: Array<{ type: string; severity: string; message: string; medicationId?: string }> = [];

    // ── Get Patient Data ──
    const patient = await db.patient.findUnique({
      where: { id: patientId },
      include: {
        allergies: true,
        chronicConditions: true,
      },
    });

    if (!patient) throw AppError.notFound('Paciente no encontrado');

    const patientAllergyNames = patient.allergies.map(a => a.name.toLowerCase());
    const patientConditionNames = patient.chronicConditions.map(c => c.name.toLowerCase());

    // ── Get Requested Medications ──
    const medications = await db.medication.findMany({
      where: { id: { in: medicationIds } },
    });

    // ── Check Drug-Allergy and Contraindications ──
    for (const med of medications) {
      // Name Matching for Allergies
      const medNames = [
        med.name.toLowerCase(),
        med.genericName?.toLowerCase(),
        med.brand?.toLowerCase(),
      ].filter(Boolean);

      for (const allergy of patientAllergyNames) {
        if (medNames.some(n => n?.includes(allergy) || allergy.includes(n || ''))) {
          warnings.push({
            type: 'allergy',
            severity: 'high',
            message: `ALERTA: El paciente es alérgico a "${allergy}" y el medicamento "${med.name}" puede contener este alérgeno.`,
            medicationId: med.id,
          });
        }
      }

      // Contraindications
      if (med.contraindications) {
        const contraindications = safeJsonParse<string[]>(med.contraindications, []);
        if (!Array.isArray(contraindications)) {
          throw AppError.internal(`Error en contraindicaciones para ${med.name}`);
        }

        const matches = contraindications.filter(c => 
          patientConditionNames.some(pc => pc.includes(c.toLowerCase()) || c.toLowerCase().includes(pc))
        );
        
        if (matches.length > 0) {
          warnings.push({
            type: 'contraindication',
            severity: 'high',
            message: `Contraindicado para las condiciones del paciente: ${matches.join(', ')}`,
            medicationId: med.id,
          });
        }
      }

      // Controlled Substance Warning
      if (med.controlledSubstance) {
        warnings.push({
          type: 'controlled',
          severity: 'medium',
          message: `AVISO: "${med.name}" es un medicamento controlado. Requiere receta retenida.`,
          medicationId: med.id,
        });
      }
    }

    // ── Check Drug-Drug Interactions (Current vs New) ──
    const activePrescriptions = await db.prescription.findMany({
      where: { patientId, status: 'active' },
      include: { items: { include: { medication: true } } },
    });

    const activeItems = activePrescriptions.flatMap(p => p.items);

    for (const newItem of medications) {
      for (const currentItem of activeItems) {
        if (newItem.interactionGroups && currentItem.medication.interactionGroups) {
          const newGroups = safeJsonParse<string[]>(newItem.interactionGroups, []);
          const currentGroups = safeJsonParse<string[]>(currentItem.medication.interactionGroups, []);

          if (!Array.isArray(newGroups) || !Array.isArray(currentGroups)) {
            throw AppError.internal('Error en formato de grupos de interacción');
          }
          
          const commonGroups = newGroups.filter(g => currentGroups.includes(g));
          if (commonGroups.length > 0) {
            warnings.push({
              type: 'interaction',
              severity: 'medium',
              message: `INTERACCIÓN CON MEDICAMENTO ACTUAL: "${newItem.name}" puede interactuar con "${currentItem.medication.name}". Grupos: ${commonGroups.join(', ')}.`,
              medicationId: newItem.id,
            });
          }
        }
      }
    }

    return apiSuccess({
      safe: warnings.filter(w => w.severity === 'high').length === 0,
      warnings,
      summary: {
        totalWarnings: warnings.length,
        highSeverity: warnings.filter(w => w.severity === 'high').length,
        mediumSeverity: warnings.filter(w => w.severity === 'medium').length,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
