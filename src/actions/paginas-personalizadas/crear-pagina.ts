"use server";

import { prisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import type { EntradaCrearPagina } from "@/types/paginas-personalizadas/entradas-acciones";

export async function crearPaginaPersonalizada(datos: EntradaCrearPagina) {
  const { tenantId } = await requiereAdmin();
  return prisma.customPage.create({ data: { ...datos, tenantId } });
}
