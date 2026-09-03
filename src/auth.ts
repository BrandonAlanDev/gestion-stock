import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { crearAdaptadorTenant } from "@/lib/autenticacion/crear-adaptador-tenant";
import { obtenerTenantAutenticacion } from "@/lib/autenticacion/obtener-tenant-autenticacion";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/zod";

// Excepción técnica: Auth.js entrega estas cuatro funciones en un único factory.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: crearAdaptadorTenant(),
  providers: [
    ...(authConfig.providers ?? []),
    Credentials({
      authorize: async (credentials) => {
        const { email, password } = await loginSchema.parseAsync(credentials);
        const tenant = await obtenerTenantAutenticacion();
        const usuario = await prisma.user.findUnique({
          where: {
            tenantId_email: {
              tenantId: tenant.id,
              email: email.trim().toLowerCase(),
            },
          },
        });

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
  callbacks: {
    async signIn({ user }) {
      let tenant;
      try {
        tenant = await obtenerTenantAutenticacion();
      } catch {
        return false;
      }

      return !user.tenantId || user.tenantId === tenant.id;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.telefono = user.telefono;
        token.image = user.image;
      }

      if (trigger === "update" && session) {
        token.name = session.name ?? token.name;
        token.telefono = session.telefono ?? token.telefono;
      }

      let tenant;
      try {
        tenant = await obtenerTenantAutenticacion();
      } catch {
        delete token.id;
        delete token.role;
        delete token.tenantId;
        delete token.tenantNombre;
        delete token.tenantSlug;
        return token;
      }

      const usuarioId = typeof token.id === "string" ? token.id : token.sub;
      if (!usuarioId) return token;
      const acceso = await prisma.user.findFirst({
        where: { id: usuarioId, tenantId: tenant.id },
        select: {
          id: true,
          role: true,
          telefono: true,
          image: true,
        },
      });

      if (!acceso) {
        delete token.id;
        delete token.role;
        delete token.tenantId;
        delete token.tenantNombre;
        delete token.tenantSlug;
        return token;
      }

      token.id = acceso.id;
      token.role = acceso.role;
      token.telefono = acceso.telefono;
      token.image = acceso.image;
      token.tenantId = tenant.id;
      token.tenantNombre = tenant.nombre;
      token.tenantSlug = tenant.slug;
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.id === "string") {
        session.user.id = token.id;
        session.user.role = token.role === "ADMIN" ? "ADMIN" : "USER";
        session.user.tenantId = typeof token.tenantId === "string" ? token.tenantId : "";
        session.user.tenantNombre = typeof token.tenantNombre === "string" ? token.tenantNombre : "";
        session.user.tenantSlug = typeof token.tenantSlug === "string" ? token.tenantSlug : "";
        session.user.telefono = typeof token.telefono === "string" ? token.telefono : null;
        session.user.image = typeof token.image === "string" ? token.image : null;
        session.user.name = typeof token.name === "string" ? token.name : null;
      }

      return session;
    },
  },
});
