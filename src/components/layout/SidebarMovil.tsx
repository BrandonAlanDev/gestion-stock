"use client";

import { useEffect } from "react";
import ContenidoSidebar from "@/components/layout/ContenidoSidebar";
import { useBloqueoScroll } from "@/hooks/use-bloqueo-scroll";

export default function SidebarMovil({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useBloqueoScroll(isOpen);
  useEffect(() => {
    if (!isOpen) return;
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onClose();
    };
    window.addEventListener("keydown", cerrarConEscape);
    return () => window.removeEventListener("keydown", cerrarConEscape);
  }, [isOpen, onClose]);

  return (
    <>
      <aside
        aria-label="Menú de administración"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`md:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] z-[110] flex flex-col p-3 transition-transform duration-200 ease-in-out overflow-y-auto bg-[var(--admin-fondo-opaco)] ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <ContenidoSidebar onNavegar={onClose} />
      </aside>

      {isOpen && (
        <div
          onClick={onClose}
          className="md:hidden fixed inset-0 bg-black/40 z-[100]"
        />
      )}
    </>
  );
}
