export type EstadoProvisionamientoTenant = "PROVISIONING" | "ERROR" | "ACTIVO";

/** Solicitud persistida en el registro central con una clave estable para reintentos. */
export interface SolicitudProvisionamientoTenant {
  tenantId: string;
  estado: EstadoProvisionamientoTenant;
  claveIdempotencia: string;
  referenciaBase?: string;
  versionCredenciales?: string;
}

/** Destino opaco; no contiene host, usuario ni contraseña. */
export interface DestinoProvisionadoTenant {
  referenciaBase: string;
  versionCredenciales: string;
}

export type EtapaProvisionamientoTenant =
  | "CREAR_BASE"
  | "VERIFICAR_CONEXION"
  | "REGISTRAR_REFERENCIA"
  | "APLICAR_MIGRACIONES"
  | "INICIALIZAR_CONFIGURACION"
  | "VERIFICAR_INTEGRIDAD"
  | "ACTIVAR_TENANT";

export interface TenantProvisioningRegistry {
  obtenerSolicitud(tenantId: string): Promise<SolicitudProvisionamientoTenant | null>;
  registrarReferenciaPendiente(
    tenantId: string,
    claveIdempotencia: string,
    destino: DestinoProvisionadoTenant,
  ): Promise<void>;
  activarTenant(tenantId: string, claveIdempotencia: string): Promise<void>;
  marcarError(
    tenantId: string,
    claveIdempotencia: string,
    etapa: EtapaProvisionamientoTenant,
    codigoError: string,
  ): Promise<void>;
}

export interface TenantDatabaseProvisioner {
  /** Debe poder repetirse con la misma clave sin crear otra base o usuario. */
  asegurarBaseAislada(
    tenantId: string,
    claveIdempotencia: string,
  ): Promise<DestinoProvisionadoTenant>;
  verificarConexion(destino: DestinoProvisionadoTenant): Promise<void>;
}

export interface TenantMigrationRunner {
  aplicarMigraciones(destino: DestinoProvisionadoTenant): Promise<void>;
}

export interface TenantInitialDataLoader {
  /** Debe usar upserts o claves estables para que el reintento sea seguro. */
  cargarConfiguracionInicial(tenantId: string, destino: DestinoProvisionadoTenant): Promise<void>;
}

export interface TenantIntegrityVerifier {
  verificar(destino: DestinoProvisionadoTenant): Promise<void>;
}

export interface TenantProvisioningDependencies {
  registro: TenantProvisioningRegistry;
  bases: TenantDatabaseProvisioner;
  migraciones: TenantMigrationRunner;
  datosIniciales: TenantInitialDataLoader;
  integridad: TenantIntegrityVerifier;
}
