"use client";

import ContenidoSidebar from "@/components/layout/ContenidoSidebar";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getContrastColor } from "@/lib/utils";

export default function Sidebar({
  colapsado,
  onToggleColapsado,
}: {
  colapsado: boolean;
  onToggleColapsado: () => void;
}) {
  const pageConfig = usePageConfig();

  const rawSecondary = pageConfig?.pageConfig?.secondaryColor;
  const secondaryColor =
    typeof rawSecondary === "string" && rawSecondary.length > 0 ? rawSecondary : "#FFFFFF";
  const textColor = getContrastColor(secondaryColor);
  const borde = textColor + "2E";

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 bottom-0 z-[95] flex-col w-[var(--sidebar-ancho)] transition-all duration-300 backdrop-blur-xl border-r"
      style={{
        backgroundColor: secondaryColor,
        borderColor: borde,
      }}
    >
      <div
        className={`${colapsado ? "p-4 overflow-visible" : "p-6 overflow-y-auto"} flex-1 flex flex-col`}
      >
        <ContenidoSidebar colapsado={colapsado} onToggleColapsado={onToggleColapsado} />
      </div>
    </aside>
  );
}
