"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: [
        { role: 'asc' },      // ADMIN primero, luego USER
        { createdAt: 'desc' } // Del más nuevo al más antiguo
      ],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        telefono: true
      }
    });
    return users;
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return [];
  }
}

export async function toggleUserRole(userId: string, currentRole: string) {
  try {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Error al actualizar el rol" };
  }
}

export async function deleteUserAccount(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Error al eliminar usuario" };
  }
}