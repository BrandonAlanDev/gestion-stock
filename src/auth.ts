import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { crearAdaptadorTenant } from "@/lib/autenticacion/crear-adaptador-tenant";
import { crearCallbacksTenant } from "@/lib/autenticacion/crear-callbacks-tenant";
import { reclamarAdministradorGoogle } from "@/lib/autenticacion/reclamar-admin-google";
import { obtenerTenantAutenticacion } from "@/lib/autenticacion/obtener-tenant-autenticacion";
import { conPrismaTenant } from "@/lib/prisma";
import { obtenerHostnameSolicitud } from "@/lib/tenants/obtener-hostname-solicitud";
import { loginSchema } from "@/lib/validaciones/esquemas";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: crearAdaptadorTenant(),
  providers: [
    ...(authConfig.providers ?? []),
    Credentials({
      authorize: async (credentials) => {
        const { email, password } = await loginSchema.parseAsync(credentials);
        const tenant = await obtenerTenantAutenticacion();
        const usuario = await conPrismaTenant(tenant.id, (prisma) =>
          prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } }),
        );
        if (!usuario?.password || !(await bcrypt.compare(password, usuario.password))) {
          return null;
        }
        return {
          id: usuario.id,
          name: usuario.name,
          email: usuario.email,
          role: usuario.role,
          telefono: usuario.telefono,
          image: usuario.image,
          tenantId: tenant.id,
          tenantNombre: tenant.nombre,
          tenantSlug: tenant.slug,
        };
      },
    }),
  ],
  callbacks: crearCallbacksTenant({
    obtenerTenantAutenticacion,
    obtenerHostnameSolicitud,
    reclamarAdministradorGoogle: (tenantId, solicitud) =>
      conPrismaTenant(tenantId, (prisma) => reclamarAdministradorGoogle(prisma, solicitud)),
    buscarUsuario: (tenantId, usuarioId) =>
      conPrismaTenant(tenantId, (prisma) =>
        prisma.user.findUnique({
          where: { id: usuarioId },
          select: { id: true, role: true, telefono: true, image: true },
        }),
      ),
  }),
});
