"use server";

import { prisma } from "@/lib/prisma";;
import { serializeData } from "@/lib/utils";
import { revalidatePath } from "next/cache";

/*
  devuelve:
-
  TO DO xd
 */
/* =========================
    READ TURNOS
========================= */
export async function obtenerTurnos(params: { 
  search?: string; 
  orderBy?: string; 
  orderDir?: "asc" | "desc" 
}) {
  try {
    const { search, orderBy, orderDir = "asc" } = params;

    const where = search
      ? {
          OR: [
            { user: { name: { contains: search } } },
            { user: { email: { contains: search } } },
            { patente: { contains: search } },
          ],
        }
      : undefined;

    // Mapeo de ordenamiento dinámico
    let orden: any = { horarioReservado: orderDir }; // Default
    if (orderBy === "name" || orderBy === "email" || orderBy === "telefono") {
      orden = { user: { [orderBy]: orderDir } };
    } else if (orderBy === "patente" || orderBy === "horarioReservado") {
      orden = { [orderBy]: orderDir };
    }

    const turnosRaw = await prisma.turno.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, telefono: true, image: true } },
        vehiculo_servicio: {
          include: { servicio: true, vehiculo: true },
        },
      },
      orderBy: orden,
    });

    // TRANSFORMACIÓN: Convertimos Decimal a Number para que Next.js no se queje :(
    const turnos = serializeData(turnosRaw);

    return turnos;
  } catch (error) {
    console.error("❌ Error en obtenerTurnos:", error);
    throw new Error("No se pudieron obtener los turnos.");
  }
}


export async function limpiarTurnosAntiguos() {
  try {
    // Calculamos la fecha de hace 2 meses exactos
    const dosMesesAtras = new Date();
    dosMesesAtras.setMonth(dosMesesAtras.getMonth() - 2);

    const resultado = await prisma.turno.deleteMany({
      where: {
        horarioReservado: {
          lt: dosMesesAtras, // Menor que hace 2 meses
        },
      },
    });

    revalidatePath("/admin");
    return { success: true, count: resultado.count };
  } catch (error) {
    console.error("Error al limpiar turnos antiguos:", error);
    return { success: false, error: "Hubo un error al eliminar los turnos." };
  }
}

export async function limpiarTurnosCancelados() {
  try {
    const resultado = await prisma.turno.deleteMany({
      where: {
        estado: 0,
      },
    });

    revalidatePath("/admin");
    return { success: true, count: resultado.count };
  } catch (error) {
    console.error("Error al limpiar turnos cancelados:", error);
    return { success: false, error: "Hubo un error al eliminar los turnos." };
  }
}