import { Prisma } from "../../../generated/prisma/client";
import { compararTablasOrigen, MANIFIESTO_TABLAS_TENANT } from "../../../src/lib/tenants/migracion-datos/manifiesto";
import { obtenerRelacionesForaneasTenant } from "../../../src/lib/tenants/migracion-datos/relaciones";
import { auditarRelacionesTenant, type ConteoRelacionTenant } from "../auditar-relaciones-origen";
import { construirConfirmacionDestinos } from "../validar-migracion";
import type { ProveedorRegistroCacheado } from "../../../src/lib/tenants/registry/proveedor-cacheado";
import type { CredencialesBaseTenant, TenantRegistryEntry } from "../../../src/lib/tenants/registry/types";
import { type ClienteTransferencia, type ConfiguracionOrigen, construirWhere, delegado, identificadorSql, leerInventario } from "./datos";

export interface FilaDestinoConfirmable {
  tenantId: string;
  host: string;
  puerto: number;
  base: string;
  ssl: boolean;
}

export async function validarCobertura(
  cliente: ClienteTransferencia,
  inventario: Awaited<ReturnType<typeof leerInventario>>,
  etiqueta: string,
): Promise<void> {
  const cobertura = compararTablasOrigen(inventario.tablas.map((fila) => fila.tabla));
  if (cobertura.noClasificadas.length > 0 || cobertura.ausentesEnOrigen.length > 0) {
    throw new Error(
      `${etiqueta}: tablas sin regla o ausentes; no clasificadas=${cobertura.noClasificadas.join(",")}; ausentes=${cobertura.ausentesEnOrigen.join(",")}`,
    );
  }

  const nulos = await Promise.all(MANIFIESTO_TABLAS_TENANT
    .filter((entrada) => entrada.seleccion.tipo === "columna-tenant")
    .map(async (entrada) => {
      const columnas = inventario.columnasPorTabla.get(entrada.tabla) ?? [];
      if (!columnas.some((columna) => columna.columna === "tenantId")) {
        throw new Error(`${etiqueta}: falta ${entrada.tabla}.tenantId`);
      }
      const [resultado] = await cliente.$queryRaw<Array<{ total: bigint }>>(Prisma.sql`
        SELECT COUNT(*) AS total FROM ${identificadorSql(entrada.tabla)}
        WHERE ${identificadorSql("tenantId")} IS NULL
      `);
      return { tabla: entrada.tabla, total: Number(resultado?.total ?? BigInt(0)) };
    }));
  const conNulos = nulos.filter((fila) => fila.total > 0);
  if (conNulos.length > 0) {
    throw new Error(`${etiqueta}: hay filas sin tenantId en ${conNulos.map((fila) => fila.tabla).join(",")}`);
  }
}

export async function validarRelacionesOrigen(
  cliente: ClienteTransferencia,
  inventario: Awaited<ReturnType<typeof leerInventario>>,
  tenantId: string,
  schema: string,
): Promise<void> {
  const resultado = await auditarRelacionesTenant(
    (consulta) => cliente.$queryRaw<ConteoRelacionTenant[]>(consulta),
    [tenantId],
    inventario.columnasPorTabla,
    obtenerRelacionesForaneasTenant(schema),
  );
  if (resultado.referenciasInvalidas.length > 0 || resultado.relacionesNoEvaluables.length > 0) {
    throw new Error(
      `El origen tiene referencias inválidas o no evaluables: ${JSON.stringify(resultado)}`,
    );
  }

  const tablas = new Set(inventario.tablas.map((fila) => fila.tabla));
  if (!tablas.has("GarmentVariantOptionValue")) return;
  const consultaPuente = construirConsultaConteosPuenteTenant(tenantId);
  const [puente] = await cliente.$queryRaw<Array<{
    huerfanasVariante: bigint;
    huerfanasOpcion: bigint;
    tenantsCruzados: bigint;
  }>>(consultaPuente);

  if (
    Number(puente?.huerfanasVariante ?? BigInt(0)) > 0 ||
    Number(puente?.huerfanasOpcion ?? BigInt(0)) > 0 ||
    Number(puente?.tenantsCruzados ?? BigInt(0)) > 0
  ) {
    throw new Error("El origen contiene vínculos de variantes huérfanos o cruzados entre tenants");
  }
}

/** Incluye vínculos atribuibles al tenant y vínculos totalmente huérfanos sin dueño identificable. */
export function construirConsultaConteosPuenteTenant(tenantId: string): Prisma.Sql {
  return Prisma.sql`
    SELECT
      COALESCE(SUM(v.id IS NULL), 0) AS huerfanasVariante,
      COALESCE(SUM(ov.id IS NULL), 0) AS huerfanasOpcion,
      COALESCE(SUM(v.id IS NOT NULL AND ov.id IS NOT NULL AND v.tenantId <> ov.tenantId), 0) AS tenantsCruzados
    FROM GarmentVariantOptionValue b
    LEFT JOIN GarmentVariant v ON v.id = b.variantId
    LEFT JOIN GarmentOptionValue ov ON ov.id = b.optionValueId
    WHERE v.tenantId = ${tenantId}
      OR ov.tenantId = ${tenantId}
      OR (v.id IS NULL AND ov.id IS NULL)
  `;
}

export async function validarTenantDestino(
  cliente: ClienteTransferencia,
  tenantId: string,
): Promise<void> {
  const tenants = delegado(cliente, "Tenant");
  const total = await tenants.count({ where: {} });
  const coincidente = await tenants.findMany({
    where: { id: tenantId },
    orderBy: { id: "asc" },
    take: 2,
    skip: 0,
  });
  if (total !== 1 || coincidente.length !== 1) {
    throw new Error("El destino debe contener únicamente la fila Tenant del tenant que se transfiere");
  }
}

export async function validarTenantOrigen(
  cliente: ClienteTransferencia,
  tenantId: string,
): Promise<void> {
  const tenant = await delegado(cliente, "Tenant").findMany({
    where: { id: tenantId },
    orderBy: { id: "asc" },
    take: 2,
    skip: 0,
  });
  if (tenant.length !== 1) {
    throw new Error("La fila Tenant del origen no coincide con el tenant seleccionado");
  }
}

export async function contarFilas(
  cliente: ClienteTransferencia,
  modelo: string,
  tenantId: string,
): Promise<number> {
  if (modelo === "Tenant") return 1;
  return delegado(cliente, modelo).count({ where: construirWhere(modelo, tenantId) });
}

export async function validarDestinoVacio(cliente: ClienteTransferencia, tenantId: string): Promise<void> {
  await validarTenantDestino(cliente, tenantId);
  const ocupadas = await Promise.all(MANIFIESTO_TABLAS_TENANT
    .filter((entrada) => entrada.modelo !== "Tenant")
    .map(async (entrada) => ({
      modelo: entrada.modelo,
      total: await delegado(cliente, entrada.modelo).count({ where: {} }),
    })));
  const noVacias = ocupadas.filter((fila) => fila.total > 0);
  if (noVacias.length > 0) {
    throw new Error(
      `El destino no está vacío (${noVacias.map((fila) => `${fila.modelo}=${fila.total}`).join(", ")}). Usá una base nueva; el script no borra datos.`,
    );
  }
}

export async function validarConteosDestinoFinales(
  destino: ClienteTransferencia,
  resultados: readonly { modelo: string; filas: number }[],
): Promise<void> {
  const esperados = new Map(resultados.map((resultado) => [resultado.modelo, resultado.filas]));
  esperados.set("Tenant", 1);
  const discrepancias = await Promise.all(MANIFIESTO_TABLAS_TENANT.map(async (tabla) => {
    const total = await delegado(destino, tabla.modelo).count({ where: {} });
    const esperado = esperados.get(tabla.modelo);
    if (esperado === undefined || total !== esperado) {
      return `${tabla.modelo}=${total} (esperado ${esperado ?? "sin regla"})`;
    }
    return null;
  }));
  const errores = discrepancias.filter((valor): valor is string => valor !== null);
  if (errores.length > 0) {
    throw new Error(`El destino contiene filas inesperadas: ${errores.join(", ")}`);
  }
}

export function mismasCredenciales(
  primera: CredencialesBaseTenant,
  segunda: CredencialesBaseTenant,
): boolean {
  return primera.host === segunda.host &&
    primera.puerto === segunda.puerto &&
    primera.usuario === segunda.usuario &&
    primera.contrasena === segunda.contrasena &&
    primera.base === segunda.base &&
    primera.ssl === segunda.ssl;
}

export async function revalidarDestinoProvisioning(
  registro: ProveedorRegistroCacheado,
  original: TenantRegistryEntry,
  credencialesEsperadas: CredencialesBaseTenant,
): Promise<void> {
  registro.invalidar();
  const actual = await registro.resolverPorId(original.tenant.id);
  if (
    !actual ||
    actual.tenant.estado !== "PROVISIONING" ||
    actual.referenciaBase !== original.referenciaBase ||
    actual.versionCredenciales !== original.versionCredenciales
  ) {
    throw new Error("El tenant dejó de estar en PROVISIONING o cambió su referencia de destino");
  }
  const credencialesActuales = await registro.resolverCredenciales(
    actual.referenciaBase,
    actual.versionCredenciales,
    actual.tenant.id,
  );
  if (!mismasCredenciales(credencialesActuales, credencialesEsperadas)) {
    throw new Error("Las credenciales del destino cambiaron durante la transferencia");
  }
}

export function obtenerTimeoutTransferencia(): number {
  const valor = process.env.TENANT_DATA_TRANSFER_TIMEOUT_MS ?? "1800000";
  const timeout = Number(valor);
  if (!Number.isInteger(timeout) || timeout < 60_000 || timeout > 7_200_000) {
    throw new Error("TENANT_DATA_TRANSFER_TIMEOUT_MS debe estar entre 60000 y 7200000");
  }
  return timeout;
}

export function validarGuardasEjecucion(
  argumento: string | undefined,
  tenantId: string,
  origen: ConfiguracionOrigen,
  destino: CredencialesBaseTenant,
): void {
  if (argumento !== "--ejecutar") return;
  if (process.env.TENANT_DATA_TRANSFER_MODE !== "1") {
    throw new Error("Definí TENANT_DATA_TRANSFER_MODE=1 para habilitar la importación");
  }
  if (process.env.TENANT_DATA_TRANSFER_SOURCE_READ_ONLY_ACK !== "1") {
    throw new Error("Confirmá que el usuario de origen tiene permisos de solo lectura");
  }
  if (process.env.TENANT_DATA_TRANSFER_SOURCE_FROZEN_ACK !== "1") {
    throw new Error("Confirmá que las escrituras del tenant de origen están pausadas");
  }
  if (process.env.TENANT_DATA_TRANSFER_COORDINATION_ACK !== "1") {
    throw new Error("Confirmá que el activador está bloqueado y el destino es exclusivo durante la transferencia");
  }
  if (
    process.env.NODE_ENV === "production" &&
    process.env.TENANT_DATA_TRANSFER_ALLOW_PRODUCTION !== "1"
  ) {
    throw new Error("La transferencia productiva requiere TENANT_DATA_TRANSFER_ALLOW_PRODUCTION=1");
  }

  const origenEsperado = `${origen.host}:${origen.puerto}/${origen.base}|${tenantId}`;
  if (process.env.TENANT_DATA_TRANSFER_CONFIRM_SOURCE !== origenEsperado) {
    throw new Error("TENANT_DATA_TRANSFER_CONFIRM_SOURCE debe repetir el origen y tenant seleccionados");
  }
  const destinoConfirmable: FilaDestinoConfirmable = {
    tenantId,
    host: destino.host,
    puerto: destino.puerto,
    base: destino.base,
    ssl: destino.ssl,
  };
  const destinoEsperado = construirConfirmacionDestinos([destinoConfirmable]);
  if (process.env.TENANT_DATA_TRANSFER_CONFIRM_TARGETS !== destinoEsperado) {
    throw new Error("TENANT_DATA_TRANSFER_CONFIRM_TARGETS debe coincidir con el destino resuelto");
  }
}

export function validarDestinoDistinto(
  origen: ConfiguracionOrigen,
  destino: CredencialesBaseTenant,
  identidadOrigen: { servidor: string; puerto: number; base: string },
  identidadDestino: { servidor: string; puerto: number; base: string },
): void {
  const mismoHostConfigurado = origen.host.toLowerCase() === destino.host.toLowerCase();
  const mismaBaseConfigurada = origen.puerto === destino.puerto &&
    origen.base.toLowerCase() === destino.base.toLowerCase();
  const mismaIdentidadMySql = identidadOrigen.servidor.toLowerCase() === identidadDestino.servidor.toLowerCase() &&
    identidadOrigen.puerto === identidadDestino.puerto &&
    identidadOrigen.base.toLowerCase() === identidadDestino.base.toLowerCase();
  if ((mismoHostConfigurado && mismaBaseConfigurada) || mismaIdentidadMySql) {
    throw new Error("El origen y el destino resuelven a la misma base; la transferencia se canceló");
  }
}
