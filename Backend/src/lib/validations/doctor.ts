import { z } from 'zod';

export const updateDoctorProfileSchema = z.object({
  specialty: z.string().trim().min(2).max(100).optional(),
  licenseNumber: z.string().trim().min(5).max(50).optional(),
  biography: z.string().trim().max(1000).optional(),
  consultationFee: z.number().min(0).optional(),
  schedule: z.string().optional(),
}).strict();

export const createPrescriptionSchema = z.object({
  patientId: z.string().min(1, 'ID de paciente requerido'),
  familyMemberId: z.string().optional(),
  diagnosis: z.string().trim().min(1, 'Diagnóstico requerido'),
  notes: z.string().trim().max(1000).optional(),
  items: z.array(z.object({
    medicationId: z.string().min(1, 'ID de medicamento requerido'),
    dosage: z.string().trim().min(1, 'Dosis requerida'),
    duration: z.string().trim().min(1, 'Duración requerida'),
    quantity: z.number().int().positive('La cantidad debe ser positiva'),
    instructions: z.string().trim().optional(),
  })).min(1, 'Debe incluir al menos un medicamento'),
  validUntil: z.string().datetime().optional(),
}).strict();
