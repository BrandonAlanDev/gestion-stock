"use server";

import bcrypt from "bcryptjs";
import { conPrisma } from "@/lib/prisma";
import { registrarUsuarioTenant } from "@/lib/autenticacion/registrar-usuario-tenant";
import { registerSchema } from "@/lib/validaciones/esquemas";
import type { EstadoAccionSesion } from "@/types/acciones-sesion";

function esConflictoUnico(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function registrarUsuario(
  estadoAnterior: EstadoAccionSesion,
  formulario: FormData,
): Promise<EstadoAccionSesion> {
  void estadoAnterior;
  const validacion = registerSchema.safeParse(Object.fromEntries(formulario));
  if (!validacion.success) return { error: "Datos inválidos. Revisá los campos." };

  const { email, password, name, codigoInvitacion } = validacion.data;
  const emailNormalizado = email.trim().toLowerCase();
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const resultado = await conPrisma((prisma) =>
      registrarUsuarioTenant(prisma, {
        email: emailNormalizado,
        name,
        passwordHash,
        passwordLength: password.length,
        codigoInvitacion,
      }),
    );
    if (resultado === "usar-google") return { error: "Este correo fue reservado para acceso con Google." };
    if (resultado === "codigo-invalido") return { error: "Código de invitación inválido para este correo." };
    if (resultado === "password-corta") return { error: "La contraseña del administrador debe tener al menos 12 caracteres." };
    return { success: true };
  } catch (error: unknown) {
    if (esConflictoUnico(error)) {
      return { error: "El correo ya está registrado" };
    }
    console.error("Error al registrar el usuario:", error);
    return { error: "No se pudo crear el usuario" };
  }
}
