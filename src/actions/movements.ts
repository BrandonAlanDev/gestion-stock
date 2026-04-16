"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createMovement(data: {
  variantId: string;
  type: "IN" | "OUT";
  quantity: number;
  priceAtTime: number;
  note?: string;
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Validar que la variante existe
      const variant = await tx.garmentVariant.findUnique({
        where: { id: data.variantId },
      });

      if (!variant) throw new Error("Variante no encontrada");

      // 2. Si es egreso, validar stock 
      if (data.type === "OUT" && variant.stock < data.quantity) {
        throw new Error("Stock insuficiente para realizar el egreso");
      }

      // 3. Crear el registro del movimiento
      const movement = await tx.movement.create({
        data: {
          variantId: data.variantId,
          type: data.type,
          quantity: data.quantity,
          priceAtTime: data.priceAtTime,
          note: data.note,
        },
      });

      // 4. Ajustar stock
      const adjustment = data.type === "IN" ? data.quantity : -data.quantity;

      await tx.garmentVariant.update({
        where: { id: data.variantId },
        data: {
          stock: { increment: adjustment },
        },
      });

      return movement;
    });

    revalidatePath("/dashboard");
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    console.error("Movement Error:", error);
    return { error: error.message || "Error al registrar movimiento" };
  }
}

export async function getMovements() {
  const movements = await prisma.movement.findMany({
    include: {
      garmentVariant: {
        include: {
          garment: true,
          size: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc", 
    },
  });
  return movements;
}