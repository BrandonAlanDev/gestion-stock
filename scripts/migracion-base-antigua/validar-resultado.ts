import type { ClienteDestino } from "./tipos-migracion";

type FilaCantidad = { cantidad: bigint };

export async function validarResultado(
  destino: ClienteDestino,
  tenantId: string,
  cantidadesEsperadas: Map<string, number>,
): Promise<void> {
  for (const [tabla, esperada] of cantidadesEsperadas) {
    const filas = await destino.$queryRawUnsafe<FilaCantidad[]>(
      `SELECT COUNT(*) AS cantidad FROM \`${tabla}\` WHERE tenantId=?`,
      tenantId,
    );
    const obtenida = Number(filas[0]?.cantidad ?? 0);
    if (obtenida !== esperada) {
      throw new Error(`Validación fallida en ${tabla}: esperadas ${esperada}, obtenidas ${obtenida}.`);
    }
  }
}
