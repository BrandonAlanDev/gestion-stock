import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { cifrarRegistroLocal } from "../src/lib/tenants/registry/cifrado-registro-local";

interface TenantFixture {
  id: string;
  nombre: string;
  slug: string;
  dominio: string;
  dominios: string[];
  estado: "ACTIVO";
  referenciaBase: string;
  versionCredenciales: string;
}

interface ConexionFixture {
  host: string;
  puerto: number;
  usuario: string;
  contrasena: string;
  base: string;
  ssl: true;
}

interface RegistroFixture {
  version: 1;
  tenants: TenantFixture[];
  conexiones: Record<string, ConexionFixture>;
}

function crearTenant(id: string, sufijo: string): TenantFixture {
  return {
    id,
    nombre: `Tienda ${sufijo}`,
    slug: `tienda-${sufijo}`,
    dominio: `tienda-${sufijo}.example.test`,
    dominios: [`tienda-${sufijo}.example.test`],
    estado: "ACTIVO",
    referenciaBase: `mysql/${id}`,
    versionCredenciales: "v1",
  };
}

function crearConexion(sufijo: string): ConexionFixture {
  return {
    host: `mysql-${sufijo}.example.test`,
    puerto: 3306,
    usuario: `usuario-${sufijo}`,
    contrasena: `secreto-ficticio-${sufijo}`,
    base: `tienda_${sufijo}`,
    ssl: true,
  };
}

function crearRegistroFixture(incluirTercero: boolean): RegistroFixture {
  const sufijos = incluirTercero ? ["a", "b", "c"] : ["a", "b"];
  const tenants = sufijos.map((sufijo) => crearTenant(`tenant-${sufijo}`, sufijo));
  const conexiones = Object.fromEntries(sufijos.map((sufijo) => [
    `mysql/tenant-${sufijo}`,
    crearConexion(sufijo),
  ]));
  return { version: 1, tenants, conexiones };
}

function ejecutarRunner(
  entorno: NodeJS.ProcessEnv,
  argumentos: string[],
): { status: number | null; salida: string; error: Error | undefined } {
  const resultado = spawnSync(process.execPath, [
    "--conditions=react-server",
    "./node_modules/ts-node/dist/bin.js",
    "--project",
    "tsconfig.scripts.json",
    "scripts/migrar-silos-tenant.ts",
    ...argumentos,
  ], {
    cwd: process.cwd(),
    env: entorno,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 10 * 1024 * 1024,
  });
  return {
    status: resultado.status,
    salida: `${resultado.stdout ?? ""}${resultado.stderr ?? ""}`,
    error: resultado.error,
  };
}

async function escribirRegistro(
  ruta: string,
  registro: RegistroFixture,
  clave: string,
): Promise<void> {
  await writeFile(
    ruta,
    `${cifrarRegistroLocal(JSON.stringify(registro), clave)}\n`,
    { encoding: "utf8" },
  );
}

async function main(): Promise<void> {
  const temporal = await mkdtemp(path.join(os.tmpdir(), "gestion-stock-plan-migracion-"));
  const rutaRegistro = path.join(temporal, "registro.enc.json");
  const rutaDotenv = path.join(temporal, "dotenv-vacio");
  const clave = randomBytes(32).toString("hex");

  try {
    await writeFile(rutaDotenv, "", { encoding: "utf8", flag: "wx" });
    await escribirRegistro(rutaRegistro, crearRegistroFixture(false), clave);
    const entorno: NodeJS.ProcessEnv = {
      ...process.env,
      NODE_ENV: "development",
      DATABASE_URL: "mysql://disabled:disabled@127.0.0.1:1/no_database_selected",
      DOTENV_CONFIG_PATH: rutaDotenv,
      TENANT_REGISTRY_FILE: rutaRegistro,
      TENANT_REGISTRY_ENCRYPTION_KEY: clave,
      TENANT_MIGRATION_MODE: "1",
      TENANT_MIGRATION_IDS: undefined,
      TENANT_MIGRATION_CONFIRM: "TODOS",
      TENANT_MIGRATION_CONFIRM_TARGETS: undefined,
      TENANT_MIGRATION_REGISTRY_FROZEN_ACK: undefined,
      TENANT_MIGRATION_BASELINE_RECONCILED: "1",
      TENANT_MIGRATION_ALLOW_PRODUCTION: undefined,
    };

    const plan = ejecutarRunner(entorno, ["--todos", "--planificar"]);
    assert.equal(plan.error, undefined, plan.salida);
    assert.equal(plan.status, 0, plan.salida);
    assert.match(plan.salida, /Selección completa: 2 tenants \(tenant-a,tenant-b\)/);
    assert.match(plan.salida, /tenant-a@mysql-a\.example\.test:3306\/tienda_a/);
    assert.match(plan.salida, /tenant-b@mysql-b\.example\.test:3306\/tienda_b/);
    assert.match(plan.salida, /Huella de destinos: sha256:[0-9a-f]{64}/);
    assert.doesNotMatch(plan.salida, /secreto-ficticio/);

    const huella = plan.salida.match(/Huella de destinos: (sha256:[0-9a-f]{64})/)?.[1];
    assert.ok(huella, "el plan debe imprimir una huella de destino");
    await escribirRegistro(rutaRegistro, crearRegistroFixture(true), clave);
    const planObsoleto = ejecutarRunner({
      ...entorno,
      TENANT_MIGRATION_CONFIRM_TARGETS: huella,
      TENANT_MIGRATION_REGISTRY_FROZEN_ACK: "1",
    }, ["--todos"]);
    assert.notEqual(planObsoleto.status, 0, planObsoleto.salida);
    assert.match(planObsoleto.salida, /TENANT_MIGRATION_CONFIRM_TARGETS/);
    assert.doesNotMatch(planObsoleto.salida, /Preflight tenant|Aplicando migraciones/);

    console.log("Plan --todos: lista completa, huella de destinos, ausencia de secretos y rechazo de plan obsoleto verificados sin conectar a MySQL.");
  } finally {
    await rm(temporal, { recursive: true, force: true });
  }
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
