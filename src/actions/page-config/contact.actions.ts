"use server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";

export async function updateContactConfig(
  data: {
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
  }
) {
  try {
    const { contexto, pageConfig } = await requerirPageConfigAdministrador();
    const contact =
      await prisma.pageConfig.update({
        where: { id: pageConfig.id },

        data: {
          phone: data.phone,
          whatsapp: data.whatsapp,
          email: data.email,
        },
      });

    revalidateTag(`page-config:${contexto.tenantId}`);
    return { ok: true, contact };
  } catch {
    return { ok: false, error: "Error contacto" };
  }
}

export async function getContactConfig() {
  try {
    const { id: tenantId } = await requiereTenantActivo();
    const contact =
      await prisma.pageConfig.findFirst({
        where: { tenantId },

        select: {
          phone: true,
          whatsapp: true,
          email: true,
        },
      });
    return { ok: true, contact };
  } catch {
    return { ok: false, error: "Error contacto" };
  }
}
