import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
    updateAge: 60 * 60,
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenantNombre = user.tenantNombre;
        token.tenantSlug = user.tenantSlug;
        token.telefono = user.telefono;
        token.image = user.image;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.id === "string") {
        session.user.id = token.id;
        session.user.role = token.role === "ADMIN" ? "ADMIN" : "USER";
        session.user.tenantId = typeof token.tenantId === "string" ? token.tenantId : "";
        session.user.tenantNombre = typeof token.tenantNombre === "string" ? token.tenantNombre : "";
        session.user.tenantSlug = typeof token.tenantSlug === "string" ? token.tenantSlug : "";
        session.user.telefono = typeof token.telefono === "string" ? token.telefono : null;
        session.user.image = typeof token.image === "string" ? token.image : null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
