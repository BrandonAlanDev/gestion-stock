"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";


// Definimos el estado de retorno para saber si falló
export type State = {
  success: boolean;
  message: string;
  user?: { name: string | null; telefono: string | null };
};

export async function updateProfile(userId: string, formData: FormData): Promise<State> {
  console.log("🟢 1. Server Action Iniciado. Usuario ID:", userId);

  const name = formData.get("name") as string;
  const telefono = formData.get("telefono") as string;

  console.log("🟢 2. Datos recibidos:", { name, telefono });

  if (!userId) {
    console.log("🔴 Error: No llegó el User ID");
    return { success: false, message: "ID de usuario no encontrado" };
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        name: name,
        telefono: telefono 
      },
    });

    console.log("🟢 3. Actualización en DB exitosa");
    revalidatePath("/dashboard"); // Actualiza la UI
    return { 
      success: true, 
      message: "Perfil actualizado", 
      user: { name: updatedUser.name, telefono: updatedUser.telefono } 
    };

  } catch (error) {
    console.error("🔴 Error al actualizar:", error);
    return { success: false, message: "Error en la base de datos" };
  }
}

export async function getUserTurnos(userId: string) {
  try {
    const turnosRaw = await prisma.turno.findMany({
      where: { userId },
      orderBy: { horarioReservado: 'desc' }, // Los más recientes primero
      include: {
        vehiculo_servicio: {
          include: { servicio: true, vehiculo: true },
        },
      },
    });

    // Serialización necesaria para pasar objetos de Prisma a Client Components
    return turnosRaw.map((t) => ({
      ...t,
      precioCongelado: t.precioCongelado.toNumber(),
      seniaCongelada: t.seniaCongelada.toNumber(),
      vehiculo_servicio: {
        ...t.vehiculo_servicio,
        precio: t.vehiculo_servicio.precio.toNumber(),
        descuento: t.vehiculo_servicio.descuento.toNumber(),
        senia: t.vehiculo_servicio.senia.toNumber(),
      },
    }));
  } catch (error) {
    console.error("Error fetching user turnos:", error);
    return [];
  }
}

export async function cancelTurno(turnoId: string) {
  try {
    await prisma.turno.update({
      where: { id: turnoId },
      data: { estado: 0 }, // 0 = cancelado 1= pendiente 2= completado
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, message: "No se pudo cancelar el turno" };
  }
}

export async function updatePassword(userId: string, formData: FormData): Promise<State> {
  console.log("🟢 1. Server Action Password Iniciado. Usuario ID:", userId);

  const oldPassword = formData.get("oldPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    return { success: false, message: "Las contraseñas no coinciden" };
  }

  if (newPassword.length < 6) {
    return { success: false, message: "La contraseña debe tener al menos 6 caracteres" };
  }

  try {
    const userDb = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userDb) {
      return { success: false, message: "Usuario no encontrado" };
    }

    // Si el usuario ya tiene una contraseña (no es solo de Google), validamos la anterior
    if (userDb.password) {
      if (!oldPassword) {
        return { success: false, message: "Debes ingresar tu contraseña actual" };
      }
      const isValid = await bcrypt.compare(oldPassword, userDb.password);
      if (!isValid) {
        return { success: false, message: "La contraseña actual es incorrecta" };
      }
    }

    // Hasheamos la nueva y actualizamos
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    console.log("🟢 2. Contraseña actualizada con éxito");
    return { success: true, message: "Contraseña actualizada correctamente" };

  } catch (error) {
    console.error("🔴 Error al actualizar contraseña:", error);
    return { success: false, message: "Error en la base de datos" };
  }
}