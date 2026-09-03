import { randomUUID } from "node:crypto";
import type { DefinicionTablaMigracion } from "./definiciones-migracion";
import { obtenerColumnasTabla } from "./obtener-columnas-tabla";
import { leerFilasTabla } from "./leer-filas-tabla";
import type { ClienteDestino, ClienteLectura, FilaSql, MapaIds } from "./tipos-migracion";

export async function copiarTabla(
  origen: ClienteLectura,
  destino: ClienteDestino,
  baseDestino: string,
  definicion: DefinicionTablaMigracion,
  tenantId: string,
  mapas: MapaIds,
): Promise<number> {
  const filas = await leerFilasTabla(origen, definicion.origen);
  const columnasDestino = await obtenerColumnasTabla(destino, baseDestino, definicion.destino);
  const mapaTabla = new Map<string, string | number>();
  mapas.set(definicion.origen, mapaTabla);

  for (const fila of filas) {
    const idAnterior = String(fila[definicion.clave]);
    const datos: FilaSql = {};
    for (const [columna, valor] of Object.entries(fila)) {
      if (columna !== definicion.clave && columna !== "tenantId" && columnasDestino.has(columna)) {
        datos[columna] = valor;
      }
    }
    for (const referencia of definicion.referencias) {
      const valorAnterior = fila[referencia.columna];
      if (valorAnterior === null || valorAnterior === undefined) {
        if (!referencia.opcional) throw new Error(`${definicion.origen}.${referencia.columna} es nulo`);
        datos[referencia.columna] = null;
        continue;
      }
      const valorNuevo = mapas.get(referencia.tablaPadre)?.get(String(valorAnterior));
      if (valorNuevo === undefined) {
        throw new Error(`${definicion.origen}.${referencia.columna} referencia un registro inexistente`);
      }
      datos[referencia.columna] = valorNuevo;
    }

    let idNuevo: string | number | undefined;
    if (definicion.tipoClave === "cadena") {
      idNuevo = randomUUID();
      datos[definicion.clave] = idNuevo;
    }
    datos.tenantId = tenantId;
    const columnas = Object.keys(datos);
    const nombres = columnas.map((columna) => `\`${columna}\``).join(",");
    const marcadores = columnas.map(() => "?").join(",");
    await destino.$executeRawUnsafe(
      `INSERT INTO \`${definicion.destino}\` (${nombres}) VALUES (${marcadores})`,
      ...columnas.map((columna) => datos[columna]),
    );
    if (idNuevo === undefined) {
      const resultado = await destino.$queryRawUnsafe<Array<{ id: bigint }>>("SELECT LAST_INSERT_ID() AS id");
      idNuevo = Number(resultado[0]?.id);
      if (!Number.isSafeInteger(idNuevo) || idNuevo <= 0) {
        throw new Error(`No se obtuvo un ID autoincremental válido para ${definicion.destino}.`);
      }
    }
    mapaTabla.set(idAnterior, idNuevo);
  }
  return filas.length;
}
