import { Prisma } from "@/../generated/prisma/client";

export const INCLUDE_VARIANTE = {
  size: true,
  color: true,
  optionValues: { include: { optionValue: { include: { option: true } } } },
} satisfies Prisma.GarmentVariantInclude;
