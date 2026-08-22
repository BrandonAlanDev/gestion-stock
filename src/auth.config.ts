import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { 
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 dia expira
    updateAge: 60 * 60, // refresca cada 1 hora si hay actividad
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user){
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.telefono = (user as any).telefono;
        token.image = (user as any).image;
      } 
      return token;
    },
    session({ session, token }) {
      if (session.user){
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.telefono = token.telefono as string | null;
        session.user.image = token.image as string | null;
      } 

      return session;
    },
  },
} satisfies NextAuthConfig;