import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  firmarEstadoOAuth,
  generarDesafioPKCE,
  generarVerificadorPKCE,
  leerEstadoOAuth,
  validarOrigenOAuth,
  verificarEstadoOAuth,
} from "../src/lib/mercadopago/oauth/seguridad-oauth";
import {
  crearUrlRelayCallbackOAuth,
  procesarCallbackOAuth,
  validarContextoCallbackOAuth,
} from "../src/lib/mercadopago/oauth/procesar-callback";
import type { TenantRegistryEntry } from "../src/lib/tenants/registry/types";

function verificarStateLigadoATenantYOrigen(): void {
  const tenantId = "tenant-a";
  const hostname = "tienda-a.example.com";
  const origen = process.env.NODE_ENV === "production"
    ? `https://${hostname}`
    : `http://${hostname}`;
  const secreto = "secreto-local-de-prueba-que-no-se-usa-en-produccion";
  const ahora = 1_800_000_000_000;
  const estado = firmarEstadoOAuth(tenantId, hostname, origen, secreto, ahora);

  assert.equal(verificarEstadoOAuth(estado, tenantId, hostname, secreto, ahora), true);
  assert.equal(verificarEstadoOAuth(estado, "tenant-b", hostname, secreto, ahora), false);
  assert.equal(verificarEstadoOAuth(estado, tenantId, "tienda-b.example.com", secreto, ahora), false);
  assert.equal(verificarEstadoOAuth(estado, tenantId, hostname, "otro-secreto", ahora), false);
  assert.equal(verificarEstadoOAuth(`${estado}alterado`, tenantId, hostname, secreto, ahora), false);
  assert.equal(verificarEstadoOAuth("estado-sin-firma", tenantId, hostname, secreto, ahora), false);
  assert.equal(leerEstadoOAuth(estado, "otro-secreto", ahora), null);
  assert.equal("codeVerifier" in (leerEstadoOAuth(estado, secreto, ahora) ?? {}), false);
  assert.equal(estado.includes("V".repeat(43)), false);
  assert.equal(leerEstadoOAuth(estado, secreto, ahora + 10 * 60 * 1000 + 31_000), null);
  assert.equal(leerEstadoOAuth(estado, secreto, ahora - 31_000), null);
  assert.equal(validarOrigenOAuth(origen, hostname), true);
  assert.equal(validarOrigenOAuth("https://atacante.example", hostname), false);
  assert.throws(() => firmarEstadoOAuth(
    tenantId,
    hostname,
    "https://atacante.example",
    secreto,
    ahora,
  ));
}

function verificarPKCES256(): void {
  const verificador = generarVerificadorPKCE();
  const desafio = generarDesafioPKCE(verificador);
  const desafioEsperado = createHash("sha256").update(verificador).digest("base64url");

  assert.match(verificador, /^[A-Za-z0-9_-]{43,128}$/);
  assert.equal(verificador.length, 86);
  assert.equal(desafio, desafioEsperado);
  assert.match(desafio, /^[A-Za-z0-9_-]+$/);
}

function verificarOrigenProduccion(): void {
  const entornoOriginal = process.env.NODE_ENV;
  Reflect.set(process.env, "NODE_ENV", "production");
  try {
    const tenantId = "tenant-prod";
    const host = "tienda.example.com";
    const secreto = "secreto-local-de-prueba-que-no-se-usa-en-produccion";
    const estado = firmarEstadoOAuth(
      tenantId,
      host,
      `https://${host}`,
      secreto,
      1_800_000_000_000,
    );
    assert.equal(verificarEstadoOAuth(
      estado,
      tenantId,
      host,
      secreto,
      1_800_000_000_000,
    ), true);
    assert.throws(() => firmarEstadoOAuth(
      tenantId,
      host,
      `http://${host}`,
      secreto,
      1_800_000_000_000,
    ));
    assert.throws(() => firmarEstadoOAuth(
      tenantId,
      host,
      `https://${host}:8443`,
      secreto,
      1_800_000_000_000,
    ));
  } finally {
    if (entornoOriginal === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
    else Reflect.set(process.env, "NODE_ENV", entornoOriginal);
  }
}

async function verificarCallbackVinculadoAlNavegador(): Promise<void> {
  const tenant: TenantRegistryEntry = {
    tenant: {
      id: "tenant-a",
      nombre: "Tienda A",
      slug: "tienda-a",
      dominio: "tienda-a.example.com",
      estado: "ACTIVO",
    },
    dominios: ["tienda-a.example.com"],
    referenciaBase: "mysql/tenant-a",
    versionCredenciales: "v1",
  };
  const secreto = "secreto-local-de-prueba-que-no-se-usa-en-produccion";
  const ahora = Date.now();
  const hostname = tenant.dominios[0]!;
  const origen = process.env.NODE_ENV === "production"
    ? `https://${hostname}`
    : `http://${hostname}`;
  const codeVerifier = "W".repeat(43);
  const estado = firmarEstadoOAuth(tenant.tenant.id, hostname, origen, secreto, ahora);
  const llamadas: Array<{ tenantId: string; codigo: string; codeVerifier: string }> = [];
  const dependencias = {
    secreto,
    resolverTenant: async (tenantId: string) => tenantId === tenant.tenant.id ? tenant : null,
    manejarCallback: async (tenantId: string, codigo: string, verifier: string) => {
      llamadas.push({ tenantId, codigo, codeVerifier: verifier });
    },
  };
  const entradaBase = {
    estado,
    estadoCookie: estado,
    codeVerifier,
    tenantIdSesion: tenant.tenant.id,
    hostRecibido: hostname,
    codigo: "codigo-mp",
    errorProveedor: null,
  };

  const sinCookie = await procesarCallbackOAuth({ ...entradaBase, estadoCookie: undefined }, dependencias, ahora);
  assert.deepEqual(sinCookie, { tipo: "invalido", status: 400 });
  const cookieAjena = await procesarCallbackOAuth({ ...entradaBase, estadoCookie: "otro-state" }, dependencias, ahora);
  assert.deepEqual(cookieAjena, { tipo: "invalido", status: 400 });
  const tenantAjeno = await procesarCallbackOAuth({ ...entradaBase, tenantIdSesion: "tenant-b" }, dependencias, ahora);
  assert.deepEqual(tenantAjeno, { tipo: "invalido", status: 400 });
  const hostCruzado = await procesarCallbackOAuth({ ...entradaBase, hostRecibido: "tienda-b.example.com" }, dependencias, ahora);
  assert.deepEqual(hostCruzado, { tipo: "invalido", status: 400 });
  const sinVerificador = await procesarCallbackOAuth({ ...entradaBase, codeVerifier: undefined }, dependencias, ahora);
  assert.deepEqual(sinVerificador, { tipo: "invalido", status: 400 });
  assert.equal(llamadas.length, 0);

  const valido = await procesarCallbackOAuth(entradaBase, dependencias, ahora);
  assert.deepEqual(valido, { tipo: "redirigir", origen, exito: true });
  assert.deepEqual(llamadas, [{ tenantId: "tenant-a", codigo: "codigo-mp", codeVerifier }]);

  const suspendido = await procesarCallbackOAuth(entradaBase, {
    ...dependencias,
    resolverTenant: async () => ({ ...tenant, tenant: { ...tenant.tenant, estado: "SUSPENDIDO" } }),
  }, ahora);
  assert.deepEqual(suspendido, { tipo: "invalido", status: 400 });

  const cancelado = await procesarCallbackOAuth({
    ...entradaBase,
    codigo: null,
    errorProveedor: "access_denied",
  }, dependencias, ahora);
  assert.deepEqual(cancelado, {
    tipo: "redirigir",
    origen,
    exito: false,
    error: "autorizacion_cancelada",
  });
  assert.equal(llamadas.length, 1);
}

async function verificarRelayFijoSinCanje(): Promise<void> {
  const tenant: TenantRegistryEntry = {
    tenant: {
      id: "tenant-a",
      nombre: "Tienda A",
      slug: "tienda-a",
      dominio: "tienda-a.example.com",
      estado: "ACTIVO",
    },
    dominios: ["tienda-a.example.com"],
    referenciaBase: "mysql/tenant-a",
    versionCredenciales: "v1",
  };
  const secreto = "secreto-local-de-prueba-que-no-se-usa-en-produccion";
  const ahora = Date.now();
  const hostname = tenant.dominios[0]!;
  const origen = process.env.NODE_ENV === "production"
    ? `https://${hostname}`
    : `http://${hostname}`;
  const estadoFirmado = firmarEstadoOAuth(tenant.tenant.id, hostname, origen, secreto, ahora);
  const dependencias = {
    secreto,
    resolverTenant: async () => tenant,
  };

  const validacion = await validarContextoCallbackOAuth(estadoFirmado, dependencias, ahora);
  assert.equal(validacion.tipo, "valido");
  if (validacion.tipo !== "valido") return;

  const destino = crearUrlRelayCallbackOAuth(
    estadoFirmado,
    validacion.estado,
    "codigo-mp",
    null,
  );
  assert.ok(destino);
  assert.equal(destino.origin, origen);
  assert.equal(destino.pathname, "/api/mercadopago/oauth/callback");
  assert.equal(destino.searchParams.get("state"), estadoFirmado);
  assert.equal(destino.searchParams.get("code"), "codigo-mp");
  assert.equal(destino.searchParams.has("error_description"), false);
  assert.equal(crearUrlRelayCallbackOAuth(
    estadoFirmado,
    validacion.estado,
    "C".repeat(2049),
    null,
  ), null);

  const error = crearUrlRelayCallbackOAuth(
    estadoFirmado,
    validacion.estado,
    "codigo-ignorado",
    "error_desconocido&return=https://atacante.example",
  );
  assert.equal(error?.searchParams.get("error"), "oauth_error");
  assert.equal(error?.searchParams.has("code"), false);

  const registroCaido = await validarContextoCallbackOAuth(estadoFirmado, {
    secreto,
    resolverTenant: async () => { throw new Error("registro no disponible"); },
  }, ahora);
  assert.deepEqual(registroCaido, { tipo: "invalido", status: 503 });
}

async function main(): Promise<void> {
  verificarStateLigadoATenantYOrigen();
  verificarPKCES256();
  verificarOrigenProduccion();
  await verificarCallbackVinculadoAlNavegador();
  await verificarRelayFijoSinCanje();
  console.log("OAuth Mercado Pago: state, cookie de navegador, tenant de sesión, relay de tenant y PKCE S256 verificados.");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
