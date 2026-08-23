"use client";

import { Globe } from "lucide-react";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { updateRegionalConfig } from "@/actions/page-config/regional.actions";

import type { ConfigAjustes } from "./tipos-ajustes";

const clasesSelecto =
  "w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-3 py-2 text-sm text-[var(--admin-texto)] focus:border-[var(--admin-primario)] focus:outline-none";

export default function SeccionRegional({
  config,
}: {
  config: ConfigAjustes;
}) {
  const [moneda, setMoneda] = useState(config.currency);
  const [idioma, setIdioma] = useState(config.language);

  const guardar = (campo: { currency?: string; language?: string }) => {
    startTransition(async () => {
      const resultado = await updateRegionalConfig(campo);

      if (!resultado.ok) {
        toast.error(resultado.error);
        return;
      }

      toast.success("Cambios guardados");
    });
  };

  const cambiarMoneda = (valor: string) => {
    setMoneda(valor);
    guardar({ currency: valor });
  };

  const cambiarIdioma = (valor: string) => {
    setIdioma(valor);
    guardar({ language: valor });
  };

  return (
    <section className="rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)]">
      <div className="border-b border-[var(--admin-borde)] p-5">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-[var(--admin-primario)]" />
          <h2 className="text-sm font-semibold text-[var(--admin-texto)]">
            Configuración regional
          </h2>
        </div>
        <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
          Moneda e idioma de la tienda
        </p>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-1.5">
          <label htmlFor="moneda" className="text-xs font-medium text-[var(--admin-texto)]">
            Moneda
          </label>
          <select
            id="moneda"
            value={moneda}
            onChange={(evento) => cambiarMoneda(evento.target.value)}
            className={clasesSelecto}
          >
            <option value="ARS" style={{ color: "var(--admin-texto)", backgroundColor: "var(--admin-fondo)" }}>$ - Peso</option>
            <option value="USD" style={{ color: "var(--admin-texto)", backgroundColor: "var(--admin-fondo)" }}>US$ - Dólar</option>
            <option value="EUR" style={{ color: "var(--admin-texto)", backgroundColor: "var(--admin-fondo)" }}>€ - Euro</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="idioma" className="text-xs font-medium text-[var(--admin-texto)]">
            Idioma
          </label>
          <select
            id="idioma"
            value={idioma}
            onChange={(evento) => cambiarIdioma(evento.target.value)}
            className={clasesSelecto}
          >
            <option value="es" style={{ color: "var(--admin-texto)", backgroundColor: "var(--admin-fondo)" }}>Español</option>
          </select>
        </div>
      </div>
    </section>
  );
}
