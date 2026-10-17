import "server-only";

import type {
  CredencialesBaseTenant,
  LogabyteCoreGateway,
  TenantCredentialResolver,
  TenantRegistryEntry,
  TenantRegistryProvider,
} from "./types";

/** Adapta el transporte privado de Core al registro del runtime. */
export class ProveedorLogabyteCore implements TenantRegistryProvider {
  constructor(
    private readonly gateway: LogabyteCoreGateway,
    private readonly credenciales: TenantCredentialResolver,
  ) {}

  resolverPorHostname(hostname: string): Promise<TenantRegistryEntry | null> {
    return this.gateway.resolverPorHostname(hostname);
  }

  resolverPorId(tenantId: string): Promise<TenantRegistryEntry | null> {
    return this.gateway.resolverPorId(tenantId);
  }

  resolverCredenciales(
    referenciaBase: string,
    versionCredenciales: string,
    tenantId?: string,
  ): Promise<CredencialesBaseTenant> {
    return this.credenciales.resolver(referenciaBase, versionCredenciales, tenantId);
  }

  verificarAcceso(tenantId: string): Promise<number> {
    return this.gateway.verificarAcceso(tenantId);
  }

  listarTenants(): Promise<TenantRegistryEntry[]> {
    return this.gateway.listarTenants();
  }
}
