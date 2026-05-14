import { z } from 'zod';

export const sendMessageSchema = z.object({
  chatId: z.string().min(1, 'ID de chat requerido'),
  message: z.string().trim().min(1, 'El mensaje no puede estar vacío').max(2000),
  attachment: z.string().url().optional(),
}).strict();

export const createChatSchema = z.object({
  targetId: z.string().min(1, 'ID de destino requerido'),
  type: z.enum(['patient_doctor', 'patient_pharmacy', 'patient_clinic']),
}).strict();
