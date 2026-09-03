import type { Prisma } from "../../generated/prisma/client";

export type ClienteDestino = Prisma.TransactionClient;
export type ClienteLectura = Pick<Prisma.TransactionClient, "$queryRawUnsafe">;
export type FilaSql = Record<string, unknown>;
export type MapaIds = Map<string, Map<string, string | number>>;

export interface ResumenMigracion {
  tenantId: string;
  cantidades: Map<string, number>;
}
