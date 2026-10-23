"use server";

import "server-only";
import { headers } from "next/headers";
import { z } from "zod";
import { conPrismaTenant } from "@/lib/prisma";
import { obtenerContextoTenant } from "@/lib/tenants/obtener-contexto-tenant";
import { normalizarHostname } from "@/lib/tenants/normalizar-hostname";
import { construirOrigenSolicitud } from "@/lib/tenants/construir-origen-solicitud";
import { crearPedidoDesdeCarrito } from "@/lib/pedidos/crear-pedido";
import { liberarReservaStockPedido } from "@/lib/pedidos/gestionar-reserva-stock";
import { obtenerProveedor } from "@/lib/pagos/registro";
import { obtenerMetodosPagoDisponibles } from "@/lib/pagos/obtener-metodos-disponibles";
import { filtrarMetodosDisponibles } from "@/lib/pagos/filtrar-metodos-disponibles";
import { crearAccionIniciarPago } from "@/lib/actions/pago/crear-accion-iniciar-pago";
import type { MetodoPagoId } from "@/lib/pagos/tipos";
import { esquemaDatosEntrega } from "@/lib/pedidos/datos-entrega";
import { obtenerOpcionesEntregaTienda } from "@/lib/pedidos/obtener-opciones-entrega-tienda";
import type { ItemParaCrearPedido } from "@/lib/pedidos/resolver-items-carrito";

const identificadorCheckout = z.union([
  z.string().min(1).max(100),
  z.number().int().positive(),
]);

const esquemaItemsCheckout = z.array(z.object({
  clave: z.string().min(1).max(200),
  productId: identificadorCheckout,
  variantId: identificadorCheckout,
  cantidad: z.number().int().positive().max(1000),
})).min(1).max(50).superRefine((items, contexto) => {
  const claves = new Set<string>();
  for (const [indice, item] of items.entries()) {
    if (claves.has(item.clave)) {
      contexto.addIssue({
        code: "custom",
        path: [indice, "clave"],
        message: "Cada producto debe tener una clave de carrito única.",
      });
    }
    claves.add(item.clave);
  }
});

const esquemaSubtotalCheckout = z.number().finite().nonnegative();

async function obtenerBaseUrl(): Promise<string> {
  const cabeceras = await headers();
  const hostRecibido = cabeceras.get("host") ?? "";
  const host = normalizarHostname(hostRecibido);
  if (!host) throw new Error("No se pudo determinar la URL base de la tienda");
  const origen = construirOrigenSolicitud(
    hostRecibido,
    process.env.NODE_ENV === "production",
  );
  if (!origen || new URL(origen).hostname.replace(/^\[|\]$/g, "") !== host) {
    throw new Error("Host de la tienda inválido");
  }
  return origen;
}

const ejecutarIniciarPago = crearAccionIniciarPago({
  obtenerContextoTenant,
  obtenerMetodosPagoDisponibles,
  obtenerOpcionesEntrega: obtenerOpcionesEntregaTienda,
  filtrarMetodosDisponibles,
  obtenerBaseUrl,
  crearPedidoDesdeCarrito,
  conPrismaTenant,
  liberarReservaStockPedido,
  obtenerProveedor,
  registrarError: (mensaje, detalle) => console.error(mensaje, detalle),
});

/**
 * Valida el método y el importe visto por el cliente antes de crear el pedido,
 * registrar el Payment pendiente y delegar la operación en el proveedor.
 */
export async function iniciarPago(
  metodo: MetodoPagoId,
  items: ItemParaCrearPedido[],
  datosEntrega: unknown,
  subtotalMostrado: unknown,
) {
  const articulos = esquemaItemsCheckout.safeParse(items);
  if (!articulos.success) {
    return { ok: false as const, error: "No se pudo validar el contenido del carrito." };
  }

  const datos = esquemaDatosEntrega.safeParse(datosEntrega);
  if (!datos.success) {
    return { ok: false as const, error: "Completá los datos de entrega." };
  }

  const subtotal = esquemaSubtotalCheckout.safeParse(subtotalMostrado);
  if (!subtotal.success) {
    return { ok: false as const, error: "No se pudo verificar el importe mostrado." };
  }

  return ejecutarIniciarPago(metodo, articulos.data, datos.data, subtotal.data);
}
