"use client";

import { Truck } from "lucide-react";
import ProductAction from "@/components/ui/ProductAction";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { useSeleccionProducto } from "@/hooks/tienda/use-seleccion-producto";
import type { ProductoDetalleSerializado } from "@/types/productos/detalle-producto";

interface PropiedadesSelectorProducto {
  product: ProductoDetalleSerializado;
}

export default function SelectorProducto({ product }: PropiedadesSelectorProducto) {
  const { pageConfig } = usePageConfig();
  const {
    modelo,
    seleccion,
    controlaStock,
    disponibilidad,
    stockTotal,
    precioMostrado,
    precioAnterior,
    alternarValor,
    manejarAgregar,
  } = useSeleccionProducto(product);

  const conVariantes = modelo.grupos.length > 0 || modelo.variantes.length > 0;
  const hayPrecioAnterior = precioAnterior != null && precioAnterior > precioMostrado;
  const moneda = typeof pageConfig?.currency === "string" && /^[A-Z]{3}$/.test(pageConfig.currency) ? pageConfig.currency : "ARS";
  const formatearPrecio = (precio: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: moneda, maximumFractionDigits: 2 }).format(precio);

  return (
    <div className="flex flex-col space-y-7 lg:sticky lg:top-28">

      <div className="space-y-4">
        <p className="text-sm font-medium" style={{ color: "var(--color-primario)" }}>
          {product.category?.name}
          {product.subCategory?.name && ` / ${product.subCategory.name}`}
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-[var(--texto-sobre-fondo)] sm:text-4xl">
          {product.name}
        </h1>
      </div>

      <div className="border-b border-current/15 pb-6">
        <span>
          {hayPrecioAnterior && (
            <span className="mr-2 text-lg text-[var(--texto-sobre-fondo)] opacity-40 line-through">
              {formatearPrecio(precioAnterior)}
            </span>
          )}
          <span className="text-2xl font-bold text-[var(--texto-sobre-fondo)]">
            {formatearPrecio(precioMostrado)}
          </span>
        </span>
      </div>

      {modelo.grupos.map((grupo) => {
        const valorSeleccionado = seleccion[grupo.name];
        const disponibilidadGrupo = disponibilidad.disponiblePorGrupo[grupo.name];
        return (
          <div key={grupo.name} className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--texto-sobre-fondo)]">
              {grupo.name}
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {grupo.values.map((valor) => {
                const sinStock = controlaStock && disponibilidadGrupo?.[valor.id] === false;
                const seleccionado = valorSeleccionado === valor.value;
                const estilo =
                  sinStock
                    ? "border-[var(--color-secundario)] text-[var(--texto-sobre-fondo)] opacity-40 cursor-not-allowed"
                    : seleccionado
                      ? "border-[var(--color-primario)] text-[var(--color-primario)]"
                      : "border-[var(--color-secundario)] text-[var(--texto-sobre-fondo)] opacity-70";
                return (
                  <button
                    key={valor.id}
                    onClick={() => alternarValor(grupo.name, valor.value)}
                    disabled={sinStock}
                    className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-medium transition ${estilo}`}
                  >
                    {valor.value}
                    {sinStock && (
                      <span className="ml-1.5 text-[10px] uppercase tracking-wide opacity-70">Sin stock</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {conVariantes && (
        <div className="text-xs text-[var(--texto-sobre-fondo)] opacity-60">
          {disponibilidad.varianteSeleccionada
            ? disponibilidad.stockDisponible > 0
              ? `${disponibilidad.stockDisponible} unidades disponibles`
              : "Sin stock en esta combinación"
            : stockTotal > 0
              ? `${stockTotal} unidades disponibles`
              : "Sin stock disponible"}
        </div>
      )}

      <div className="space-y-3 border-y border-current/15 py-4 text-sm text-[var(--texto-sobre-fondo)] opacity-70">
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5" style={{ color: "var(--color-primario)" }} />
          <p>Envíos y logística a coordinar para todo el país.</p>
        </div>
      </div>

      <ProductAction
        product={product}
        seleccion={seleccion}
        deshabilitado={!disponibilidad.comboValido}
        onAgregar={manejarAgregar}
      />
    </div>
  );
}
