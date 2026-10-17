import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { obtenerPrisma } from "@/lib/tenants/prisma-factory";
import { loginSchema } from "@/lib/validaciones/esquemas";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(obtenerPrisma()),
  providers: [
    ...(authConfig.providers ?? []),
    Credentials({
      authorize: async (credentials) => {
        const { email, password } = await loginSchema.parseAsync(credentials);
        const usuario = await obtenerPrisma().user.findUnique({
          where: { email: email.trim().toLowerCase() },
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
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      const usuarioId = typeof token.id === "string" ? token.id : null;
      if (!usuarioId) return token;
      const usuario = await obtenerPrisma().user.findUnique({
        where: { id: usuarioId },
        select: { id: true, role: true, telefono: true, image: true },
      });
      if (!usuario) {
        delete token.id;
        delete token.role;
        return token;
      }
      token.id = usuario.id;
      token.role = usuario.role;
      token.telefono = usuario.telefono;
      token.image = usuario.image;
      return token;
    },
  },
});
