import assert from "node:assert/strict";
import {
  crearObtenedorMetodosPagoDisponibles,
  type RegistroMetodoPago,
} from "../src/lib/pagos/obtener-metodos-disponibles";
import { filtrarMetodosDisponibles } from "../src/lib/pagos/filtrar-metodos-disponibles";
import { registrarErrorPagoSeguro } from "../src/lib/pagos/registro-error-seguro";
import { resumirEstadoCuentaMP } from "../src/lib/mercadopago/obtener-estado-cuenta";
import type { EstadoProveedor, MetodoPagoId } from "../src/lib/pagos/tipos";

const REGISTROS: RegistroMetodoPago[] = [
  { metodo: "efectivo", activo: true },
  { metodo: "transferencia", activo: true },
  { metodo: "mercadopago", activo: false },
];

function crearProveedor(conectado: boolean): EstadoProveedor {
  return { conectado, nombreCuenta: null, actualizadoEn: null };
}

function verificarEstadoLocalDeCredencialesMercadoPago(): void {
  const cuentaBase = {
    conectado: true,
    nombreNegocio: "Tienda de prueba",
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    accessToken: "token-de-prueba",
    refreshToken: null as string | null,
    expiraEn: null as Date | null,
  };

  assert.equal(resumirEstadoCuentaMP(cuentaBase).conectado, true);
  assert.equal(resumirEstadoCuentaMP({
    ...cuentaBase,
    expiraEn: new Date(Date.now() - 60_000),
  }).conectado, false, "Un token vencido sin refresh no está disponible");
  assert.equal(resumirEstadoCuentaMP({
    ...cuentaBase,
    refreshToken: "refresh-de-prueba",
    expiraEn: new Date(Date.now() - 60_000),
  }).conectado, true, "Un token vencido renovable sigue disponible para el flujo real de pago");
  assert.equal(resumirEstadoCuentaMP({
    ...cuentaBase,
    accessToken: "",
    refreshToken: "refresh-de-prueba",
  }).conectado, false, "La ausencia del access token no se presenta como configuración completa");
}

function crearObtenedor(
  obtenerEstadoProveedor: (tenantId: string, metodo: MetodoPagoId) => Promise<EstadoProveedor>,
) {
  const tenantsConsultados: string[] = [];
  const errores: MetodoPagoId[] = [];
  const obtener = crearObtenedorMetodosPagoDisponibles({
    async listarRegistros(tenantId) {
      tenantsConsultados.push(tenantId);
      return REGISTROS;
    },
    obtenerEstadoProveedor,
    registrarErrorTemporal(metodo, tenantId, error) {
      assert.equal(tenantId, "tenant-a");
      errores.push(metodo);
      registrarErrorPagoSeguro("Fallo temporal consultando configuración", error, metodo);
    },
  });
  return { obtener, tenantsConsultados, errores };
}

async function verificarConfiguracionIncompleta(): Promise<void> {
  const { obtener, tenantsConsultados } = crearObtenedor(async (_tenantId, metodo) =>
    crearProveedor(metodo === "mercadopago"),
  );
  const metodos = await obtener("tenant-a");
  const transferencia = metodos.find((metodo) => metodo.id === "transferencia");

  assert.deepEqual(tenantsConsultados, ["tenant-a"]);
  assert.equal(transferencia?.activo, true, "La auditoría no debe activar ni desactivar el método");
  assert.equal(transferencia?.conectado, false);
  assert.equal(transferencia?.estadoConfiguracion, "INCOMPLETA");
  assert.deepEqual(filtrarMetodosDisponibles(metodos).map((metodo) => metodo.id), ["efectivo"]);
}

async function verificarFalloTemporalYLogSeguro(): Promise<void> {
  const logs: unknown[][] = [];
  const errorOriginal = Object.assign(
    new Error("database host privado; password=secreto-no-registrar"),
    { code: "ER_ACCESS_DENIED_ERROR" },
  );
  const registrarErrorOriginal = console.error;
  console.error = (...argumentos: unknown[]) => { logs.push(argumentos); };

  try {
    const { obtener, errores } = crearObtenedor(async (_tenantId, metodo) => {
      if (metodo === "transferencia") throw errorOriginal;
      return crearProveedor(metodo === "mercadopago");
    });
    const metodos = await obtener("tenant-a");
    const transferencia = metodos.find((metodo) => metodo.id === "transferencia");
    const textoLog = JSON.stringify(logs);

    assert.equal(transferencia?.activo, true);
    assert.equal(transferencia?.conectado, false);
    assert.equal(transferencia?.estadoConfiguracion, "ERROR_TEMPORAL");
    assert.deepEqual(errores, ["transferencia"]);
    assert.deepEqual(filtrarMetodosDisponibles(metodos).map((metodo) => metodo.id), ["efectivo"]);
    assert.match(textoLog, /ER_ACCESS_DENIED_ERROR/);
    assert.doesNotMatch(textoLog, /password|secreto-no-registrar|host privado/);
  } finally {
    console.error = registrarErrorOriginal;
  }
}

async function verificarFalloTemporalDeMercadoPago(): Promise<void> {
  const registros = [
    { metodo: "efectivo", activo: false },
    { metodo: "transferencia", activo: false, config: null },
    { metodo: "mercadopago", activo: true },
  ];
  const { obtener, errores } = crearObtenedor(async (_tenantId, metodo) => {
    if (metodo === "mercadopago") {
      throw Object.assign(new Error("token=privado"), { code: "ETIMEDOUT" });
    }
    return crearProveedor(false);
  });
  const metodos = await obtener("tenant-a", registros);
  const mercadoPago = metodos.find((metodo) => metodo.id === "mercadopago");

  assert.equal(mercadoPago?.estadoConfiguracion, "ERROR_TEMPORAL");
  assert.equal(mercadoPago?.conectado, false);
  assert.deepEqual(errores, ["mercadopago"]);
  assert.deepEqual(filtrarMetodosDisponibles(metodos), []);
}

async function verificarMetodoDeshabilitado(): Promise<void> {
  const consultas: MetodoPagoId[] = [];
  const { obtener } = crearObtenedor(async (_tenantId, metodo) => {
    consultas.push(metodo);
    return crearProveedor(true);
  });
  const registros = REGISTROS.map((registro) => ({
    ...registro,
    activo: registro.metodo === "efectivo",
  }));
  const metodos = await obtener("tenant-a", registros);
  const transferencia = metodos.find((metodo) => metodo.id === "transferencia");
  const mercadoPago = metodos.find((metodo) => metodo.id === "mercadopago");

  assert.equal(transferencia?.activo, false);
  assert.equal(transferencia?.estadoConfiguracion, "DESACTIVADA");
  assert.equal(mercadoPago?.estadoConfiguracion, "DESACTIVADA");
  assert.deepEqual(consultas, [], "Los proveedores desactivados no se consultan");
  assert.deepEqual(filtrarMetodosDisponibles(metodos).map((metodo) => metodo.id), ["efectivo"]);
}

async function verificarMercadoPagoSoloSeConsultaSiEstaActivo(): Promise<void> {
  const consultas: MetodoPagoId[] = [];
  const registros = [
    { metodo: "efectivo", activo: false },
    { metodo: "transferencia", activo: false, config: { instrucciones: "CBU configurado" } },
    { metodo: "mercadopago", activo: true },
  ];
  const { obtener } = crearObtenedor(async (_tenantId, metodo) => {
    consultas.push(metodo);
    return crearProveedor(true);
  });

  const metodos = await obtener("tenant-a", registros);
  assert.deepEqual(consultas, ["mercadopago"]);
  assert.equal(metodos.find((metodo) => metodo.id === "mercadopago")?.conectado, true);
}

async function verificarEstadoMercadoPagoPreviamenteLeido(): Promise<void> {
  const consultas: MetodoPagoId[] = [];
  const registros = [
    { metodo: "efectivo", activo: false },
    { metodo: "transferencia", activo: false, config: null },
    { metodo: "mercadopago", activo: true },
  ];
  const { obtener } = crearObtenedor(async (_tenantId, metodo) => {
    consultas.push(metodo);
    return crearProveedor(false);
  });

  const metodos = await obtener("tenant-a", registros, {
    mercadopago: crearProveedor(true),
  });
  assert.deepEqual(consultas, []);
  assert.equal(metodos.find((metodo) => metodo.id === "mercadopago")?.estadoConfiguracion, "COMPLETA");
}

async function main(): Promise<void> {
  verificarEstadoLocalDeCredencialesMercadoPago();
  await verificarConfiguracionIncompleta();
  await verificarFalloTemporalYLogSeguro();
  await verificarFalloTemporalDeMercadoPago();
  await verificarMetodoDeshabilitado();
  await verificarMercadoPagoSoloSeConsultaSiEstaActivo();
  await verificarEstadoMercadoPagoPreviamenteLeido();
  console.log("Configuración de pagos: método incompleto, fallo temporal, logging seguro y consultas según estado verificados.");
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
