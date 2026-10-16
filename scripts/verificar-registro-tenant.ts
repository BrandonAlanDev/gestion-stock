import assert from "node:assert/strict";
import { conPrismaTenant } from "../src/lib/tenants/prisma-factory";
import { normalizarHostname } from "../src/lib/tenants/normalizar-hostname";
import { construirOrigenSolicitud } from "../src/lib/tenants/construir-origen-solicitud";
import { ProveedorRegistroCacheado } from "../src/lib/tenants/registry/proveedor-cacheado";
import { configurarProveedorRegistroTenant } from "../src/lib/tenants/registry/proveedor-registro";
import type {
  CredencialesBaseTenant,
  TenantRegistryEntry,
  TenantRegistryProvider,
} from "../src/lib/tenants/registry/types";

const CREDENCIALES: CredencialesBaseTenant = {
  host: "mysql.test.local",
  puerto: 3306,
  usuario: "usuario-test",
  contrasena: "",
  base: "tenant_test",
  ssl: false,
};

function crearEntrada(
  id: string,
  hostname: string,
  estado: TenantRegistryEntry["tenant"]["estado"] = "ACTIVO",
): TenantRegistryEntry {
  return {
    tenant: {
      id,
      nombre: `Tienda ${id}`,
      slug: id,
      dominio: hostname,
      estado,
    },
    dominios: [hostname],
    referenciaBase: `mysql/${id}`,
    versionCredenciales: "v1",
  };
}

function crearProveedor(
  opciones: Partial<TenantRegistryProvider> = {},
): TenantRegistryProvider {
  return {
    async resolverPorHostname() { return null; },
    async resolverPorId() { return null; },
    async resolverCredenciales() { return { ...CREDENCIALES }; },
    async listarTenants() { return []; },
    ...opciones,
  };
}

function diferida<T>() {
  let resolver!: (valor: T) => void;
  const promesa = new Promise<T>((resolve) => { resolver = resolve; });
  return { promesa, resolver };
}

async function verificarNormalizacionYResolucion(): Promise<void> {
  assert.equal(normalizarHostname(" Demo.Logabyte.com.ar:3000 "), "demo.logabyte.com.ar");
  assert.equal(normalizarHostname("demo.logabyte.com.ar, otro.example"), null);
  assert.equal(normalizarHostname("demo.logabyte.com.ar:70000"), null);
  assert.equal(normalizarHostname("demo.logabyte.com.ar.."), null);
  assert.equal(construirOrigenSolicitud("demo.logabyte.com.ar", true), "https://demo.logabyte.com.ar");
  assert.equal(construirOrigenSolicitud("demo.logabyte.com.ar:443", true), "https://demo.logabyte.com.ar");
  assert.equal(construirOrigenSolicitud("demo.logabyte.com.ar:8443", true), null);
  assert.equal(construirOrigenSolicitud("demo.localhost:3000", false), "http://demo.localhost:3000");
  assert.equal(construirOrigenSolicitud("[::1]:3000", false), "http://[::1]:3000");

  const demo = crearEntrada("tenant-demo", "demo.logabyte.com.ar");
  const suspendido = crearEntrada("tenant-suspendido", "suspendido.logabyte.com.ar", "SUSPENDIDO");
  let consultas = 0;
  const registro = configurarProveedorRegistroTenant(crearProveedor({
    async resolverPorHostname(hostname) {
      consultas += 1;
      return [demo, suspendido].find((entry) => entry.dominios.includes(hostname)) ?? null;
    },
    async resolverPorId(tenantId) {
      return [demo, suspendido].find((entry) => entry.tenant.id === tenantId) ?? null;
    },
  }));

  assert.equal((await registro.resolverPorHostname("DEMO.LOGABYTE.COM.AR:443"))?.tenant.id, demo.tenant.id);
  assert.equal((await registro.resolverPorHostname("desconocido.logabyte.com.ar")), null);
  assert.equal((await registro.resolverPorHostname("demo.logabyte.com.ar, suspendido.logabyte.com.ar")), null);
  assert.equal(consultas, 2, "Un Host ambiguo no debe llegar al registro");

  await assert.rejects(
    conPrismaTenant(suspendido.tenant.id, async () => "nunca ejecutado"),
    /organización no está disponible/,
  );
  await assert.rejects(
    conPrismaTenant("tenant-inexistente", async () => "nunca ejecutado"),
    /organización no está disponible/,
  );
}

async function verificarCacheTtlEInvalidacion(): Promise<void> {
  const demo = crearEntrada("tenant-cache", "cache.example.com");
  let ahora = 100;
  let consultas = 0;
  const origen = crearProveedor({
    async resolverPorHostname() {
      consultas += 1;
      return demo;
    },
  });
  const cache = new ProveedorRegistroCacheado(origen, 30, () => ahora);

  await cache.resolverPorHostname("cache.example.com");
  await cache.resolverPorHostname("CACHE.EXAMPLE.COM:443");
  assert.equal(consultas, 1, "La caché debe normalizar claves y reutilizar metadata");

  ahora += 31;
  await cache.resolverPorHostname("cache.example.com");
  assert.equal(consultas, 2, "La entrada debe recargarse al vencer el TTL");

  cache.invalidar();
  await cache.resolverPorHostname("cache.example.com");
  assert.equal(consultas, 3, "La invalidación debe forzar una consulta nueva");
}

async function verificarSingleFlight(): Promise<void> {
  const carga = diferida<TenantRegistryEntry | null>();
  let consultas = 0;
  const cache = new ProveedorRegistroCacheado(crearProveedor({
    resolverPorHostname() {
      consultas += 1;
      return carga.promesa;
    },
  }));

  const primera = cache.resolverPorHostname("unico.example.com");
  const segunda = cache.resolverPorHostname("UNICO.EXAMPLE.COM");
  assert.equal(consultas, 1, "Las cargas concurrentes deben compartir una sola consulta");
  carga.resolver(crearEntrada("tenant-unico", "unico.example.com"));
  const resultados = await Promise.all([primera, segunda]);
  assert.deepEqual(resultados.map((entry) => entry?.tenant.id), ["tenant-unico", "tenant-unico"]);
}

async function verificarInvalidacionDuranteCarga(): Promise<void> {
  const cargaAnterior = diferida<TenantRegistryEntry | null>();
  const nueva = crearEntrada("tenant-nuevo", "cambio.example.com");
  let consultas = 0;
  const cache = new ProveedorRegistroCacheado(crearProveedor({
    resolverPorHostname() {
      consultas += 1;
      return consultas === 1 ? cargaAnterior.promesa : Promise.resolve(nueva);
    },
  }));

  const resultadoPendiente = cache.resolverPorHostname("cambio.example.com");
  cache.invalidar();
  cargaAnterior.resolver(crearEntrada("tenant-viejo", "cambio.example.com"));

  assert.equal((await resultadoPendiente)?.tenant.id, "tenant-nuevo");
  assert.equal(consultas, 2, "Una carga invalidada no debe devolver ni guardar metadata obsoleta");
}

async function verificarValidacionDeRespuestasYFallos(): Promise<void> {
  const dominioIncorrecto = new ProveedorRegistroCacheado(crearProveedor({
    async resolverPorHostname() {
      return crearEntrada("tenant-otro", "otro.example.com");
    },
  }));
  await assert.rejects(
    dominioIncorrecto.resolverPorHostname("pedido.example.com"),
    /dominio a un tenant distinto/,
  );

  const idIncorrecto = new ProveedorRegistroCacheado(crearProveedor({
    async resolverPorId() {
      return crearEntrada("tenant-distinto", "id.example.com");
    },
  }));
  await assert.rejects(idIncorrecto.resolverPorId("tenant-esperado"), /ID a un tenant distinto/);

  const fallo = new ProveedorRegistroCacheado(crearProveedor({
    async resolverPorHostname() { throw new Error("directorio no disponible"); },
  }));
  await assert.rejects(fallo.resolverPorHostname("fallo.example.com"), /directorio no disponible/);
}

async function verificarCredencialesNoCacheadas(): Promise<void> {
  let consultas = 0;
  const cache = new ProveedorRegistroCacheado(crearProveedor({
    async resolverCredenciales() {
      consultas += 1;
      return { ...CREDENCIALES };
    },
  }));

  await cache.resolverCredenciales("mysql/demo", "v1");
  await cache.resolverCredenciales("mysql/demo", "v1");
  assert.equal(consultas, 2, "Las credenciales no deben guardarse en la caché de metadata");
}

async function verificarFallosSinFallback(): Promise<void> {
  let operacionEjecutada = false;
  configurarProveedorRegistroTenant(crearProveedor({
    async resolverPorId() {
      throw new Error("registro central no disponible");
    },
  }));
  await assert.rejects(
    conPrismaTenant("tenant-error-registro", async () => {
      operacionEjecutada = true;
    }),
    /registro central no disponible/,
  );
  assert.equal(operacionEjecutada, false, "Una caída del registro no debe usar una base alternativa");

  const demo = crearEntrada("tenant-error-credenciales", "error-credenciales.example.com");
  configurarProveedorRegistroTenant(crearProveedor({
    async resolverPorId() { return demo; },
    async resolverCredenciales() { throw new Error("credenciales no disponibles"); },
  }));
  await assert.rejects(
    conPrismaTenant(demo.tenant.id, async () => {
      operacionEjecutada = true;
    }),
    /No se pudo completar la operación/,
  );
  assert.equal(operacionEjecutada, false, "Sin credenciales no debe ejecutarse una consulta comercial");
}

async function main(): Promise<void> {
  await verificarNormalizacionYResolucion();
  await verificarCacheTtlEInvalidacion();
  await verificarSingleFlight();
  await verificarInvalidacionDuranteCarga();
  await verificarValidacionDeRespuestasYFallos();
  await verificarCredencialesNoCacheadas();
  await verificarFallosSinFallback();
  console.log("Registro tenant: dominios, estados, caché, invalidación y fallos verificados.");
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
