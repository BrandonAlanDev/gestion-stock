import type {
  ContextoTenantSesion,
  RolTenant,
  TenantPublico,
} from "@/types/tenants";

export interface IdentidadSesionTenant {
  id?: string | null;
  tenantId?: string | null;
}

export interface UsuarioPersistidoTenant {
  id: string;
  role: RolTenant;
}

/** Verifica que el usuario de la sesión todavía exista y conserva su rol vigente. */
export async function resolverContextoSesionTenant(
  tenant: TenantPublico | null,
  identidadSesion: IdentidadSesionTenant | null | undefined,
  buscarUsuario: (
    tenantId: string,
    usuarioId: string,
  ) => Promise<UsuarioPersistidoTenant | null>,
): Promise<ContextoTenantSesion | null> {
  const usuarioId = identidadSesion?.id?.trim();
  if (
    !tenant ||
    tenant.estado !== "ACTIVO" ||
    !usuarioId
  ) {
    return null;
  }

  const usuario = await buscarUsuario(tenant.id, usuarioId);
  if (
    !usuario ||
    usuario.id !== usuarioId
  ) {
    return null;
  }

  return {
    tenantId: tenant.id,
    tenantNombre: tenant.nombre,
    tenantSlug: tenant.slug,
    tenantDominio: tenant.dominio,
    tenantEstado: tenant.estado,
    usuarioId: usuario.id,
    rol: usuario.role,
  };
}
