import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'La página debe ser mayor a 0').default(1),
  limit: z.coerce.number().int().min(1, 'El límite debe ser mayor a 0').max(100, 'El límite máximo es 100').default(20),
  search: z.string().trim().max(200, 'Búsqueda demasiado larga').optional(),
  sortBy: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
}).strict();
