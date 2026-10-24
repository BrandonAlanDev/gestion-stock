import "server-only";

import type { PrismaClient } from "@/../generated/prisma/client";
import { conPrisma } from "@/lib/prisma";
import { conContextoTenantRuntime } from "@/lib/tenants/contexto-tenant-runtime";
import { liberarReservaStockPedido } from "./gestionar-reserva-stock";

type EjecutarConPrisma = <T>(
  operacion: (prisma: PrismaClient) => Promise<T>,
) => Promise<T>;

interface DependenciasExpiracionReservas {
  conPrisma: EjecutarConPrisma;
  liberarReservaStockPedido: typeof liberarReservaStockPedido;
}

/** Cancela pedidos vencidos y libera cada reserva de forma idempotente. */
export function crearExpiradorPedidosPendientes(
  dependencias: DependenciasExpiracionReservas,
): (ahora?: Date) => Promise<number> {
  return async function expirarPedidosPendientes(
    ahora = new Date(),
  ): Promise<number> {
    return dependencias.conPrisma(async (prisma) => {
      const candidatos = await prisma.pedido.findMany({
        where: {
          estado: "PENDIENTE",
          estadoPago: { not: "APROBADO" },
          stockReservado: true,
          reservaExpiraEn: { lte: ahora },
          AND: [{
            OR: [
              { metodoPago: { not: "transferencia" } },
              { estadoPago: { not: "EN_ACREDITACION" } },
            ],
          }],
        },
        select: { id: true, estadoPago: true },
        orderBy: { reservaExpiraEn: "asc" },
        take: 100,
      });

      let expirados = 0;
      for (const candidato of candidatos) {
        const expirado = await prisma.$transaction(async (tx) => {
          const cancelado = await tx.pedido.updateMany({
            where: {
              id: candidato.id,
              estado: "PENDIENTE",
              estadoPago: { not: "APROBADO" },
              stockReservado: true,
              reservaExpiraEn: { lte: ahora },
              AND: [{
                OR: [
                  { metodoPago: { not: "transferencia" } },
                  { estadoPago: { not: "EN_ACREDITACION" } },
                ],
              }],
            },
            data: { estado: "CANCELADO", estadoPago: "CANCELADO" },
          });
          if (cancelado.count !== 1) return false;

          await tx.payment.updateMany({
            where: {
              pedidoId: candidato.id,
              estado: { not: "APROBADO" },
            },
            data: { estado: "CANCELADO" },
          });
          await tx.pedidoEvento.create({
            data: {
              pedidoId: candidato.id,
              tipo: "CANCELADO",
              descripcion: "Pedido cancelado por vencimiento de la reserva de stock",
              estadoAnterior: candidato.estadoPago,
              estadoNuevo: "CANCELADO",
              metadata: { origen: "cron-expiracion" },
            },
          });

          const liberada = await dependencias.liberarReservaStockPedido(
            candidato.id,
            tx,
          );
          if (!liberada) throw new Error("No se pudo liberar la reserva del pedido vencido");
          return true;
        });
        if (expirado) expirados += 1;
      }

      return expirados;
    });
  };
}

export const expirarPedidosPendientes = crearExpiradorPedidosPendientes({
  conPrisma,
  liberarReservaStockPedido,
});

export function expirarPedidosPendientesTenant(tenantId: string, ahora = new Date()): Promise<number> {
  return conContextoTenantRuntime(tenantId, () => expirarPedidosPendientes(ahora));
}
