"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { conPrisma, conPrismaTenant } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { liberarReservaStockPedido } from "@/lib/pedidos/gestionar-reserva-stock";
import {
  confirmarPagoManualEnTransaccion,
  rechazarTransferenciaEnTransaccion,
} from "@/lib/pedidos/transiciones-pago-manual";

const id = z.string().trim().min(1).max(191);
const esquemaEstado = z.object({ pedidoId: id, estado: z.enum(["EN_PREPARACION", "LISTO", "ENVIADO", "ENTREGADO", "CANCELADO"]) });
const esquemaEnvio = z.object({
  pedidoId: id,
  estadoEnvio: z.enum(["PREPARANDO", "DESPACHADO", "ENTREGADO"]),
});
const esquemaSeguimiento = z.object({
  pedidoId: id,
  transportistaId: id,
  trackingNumero: z.string().trim().min(1).max(120),
  trackingUrl: z.string().trim().max(1000).optional(),
  fechaEstimada: z.string().trim().optional(),
});

type Resultado = { ok: true } | { ok: false; error: string };

function invalidar(pedidoId: string) {
  revalidatePath("/admin/orders");
  revalidatePath("/admin/envios");
  revalidatePath(`/admin/orders/${pedidoId}`);
  revalidatePath("/mis-pedidos");
}

export async function aprobarPagoManual(pedidoIdRecibido: unknown): Promise<Resultado> {
  const parsed = id.safeParse(pedidoIdRecibido);
  if (!parsed.success) return { ok: false, error: "Pedido inválido" };
  try {
    const contexto = await requiereAdmin();
    const aprobado = await conPrismaTenant(contexto.tenantId, (prisma) =>
      prisma.$transaction((tx) => confirmarPagoManualEnTransaccion(
        tx, parsed.data, contexto.usuarioId, () => new Date(),
      )),
    );
    if (!aprobado) return { ok: false, error: "El pago no está pendiente o el pedido venció; no se puede confirmar" };
    invalidar(parsed.data);
    return { ok: true };
  } catch (error) {
    console.error("Error aprobando pago manual:", error);
    return { ok: false, error: "No se pudo aprobar el pago" };
  }
}

export async function rechazarTransferencia(pedidoIdRecibido: unknown): Promise<Resultado> {
  const parsed = id.safeParse(pedidoIdRecibido);
  if (!parsed.success) return { ok: false, error: "Pedido inválido" };
  try {
    const contexto = await requiereAdmin();
    const rechazado = await conPrismaTenant(contexto.tenantId, (prisma) =>
      prisma.$transaction((tx) => rechazarTransferenciaEnTransaccion(
        tx, parsed.data, contexto.usuarioId,
      )),
    );
    if (!rechazado) return { ok: false, error: "La transferencia ya fue resuelta o el pedido no admite rechazo" };
    invalidar(parsed.data);
    return { ok: true };
  } catch (error) {
    console.error("Error rechazando transferencia:", error);
    return { ok: false, error: "No se pudo rechazar la transferencia" };
  }
}

export async function cambiarEstadoPedido(datos: unknown): Promise<Resultado> {
  const parsed = esquemaEstado.safeParse(datos);
  if (!parsed.success) return { ok: false, error: "Estado inválido" };
  try {
    const contexto = await requiereAdmin();
    const { pedidoId, estado } = parsed.data;
    const actualizado = await conPrismaTenant(contexto.tenantId, (prisma) => prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.findUnique({ where: { id: pedidoId }, select: { estado: true, estadoPago: true, estadoEnvio: true, stockReservado: true, metodoEntrega: true } });
      if (!pedido) return false;
      if (estado === "CANCELADO") {
        if (pedido.estado !== "PENDIENTE" || pedido.estadoPago === "APROBADO") return false;
        const cambio = await tx.pedido.updateMany({ where: { id: pedidoId, estado: "PENDIENTE", estadoPago: { not: "APROBADO" } }, data: { estado: "CANCELADO", estadoPago: "CANCELADO" } });
        if (cambio.count !== 1) return false;
        if (pedido.stockReservado && !await liberarReservaStockPedido(pedidoId, tx)) throw new Error("No se pudo liberar el stock");
        await tx.payment.updateMany({ where: { pedidoId, estado: { not: "APROBADO" } }, data: { estado: "CANCELADO" } });
      } else {
        const orden = pedido.metodoEntrega === "DOMICILIO"
          ? ["CONFIRMADO", "EN_PREPARACION", "LISTO", "ENVIADO", "ENTREGADO"]
          : ["CONFIRMADO", "EN_PREPARACION", "LISTO", "ENTREGADO"];
        if (pedido.estadoPago !== "APROBADO" || orden.indexOf(estado) !== orden.indexOf(pedido.estado) + 1) return false;
        if (pedido.metodoEntrega === "DOMICILIO" && ["ENVIADO", "ENTREGADO"].includes(estado) && pedido.estadoEnvio !== "DESPACHADO") return false;
        const cambio = await tx.pedido.updateMany({ where: { id: pedidoId, estado: pedido.estado, estadoPago: "APROBADO" }, data: { estado, ...(estado === "ENTREGADO" ? { estadoEnvio: "ENTREGADO" } : {}) } });
        if (cambio.count !== 1) return false;
      }
      await tx.pedidoEvento.create({ data: { pedidoId, tipo: estado === "CANCELADO" ? "CANCELADO" : "CAMBIO_ESTADO", descripcion: `Estado del pedido: ${pedido.estado} → ${estado}`, estadoAnterior: pedido.estado, estadoNuevo: estado, usuarioId: contexto.usuarioId } });
      return true;
    }));
    if (!actualizado) return { ok: false, error: "Transición no permitida o pedido inexistente" };
    invalidar(pedidoId);
    return { ok: true };
  } catch (error) {
    console.error("Error cambiando estado del pedido:", error);
    return { ok: false, error: "No se pudo actualizar el pedido" };
  }
}

export async function cambiarEstadoEnvio(datos: unknown): Promise<Resultado> {
  const parsed = esquemaEnvio.safeParse(datos);
  if (!parsed.success) return { ok: false, error: "Estado de envío inválido" };
  try {
    const contexto = await requiereAdmin();
    const { pedidoId, estadoEnvio } = parsed.data;
    const actualizado = await conPrisma((prisma) => prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.findUnique({ where: { id: pedidoId }, select: { estado: true, estadoPago: true, estadoEnvio: true, metodoEntrega: true } });
      if (!pedido || pedido.estadoPago !== "APROBADO" || pedido.estado === "CANCELADO") return false;
      const orden = pedido.metodoEntrega === "DOMICILIO"
        ? ["PENDIENTE", "PREPARANDO", "DESPACHADO", "ENTREGADO"]
        : ["PENDIENTE", "PREPARANDO", "ENTREGADO"];
      if (orden.indexOf(estadoEnvio) !== orden.indexOf(pedido.estadoEnvio) + 1) return false;
      if (estadoEnvio === "DESPACHADO" && !["LISTO", "ENVIADO"].includes(pedido.estado)) return false;
      if (estadoEnvio === "ENTREGADO" && pedido.estado !== (pedido.metodoEntrega === "DOMICILIO" ? "ENVIADO" : "LISTO")) return false;
      const cambio = await tx.pedido.updateMany({ where: { id: pedidoId, estadoEnvio: pedido.estadoEnvio, estadoPago: "APROBADO" }, data: {
        estadoEnvio,
        ...(estadoEnvio === "DESPACHADO" && pedido.estado === "LISTO" ? { estado: "ENVIADO" } : {}),
        ...(estadoEnvio === "ENTREGADO" ? { estado: "ENTREGADO" } : {}),
      } });
      if (cambio.count !== 1) return false;
      if (estadoEnvio === "ENTREGADO") await tx.pedidoEnvio.updateMany({ where: { pedidoId, fechaEntrega: null }, data: { fechaEntrega: new Date() } });
      await tx.pedidoEvento.create({ data: { pedidoId, tipo: "CAMBIO_ENVIO", descripcion: `Estado del envío: ${pedido.estadoEnvio} → ${estadoEnvio}`, estadoAnterior: pedido.estadoEnvio, estadoNuevo: estadoEnvio, usuarioId: contexto.usuarioId } });
      return true;
    }));
    if (!actualizado) return { ok: false, error: "Transición de envío no permitida" };
    invalidar(pedidoId);
    return { ok: true };
  } catch (error) {
    console.error("Error cambiando estado del envío:", error);
    return { ok: false, error: "No se pudo actualizar el envío" };
  }
}

export async function guardarSeguimiento(datos: unknown): Promise<Resultado> {
  const parsed = esquemaSeguimiento.safeParse(datos);
  if (!parsed.success) return { ok: false, error: "Datos de seguimiento inválidos" };
  try {
    const contexto = await requiereAdmin();
    const { pedidoId, transportistaId, trackingNumero } = parsed.data;
    const fechaEstimada = parsed.data.fechaEstimada ? new Date(parsed.data.fechaEstimada) : null;
    if (fechaEstimada && Number.isNaN(fechaEstimada.getTime())) return { ok: false, error: "Fecha estimada inválida" };
    const actualizado = await conPrisma((prisma) => prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.findUnique({ where: { id: pedidoId }, select: { id: true, estadoPago: true, metodoEntrega: true } });
      if (!pedido || pedido.estadoPago !== "APROBADO" || pedido.metodoEntrega !== "DOMICILIO") return false;
      const transportista = await tx.transportista.findFirst({ where: { id: transportistaId, activo: true } });
      if (!transportista) return false;
      const candidata = parsed.data.trackingUrl || transportista.plantillaUrl?.replaceAll("{codigo}", encodeURIComponent(trackingNumero)) || "";
      if (transportista.requiereUrl && !parsed.data.trackingUrl) return false;
      let trackingUrl: string | null = null;
      if (candidata) {
        const url = new URL(candidata);
        if (url.protocol !== "https:" && url.protocol !== "http:") return false;
        trackingUrl = url.toString();
      }
      await tx.pedidoEnvio.upsert({ where: { pedidoId }, create: {
        pedidoId, metodoEntrega: "DOMICILIO", transportistaId, transportista: transportista.nombre,
        trackingNumero, trackingUrl, fechaEstimada, fechaDespacho: new Date(),
      }, update: { transportistaId, transportista: transportista.nombre, trackingNumero, trackingUrl, fechaEstimada } });
      await tx.pedidoEvento.create({ data: { pedidoId, tipo: "CAMBIO_ENVIO", descripcion: `Seguimiento registrado: ${transportista.nombre} ${trackingNumero}`, usuarioId: contexto.usuarioId } });
      return true;
    }));
    if (!actualizado) return { ok: false, error: "Pedido o transportista no válido" };
    invalidar(pedidoId);
    return { ok: true };
  } catch (error) {
    console.error("Error guardando seguimiento:", error);
    return { ok: false, error: "No se pudo guardar el seguimiento" };
  }
}
