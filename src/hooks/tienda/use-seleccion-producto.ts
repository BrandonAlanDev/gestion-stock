"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { construirModeloVisual, type ModeloVisual } from "@/lib/productos/opciones-visuales";
import { calcularDisponibilidad, type ResultadoDisponibilidad } from "@/lib/productos/disponibilidad-producto";
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

  const { cartItems, cartLoaded, addToCart, confirmarAdicion } = useCart();
  const varianteSeleccionada = disponibilidad.varianteSeleccionada;
  const cantidadEnCarrito = cartItems.reduce(
    (total, item) => total + (
      String(item.id) === String(producto.id) && item.variantId === varianteSeleccionada?.id
        ? item.qty
        : 0
    ),
    0,
  );
  const maximoVariante = controlaStock && varianteSeleccionada
    ? varianteSeleccionada.stock
    : null;
  const maximoAlcanzado = maximoVariante !== null && cantidadEnCarrito >= maximoVariante;

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

  const manejarAgregar = useCallback((): void => {
    const variante = disponibilidad.varianteSeleccionada;
    if (!cartLoaded) return;

    if (!variante || !disponibilidad.comboValido) {
      if (!controlaStock && modelo.grupos.length === 0) {
        const token = addToCart({ id: producto.id, name: producto.name, price: precioMostrado, image: producto.images?.[0]?.srcImage });
        confirmarAdicion(token);
      }
      return;
    }

    if (maximoVariante !== null && cantidadEnCarrito >= maximoVariante) return;

    const token = addToCart({
      id: producto.id,
      name: producto.name,
      price: precioMostrado,
      image: producto.images?.[0]?.srcImage,
      variantId: variante.id,
      varianteInfo: { ...seleccion },
      stock: maximoVariante ?? undefined,
    });
    confirmarAdicion(token, maximoVariante ?? undefined);
  }, [
    disponibilidad,
    controlaStock,
    cartLoaded,
    maximoVariante,
    modelo,
    producto,
    precioMostrado,
    seleccion,
    cantidadEnCarrito,
    addToCart,
    confirmarAdicion,
  ]);

  return {
    modelo,
    seleccion,
    controlaStock,
    disponibilidad,
    precioMostrado,
    precioAnterior,
    cartLoaded,
    maximoVariante,
    maximoAlcanzado,
    alternarValor,
    manejarAgregar,
  };
}
