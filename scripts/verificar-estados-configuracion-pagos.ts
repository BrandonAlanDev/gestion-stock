import assert from "node:assert/strict";
import {
  crearObtenedorMetodosPagoDisponibles,
  type RegistroMetodoPago,
} from "../src/lib/pagos/obtener-metodos-disponibles";
import { filtrarMetodosDisponibles } from "../src/lib/pagos/filtrar-metodos-disponibles";
import { registrarErrorPagoSeguro } from "../src/lib/pagos/registro-error-seguro";
import type { EstadoProveedor, MetodoPagoId } from "../src/lib/pagos/tipos";

const REGISTROS: RegistroMetodoPago[] = [
  { metodo: "efectivo", activo: true },
  { metodo: "transferencia", activo: true },
  { metodo: "mercadopago", activo: false },
];

function crearProveedor(conectado: boolean): EstadoProveedor {
  return { conectado, nombreCuenta: null, actualizadoEn: null };
}

function crearObtenedor(
  obtenerEstadoProveedor: (tenantId: string, metodo: MetodoPagoId) => Promise<EstadoProveedor>,
) {
  const tenantsConsultados: string[] = [];
  const obtener = crearObtenedorMetodosPagoDisponibles({
    async listarRegistros(tenantId) {
      tenantsConsultados.push(tenantId);
      return REGISTROS;
    },
    obtenerEstadoProveedor,
    registrarErrorTemporal(metodo, tenantId, error) {
      assert.equal(metodo, "transferencia");
      assert.equal(tenantId, "tenant-a");
      registrarErrorPagoSeguro("Fallo temporal consultando configuración", error, metodo);
    },
  });
  return { obtener, tenantsConsultados };
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
    const { obtener } = crearObtenedor(async (_tenantId, metodo) => {
      if (metodo === "transferencia") throw errorOriginal;
      return crearProveedor(metodo === "mercadopago");
    });
    const metodos = await obtener("tenant-a");
    const transferencia = metodos.find((metodo) => metodo.id === "transferencia");
    const textoLog = JSON.stringify(logs);

    assert.equal(transferencia?.activo, true);
    assert.equal(transferencia?.conectado, false);
    assert.equal(transferencia?.estadoConfiguracion, "ERROR_TEMPORAL");
    assert.deepEqual(filtrarMetodosDisponibles(metodos).map((metodo) => metodo.id), ["efectivo"]);
    assert.match(textoLog, /ER_ACCESS_DENIED_ERROR/);
    assert.doesNotMatch(textoLog, /password|secreto-no-registrar|host privado/);
  } finally {
    console.error = registrarErrorOriginal;
  }
}

async function verificarMetodoDeshabilitado(): Promise<void> {
  const { obtener } = crearObtenedor(async () => crearProveedor(true));
  const registros = REGISTROS.map((registro) =>
    registro.metodo === "transferencia" ? { ...registro, activo: false } : registro,
  );
  const metodos = await obtener("tenant-a", registros);
  const transferencia = metodos.find((metodo) => metodo.id === "transferencia");

  assert.equal(transferencia?.activo, false);
  assert.equal(transferencia?.estadoConfiguracion, "COMPLETA");
  assert.deepEqual(filtrarMetodosDisponibles(metodos).map((metodo) => metodo.id), ["efectivo"]);
}

async function main(): Promise<void> {
  await verificarConfiguracionIncompleta();
  await verificarFalloTemporalYLogSeguro();
  await verificarMetodoDeshabilitado();
  console.log("Configuración de pagos: método incompleto, fallo temporal, logging seguro y desactivación verificados.");
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
