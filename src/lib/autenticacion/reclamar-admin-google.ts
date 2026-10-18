import type { PrismaClient } from "@/../generated/prisma/client";

interface IdentidadGoogle {
  email: string;
  sub: string;
  email_verified: unknown;
  hd?: unknown;
}

export interface SolicitudReclamoGoogle {
  email: string;
  providerAccountId: string;
  name: string | null;
  image: string | null;
  profile: IdentidadGoogle | null;
}

class ReservaNoReclamable extends Error {}

function identidadValida(solicitud: SolicitudReclamoGoogle): boolean {
  const profile = solicitud.profile;
  if (!profile || profile.email_verified !== true ||
      profile.email.trim().toLowerCase() !== solicitud.email ||
      profile.sub !== solicitud.providerAccountId) return false;
  const dominio = solicitud.email.split("@")[1];
  return dominio === "gmail.com" ||
    (typeof profile.hd === "string" && profile.hd.toLowerCase() === dominio);
}

/** Reclama una reserva de Core solo con una identidad Google autoritativa. */
export async function reclamarAdministradorGoogle(
  prisma: PrismaClient,
  solicitud: SolicitudReclamoGoogle,
): Promise<boolean> {
  const reserva = await prisma.admin_pending_email.findUnique({ where: { email: solicitud.email } });
  if (!reserva) return true;
  if (reserva.codigoHash !== null || !identidadValida(solicitud)) return false;

  try {
    return await prisma.$transaction(async (transaccion) => {
      const consumida = await transaccion.admin_pending_email.deleteMany({
        where: { email: solicitud.email, codigoHash: null },
      });
      if (consumida.count !== 1) throw new ReservaNoReclamable();

      const existente = await transaccion.user.findUnique({ where: { email: solicitud.email } });
      if (existente && (existente.role !== "ADMIN" || existente.password !== null)) {
        throw new ReservaNoReclamable();
      }
      const usuarioId = existente?.id ?? (await transaccion.user.create({
        data: {
          email: solicitud.email,
          name: solicitud.name,
          image: solicitud.image,
          emailVerified: new Date(),
          role: "ADMIN",
        },
      })).id;
      await transaccion.account.create({
        data: {
          userId: usuarioId,
          type: "oidc",
          provider: "google",
          providerAccountId: solicitud.providerAccountId,
        },
      });
      return true;
    });
  } catch (error: unknown) {
    if (error instanceof ReservaNoReclamable) return false;
    throw error;
  }
}
