"use server";

import prisma from "@/lib/prisma";
import { moduloHabilitado } from "@/lib/modulos/modulo-habilitado";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";

export async function obtenerOpcionesTablas() {
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
          typeTails: { where: { tenantId, tail: { is: { tenantId, active: true } } }, include: { tail: true } },
          typeFins: { where: { tenantId, fin: { is: { tenantId, active: true } } }, include: { fin: true } },
          typeConfigs: { where: { tenantId, config: { is: { tenantId, active: true } } }, include: { config: true } },
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
    console.error("Error al obtener las opciones de tablas:", error);
    return { types: [], materials: [], deliveryOptions: [], whatsapp: null };
  }
}
