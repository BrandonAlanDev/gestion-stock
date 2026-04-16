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
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  sizeTypeId: z.string().optional().nullable(), // AGREGAR ESTA LÍNEA
});

// ==========================================
// MOVIMIENTOS DE STOCK
// ==========================================
const MOVEMENT_TYPES = ["IN", "OUT"] as const;

export const movementSchema = z.object({
  variantId: z.string(),
  type: z.enum(["IN", "OUT"]),
  quantity: z.number().int().positive(),
  note: z.string().optional()
});


export const variantSchema = z.object({
  sizeId: z.string().min(1, "Selecciona un talle"),
  colorId: z.string().min(1, "Selecciona un color"),
  sku: z.string().optional(),
  stock: z.coerce.number().int().nonnegative("El stock no puede ser negativo"),
});

export const garmentSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  cost: z.coerce.number().min(0),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  supplierId: z.string().optional().nullable(),
  // Aquí está el cambio clave:
  variants: z.array(variantSchema).min(1, "Debes agregar al menos un talle"),
});


// Tipos para TypeScript
export type MovementInput = z.infer<typeof movementSchema>;
export type GarmentInput = z.infer<typeof garmentSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;


// Providers

export const providerNameSchema = z
  .string()
  .min(2, "Nombre muy corto")
  .max(100, "Nombre demasiado largo")
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo debe contener letras y espacios");

export const providerDetailsSchema = z
  .string()
  .max(255, "Detalle demasiado largo")
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/, "El detalle puede contener letras, números y espacios")
  .optional();

const emailSchema = z.string().email();
const phoneSchema = z.string().regex(/^[0-9+\-\s()]+$/);

export const contactSchema = z
  .string()
  .min(3, "Contacto muy corto")
  .refine(
    (val) =>
      emailSchema.safeParse(val).success ||
      phoneSchema.safeParse(val).success,
    "Debe ser un email o teléfono válido"
  );

export const normalizeContact = (c: string) => c.trim();

export const getContactType = (c: string) =>
  emailSchema.safeParse(c).success ? "EMAIL" : "PHONE";

export const createProviderSchema = z.object({
  name: providerNameSchema,
  details: providerDetailsSchema,
  contacts: z.array(contactSchema).min(1, "Agregá al menos un contacto"),
});

export const updateProviderSchema = z.object({
  id: z.string().cuid(),
  name: providerNameSchema,
  details: providerDetailsSchema,
  contacts: z.array(contactSchema).min(1),
});

export const idSchema = z.string().cuid();

// SIZES

export const SizeTypeNameSchema = z.object({
  name:providerNameSchema
});

export const SizeValueSchema = z.string()
.min(1, "El valor del talle no puede estar vacío")
.regex(/^[a-zA-Z0-9.]+$/, "Solo se permiten letras, números y puntos (sin espacios)");
 
// COLOR
export const colorSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  hex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Formato hex inválido").optional().nullable(),
});