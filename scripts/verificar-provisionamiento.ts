import assert from "node:assert/strict";
import {
  aprovisionarTenant,
} from "../src/lib/tenants/provisioning/aprovisionar-tenant";
import type {
  DestinoProvisionadoTenant,
  SolicitudProvisionamientoTenant,
  TenantProvisioningDependencies,
} from "../src/lib/tenants/provisioning/types";

const DESTINO: DestinoProvisionadoTenant = {
  referenciaBase: "referencia-prueba",
  versionCredenciales: "v1",
};

function crearDependencias(
  solicitud: SolicitudProvisionamientoTenant | null,
  llamadas: string[],
  fallaEnMigracion = false,
): TenantProvisioningDependencies {
  return {
    registro: {
      async obtenerSolicitud(tenantId) {
        llamadas.push(`solicitud:${tenantId}`);
        return solicitud;
      },
      async registrarReferenciaPendiente(tenantId, clave, destino) {
        llamadas.push(`referencia:${tenantId}:${clave}:${destino.referenciaBase}`);
      },
      async activarTenant(tenantId, clave) {
        llamadas.push(`activar:${tenantId}:${clave}`);
      },
      async marcarError(tenantId, clave, etapa, codigo) {
        llamadas.push(`error:${tenantId}:${clave}:${etapa}:${codigo}`);
      },
    },
    bases: {
      async asegurarBaseAislada(tenantId, clave) {
        llamadas.push(`crear:${tenantId}:${clave}`);
        return DESTINO;
      },
      async verificarConexion(destino) {
        llamadas.push(`conexion:${destino.referenciaBase}`);
      },
    },
    migraciones: {
      async aplicarMigraciones(destino) {
        llamadas.push(`migrar:${destino.referenciaBase}`);
        if (fallaEnMigracion) throw new Error("fallo de prueba");
      },
    },
    datosIniciales: {
      async cargarConfiguracionInicial(tenantId, destino) {
        llamadas.push(`inicial:${tenantId}:${destino.referenciaBase}`);
      },
    },
    integridad: {
      async verificar(destino) {
        llamadas.push(`integridad:${destino.referenciaBase}`);
      },
    },
  };
}

async function verificarAprovisionamientoCompleto(): Promise<void> {
  const llamadas: string[] = [];
  const solicitud: SolicitudProvisionamientoTenant = {
    tenantId: "tenant-prueba",
    estado: "PROVISIONING",
    claveIdempotencia: "alta-tenant-prueba",
  };
  const resultado = await aprovisionarTenant(
    solicitud.tenantId,
    crearDependencias(solicitud, llamadas),
  );

  assert.deepEqual(resultado, { estado: "ACTIVADO", tenantId: solicitud.tenantId });
  assert.deepEqual(llamadas, [
    "solicitud:tenant-prueba",
    "crear:tenant-prueba:alta-tenant-prueba",
    "conexion:referencia-prueba",
    "referencia:tenant-prueba:alta-tenant-prueba:referencia-prueba",
    "migrar:referencia-prueba",
    "inicial:tenant-prueba:referencia-prueba",
    "integridad:referencia-prueba",
    "activar:tenant-prueba:alta-tenant-prueba",
  ]);
}

async function verificarReintentoDeDestino(): Promise<void> {
  const llamadas: string[] = [];
  const solicitud: SolicitudProvisionamientoTenant = {
    tenantId: "tenant-reintento",
    estado: "ERROR",
    claveIdempotencia: "alta-tenant-reintento",
    referenciaBase: DESTINO.referenciaBase,
    versionCredenciales: DESTINO.versionCredenciales,
  };
  await aprovisionarTenant(solicitud.tenantId, crearDependencias(solicitud, llamadas));

  assert(!llamadas.some((llamada) => llamada.startsWith("crear:")));
  assert(llamadas.includes("migrar:referencia-prueba"));
  assert(llamadas.includes("activar:tenant-reintento:alta-tenant-reintento"));
}

async function verificarFalloQuedaEnError(): Promise<void> {
  const llamadas: string[] = [];
  const solicitud: SolicitudProvisionamientoTenant = {
    tenantId: "tenant-fallido",
    estado: "PROVISIONING",
    claveIdempotencia: "alta-tenant-fallido",
  };

  await assert.rejects(
    aprovisionarTenant(
      solicitud.tenantId,
      crearDependencias(solicitud, llamadas, true),
    ),
    (error: unknown) =>
      error instanceof Error &&
      /No se pudo aprovisionar el tenant durante APLICAR_MIGRACIONES/.test(error.message) &&
      error.cause instanceof Error &&
      error.cause.message === "fallo de prueba",
  );
  assert(llamadas.some((llamada) =>
    llamada === "error:tenant-fallido:alta-tenant-fallido:APLICAR_MIGRACIONES:Error",
  ));
  assert(!llamadas.some((llamada) => llamada.startsWith("activar:")));
}

async function verificarConcurrenciaEnUnaInstancia(): Promise<void> {
  const solicitud: SolicitudProvisionamientoTenant = {
    tenantId: "tenant-concurrente",
    estado: "PROVISIONING",
    claveIdempotencia: "alta-tenant-concurrente",
  };
  const llamadas: string[] = [];
  let iniciarLectura!: () => void;
  let continuarLectura!: () => void;
  const lecturaIniciada = new Promise<void>((resolve) => { iniciarLectura = resolve; });
  const permisoLectura = new Promise<void>((resolve) => { continuarLectura = resolve; });
  const dependenciasBase = crearDependencias(solicitud, llamadas);
  const dependencias: TenantProvisioningDependencies = {
    ...dependenciasBase,
    registro: {
      ...dependenciasBase.registro,
      async obtenerSolicitud(tenantId) {
        llamadas.push(`solicitud:${tenantId}`);
        iniciarLectura();
        await permisoLectura;
        return solicitud;
      },
    },
  };

  const primera = aprovisionarTenant(solicitud.tenantId, dependencias);
  await lecturaIniciada;
  const segunda = aprovisionarTenant(solicitud.tenantId, dependencias);
  continuarLectura();
  const resultados = await Promise.all([primera, segunda]);

  assert.deepEqual(resultados, [
    { estado: "ACTIVADO", tenantId: solicitud.tenantId },
    { estado: "ACTIVADO", tenantId: solicitud.tenantId },
  ]);
  assert.equal(llamadas.filter((llamada) => llamada === "solicitud:tenant-concurrente").length, 1);
  assert.equal(llamadas.filter((llamada) => llamada.startsWith("crear:")).length, 1);
}

async function verificarFalloAlPersistirErrorConservaAmbasCausas(): Promise<void> {
  const solicitud: SolicitudProvisionamientoTenant = {
    tenantId: "tenant-error-registro",
    estado: "PROVISIONING",
    claveIdempotencia: "alta-tenant-error-registro",
  };
  const llamadas: string[] = [];
  const falloOriginal = new Error("falló el runner de migraciones");
  const falloRegistro = new Error("falló la persistencia del estado ERROR");
  const dependenciasBase = crearDependencias(solicitud, llamadas);
  const dependencias: TenantProvisioningDependencies = {
    ...dependenciasBase,
    registro: {
      ...dependenciasBase.registro,
      async marcarError() {
        throw falloRegistro;
      },
    },
    migraciones: {
      async aplicarMigraciones() {
        throw falloOriginal;
      },
    },
  };

  await assert.rejects(
    aprovisionarTenant(solicitud.tenantId, dependencias),
    (error: unknown) =>
      error instanceof AggregateError &&
      error.cause === falloOriginal &&
      error.errors[0] === falloOriginal &&
      error.errors[1] === falloRegistro,
  );
}

async function verificarTenantActivoNoSeReprocesa(): Promise<void> {
  const llamadas: string[] = [];
  const solicitud: SolicitudProvisionamientoTenant = {
    tenantId: "tenant-activo",
    estado: "ACTIVO",
    claveIdempotencia: "alta-tenant-activo",
  };
  const resultado = await aprovisionarTenant(
    solicitud.tenantId,
    crearDependencias(solicitud, llamadas),
  );

  assert.deepEqual(resultado, { estado: "YA_ACTIVO", tenantId: solicitud.tenantId });
  assert.deepEqual(llamadas, ["solicitud:tenant-activo"]);
}

async function main(): Promise<void> {
  await verificarAprovisionamientoCompleto();
  await verificarReintentoDeDestino();
  await verificarFalloQuedaEnError();
  await verificarConcurrenciaEnUnaInstancia();
  await verificarFalloAlPersistirErrorConservaAmbasCausas();
  await verificarTenantActivoNoSeReprocesa();
  console.log("Orquestación de aprovisionamiento: orden, reintentos, single-flight local y preservación de fallos verificados.");
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
