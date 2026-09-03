import { randomUUID } from "node:crypto";
import { PUENTES_MIGRACION } from "./definiciones-migracion";
import { detectarOrientacionPuente } from "./detectar-orientacion-puente";
import type { ClienteDestino, ClienteLectura, FilaSql, MapaIds } from "./tipos-migracion";

export async function copiarPuentes(
  origen: ClienteLectura,
  destino: ClienteDestino,
  tenantId: string,
  mapas: MapaIds,
  permitirHuerfanos = false,
): Promise<Map<string, number>> {
  const cantidades = new Map<string, number>();
  for (const puente of PUENTES_MIGRACION) {
    const orientacion = await detectarOrientacionPuente(origen, puente, permitirHuerfanos);
    const filas = await origen.$queryRawUnsafe<FilaSql[]>(`SELECT A, B FROM \`${puente.origen}\``);
    let copiadas = 0;
    for (const fila of filas) {
      const relacionId = mapas.get(puente.tablaRelacion)?.get(String(fila[orientacion.relacion]));
      const boardTypeId = mapas.get(puente.tablaBoard)?.get(String(fila[orientacion.board]));
      if (relacionId === undefined || boardTypeId === undefined) {
        if (permitirHuerfanos) continue;
        throw new Error(`${puente.origen} contiene una relación A/B huérfana o invertida`);
      }
      await destino.$executeRawUnsafe(
        `INSERT INTO \`${puente.destino}\` (id, tenantId, boardTypeId, \`${puente.columnaRelacion}\`) VALUES (?, ?, ?, ?)`,
        randomUUID(), tenantId, boardTypeId, relacionId,
      );
      copiadas += 1;
    }
    cantidades.set(puente.destino, copiadas);
  }
  return cantidades;
}
