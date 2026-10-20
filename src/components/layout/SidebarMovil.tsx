"use client";

import { useEffect, useRef } from "react";
import ContenidoSidebar from "@/components/layout/ContenidoSidebar";
import { useBloqueoScroll } from "@/hooks/use-bloqueo-scroll";

export default function SidebarMovil({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const panel = useRef<HTMLElement>(null);
  useBloqueoScroll(isOpen);
  useEffect(() => {
    if (!isOpen) return;
    const activador = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panel.current?.querySelector<HTMLButtonElement>('[aria-label="Cerrar menú"]')?.focus();

    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onClose();
      if (evento.key !== "Tab" || !panel.current) return;

      const controles = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      const primero = controles[0];
      const ultimo = controles[controles.length - 1];
      if (!primero || !ultimo) return;
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    };
    const escritorio = window.matchMedia("(min-width: 1024px)");
    const cerrarEnEscritorio = () => {
      if (escritorio.matches) onClose();
    };
    escritorio.addEventListener("change", cerrarEnEscritorio);
    cerrarEnEscritorio();
    window.addEventListener("keydown", cerrarConEscape);
    return () => {
      escritorio.removeEventListener("change", cerrarEnEscritorio);
      window.removeEventListener("keydown", cerrarConEscape);
      if (activador?.getClientRects().length) activador.focus();
    };
  }, [isOpen, onClose]);

  return (
    <>
      <aside
        ref={panel}
        id="menu-administracion"
        role="dialog"
        aria-modal={isOpen ? true : undefined}
        aria-label="Menú de administración"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`fixed inset-y-0 left-0 z-[110] flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-[var(--admin-fondo-opaco)] p-3 transition-transform duration-200 ease-in-out lg:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <ContenidoSidebar onNavegar={onClose} />
      </aside>

      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-[100] bg-black/40 lg:hidden"
        />
      )}
    </>
  );
}
