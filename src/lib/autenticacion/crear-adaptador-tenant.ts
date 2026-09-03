import "server-only";

import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";
import { obtenerTenantAutenticacion } from "@/lib/autenticacion/obtener-tenant-autenticacion";

export function crearAdaptadorTenant(): Adapter {
  const adaptadorBase = PrismaAdapter(prisma);

  return {
    ...adaptadorBase,
    async createUser(usuario) {
      const tenant = await obtenerTenantAutenticacion();
      const { id: idIgnorado, ...datos } = usuario;
      void idIgnorado;

      return prisma.user.create({
        data: {
          ...datos,
          email: datos.email.trim().toLowerCase(),
          tenantId: tenant.id,
          role: "USER",
        },
      });
    },
    async getUser(id) {
      const tenant = await obtenerTenantAutenticacion();
      return prisma.user.findFirst({
        where: { id, tenantId: tenant.id },
      });
    },
    async getUserByEmail(email) {
      const tenant = await obtenerTenantAutenticacion();
      return prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: tenant.id,
            email: email.trim().toLowerCase(),
          },
        },
      });
    },
    async getUserByAccount({ provider, providerAccountId }) {
      const tenant = await obtenerTenantAutenticacion();
      const cuenta = await prisma.account.findUnique({
        where: {
          tenantId_provider_providerAccountId: {
            tenantId: tenant.id,
            provider,
            providerAccountId,
          },
        },
        include: { user: true },
      });

      if (!cuenta) return null;
      if (cuenta.user.tenantId !== tenant.id) {
        throw new Error("La cuenta externa no pertenece a la organización");
      }

      return cuenta.user;
    },
    async updateUser(usuario) {
      const tenant = await obtenerTenantAutenticacion();
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
    },
    async deleteUser(id) {
      const tenant = await obtenerTenantAutenticacion();
      const existente = await prisma.user.findFirst({
        where: { id, tenantId: tenant.id },
        select: { id: true },
      });
      if (!existente) return null;
      return prisma.user.delete({ where: { id: existente.id } });
    },
    async linkAccount(cuenta) {
      const tenant = await obtenerTenantAutenticacion();
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
    },
    async unlinkAccount({ provider, providerAccountId }) {
      const tenant = await obtenerTenantAutenticacion();
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
    },
    // No hay WebAuthn configurado. Se desactiva el lookup global del adaptador base.
    getAccount: undefined,
  };
}
