"use client";

import { Moon, Sun } from "lucide-react";
import { useTemaAdmin } from "@/hooks/admin/use-tema-admin";

export default function BotonTemaAdmin({
  colapsado = false,
  compacto = false,
}: {
  colapsado?: boolean;
  compacto?: boolean;
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
      className={`flex items-center justify-center rounded-md p-2 text-sm font-medium text-[var(--admin-texto-suave)] transition-colors hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-primario)] ${compacto || colapsado ? "" : "w-full gap-2"}`}
    >
      <Icono size={17} aria-hidden="true" />
      {!colapsado && !compacto && <span>{modoClaroActivo ? "Modo oscuro" : "Modo claro"}</span>}
    </button>
  );
}
