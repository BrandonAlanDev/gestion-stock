"use server";

import prisma from "@/lib/prisma";
import { obtenerTenantAdministrador } from "@/actions/personalizado/obtener-tenant-administrador";

export async function obtenerOpcionesTablasAdministrador() {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const [types, tails, fins, configs, materials, deliveryOptions] = await Promise.all([
      prisma.boardTypeOption.findMany({
        where: { tenantId },
        include: {
          typeTails: { where: { tenantId }, include: { tail: true } },
          typeFins: { where: { tenantId }, include: { fin: true } },
          typeConfigs: { where: { tenantId }, include: { config: true } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.boardTailOption.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
      prisma.boardFinOption.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
      prisma.boardFinConfigOption.findMany({ where: { tenantId }, orderBy: { count: "asc" } }),
      prisma.boardMaterialOption.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
      prisma.boardDeliveryOption.findMany({ where: { tenantId }, orderBy: { createdAt: "asc" } }),
    ]);

    const tipos = types.map(({ typeTails, typeFins, typeConfigs, ...tipo }) => ({
      ...tipo,
      allowedTails: typeTails.map((enlace) => enlace.tail),
      allowedFins: typeFins.map((enlace) => enlace.fin),
      allowedConfigs: typeConfigs.map((enlace) => enlace.config),
    }));
    return { success: true, data: { types: tipos, tails, fins, configs, materials, deliveryOptions } };
  } catch (error) {
    console.error("Error al obtener las opciones de tablas para administración:", error);
    return { success: false, error: "Error al cargar las opciones" };
  }
}
