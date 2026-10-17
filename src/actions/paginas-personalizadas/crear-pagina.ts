"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrisma } from "@/lib/prisma";
import type { EntradaCrearPagina } from "@/types/paginas-personalizadas/entradas-acciones";

export async function crearPaginaPersonalizada(datos: EntradaCrearPagina) {
  await requiereAdmin();
  return conPrisma((prisma) =>
    prisma.customPage.create({ data: { ...datos } }),
  );
}
