import "server-only";

import { DEFAULT_VALUES } from "@/actions/page-config/shared/defaults";
import { conPrismaTenant } from "@/lib/prisma";

export async function getOrCreatePageConfig(tenantId: string) {
  return conPrismaTenant(tenantId, (prisma) =>
    prisma.pageConfig.upsert({
      where: { clave: "principal" },
      update: {},
      create: {
        storeName: DEFAULT_VALUES.storeName,
        primaryColor: DEFAULT_VALUES.primaryColor,
        secondaryColor: DEFAULT_VALUES.secondaryColor,
        bgColor: DEFAULT_VALUES.bgColor,
      },
    }),
  );
}
