import "server-only";

import type { PrismaClient } from "@/../generated/prisma/client";
import { conPrismaTenant } from "../tenants/prisma-factory";
import { liberarReservaStockPedido } from "./gestionar-reserva-stock";

type EjecutarConPrismaTenant = <T>(
  tenantId: string,
  operacion: (prisma: PrismaClient) => Promise<T>,
) => Promise<T>;

interface DependenciasExpiracionReservas {
  conPrismaTenant: EjecutarConPrismaTenant;
  liberarReservaStockPedido: typeof liberarReservaStockPedido;
}

/** Cancela pedidos vencidos por tenant y libera cada reserva de forma idempotente. */
export function crearExpiradorPedidosPendientes(
  dependencias: DependenciasExpiracionReservas,
): (tenantId: string, ahora?: Date) => Promise<number> {
  return async function expirarPedidosPendientesTenant(
    tenantId: string,
    ahora = new Date(),
  ): Promise<number> {
    return dependencias.conPrismaTenant(tenantId, async (prisma) => {
      const candidatos = await prisma.pedido.findMany({
        where: {
          estado: "PENDIENTE",
          stockReservado: true,
          reservaExpiraEn: { lte: ahora },
        },
        select: { id: true },
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
              stockReservado: true,
              reservaExpiraEn: { lte: ahora },
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

          const liberada = await dependencias.liberarReservaStockPedido(
            candidato.id,
            tenantId,
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

export const expirarPedidosPendientesTenant = crearExpiradorPedidosPendientes({
  conPrismaTenant,
  liberarReservaStockPedido,
});
