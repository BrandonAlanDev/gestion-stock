"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { DATOS_TABLAS, CANTIDADES_QUILLAS, FORMAS_COLAS } from "@/actions/personalizado/datos-iniciales";
import { crearMaterialesIniciales } from "@/actions/personalizado/crear-materiales-iniciales";

export async function inicializarOpcionesTablas() {
  try {
    const contexto = await requiereAdmin();
    const tenantObjetivo = contexto.tenantId;
    const [modelosCompletos, materialesExistentes] = await Promise.all([
      prisma.boardTypeOption.count({
        where: {
          tenantId: tenantObjetivo,
          name: { in: DATOS_TABLAS.map(({ name }) => name) },
          typeTails: { some: { tenantId: tenantObjetivo } },
          typeFins: { some: { tenantId: tenantObjetivo } },
          typeConfigs: { some: { tenantId: tenantObjetivo } },
        },
      }),
      prisma.boardMaterialOption.count({
        where: { tenantId: tenantObjetivo, name: { in: ["Epóxi", "Poliéster"] } },
      }),
    ]);
    if (modelosCompletos === DATOS_TABLAS.length) {
      if (materialesExistentes === 2) {
        return { success: true, message: "Ya existen datos con relaciones válidas." };
      }
      await crearMaterialesIniciales(tenantObjetivo);
      revalidatePath("/admin/personalizado");
      revalidatePath("/personalizado");
      return { success: true };
    }

    await crearMaterialesIniciales(tenantObjetivo);

    // Extraemos valores únicos
    const allTails = new Set<string>();
    const allConfigs = new Set<string>();
    const allSystems = new Set<string>();

    DATOS_TABLAS.forEach(b => {
      b.tails.forEach(t => allTails.add(t));
      b.configs.forEach(c => allConfigs.add(c));
      b.systems.forEach(s => allSystems.add(s));
    });

    // Actualizamos o creamos colas
    const dbTails = [];
    for (const tail of Array.from(allTails)) {
      const svgPath = Object.entries(FORMAS_COLAS).find(([k]) => tail.toLowerCase().includes(k.toLowerCase()))?.[1] || FORMAS_COLAS["Pin tail"];
      const t = await prisma.boardTailOption.upsert({
        where: { tenantId_name: { tenantId: tenantObjetivo, name: tail } },
        update: {},
        create: { tenantId: tenantObjetivo, name: tail, svgPath }
      });
      dbTails.push(t);
    }

    // Actualizamos o creamos configuraciones
    const dbConfigs = [];
    for (const conf of Array.from(allConfigs)) {
      const c = await prisma.boardFinConfigOption.upsert({
        where: { tenantId_name: { tenantId: tenantObjetivo, name: conf } },
        update: {},
        create: { tenantId: tenantObjetivo, name: conf, count: CANTIDADES_QUILLAS[conf] || 3 }
      });
      dbConfigs.push(c);
    }

    // Actualizamos o creamos sistemas
    const dbSys = [];
    for (const sys of Array.from(allSystems)) {
      const s = await prisma.boardFinOption.upsert({
        where: { tenantId_name: { tenantId: tenantObjetivo, name: sys } },
        update: {},
        create: { tenantId: tenantObjetivo, name: sys }
      });
      dbSys.push(s);
    }

    // Agregamos solo las relaciones ausentes para conservar los cambios del administrador.
    for (const b of DATOS_TABLAS) {
      const matchingTails = dbTails.filter(t => b.tails.includes(t.name));
      const matchingConfigs = dbConfigs.filter(c => b.configs.includes(c.name));
      const matchingSystems = dbSys.filter(s => b.systems.includes(s.name));
      const existente = await prisma.boardTypeOption.findUnique({
        where: { tenantId_name: { tenantId: tenantObjetivo, name: b.name } },
        select: {
          id: true,
          typeTails: { where: { tenantId: tenantObjetivo }, select: { id: true }, take: 1 },
          typeConfigs: { where: { tenantId: tenantObjetivo }, select: { id: true }, take: 1 },
          typeFins: { where: { tenantId: tenantObjetivo }, select: { id: true }, take: 1 },
        },
      });

      await prisma.boardTypeOption.upsert({
        where: { tenantId_name: { tenantId: tenantObjetivo, name: b.name } },
        update: {
          typeTails: existente && existente.typeTails.length === 0
            ? { create: matchingTails.map((tail) => ({ tenantId: tenantObjetivo, tailId: tail.id })) }
            : undefined,
          typeConfigs: existente && existente.typeConfigs.length === 0
            ? { create: matchingConfigs.map((config) => ({ tenantId: tenantObjetivo, configId: config.id })) }
            : undefined,
          typeFins: existente && existente.typeFins.length === 0
            ? { create: matchingSystems.map((fin) => ({ tenantId: tenantObjetivo, finId: fin.id })) }
            : undefined,
        },
        create: {
          tenantId: tenantObjetivo,
          name: b.name,
          svgPath: b.svgPath,
          typeTails: { create: matchingTails.map((tail) => ({ tenantId: tenantObjetivo, tailId: tail.id })) },
          typeConfigs: { create: matchingConfigs.map((config) => ({ tenantId: tenantObjetivo, configId: config.id })) },
          typeFins: { create: matchingSystems.map((fin) => ({ tenantId: tenantObjetivo, finId: fin.id })) }
        }
      });
    }

    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true };
  } catch (error) {
    console.error("Error al inicializar las opciones de tablas:", error);
    return { error: "Fallo al inicializar las opciones." };
  }
}
