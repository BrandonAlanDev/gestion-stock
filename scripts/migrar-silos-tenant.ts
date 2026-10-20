import "dotenv/config";

import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { obtenerProveedorRegistroTenant } from "../src/lib/tenants/registry/proveedor-registro";
import type {
  CredencialesBaseTenant,
  TenantRegistryEntry,
} from "../src/lib/tenants/registry/types";
import { construirUrlMysql } from "./tenants/crear-url-mysql";
import {
  construirConfirmacionDestinos,
  construirHuellaConfirmacionDestinos,
  ordenarIdsTenant,
  validarConfirmacionDestinos,
  validarEjecucionMigracion,
  validarMismoConjuntoTenantIds,
} from "./tenants/validar-migracion";
import {
  inspeccionarHistorialMigracionTenant,
} from "./tenants/inspeccionar-historial-migracion";
import type {
  EstadoTenantMigrable,
  MigracionVersionada,
} from "./tenants/comparar-migraciones";
import {
  detectarMigracionesConRiesgoDeDatos,
  validarAprobacionMigracionesDestructivas,
} from "./tenants/migraciones-destructivas";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";

const requireDesdeProyecto = createRequire(path.join(process.cwd(), "package.json"));
const rutaPaquetePrisma = requireDesdeProyecto.resolve("prisma/package.json");
const prismaCli = path.join(path.dirname(rutaPaquetePrisma), "build", "index.js");

interface MigracionVersionadaConContenido extends MigracionVersionada {
  contenido: string;
}

function obtenerIdsSeleccionados(): string[] {
  const valor = process.env.TENANT_MIGRATION_IDS ?? "";
  return valor.trim() ? valor.split(",").map((id) => id.trim()) : [];
}

function validarEjecucion(ids: string[], todos: boolean, planificacion: boolean): void {
  validarEjecucionMigracion({
    ids,
    todos,
    planificacion,
    modo: process.env.TENANT_MIGRATION_MODE,
    confirmacion: process.env.TENANT_MIGRATION_CONFIRM,
    registroCongeladoAck: process.env.TENANT_MIGRATION_REGISTRY_FROZEN_ACK,
    baselineReconciliada: process.env.TENANT_MIGRATION_BASELINE_RECONCILED,
    nodeEnv: process.env.NODE_ENV,
    permitirProduccion: process.env.TENANT_MIGRATION_ALLOW_PRODUCTION,
  });
}

function validarDestinosUnicos(
  tenants: Array<{ entry: TenantRegistryEntry; credenciales: CredencialesBaseTenant }>,
): void {
  const destinos = new Set<string>();
  for (const { entry, credenciales } of tenants) {
    const destino = `${credenciales.host.toLowerCase()}:${credenciales.puerto}/${credenciales.base.toLowerCase()}`;
    if (destinos.has(destino)) {
      throw new Error(`Dos IDs seleccionados resuelven a la misma base: ${entry.tenant.id}`);
    }
    destinos.add(destino);
  }
}

function validarEstadoTenant(entry: TenantRegistryEntry): EstadoTenantMigrable {
  if (entry.tenant.estado === "ERROR") {
    throw new Error(`Tenant no disponible para migración: ${entry.tenant.id}`);
  }
  return entry.tenant.estado;
}

async function resolverDestinoConfirmado(
  registro: ReturnType<typeof obtenerProveedorRegistroTenant>,
  tenantId: string,
  destinoConfirmado: {
    tenantId: string;
    host: string;
    puerto: number;
    base: string;
    ssl: boolean;
  },
): Promise<{
  entry: TenantRegistryEntry;
  credenciales: CredencialesBaseTenant;
  estado: EstadoTenantMigrable;
}> {
  registro.invalidar();
  const entry = await registro.resolverPorId(tenantId);
  if (!entry || entry.tenant.id !== tenantId) {
    throw new Error(`El registro no devolvió el tenant seleccionado: ${tenantId}`);
  }
  const estado = validarEstadoTenant(entry);
  const credenciales = await registro.resolverCredenciales(
    entry.referenciaBase,
    entry.versionCredenciales,
    entry.tenant.id,
  );
  const destinoActual = {
    tenantId,
    host: credenciales.host,
    puerto: credenciales.puerto,
    base: credenciales.base,
    ssl: credenciales.ssl,
  };
  validarConfirmacionDestinos(
    construirConfirmacionDestinos([destinoConfirmado]),
    [destinoActual],
  );
  return { entry, credenciales, estado };
}

async function obtenerMigracionesVersionadas(): Promise<MigracionVersionadaConContenido[]> {
  const directorio = path.join(process.cwd(), "prisma", "migrations-base-unica");
  const entradas = await readdir(directorio, { withFileTypes: true });
  const nombres = entradas
    .filter((entrada) => entrada.isDirectory())
    .map((entrada) => entrada.name)
    .sort();
  return Promise.all(nombres.map(async (nombre) => {
    const contenido = await readFile(path.join(directorio, nombre, "migration.sql"), "utf8");
    return {
      nombre,
      checksum: createHash("sha256").update(contenido).digest("hex"),
      contenido,
    };
  }));
}

async function main(): Promise<void> {
  const todos = process.argv.includes("--todos");
  const idsConfigurados = obtenerIdsSeleccionados();
  const planificacion = process.argv.includes("--planificar");
  if (todos && idsConfigurados.length > 0) {
    throw new Error("Usá --todos o TENANT_MIGRATION_IDS, pero no ambos");
  }
  const ids = todos ? [] : idsConfigurados;
  validarEjecucion(ids, todos, planificacion);
  const registro = obtenerProveedorRegistroTenant();
  let tenants: Array<{ entry: TenantRegistryEntry; credenciales: CredencialesBaseTenant }>;
  let idsSeleccionados: string[];
  if (todos) {
    registro.invalidar();
    const listado = await registro.listarTenants();
    idsSeleccionados = ordenarIdsTenant(listado.map(({ tenant }) => tenant.id));
    if (idsSeleccionados.length === 0) throw new Error("El registro no tiene tenants para migrar");
    const porId = new Map(listado.map((entry) => [entry.tenant.id, entry]));
    tenants = await Promise.all(idsSeleccionados.map(async (id) => {
      const entry = porId.get(id);
      if (!entry) throw new Error(`El registro no devolvió el tenant seleccionado: ${id}`);
      validarEstadoTenant(entry);
      const credenciales = await registro.resolverCredenciales(
        entry.referenciaBase,
        entry.versionCredenciales,
        entry.tenant.id,
      );
      return { entry, credenciales };
    }));
  } else {
    idsSeleccionados = ids;
    tenants = await Promise.all(idsSeleccionados.map(async (id) => {
      const entry = await registro.resolverPorId(id);
      if (!entry || entry.tenant.id !== id) {
        throw new Error(`Tenant no disponible para migración: ${id}`);
      }
      validarEstadoTenant(entry);
      const credenciales = await registro.resolverCredenciales(
        entry.referenciaBase,
        entry.versionCredenciales,
        entry.tenant.id,
      );
      return { entry, credenciales };
    }));
  }

  validarDestinosUnicos(tenants);

  const destinos = tenants.map(({ entry, credenciales }) => ({
    tenantId: entry.tenant.id,
    host: credenciales.host,
    puerto: credenciales.puerto,
    base: credenciales.base,
    ssl: credenciales.ssl,
  }));
  const confirmacionEsperada = construirConfirmacionDestinos(destinos);
  const migracionesVersionadas = await obtenerMigracionesVersionadas();
  const migracionesConRiesgoEnRepositorio = detectarMigracionesConRiesgoDeDatos(
    migracionesVersionadas,
  );
  if (todos) {
    console.log(`Selección completa: ${idsSeleccionados.length} tenants (${idsSeleccionados.join(",")})`);
    console.log("Confirmación de selección: TENANT_MIGRATION_CONFIRM=TODOS");
    console.log(`Huella de destinos: ${construirHuellaConfirmacionDestinos(destinos)}`);
  }
  console.log(`Destinos resueltos (sin credenciales): ${confirmacionEsperada}`);
  if (planificacion) {
    console.log(
      migracionesConRiesgoEnRepositorio.length > 0
        ? `Migraciones versionadas que requieren revisión de datos si están pendientes: ${migracionesConRiesgoEnRepositorio.join(",")}`
        : "No hay migraciones versionadas con operaciones que puedan reducir datos.",
    );
    console.log("Plan de solo lectura; no se ejecutaron migraciones.");
    return;
  }
  validarConfirmacionDestinos(
    process.env.TENANT_MIGRATION_CONFIRM_TARGETS,
    destinos,
    todos,
  );
  const destinosPorTenant = new Map(destinos.map((destino) => [destino.tenantId, destino]));
  const estadoPreflightPorTenant = new Map<string, {
    estado: EstadoTenantMigrable;
    migracionesAplicadas: number;
  }>();

  for (const { entry: entradaInicial } of tenants) {
    const tenantId = entradaInicial.tenant.id;
    const destinoConfirmado = destinosPorTenant.get(tenantId);
    if (!destinoConfirmado) throw new Error(`No hay destino confirmado para el tenant ${tenantId}`);
    const { credenciales, estado } = await resolverDestinoConfirmado(
      registro,
      tenantId,
      destinoConfirmado,
    );
    const preflight = await inspeccionarHistorialMigracionTenant(
      credenciales,
      migracionesVersionadas,
    );
    estadoPreflightPorTenant.set(tenantId, {
      estado,
      migracionesAplicadas: preflight.migracionesAplicadas,
    });
    console.log(
      `Preflight tenant ${tenantId}: ${preflight.migracionesAplicadas} migraciones aplicadas y ${preflight.objetosPersistentes} objetos persistentes.`,
    );
  }

  const migracionesDestructivasPendientes = new Set<string>();
  for (const { entry } of tenants) {
    const preflight = estadoPreflightPorTenant.get(entry.tenant.id);
    if (!preflight) throw new Error(`No existe el preflight del tenant ${entry.tenant.id}`);
    for (const migracion of detectarMigracionesConRiesgoDeDatos(
      migracionesVersionadas.slice(preflight.migracionesAplicadas),
    )) {
      migracionesDestructivasPendientes.add(migracion);
    }
  }
  const nombresDestructivosPendientes = [...migracionesDestructivasPendientes].sort(
    (a, b) => a < b ? -1 : a > b ? 1 : 0,
  );
  if (nombresDestructivosPendientes.length > 0) {
    console.log(
      `Migraciones pendientes con operaciones que pueden reducir datos: ${nombresDestructivosPendientes.join(",")}`,
    );
  }
  validarAprobacionMigracionesDestructivas(
    process.env.TENANT_MIGRATION_ACK_DESTRUCTIVE,
    nombresDestructivosPendientes,
  );

  if (todos) {
    registro.invalidar();
    const idsActuales = ordenarIdsTenant(
      (await registro.listarTenants()).map(({ tenant }) => tenant.id),
    );
    validarMismoConjuntoTenantIds(idsSeleccionados, idsActuales);
  }

  for (const { entry: entradaInicial } of tenants) {
    const tenantId = entradaInicial.tenant.id;
    const destinoConfirmado = destinosPorTenant.get(tenantId);
    if (!destinoConfirmado) throw new Error(`No hay destino confirmado para el tenant ${tenantId}`);
    const { credenciales, estado } = await resolverDestinoConfirmado(
      registro,
      tenantId,
      destinoConfirmado,
    );
    if (estado !== estadoPreflightPorTenant.get(tenantId)?.estado) {
      throw new Error(`El estado del tenant cambió después del preflight: ${tenantId}`);
    }

    console.log(`Aplicando migraciones versionadas al tenant ${tenantId}`);
    const env = {
      ...process.env,
      LOGABYTE_CORE_SELECTED_DATABASE_URL: construirUrlMysql(credenciales),
    };
    execFileSync(process.execPath, [prismaCli, "migrate", "deploy"], {
      cwd: process.cwd(),
      env,
      stdio: "inherit",
      windowsHide: true,
    });
    console.log(`Migraciones aplicadas al tenant ${tenantId}`);
  }
}

void main().then(() => process.exit(0)).catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exit(1);
});
