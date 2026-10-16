import "server-only";

import type {
  DestinoProvisionadoTenant,
  EtapaProvisionamientoTenant,
  TenantProvisioningDependencies,
} from "./types";

export type ResultadoProvisionamientoTenant =
  | { estado: "YA_ACTIVO"; tenantId: string }
  | { estado: "ACTIVADO"; tenantId: string };

const globalProvisionamiento = globalThis as typeof globalThis & {
  __aprovisionamientosTenantEnCurso?: Map<
    string,
    Promise<ResultadoProvisionamientoTenant>
  >;
};

function obtenerAprovisionamientosEnCurso(): Map<
  string,
  Promise<ResultadoProvisionamientoTenant>
> {
  globalProvisionamiento.__aprovisionamientosTenantEnCurso ??= new Map();
  return globalProvisionamiento.__aprovisionamientosTenantEnCurso;
}

/**
 * Evita procesar simultáneamente el mismo tenant dentro de esta instancia.
 * La coordinación entre procesos requiere un lease o CAS del registro central.
 */
export async function aprovisionarTenant(
  tenantId: string,
  dependencias: TenantProvisioningDependencies,
): Promise<ResultadoProvisionamientoTenant> {
  const operaciones = obtenerAprovisionamientosEnCurso();
  const existente = operaciones.get(tenantId);
  if (existente) return existente;

  const operacion = ejecutarAprovisionamiento(tenantId, dependencias);
  operaciones.set(tenantId, operacion);
  const limpiar = (): void => {
    if (operaciones.get(tenantId) === operacion) operaciones.delete(tenantId);
  };
  void operacion.then(limpiar, limpiar);
  return operacion;
}

async function ejecutarAprovisionamiento(
  tenantId: string,
  dependencias: TenantProvisioningDependencies,
): Promise<ResultadoProvisionamientoTenant> {
  const solicitud = await dependencias.registro.obtenerSolicitud(tenantId);
  if (!solicitud || solicitud.tenantId !== tenantId) {
    throw new Error("No existe una solicitud de aprovisionamiento para el tenant");
  }
  if (solicitud.estado === "ACTIVO") return { estado: "YA_ACTIVO", tenantId };
  if (!solicitud.claveIdempotencia.trim()) {
    throw new Error("La solicitud no tiene una clave de idempotencia estable");
  }

  const claveIdempotencia = solicitud.claveIdempotencia;
  let etapa: EtapaProvisionamientoTenant = "CREAR_BASE";
  let destino: DestinoProvisionadoTenant | null = null;

  try {
    destino = obtenerDestinoExistente(solicitud);
    destino ??= await dependencias.bases.asegurarBaseAislada(tenantId, claveIdempotencia);

    etapa = "VERIFICAR_CONEXION";
    await dependencias.bases.verificarConexion(destino);

    etapa = "REGISTRAR_REFERENCIA";
    await dependencias.registro.registrarReferenciaPendiente(
      tenantId,
      claveIdempotencia,
      destino,
    );

    etapa = "APLICAR_MIGRACIONES";
    await dependencias.migraciones.aplicarMigraciones(destino);

    etapa = "INICIALIZAR_CONFIGURACION";
    await dependencias.datosIniciales.cargarConfiguracionInicial(tenantId, destino);

    etapa = "VERIFICAR_INTEGRIDAD";
    await dependencias.integridad.verificar(destino);

    etapa = "ACTIVAR_TENANT";
    await dependencias.registro.activarTenant(tenantId, claveIdempotencia);
    return { estado: "ACTIVADO", tenantId };
  } catch (error) {
    const codigoError = error instanceof Error ? error.name : "ErrorDesconocido";
    try {
      await dependencias.registro.marcarError(
        tenantId,
        claveIdempotencia,
        etapa,
        codigoError,
      );
    } catch (errorAlRegistrarEstado) {
      throw new AggregateError(
        [error, errorAlRegistrarEstado],
        `No se pudo aprovisionar el tenant durante ${etapa} y tampoco registrar el estado de error`,
        { cause: error },
      );
    }
    throw new Error(`No se pudo aprovisionar el tenant durante ${etapa}`, { cause: error });
  }
}

function obtenerDestinoExistente(solicitud: {
  referenciaBase?: string;
  versionCredenciales?: string;
}): DestinoProvisionadoTenant | null {
  if (!solicitud.referenciaBase && !solicitud.versionCredenciales) return null;
  if (!solicitud.referenciaBase || !solicitud.versionCredenciales) {
    throw new Error("La solicitud contiene una referencia de conexión incompleta");
  }
  return {
    referenciaBase: solicitud.referenciaBase,
    versionCredenciales: solicitud.versionCredenciales,
  };
}
