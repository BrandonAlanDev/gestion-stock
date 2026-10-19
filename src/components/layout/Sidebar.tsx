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
      className="hidden md:flex fixed left-0 top-0 bottom-0 z-[95] flex-col w-[var(--sidebar-ancho)] transition-[width] duration-200 bg-[var(--admin-fondo-opaco)] border-r border-[var(--admin-borde)] select-none"
    >
      <div
        className="min-h-0 flex-1 overflow-y-auto p-3 flex flex-col"
      >
        <ContenidoSidebar colapsado={colapsado} onToggleColapsado={onToggleColapsado} />
      </div>
    </aside>
  );
}
