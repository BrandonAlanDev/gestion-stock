import "server-only";

import { conPrismaTenant } from "@/lib/prisma";
import type { MetodoPagoId } from "@/lib/pagos/tipos";
import type { DatosEntrega } from "./datos-entrega";
import { reservarStockPedido } from "./gestionar-reserva-stock";
import { obtenerVencimientoReserva } from "./politica-reserva-stock";
import { resolverItemsCarrito } from "./resolver-items-carrito";
import type { ItemParaCrearPedido } from "./resolver-items-carrito";

export type { ItemParaCrearPedido } from "./resolver-items-carrito";

export type ResultadoCrearPedido = {
  pedidoId: string;
  numero: number;
  total: number;
  moneda: string;
};

/**
 * Crea un pedido a partir de los ítems del carrito, recalculando los precios y
 * validando el stock en el servidor (el total que llega del cliente se ignora).
 * Requiere que quien lo llama ya haya validado la sesión del comprador.
 */
export async function crearPedidoDesdeCarrito(
  tenantId: string,
  userId: string,
  items: ItemParaCrearPedido[],
  metodoPago: MetodoPagoId,
  datosEntrega?: DatosEntrega,
): Promise<ResultadoCrearPedido> {
  if (!items.length) throw new Error("El carrito está vacío");

  return conPrismaTenant(tenantId, async (prisma) => {
  const pageConfig = await prisma.pageConfig.findFirst({
    where: {},
    select: { currency: true },
  });
  const moneda = pageConfig?.currency ?? "ARS";

  const itemsPreparados = await resolverItemsCarrito(prisma, items);
  const total = itemsPreparados.reduce((acumulado, item) => acumulado + item.subtotal, 0);

  if (total <= 0) throw new Error("El total del pedido es inválido");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  const pedido = await prisma.$transaction(async (tx) => {
    const numeracion = await tx.numeroPedido.create({ data: {} });
    const creado = await tx.pedido.create({
      data: {
        numero: numeracion.id,
        userId,
        total,
        subtotal: total,
        moneda,
        nombreCliente: datosEntrega?.nombre ?? user?.name ?? null,
        apellidoCliente: datosEntrega?.apellido ?? null,
        telefonoCliente: datosEntrega?.telefono ?? null,
        emailCliente: user?.email ?? null,
        metodoEntrega: datosEntrega?.metodoEntrega ?? "RETIRO_TIENDA",
        stockReservado: true,
        reservaExpiraEn: obtenerVencimientoReserva(metodoPago, new Date()),
        items: {
          create: itemsPreparados.map((item) => ({
            garmentId: item.garmentId,
            variantId: item.variantId,
            nombre: item.nombre,
            varianteNombre: item.varianteNombre,
            imagen: item.imagen,
            precioUnitario: item.precioUnitario,
            cantidad: item.cantidad,
            subtotal: item.subtotal,
          })),
        },
        envio: datosEntrega?.metodoEntrega === "DOMICILIO" ? { create: {
          metodoEntrega: "DOMICILIO",
          destinatario: datosEntrega.destinatario,
          telefono: datosEntrega.telefono,
          calle: datosEntrega.calle,
          numero: datosEntrega.numero,
          piso: datosEntrega.piso || null,
          departamento: datosEntrega.departamento || null,
          codigoPostal: datosEntrega.codigoPostal,
          localidad: datosEntrega.localidad,
          provincia: datosEntrega.provincia,
          referencias: datosEntrega.referencias || null,
        } } : undefined,
        eventos: { create: { tipo: "CREACION", descripcion: "Pedido creado" } },
      },
    });
    await reservarStockPedido(creado.id, tx);
    return creado;
  });

  return { pedidoId: pedido.id, numero: pedido.numero ?? 0, total, moneda };
  });
}
