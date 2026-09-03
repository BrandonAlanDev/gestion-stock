export type RolTenant = "USER" | "ADMIN";

export type EstadoTenant = "ACTIVO" | "SUSPENDIDO" | "INACTIVO";

export interface TenantPublico {
  id: string;
  nombre: string;
  slug: string;
  dominio: string | null;
  estado: EstadoTenant;
}

/** Alias temporal para consumidores anteriores a la capa tenant central. */
export type TenantResuelto = TenantPublico;

export interface ContextoTenant {
  tenantId: string;
  tenantNombre: string;
  tenantSlug: string;
  tenantDominio: string | null;
  tenantEstado: EstadoTenant;
  usuarioId?: string;
  rol?: RolTenant;
}

export interface ContextoTenantSesion {
  tenantId: string;
  tenantNombre: string;
  tenantSlug: string;
  tenantDominio: string | null;
  tenantEstado: EstadoTenant;
  usuarioId: string;
  rol: RolTenant;
}
