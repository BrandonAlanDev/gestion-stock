"use client";

import { Moon, Sun } from "lucide-react";
import { useTemaAdmin } from "@/hooks/admin/use-tema-admin";

export default function BotonTemaAdmin({
  colapsado = false,
}: {
  colapsado?: boolean;
}) {
  const { tema, alternarTema } = useTemaAdmin();
  const modoClaroActivo = tema === "claro";
  const etiqueta = modoClaroActivo ? "Activar modo oscuro" : "Activar modo claro";
  const Icono = modoClaroActivo ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={alternarTema}
      aria-label={etiqueta}
      title={etiqueta}
      className={`flex w-full items-center rounded-lg border border-[var(--admin-borde)] px-3 py-2 text-sm font-medium text-[var(--admin-texto)] transition-colors hover:bg-[var(--admin-fondo-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-primario)] ${colapsado ? "justify-center" : "gap-2"}`}
    >
      <Icono size={17} aria-hidden="true" />
      {!colapsado && <span>{modoClaroActivo ? "Modo oscuro" : "Modo claro"}</span>}
    </button>
  );
}
