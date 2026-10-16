import type { TenantPublico } from "../../../types/tenants";

/** Metadatos serializables del directorio; nunca contienen credenciales. */
export interface TenantRegistryEntry {
  tenant: TenantPublico;
  dominios: string[];
  referenciaBase: string;
  versionCredenciales: string;
  versionCache?: number;
}

/** Credenciales disponibles únicamente en el servidor al crear un cliente. */
export interface CredencialesBaseTenant {
  host: string;
  puerto: number;
  usuario: string;
  contrasena: string;
  base: string;
  ssl: boolean;
}

export interface TenantRegistryProvider {
  resolverPorHostname(hostname: string): Promise<TenantRegistryEntry | null>;
  resolverPorId(tenantId: string): Promise<TenantRegistryEntry | null>;
  resolverCredenciales(
    referenciaBase: string,
    versionCredenciales: string,
    tenantId?: string,
  ): Promise<CredencialesBaseTenant>;
  listarTenants(): Promise<TenantRegistryEntry[]>;
  /** Consulta el estado vigente antes de acceder a un cliente de base existente. */
  verificarAcceso?(tenantId: string): Promise<number | void>;
  /** Descarta la caché interna al recibir una invalidación explícita. */
  invalidarCache?(): void;
}

/** Puerto del cliente HTTP privado de Logabyte Core. */
export interface LogabyteCoreGateway {
  resolverPorHostname(hostname: string): Promise<TenantRegistryEntry | null>;
  resolverPorId(tenantId: string): Promise<TenantRegistryEntry | null>;
  listarTenants(): Promise<TenantRegistryEntry[]>;
  verificarAcceso(tenantId: string): Promise<number>;
}

/** Resuelve referencias opacas de conexión sin mezclar secretos con metadatos. */
export interface TenantCredentialResolver {
  resolver(
    referenciaBase: string,
    versionCredenciales: string,
    tenantId?: string,
  ): Promise<CredencialesBaseTenant>;
}
