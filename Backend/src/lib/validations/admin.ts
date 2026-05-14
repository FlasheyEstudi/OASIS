import { z } from 'zod';

export const updateUserAdminSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
}).strict();

export const configUpdateSchema = z.record(z.string(), z.any());
