"use client";

import { Save, Scale } from "lucide-react";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { updateRegionalConfig } from "@/actions/page-config/regional.actions";

import type { ConfigAjustes } from "./tipos-ajustes";

const clasesCampo =
  "w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-3 py-2 text-sm text-[var(--admin-texto)] focus:border-[var(--admin-primario)] focus:outline-none";

export default function SeccionLegal({ config }: { config: ConfigAjustes }) {
  const [terminos, setTerminos] = useState(config.termsAndConditions ?? "");
  const [privacidad, setPrivacidad] = useState(config.privacyPolicy ?? "");
  const [guardando, setGuardando] = useState(false);

  const guardar = () => {
    setGuardando(true);
    startTransition(async () => {
      const resultado = await updateRegionalConfig({
        termsAndConditions: terminos,
        privacyPolicy: privacidad,
      });

      setGuardando(false);

      if (!resultado.ok) {
        toast.error(resultado.error);
        return;
      }

      toast.success("Cambios guardados");
    });
  };

  return (
    <section className="rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)]">
      <div className="border-b border-[var(--admin-borde)] p-5">
        <div className="flex items-center gap-2">
          <Scale size={16} className="text-[var(--admin-primario)]" />
          <h2 className="text-sm font-semibold text-[var(--admin-texto)]">Textos legales</h2>
        </div>
        <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
          Términos y políticas de privacidad
        </p>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-1.5">
          <label
            htmlFor="terminos"
            className="text-xs font-medium text-[var(--admin-texto)]"
          >
            Términos y condiciones
          </label>
          <textarea
            id="terminos"
            rows={4}
            value={terminos}
            onChange={(evento) => setTerminos(evento.target.value)}
            className={clasesCampo}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="privacidad"
            className="text-xs font-medium text-[var(--admin-texto)]"
          >
            Política de privacidad
          </label>
          <textarea
            id="privacidad"
            rows={4}
            value={privacidad}
            onChange={(evento) => setPrivacidad(evento.target.value)}
            className={clasesCampo}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-primario)] px-4 py-2 text-sm font-semibold text-[var(--admin-primario-texto)] transition hover:opacity-90 disabled:opacity-50"
          >
            <Save size={16} />
            Guardar cambios
          </button>
        </div>
      </div>
    </section>
  );
}
