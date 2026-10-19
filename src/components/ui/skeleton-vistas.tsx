import type { ReactNode } from "react";

function Bloque({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-md bg-[var(--color-esqueleto)] motion-safe:animate-pulse ${className}`} />
  );
}

function EstadoCarga({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  return (
    <div
      role="status"
      aria-label="Cargando contenido"
      className={admin
        ? "[--color-esqueleto:var(--admin-fondo-hover,#e8e9eb)]"
        : "[--color-esqueleto:color-mix(in_srgb,var(--texto-sobre-fondo)_12%,var(--color-fondo-sitio))]"}
    >
      <div aria-hidden="true">{children}</div>
      <span className="sr-only">Cargando contenido...</span>
    </div>
  );
}

export function SkeletonFilas({ filas = 5, admin = true }: { filas?: number; admin?: boolean }) {
  return (
    <EstadoCarga admin={admin}>
      <div className={`overflow-hidden rounded-lg ${admin ? "bg-[var(--admin-fondo-opaco,#fff)]" : "bg-[var(--superficie-fondo)]"}`}>
        {Array.from({ length: filas }, (_, indice) => (
          <div
            key={indice}
            className="flex items-center gap-4 border-b border-current/5 p-4 last:border-0"
          >
            <Bloque className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Bloque className="h-4 w-2/3 max-w-56" />
              <Bloque className="h-3 w-1/3 max-w-32" />
            </div>
            <Bloque className="hidden h-4 w-20 sm:block" />
            <Bloque className="h-8 w-16 shrink-0" />
          </div>
        ))}
      </div>
    </EstadoCarga>
  );
}

export function SkeletonTarjetas({ cantidad = 6, admin = true }: { cantidad?: number; admin?: boolean }) {
  return (
    <EstadoCarga admin={admin}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cantidad }, (_, indice) => (
          <div
            key={indice}
            className={`space-y-4 rounded-xl p-5 ${admin ? "bg-[var(--admin-fondo-opaco,#fff)]" : "bg-[var(--superficie-fondo)]"}`}
          >
            <Bloque className="h-5 w-2/3" />
            <Bloque className="h-3 w-full" />
            <Bloque className="h-3 w-4/5" />
            <Bloque className="h-9 w-24" />
          </div>
        ))}
      </div>
    </EstadoCarga>
  );
}

export function SkeletonAdmin({ tipo = "lista" }: { tipo?: "lista" | "tarjetas" | "panel" | "editor" }) {
  return (
    <div className="min-h-[65vh] bg-[var(--admin-fondo,#f6f6f7)] px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <EstadoCarga admin>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <Bloque className="h-8 w-44" />
              <Bloque className="h-4 w-64 max-w-[70vw]" />
            </div>
            <Bloque className="h-10 w-28" />
          </div>
          {tipo === "panel" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, indice) => (
                <div key={indice} className="space-y-5 rounded-xl bg-[var(--admin-fondo-opaco,#fff)] p-5">
                  <Bloque className="h-4 w-24" />
                  <Bloque className="h-8 w-32" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-[var(--admin-fondo-opaco,#fff)] p-4">
              <Bloque className="h-10 w-full" />
            </div>
          )}
          {tipo === "editor" && (
            <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
              <div className="space-y-3">
                <Bloque className="h-10 w-full" />
                <Bloque className="h-10 w-full" />
                <Bloque className="h-10 w-full" />
              </div>
              <div className="space-y-3">
                <Bloque className="h-32 w-full" />
                <Bloque className="h-32 w-full" />
              </div>
            </div>
          )}
          {tipo === "panel" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Bloque className="h-72 w-full" />
              <Bloque className="h-72 w-full" />
            </div>
          )}
        </EstadoCarga>
        {tipo === "lista" && <SkeletonFilas />}
        {tipo === "tarjetas" && <SkeletonTarjetas />}
      </div>
    </div>
  );
}

type TipoSkeletonTienda =
  | "inicio"
  | "catalogo"
  | "producto"
  | "checkout"
  | "contenido"
  | "estado"
  | "panel"
  | "lista";

export function SkeletonTienda({ tipo = "catalogo" }: { tipo?: TipoSkeletonTienda }) {
  return (
    <div className="min-h-[65vh] bg-[var(--color-fondo-sitio)] px-4 py-8 text-[var(--texto-sobre-fondo)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <EstadoCarga>
          {tipo === "inicio" && (
            <div className="space-y-8">
              <Bloque className="h-[40vh] min-h-72 w-full rounded-2xl" />
              <Bloque className="mx-auto h-7 w-52" />
            </div>
          )}
          {tipo === "producto" && (
            <div className="grid gap-8 lg:grid-cols-2">
              <Bloque className="aspect-square w-full rounded-xl" />
              <div className="space-y-5 pt-4">
                <Bloque className="h-5 w-28" />
                <Bloque className="h-10 w-4/5" />
                <Bloque className="h-7 w-32" />
                <Bloque className="h-20 w-full" />
                <Bloque className="h-12 w-full" />
                <Bloque className="h-12 w-44" />
              </div>
            </div>
          )}
          {tipo === "estado" && (
            <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-5">
              <Bloque className="h-24 w-24 rounded-full" />
              <Bloque className="h-8 w-3/4" />
              <Bloque className="h-4 w-full" />
              <Bloque className="h-24 w-full" />
            </div>
          )}
          {tipo === "checkout" && (
            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              <div className="space-y-5">
                <Bloque className="h-8 w-48" />
                <Bloque className="h-4 w-64" />
                <Bloque className="h-24 w-full" />
                <Bloque className="h-24 w-full" />
              </div>
              <Bloque className="h-72 w-full rounded-xl" />
            </div>
          )}
          {tipo === "panel" && (
            <div className="space-y-6">
              <Bloque className="h-8 w-52" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, indice) => (
                  <Bloque key={indice} className="h-28 w-full rounded-xl" />
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Bloque className="h-72 w-full rounded-xl" />
                <Bloque className="h-72 w-full rounded-xl" />
              </div>
            </div>
          )}
          {tipo === "lista" && (
            <div className="space-y-6">
              <Bloque className="h-8 w-64 max-w-full" />
              <Bloque className="h-4 w-80 max-w-full" />
              <SkeletonFilas filas={7} admin={false} />
            </div>
          )}
          {tipo === "contenido" && (
            <div className="space-y-6">
              <Bloque className="h-64 w-full rounded-xl" />
              <Bloque className="mx-auto h-8 w-52" />
              <Bloque className="h-24 w-full" />
              <Bloque className="h-24 w-full" />
            </div>
          )}
          {tipo === "catalogo" && (
            <div className="space-y-4">
              <Bloque className="h-8 w-52" />
              <Bloque className="h-4 w-72 max-w-full" />
              <Bloque className="h-11 w-full" />
            </div>
          )}
        </EstadoCarga>
        {(tipo === "catalogo" || tipo === "inicio") && (
          <EstadoCarga>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, indice) => (
                <div key={indice} className="space-y-3">
                  <Bloque className="aspect-[3/4] w-full rounded-xl" />
                  <Bloque className="h-4 w-4/5" />
                  <Bloque className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </EstadoCarga>
        )}
      </div>
    </div>
  );
}

export function SkeletonAcceso() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-fondo-sitio)] px-4">
      <div className="w-full max-w-md space-y-5 rounded-2xl p-6">
        <EstadoCarga>
          <div className="space-y-5">
            <Bloque className="mx-auto h-14 w-14 rounded-full" />
            <Bloque className="mx-auto h-8 w-48" />
            <Bloque className="h-12 w-full" />
            <Bloque className="h-12 w-full" />
            <Bloque className="h-12 w-full" />
            <Bloque className="mx-auto h-4 w-40" />
          </div>
        </EstadoCarga>
      </div>
    </div>
  );
}
