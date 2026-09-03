import type { Prisma, PrismaClient } from "../../generated/prisma/client";
import { PUENTES, RELACIONES, TABLAS_TENANT, type Puente } from "./definiciones";

type ClienteSql = Prisma.TransactionClient;
type Semantica = { board: "A" | "B"; relacion: "A" | "B" };

async function contar(
  cliente: ClienteSql,
  sql: string,
  ...valores: readonly unknown[]
): Promise<number> {
  const filas = await cliente.$queryRawUnsafe<Array<{ cantidad: bigint }>>(sql, ...valores);
  return Number(filas[0]?.cantidad ?? 0);
}

async function detectarSemantica(
  cliente: ClienteSql,
  puente: Puente
): Promise<Semantica | null> {
  if (await contar(cliente, `SELECT COUNT(*) AS cantidad FROM \`${puente.vieja}\``) === 0) {
    return null;
  }
  const huerfanosBoardA = await contar(cliente,
    `SELECT COUNT(*) AS cantidad FROM \`${puente.vieja}\` v LEFT JOIN ` +
      "`BoardTypeOption` p ON v.A=p.id WHERE p.id IS NULL");
  const huerfanosBoardB = await contar(cliente,
    `SELECT COUNT(*) AS cantidad FROM \`${puente.vieja}\` v LEFT JOIN ` +
      "`BoardTypeOption` p ON v.B=p.id WHERE p.id IS NULL");
  if (huerfanosBoardA === 0 && huerfanosBoardB > 0) return { board: "A", relacion: "B" };
  if (huerfanosBoardB === 0 && huerfanosBoardA > 0) return { board: "B", relacion: "A" };
  if (huerfanosBoardA === 0 && huerfanosBoardB === 0) {
    const huerfanosRelacionA = await contar(cliente,
      `SELECT COUNT(*) AS cantidad FROM \`${puente.vieja}\` v LEFT JOIN ` +
        `\`${puente.tablaRelacion}\` p ON v.A=p.id WHERE p.id IS NULL`);
    const huerfanosRelacionB = await contar(cliente,
      `SELECT COUNT(*) AS cantidad FROM \`${puente.vieja}\` v LEFT JOIN ` +
        `\`${puente.tablaRelacion}\` p ON v.B=p.id WHERE p.id IS NULL`);
    if (huerfanosRelacionA === 0 && huerfanosRelacionB > 0) return { board: "B", relacion: "A" };
    if (huerfanosRelacionB === 0 && huerfanosRelacionA > 0) return { board: "A", relacion: "B" };
  }
  throw new Error(`Semántica A/B ambigua o con huérfanos en ${puente.vieja}`);
}

async function analizarDistribucion(cliente: ClienteSql, tenantId: string): Promise<string[]> {
  const pendientes: string[] = [];
  for (const tabla of TABLAS_TENANT) {
    const grupos = await cliente.$queryRawUnsafe<Array<{ tenantId: string | null; cantidad: bigint }>>(
      `SELECT tenantId, COUNT(*) AS cantidad FROM \`${tabla}\` GROUP BY tenantId`
    );
    let nulos = 0;
    for (const grupo of grupos) {
      if (grupo.tenantId === null) nulos = Number(grupo.cantidad);
      else if (grupo.tenantId !== tenantId) {
        throw new Error(`${tabla} contiene filas del tenant distinto "${grupo.tenantId}"`);
      }
    }
    if (nulos > 0) pendientes.push(tabla);
    console.log(`  ${tabla}: ${nulos} filas NULL`);
  }
  return pendientes;
}

async function validar(
  cliente: ClienteSql,
  tenantId: string
): Promise<void> {
  const fallas: string[] = [];
  for (const tabla of TABLAS_TENANT) {
    const nulos = await contar(cliente,
      `SELECT COUNT(*) AS cantidad FROM \`${tabla}\` WHERE tenantId IS NULL`);
    const distintos = await contar(cliente,
      `SELECT COUNT(*) AS cantidad FROM \`${tabla}\` WHERE tenantId <> ?`, tenantId);
    const huerfanosTenant = await contar(cliente,
      `SELECT COUNT(*) AS cantidad FROM \`${tabla}\` h LEFT JOIN ` +
        "`Tenant` t ON h.tenantId=t.id WHERE h.tenantId IS NOT NULL AND t.id IS NULL");
    if (nulos || distintos || huerfanosTenant) fallas.push(`distribución ${tabla}`);
  }
  for (const relacion of RELACIONES) {
    const huerfanos = await contar(cliente,
      `SELECT COUNT(*) AS cantidad FROM \`${relacion.hija}\` h LEFT JOIN ` +
        `\`${relacion.padre}\` p ON h.\`${relacion.fk}\`=p.id ` +
        `WHERE h.\`${relacion.fk}\` IS NOT NULL AND p.id IS NULL`);
    const cruces = await contar(cliente,
      `SELECT COUNT(*) AS cantidad FROM \`${relacion.hija}\` h JOIN ` +
        `\`${relacion.padre}\` p ON h.\`${relacion.fk}\`=p.id WHERE h.tenantId<>p.tenantId`);
    if (huerfanos || cruces) fallas.push(relacion.nombre);
  }
  for (const puente of PUENTES) {
    const semantica = await detectarSemantica(cliente, puente);
    const viejo = await contar(cliente, `SELECT COUNT(*) AS cantidad FROM \`${puente.vieja}\``);
    const nuevo = await contar(cliente,
      `SELECT COUNT(*) AS cantidad FROM \`${puente.nueva}\` WHERE tenantId=?`, tenantId);
    let faltantes = 0;
    let sobrantes = nuevo;
    if (semantica) {
      const board = `v.${semantica.board}`;
      const relacion = `v.${semantica.relacion}`;
      faltantes = await contar(cliente,
        `SELECT COUNT(*) AS cantidad FROM \`${puente.vieja}\` v LEFT JOIN ` +
          `\`${puente.nueva}\` n ON n.tenantId=? AND n.boardTypeId=${board} ` +
          `AND n.\`${puente.columnaRelacion}\`=${relacion} WHERE n.id IS NULL`, tenantId);
      sobrantes = await contar(cliente,
        `SELECT COUNT(*) AS cantidad FROM \`${puente.nueva}\` n LEFT JOIN ` +
          `\`${puente.vieja}\` v ON n.boardTypeId=${board} ` +
          `AND n.\`${puente.columnaRelacion}\`=${relacion} ` +
          "WHERE n.tenantId=? AND v.A IS NULL", tenantId);
    }
    if (viejo !== nuevo || faltantes || sobrantes) fallas.push(`pares ${puente.nueva}`);
    for (const [fk, padre] of [["boardTypeId", "BoardTypeOption"], [puente.columnaRelacion, puente.tablaRelacion]]) {
      const huerfanos = await contar(cliente,
        `SELECT COUNT(*) AS cantidad FROM \`${puente.nueva}\` h LEFT JOIN ` +
          `\`${padre}\` p ON h.\`${fk}\`=p.id WHERE p.id IS NULL`);
      const cruces = await contar(cliente,
        `SELECT COUNT(*) AS cantidad FROM \`${puente.nueva}\` h JOIN ` +
          `\`${padre}\` p ON h.\`${fk}\`=p.id WHERE h.tenantId<>p.tenantId`);
      if (huerfanos || cruces) fallas.push(`${puente.nueva}→${padre}`);
    }
  }
  const pageConfigs = await contar(cliente,
    "SELECT COUNT(*) AS cantidad FROM `PageConfig` WHERE tenantId=?", tenantId);
  if (pageConfigs !== 1) fallas.push(`PageConfig 1:1 (${pageConfigs})`);
  if (fallas.length) throw new Error(`Validaciones fallidas: ${fallas.join(", ")}`);
}

export async function ejecutarMigracionTenantInicial(cliente: PrismaClient): Promise<void> {
  const tenantId = process.env.TENANT_INICIAL_ID?.trim();
  const slug = process.env.TENANT_INICIAL_SLUG?.trim() || null;
  const dominio = process.env.TENANT_INICIAL_DOMINIO?.trim() || null;
  if (!tenantId) throw new Error("TENANT_INICIAL_ID es obligatorio y no se genera automáticamente");

  console.log("[1/4] Defensa por distribución");
  const pendientes = await analizarDistribucion(cliente, tenantId);
  let tenant = await cliente.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    if (!slug) throw new Error(
      "El tenant no existe y falta TENANT_INICIAL_SLUG; crealo en Logabyte o definí el slug"
    );
    tenant = await cliente.tenant.create({
      data: { id: tenantId, nombre: slug, slug, dominio, estado: "ACTIVO" },
    });
  }

  console.log("[2/4] Backfill y puentes en transacción");
  await cliente.$transaction(async (tx) => {
    for (const tabla of pendientes) {
      await tx.$executeRawUnsafe(
        `UPDATE \`${tabla}\` SET tenantId=? WHERE tenantId IS NULL`, tenantId
      );
    }
    const pageConfigs = await contar(tx,
      "SELECT COUNT(*) AS cantidad FROM `PageConfig` WHERE tenantId=?", tenantId);
    if (pageConfigs > 1) throw new Error(`Hay ${pageConfigs} PageConfig para el tenant inicial`);
    if (pageConfigs === 0) {
      await tx.pageConfig.create({ data: { tenantId, storeName: tenant.nombre } });
    }
    for (const puente of PUENTES) {
      const semantica = await detectarSemantica(tx, puente);
      if (!semantica) continue;
      const board = `v.${semantica.board}`;
      const relacion = `v.${semantica.relacion}`;
      await tx.$executeRawUnsafe(
        `INSERT INTO \`${puente.nueva}\` (id,tenantId,boardTypeId,\`${puente.columnaRelacion}\`) ` +
          `SELECT UUID(),?,${board},${relacion} FROM \`${puente.vieja}\` v WHERE NOT EXISTS (` +
          `SELECT 1 FROM \`${puente.nueva}\` n WHERE n.tenantId=? ` +
          `AND n.boardTypeId=${board} AND n.\`${puente.columnaRelacion}\`=${relacion})`,
        tenantId, tenantId
      );
    }
  });

  console.log("[3/4] Validaciones");
  await validar(cliente, tenantId);
  console.log("[4/4] Migración completada: 29 tablas, M:N y PageConfig validados");
}
