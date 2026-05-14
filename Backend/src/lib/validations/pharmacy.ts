import { z } from 'zod';

export const inventoryBatchSchema = z.object({
  medicationId: z.string().min(1, 'ID de medicamento requerido'),
  batchNumber: z.string().trim().min(1, 'Número de lote requerido'),
  quantity: z.number().int().min(0, 'La cantidad no puede ser negativa'),
  expiryDate: z.string().datetime('Fecha de expiración inválida'),
  costPrice: z.number().min(0, 'El precio de costo no puede ser negativo'),
  sellingPrice: z.number().min(0, 'El precio de venta no puede ser negativo'),
  supplierId: z.string().optional(),
  minStockAlert: z.number().int().min(0).default(10),
  location: z.string().trim().optional(),
}).strict();

export const updatePharmacySchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  deliverySettings: z.string().optional(),
  isActive: z.boolean().optional(),
}).strict();
