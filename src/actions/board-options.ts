"use server";

import prisma from "@/lib/prisma";
import { moduloHabilitado } from "@/lib/modulos/modulo-habilitado";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function getBoardOptions() {
  const { id: tenantId } = await requiereTenantActivo();
  const habilitado = await moduloHabilitado(tenantId, "personalizadoEnabled");
  if (!habilitado) {
    return { types: [], materials: [], deliveryOptions: [], whatsapp: null };
  }
  try {
    const [types, materials, deliveryOptions, pageConfig] = await Promise.all([
      prisma.boardTypeOption.findMany({
        where: { active: true, tenantId },
        orderBy: { name: "asc" },
        include: {
          typeTails: { where: { tenantId }, include: { tail: true } },
          typeFins: { where: { tenantId }, include: { fin: true } },
          typeConfigs: { where: { tenantId }, include: { config: true } },
        }
      }),
      prisma.boardMaterialOption.findMany({ where: { active: true, tenantId }, orderBy: { name: "asc" } }),
      prisma.boardDeliveryOption.findMany({ where: { active: true, tenantId }, orderBy: { createdAt: "asc" } }),
      prisma.pageConfig.findFirst({ where: { tenantId }, select: { whatsapp: true } }),
    ]);

    return {
      types: types.map(({ typeTails, typeFins, typeConfigs, ...tipo }) => ({
        ...tipo,
        allowedTails: typeTails.map((enlace) => enlace.tail).sort((a, b) => a.name.localeCompare(b.name)),
        allowedFins: typeFins.map((enlace) => enlace.fin).sort((a, b) => a.name.localeCompare(b.name)),
        allowedConfigs: typeConfigs.map((enlace) => enlace.config).sort((a, b) => a.count - b.count),
      })),
      materials,
      deliveryOptions,
      whatsapp: pageConfig?.whatsapp ?? null,
    };
  } catch (error) {
    console.error("Error fetching board options:", error);
    return { types: [], materials: [], deliveryOptions: [], whatsapp: null };
  }
}

// Data from Markdown
const BOARD_DATA = [
  {
    name: "Shortboard",
    svgPath: "M30,6 C40,6 51,28 51,78 C51,118 43,146 30,154 C17,146 9,118 9,78 C9,28 20,6 30,6 Z",
    tails: ["Round squash", "Round", "Full round squash"],
    configs: ["Thruster"],
    systems: ["Future", "FCS 1", "FCS 2"]
  },
  {
    name: "Swellow 2.0",
    svgPath: "M30,8 C41,8 52,32 52,78 C52,118 44,146 30,154 C16,146 8,118 8,78 C8,32 19,8 30,8 Z", // Placeholder based on Huevos
    tails: ["Golondrina"],
    configs: ["Thruster"],
    systems: ["FCS 1", "FCS 2", "Future"]
  },
  {
    name: "Huevos",
    svgPath: "M30,8 C41,8 52,32 52,78 C52,118 44,146 30,154 C16,146 8,118 8,78 C8,32 19,8 30,8 Z",
    tails: ["Golondrina", "Fish", "Full round squash", "Round"],
    configs: ["Thruster", "Quad", "Multi fins (5 cajones)"],
    systems: ["FCS 1", "FCS 2", "Future"]
  },
  {
    name: "Longboard",
    svgPath: "M30,4 C38,4 48,35 48,85 C48,125 42,150 30,156 C18,150 12,125 12,85 C12,35 22,4 30,4 Z",
    tails: ["Round", "Square", "Full round squash", "Round pin"],
    configs: ["Single", "Single + Estabilizadores", "Thruster"],
    systems: ["FCS 1", "FCS 2", "Future", "Glasson (fijas)"]
  },
  {
    name: "Funboard",
    svgPath: "M30,5 C39,5 50,30 50,80 C50,120 43,148 30,155 C17,148 10,120 10,80 C10,30 21,5 30,5 Z",
    tails: ["Round", "Squash", "Round squash"],
    configs: ["Thruster"],
    systems: ["Future", "FCS 1", "FCS 2"]
  },
  {
    name: "Fun / Pop Corn",
    svgPath: "M30,5 C39,5 50,30 50,80 C50,120 43,148 30,155 C17,148 10,120 10,80 C10,30 21,5 30,5 Z",
    tails: ["Full round squash"],
    configs: ["Thruster"],
    systems: ["Future", "FCS 1", "FCS 2"]
  },
  {
    name: "Cn Classic",
    svgPath: "M30,6 C40,6 51,28 51,78 C51,118 43,146 30,154 C17,146 9,118 9,78 C9,28 20,6 30,6 Z",
    tails: ["Round"],
    configs: ["Twin", "Quad"],
    systems: ["Future", "FCS 1", "FCS 2"]
  },
  {
    name: "Gun",
    svgPath: "M30,3 C37,3 48,22 48,78 C48,122 41,150 30,157 C19,150 12,122 12,78 C12,22 23,3 30,3 Z",
    tails: ["Round pin"],
    configs: ["Thruster", "Quad", "Multi fins (5 cajones)"],
    systems: ["Future", "FCS 1", "FCS 2"]
  },
  {
    name: "Retro Fish",
    svgPath: "M30,10 C41,10 52,32 52,78 C52,110 46,132 30,148 C14,132 8,110 8,78 C8,32 19,10 30,10 Z",
    tails: ["Fish Tail (Retro)"],
    configs: ["Quad", "Twin"],
    systems: ["FCS 1", "FCS 2", "Future"]
  },
  {
    name: "Misil",
    svgPath: "M30,6 C40,6 51,28 51,78 C51,118 43,146 30,154 C17,146 9,118 9,78 C9,28 20,6 30,6 Z",
    tails: ["Round", "Square"],
    configs: ["Thruster"],
    systems: ["FCS 1", "FCS 2", "Future"]
  },
  {
    name: "Big Misil",
    svgPath: "M30,6 C40,6 51,28 51,78 C51,118 43,146 30,154 C17,146 9,118 9,78 C9,28 20,6 30,6 Z",
    tails: ["Round", "Square"],
    configs: ["Thruster"],
    systems: ["FCS 1", "FCS 2", "Future"]
  },
  {
    name: "Fat Misil",
    svgPath: "M30,6 C40,6 51,28 51,78 C51,118 43,146 30,154 C17,146 9,118 9,78 C9,28 20,6 30,6 Z",
    tails: ["Dimante tail"],
    configs: ["Thruster"],
    systems: ["FCS 1", "FCS 2", "Future"]
  },
  {
    name: "Superfish",
    svgPath: "M30,10 C41,10 52,32 52,78 C52,110 46,132 30,148 C14,132 8,110 8,78 C8,32 19,10 30,10 Z",
    tails: ["Fish Tail (moderno)"],
    configs: ["Quad"],
    systems: ["FCS 1", "FCS 2", "Future"]
  },
  {
    name: "Mid Length",
    svgPath: "M30,5 C39,5 49,32 49,82 C49,122 42,149 30,155 C18,149 11,122 11,82 C11,32 21,5 30,5 Z",
    tails: ["Golondrina", "Dimante tail", "Round pin", "Round"],
    configs: ["Twin", "Thruster", "Quad", "Single", "Single + Estabilizadores", "Single + Quad"],
    systems: ["FCS 1", "FCS 2", "Future"]
  },
  {
    name: "New Longboard",
    svgPath: "M30,4 C38,4 48,35 48,85 C48,125 42,150 30,156 C18,150 12,125 12,85 C12,35 22,4 30,4 Z",
    tails: ["Full round squash", "Round tail"],
    configs: ["Single"],
    systems: ["FCS 1", "FCS 2", "Future", "Glasson (fijas)"]
  }
];

const CONFIG_COUNTS: Record<string, number> = {
  "Single": 1,
  "Twin": 2,
  "Thruster": 3,
  "Single + Estabilizadores": 3,
  "Quad": 4,
  "Multi fins (5 cajones)": 5,
  "Single + Quad": 5
};

const LEGACY_TAILS = {
  "Pin tail": "M22,146 Q30,156 38,146",
  "Round tail": "M16,148 Q30,158 44,148",
  "RoudSquash tail": "M16,148 Q30,156 44,148 L44,156 L16,156 Z",
  "Squash tail": "M16,150 L30,156 L44,150",
  "fullRoudSquash": "M16,148 Q30,156 44,148 L44,156 L16,156 Z",
  "Fish Tail (moderno)": "M22,146 Q30,156 38,146 L38,156 L22,156 Z",
  "Fish Tail (Retro)": "M22,146 Q30,156 38,146 L30,156 Z",
  "Swallow tail": "M14,148 L24,156 L30,150 L36,156 L46,148",
  "Square tail": "M16,150 L44,150 L44,156 L16,156 Z",
  "Dimante tail": "M16,148 L30,156 L44,148 L38,156 L30,150 L22,156 Z",
  "SquareFish": "M14,148 L46,148 L44,156 L30,152 L16,156 Z",
  "FullRoundSquashFish": "M14,148 Q30,154 46,148 L44,156 L30,151 L16,156 Z",
};

export async function seedBoardOptions() {
  try {
    const contexto = await requiereAdmin();
    const tenantObjetivo = contexto.tenantId;
    // Verificamos que TODOS los tipos existan y tengan relaciones conectadas
    const totalExpected = BOARD_DATA.length;
    const typesWithRelations = await prisma.boardTypeOption.count({
      where: { tenantId: tenantObjetivo, typeTails: { some: { tenantId: tenantObjetivo } } }
    });
    if (typesWithRelations >= totalExpected) {
      return { success: true, message: "Ya existen datos con relaciones válidas." };
    }

    // Materiales
    for (const mat of [
      { name: "Epóxi", description: "liviana y rígida" },
      { name: "Poliéster", description: "clásica y flexible" },
    ]) {
      await prisma.boardMaterialOption.upsert({
        where: { tenantId_name: { tenantId: tenantObjetivo, name: mat.name } },
        update: { description: mat.description },
        create: { ...mat, tenantId: tenantObjetivo },
      });
    }

    // Extraemos valores únicos
    const allTails = new Set<string>();
    const allConfigs = new Set<string>();
    const allSystems = new Set<string>();

    BOARD_DATA.forEach(b => {
      b.tails.forEach(t => allTails.add(t));
      b.configs.forEach(c => allConfigs.add(c));
      b.systems.forEach(s => allSystems.add(s));
    });

    // Upsert colas
    const dbTails = [];
    for (const tail of Array.from(allTails)) {
      const svgPath = Object.entries(LEGACY_TAILS).find(([k]) => tail.toLowerCase().includes(k.toLowerCase()))?.[1] || LEGACY_TAILS["Pin tail"];
      const t = await prisma.boardTailOption.upsert({
        where: { tenantId_name: { tenantId: tenantObjetivo, name: tail } },
        update: { svgPath },
        create: { tenantId: tenantObjetivo, name: tail, svgPath }
      });
      dbTails.push(t);
    }

    // Upsert configs
    const dbConfigs = [];
    for (const conf of Array.from(allConfigs)) {
      const c = await prisma.boardFinConfigOption.upsert({
        where: { tenantId_name: { tenantId: tenantObjetivo, name: conf } },
        update: { count: CONFIG_COUNTS[conf] || 3 },
        create: { tenantId: tenantObjetivo, name: conf, count: CONFIG_COUNTS[conf] || 3 }
      });
      dbConfigs.push(c);
    }

    // Upsert sistemas
    const dbSys = [];
    for (const sys of Array.from(allSystems)) {
      const s = await prisma.boardFinOption.upsert({
        where: { tenantId_name: { tenantId: tenantObjetivo, name: sys } },
        update: {},
        create: { tenantId: tenantObjetivo, name: sys }
      });
      dbSys.push(s);
    }

    // Finalmente upsert los Tipos y sus relaciones
    for (const b of BOARD_DATA) {
      const matchingTails = dbTails.filter(t => b.tails.includes(t.name));
      const matchingConfigs = dbConfigs.filter(c => b.configs.includes(c.name));
      const matchingSystems = dbSys.filter(s => b.systems.includes(s.name));

      await prisma.boardTypeOption.upsert({
        where: { tenantId_name: { tenantId: tenantObjetivo, name: b.name } },
        update: {
          svgPath: b.svgPath,
          typeTails: { deleteMany: {}, create: matchingTails.map((tail) => ({ tenantId: tenantObjetivo, tailId: tail.id })) },
          typeConfigs: { deleteMany: {}, create: matchingConfigs.map((config) => ({ tenantId: tenantObjetivo, configId: config.id })) },
          typeFins: { deleteMany: {}, create: matchingSystems.map((fin) => ({ tenantId: tenantObjetivo, finId: fin.id })) }
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

    return { success: true };
  } catch (error) {
    console.error("Error seeding board options:", error);
    return { error: "Fallo al inicializar las opciones." };
  }
}
