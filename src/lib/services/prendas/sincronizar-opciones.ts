import type { Prisma } from "@/../generated/prisma/client";
import type { OpcionProductoFormulario } from "@/types/productos/opciones-producto";
import { claveOpcionValor } from "@/lib/productos/normalizar-opciones";

type Tx = Prisma.TransactionClient;

export async function sincronizarOpciones(
  tx: Tx,
  tenantId: string,
  garmentId: string,
  opciones: OpcionProductoFormulario[]
): Promise<Map<string, string>> {
  await tx.garmentOption.deleteMany({ where: { garmentId, tenantId } });

  const resolver = new Map<string, string>();
  let posicionOpcion = 0;
  for (const opcion of opciones) {
    const creada = await tx.garmentOption.create({
      data: {
        tenantId,
        garmentId,
        name: opcion.name,
        position: posicionOpcion,
        values: {
          create: opcion.values.map((valor, indice) => ({
            tenantId,
            value: valor,
            position: indice,
          })),
        },
      },
      include: { values: true },
    });
    posicionOpcion += 1;
    for (const valor of creada.values) {
      resolver.set(claveOpcionValor({ opcion: opcion.name, valor: valor.value }), valor.id);
    }
  }
  return resolver;
}
