import { z } from 'zod';

export const createAppointmentSchema = z.object({
  clinicId: z.string().min(1, 'ID de clínica requerido'),
  doctorId: z.string().min(1, 'ID de doctor requerido'),
  patientId: z.string().min(1, 'ID de paciente requerido'),
  familyMemberId: z.string().optional(),
  serviceId: z.string().optional(),
  date: z.string().datetime('Fecha inválida'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato HH:mm requerido'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato HH:mm requerido'),
  notes: z.string().trim().max(500).optional(),
  type: z.enum(['presencial', 'telemedicina']).default('presencial'),
}).strict();

export const updateAppointmentSchema = createAppointmentSchema.partial().strict();

export const cancelAppointmentSchema = z.object({
  reason: z.string().trim().min(1, 'La razón de cancelación es requerida').max(200),
}).strict();
