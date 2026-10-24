import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
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

function verificarEstadoLigadoAlOrigenYHost(): void {
  const hostname = "tienda-a.example.com";
  const origen = process.env.NODE_ENV === "production"
    ? "https://" + hostname
    : "http://" + hostname;
  const secreto = "secreto-local-de-prueba-que-no-se-usa-en-produccion";
  const ahora = 1_800_000_000_000;
  const estado = firmarEstadoOAuth(hostname, origen, secreto, ahora);

  assert.equal(verificarEstadoOAuth(estado, hostname, secreto, ahora), true);
  assert.equal(verificarEstadoOAuth(estado, "tienda-b.example.com", secreto, ahora), false);
  assert.equal(verificarEstadoOAuth(estado, hostname, "otro-secreto", ahora), false);
  assert.equal(verificarEstadoOAuth(estado + "alterado", hostname, secreto, ahora), false);
  assert.equal(verificarEstadoOAuth("estado-sin-firma", hostname, secreto, ahora), false);
  assert.equal(leerEstadoOAuth(estado, "otro-secreto", ahora), null);
  assert.equal("codeVerifier" in (leerEstadoOAuth(estado, secreto, ahora) ?? {}), false);
  assert.equal(leerEstadoOAuth(estado, secreto, ahora + 10 * 60 * 1000 + 31_000), null);
  assert.equal(leerEstadoOAuth(estado, secreto, ahora - 31_000), null);
  assert.equal(validarOrigenOAuth(origen, hostname), true);
  assert.equal(validarOrigenOAuth("https://atacante.example", hostname), false);
  assert.throws(() => firmarEstadoOAuth(
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
    const host = "tienda.example.com";
    const secreto = "secreto-local-de-prueba-que-no-se-usa-en-produccion";
    const estado = firmarEstadoOAuth(host, "https://" + host, secreto, 1_800_000_000_000);
    assert.equal(verificarEstadoOAuth(
      estado,
      host,
      secreto,
      1_800_000_000_000,
    ), true);
    assert.throws(() => firmarEstadoOAuth(
      host,
      "http://" + host,
      secreto,
      1_800_000_000_000,
    ));
    assert.throws(() => firmarEstadoOAuth(
      host,
      "https://" + host + ":8443",
      secreto,
      1_800_000_000_000,
    ));
  } finally {
    if (entornoOriginal === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
    else Reflect.set(process.env, "NODE_ENV", entornoOriginal);
  }
}

async function verificarCallbackVinculadoAlNavegador(): Promise<void> {
  const secreto = "secreto-local-de-prueba-que-no-se-usa-en-produccion";
  const ahora = Date.now();
  const hostname = "tienda-a.example.com";
  const origen = process.env.NODE_ENV === "production"
    ? "https://" + hostname
    : "http://" + hostname;
  const codeVerifier = "W".repeat(43);
  const estado = firmarEstadoOAuth(hostname, origen, secreto, ahora);
  const llamadas: Array<{ codigo: string; codeVerifier: string }> = [];
  const dependencias = {
    secreto,
    manejarCallback: async (codigo: string, verifier: string) => {
      llamadas.push({ codigo, codeVerifier: verifier });
    },
  };
  const entradaBase = {
    estado,
    estadoCookie: estado,
    codeVerifier,
    hostRecibido: hostname,
    codigo: "codigo-mp",
    errorProveedor: null,
  };

  const sinCookie = await procesarCallbackOAuth(
    { ...entradaBase, estadoCookie: undefined },
    dependencias,
    ahora,
  );
  assert.deepEqual(sinCookie, { tipo: "invalido", status: 400 });
  const cookieAjena = await procesarCallbackOAuth(
    { ...entradaBase, estadoCookie: "otro-state" },
    dependencias,
    ahora,
  );
  assert.deepEqual(cookieAjena, { tipo: "invalido", status: 400 });
  const hostCruzado = await procesarCallbackOAuth(
    { ...entradaBase, hostRecibido: "tienda-b.example.com" },
    dependencias,
    ahora,
  );
  assert.deepEqual(hostCruzado, { tipo: "invalido", status: 400 });
  const sinVerificador = await procesarCallbackOAuth(
    { ...entradaBase, codeVerifier: undefined },
    dependencias,
    ahora,
  );
  assert.deepEqual(sinVerificador, { tipo: "invalido", status: 400 });
  assert.equal(llamadas.length, 0);

  const valido = await procesarCallbackOAuth(entradaBase, dependencias, ahora);
  assert.deepEqual(valido, { tipo: "redirigir", origen, exito: true });
  assert.deepEqual(llamadas, [{ codigo: "codigo-mp", codeVerifier }]);

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
  const secreto = "secreto-local-de-prueba-que-no-se-usa-en-produccion";
  const ahora = Date.now();
  const hostname = "tienda-a.example.com";
  const origen = process.env.NODE_ENV === "production"
    ? "https://" + hostname
    : "http://" + hostname;
  const estadoFirmado = firmarEstadoOAuth(hostname, origen, secreto, ahora);
  const dependencias = { secreto };

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
}

function verificarTenantDelCallbackAutenticado(): void {
  const ruta = readFileSync("src/app/api/mercadopago/oauth/callback/route.ts", "utf8");
  const autenticacion = ruta.indexOf("await requiereAdmin()");
  const procesamiento = ruta.indexOf("procesarCallbackOAuth({");

  assert(autenticacion >= 0 && procesamiento > autenticacion);
  assert.match(
    ruta,
    /proveedorMercadoPago\.manejarCallback\(tenantId,\s*codigoAutorizacion,\s*codeVerifier\)/,
    "El callback debe guardar la conexión en el tenant autenticado de la solicitud",
  );
}

async function main(): Promise<void> {
  verificarEstadoLigadoAlOrigenYHost();
  verificarPKCES256();
  verificarOrigenProduccion();
  verificarTenantDelCallbackAutenticado();
  await verificarCallbackVinculadoAlNavegador();
  await verificarRelayFijoSinCanje();
  console.log("OAuth Mercado Pago: state ligado al host, cookie de navegador, relay y PKCE S256 verificados.");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
