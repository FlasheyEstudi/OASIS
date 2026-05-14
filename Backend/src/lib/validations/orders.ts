import { z } from 'zod';

export const createOrderSchema = z.object({
  patientId: z.string().optional(),
  pharmacyId: z.string().min(1, 'ID de farmacia requerido'),
  prescriptionId: z.string().optional(),
  items: z.array(z.object({
    medicationId: z.string().min(1, 'ID de medicamento requerido'),
    quantity: z.number().int().positive('La cantidad debe ser positiva'),
  })).min(1, 'La orden debe tener al menos un item'),
  paymentMethod: z.enum(['cash', 'card', 'transfer']).default('cash'),
  deliveryType: z.enum(['delivery', 'pickup']).default('delivery'),
  deliveryAddress: z.string().trim().max(255).optional(),
  deliveryLatitude: z.number().optional(),
  deliveryLongitude: z.number().optional(),
  deliveryNotes: z.string().trim().max(200).optional(),
}).strict();

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'preparing', 'out_for_delivery', 'delivered', 'cancelled', 'failed']),
  notes: z.string().trim().max(200).optional(),
}).strict();
