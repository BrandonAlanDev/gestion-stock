import "server-only";

import { prisma } from "@/lib/prisma";
import { DEFAULT_VALUES } from "@/actions/page-config/shared/defaults";

export async function getOrCreatePageConfig(tenantId: string) {
  return prisma.pageConfig.upsert({
    where: { tenantId },
    update: {},
    create: {
      tenantId,
      storeName: DEFAULT_VALUES.storeName,
      primaryColor: DEFAULT_VALUES.primaryColor,
      secondaryColor: DEFAULT_VALUES.secondaryColor,
      bgColor: DEFAULT_VALUES.bgColor,
    },
  });
}
