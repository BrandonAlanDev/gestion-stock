"use client";

import { Save, Type } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateBrandingConfig } from "@/actions/page-config/branding.actions";
import { FUENTES_DISPONIBLES } from "@/components/apariencia/fuentes";
import { aplicarTipografiaDocumento } from "@/lib/apariencia/aplicar-tipografia-documento";

import { ConfigApariencia } from "./tipos-apariencia";

interface EstadoFuentes {
  principal: string;
  secundaria: string;
}

const CLASES_SELECT =
  "w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-3 py-2 text-sm text-[var(--admin-texto)] focus:border-[var(--admin-primario)] focus:outline-none";

export default function SeccionTipografia({
  config,
}: {
  config: ConfigApariencia;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fuentes, setFuentes] = useState<EstadoFuentes>({
    principal: config.fontPrimary,
    secundaria: config.fontSecondary,
  });
  const [base, setBase] = useState<EstadoFuentes>({
    principal: config.fontPrimary,
    secundaria: config.fontSecondary,
  });

  const tieneCambios =
    fuentes.principal !== base.principal || fuentes.secundaria !== base.secundaria;

  const guardar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const resultado = await updateBrandingConfig({
        fontPrimary: fuentes.principal,
        fontSecondary: fuentes.secundaria,
      });

      if (!resultado.ok) {
        toast.error(resultado.error);
        return;
      }

      setBase({ principal: fuentes.principal, secundaria: fuentes.secundaria });
      toast.success("Cambios guardados");
      router.refresh();
      aplicarTipografiaDocumento(fuentes.principal, fuentes.secundaria);
    });
  };

  const cambiarPrincipal = (valor: string) => {
    setFuentes((actuales) => ({ ...actuales, principal: valor }));
  };

  const cambiarSecundaria = (valor: string) => {
    setFuentes((actuales) => ({ ...actuales, secundaria: valor }));
  };

  return (
    <section className="rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)]">
      <div className="border-b border-[var(--admin-borde)] p-5">
        <div className="flex items-center gap-2">
          <Type size={16} className="text-[var(--admin-primario)]" />
          <h2 className="text-sm font-semibold text-[var(--admin-texto)]">Tipografía</h2>
        </div>
        <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
          Las fuentes que usa tu tienda
        </p>
      </div>

      <form onSubmit={guardar} className="space-y-6 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="fuente-principal"
              className="mb-1.5 block text-xs font-medium text-[var(--admin-texto)]"
            >
              Fuente principal
            </label>
            <select
              id="fuente-principal"
              value={fuentes.principal}
              onChange={(evento) => cambiarPrincipal(evento.target.value)}
              className={CLASES_SELECT}
            >
              {FUENTES_DISPONIBLES.map((fuente) => (
                <option
                  key={fuente.valor}
                  value={fuente.valor}
                  style={{ color: "var(--admin-texto)", backgroundColor: "var(--admin-fondo)" }}
                >
                  {fuente.etiqueta}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="fuente-secundaria"
              className="mb-1.5 block text-xs font-medium text-[var(--admin-texto)]"
            >
              Fuente secundaria
            </label>
            <select
              id="fuente-secundaria"
              value={fuentes.secundaria}
              onChange={(evento) => cambiarSecundaria(evento.target.value)}
              className={CLASES_SELECT}
            >
              {FUENTES_DISPONIBLES.map((fuente) => (
                <option
                  key={fuente.valor}
                  value={fuente.valor}
                  style={{ color: "var(--admin-texto)", backgroundColor: "var(--admin-fondo)" }}
                >
                  {fuente.etiqueta}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-4">
          <h4
            className="mb-2 text-lg font-bold text-[var(--admin-texto)]"
            style={{ fontFamily: `'${fuentes.secundaria}', serif` }}
          >
            Título elegante de ejemplo
          </h4>
          <p
            className="text-base text-[var(--admin-texto)]"
            style={{ fontFamily: `'${fuentes.principal}', sans-serif` }}
          >
            Este es un párrafo de ejemplo que muestra cómo se ve la fuente
            principal en tu tienda.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || !tieneCambios}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-primario)] px-4 py-2 text-sm font-semibold text-[var(--admin-primario-texto)] transition hover:opacity-90 disabled:opacity-50"
          >
            <Save size={16} />
            {isPending ? "Guardando..." : "Guardar tipografía"}
          </button>
        </div>
      </form>
    </section>
  );
}
