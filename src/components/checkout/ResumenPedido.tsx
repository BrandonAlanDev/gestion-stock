"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { imagenAdmiteOptimizacion } from "@/lib/utilidades/imagen-admite-optimizacion";
import type { ItemResumenCheckout } from "@/lib/pedidos/tipos-resumen-checkout";

interface PropiedadesResumenPedido {
  items: ItemResumenCheckout[];
  subtotal: number | null;
  moneda: string;
  modalidadEntrega: "DOMICILIO" | "RETIRO_TIENDA" | null;
  cargando: boolean;
  error: string | null;
  avisoPrecio: string | null;
  alRevisarCarrito: () => void;
  children: ReactNode;
}

export default function ResumenPedido({
  items,
  subtotal,
  moneda,
  modalidadEntrega,
  cargando,
  error,
  avisoPrecio,
  alRevisarCarrito,
  children,
}: PropiedadesResumenPedido) {
  const monedaSegura = /^[A-Z]{3}$/.test(moneda) ? moneda : "ARS";
  const formatearPrecio = (precio: number) => new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: monedaSegura,
    maximumFractionDigits: 2,
  }).format(precio);
  const cantidadArticulos = items.reduce((total, item) => total + item.cantidad, 0);

  return (
    <section
      aria-labelledby="titulo-resumen-pedido"
      className="overflow-hidden rounded-2xl border"
      style={{
        backgroundColor: "var(--superficie-fondo)",
        borderColor: "color-mix(in srgb, var(--texto-sobre-fondo) 12%, transparent)",
      }}
    >
      <header
        className="flex items-start justify-between gap-3 border-b px-5 py-4 sm:px-6"
        style={{ borderColor: "color-mix(in srgb, var(--texto-sobre-fondo) 10%, transparent)" }}
      >
        <div>
          <h2 id="titulo-resumen-pedido" className="text-lg font-semibold tracking-tight">
            Resumen de tu pedido
          </h2>
          <p className="mt-1 text-sm opacity-65" aria-live="polite">
            {error
              ? "No se pudo validar el carrito"
              : cargando
                ? "Actualizando precios…"
                : `${cantidadArticulos} ${cantidadArticulos === 1 ? "artículo" : "artículos"}`}
          </p>
        </div>
        <span
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          aria-label={error
            ? "Hay productos que requieren revisión"
            : `${cantidadArticulos} ${cantidadArticulos === 1 ? "artículo" : "artículos"}`}
          style={{
            backgroundColor: error
              ? "color-mix(in srgb, hsl(var(--destructive)) 10%, var(--superficie-fondo))"
              : "color-mix(in srgb, var(--color-primario) 10%, var(--superficie-fondo))",
            color: error ? "hsl(var(--destructive))" : "var(--color-primario)",
          }}
        >
          {error ? "!" : cantidadArticulos}
        </span>
      </header>

      <div className="px-5 sm:px-6">
        {avisoPrecio && !error && (
          <p
            className="mt-4 rounded-lg border p-3 text-sm"
            role="status"
            aria-live="polite"
            style={{
              borderColor: "color-mix(in srgb, var(--color-primario) 35%, transparent)",
              backgroundColor: "color-mix(in srgb, var(--color-primario) 8%, var(--superficie-fondo))",
            }}
          >
            {avisoPrecio}
          </p>
        )}
        {error ? (
          <div className="space-y-3 py-5">
            <p
              className="text-sm"
              role="alert"
              style={{ color: "hsl(var(--destructive))" }}
            >
              {error}
            </p>
            <button
              type="button"
              onClick={alRevisarCarrito}
              className="rounded-lg border px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{
                borderColor: "color-mix(in srgb, var(--color-primario) 40%, transparent)",
                color: "var(--color-primario)",
              }}
            >
              Revisar carrito
            </button>
          </div>
        ) : cargando && items.length === 0 ? (
          <p className="py-5 text-sm opacity-65" role="status">Validando los productos del carrito…</p>
        ) : items.length === 0 ? (
          <p className="py-5 text-sm opacity-65">No hay productos para mostrar.</p>
        ) : (
          <ul className="max-h-72 overflow-y-auto overscroll-contain">
            {items.map((item) => {
              const imagen = item.imagen || "/images/placeholder.svg";
              return (
                <li
                  key={item.clave}
                  className="flex min-w-0 gap-3 border-b py-4 first:pt-5 last:border-b-0 last:pb-5"
                  style={{ borderColor: "color-mix(in srgb, var(--texto-sobre-fondo) 10%, transparent)" }}
                >
                  <div
                    className="relative size-[68px] shrink-0 overflow-hidden rounded-xl border sm:size-[76px]"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--texto-sobre-fondo) 3%, var(--superficie-fondo))",
                      borderColor: "color-mix(in srgb, var(--texto-sobre-fondo) 10%, transparent)",
                    }}
                  >
                    <Image
                      src={imagen}
                      alt={item.imagen ? item.nombre : "Producto sin imagen"}
                      fill
                      sizes="76px"
                      unoptimized={!imagenAdmiteOptimizacion(imagen)}
                      className="object-contain p-1.5"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <h3 className="line-clamp-2 min-w-0 text-sm font-medium leading-snug">
                        {item.nombre}
                      </h3>
                      <span className="shrink-0 whitespace-nowrap text-sm font-semibold tabular-nums">
                        {formatearPrecio(item.subtotal)}
                      </span>
                    </div>
                    {item.variante && <p className="truncate text-xs opacity-65">{item.variante}</p>}
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 text-xs opacity-70">
                      <span>{item.cantidad} {item.cantidad === 1 ? "unidad" : "unidades"}</span>
                      <span aria-hidden="true">·</span>
                      <span className="whitespace-nowrap tabular-nums">
                        {formatearPrecio(item.precioUnitario)} c/u
                      </span>
                      {item.precioAnterior !== null && (
                        <span className="whitespace-nowrap text-[11px] line-through opacity-55 tabular-nums">
                          {formatearPrecio(item.precioAnterior)} c/u antes
                        </span>
                      )}
                    </div>
                    {item.precioAnterior !== null && (
                      <p className="text-xs font-medium" style={{ color: "var(--color-primario)" }}>
                        Ahorrás {formatearPrecio((item.precioAnterior - item.precioUnitario) * item.cantidad)}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div
          className="space-y-2.5 border-t py-4 text-sm"
          style={{ borderColor: "color-mix(in srgb, var(--texto-sobre-fondo) 10%, transparent)" }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="opacity-70">Subtotal</span>
            <span className="whitespace-nowrap tabular-nums">
              {subtotal === null ? "—" : formatearPrecio(subtotal)}
            </span>
          </div>
          {modalidadEntrega === "DOMICILIO" && (
            <div className="flex items-center justify-between gap-3">
              <span className="opacity-70">Envío</span>
              <span className="text-right text-xs opacity-70">A coordinar con la tienda</span>
            </div>
          )}
          <div
            className="flex items-end justify-between gap-3 border-t pt-3"
            style={{ borderColor: "color-mix(in srgb, var(--texto-sobre-fondo) 10%, transparent)" }}
          >
            <span className="font-semibold">Total del pedido</span>
            <span className="whitespace-nowrap text-xl font-bold tracking-tight tabular-nums" style={{ color: "var(--color-primario)" }}>
              {subtotal === null ? "—" : formatearPrecio(subtotal)}
            </span>
          </div>
          <p className="text-xs leading-relaxed opacity-60">
            {modalidadEntrega === "DOMICILIO"
              ? "El costo de envío se coordina con la tienda y no está incluido en este total."
              : modalidadEntrega === "RETIRO_TIENDA"
                ? "El total se calcula con los precios vigentes de la tienda."
                : "Los precios se verifican nuevamente al confirmar el pedido."}
          </p>
        </div>
      </div>

      <div
        className="border-t px-5 py-4 sm:px-6"
        style={{ borderColor: "color-mix(in srgb, var(--texto-sobre-fondo) 10%, transparent)" }}
      >
        {children}
      </div>
    </section>
  );
}
