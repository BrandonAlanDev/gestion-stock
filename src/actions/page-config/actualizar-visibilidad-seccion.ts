"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { PageConfig_featuredLayout } from "@/../generated/prisma/client";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";

export interface DatosVisibilidadSeccion {
  featuredLayout?: string;
}

export async function actualizarVisibilidadSeccion(datos: DatosVisibilidadSeccion) {
  try {
    const { pageConfig } = await requerirPageConfigAdministrador();
    await prisma.pageConfig.update({
      where: { id: pageConfig.id },
      data: {
        featuredLayout: datos.featuredLayout
          ? (datos.featuredLayout.toUpperCase() as PageConfig_featuredLayout)
          : undefined,
      },
    });

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    console.error("Error al actualizar:", error);
    return { ok: false, error: "No se pudo actualizar la configuración" };
  }
}
