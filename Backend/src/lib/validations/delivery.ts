import { z } from 'zod';

export const deliveryActionSchema = z.object({
  action: z.enum(['accept', 'pickup', 'deliver', 'fail']),
  reason: z.string().trim().optional(), // Solo para 'fail'
  proofPhotoUrl: z.string().url().optional(), // Solo para 'deliver'
}).strict();

export const locationUpdateSchema = z.object({
  orderId: z.string().min(1, 'ID de orden requerido'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
}).strict();

export const deliveryPersonUpdateSchema = z.object({
  vehicleType: z.string().trim().optional(),
  plateNumber: z.string().trim().optional(),
  isAvailable: z.boolean().optional(),
}).strict();
