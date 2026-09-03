"use server";

import bcrypt from "bcryptjs";
import { obtenerTenantAutenticacion } from "@/lib/autenticacion/obtener-tenant-autenticacion";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/zod";
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

  let tenant;
  try {
    tenant = await obtenerTenantAutenticacion();
  } catch {
    return { error: "La organización no está disponible" };
  }
  const { email, password, name } = validacion.data;
  const emailNormalizado = email.trim().toLowerCase();
  const existente = await prisma.user.findUnique({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: emailNormalizado,
      },
    },
  });
  if (existente) return { error: "El usuario ya existe" };

  try {
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: emailNormalizado,
        name,
        password: await bcrypt.hash(password, 10),
        role: "USER",
      },
    });
    return { success: true };
  } catch (error: unknown) {
    if (esConflictoUnico(error)) {
      return { error: "El correo ya está registrado" };
    }
    console.error("Error al registrar el usuario:", error);
    return { error: "No se pudo crear el usuario" };
  }
}
