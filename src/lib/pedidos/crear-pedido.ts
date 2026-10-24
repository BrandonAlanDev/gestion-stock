import "server-only";

import { conPrismaTenant } from "@/lib/prisma";
import type { MetodoPagoId } from "@/lib/pagos/tipos";
import type { DatosEntrega } from "./datos-entrega";
import { reservarStockPedido } from "./gestionar-reserva-stock";
import { obtenerVencimientoReserva } from "./politica-reserva-stock";
import { resolverItemsCarrito } from "./resolver-items-carrito";
import { construirResumenCheckout } from "./construir-resumen-checkout";
import { coincidenSubtotalesCheckout } from "./comparar-subtotales-checkout";
import { bloquearVariantes } from "@/lib/inventario/variantes-transaccion";
import type { ItemParaCrearPedido } from "./resolver-items-carrito";
import type { ResumenCheckout } from "./tipos-resumen-checkout";
import { ErrorItemCarrito } from "./resolver-items-carrito";

export type { ItemParaCrearPedido } from "./resolver-items-carrito";

export type ResultadoCrearPedido =
  | {
      ok: true;
      pedidoId: string;
      numero: number;
      total: number;
      moneda: string;
    }
  | {
      ok: false;
      codigo: "PRECIOS_CAMBIARON";
      error: string;
      resumen: ResumenCheckout;
    };

/**
 * Recalcula precios y stock en el servidor. Si el subtotal vigente difiere del
 * mostrado, devuelve el resumen actualizado sin crear el pedido.
 * Requiere que quien lo llama ya haya validado la sesión del comprador.
 */
export async function crearPedidoDesdeCarrito(
  tenantId: string,
  userId: string,
  items: ItemParaCrearPedido[],
  metodoPago: MetodoPagoId,
  datosEntrega: DatosEntrega | undefined,
  subtotalMostrado: number,
): Promise<ResultadoCrearPedido> {
  if (!items.length) throw new Error("El carrito está vacío");
  if (!Number.isFinite(subtotalMostrado)) {
    throw new Error("No se pudo validar el importe mostrado en el checkout");
  }

  return conPrismaTenant(tenantId, async (prisma) => {
    const pageConfig = await prisma.pageConfig.findUnique({
      where: { clave: "principal" },
      select: { currency: true },
    });
    const moneda = pageConfig?.currency ?? "ARS";

    const itemsPreparados = await resolverItemsCarrito(prisma, items);
    const resumenVigente = construirResumenCheckout(items, itemsPreparados, moneda);
    const total = resumenVigente.subtotal;

    if (total <= 0) throw new Error("El total del pedido es inválido");
    if (!coincidenSubtotalesCheckout(subtotalMostrado, total)) {
      return {
        ok: false as const,
        codigo: "PRECIOS_CAMBIARON" as const,
        error: "Los precios cambiaron mientras completabas la compra. Revisá el nuevo total y confirmá nuevamente.",
        resumen: resumenVigente,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    const pedido = await prisma.$transaction(async (tx) => {
      const idsBloqueados = await bloquearVariantes(
        tx,
        itemsPreparados.map((item) => item.variantId),
      );
      if (idsBloqueados.length !== new Set(itemsPreparados.map((item) => item.variantId)).size) {
        throw new ErrorItemCarrito(
          "PRODUCTO_NO_DISPONIBLE",
          "Una variante del carrito ya no está disponible. Revisá el carrito para corregirlo.",
        );
      }

      const numeracion = await tx.numeroPedido.create({ data: {} });
      const configuracionMetodo = await tx.metodoPago.findUnique({
        where: { metodo: metodoPago },
        select: { activo: true, config: true },
      });
      if (!configuracionMetodo?.activo) {
        throw new Error("El método de pago ya no está habilitado para este comercio");
      }
      const creadoEn = new Date();
      const creado = await tx.pedido.create({
        data: {
          numero: numeracion.id,
          userId,
          metodoPago,
          total,
          subtotal: total,
          moneda,
          nombreCliente: datosEntrega?.nombre ?? user?.name ?? null,
          apellidoCliente: datosEntrega?.apellido ?? null,
          telefonoCliente: datosEntrega?.telefono ?? null,
          emailCliente: user?.email ?? null,
          metodoEntrega: datosEntrega?.metodoEntrega ?? "RETIRO_TIENDA",
          stockReservado: true,
          createdAt: creadoEn,
          reservaExpiraEn: obtenerVencimientoReserva(
            metodoPago,
            creadoEn,
            configuracionMetodo.config,
          ),
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

    return { ok: true as const, pedidoId: pedido.id, numero: pedido.numero ?? 0, total, moneda };
  });
}
