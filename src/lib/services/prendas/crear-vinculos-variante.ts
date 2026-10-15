import { Prisma } from "@/../generated/prisma/client";
import type { ParOpcionValor } from "@/types/productos/opciones-producto";
import { claveOpcionValor } from "@/lib/productos/normalizar-opciones";

type Tx = Prisma.TransactionClient;

export async function crearVinculosVariante(
  tx: Tx,
  varianteId: string,
  resolver: Map<string, string>,
  opcionValores: ParOpcionValor[]
): Promise<void> {
  const datos = opcionValores
    .map((par) => ({ variantId: varianteId, optionValueId: resolver.get(claveOpcionValor(par)) }))
    .filter((d): d is { variantId: string; optionValueId: string } => Boolean(d.optionValueId));
  if (datos.length > 0) {
    await tx.garmentVariantOptionValue.createMany({ data: datos, skipDuplicates: true });
  }
}
