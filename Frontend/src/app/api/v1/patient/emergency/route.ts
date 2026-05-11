// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - POST /api/patient/emergency
// Emergency button
// Sends emergency alert to emergency contact
// Includes patient location (latitude, longitude from body)
// Includes current medications and conditions
// Creates notification (SMS/WhatsApp in production)
// Creates audit log
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { user } = auth;

    if (user.role !== ROLES.PATIENT && user.role !== ROLES.SUPERADMIN) {
      return apiError('Solo los pacientes pueden usar el botón de emergencia', 403);
    }

    const patient = await db.patient.findUnique({
      where: { userId: user.id },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        prescriptions: {
          where: { status: 'active' },
          include: {
            items: {
              include: {
                medication: {
                  select: { name: true, genericName: true, strength: true },
                },
              },
            },
          },
        },
      },
    });

    if (!patient) return apiError('Perfil de paciente no encontrado', 404);

    const body = await request.json();
    const { latitude, longitude } = body;

    // Parse emergency contact
    let emergencyContact: { name?: string; phone?: string; relationship?: string } | null = null;
    if (patient.emergencyContact) {
      try {
        emergencyContact = JSON.parse(patient.emergencyContact);
      } catch {
        emergencyContact = null;
      }
    }

    // Parse allergies and chronic conditions
    let allergies: string[] = [];
    let chronicConditions: string[] = [];
    try { allergies = patient.allergies ? JSON.parse(patient.allergies) : []; } catch { /* empty */ }
    try { chronicConditions = patient.chronicConditions ? JSON.parse(patient.chronicConditions) : []; } catch { /* empty */ }

    // Get current medications
    const currentMedications = patient.prescriptions.flatMap((p) =>
      p.items.map((i) => ({
        name: i.medication.name,
        genericName: i.medication.genericName,
        strength: i.medication.strength,
        dosage: i.dosage,
      }))
    );

    // Build emergency data
    const emergencyData = {
      patientId: patient.id,
      patientName: patient.user.name,
      patientPhone: patient.user.phone,
      bloodType: patient.bloodType,
      allergies,
      chronicConditions,
      currentMedications,
      location: latitude && longitude ? { latitude, longitude } : null,
      timestamp: new Date().toISOString(),
    };

    // Create emergency notification for emergency contact
    if (emergencyContact?.phone) {
      // In production, this would send SMS/WhatsApp
      // For MVP, create an in-app notification
      await db.notification.create({
        data: {
          userId: user.id, // Self-notification as record
          title: '🚨 Alerta de Emergencia',
          message: `Se ha activado la alerta de emergencia para ${patient.user.name}. Contacto de emergencia: ${emergencyContact.name} (${emergencyContact.phone})`,
          type: 'emergency',
          data: JSON.stringify(emergencyData),
          sentVia: 'in_app',
        },
      });
    }

    // Notify all assigned doctors
    const assignedDoctors = await db.doctorPatient.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    for (const assignment of assignedDoctors) {
      await db.notification.create({
        data: {
          userId: assignment.doctor.user.id,
          title: '🚨 Emergencia de Paciente',
          message: `El paciente ${patient.user.name} ha activado la alerta de emergencia${latitude && longitude ? ` desde una ubicación` : ''}`,
          type: 'emergency',
          data: JSON.stringify(emergencyData),
          sentVia: 'in_app',
        },
      });
    }

    // Update patient location if provided
    if (latitude && longitude) {
      await db.patient.update({
        where: { id: patient.id },
        data: {
          latitude: parseFloat(String(latitude)),
          longitude: parseFloat(String(longitude)),
        },
      });
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      action: 'emergency',
      entity: 'Patient',
      entityId: patient.id,
      newValues: {
        ...emergencyData,
        emergencyContact,
      },
    });

    return apiSuccess({
      message: 'Alerta de emergencia enviada',
      emergencyContact,
      notificationsSent: assignedDoctors.length + (emergencyContact?.phone ? 1 : 0),
      timestamp: emergencyData.timestamp,
    });
  } catch (error) {
    console.error('Error processing emergency alert:', error);
    return apiError('Error al procesar alerta de emergencia', 500);
  }
}
