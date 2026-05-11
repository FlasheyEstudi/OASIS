import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiValidation } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog, generateInvoiceNumber } from '@/lib/oasis-utils';

// POST /api/clinical-check/interactions - Verificar interacciones medicamentosas y alergias
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const body = await request.json();
    const { patientId, medicationIds } = body;

    if (!patientId || !medicationIds || !Array.isArray(medicationIds) || medicationIds.length === 0) {
      return apiValidation('Se requiere patientId y medicationIds (array)');
    }

    const warnings: Array<{ type: string; severity: string; message: string; medicationId?: string }> = [];

    // Obtener datos del paciente
    const patient = await db.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) return apiNotFound('Paciente no encontrado');

    // Parsear alergias y condiciones crónicas
    const patientAllergies: string[] = patient.allergies
      ? JSON.parse(patient.allergies)
      : [];
    const chronicConditions: string[] = patient.chronicConditions
      ? JSON.parse(patient.chronicConditions)
      : [];

    // Obtener medicamentos solicitados
    const medications = await db.medication.findMany({
      where: { id: { in: medicationIds } },
    });

    // Verificar alergias
    for (const med of medications) {
      const medNames = [
        med.name.toLowerCase(),
        med.genericName?.toLowerCase(),
        med.brand?.toLowerCase(),
      ].filter(Boolean);

      for (const allergy of patientAllergies) {
        const allergyLower = allergy.toLowerCase();
        if (medNames.some(n => n?.includes(allergyLower) || allergyLower.includes(n || ''))) {
          warnings.push({
            type: 'allergy',
            severity: 'high',
            message: `ALERTA: El paciente es alérgico a "${allergy}" y el medicamento "${med.name}" puede contener este alérgeno.`,
            medicationId: med.id,
          });
        }
      }
    }

    // Verificar interacciones entre medicamentos
    const interactionGroups: Record<string, string[]> = {};
    for (const med of medications) {
      if (med.interactionGroups) {
        const groups: string[] = JSON.parse(med.interactionGroups);
        interactionGroups[med.id] = groups;
      }
    }

    // Buscar conflictos entre grupos de interacción
    const medIds = Object.keys(interactionGroups);
    for (let i = 0; i < medIds.length; i++) {
      for (let j = i + 1; j < medIds.length; j++) {
        const groupsA = interactionGroups[medIds[i]];
        const groupsB = interactionGroups[medIds[j]];
        const commonGroups = groupsA.filter(g => groupsB.includes(g));

        if (commonGroups.length > 0) {
          const medA = medications.find(m => m.id === medIds[i]);
          const medB = medications.find(m => m.id === medIds[j]);
          warnings.push({
            type: 'interaction',
            severity: 'high',
            message: `INTERACCIÓN: "${medA?.name}" y "${medB?.name}" comparten grupos de interacción: ${commonGroups.join(', ')}. Riesgo de interacción medicamentosa.`,
            medicationId: medIds[i],
          });
        }
      }
    }

    // Verificar medicamentos controlados
    for (const med of medications) {
      if (med.controlledSubstance) {
        warnings.push({
          type: 'controlled',
          severity: 'medium',
          message: `AVISO: "${med.name}" es un medicamento controlado (Nivel ${med.controlledLevel || 'no especificado'}). Requiere receta retenida y verificación de cédula.`,
          medicationId: med.id,
        });
      }
    }

    // Verificar contraindicaciones con condiciones crónicas
    for (const med of medications) {
      if (med.contraindications) {
        const contraindications: string[] = JSON.parse(med.contraindications);
        for (const condition of chronicConditions) {
          const conditionLower = condition.toLowerCase();
          if (contraindications.some(c => c.toLowerCase().includes(conditionLower) || conditionLower.includes(c.toLowerCase()))) {
            warnings.push({
              type: 'contraindication',
              severity: 'high',
              message: `CONTRAINDICACIÓN: "${med.name}" está contraindicado para pacientes con "${condition}".`,
              medicationId: med.id,
            });
          }
        }
      }
    }

    // Obtener recetas activas del paciente para verificar interacciones con medicamentos actuales
    const activePrescriptions = await db.prescription.findMany({
      where: { patientId, status: 'active' },
      include: { items: { include: { medication: true } } },
    });

    const currentMedications = activePrescriptions.flatMap(p => p.items);
    for (const newItem of medications) {
      for (const currentItem of currentMedications) {
        if (newItem.id === currentItem.medicationId) continue;
        if (newItem.interactionGroups && currentItem.medication.interactionGroups) {
          const newGroups: string[] = JSON.parse(newItem.interactionGroups);
          const currentGroups: string[] = JSON.parse(currentItem.medication.interactionGroups || '[]');
          const commonGroups = newGroups.filter(g => currentGroups.includes(g));
          if (commonGroups.length > 0) {
            warnings.push({
              type: 'interaction',
              severity: 'medium',
              message: `INTERACCIÓN CON MEDICAMENTO ACTUAL: "${newItem.name}" puede interactuar con "${currentItem.medication.name}" (medicamento en receta activa). Grupos compartidos: ${commonGroups.join(', ')}.`,
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
        lowSeverity: warnings.filter(w => w.severity === 'low').length,
      },
    });
  } catch (error) {
    console.error('Error en clinical-check:', error);
    return apiError('Error al verificar interacciones medicamentosas', 500);
  }
}
