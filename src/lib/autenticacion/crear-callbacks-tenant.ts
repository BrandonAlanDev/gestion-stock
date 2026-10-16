import type { NextAuthConfig, Session, User } from "next-auth";
import type { TenantPublico, RolTenant } from "../../types/tenants";

interface UsuarioPersistidoAutenticacion {
  id: string;
  tenantId: string;
  role: RolTenant;
  telefono: string | null;
  image: string | null;
}

export interface DependenciasCallbacksTenant {
  obtenerTenantAutenticacion(): Promise<TenantPublico>;
  obtenerHostnameSolicitud(): Promise<string | null>;
  buscarUsuario(
    tenantId: string,
    usuarioId: string,
  ): Promise<UsuarioPersistidoAutenticacion | null>;
}

type CallbacksAuth = NonNullable<NextAuthConfig["callbacks"]>;

function invalidarIdentidad(token: Parameters<NonNullable<CallbacksAuth["jwt"]>>[0]["token"]): void {
  delete token.id;
  delete token.role;
  delete token.tenantId;
  delete token.tenantNombre;
  delete token.tenantSlug;
  delete token.tenantHost;
  delete token.telefono;
  delete token.image;
  delete token.sub;
  delete token.name;
  delete token.email;
  delete token.picture;
}

/** Construye los callbacks de sesión con dependencias sustituibles en pruebas. */
export function crearCallbacksTenant(
  dependencias: DependenciasCallbacksTenant,
): CallbacksAuth {
  return {
    async signIn({ user }) {
      let tenant: TenantPublico;
      try {
        tenant = await dependencias.obtenerTenantAutenticacion();
      } catch {
        return false;
      }

      const usuarioTenant = user as User;
      return usuarioTenant.tenantId === tenant.id;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        const usuarioTenant = user as User;
        token.id = usuarioTenant.id;
        token.role = usuarioTenant.role;
        token.tenantId = usuarioTenant.tenantId;
        token.telefono = usuarioTenant.telefono;
        token.image = usuarioTenant.image;
        delete token.tenantHost;
      }

      if (trigger === "update" && session) {
        token.name = session.name ?? token.name;
        token.telefono = session.telefono ?? token.telefono;
      }

      let tenant: TenantPublico;
      try {
        tenant = await dependencias.obtenerTenantAutenticacion();
      } catch {
        invalidarIdentidad(token);
        return token;
      }

      const tenantIdToken = typeof token.tenantId === "string" ? token.tenantId : null;
      if (tenantIdToken !== tenant.id) {
        invalidarIdentidad(token);
        return token;
      }

      const tenantHost = await dependencias.obtenerHostnameSolicitud();
      if (!tenantHost) {
        invalidarIdentidad(token);
        return token;
      }
      const hostnameToken = typeof token.tenantHost === "string" ? token.tenantHost : null;
      if (hostnameToken && hostnameToken !== tenantHost) {
        invalidarIdentidad(token);
        return token;
      }
      token.tenantHost = hostnameToken ?? tenantHost;

      const usuarioId = typeof token.id === "string" ? token.id : token.sub;
      if (!usuarioId) return token;

      const usuario = await dependencias.buscarUsuario(tenant.id, usuarioId);
      if (!usuario || usuario.id !== usuarioId || usuario.tenantId !== tenant.id) {
        invalidarIdentidad(token);
        return token;
      }

      token.id = usuario.id;
      token.role = usuario.role;
      token.telefono = usuario.telefono;
      token.image = usuario.image;
      token.tenantId = tenant.id;
      token.tenantNombre = tenant.nombre;
      token.tenantSlug = tenant.slug;
      return token;
    },

    async session({ session, token }) {
      if (session.user && typeof token.id === "string") {
        const usuarioSesion = session.user as Session["user"];
        usuarioSesion.id = token.id;
        usuarioSesion.role = token.role === "ADMIN" ? "ADMIN" : "USER";
        usuarioSesion.tenantId = typeof token.tenantId === "string" ? token.tenantId : "";
        usuarioSesion.tenantNombre = typeof token.tenantNombre === "string" ? token.tenantNombre : "";
        usuarioSesion.tenantSlug = typeof token.tenantSlug === "string" ? token.tenantSlug : "";
        usuarioSesion.tenantHost = typeof token.tenantHost === "string" ? token.tenantHost : undefined;
        usuarioSesion.telefono = typeof token.telefono === "string" ? token.telefono : null;
        usuarioSesion.image = typeof token.image === "string" ? token.image : null;
        usuarioSesion.name = typeof token.name === "string" ? token.name : null;
      }

      return session;
    },
  };
}
