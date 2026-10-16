import "dotenv/config";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { Prisma } from "../generated/prisma/client";
import { MANIFIESTO_TABLAS_TENANT, validarManifiestoTablasTenant } from "../src/lib/tenants/migracion-datos/manifiesto";
import { validarRelacionesForaneasTenant } from "../src/lib/tenants/migracion-datos/relaciones";
import { obtenerProveedorRegistroTenant } from "../src/lib/tenants/registry/proveedor-registro";
import type { CredencialesBaseTenant, TenantRegistryEntry } from "../src/lib/tenants/registry/types";
import { construirConfirmacionDestinos } from "./tenants/validar-migracion";
import { coincideHistorialMigraciones } from "./tenants/comparar-migraciones";
import { type ConfiguracionOrigen, crearCliente, leerHistorial, leerInventario, obtenerIdentidad, obtenerMigracionesVersionadas, validarEsquemaConPrisma, validarMotoresTransaccionales } from "./tenants/transferencia/datos";
import { contarFilas, obtenerTimeoutTransferencia, revalidarDestinoProvisioning, validarCobertura, validarConteosDestinoFinales, validarDestinoDistinto, validarDestinoVacio, validarGuardasEjecucion, validarRelacionesOrigen, validarTenantOrigen } from "./tenants/transferencia/validaciones";
import { copiarDatos, verificarCopia } from "./tenants/transferencia/copia";

function variableRequerida(nombre: string): string {
  const valor = process.env[nombre]?.trim();
  if (!valor) throw new Error(`Falta la variable requerida ${nombre}`);
  return valor;
}

function leerConfiguracionOrigen(): ConfiguracionOrigen {
  const host = variableRequerida("TENANT_SOURCE_DB_HOST");
  const puerto = Number(variableRequerida("TENANT_SOURCE_DB_PORT"));
  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error("TENANT_SOURCE_DB_PORT debe ser un puerto válido");
  }

  const tenantId = variableRequerida("TENANT_TRANSFER_TENANT_ID");
  if (!/^[a-z0-9_-]{1,128}$/i.test(tenantId)) {
    throw new Error("TENANT_TRANSFER_TENANT_ID no es válido");
  }

  const sslTexto = variableRequerida("TENANT_SOURCE_DB_SSL");
  if (sslTexto !== "0" && sslTexto !== "1") {
    throw new Error("TENANT_SOURCE_DB_SSL debe ser 1 o 0");
  }

  return {
    host,
    puerto,
    usuario: variableRequerida("TENANT_SOURCE_DB_USER"),
    contrasena: variableRequerida("TENANT_SOURCE_DB_PASSWORD"),
    base: variableRequerida("TENANT_SOURCE_DB_NAME"),
    ssl: sslTexto === "1",
    tenantId,
  };
}

function validarArgumentos(): "--planificar" | "--ejecutar" {
  const argumentos = process.argv.slice(2);
  if (argumentos.length === 0 || argumentos[0] === "--planificar") return "--planificar";
  if (argumentos.length === 1 && argumentos[0] === "--ejecutar") return "--ejecutar";
  throw new Error("Usá sin argumentos/--planificar o --ejecutar");
}

async function main(): Promise<void> {
  const modo = validarArgumentos();
  if (process.env.NODE_ENV === "production" && modo === "--planificar") {
    throw new Error("El modo de planificación no abre conexiones productivas desde este script");
  }
  const origenConfig = leerConfiguracionOrigen();
  const registro = obtenerProveedorRegistroTenant();
  const entry: TenantRegistryEntry | null = await registro.resolverPorId(origenConfig.tenantId);
  if (!entry || entry.tenant.id !== origenConfig.tenantId) {
    throw new Error("El tenant no existe en el registro configurado");
  }
  const destinoCredenciales = await registro.resolverCredenciales(
    entry.referenciaBase,
    entry.versionCredenciales,
    entry.tenant.id,
  );
  if (entry.tenant.estado !== "PROVISIONING") {
    throw new Error("El destino debe estar en estado PROVISIONING durante la transferencia");
  }
  validarGuardasEjecucion(modo === "--ejecutar" ? modo : undefined, origenConfig.tenantId, origenConfig, destinoCredenciales);

  const credencialesOrigen: CredencialesBaseTenant = {
    host: origenConfig.host,
    puerto: origenConfig.puerto,
    usuario: origenConfig.usuario,
    contrasena: origenConfig.contrasena,
    base: origenConfig.base,
    ssl: origenConfig.ssl,
  };
  const origen = crearCliente(credencialesOrigen);
  const destino = crearCliente(destinoCredenciales);

  try {
    await Promise.all([origen.$connect(), destino.$connect()]);
    const [identidadOrigen, identidadDestino] = await Promise.all([
      obtenerIdentidad(origen),
      obtenerIdentidad(destino),
    ]);
    if (identidadOrigen.base.toLowerCase() !== origenConfig.base.toLowerCase()) {
      throw new Error("La base efectiva de origen no coincide con la confirmación");
    }
    if (identidadDestino.base.toLowerCase() !== destinoCredenciales.base.toLowerCase()) {
      throw new Error("La base efectiva de destino no coincide con el registro");
    }
    validarDestinoDistinto(origenConfig, destinoCredenciales, identidadOrigen, identidadDestino);

    const schema = await readFile(path.resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
    const erroresManifiesto = validarManifiestoTablasTenant(schema);
    const erroresRelaciones = validarRelacionesForaneasTenant(schema);
    if (erroresManifiesto.length > 0 || erroresRelaciones.length > 0) {
      throw new Error(`Manifiesto no válido: ${[...erroresManifiesto, ...erroresRelaciones].join("; ")}`);
    }

    validarEsquemaConPrisma(credencialesOrigen, "el origen");
    validarEsquemaConPrisma(destinoCredenciales, "el destino");
    await origen.$transaction(async (origenSnapshot) => {
      await Promise.all([
        validarMotoresTransaccionales(origenSnapshot, "Origen"),
        validarMotoresTransaccionales(destino, "Destino"),
      ]);
      const [inventarioOrigen, inventarioDestino, migracionesEsperadas, historialOrigen, historialDestino] = await Promise.all([
        leerInventario(origenSnapshot),
        leerInventario(destino),
        obtenerMigracionesVersionadas(),
        leerHistorial(origenSnapshot),
        leerHistorial(destino),
      ]);
      await validarCobertura(origenSnapshot, inventarioOrigen, "Origen");
      await validarCobertura(destino, inventarioDestino, "Destino");
      if (
        historialOrigen.hayIncompletas || historialDestino.hayIncompletas ||
        !coincideHistorialMigraciones(historialOrigen.aplicadas, migracionesEsperadas) ||
        !coincideHistorialMigraciones(historialDestino.aplicadas, migracionesEsperadas)
      ) {
        throw new Error("Origen y destino deben tener el historial completo y exacto de migraciones versionadas");
      }

      await validarTenantOrigen(origenSnapshot, origenConfig.tenantId);
      await validarRelacionesOrigen(origenSnapshot, inventarioOrigen, origenConfig.tenantId, schema);
      await validarDestinoVacio(destino, origenConfig.tenantId);

      const conteos = await Promise.all(MANIFIESTO_TABLAS_TENANT.map(async (tabla) => ({
        modelo: tabla.modelo,
        filas: await contarFilas(origenSnapshot, tabla.modelo, origenConfig.tenantId),
      })));
      const confirmacionDestino = construirConfirmacionDestinos([{
        tenantId: origenConfig.tenantId,
        host: destinoCredenciales.host,
        puerto: destinoCredenciales.puerto,
        base: destinoCredenciales.base,
        ssl: destinoCredenciales.ssl,
      }]);
      console.log(JSON.stringify({
        modo,
        tenantId: origenConfig.tenantId,
        origen: `${origenConfig.host}:${origenConfig.puerto}/${origenConfig.base}`,
        identidadOrigen,
        destino: confirmacionDestino,
        identidadDestino,
        tenantDestinoEstado: entry.tenant.estado,
        conteos,
        migraciones: migracionesEsperadas.length,
        esquemaOrigenYDestinoCoincideConPrisma: true,
        lecturaOrigen: "snapshot InnoDB Repeatable Read",
        soloPlanificacion: modo === "--planificar",
      }, null, 2));

      if (modo === "--planificar") {
        console.log("Plan validado; no se insertaron ni modificaron filas.");
        return;
      }

      await revalidarDestinoProvisioning(registro, entry, destinoCredenciales);
      const resultados = await copiarDatos(
        origenSnapshot,
        destino,
        origenConfig.tenantId,
        () => revalidarDestinoProvisioning(registro, entry, destinoCredenciales),
      );
      await revalidarDestinoProvisioning(registro, entry, destinoCredenciales);
      await verificarCopia(origenSnapshot, destino, origenConfig.tenantId, resultados);
      await validarRelacionesOrigen(destino, inventarioDestino, origenConfig.tenantId, schema);
      await validarConteosDestinoFinales(destino, resultados);
      await revalidarDestinoProvisioning(registro, entry, destinoCredenciales);
      console.log(JSON.stringify({
        estado: "TRANSFERENCIA_VERIFICADA",
        tenantId: origenConfig.tenantId,
        filasPorModelo: resultados.map(({ modelo, filas }) => ({ modelo, filas })),
        destinoPermaneceEnProvisioning: true,
        siguientePaso: "Revisar el informe y ejecutar la verificación de silo antes de activar el tenant.",
      }, null, 2));
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
      maxWait: 10_000,
      timeout: obtenerTimeoutTransferencia(),
    });
  } finally {
    await Promise.allSettled([origen.$disconnect(), destino.$disconnect()]);
  }
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
