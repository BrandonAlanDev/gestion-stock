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
  const [agregando, setAgregando] = useState(false);

  const disponibilidad = useMemo<ResultadoDisponibilidad>(
    () => calcularDisponibilidad(modelo, seleccion, controlaStock),
    [modelo, seleccion, controlaStock]
  );

  const stockTotal = disponibilidad.stockTotal;

  const precioMostrado = disponibilidad.varianteSeleccionada?.priceOverride ?? Number(producto.price ?? 0);
  const precioAnterior = producto.maxPrice != null ? Number(producto.maxPrice) : null;

  const { addToCart } = useCart();

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
        addToCart({ id: producto.id, name: producto.name, price: precioMostrado, image: producto.images?.[0]?.srcImage });
        return { ok: true };
      }
      return { ok: false, error: "Elegí una combinación de talle y color con stock disponible." };
    }

    setAgregando(true);
    try {
      const respuesta = await agregarAlCarrito({
        productId: producto.id,
        variantId: variante.id,
        cantidad: 1,
      });
      if (!respuesta.ok) return { ok: false, error: respuesta.error };

      addToCart({
        id: producto.id,
        name: producto.name,
        price: precioMostrado,
        image: producto.images?.[0]?.srcImage,
        variantId: variante.id,
        varianteInfo: { ...seleccion },
        stock: variante.stock,
      });
      return { ok: true };
    } finally {
      setAgregando(false);
    }
  }, [disponibilidad, controlaStock, modelo, producto, precioMostrado, seleccion, addToCart]);

  return {
    modelo,
    seleccion,
    controlaStock,
    disponibilidad,
    stockTotal,
    precioMostrado,
    precioAnterior,
    alternarValor,
    agregando,
    manejarAgregar,
  };
}
