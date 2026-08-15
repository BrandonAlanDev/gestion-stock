"use client";

import { Save, Search } from "lucide-react";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { updateSeoConfig } from "@/actions/page-config/seo.actions";
import Badge from "@/components/ui/badge";

import type { ConfigAjustes } from "./tipos-ajustes";

const clasesCampo =
  "w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-3 py-2 text-sm text-[var(--admin-texto)] focus:border-[var(--admin-primario)] focus:outline-none";

export default function SeccionSeo({ config }: { config: ConfigAjustes }) {
  const [titulo, setTitulo] = useState(config.metaTitle ?? "");
  const [descripcion, setDescripcion] = useState(
    config.metaDescription ?? ""
  );
  const [guardando, setGuardando] = useState(false);

  const completo = titulo.trim() !== "" && descripcion.trim() !== "";

  const guardar = () => {
    setGuardando(true);
    startTransition(async () => {
      const resultado = await updateSeoConfig({
        metaTitle: titulo,
        metaDescription: descripcion,
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-[var(--admin-primario)]" />
            <h2 className="text-sm font-semibold text-[var(--admin-texto)]">SEO</h2>
          </div>
          {completo ? (
            <Badge variante="activo">Completo</Badge>
          ) : (
            <Badge variante="sin-configurar">Incompleto</Badge>
          )}
        </div>
        <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
          Título y descripción para buscadores
        </p>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="metaTitle" className="text-xs font-medium text-[var(--admin-texto)]">
              Título (metaTitle)
            </label>
            <span className="text-xs text-[var(--admin-texto-suave)]">{titulo.length}/60</span>
          </div>
          <input
            id="metaTitle"
            type="text"
            value={titulo}
            onChange={(evento) => setTitulo(evento.target.value)}
            className={clasesCampo}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="metaDescription" className="text-xs font-medium text-[var(--admin-texto)]">
              Descripción (metaDescription)
            </label>
            <span className="text-xs text-[var(--admin-texto-suave)]">
              {descripcion.length}/160
            </span>
          </div>
          <textarea
            id="metaDescription"
            rows={3}
            value={descripcion}
            onChange={(evento) => setDescripcion(evento.target.value)}
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
