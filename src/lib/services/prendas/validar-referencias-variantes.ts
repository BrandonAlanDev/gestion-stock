import { prisma } from "@/lib/prisma";
import type { DatosGuardarProducto } from "@/types/productos/opciones-producto";

export async function validarReferenciasVariantes(
  tenantId: string,
  variantes: DatosGuardarProducto["variants"]
): Promise<void> {
  const talles = [...new Set(variantes.map((variante) => variante.sizeId).filter((id): id is string => Boolean(id)))];
  const colores = [...new Set(variantes.map((variante) => variante.colorId).filter((id): id is string => Boolean(id)))];

  const [cantidadTalles, cantidadColores] = await Promise.all([
    talles.length ? prisma.size.count({ where: { tenantId, id: { in: talles } } }) : 0,
    colores.length ? prisma.color.count({ where: { tenantId, id: { in: colores } } }) : 0,
  ]);
  if (cantidadTalles !== talles.length || cantidadColores !== colores.length) {
    throw new Error("Una variante incluye talles o colores de otro comercio");
  }
}
