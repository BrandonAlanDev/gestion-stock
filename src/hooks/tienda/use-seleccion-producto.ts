"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { construirModeloVisual, type ModeloVisual } from "@/lib/productos/opciones-visuales";
import { calcularDisponibilidad, type ResultadoDisponibilidad } from "@/lib/productos/disponibilidad-producto";
import { agregarAlCarrito } from "@/actions/carrito/agregar-al-carrito";
import { useCart } from "@/contextos/carrito/use-carrito";
import type { ProductoDetalleSerializado } from "@/types/productos/detalle-producto";

export function useSeleccionProducto(producto: ProductoDetalleSerializado) {
  const modelo = useMemo<ModeloVisual>(() => construirModeloVisual(producto), [producto]);
  const controlaStock = producto.controlaStock ?? true;

  const [seleccion, setSeleccion] = useState<Record<string, string>>({});

  const disponibilidad = useMemo<ResultadoDisponibilidad>(
    () => calcularDisponibilidad(modelo, seleccion, false),
    [modelo, seleccion]
  );

  const precioMostrado = disponibilidad.varianteSeleccionada?.priceOverride ?? Number(producto.price ?? 0);
  const precioAnterior = producto.maxPrice != null ? Number(producto.maxPrice) : null;

  const { cartItems, addToCart, confirmarAdicion, revertirAdicion } = useCart();

  useEffect(() => {
    setSeleccion((prev) => {
      const filtradas = Object.entries(prev).filter(([grupo, valor]) =>
        disponibilidad.disponiblePorGrupo[grupo]?.[valor] !== false
      );
      if (filtradas.length === Object.keys(prev).length) return prev;
      return Object.fromEntries(filtradas);
    });
  }, [disponibilidad]);

  const alternarValor = useCallback(
    (grupo: string, valor: string) => {
      const seleccionadoPrevio = seleccion[grupo] === valor;
      setSeleccion((prev) => ({ ...prev, [grupo]: seleccionadoPrevio ? "" : valor }));
    },
    [seleccion]
  );

  const manejarAgregar = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    const variante = disponibilidad.varianteSeleccionada;

    if (!variante || !disponibilidad.comboValido) {
      if (!controlaStock && modelo.grupos.length === 0) {
        const token = addToCart({ id: producto.id, name: producto.name, price: precioMostrado, image: producto.images?.[0]?.srcImage });
        confirmarAdicion(token);
        return { ok: true };
      }
      return { ok: false, error: "Elegí una combinación de talle y color con stock disponible." };
    }

    const cantidadEnCarrito = cartItems.reduce(
      (total, item) => total + (
        String(item.id) === String(producto.id)
        && item.variantId === variante.id
          ? item.qty
          : 0
      ),
      0,
    );
    const itemExistente = cartItems.find(
      (item) => String(item.id) === String(producto.id) && item.variantId === variante.id,
    );

    const token = addToCart({
      id: producto.id,
      name: producto.name,
      price: precioMostrado,
      image: producto.images?.[0]?.srcImage,
      variantId: variante.id,
      varianteInfo: { ...seleccion },
      stock: controlaStock ? itemExistente?.stock : undefined,
    });

    try {
      const respuesta = await agregarAlCarrito({
        productId: producto.id,
        variantId: variante.id,
        cantidad: cantidadEnCarrito + 1,
      });
      if (!respuesta.ok) {
        revertirAdicion(token);
        return { ok: false, error: respuesta.error };
      }

      confirmarAdicion(token, respuesta.controlaStock ? respuesta.stock : undefined);
      return { ok: true };
    } catch {
      revertirAdicion(token);
      return { ok: false, error: "No se pudo validar la disponibilidad. Intentá de nuevo." };
    }
  }, [
    disponibilidad,
    controlaStock,
    modelo,
    producto,
    precioMostrado,
    seleccion,
    cartItems,
    addToCart,
    confirmarAdicion,
    revertirAdicion,
  ]);

  return {
    modelo,
    seleccion,
    controlaStock,
    disponibilidad,
    precioMostrado,
    precioAnterior,
    alternarValor,
    manejarAgregar,
  };
}
