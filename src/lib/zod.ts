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
  sizeId: z.string().optional().nullable(),
  colorId: z.string().min(1, "Selecciona un color"),
  sku: z.string().optional(),
  stock: z.coerce.number().int().nonnegative("El stock no puede ser negativo"),
  attributes: z.any().optional().nullable(),
});

export const garmentSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  price: z.coerce.number().positive(),
  maxPrice: z.coerce.number().positive().optional().nullable(),
  cost: z.coerce.number().positive(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "La categoría es obligatoria"),

  subCategoryId: z.string().optional().nullable(),

  supplierId: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  variants: z.array(
    z.object({
      id: z.string().optional(), // Por si editas
      sizeId: z.string().optional().nullable(),
      colorId: z.string().optional().nullable(),
      sku: z.string().optional(),
      stock: z.coerce.number().int().nonnegative(),
      attributes: z.any().optional().nullable(),
    })
  ),
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
  name: providerNameSchema
});

export const SizeValueSchema = z.string()
  .min(1, "El valor del talle no puede estar vacío")
  .regex(/^[a-zA-Z0-9.\-\/']+$/, "Solo se permiten letras, números y puntos (sin espacios)");

// COLOR
export const colorSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  hex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Formato hex inválido").optional().nullable(),
});

// ─── CARRUSELES ─────────────────────────────────────────────────────
export const carouselSettingsSchema = z.object({
  // HERO DEFAULT
  heroStyle: z.enum(["DEFAULT", "SHOWCASE"]).default("DEFAULT"),
  slideLayout: z.enum(["standard", "split", "minimal"]).default("standard"),
  transitionDuration: z.number().int().positive().default(6000),
  autoPlay: z.boolean().default(true),
  showDots: z.boolean().default(true),
  showNavButtons: z.boolean().default(true),
  overlayOpacity: z.number().min(0).max(1).default(0.9),

  // HERO SHOWCASE
  slidesToScroll: z.number().int().positive().default(1),
  gap: z.number().int().min(0).default(16),
  showArrows: z.boolean().default(true),
  autoplayDelay: z.number().int().positive().default(5000),

  // BANNER
  height: z.number().int().positive().default(300),

  // CARDS
  layout: z.enum(["simple", "offers"]).default("simple"),
  hideButtons: z.boolean().default(false),
}).passthrough();

export const carouselLimitsSchema = z.object({
  carouselHeroLimit: z.number().int().min(1).max(10).default(1),
  carouselBannerLimit: z.number().int().min(1).max(10).default(1),
  carouselCardsLimit: z.number().int().min(1).max(20).default(3),
});

export const carouselSchema = z.object({
  type: z.enum(["HERO", "BANNER", "CARDS"]),
  title: z.string().max(100).optional(),
  active: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
  settings: carouselSettingsSchema.optional(),
});

export const carouselUpdateSchema = carouselSchema.partial().extend({
  id: z.string().cuid(),
});

export const slideConfigSchema = z.object({}).passthrough();

export const carouselSlideSchema = z.object({
  carouselId: z.string().cuid(),
  order: z.number().int().min(0).default(0),
  image: z.union([
    z.string().url(),
    z.string().startsWith("data:image"),
  ]),
  title: z.string().max(100).optional(),
  subtitle: z.string().max(150).optional(),
  description: z.string().max(500).optional(),
  ctaText: z.string().max(50).optional(),
  url: z.string().optional().or(z.literal("")),
  config: slideConfigSchema.optional(),
});

export const carouselSlideUpdateSchema = carouselSlideSchema.partial().extend({
  id: z.string().cuid(),
});

export const carouselReorderSchema = z.object({
  carouselIds: z.array(z.string().cuid()).min(1),
});

export const slideReorderSchema = z.object({
  carouselId: z.string().cuid(),
  slideIds: z.array(z.string().cuid()).min(1),
});

// Wizard schemas (para validación en el modal unificado)
export const carouselWizardSlideSchema = z.object({
  id: z.string().optional(), // temp-* durante wizard
  image: z.string().min(1, "Imagen requerida"),
  title: z.string().max(100).optional(),
  subtitle: z.string().max(150).optional(),
  description: z.string().max(500).optional(),
  ctaText: z.string().max(50).optional(),
  url: z.string().optional().or(z.literal("")),
  config: slideConfigSchema.optional(),
  order: z.number().int().min(0).default(0),
});

export const carouselWizardSchema = z.object({
  id: z.string().cuid().optional(),
  type: z.enum(["HERO", "BANNER", "CARDS"]),
  title: z.string().max(100).optional(),
  settings: carouselSettingsSchema,
  slides: z.array(carouselWizardSlideSchema).min(1, "Mínimo 1 slide"),
});

export type CarouselLimitsInput = z.infer<typeof carouselLimitsSchema>;
export type CarouselWizardInput = z.infer<typeof carouselWizardSchema>;