"use client";

import { Palette, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateBrandingConfig } from "@/actions/page-config/branding.actions";
import ColorPicker from "@/components/ui/color-picker";
import type { PlantillaColor } from "@/lib/plantillas-colores";

import SelectorPlantillasColores from "./SelectorPlantillasColores";
import VistaPreviaPersonalizada from "./VistaPreviaPersonalizada";
import type { ConfigApariencia } from "./tipos-apariencia";

export default function SeccionColores({
  config,
}: {
  config: ConfigApariencia;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [primario, setPrimario] = useState(config.primaryColor);
  const [secundario, setSecundario] = useState(config.secondaryColor);
  const [fondo, setFondo] = useState(config.bgColor);
  const [base, setBase] = useState({
    primario: config.primaryColor,
    secundario: config.secondaryColor,
    fondo: config.bgColor,
  });

  const aplicarPlantilla = (plantilla: PlantillaColor) => {
    setPrimario(plantilla.primaryColor);
    setSecundario(plantilla.secondaryColor);
    setFondo(plantilla.bgColor);
  };

  const tieneCambios =
    primario.toUpperCase() !== base.primario.toUpperCase() ||
    secundario.toUpperCase() !== base.secundario.toUpperCase() ||
    fondo.toUpperCase() !== base.fondo.toUpperCase();

  const guardar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateBrandingConfig({
        primaryColor: primario,
        secondaryColor: secundario,
        bgColor: fondo,
      });
      if (!res.ok) {
        toast.error(res.error ?? "Error al guardar");
        return;
      }
      setBase({ primario, secundario, fondo });
      toast.success("Cambios guardados");
      router.refresh();
    });
  };

  return (
    <section className="rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)]">
      <div className="border-b border-[var(--admin-borde)] p-5">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-[var(--admin-primario)]" />
          <h2 className="text-sm font-semibold text-[var(--admin-texto)]">Colores</h2>
        </div>
        <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
          Tres colores de marca: el sistema deriva el resto automáticamente
        </p>
      </div>

      <form onSubmit={guardar} className="space-y-6 p-5">
        <div>
          <h3 className="text-sm font-semibold text-[var(--admin-texto)]">
            Plantillas de colores
          </h3>
          <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
            Elegí una combinación para comenzar. Podés personalizar los colores después.
          </p>
          <div className="mt-3">
            <SelectorPlantillasColores
              colorPrimario={primario}
              colorSecundario={secundario}
              colorFondo={fondo}
              aplicarPlantilla={aplicarPlantilla}
              nombreNegocio={config.storeName}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[var(--admin-texto)]">
            Colores personalizados
          </h3>
          <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
            Solo necesitás tres colores: el sistema deriva el resto automáticamente.
          </p>
          <div className="mt-3 space-y-4">
            <ColorPicker
              etiqueta="Color principal"
              valor={primario}
              alCambiar={setPrimario}
              presets={[
                "#06b6d4",
                "#55C7C9",
                "#0d5c63",
                "#f97316",
                "#e11d48",
                "#0a0a0a",
              ]}
            />
            <ColorPicker
              etiqueta="Color secundario"
              valor={secundario}
              alCambiar={setSecundario}
              presets={["#ffffff", "#f5f5f5", "#0a0a0a", "#e0f5f5"]}
            />
            <ColorPicker
              etiqueta="Color de fondo"
              valor={fondo}
              alCambiar={setFondo}
              presets={["#09090b", "#0f172a", "#ffffff", "#f5f5f5", "#083d42"]}
            />
          </div>
          <div className="mt-4">
            <VistaPreviaPersonalizada
              colorPrimario={primario}
              colorSecundario={secundario}
              colorFondo={fondo}
              nombreNegocio={config.storeName}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || !tieneCambios}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-primario)] px-4 py-2 text-sm font-semibold text-[var(--admin-primario-texto)] transition hover:opacity-90 disabled:opacity-50"
          >
            <Save size={16} />
            {isPending ? "Guardando..." : "Guardar colores"}
          </button>
        </div>
      </form>
    </section>
  );
}
