import { z } from 'zod';

export const updatePatientProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  dateOfBirth: z.string().datetime().optional().or(z.date().optional()),
  gender: z.enum(['masculino', 'femenino', 'otro']).optional(),
  bloodType: z.string().trim().max(5).optional(),
  emergencyContact: z.string().trim().max(100).optional(),
  address: z.string().trim().max(255).optional(),
  city: z.string().trim().max(100).optional(),
  department: z.string().trim().max(100).optional(),
}).strict();

export const addAllergySchema = z.object({
  allergy: z.string().trim().min(1, 'El nombre de la alergia es requerido').max(100),
}).strict();

export const familyMemberSchema = z.object({
  name: z.string().trim().min(2, 'Nombre requerido').max(100),
  relationship: z.string().trim().min(1, 'Parentesco requerido').max(50),
  dateOfBirth: z.string().datetime().optional().or(z.date().optional()),
  gender: z.enum(['masculino', 'femenino', 'otro']).optional(),
  bloodType: z.string().trim().max(5).optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
}).strict();
