import { createHash } from "node:crypto";
import { MANIFIESTO_TABLAS_TENANT } from "../../../src/lib/tenants/migracion-datos/manifiesto";
import { type ClienteTransferencia, agregarSemanticaJson, construirWhere, delegado, ordenPrimario, serializarFila } from "./datos";

export const TAMANIO_LOTE = 250;

export interface ResultadoTablaTransferida {
  modelo: string;
  filas: number;
  sha256: string;
}

export async function recorrerFilas(
  cliente: ClienteTransferencia,
  modelo: string,
  tabla: string,
  tenantId: string,
  visitar: (filas: Array<Record<string, unknown>>) => Promise<void>,
): Promise<{ filas: number; sha256: string }> {
  const consulta = delegado(cliente, modelo);
  const where = construirWhere(modelo, tenantId);
  const hash = createHash("sha256");
  let skip = 0;
  let total = 0;

  while (true) {
    const filas = await consulta.findMany({
      where,
      orderBy: ordenPrimario(modelo),
      take: TAMANIO_LOTE,
      skip,
    });
    if (filas.length === 0) break;
    const filasConJson = await agregarSemanticaJson(cliente, modelo, tabla, filas);
    for (const fila of filasConJson) hash.update(`${serializarFila(fila)}\n`);
    await visitar(filasConJson);
    total += filas.length;
    skip += filas.length;
  }

  return { filas: total, sha256: hash.digest("hex") };
}

export async function copiarDatos(
  origen: ClienteTransferencia,
  destino: ClienteTransferencia,
  tenantId: string,
  antesDeCadaTabla: () => Promise<void>,
): Promise<ResultadoTablaTransferida[]> {
  const resultados: ResultadoTablaTransferida[] = [];
  for (const entrada of MANIFIESTO_TABLAS_TENANT) {
    await antesDeCadaTabla();
    if (entrada.modelo === "Tenant") {
      const resultado = await recorrerFilas(
        origen,
        entrada.modelo,
        entrada.tabla,
        tenantId,
        async (filas) => {
          if (filas.length !== 1 || filas[0]?.id !== tenantId) {
            throw new Error("El origen debe contener exactamente la fila Tenant seleccionada");
          }
          const datosTenant = Object.fromEntries(
            Object.entries(filas[0]).filter(([campo]) => campo !== "id"),
          );
          await delegado(destino, entrada.modelo).update({
            where: { id: tenantId },
            data: datosTenant,
          });
        },
      );
      resultados.push({ modelo: entrada.modelo, ...resultado });
      continue;
    }

    const resultado = await recorrerFilas(origen, entrada.modelo, entrada.tabla, tenantId, async (filas) => {
      const insertadas = await delegado(destino, entrada.modelo).createMany({ data: filas });
      if (insertadas.count !== filas.length) {
        throw new Error(`La inserción de ${entrada.modelo} devolvió un conteo inesperado`);
      }
    });
    resultados.push({ modelo: entrada.modelo, ...resultado });
  }
  return resultados;
}

export async function verificarCopia(
  origen: ClienteTransferencia,
  destino: ClienteTransferencia,
  tenantId: string,
  resultados: readonly ResultadoTablaTransferida[],
): Promise<void> {
  for (const resultadoEsperado of resultados) {
    const entrada = MANIFIESTO_TABLAS_TENANT.find((fila) => fila.modelo === resultadoEsperado.modelo);
    if (!entrada) throw new Error(`Falta ${resultadoEsperado.modelo} en el manifiesto`);
    const [origenActual, destinoActual] = await Promise.all([
      recorrerFilas(origen, entrada.modelo, entrada.tabla, tenantId, async () => undefined),
      recorrerFilas(destino, entrada.modelo, entrada.tabla, tenantId, async () => undefined),
    ]);
    if (
      origenActual.filas !== resultadoEsperado.filas ||
      origenActual.sha256 !== resultadoEsperado.sha256 ||
      destinoActual.filas !== resultadoEsperado.filas ||
      destinoActual.sha256 !== resultadoEsperado.sha256
    ) {
      throw new Error(`La verificación de contenido no coincide para ${entrada.modelo}`);
    }
  }
}
