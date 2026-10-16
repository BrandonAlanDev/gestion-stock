import "server-only";

import type { Adapter } from "next-auth/adapters";
import type { PrismaClient } from "@/../generated/prisma/client";
import type { TenantPublico } from "@/types/tenants";

type EjecutarConPrismaTenant = <T>(
  tenantId: string,
  operacion: (prisma: PrismaClient) => Promise<T>,
) => Promise<T>;

export interface DependenciasAdaptadorTenant {
  obtenerTenantAutenticacion(): Promise<TenantPublico>;
  conPrismaTenant: EjecutarConPrismaTenant;
}

export function crearAdaptadorTenant(dependencias?: DependenciasAdaptadorTenant): Adapter {
  const obtenerTenant = dependencias?.obtenerTenantAutenticacion ?? (async () => {
    const modulo = await import("./obtener-tenant-autenticacion");
    return modulo.obtenerTenantAutenticacion();
  });
  const ejecutarEnTenant = dependencias?.conPrismaTenant ?? (async <T>(
    tenantId: string,
    operacion: (prisma: PrismaClient) => Promise<T>,
  ) => {
    const modulo = await import("../tenants/prisma-factory");
    return modulo.conPrismaTenant(tenantId, operacion);
  });

  return {
    async createUser(usuario) {
      const tenant = await obtenerTenant();
      const { id: idIgnorado, ...datos } = usuario;
      void idIgnorado;

      return ejecutarEnTenant(tenant.id, (prisma) =>
        prisma.user.create({
          data: {
            ...datos,
            email: datos.email.trim().toLowerCase(),
            tenantId: tenant.id,
            role: "USER",
          },
        }),
      );
    },
    async getUser(id) {
      const tenant = await obtenerTenant();
      return ejecutarEnTenant(tenant.id, (prisma) =>
        prisma.user.findFirst({ where: { id, tenantId: tenant.id } }),
      );
    },
    async getUserByEmail(email) {
      const tenant = await obtenerTenant();
      return ejecutarEnTenant(tenant.id, (prisma) =>
        prisma.user.findUnique({
          where: {
            tenantId_email: {
              tenantId: tenant.id,
              email: email.trim().toLowerCase(),
            },
          },
        }),
      );
    },
    async getUserByAccount({ provider, providerAccountId }) {
      const tenant = await obtenerTenant();
      const cuenta = await ejecutarEnTenant(tenant.id, (prisma) =>
        prisma.account.findUnique({
          where: {
            tenantId_provider_providerAccountId: {
              tenantId: tenant.id,
              provider,
              providerAccountId,
            },
          },
          include: { user: true },
        }),
      );

      if (!cuenta) return null;
      if (cuenta.user.tenantId !== tenant.id) {
        throw new Error("La cuenta externa no pertenece a la organización");
      }

      return cuenta.user;
    },
    async updateUser(usuario) {
      const tenant = await obtenerTenant();
      return ejecutarEnTenant(tenant.id, async (prisma) => {
        const existente = await prisma.user.findFirst({
          where: { id: usuario.id, tenantId: tenant.id },
          select: { id: true },
        });
        if (!existente) throw new Error("Usuario no encontrado en la organización");

        return prisma.user.update({
          where: { id: existente.id },
          data: {
            name: usuario.name,
            email: usuario.email?.trim().toLowerCase(),
            emailVerified: usuario.emailVerified,
            image: usuario.image,
          },
        });
      });
    },
    async deleteUser(id) {
      const tenant = await obtenerTenant();
      return ejecutarEnTenant(tenant.id, async (prisma) => {
        const existente = await prisma.user.findFirst({
          where: { id, tenantId: tenant.id },
          select: { id: true },
        });
        if (!existente) return null;
        return prisma.user.delete({ where: { id: existente.id } });
      });
    },
    async linkAccount(cuenta) {
      const tenant = await obtenerTenant();
      return ejecutarEnTenant(tenant.id, async (prisma) => {
        const usuario = await prisma.user.findFirst({
          where: { id: cuenta.userId, tenantId: tenant.id },
          select: { id: true },
        });
        if (!usuario) throw new Error("No se puede vincular una cuenta de otra organización");

        await prisma.account.create({
          data: {
            ...cuenta,
            tenantId: tenant.id,
            userId: usuario.id,
          },
        });
        return { ...cuenta, type: cuenta.type };
      });
    },
    async unlinkAccount({ provider, providerAccountId }) {
      const tenant = await obtenerTenant();
      return ejecutarEnTenant(tenant.id, async (prisma) => {
        const cuenta = await prisma.account.findUnique({
          where: {
            tenantId_provider_providerAccountId: {
              tenantId: tenant.id,
              provider,
              providerAccountId,
            },
          },
        });
        if (!cuenta) return undefined;
        await prisma.account.delete({ where: { id: cuenta.id } });
        return undefined;
      });
    },
  };
}
