import "server-only";

import { conPrisma } from "@/lib/prisma";
import type { MetodoPagoId } from "@/lib/pagos/tipos";
import type { DatosEntrega } from "./datos-entrega";
import { reservarStockPedido } from "./gestionar-reserva-stock";
import { obtenerVencimientoReserva } from "./politica-reserva-stock";

export type ItemParaCrearPedido = {
  productId: string | number;
  variantId: string | number;
  cantidad: number;
};

export type ResultadoCrearPedido = {
  pedidoId: string;
  numero: number;
  total: number;
  moneda: string;
};

type ItemPreparado = {
  garmentId: string;
  variantId: string;
  nombre: string;
  varianteNombre: string | null;
  imagen: string | null;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
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

  return conPrisma(async (prisma) => {
  const pageConfig = await prisma.pageConfig.findFirst({
    where: {},
    select: { currency: true },
  });
  const moneda = pageConfig?.currency ?? "ARS";

  const itemsPreparados: ItemPreparado[] = [];
  let total = 0;
  const cantidadesPorVariante = new Map<string, { productId: string; cantidad: number }>();

  for (const item of items) {
    if (!Number.isInteger(item.cantidad) || item.cantidad < 1) {
      throw new Error("La cantidad de un ítem no es válida");
    }
    const variantId = String(item.variantId);
    const productId = String(item.productId);
    const anterior = cantidadesPorVariante.get(variantId);
    if (anterior && anterior.productId !== productId) {
      throw new Error("Una variante pertenece a productos distintos");
    }
    cantidadesPorVariante.set(variantId, {
      productId,
      cantidad: (anterior?.cantidad ?? 0) + item.cantidad,
    });
  }

  for (const [variantId, item] of cantidadesPorVariante) {
    if (!Number.isSafeInteger(item.cantidad)) {
      throw new Error("La cantidad de un ítem no es válida");
    }

    const variante = await prisma.garmentVariant.findFirst({
      where: {
        id: variantId,
        garmentId: item.productId,
        garment: { active: true },
      },
      include: {
        garment: { select: { name: true, price: true, controlaStock: true, images: { orderBy: { order: "asc" }, take: 1, select: { srcImage: true } } } },
        optionValues: { include: { optionValue: true } },
      },
    });

    if (!variante) throw new Error("Uno de los productos ya no está disponible");

    if (variante.garment.controlaStock && item.cantidad > variante.stock) {
      throw new Error(`Stock insuficiente para un producto (${variante.stock} disponibles)`);
    }

    const precioUnitario = Number(variante.priceOverride ?? variante.garment.price);

    itemsPreparados.push({
      garmentId: item.productId,
      variantId,
      nombre: variante.garment.name,
      varianteNombre: variante.optionValues.map((valor) => valor.optionValue.value).join(" · ") || null,
      imagen: variante.garment.images[0]?.srcImage ?? null,
      precioUnitario,
      cantidad: item.cantidad,
      subtotal: precioUnitario * item.cantidad,
    });

    total += precioUnitario * item.cantidad;
  }

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
        items: { create: itemsPreparados },
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
