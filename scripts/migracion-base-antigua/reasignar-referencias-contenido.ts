import { reasignarContenidoFila } from "./reasignar-contenido-fila";
import type { ClienteDestino, FilaSql, MapaIds } from "./tipos-migracion";

export async function reasignarReferenciasContenido(
  destino: ClienteDestino,
  tenantId: string,
  mapas: MapaIds,
): Promise<void> {
  const nombres = new Map<string, Set<string>>();
  for (const tabla of ["Category", "SubCategory"]) {
    const filas = await destino.$queryRawUnsafe<Array<{ name: string }>>(
      `SELECT name FROM \`${tabla}\` WHERE tenantId=?`, tenantId,
    );
    nombres.set(tabla, new Set(filas.map((fila) => fila.name.trim().toLowerCase())));
  }
  for (const tabla of ["PageConfig", "Grid", "Banner", "CarouselSlide", "CustomPageSections", "CustomPageItems"]) {
    const filas = await destino.$queryRawUnsafe<FilaSql[]>(
      `SELECT * FROM \`${tabla}\` WHERE tenantId=?`, tenantId,
    );
    for (const fila of filas) {
      const cambios = reasignarContenidoFila(tabla, fila, mapas, nombres);
      const columnas = Object.keys(cambios);
      if (columnas.length === 0) continue;
      const asignaciones = columnas.map((columna) => `\`${columna}\`=?`).join(",");
      await destino.$executeRawUnsafe(
        `UPDATE \`${tabla}\` SET ${asignaciones} WHERE tenantId=? AND id=?`,
        ...columnas.map((columna) => cambios[columna]), tenantId, fila.id,
      );
    }
  }
}
