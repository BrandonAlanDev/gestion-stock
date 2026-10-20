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
      className="fixed bottom-0 left-0 top-0 z-[95] hidden w-[var(--sidebar-ancho)] select-none flex-col border-r border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] transition-[width] duration-200 lg:flex"
    >
      <div
        className="min-h-0 flex-1 overflow-y-auto p-3 flex flex-col"
      >
        <ContenidoSidebar colapsado={colapsado} onToggleColapsado={onToggleColapsado} />
      </div>
    </aside>
  );
}
