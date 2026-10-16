import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  compararTablasOrigen,
  MANIFIESTO_TABLAS_TENANT,
  validarManifiestoTablasTenant,
} from "../src/lib/tenants/migracion-datos/manifiesto";
import {
  obtenerRelacionesForaneasTenant,
  validarRelacionesForaneasTenant,
} from "../src/lib/tenants/migracion-datos/relaciones";

async function main(): Promise<void> {
  const schema = await readFile(path.resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
  assert.deepEqual(validarManifiestoTablasTenant(schema), []);
  assert.deepEqual(validarRelacionesForaneasTenant(schema), []);
  const schemaConDependenciaIncorrecta = schema.replace(
    "user              user    @relation(fields: [userId], references: [id], onDelete: Cascade)",
    "user              SizeType @relation(fields: [userId], references: [id], onDelete: Cascade)",
  );
  assert.notEqual(schemaConDependenciaIncorrecta, schema);
  assert.ok(validarRelacionesForaneasTenant(schemaConDependenciaIncorrecta).some((error) =>
    error.includes("account debe depender de SizeType"),
  ));
  assert.equal(MANIFIESTO_TABLAS_TENANT.length, 31);

  const relaciones = obtenerRelacionesForaneasTenant(schema);
  assert.ok(relaciones.length >= 40, "El inventario debe incluir relaciones Prisma y pertenencia al tenant");
  assert.ok(relaciones.some((relacion) =>
    relacion.tablaHija === "Payment" &&
    relacion.columnaHija === "pedidoId" &&
    relacion.tablaPadre === "Pedido",
  ));
  assert.ok(relaciones.some((relacion) =>
    relacion.tablaHija === "PedidoItem" &&
    relacion.columnaHija === "garmentId" &&
    relacion.tablaPadre === "Garment" &&
    relacion.origen === "legado",
  ));
  assert.ok(relaciones.some((relacion) =>
    relacion.tablaHija === "PedidoItem" &&
    relacion.columnaHija === "variantId" &&
    relacion.tablaPadre === "GarmentVariant" &&
    relacion.origen === "legado",
  ));

  const puente = MANIFIESTO_TABLAS_TENANT.find(
    (tabla) => tabla.modelo === "GarmentVariantOptionValue",
  );
  assert.equal(puente?.seleccion.tipo, "puente-tenant");
  assert.deepEqual(puente?.dependeDe, ["GarmentVariant", "GarmentOptionValue"]);
  assert.equal(
    MANIFIESTO_TABLAS_TENANT[0]?.modelo,
    "Tenant",
    "La fila Tenant debe migrarse antes que los modelos que dependen de ella",
  );
  assert.deepEqual(
    MANIFIESTO_TABLAS_TENANT[0]?.dependeDe,
    [],
    "Tenant es la raíz de identidad para la transferencia",
  );

  const tablasEsperadas = MANIFIESTO_TABLAS_TENANT.map((tabla) => tabla.tabla);
  assert.deepEqual(
    compararTablasOrigen([...tablasEsperadas, "_prisma_migrations"]),
    { noClasificadas: [], ausentesEnOrigen: [] },
  );
  assert.deepEqual(
    compararTablasOrigen([...tablasEsperadas.filter((tabla) => tabla !== "PedidoItem"), "TablaAntigua"]),
    { noClasificadas: ["TablaAntigua"], ausentesEnOrigen: ["PedidoItem"] },
  );

  console.log("Manifiesto de transferencia: 31 modelos, dependencias y detección de tablas históricas verificadas.");
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
