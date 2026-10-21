import assert from "node:assert/strict";
import { conPrismaTenant } from "../src/lib/prisma";
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

async function verificarCachePersistenteEInvalidacion(): Promise<void> {
  const demo = crearEntrada("tenant-cache", "cache.example.com");
  const directo = crearEntrada("tenant-directo", "directo.example.com");
  let ahora = 100;
  let consultasHost = 0;
  let consultasId = 0;
  const origen = crearProveedor({
    async resolverPorHostname() {
      consultasHost += 1;
      return demo;
    },
    async resolverPorId(tenantId) {
      consultasId += 1;
      return tenantId === directo.tenant.id ? directo : demo;
    },
  });
  const cache = new ProveedorRegistroCacheado(origen, 30, () => ahora);

  await cache.resolverPorHostname("cache.example.com");
  await cache.resolverPorHostname("CACHE.EXAMPLE.COM:443");
  await cache.resolverPorId(demo.tenant.id);
  await cache.resolverPorId(directo.tenant.id);
  assert.equal(consultasHost, 1, "La caché debe normalizar claves y reutilizar metadata");
  assert.equal(consultasId, 1, "Resolver el dominio debe servir también para buscar el mismo ID");

  ahora += 31;
  await cache.resolverPorHostname("cache.example.com");
  await cache.resolverPorId(demo.tenant.id);
  await cache.resolverPorId(directo.tenant.id);
  assert.equal(consultasHost, 2, "Un dominio válido debe revalidarse al vencer");
  assert.equal(consultasId, 2, "Una referencia válida debe revalidarse al vencer");

  cache.invalidar();
  await cache.resolverPorHostname("cache.example.com");
  await cache.resolverPorId(demo.tenant.id);
  await cache.resolverPorId(directo.tenant.id);
  assert.equal(consultasHost, 3, "La invalidación debe forzar una consulta nueva");
  assert.equal(consultasId, 3);

  let consultasDesconocido = 0;
  const desconocido = new ProveedorRegistroCacheado(crearProveedor({
    async resolverPorHostname() {
      consultasDesconocido += 1;
      return null;
    },
  }), 30, () => ahora);
  await desconocido.resolverPorHostname("nuevo.example.com");
  await desconocido.resolverPorHostname("nuevo.example.com");
  assert.equal(consultasDesconocido, 1);
  ahora += 31;
  await desconocido.resolverPorHostname("nuevo.example.com");
  assert.equal(consultasDesconocido, 2, "Un dominio desconocido debe reconsultarse");
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

async function verificarCredencialesCacheadas(): Promise<void> {
  let consultas = 0;
  const cache = new ProveedorRegistroCacheado(crearProveedor({
    async resolverCredenciales() {
      consultas += 1;
      return { ...CREDENCIALES };
    },
  }));

  const primera = await cache.resolverCredenciales("mysql/demo", "v1", "tenant-demo");
  primera.base = "alterada";
  assert.equal((await cache.resolverCredenciales("mysql/demo", "v1", "tenant-demo")).base, CREDENCIALES.base);
  assert.equal(consultas, 1, "Las credenciales validadas deben reutilizarse por identidad de conexión");
  await cache.resolverCredenciales("mysql/demo", "v2", "tenant-demo");
  assert.equal(consultas, 2, "Una versión nueva debe consultar credenciales nuevas");
  cache.invalidar();
  await cache.resolverCredenciales("mysql/demo", "v1", "tenant-demo");
  assert.equal(consultas, 3, "La invalidación debe descartar las credenciales");
}

async function verificarEstadoHastaInvalidacion(): Promise<void> {
  let ahora = 100;
  let consultas = 0;
  let suspendido = false;
  const cache = new ProveedorRegistroCacheado(crearProveedor({
    async verificarAcceso() {
      consultas += 1;
      if (suspendido) throw new Error("tenant suspendido");
      return 7;
    },
  }), 30_000, () => ahora);

  assert.deepEqual(await Promise.all([
    cache.verificarAcceso("cliente-a"),
    cache.verificarAcceso("cliente-a"),
  ]), [7, 7]);
  assert.equal(consultas, 1, "Las consultas simultáneas al estado deben compartir solicitud");
  suspendido = true;
  assert.equal(await cache.verificarAcceso("cliente-a"), 7);
  ahora += 5_001;
  assert.equal(await cache.verificarAcceso("cliente-a"), 7);
  assert.equal(consultas, 1, "El estado confirmado debe persistir dentro del plazo");
  ahora += 25_000;
  await assert.rejects(cache.verificarAcceso("cliente-a"), /tenant suspendido/);
  assert.equal(consultas, 2, "La suspensión debe detectarse al vencer el estado cacheado");
  cache.invalidar();
  await assert.rejects(cache.verificarAcceso("cliente-a"), /tenant suspendido/);
  assert.equal(consultas, 3, "La invalidación debe volver a consultar el estado");
  await assert.rejects(cache.verificarAcceso("cliente-a"), /tenant suspendido/);
  assert.equal(consultas, 4, "Un fallo de estado no debe quedar cacheado como activo");
}

async function verificarInvalidacionDuranteConsultaDeEstado(): Promise<void> {
  const anterior = diferida<number>();
  let consultas = 0;
  const cache = new ProveedorRegistroCacheado(crearProveedor({
    verificarAcceso() {
      consultas += 1;
      return consultas === 1 ? anterior.promesa : Promise.resolve(9);
    },
  }));

  const pendiente = cache.verificarAcceso("tenant-estado");
  cache.invalidar();
  anterior.resolver(8);
  assert.equal(await pendiente, 9, "Una consulta invalidada debe devolver el estado nuevo");
  assert.equal(consultas, 2);
  assert.equal(await cache.verificarAcceso("tenant-estado"), 9);
  assert.equal(consultas, 2, "El estado nuevo debe quedar cacheado");
}

async function verificarNavegacionSinConsultasRepetidas(): Promise<void> {
  const entrada = crearEntrada("tenant-navegacion", "navegacion.example.com");
  let ahora = 100;
  const consultas = { dominio: 0, id: 0, estado: 0, credenciales: 0 };
  const cache = new ProveedorRegistroCacheado(crearProveedor({
    async resolverPorHostname() { consultas.dominio += 1; return entrada; },
    async resolverPorId() { consultas.id += 1; return entrada; },
    async verificarAcceso() { consultas.estado += 1; return 1; },
    async resolverCredenciales() { consultas.credenciales += 1; return { ...CREDENCIALES }; },
  }), 30, () => ahora);

  for (const salto of [0, 60_000, 3_600_000]) {
    ahora += salto;
    await cache.resolverPorHostname(entrada.dominios[0]);
    await cache.resolverPorId(entrada.tenant.id);
    await cache.verificarAcceso(entrada.tenant.id);
    await cache.resolverCredenciales(entrada.referenciaBase, entrada.versionCredenciales, entrada.tenant.id);
  }
  assert.deepEqual(consultas, { dominio: 3, id: 0, estado: 3, credenciales: 1 });
}

async function verificarEstadoConfirmadoPorDominio(): Promise<void> {
  let ahora = 0;
  let version = 4;
  let suspendido = false;
  let consultasEstado = 0;
  const cache = new ProveedorRegistroCacheado(crearProveedor({
    async resolverPorHostname() {
      return {
        ...crearEntrada("tenant-dominio", "dominio.example.com", suspendido ? "SUSPENDIDO" : "ACTIVO"),
        versionCache: version,
      };
    },
    async verificarAcceso() {
      consultasEstado += 1;
      if (suspendido) throw new Error("tenant suspendido");
      return version;
    },
  }), 30, () => ahora);

  await cache.resolverPorHostname("dominio.example.com");
  assert.equal(await cache.verificarAcceso("tenant-dominio"), 4);
  assert.equal(consultasEstado, 0, "La resolución vigente ya confirmó el estado en Core");

  ahora = 31;
  version = 5;
  await cache.resolverPorHostname("dominio.example.com");
  assert.equal(await cache.verificarAcceso("tenant-dominio"), 5);
  assert.equal(consultasEstado, 0, "La versión nueva se reutiliza sin otra lectura");

  ahora = 62;
  suspendido = true;
  await cache.resolverPorHostname("dominio.example.com");
  await assert.rejects(cache.verificarAcceso("tenant-dominio"), /tenant suspendido/);
  assert.equal(consultasEstado, 1, "Una suspensión no debe reutilizar el estado activo anterior");
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
  let consultasId = 0;
  const registro = configurarProveedorRegistroTenant(crearProveedor({
    async resolverPorId() {
      consultasId += 1;
      return demo;
    },
    async resolverCredenciales() { throw new Error("credenciales no disponibles"); },
  }));
  await assert.rejects(
    conPrismaTenant(demo.tenant.id, async () => {
      operacionEjecutada = true;
    }),
    /No se pudo completar la operación/,
  );
  assert.equal(operacionEjecutada, false, "Sin credenciales no debe ejecutarse una consulta comercial");
  await registro.resolverPorId(demo.tenant.id);
  assert.equal(consultasId, 2, "Un fallo al abrir la conexión debe refrescar los metadatos");
}

async function main(): Promise<void> {
  await verificarNormalizacionYResolucion();
  await verificarCachePersistenteEInvalidacion();
  await verificarSingleFlight();
  await verificarInvalidacionDuranteCarga();
  await verificarValidacionDeRespuestasYFallos();
  await verificarCredencialesCacheadas();
  await verificarEstadoHastaInvalidacion();
  await verificarInvalidacionDuranteConsultaDeEstado();
  await verificarNavegacionSinConsultasRepetidas();
  await verificarEstadoConfirmadoPorDominio();
  await verificarFallosSinFallback();
  console.log("Registro tenant: dominios, estados, caché, invalidación y fallos verificados.");
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
