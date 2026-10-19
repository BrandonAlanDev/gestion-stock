"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";
import { conPrisma } from "@/lib/prisma";

export interface DatosVisibilidadSeccion {
  featuredLayout?: string;
}

export async function actualizarVisibilidadSeccion(datos: DatosVisibilidadSeccion) {
  try {
    const { contexto, pageConfig } = await requerirPageConfigAdministrador();
    const layout = datos.featuredLayout
      ? z.enum(["GRID", "COLLAGE", "MINIMAL"]).safeParse(datos.featuredLayout.toUpperCase())
      : null;
    if (layout && !layout.success) {
      return { ok: false, error: "Diseño de sección no válido" };
    }
    await conPrisma((prisma) =>
      prisma.pageConfig.update({
        where: { id: pageConfig.id },
        data: {
          featuredLayout: layout?.data,
        },
      }),
    );

    revalidateTag(`tenant:${contexto.tenantId}:page-config`);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    console.error("Error al actualizar:", error);
    return { ok: false, error: "No se pudo actualizar la configuración" };
  }
}
