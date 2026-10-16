import assert from "node:assert/strict";
import { Prisma } from "../generated/prisma/client";
import { auditarRelacionesTenant, type ColumnaAuditoriaOrigen } from "./tenants/auditar-relaciones-origen";
import { construirConsultaConteosPuenteTenant } from "./tenants/transferencia/validaciones";
import { obtenerRelacionesForaneasTenant } from "../src/lib/tenants/migracion-datos/relaciones";
import { readFile } from "node:fs/promises";
import path from "node:path";

const COLUMNAS_PEDIDO_ITEM: ColumnaAuditoriaOrigen[] = [
  { tabla: "PedidoItem", columna: "tenantId", tipo: "varchar(191)", nullable: "NO", predeterminado: null, clave: "MUL", extra: "" },
  { tabla: "PedidoItem", columna: "garmentId", tipo: "varchar(191)", nullable: "NO", predeterminado: null, clave: "", extra: "" },
];

const COLUMNAS_GARMENT: ColumnaAuditoriaOrigen[] = [
  { tabla: "Garment", columna: "id", tipo: "varchar(191)", nullable: "NO", predeterminado: null, clave: "PRI", extra: "" },
  { tabla: "Garment", columna: "tenantId", tipo: "varchar(191)", nullable: "NO", predeterminado: null, clave: "MUL", extra: "" },
];

async function main(): Promise<void> {
  const schema = await readFile(path.resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
  const relaciones = obtenerRelacionesForaneasTenant(schema).filter((relacion) =>
    relacion.tablaHija === "PedidoItem" && relacion.columnaHija === "garmentId",
  );
  assert.equal(relaciones.length, 1);

  const consultas: Prisma.Sql[] = [];
  const resultado = await auditarRelacionesTenant(
    async (consulta) => {
      consultas.push(consulta);
      return [{
        tenantId: "tenant-a",
        referencias: 3,
        referenciasHuerfanas: 1,
        referenciasCruzadas: 1,
      }];
    },
    ["tenant-a"],
    new Map([
      ["PedidoItem", COLUMNAS_PEDIDO_ITEM],
      ["Garment", COLUMNAS_GARMENT],
    ]),
    relaciones,
  );

  assert.equal(consultas.length, 1);
  assert.match(consultas[0]?.sql ?? "", /LEFT JOIN `Garment`/);
  assert.match(consultas[0]?.sql ?? "", /`garmentId`/);
  assert.ok(consultas[0]?.values.includes("tenant-a"));
  assert.equal(resultado.referenciasInvalidas.length, 1);
  assert.equal(resultado.referenciasInvalidas[0]?.referenciasHuerfanas, 1);
  assert.equal(resultado.referenciasInvalidas[0]?.referenciasCruzadas, 1);

  let consultasParaDDLIncompleto = 0;
  const ddlIncompleto = await auditarRelacionesTenant(
    async () => {
      consultasParaDDLIncompleto += 1;
      return [];
    },
    ["tenant-a"],
    new Map([
      ["PedidoItem", COLUMNAS_PEDIDO_ITEM],
      ["Garment", [COLUMNAS_GARMENT[0]!]],
    ]),
    relaciones,
  );
  assert.equal(consultasParaDDLIncompleto, 0);
  assert.equal(ddlIncompleto.relacionesNoEvaluables.length, 1);
  assert.match(ddlIncompleto.relacionesNoEvaluables[0]?.motivo ?? "", /Falta una columna/);

  const consultaPuente = construirConsultaConteosPuenteTenant("tenant-a");
  assert.match(consultaPuente.sql, /v\.tenantId = \?/);
  assert.match(consultaPuente.sql, /ov\.tenantId = \?/);
  assert.match(consultaPuente.sql, /v\.id IS NULL AND ov\.id IS NULL/);
  assert.deepEqual(consultaPuente.values, ["tenant-a", "tenant-a"]);

  console.log("Auditoría relacional de origen: aislamiento por tenant, puentes, huérfanos/cruces y DDL incompleto verificados.");
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
