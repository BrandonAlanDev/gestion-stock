"use client";

import ContenidoSidebar from "@/components/layout/ContenidoSidebar";

export default function Sidebar({
  colapsado,
  onToggleColapsado,
}: {
  colapsado: boolean;
  onToggleColapsado: () => void;
}) {
  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 bottom-0 z-[95] flex-col w-[var(--sidebar-ancho)] transition-all duration-300 backdrop-blur-xl border-r select-none"
      style={{
        backgroundColor: "var(--superficie-fondo)",
        borderColor: "color-mix(in srgb, var(--color-fondo-sitio) 18%, transparent)",
      }}
    >
      <div
        className={`${colapsado ? "overflow-visible corto:overflow-y-auto corto:overflow-x-hidden corto:min-h-0 scrollbar-oculta" : "overflow-y-auto min-h-0"} p-4 flex-1 flex flex-col`}
      >
        <ContenidoSidebar colapsado={colapsado} onToggleColapsado={onToggleColapsado} />
      </div>
    </aside>
  );
}
