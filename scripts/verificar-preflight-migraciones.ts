import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  construirConfirmacionDestinos,
  construirHuellaConfirmacionDestinos,
  ordenarIdsTenant,
  validarConfirmacionDestinos,
  validarEjecucionMigracion,
  validarMismoConjuntoTenantIds,
} from "./tenants/validar-migracion";
import { validarHistorialAntesDeDeploy } from "./tenants/comparar-migraciones";
import {
  detectarMigracionesConRiesgoDeDatos,
  validarAprobacionMigracionesDestructivas,
} from "./tenants/migraciones-destructivas";

const configBase = {
  ids: ["tenant-a", "tenant-b"],
  todos: false,
  planificacion: false,
  modo: "1",
  confirmacion: "tenant-a,tenant-b",
  registroCongeladoAck: undefined,
  baselineReconciliada: "1",
  nodeEnv: "development",
  permitirProduccion: undefined,
};

assert.doesNotThrow(() => validarEjecucionMigracion(configBase));
assert.throws(
  () => validarEjecucionMigracion({ ...configBase, baselineReconciliada: undefined }),
  /reconciliar la baseline/,
);
assert.throws(
  () => validarEjecucionMigracion({ ...configBase, confirmacion: "tenant-b,tenant-a" }),
  /mismo orden/,
);
assert.throws(
  () => validarEjecucionMigracion({ ...configBase, ids: ["tenant-a", "tenant-a"] }),
  /IDs repetidos/,
);
assert.throws(
  () => validarEjecucionMigracion({ ...configBase, nodeEnv: "production" }),
  /TENANT_MIGRATION_ALLOW_PRODUCTION=1/,
);
assert.doesNotThrow(() => validarEjecucionMigracion({
  ...configBase,
  nodeEnv: "production",
  permitirProduccion: "1",
}));
assert.doesNotThrow(() => validarEjecucionMigracion({
  ...configBase,
  ids: [],
  todos: true,
  planificacion: true,
  confirmacion: "TODOS",
}));
assert.throws(
  () => validarEjecucionMigracion({
    ...configBase,
    ids: [],
    todos: true,
    confirmacion: "TODOS",
  }),
  /TENANT_MIGRATION_REGISTRY_FROZEN_ACK=1/,
);
assert.doesNotThrow(() => validarEjecucionMigracion({
  ...configBase,
  ids: [],
  todos: true,
  confirmacion: "TODOS",
  registroCongeladoAck: "1",
}));
assert.throws(
  () => validarEjecucionMigracion({ ...configBase, ids: [], todos: true }),
  /debe ser TODOS/,
);
assert.throws(
  () => validarEjecucionMigracion({ ...configBase, todos: true, confirmacion: "tenant-a,tenant-b" }),
  /Usá --todos o TENANT_MIGRATION_IDS/,
);

const destinos = [
  { tenantId: "tenant-a", host: "mysql-a.example.com", puerto: 3306, base: "tienda_a", ssl: true },
  { tenantId: "tenant-b", host: "mysql-b.example.com", puerto: 3307, base: "tienda_b", ssl: false },
];
const confirmacionDestinos = construirConfirmacionDestinos(destinos);
const huellaDestinos = construirHuellaConfirmacionDestinos(destinos);
assert.doesNotThrow(() => validarConfirmacionDestinos(confirmacionDestinos, destinos));
assert.doesNotThrow(() => validarConfirmacionDestinos(huellaDestinos, destinos, true));
assert.throws(() => validarConfirmacionDestinos(huellaDestinos, destinos), /destinos mostrados/);
assert.throws(() => validarConfirmacionDestinos(huellaDestinos, [
  ...destinos,
  { tenantId: "tenant-c", host: "mysql-c.example.com", puerto: 3306, base: "tienda_c", ssl: true },
], true), /destinos mostrados/);
assert.deepEqual(ordenarIdsTenant(["tenant-b", "tenant-a"]), ["tenant-a", "tenant-b"]);
assert.throws(() => ordenarIdsTenant(["tenant-a", ""]), /ID vacío/);
assert.throws(() => ordenarIdsTenant(["tenant-a", "tenant-a"]), /IDs repetidos/);
assert.doesNotThrow(() => validarMismoConjuntoTenantIds(
  ["tenant-b", "tenant-a"],
  ["tenant-a", "tenant-b"],
));
assert.throws(() => validarMismoConjuntoTenantIds(
  ["tenant-a", "tenant-b"],
  ["tenant-a", "tenant-c"],
), /cambió durante el preflight/);
assert.throws(
  () => validarConfirmacionDestinos("tenant-a,tenant-b", destinos),
  /destinos mostrados/,
);
assert.throws(
  () => validarConfirmacionDestinos(undefined, destinos),
  /destinos mostrados/,
);

const migracionesConRiesgo = detectarMigracionesConRiesgoDeDatos([
  { nombre: "z_borrar_tabla", contenido: "-- DROP TABLE ignorada\nDROP TABLE `Producto`;" },
  { nombre: "a_modificar_columna", contenido: "ALTER TABLE `Usuario` MODIFY `nombre` VARCHAR(40);" },
  { nombre: "b_comentario", contenido: "/* DELETE FROM Usuario; */\nCREATE INDEX `idx` ON `Usuario` (`id`);" },
  { nombre: "c_borrar_columna", contenido: "ALTER TABLE `Usuario` DROP COLUMN `estado`;" },
]);
assert.deepEqual(migracionesConRiesgo, ["a_modificar_columna", "c_borrar_columna", "z_borrar_tabla"]);
assert.doesNotThrow(() => validarAprobacionMigracionesDestructivas(
  "a_modificar_columna,c_borrar_columna,z_borrar_tabla",
  migracionesConRiesgo,
));
assert.throws(() => validarAprobacionMigracionesDestructivas(undefined, migracionesConRiesgo), /TENANT_MIGRATION_ACK_DESTRUCTIVE/);
assert.throws(() => validarAprobacionMigracionesDestructivas(
  "z_borrar_tabla,a_modificar_columna,c_borrar_columna",
  migracionesConRiesgo,
), /TENANT_MIGRATION_ACK_DESTRUCTIVE/);
assert.throws(() => validarAprobacionMigracionesDestructivas("extra", []), /solo se permite/);

const directorioMigraciones = path.join(process.cwd(), "prisma", "migrations");
const migracionesDelRepositorio = readdirSync(directorioMigraciones, { withFileTypes: true })
  .filter((entrada) => entrada.isDirectory())
  .map((entrada) => ({
    nombre: entrada.name,
    contenido: readFileSync(
      path.join(directorioMigraciones, entrada.name, "migration.sql"),
      "utf8",
    ),
  }));
assert.deepEqual(
  detectarMigracionesConRiesgoDeDatos(migracionesDelRepositorio),
  [
    "20260715030342_add_carousel_limits_to_pageconfig",
    "20260830020000_multitenancy_paso2",
    "20260910000000_eliminar_tablas_surf_y_flags",
  ],
);

const migracionesVersionadas = [
  { nombre: "0_init", checksum: "a1" },
  { nombre: "20260102000000_pedidos", checksum: "b2" },
];
assert.doesNotThrow(() => validarHistorialAntesDeDeploy([], migracionesVersionadas, false, "PROVISIONING"));
assert.throws(
  () => validarHistorialAntesDeDeploy([], migracionesVersionadas, true, "PROVISIONING"),
  /no tiene un historial de migraciones aplicado/,
);
assert.throws(
  () => validarHistorialAntesDeDeploy([], migracionesVersionadas, false, "ACTIVO"),
  /Solo un tenant PROVISIONING/,
);
for (const estado of ["SUSPENDIDO", "INACTIVO"] as const) {
  assert.throws(
    () => validarHistorialAntesDeDeploy([], migracionesVersionadas, false, estado),
    /Solo un tenant PROVISIONING/,
  );
  assert.doesNotThrow(() => validarHistorialAntesDeDeploy([
    { nombre: "0_init", checksum: "a1", finalizada: true, revertida: false },
  ], migracionesVersionadas, true, estado));
}
assert.doesNotThrow(() => validarHistorialAntesDeDeploy([
  { nombre: "0_init", checksum: "a1", finalizada: true, revertida: false },
], migracionesVersionadas, true, "ACTIVO"));
assert.doesNotThrow(() => validarHistorialAntesDeDeploy([
  { nombre: "0_init", checksum: "a1", finalizada: true, revertida: false },
  { nombre: "20260102000000_pedidos", checksum: "b2", finalizada: true, revertida: false },
], migracionesVersionadas, true, "PROVISIONING"));
assert.throws(
  () => validarHistorialAntesDeDeploy([
    { nombre: "0_init", checksum: "checksum-distinto", finalizada: true, revertida: false },
  ], migracionesVersionadas, true, "ACTIVO"),
  /no coincide con un prefijo/,
);
assert.throws(
  () => validarHistorialAntesDeDeploy([
    { nombre: "20260102000000_pedidos", checksum: "b2", finalizada: true, revertida: false },
  ], migracionesVersionadas, true, "ACTIVO"),
  /no coincide con un prefijo/,
);
assert.throws(
  () => validarHistorialAntesDeDeploy([
    { nombre: "migracion-desconocida", checksum: "c3", finalizada: true, revertida: false },
  ], migracionesVersionadas, true, "ACTIVO"),
  /no coincide con un prefijo/,
);
assert.throws(
  () => validarHistorialAntesDeDeploy([
    { nombre: "0_init", checksum: "a1", finalizada: true, revertida: false },
    { nombre: "0_init", checksum: "a1", finalizada: true, revertida: false },
  ], migracionesVersionadas, true, "ACTIVO"),
  /no coincide con un prefijo/,
);
assert.throws(
  () => validarHistorialAntesDeDeploy([
    { nombre: "0_init", checksum: "a1", finalizada: false, revertida: false },
  ], migracionesVersionadas, true, "PROVISIONING"),
  /migración incompleta/,
);
assert.doesNotThrow(() => validarHistorialAntesDeDeploy([
  { nombre: "0_init", checksum: "a1", finalizada: false, revertida: true },
], migracionesVersionadas, false, "PROVISIONING"));
assert.throws(
  () => validarHistorialAntesDeDeploy([
    { nombre: "0_init", checksum: "a1", finalizada: true, revertida: false },
  ], migracionesVersionadas, false, "PROVISIONING"),
  /no contiene objetos persistentes/,
);

console.log("Migraciones: selección por IDs o flota completa, destinos, baseline, historial, estados y opt-in productivo verificados.");
