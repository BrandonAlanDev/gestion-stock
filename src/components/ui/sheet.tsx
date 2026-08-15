"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  abierto: boolean;
  alCerrar: () => void;
  titulo?: string;
  descripcion?: string;
  lado?: "derecha" | "izquierda";
  anchoClases?: string;
  children: React.ReactNode;
}

export default function Sheet({
  abierto,
  alCerrar,
  titulo,
  descripcion,
  lado = "derecha",
  anchoClases,
  children,
}: SheetProps) {
  useEffect(() => {
    if (!abierto) return;

    const manejarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        alCerrar();
      }
    };

    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [abierto, alCerrar]);

  useEffect(() => {
    if (!abierto) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [abierto]);

  const posicionInicial = lado === "derecha" ? "100%" : "-100%";
  const clasesLado =
    lado === "derecha"
      ? "right-0 border-l"
      : "left-0 border-r";
  const clasesAncho = anchoClases ?? "w-full sm:w-[480px]";

  return (
    <AnimatePresence>
      {abierto && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={alCerrar}
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: posicionInicial }}
            animate={{ x: 0 }}
            exit={{ x: posicionInicial }}
            transition={{ type: "tween", duration: 0.25 }}
            className={cn(
              "fixed top-0 z-[121] flex h-full flex-col bg-[var(--admin-fondo)] border-[var(--admin-borde)] shadow-2xl",
              clasesLado,
              clasesAncho
            )}
            role="dialog"
            aria-modal="true"
          >
            <header className="flex items-start justify-between border-b border-[var(--admin-borde)] p-6">
              <div className="min-w-0 flex-1 pr-4">
                {titulo && (
                  <h2 className="text-lg font-semibold truncate text-[var(--admin-texto)]">{titulo}</h2>
                )}
                {descripcion && (
                  <p className="mt-0.5 text-sm truncate text-[var(--admin-texto-suave)]">{descripcion}</p>
                )}
              </div>
              <button
                onClick={alCerrar}
                aria-label="Cerrar"
                className="rounded-md p-2 text-[var(--admin-texto-suave)] transition-colors hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]"
              >
                <X size={20} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
