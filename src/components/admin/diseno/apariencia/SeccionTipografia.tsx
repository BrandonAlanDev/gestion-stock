"use client";

import { Save, Type } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { updateBrandingConfig } from "@/actions/page-config/branding.actions";
import { respaldoFuente } from "@/components/apariencia/fuentes";
import { aplicarTipografiaDocumento } from "@/lib/apariencia/aplicar-tipografia-documento";

import type { PlantillaTipografia } from "./plantillas-tipografia";
import SelectorFuente from "./SelectorFuente";
import SelectorPlantillasTipografia from "./SelectorPlantillasTipografia";
import { ConfigApariencia } from "./tipos-apariencia";

interface EstadoFuentes {
  principal: string;
  secundaria: string;
}

const FUENTES_BASE = new Set(["Outfit", "Playfair Display"]);

function cargarFuentes(familias: string[]): () => void {
  const parametros = familias
    .map((fuente) => `family=${fuente.replaceAll(" ", "+")}:wght@400;600;700`)
    .join("&");
  const enlace = document.createElement("link");
  enlace.rel = "stylesheet";
  enlace.href = `https://fonts.googleapis.com/css2?${parametros}&display=swap`;
  document.head.appendChild(enlace);
  return () => enlace.remove();
}

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

  useEffect(() => {
    const familias = Array.from(new Set([fuentes.principal, fuentes.secundaria]))
      .filter((fuente) => !FUENTES_BASE.has(fuente));
    if (familias.length === 0) return;
    return cargarFuentes(familias);
  }, [fuentes.principal, fuentes.secundaria]);

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

  const aplicarPlantilla = (plantilla: PlantillaTipografia) => {
    setFuentes({
      principal: plantilla.principal,
      secundaria: plantilla.secundaria,
    });
  };

  return (
    <section className="rounded-lg bg-[var(--admin-fondo-opaco)]">
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
        <div>
          <h3 className="text-sm font-semibold text-[var(--admin-texto)]">
            Combinaciones recomendadas
          </h3>
          <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
            Elegí una combinación para comenzar. Podés ajustar las fuentes después.
          </p>
          <div className="mt-3">
            <SelectorPlantillasTipografia
              principal={fuentes.principal}
              secundaria={fuentes.secundaria}
              alSeleccionar={aplicarPlantilla}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[var(--admin-texto)]">
            Fuentes personalizadas
          </h3>
          <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
            La fuente principal se usa en el texto general y la secundaria en los títulos.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectorFuente
              id="fuente-principal"
              etiqueta="Texto general (principal)"
              valor={fuentes.principal}
              alCambiar={cambiarPrincipal}
            />

            <SelectorFuente
              id="fuente-secundaria"
              etiqueta="Títulos (secundaria)"
              valor={fuentes.secundaria}
              alCambiar={cambiarSecundaria}
            />
          </div>
          <div className="mt-4 rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-4">
            <h4
              className="mb-2 text-lg font-bold text-[var(--admin-texto)]"
              style={{
                fontFamily: `'${fuentes.secundaria}', ${respaldoFuente(fuentes.secundaria)}`,
              }}
            >
              Tu próxima gran idea
            </h4>
            <p
              className="text-base text-[var(--admin-texto)]"
              style={{ fontFamily: `'${fuentes.principal}', ${respaldoFuente(fuentes.principal)}` }}
            >
              Este es un párrafo de ejemplo que muestra cómo se ve el texto
              general en tu tienda.
            </p>
          </div>
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
