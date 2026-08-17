"use client";

import ContenidoSidebar from "@/components/layout/ContenidoSidebar";

export default function SidebarMovil({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <aside
        className={`md:hidden fixed inset-y-0 left-0 w-60 max-w-[80vw] z-[110] flex flex-col p-6 transition-transform duration-300 ease-in-out backdrop-blur-xl overflow-y-auto ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        style={{
          backgroundColor: "var(--superficie-fondo)",
        }}
      >
        <ContenidoSidebar onNavegar={onClose} />
      </aside>

      {isOpen && (
        <div
          onClick={onClose}
          className="md:hidden fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
        />
      )}
    </>
  );
}
