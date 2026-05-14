import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .trim()
    .toLowerCase()
    .email('Email inválido')
    .max(255, 'Email muy largo'),
  password: z.string()
    .min(1, 'Contraseña requerida')
    .max(128, 'Contraseña muy larga'),
}).strict();

export const registerSchema = z.object({
  email: z.string()
    .trim()
    .toLowerCase()
    .email('Email inválido')
    .max(255, 'Email muy largo'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'Contraseña muy larga'),
  name: z.string()
    .trim()
    .min(2, 'Nombre muy corto')
    .max(100, 'Nombre muy largo'),
  phone: z.string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de teléfono inválido')
    .optional(),
  role: z.enum(['patient', 'doctor', 'clinic_admin', 'receptionist', 'pharmacy_admin', 'pharmacy_staff', 'delivery_person'])
    .default('patient'),
}).strict();

export const forgotPasswordSchema = z.object({
  email: z.string()
    .trim()
    .toLowerCase()
    .email('Email inválido'),
}).strict();

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  newPassword: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'Contraseña muy larga'),
}).strict();
