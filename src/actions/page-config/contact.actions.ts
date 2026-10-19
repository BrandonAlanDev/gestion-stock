"use server";
import { revalidateTag } from "next/cache";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";
import { conPrisma } from "@/lib/prisma";

export async function updateContactConfig(
  data: {
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
  }
) {
  try {
    const { contexto, pageConfig } = await requerirPageConfigAdministrador();
    const contact = await conPrisma((prisma) =>
      prisma.pageConfig.update({
        where: { id: pageConfig.id },
        data: { phone: data.phone, whatsapp: data.whatsapp, email: data.email },
      }),
    );

    revalidateTag(`tenant:${contexto.tenantId}:page-config`);
    return { ok: true, contact };
  } catch {
    return { ok: false, error: "Error contacto" };
  }
}

export async function getContactConfig() {
  try {
    await requiereTenantActivo();
    const contact = await conPrisma((prisma) =>
      prisma.pageConfig.findFirst({
        where: {},

        select: {
          phone: true,
          whatsapp: true,
          email: true,
        },
      }),
    );
    return { ok: true, contact };
  } catch {
    return { ok: false, error: "Error contacto" };
  }
}
