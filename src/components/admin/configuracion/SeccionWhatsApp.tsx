"use client";

import { MessageCircle, Save } from "lucide-react";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import { updateContactConfig } from "@/actions/page-config/contact.actions";

import type { ConfigCompleta } from "./tipos-configuracion";

export default function SeccionWhatsApp({
  config,
}: {
  config: ConfigCompleta;
}) {
  const [numero, setNumero] = useState(
    config.whatsapp ?? ""
  );

  const [guardando, startTransition] =
    useTransition();

  const handleGuardar = () => {
    if (!/^[+\d]*$/.test(numero)) {
      toast.error(
        "El número solo puede contener dígitos y +"
      );
      return;
    }

    startTransition(async () => {
      const res = await updateContactConfig({
        whatsapp: numero,
      });

      if (!res.ok) {
        toast.error(res.error ?? "Error al guardar");
        return;
      }

      toast.success("Cambios guardados");
    });
  };

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className="text-[var(--admin-primario)]" />

          <h3 className="text-sm font-semibold text-[var(--admin-texto)]">
            WhatsApp
          </h3>
        </div>

        <p className="text-xs text-[var(--admin-texto-suave)]">
          Los clientes envían sus pedidos por WhatsApp
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-[var(--admin-texto)]">
          Número de WhatsApp
        </label>

        <input
          type="tel"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          placeholder="Ej: 5492235644043"
          className="w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-3 py-2 text-sm text-[var(--admin-texto)] placeholder:text-[var(--admin-texto-suave)] focus:border-[var(--admin-primario)] focus:outline-none"
        />

        <p className="text-xs text-[var(--admin-texto-suave)]">
          Incluí el código de país sin espacios ni guiones.
        </p>
      </div>

      <button
        type="button"
        onClick={handleGuardar}
        disabled={guardando}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-primario)] px-4 py-2 text-sm font-semibold text-[var(--admin-primario-texto)] transition hover:opacity-90 disabled:opacity-50"
      >
        <Save size={16} />

        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>
    </section>
  );
}
