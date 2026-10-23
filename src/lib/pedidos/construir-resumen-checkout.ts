import type { ResumenCheckout } from "@/lib/pedidos/tipos-resumen-checkout";
import type { ItemParaCrearPedido, ItemPreparado } from "@/lib/pedidos/resolver-items-carrito";

/** Conserva las claves del carrito al presentar una cotización fresca del servidor. */
export function construirResumenCheckout(
  items: ItemParaCrearPedido[],
  preparados: ItemPreparado[],
  moneda: string,
): ResumenCheckout {
  const porVariante = new Map(preparados.map((item) => [item.variantId, item]));
  const itemsResumen = items.map((item, indice) => {
    const preparado = porVariante.get(String(item.variantId));
    if (!preparado || preparado.garmentId !== String(item.productId)) {
      throw new Error("Uno de los productos ya no está disponible");
    }

    return {
      clave: item.clave ?? `${String(item.variantId)}-${indice}`,
      productId: preparado.garmentId,
      variantId: preparado.variantId,
      nombre: preparado.nombre,
      variante: preparado.varianteDetalle,
      imagen: preparado.imagen,
      cantidad: item.cantidad,
      precioUnitario: preparado.precioUnitario,
      precioAnterior: preparado.precioAnterior,
      subtotal: preparado.precioUnitario * item.cantidad,
    };
  });

  return {
    items: itemsResumen,
    subtotal: itemsResumen.reduce((total, item) => total + item.subtotal, 0),
    moneda,
  };
}
