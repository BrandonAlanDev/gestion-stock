import { z } from "zod";

export const esquemaMovimiento = z.object({
  variantId: z.string().cuid("La variante no es válida"),
  type: z.enum(["IN", "OUT"]),
  quantity: z.number().int().positive("La cantidad debe ser mayor a cero"),
  priceAtTime: z.number().finite().nonnegative("El precio no puede ser negativo"),
  note: z.string().trim().max(500, "La nota es demasiado extensa").optional(),
});
