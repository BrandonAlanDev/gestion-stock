import { Prisma } from "../../generated/prisma/client";
import { MANIFIESTO_TABLAS_TENANT } from "../../src/lib/tenants/migracion-datos/manifiesto";
import type { RelacionForaneaTenant } from "../../src/lib/tenants/migracion-datos/relaciones";

export interface ColumnaAuditoriaOrigen {
  tabla: string;
  columna: string;
  tipo: string;
  nullable: string;
  predeterminado: string | null;
  clave: string;
  extra: string;
}

export interface ConteoRelacionTenant {
  tenantId: string;
  referencias: bigint | number;
  referenciasHuerfanas: bigint | number;
  referenciasCruzadas: bigint | number;
}

export type ConsultarConteosRelacionesTenant = (
  consulta: Prisma.Sql,
) => Promise<ConteoRelacionTenant[]>;

function identificadorSql(valor: string): Prisma.Sql {
  if (!/^[a-zA-Z0-9_$]+$/.test(valor)) {
    throw new Error("El servidor devolvió un identificador SQL inválido");
  }
  return Prisma.raw(`\`${valor}\``);
}

function campoSql(alias: string, columna: string): Prisma.Sql {
  return Prisma.sql`${identificadorSql(alias)}.${identificadorSql(columna)}`;
}

function numero(valor: bigint | number): number {
  return Number(valor);
}

/** Busca referencias huérfanas o cruzadas sin depender de constraints físicas. */
export async function auditarRelacionesTenant(
  consultar: ConsultarConteosRelacionesTenant,
  tenantIds: readonly string[],
  columnasPorTabla: ReadonlyMap<string, readonly ColumnaAuditoriaOrigen[]>,
  relaciones: readonly RelacionForaneaTenant[],
): Promise<{
  referenciasInvalidas: Array<Record<string, string | number>>;
  relacionesNoEvaluables: Array<Record<string, string>>;
}> {
  const referenciasInvalidas: Array<Record<string, string | number>> = [];
  const relacionesNoEvaluables: Array<Record<string, string>> = [];
  const manifiestoPorTabla = new Map(MANIFIESTO_TABLAS_TENANT.map((tabla) => [tabla.tabla, tabla]));

  for (const relacion of relaciones) {
    const entradaHija = manifiestoPorTabla.get(relacion.tablaHija);
    const entradaPadre = manifiestoPorTabla.get(relacion.tablaPadre);
    if (!entradaHija || !entradaPadre) {
      relacionesNoEvaluables.push({
        tablaHija: relacion.tablaHija,
        columnaHija: relacion.columnaHija,
        tablaPadre: relacion.tablaPadre,
        motivo: "Tabla ausente del manifiesto",
      });
      continue;
    }

    if (entradaHija.seleccion.tipo === "puente-tenant") continue;
    const columnasHijas = columnasPorTabla.get(relacion.tablaHija) ?? [];
    const columnasPadres = columnasPorTabla.get(relacion.tablaPadre) ?? [];
    const columnaPropietario = entradaHija.seleccion.columna;
    const padreTieneTenant = columnasPadres.some((columna) => columna.columna === "tenantId");
    const faltaCampoHijo = !columnasHijas.some((columna) => columna.columna === relacion.columnaHija) ||
      !columnasHijas.some((columna) => columna.columna === columnaPropietario);
    const faltaCampoPadre =
      !columnasPadres.some((columna) => columna.columna === relacion.columnaPadre) ||
      (entradaPadre.seleccion.tipo === "columna-tenant" && !padreTieneTenant);
    if (faltaCampoHijo || faltaCampoPadre) {
      relacionesNoEvaluables.push({
        tablaHija: relacion.tablaHija,
        columnaHija: relacion.columnaHija,
        tablaPadre: relacion.tablaPadre,
        columnaPadre: relacion.columnaPadre,
        motivo: "Falta una columna en el DDL de origen",
      });
      continue;
    }

    const propietario = campoSql("c", columnaPropietario);
    const columnaRemota = campoSql("p", relacion.columnaPadre);
    const join = Prisma.sql`${campoSql("c", relacion.columnaHija)} = ${columnaRemota}`;
    const referenciasCruzadas = padreTieneTenant
      ? Prisma.sql`COALESCE(SUM(${columnaRemota} IS NOT NULL AND (${campoSql("p", "tenantId")} IS NULL OR ${campoSql("p", "tenantId")} <> ${propietario})), 0)`
      : Prisma.sql`0`;

    const conteos = await consultar(Prisma.sql`
      SELECT
        CAST(${propietario} AS CHAR) AS tenantId,
        COUNT(*) AS referencias,
        COALESCE(SUM(${columnaRemota} IS NULL), 0) AS referenciasHuerfanas,
        ${referenciasCruzadas} AS referenciasCruzadas
      FROM ${identificadorSql(relacion.tablaHija)} AS ${identificadorSql("c")}
      LEFT JOIN ${identificadorSql(relacion.tablaPadre)} AS ${identificadorSql("p")} ON ${join}
      WHERE ${propietario} IN (${Prisma.join(tenantIds)})
        AND ${campoSql("c", relacion.columnaHija)} IS NOT NULL
      GROUP BY ${propietario}
      HAVING referenciasHuerfanas > 0 OR referenciasCruzadas > 0
    `);

    for (const conteo of conteos) {
      referenciasInvalidas.push({
        tenantId: conteo.tenantId,
        tablaHija: relacion.tablaHija,
        columnaHija: relacion.columnaHija,
        tablaPadre: relacion.tablaPadre,
        columnaPadre: relacion.columnaPadre,
        origen: relacion.origen,
        referencias: numero(conteo.referencias),
        referenciasHuerfanas: numero(conteo.referenciasHuerfanas),
        referenciasCruzadas: numero(conteo.referenciasCruzadas),
      });
    }
  }

  return { referenciasInvalidas, relacionesNoEvaluables };
}
