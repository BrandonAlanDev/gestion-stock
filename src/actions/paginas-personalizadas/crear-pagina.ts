"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";
import type { EntradaCrearPagina } from "@/types/paginas-personalizadas/entradas-acciones";

export async function crearPaginaPersonalizada(datos: EntradaCrearPagina) {
  const { tenantId } = await requiereAdmin();
  return conPrismaTenant(tenantId, (prisma) =>
    prisma.customPage.create({ data: { ...datos, tenantId } }),
  );
}
