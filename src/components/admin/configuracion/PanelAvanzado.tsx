"use client";

import { AlertTriangle, Trash2 } from "lucide-react";

import { useTransition } from "react";

import { toast } from "sonner";

import { clearPageConfig } from "@/actions/page-config/maintenance.actions";

import type { ConfigCompleta } from "./tipos-configuracion";

export default function PanelAvanzado({
  config,
}: {
  config: ConfigCompleta;
}) {
  const [pendiente, startTransition] =
    useTransition();

  const handleResetear = () => {
    const confirmado = window.confirm(
      "¿Seguro? Se borrarán todos los ajustes, colores, banners y secciones de tu tienda."
    );

    if (!confirmado) return;

    startTransition(async () => {
      const res = await clearPageConfig();

      if (!res.ok) {
        toast.error(res.error ?? "Error al resetear");
        return;
      }

      toast.success("Configuración restaurada");

      window.location.reload();
    });
  };

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-[var(--admin-peligro)]" />

          <h3 className="text-sm font-semibold text-[var(--admin-texto)]">
            Configuración avanzada
          </h3>
        </div>

        <p className="text-xs text-[var(--admin-texto-suave)]">
          Acciones que afectan a toda tu tienda
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-[var(--admin-peligro)] bg-[var(--admin-peligro-suave)] p-4">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-[var(--admin-peligro)]">
            Resetear configuración
          </h4>

          <p className="text-xs text-[var(--admin-texto-suave)]">
            Borra colores, contenido, secciones y ajustes, y restaura los
            valores originales. Esta acción no se puede deshacer.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetear}
          disabled={pendiente}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--admin-peligro)] bg-[var(--admin-peligro-suave)] px-4 py-2 text-sm font-semibold text-[var(--admin-peligro)] transition hover:bg-[var(--admin-peligro-accion)] hover:text-white disabled:opacity-50"
        >
          <Trash2 size={15} />

          {pendiente ? "Reseteando..." : "Resetear todo"}
        </button>
      </div>

      <ul className="space-y-1 text-xs text-[var(--admin-texto-suave)]">
        <li>
          Tienda:{" "}
          <span className="text-[var(--admin-texto)]">
            {config.storeName ?? "Sin nombre"}
          </span>
        </li>

        <li>
          Moneda:{" "}
          <span className="text-[var(--admin-texto)]">
            {config.currency ?? "ARS"}
          </span>
        </li>

        <li>
          Idioma:{" "}
          <span className="text-[var(--admin-texto)]">
            {config.language ?? "es"}
          </span>
        </li>
      </ul>
    </section>
  );
}
