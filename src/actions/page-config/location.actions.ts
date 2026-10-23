"use server";
import { revalidateTag } from "next/cache";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";
import { z } from "zod";
import { conPrisma } from "@/lib/prisma";

const textoOpcional = (maximo: number) =>
  z.string().trim().max(maximo).nullish()
    // Un campo omitido no se modifica; uno vacío se guarda como null.
    .transform((valor) => (valor === undefined ? undefined : valor || null));

const esquemaUbicacion = z.object({
  locationEnabled: z.boolean().optional(),
  retiroTiendaEnabled: z.boolean().optional(),

  address: textoOpcional(191),
  city: textoOpcional(191),
  province: textoOpcional(191),
  country: textoOpcional(191),
  postalCode: textoOpcional(20),
  mapsUrl: z.string().trim().url().max(2000).nullish(),
});

export async function updateLocationConfig(
  data: z.input<typeof esquemaUbicacion>,
) {
  const validacion = esquemaUbicacion.safeParse(data);
  if (!validacion.success) return { ok: false, error: "Datos de ubicación inválidos" };

  try {
    const { contexto, pageConfig } = await requerirPageConfigAdministrador();
    const location = await conPrisma((prisma) =>
      prisma.pageConfig.update({
        where: { id: pageConfig.id },
        data: validacion.data,
      }),
    );

    revalidateTag(`tenant:${contexto.tenantId}:page-config`);
    return { ok: true, location };
  } catch {
    return { ok: false, error: "Error ubicación" };
  }
}

export async function getLocationConfig() {
  try {
    await requiereTenantActivo();
    const location = await conPrisma((prisma) =>
      prisma.pageConfig.findFirst({
        where: {},

        select: {
          locationEnabled: true,
          retiroTiendaEnabled: true,

          address: true,
          city: true,
          province: true,
          country: true,
          postalCode: true,

          mapsUrl: true,
        },
      }),
    );

    return { ok: true, location };
  } catch {
    return { ok: false, error: "Error ubicación" };
  }
}
