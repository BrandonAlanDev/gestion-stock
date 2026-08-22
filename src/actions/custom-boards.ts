"use server";

import prisma from "@/lib/prisma";
import { moduloHabilitado } from "@/lib/modulos/modulo-habilitado";

export type CustomBoardInput = {
  tipo: string;
  largo: string;
  ancho: string;
  espesor: string;
  volumen?: string;
  material: string;
  cola: string;
  killaTipo: string;
  killaCount: string;
  notas?: string;
  deliveryOption?: string;
};

export async function createCustomBoard(data: CustomBoardInput) {
  const habilitado = await moduloHabilitado("personalizadoEnabled");
  if (!habilitado) {
    return { error: "El módulo de tablas personalizadas está desactivado." };
  }
  try {
    const newBoard = await prisma.customBoard.create({
      data: {
        tipo: data.tipo,
        largo: data.largo,
        ancho: data.ancho,
        espesor: data.espesor,
        volumen: data.volumen || null,
        material: data.material,
        cola: data.cola,
        killaTipo: data.killaTipo,
        killaCount: data.killaCount,
        notas: data.notas || null,
        deliveryOption: data.deliveryOption || null,
      },
    });

    return { success: true, id: newBoard.id };
  } catch (error) {
    console.error("Error al crear la tabla personalizada:", error);
    return { error: "Hubo un error al guardar tu pedido. Por favor, intentá nuevamente." };
  }
}

export async function getCustomBoards() {
  const habilitado = await moduloHabilitado("personalizadoEnabled");
  if (!habilitado) {
    return [];
  }
  try {
    const boards = await prisma.customBoard.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return boards;
  } catch (error) {
    console.error("Error al obtener las tablas personalizadas:", error);
    return [];
  }
}
