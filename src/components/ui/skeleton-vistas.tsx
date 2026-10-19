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

export function SkeletonFilas({ filas = 5, admin = true, tipo = "general" }: { filas?: number; admin?: boolean; tipo?: "general" | "movimientos" | "paginas" }) {
  if (tipo === "movimientos") {
    return <EstadoCarga admin={admin}><div className={admin ? "rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)]" : "rounded-3xl border border-current/10"}><div className={admin ? "hidden xl:block" : "overflow-x-auto"}><div className="min-w-[700px]"><div className="grid grid-cols-6 gap-4 border-b border-current/10 p-5">{Array.from({ length: 6 }, (_, indice) => <Bloque key={indice} className="h-3 w-20 max-w-full" />)}</div>{Array.from({ length: filas }, (_, indice) => <div key={indice} className="grid grid-cols-6 items-center gap-4 border-b border-current/10 p-5 last:border-0">{Array.from({ length: 6 }, (_, columna) => <Bloque key={columna} className={columna === 1 ? "h-5 w-32 max-w-full" : "h-4 w-20 max-w-full"} />)}</div>)}</div></div>{admin && <div className="space-y-2 p-3 xl:hidden">{Array.from({ length: filas }, (_, indice) => <div key={indice} className="space-y-4 rounded-xl border border-[var(--admin-borde)] p-4"><div className="flex justify-between"><Bloque className="h-5 w-36" /><Bloque className="h-5 w-20" /></div><div className="flex justify-between border-t border-current/10 pt-3"><Bloque className="h-4 w-24" /><Bloque className="h-4 w-20" /></div></div>)}</div>}</div></EstadoCarga>;
  }
  return (
    <EstadoCarga admin={admin}>
      <div className={`overflow-hidden rounded-xl border ${admin ? "border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)]" : "border-current/10 bg-[var(--superficie-fondo)]"}`}>
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

export function SkeletonTarjetas({ cantidad = 6, admin = true, tipo = "general" }: { cantidad?: number; admin?: boolean; tipo?: "general" | "categorias" | "talles" | "proveedores" | "pagos" }) {
  return (
    <EstadoCarga admin={admin}>
      <div className={tipo === "pagos" ? "flex flex-col gap-3" : tipo === "talles" || tipo === "proveedores" ? "grid grid-cols-1 gap-3 md:grid-cols-2" : "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"}>
        {Array.from({ length: cantidad }, (_, indice) => (
          <div
            key={indice}
            className={`space-y-4 rounded-xl border p-5 ${admin ? "border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)]" : "border-current/10 bg-[var(--superficie-fondo)]"}`}
          >
            {tipo === "pagos" ? <div className="flex items-center gap-3"><Bloque className="h-5 w-5 rounded-full" /><Bloque className="h-5 w-40" /><Bloque className="ml-auto h-5 w-16" /></div> : tipo === "talles" ? <><div className="flex justify-between border-b border-current/10 pb-4"><Bloque className="h-5 w-32" /><Bloque className="h-8 w-20" /></div><div className="flex gap-2"><Bloque className="h-9 w-16" /><Bloque className="h-9 w-16" /><Bloque className="h-9 w-24" /></div></> : tipo === "categorias" ? <><div className="flex justify-between"><Bloque className="h-3 w-20" /><Bloque className="h-8 w-8" /></div><Bloque className="h-6 w-36" /><Bloque className="h-4 w-28" /><Bloque className="h-9 w-full" /></> : <><Bloque className="h-5 w-2/3" /><Bloque className="h-3 w-4/5" /><Bloque className="h-7 w-32" /><Bloque className="h-4 w-20" /></>}
          </div>
        ))}
      </div>
    </EstadoCarga>
  );
}

type TipoAdmin = "panel" | "categorias" | "talles" | "proveedores" | "movimientos" | "paginas" | "configuracion" | "diseno";

export function SkeletonAdmin({ tipo = "panel" }: { tipo?: TipoAdmin }) {
  if (tipo === "diseno") {
    return <EstadoCarga admin><div className="space-y-5"><Bloque className="h-4 w-96 max-w-full" /><div className="grid grid-cols-1 gap-3 lg:grid-cols-2">{Array.from({ length: 4 }, (_, indice) => <div key={indice} className="space-y-4 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-5"><Bloque className="h-5 w-36" /><Bloque className="h-4 w-4/5" /><Bloque className="h-4 w-2/3" /><Bloque className="h-4 w-1/2" /></div>)}<Bloque className="h-40 w-full rounded-xl lg:col-span-2" /></div></div></EstadoCarga>;
  }

  if (["categorias", "talles", "proveedores", "movimientos", "paginas", "configuracion"].includes(tipo)) {
    return (
      <div className="min-h-[65vh] bg-[var(--admin-fondo)] px-4 py-7 sm:px-6 lg:px-8">
        <div className={`mx-auto space-y-6 ${tipo === "configuracion" ? "max-w-5xl" : "max-w-7xl"}`}>
          <EstadoCarga admin>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="space-y-2"><Bloque className="h-8 w-44" /><Bloque className="h-4 w-72 max-w-[75vw]" /></div>{(tipo === "categorias" || tipo === "paginas") && <Bloque className="h-10 w-36" />}</div>
            {(tipo === "talles" || tipo === "proveedores") && <div className="mt-6 space-y-4 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-5"><Bloque className="h-5 w-36" /><div className={tipo === "proveedores" ? "grid gap-4 md:grid-cols-2" : "flex flex-col gap-3 sm:flex-row"}><Bloque className="h-11 w-full" /><Bloque className="h-11 w-full" /></div>{tipo === "proveedores" && <Bloque className="h-11 w-full" />}<Bloque className="h-10 w-32" /></div>}
            {tipo === "configuracion" && <div className="mt-6 space-y-8"><div className="flex flex-wrap gap-2">{Array.from({ length: 6 }, (_, indice) => <Bloque key={indice} className="h-9 w-24" />)}</div>{Array.from({ length: 2 }, (_, indice) => <div key={indice} className="space-y-3"><Bloque className="h-5 w-28" /><div className="rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-4">{Array.from({ length: 4 }, (_, fila) => <div key={fila} className="flex items-center gap-4 border-b border-current/10 py-4 last:border-0"><Bloque className="h-9 w-9" /><div className="flex-1 space-y-2"><Bloque className="h-4 w-36" /><Bloque className="h-3 w-56 max-w-full" /></div><Bloque className="hidden h-6 w-20 sm:block" /></div>)}</div></div>)}</div>}
          </EstadoCarga>
          {tipo === "categorias" && <SkeletonTarjetas cantidad={6} tipo="categorias" />}
          {tipo === "talles" && <SkeletonTarjetas cantidad={4} tipo="talles" />}
          {tipo === "proveedores" && <SkeletonTarjetas cantidad={4} tipo="proveedores" />}
          {tipo === "movimientos" && <SkeletonFilas filas={8} tipo="movimientos" />}
          {tipo === "paginas" && <SkeletonFilas filas={5} tipo="paginas" />}
        </div>
      </div>
    );
  }
  return <div className="min-h-[65vh] bg-[var(--admin-fondo)] px-4 py-7 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><EstadoCarga admin><div className="space-y-6"><div className="space-y-2"><Bloque className="h-8 w-32" /><Bloque className="h-4 w-64" /></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, indice) => <div key={indice} className="space-y-4 rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-5"><Bloque className="h-4 w-28" /><Bloque className="h-8 w-16" /></div>)}</div><div className="rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-6"><Bloque className="mb-6 h-5 w-40" /><Bloque className="h-[280px] w-full" /></div></div></EstadoCarga></div></div>;
}

export function SkeletonEditorDiseno({ apariencia = false }: { apariencia?: boolean }) {
  return <EstadoCarga admin><div className="space-y-5">{apariencia ? <div className="space-y-4 rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-5"><Bloque className="h-5 w-32" /><div className="grid gap-4 md:grid-cols-2"><Bloque className="h-11 w-full" /><Bloque className="h-11 w-full" /><Bloque className="h-24 w-full md:col-span-2" /></div><Bloque className="ml-auto h-10 w-28" /></div> : <><div className="flex flex-wrap items-center justify-between gap-3"><Bloque className="h-10 w-40" /><Bloque className="h-10 w-36" /></div><Bloque className="h-4 w-96 max-w-full" /><SkeletonFilas filas={4} /></>}</div></EstadoCarga>;
}

type TipoSkeletonTienda =
  | "inicio"
  | "catalogo"
  | "categoria"
  | "producto"
  | "checkout"
  | "contenido"
  | "estado"
  | "panel"
  | "movimientos";

export function SkeletonTienda({ tipo = "catalogo" }: { tipo?: TipoSkeletonTienda }) {
  if (tipo === "inicio") {
    return <EstadoCarga><div className="min-h-screen bg-[var(--color-fondo-sitio)]"><div className="relative h-[78dvh] min-h-[520px] max-h-[820px] w-full"><Bloque className="h-full w-full rounded-none" /><div className="absolute bottom-12 left-6 space-y-4 sm:left-12"><Bloque className="h-5 w-40" /><Bloque className="h-12 w-72 max-w-[75vw]" /><Bloque className="h-11 w-36" /></div></div><div className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8"><Bloque className="mx-auto h-7 w-48" /><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }, (_, indice) => <Bloque key={indice} className="aspect-[4/5] rounded-xl" />)}</div></div></div></EstadoCarga>;
  }
  return (
    <div className={`min-h-[65vh] bg-[var(--color-fondo-sitio)] pb-12 text-[var(--texto-sobre-fondo)] ${tipo === "movimientos" ? "px-8 pt-24" : tipo === "panel" ? "px-4 pt-7 sm:px-6 lg:px-8" : tipo === "checkout" ? "px-4 pt-8 sm:px-6 lg:px-8" : "px-4 pt-24 sm:px-6 lg:px-8"}`}>
      <div className={`mx-auto ${tipo === "checkout" ? "max-w-6xl" : tipo === "panel" || tipo === "movimientos" || tipo === "contenido" ? "w-full" : "max-w-7xl"}`}>
        <EstadoCarga>
          {tipo === "producto" && (
            <div><Bloque className="mb-8 h-4 w-40" /><div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)] lg:gap-12">
              <div className="flex flex-col-reverse gap-3 md:flex-row"><div className="flex gap-3 md:flex-col">{Array.from({ length: 3 }, (_, indice) => <Bloque key={indice} className="h-20 w-16 shrink-0" />)}</div><Bloque className="aspect-[4/5] w-full rounded-xl" /></div>
              <div className="space-y-5">
                <Bloque className="h-5 w-28" />
                <Bloque className="h-10 w-4/5" />
                <Bloque className="h-7 w-32" />
                <Bloque className="h-4 w-full" />
                <Bloque className="h-12 w-full" />
                <Bloque className="h-12 w-full" />
                <Bloque className="h-12 w-full" />
              </div>
            </div><div className="mt-16 max-w-3xl space-y-4 border-t border-current/10 pt-10"><Bloque className="h-6 w-32" /><Bloque className="h-4 w-full" /><Bloque className="h-4 w-4/5" /></div></div>
          )}
          {tipo === "estado" && (
            <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-5">
              <Bloque className="h-24 w-24 rounded-full" />
              <Bloque className="h-8 w-3/4" />
              <Bloque className="h-4 w-full" />
              <Bloque className="h-24 w-full rounded-xl" />
              <Bloque className="h-12 w-44" />
            </div>
          )}
          {tipo === "checkout" && (
            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              <div className="space-y-5">
                <Bloque className="h-8 w-48" />
                <Bloque className="h-4 w-64" />
                <SkeletonTarjetas cantidad={2} admin={false} tipo="pagos" />
              </div>
              <div className="space-y-4"><Bloque className="h-64 w-full rounded-xl" /><Bloque className="h-12 w-full" /></div>
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
              <Bloque className="h-[370px] w-full rounded-xl" />
            </div>
          )}
          {tipo === "movimientos" && (
            <div className="space-y-6">
              <Bloque className="h-8 w-64 max-w-full" />
              <Bloque className="h-4 w-80 max-w-full" />
              <SkeletonFilas filas={7} admin={false} tipo="movimientos" />
            </div>
          )}
          {tipo === "contenido" && (
            <div className="space-y-6">
              <div className="flex min-h-[45vh] flex-col items-center justify-center gap-5"><Bloque className="h-5 w-36" /><Bloque className="h-12 w-72 max-w-full" /><Bloque className="h-4 w-96 max-w-full" /><Bloque className="h-11 w-36" /></div>
              <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }, (_, indice) => <Bloque key={indice} className="h-48 rounded-xl" />)}</div>
            </div>
          )}
          {tipo === "catalogo" && <div className="mb-8 flex flex-col justify-between gap-5 border-b border-current/10 pb-6 md:flex-row md:items-end"><div className="space-y-2"><Bloque className="h-9 w-44" /><Bloque className="h-4 w-72" /></div><Bloque className="h-11 w-full sm:w-48" /></div>}
          {tipo === "categoria" && <div className="mb-8 space-y-4 border-b border-current/10 pb-8"><Bloque className="h-4 w-32" /><Bloque className="h-4 w-20" /><Bloque className="h-9 w-56" /></div>}
          {(tipo === "catalogo" || tipo === "categoria") && <div><Bloque className={`mb-5 h-11 w-full ${tipo === "catalogo" ? "lg:hidden" : "md:hidden"}`} /><div className="flex gap-8"><div className={`w-56 shrink-0 space-y-3 ${tipo === "catalogo" ? "hidden lg:block" : "hidden md:block"}`}><Bloque className="h-5 w-28" />{Array.from({ length: 5 }, (_, indice) => <Bloque key={indice} className="h-10 w-full" />)}</div><div className="grid min-w-0 flex-1 grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, indice) => <div key={indice} className="space-y-3"><Bloque className="aspect-[4/5] w-full rounded-xl" /><Bloque className="h-4 w-4/5" /><Bloque className="h-5 w-2/5" /></div>)}</div></div></div>}
        </EstadoCarga>
      </div>
    </div>
  );
}

export function SkeletonAcceso({ registro = false }: { registro?: boolean }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-fondo-sitio)] px-4">
      <div className="absolute inset-0 scale-105 bg-cover bg-right-bottom bg-no-repeat blur-sm" style={{ backgroundImage: "url('https://www.jasminsoftware.es/wp-content/uploads/2020/01/gestion-de-inventario.jpg')" }} />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-md rounded-3xl border border-current/10 bg-[var(--color-fondo-sitio)]/60 p-8 backdrop-blur-lg">
        <EstadoCarga>
          <div className="space-y-5">
            <Bloque className="mx-auto h-16 w-16 rounded-full" />
            <Bloque className="mx-auto h-8 w-48" />
            <Bloque className="mx-auto h-4 w-56" />
            <Bloque className="h-11 w-full" />
            <Bloque className="mx-auto h-4 w-28" />
            {Array.from({ length: registro ? 3 : 2 }, (_, indice) => <Bloque key={indice} className="h-12 w-full rounded-xl" />)}
            <Bloque className="h-12 w-full rounded-xl" />
            <Bloque className="mx-auto h-4 w-40" />
          </div>
        </EstadoCarga>
      </div>
    </div>
  );
}
