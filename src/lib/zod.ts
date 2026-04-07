import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// Regex para permitir solo letras (incluyendo acentos y ñ) y espacios
const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

export const registerSchema = loginSchema.extend({
  name: z.string()
    .min(2, "Nombre requerido")
    .regex(nameRegex, "El nombre solo debe contener letras y espacios"),
  telefono: z.string().optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().optional(),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas nuevas no coinciden",
  path: ["confirmPassword"],
});


export const updateProfileSchema = z.object({
  name: z.string().min(2).regex(nameRegex, "El nombre solo debe contener letras"),
  telefono: z.string().optional(),
});


// ==========================================
// CATEGORÍAS
// ==========================================
export const categorySchema = z.object({
  name: z.string().min(2, "El nombre de la categoría es requerido"),
  description: z.string().optional(),
});

// ==========================================
// PRENDAS (GARMENTS)
// ==========================================
export const garmentSchema = z.object({
  sku: z.string().min(3, "SKU requerido").optional().or(z.literal("")),
  name: z.string().min(2, "Nombre requerido"),
  categoryId: z.string().min(1, "Debes seleccionar una categoría"), // Relación con Category
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  stock: z.coerce.number().int().nonnegative("El stock no puede ser negativo"),
  description: z.string().optional(),
});

// ==========================================
// MOVIMIENTOS DE STOCK
// ==========================================
const MOVEMENT_TYPES = ["IN", "OUT"] as const;

export const movementSchema = z.object({
  garmentId: z.string().min(1, "Debes seleccionar una prenda"),
  type: z.enum(MOVEMENT_TYPES),
  quantity: z.coerce
    .number()
    .int("Debe ser un número entero")
    .positive("La cantidad debe ser mayor a 0"),
  note: z.string().optional(),
});

// Tipos para TypeScript
export type MovementInput = z.infer<typeof movementSchema>;
export type GarmentInput = z.infer<typeof garmentSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;