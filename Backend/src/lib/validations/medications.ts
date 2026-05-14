import { z } from 'zod';

export const medicationFilterSchema = z.object({
  category: z.string().trim().optional(),
  requiresPrescription: z.coerce.boolean().optional(),
  controlledSubstance: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  pharmacyId: z.string().optional(),
}).strict();
