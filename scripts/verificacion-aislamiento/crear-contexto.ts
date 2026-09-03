import type { PrismaClient } from "../../generated/prisma/client";
import type { ContextoVerificacion } from "./tipos";

export async function crearContexto(
  cliente: PrismaClient,
): Promise<ContextoVerificacion> {
  const sufijo = `${Date.now()}-${process.pid}`;
  const tenantA = `verificacion-a-${sufijo}`;
  const tenantB = `verificacion-b-${sufijo}`;
  const slugA = `verificacion-a-${sufijo}`;
  const slugB = `verificacion-b-${sufijo}`;

  const [organizacionA, organizacionB] = await Promise.all([
    cliente.tenant.create({
      data: { id: tenantA, nombre: "Verificación A", slug: slugA },
    }),
    cliente.tenant.create({
      data: { id: tenantB, nombre: "Verificación B", slug: slugB },
    }),
  ]);
  const [categoriaA, categoriaB, usuarioA, usuarioB] = await Promise.all([
    cliente.category.create({ data: { tenantId: tenantA, name: "Compartida" } }),
    cliente.category.create({ data: { tenantId: tenantB, name: "Compartida" } }),
    cliente.user.create({
      data: { tenantId: tenantA, email: "igual@verificacion.local", password: "credencial-a" },
    }),
    cliente.user.create({
      data: { tenantId: tenantB, email: "igual@verificacion.local", password: "credencial-b" },
    }),
  ]);
  const [productoA, productoB] = await Promise.all([
    cliente.garment.create({
      data: { tenantId: tenantA, name: "Producto A", price: 10, cost: 5, categoryId: categoriaA.id },
    }),
    cliente.garment.create({
      data: { tenantId: tenantB, name: "Producto B", price: 20, cost: 8, categoryId: categoriaB.id },
    }),
    cliente.pageConfig.create({ data: { tenantId: tenantA, storeName: "Tienda A" } }),
    cliente.pageConfig.create({ data: { tenantId: tenantB, storeName: "Tienda B" } }),
  ]);
  void organizacionA;
  void organizacionB;

  return {
    cliente,
    tenantA,
    tenantB,
    slugA,
    slugB,
    categoriaA: categoriaA.id,
    categoriaB: categoriaB.id,
    productoA: productoA.id,
    productoB: productoB.id,
    usuarioA: usuarioA.id,
    usuarioB: usuarioB.id,
  };
}
