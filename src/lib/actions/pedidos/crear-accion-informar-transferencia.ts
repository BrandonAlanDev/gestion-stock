import type { PrismaClient } from "@/../generated/prisma/client";

type ContextoComprador = { tenantId: string; usuarioId: string };
type Resultado =
  | { ok: true; yaInformado: boolean }
  | { ok: false; error: string };

interface DependenciasInformarTransferencia {
  obtenerContexto(): Promise<ContextoComprador | null>;
  conPrismaTenant<T>(
    tenantId: string,
    operacion: (prisma: PrismaClient) => Promise<T>,
  ): Promise<T>;
  ahora?: () => Date;
}

type ResultadoTransaccion = "informado" | "ya_informado" | "conflicto" | "invalido" | "vencido";

/** Acción idempotente: solo la transición pendiente → en acreditación genera evento. */
export function crearAccionInformarTransferencia(
  dependencias: DependenciasInformarTransferencia,
) {
  return async function informarTransferencia(pedidoIdEntrada: unknown): Promise<Resultado> {
    if (typeof pedidoIdEntrada !== "string" ||
      !pedidoIdEntrada.trim() || pedidoIdEntrada.length > 191) {
      return { ok: false, error: "Pedido inválido" };
    }

    const contexto = await dependencias.obtenerContexto();
    if (!contexto?.tenantId || !contexto.usuarioId) {
      return { ok: false, error: "Iniciá sesión para informar una transferencia" };
    }

    const pedidoId = pedidoIdEntrada.trim();
    const resultado = await dependencias.conPrismaTenant(contexto.tenantId, async (prisma) => {
      const transaccion = await prisma.$transaction(async (tx): Promise<ResultadoTransaccion> => {
        const pedido = await tx.pedido.findFirst({
          where: { id: pedidoId, userId: contexto.usuarioId, metodoPago: "transferencia" },
          select: { estado: true, estadoPago: true, reservaExpiraEn: true },
        });
        if (!pedido) return "invalido";
        if (pedido.estado === "PENDIENTE" && pedido.estadoPago === "EN_ACREDITACION") {
          return "ya_informado";
        }
        if (pedido.estado !== "PENDIENTE" || pedido.estadoPago !== "PENDIENTE") {
          return "invalido";
        }
        const ahora = dependencias.ahora?.() ?? new Date();
        if (pedido.reservaExpiraEn && pedido.reservaExpiraEn <= ahora) return "vencido";
        const pago = await tx.payment.findFirst({
          where: { pedidoId, proveedor: "transferencia", estado: "PENDIENTE" },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        });
        if (!pago) return "invalido";
        const instanteCambio = dependencias.ahora?.() ?? new Date();
        if (pedido.reservaExpiraEn && pedido.reservaExpiraEn <= instanteCambio) return "vencido";

        const cambio = await tx.pedido.updateMany({
          where: {
            id: pedidoId,
            userId: contexto.usuarioId,
            metodoPago: "transferencia",
            estado: "PENDIENTE",
            estadoPago: "PENDIENTE",
            OR: [
              { reservaExpiraEn: null },
              { reservaExpiraEn: { gt: instanteCambio } },
            ],
          },
          data: { estadoPago: "EN_ACREDITACION" },
        });
        if (cambio.count !== 1) return "conflicto";

        const pagoActualizado = await tx.payment.updateMany({
          where: {
            id: pago.id,
            pedidoId,
            proveedor: "transferencia",
            estado: "PENDIENTE",
          },
          data: { estado: "EN_ACREDITACION" },
        });
        if (pagoActualizado.count !== 1) {
          throw new Error("No se pudo actualizar el registro de transferencia");
        }
        await tx.pedidoEvento.create({
          data: {
            pedidoId,
            tipo: "PAGO_EN_ACREDITACION",
            descripcion: "El cliente informó que realizó la transferencia",
            estadoAnterior: "PENDIENTE",
            estadoNuevo: "EN_ACREDITACION",
            usuarioId: contexto.usuarioId,
            metadata: { origen: "cliente" },
          },
        });
        return "informado";
      });

      if (transaccion !== "conflicto") return transaccion;
      const estadoActual = await prisma.pedido.findFirst({
        where: { id: pedidoId, userId: contexto.usuarioId, metodoPago: "transferencia" },
        select: { estado: true, estadoPago: true },
      });
      return estadoActual?.estado === "PENDIENTE" &&
        estadoActual.estadoPago === "EN_ACREDITACION"
        ? "ya_informado"
        : "conflicto";
    });

    if (resultado === "informado") return { ok: true, yaInformado: false };
    if (resultado === "ya_informado") return { ok: true, yaInformado: true };
    if (resultado === "vencido") {
      return { ok: false, error: "El plazo para informar la transferencia ya venció" };
    }
    if (resultado === "invalido") {
      return { ok: false, error: "Este pedido no admite informar una transferencia" };
    }
    return { ok: false, error: "El pedido cambió. Actualizá la página e intentá nuevamente" };
  };
}
