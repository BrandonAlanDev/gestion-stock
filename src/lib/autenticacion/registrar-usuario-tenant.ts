import { createHash, timingSafeEqual } from "node:crypto";
import type { PrismaClient } from "@/../generated/prisma/client";

interface DatosRegistro {
  email: string;
  name: string;
  passwordHash: string;
  passwordLength: number;
  codigoInvitacion?: string;
}

export type ResultadoRegistro = "creado" | "codigo-invalido" | "usar-google" | "password-corta";

function codigoValido(codigo: string | undefined, hash: string): boolean {
  if (!codigo || !/^[a-f0-9]{64}$/i.test(codigo) || !/^[a-f0-9]{64}$/i.test(hash)) return false;
  const calculado = createHash("sha256").update(codigo.toLowerCase()).digest();
  const esperado = Buffer.from(hash, "hex");
  return timingSafeEqual(calculado, esperado);
}

/** Consume la invitación en la misma transacción que crea al administrador. */
export async function registrarUsuarioTenant(
  prisma: PrismaClient,
  datos: DatosRegistro,
): Promise<ResultadoRegistro> {
  return prisma.$transaction(async (transaccion) => {
    const reserva = await transaccion.admin_pending_email.findUnique({
      where: { email: datos.email },
    });
    if (reserva?.codigoHash === null) return "usar-google";
    if (reserva && !codigoValido(datos.codigoInvitacion, reserva.codigoHash)) return "codigo-invalido";
    if (!reserva && datos.codigoInvitacion) return "codigo-invalido";
    if (reserva && datos.passwordLength < 12) return "password-corta";

    if (reserva) {
      const consumida = await transaccion.admin_pending_email.deleteMany({
        where: { email: datos.email, codigoHash: reserva.codigoHash },
      });
      if (consumida.count !== 1) throw new Error("La invitación cambió durante el registro");
    }

    const existente = reserva
      ? await transaccion.user.findUnique({ where: { email: datos.email } })
      : null;
    if (existente) {
      if (existente.role !== "ADMIN" || existente.password !== null) {
        throw new Error("La cuenta reservada ya está ocupada");
      }
      await transaccion.user.update({
        where: { id: existente.id },
        data: { name: datos.name, password: datos.passwordHash },
      });
    } else {
      await transaccion.user.create({
        data: {
          email: datos.email,
          name: datos.name,
          password: datos.passwordHash,
          role: reserva ? "ADMIN" : "USER",
        },
      });
    }
    return "creado";
  });
}
