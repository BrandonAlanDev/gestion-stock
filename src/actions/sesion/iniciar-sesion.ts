"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { loginSchema } from "@/lib/zod";
import type { EstadoAccionSesion } from "@/types/acciones-sesion";

export async function iniciarSesion(
  estadoAnterior: EstadoAccionSesion,
  formulario: FormData,
): Promise<EstadoAccionSesion> {
  void estadoAnterior;
  const validacion = loginSchema.safeParse(Object.fromEntries(formulario));
  if (!validacion.success) return { error: "Datos inválidos" };

  try {
    await signIn("credentials", {
      email: validacion.data.email,
      password: validacion.data.password,
      redirect: false,
    });
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof AuthError) return { error: "Credenciales incorrectas" };
    throw error;
  }
}
