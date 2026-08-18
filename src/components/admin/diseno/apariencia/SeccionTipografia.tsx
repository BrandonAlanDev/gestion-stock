"use client";

import { Type } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
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

  const [fuentes, setFuentes] = useState<EstadoFuentes>({
    principal: config.fontPrimary,
    secundaria: config.fontSecondary,
  });

  const guardar = (nuevasFuentes: EstadoFuentes) => {
    startTransition(async () => {
      const resultado = await updateBrandingConfig({
        fontPrimary: nuevasFuentes.principal,
        fontSecondary: nuevasFuentes.secundaria,
      });

      if (!resultado.ok) {
        toast.error(resultado.error);
        return;
      }

      toast.success("Cambios guardados");
      router.refresh();
      aplicarTipografiaDocumento(nuevasFuentes.principal, nuevasFuentes.secundaria);
    });
  };

  const cambiarPrincipal = (valor: string) => {
    const nuevas = { ...fuentes, principal: valor };
    setFuentes(nuevas);
    guardar(nuevas);
  };

  const cambiarSecundaria = (valor: string) => {
    const nuevas = { ...fuentes, secundaria: valor };
    setFuentes(nuevas);
    guardar(nuevas);
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

      <div className="p-5">
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

        <div className="mt-4 rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-4">
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
      </div>
    </section>
  );
}
