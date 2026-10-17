import "server-only";

import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import type { PrismaClient } from "@/../generated/prisma/client";
import type { obtenerTenantAutenticacion } from "@/lib/autenticacion/obtener-tenant-autenticacion";

type EjecutarConPrismaTenant = <T>(
  tenantId: string,
  operacion: (prisma: PrismaClient) => Promise<T>,
) => Promise<T>;

export interface DependenciasAdaptadorTenant {
  obtenerTenantAutenticacion: typeof obtenerTenantAutenticacion;
  conPrismaTenant: EjecutarConPrismaTenant;
}

/** Crea el adaptador de Auth.js dentro del silo resuelto para esta solicitud. */
export function crearAdaptadorTenant(dependencias?: DependenciasAdaptadorTenant): Adapter {
  async function ejecutar<T>(operacion: (adaptador: Adapter) => T | PromiseLike<T>): Promise<T> {
    const obtenerTenant = dependencias?.obtenerTenantAutenticacion ??
      (await import("@/lib/autenticacion/obtener-tenant-autenticacion")).obtenerTenantAutenticacion;
    const ejecutarTenant = dependencias?.conPrismaTenant ??
      (await import("@/lib/prisma")).conPrismaTenant;
    const tenant = await obtenerTenant();
    return ejecutarTenant(tenant.id, async (prisma) =>
      await operacion(PrismaAdapter(prisma)),
    );
  }

  return {
    createUser: (usuario) => ejecutar((adaptador) => adaptador.createUser!(usuario)),
    getUser: (id) => ejecutar((adaptador) => adaptador.getUser!(id)),
    getUserByEmail: (email) => ejecutar((adaptador) => adaptador.getUserByEmail!(email)),
    getUserByAccount: (cuenta) => ejecutar((adaptador) => adaptador.getUserByAccount!(cuenta)),
    updateUser: (usuario) => ejecutar((adaptador) => adaptador.updateUser!(usuario)),
    async deleteUser(id) {
      await ejecutar((adaptador) => adaptador.deleteUser!(id));
    },
    async linkAccount(cuenta) {
      await ejecutar((adaptador) => adaptador.linkAccount!(cuenta));
    },
    async unlinkAccount(cuenta) {
      await ejecutar((adaptador) => adaptador.unlinkAccount!(cuenta));
    },
    getAccount: (id, proveedor) => ejecutar((adaptador) => adaptador.getAccount!(id, proveedor)),
  };
}
