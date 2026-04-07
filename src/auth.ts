import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { loginSchema } from "@/lib/zod";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any, 
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true, 
    }),
    Credentials({
      authorize: async (credentials) => {
        const { email, password } = await loginSchema.parseAsync(credentials);
        
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          telefono: user.telefono,
          image: user.image
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {

      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.telefono = (user as any).telefono;
        token.image = user.image;
        return token;
      }

      if (trigger === "update" && session) {
        token.name = session.name ?? token.name;
        token.telefono = session.telefono ?? token.telefono;
        return token;
      }

      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { id: true, name: true, role: true, telefono: true, image: true }
          });


          if (!dbUser) return {};
          token.name = dbUser.name;
          token.role = dbUser.role;
          token.telefono = dbUser.telefono;
          token.image = dbUser.image;
        } catch (error) {
          console.error("Error validando usuario en Prisma:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!token.id) {
        return { ...session, user: null as any };
      }

      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.telefono = token.telefono as string | null;
        session.user.image = token.image as string | null;
        session.user.name = token.name as string | null;
      } 

      return session;
    },
  },
});