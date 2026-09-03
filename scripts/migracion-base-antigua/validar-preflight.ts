import type { PrismaClient } from "../../generated/prisma/client";
import type { ClienteLectura } from "./tipos-migracion";
import { PUENTES_MIGRACION, TABLAS_MIGRACION } from "./definiciones-migracion";
import { obtenerColumnasTabla } from "./obtener-columnas-tabla";
import { detectarOrientacionPuente } from "./detectar-orientacion-puente";
import { validarReferenciasContenido } from "./validar-referencias-contenido";
import type { ConfiguracionMigracion } from "./tipos-configuracion";

type FilaCantidad = { cantidad: bigint };

export async function validarPreflight(
  origen: ClienteLectura,
  destino: PrismaClient,
  configuracion: ConfiguracionMigracion,
  baseOrigen: string,
  baseDestino: string,
): Promise<Map<string, number>> {
  const cantidades = new Map<string, number>();
  const tablasOrigen = [
    ...TABLAS_MIGRACION.map((tabla) => tabla.origen),
    ...PUENTES_MIGRACION.map((puente) => puente.origen),
  ];
  const tablasDestino = [
    "Tenant",
    ...TABLAS_MIGRACION.map((tabla) => tabla.destino),
    ...PUENTES_MIGRACION.map((puente) => puente.destino),
  ];

  for (const tabla of new Set(tablasOrigen)) {
    await exigirTabla(origen, baseOrigen, tabla, "origen");
    cantidades.set(tabla, await contar(origen, `SELECT COUNT(*) AS cantidad FROM \`${tabla}\``));
  }
  for (const tabla of new Set(tablasDestino)) {
    await exigirTabla(destino, baseDestino, tabla, "destino");
  }

  for (const tabla of TABLAS_MIGRACION) {
    const columnasOrigen = await obtenerColumnasTabla(origen, baseOrigen, tabla.origen);
    const columnasDestino = await obtenerColumnasTabla(destino, baseDestino, tabla.destino);
    validarCompatibilidadColumnas(
      tabla.origen,
      tabla.destino,
      columnasOrigen,
      columnasDestino,
    );
  }

  if ((cantidades.get("PageConfig") ?? 0) > 1) {
    throw new Error("La base de origen contiene más de un PageConfig.");
  }
  for (const tabla of TABLAS_MIGRACION) {
    for (const referencia of tabla.referencias) {
      const condicionNulo = referencia.opcional
        ? `h.\`${referencia.columna}\` IS NOT NULL AND `
        : "";
      const huerfanos = await contar(
        origen,
        `SELECT COUNT(*) AS cantidad FROM \`${tabla.origen}\` h LEFT JOIN \`${referencia.tablaPadre}\` p ON h.\`${referencia.columna}\`=p.id WHERE ${condicionNulo}p.id IS NULL`,
      );
      if (huerfanos > 0) {
        throw new Error(`${tabla.origen}.${referencia.columna} contiene ${huerfanos} referencias huérfanas.`);
      }
    }
  }
  await validarReferenciasContenido(origen);
  for (const puente of PUENTES_MIGRACION) {
    const orientacion = await detectarOrientacionPuente(origen, puente, configuracion.omitirRelacionesHuerfanas);
    console.log(`  ${puente.origen}: BoardType=${orientacion.board}, opción=${orientacion.relacion}`);
  }

  const tenantExistente = await destino.tenant.findFirst({
    where: {
      OR: [
        { slug: configuracion.tenant.slug },
        ...(configuracion.tenant.dominio ? [{ dominio: configuracion.tenant.dominio }] : []),
      ],
    },
    select: { id: true },
  });
  if (tenantExistente) throw new Error("El slug o dominio ya pertenece a un tenant del destino.");
  return cantidades;
}

function validarCompatibilidadColumnas(
  tablaOrigen: string,
  tablaDestino: string,
  columnasOrigen: ReadonlySet<string>,
  columnasDestino: ReadonlySet<string>,
): void {
  if (columnasOrigen.has("tenantId")) {
    throw new Error(
      `${tablaOrigen} ya contiene tenantId; la base indicada no corresponde al schema antiguo esperado.`,
    );
  }
  if (!columnasDestino.has("tenantId")) {
    throw new Error(`${tablaDestino} no contiene la columna tenantId requerida.`);
  }
  const faltantes = [...columnasOrigen].filter(
    (columna) => !columnasDestino.has(columna),
  );
  if (faltantes.length > 0) {
    throw new Error(
      `${tablaDestino} no puede recibir columnas de ${tablaOrigen}: ${faltantes.join(", ")}.`,
    );
  }
}

async function exigirTabla(
  cliente: ClienteLectura,
  baseDatos: string,
  tabla: string,
  lado: "origen" | "destino",
): Promise<void> {
  const filas = await cliente.$queryRawUnsafe<Array<{ ENGINE: string | null }>>(
    "SELECT ENGINE FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA=? AND TABLE_NAME=?",
    baseDatos, tabla,
  );
  if (filas.length !== 1) throw new Error(`Falta la tabla ${tabla} en la base de ${lado}.`);
  if (filas[0].ENGINE?.toLowerCase() !== "innodb") {
    throw new Error(`${tabla} en ${lado} no usa InnoDB: no se puede garantizar consistencia transaccional.`);
  }
}

async function contar(
  cliente: ClienteLectura,
  sql: string,
  ...valores: readonly unknown[]
): Promise<number> {
  const filas = await cliente.$queryRawUnsafe<FilaCantidad[]>(sql, ...valores);
  return Number(filas[0]?.cantidad ?? 0);
}
