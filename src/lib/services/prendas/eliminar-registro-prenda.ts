import type { PrismaClient } from "@/../generated/prisma/client";
import { Prisma } from "@/../generated/prisma/client";
import { verificarVariantesEliminables } from "@/lib/inventario/variantes-transaccion";

export async function eliminarRegistroPrenda(prisma: PrismaClient, tenantId: string, id: string) {
  void tenantId;
  return prisma.$transaction(async (tx) => {
    const productos = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT id
      FROM Garment
      WHERE id = ${id}
      FOR UPDATE
    `);
    if (productos.length === 0) throw new Error("Producto no encontrado");

    const variantes = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT id
      FROM GarmentVariant
      WHERE garmentId = ${id}
      ORDER BY id
      FOR UPDATE
    `);
    await verificarVariantesEliminables(tx, variantes.map(({ id: idVariante }) => idVariante));

    const resultado = await tx.garment.deleteMany({ where: { id } });
    if (resultado.count === 0) throw new Error("Producto no encontrado");
    return resultado;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
}
