"use client";

import { Palette } from "lucide-react";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { updateBrandingConfig } from "@/actions/page-config/branding.actions";
import ColorPicker from "@/components/ui/color-picker";
import { getContrastColor } from "@/lib/utils";

import { ConfigApariencia } from "./tipos-apariencia";

interface EstadoColores {
  primario: string;
  secundario: string;
}

export default function SeccionColores({
  config,
}: {
  config: ConfigApariencia;
}) {
  const [colores, setColores] = useState<EstadoColores>({
    primario: config.primaryColor,
    secundario: config.secondaryColor,
  });

  const guardar = (nuevosColores: EstadoColores) => {
    startTransition(async () => {
      const resultado = await updateBrandingConfig({
        primaryColor: nuevosColores.primario,
        secondaryColor: nuevosColores.secundario,
      });

      if (!resultado.ok) {
        toast.error(resultado.error);
        return;
      }

      toast.success("Cambios guardados");
    });
  };

  const cambiarPrimario = (valor: string) => {
    const nuevos = { ...colores, primario: valor };
    setColores(nuevos);
    guardar(nuevos);
  };

  const cambiarSecundario = (valor: string) => {
    const nuevos = { ...colores, secundario: valor };
    setColores(nuevos);
    guardar(nuevos);
  };

  return (
    <section className="rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)]">
      <div className="border-b border-[var(--admin-borde)] p-5">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-[var(--admin-primario)]" />
          <h2 className="text-sm font-semibold text-[var(--admin-texto)]">Colores</h2>
        </div>
        <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
          Color principal y de fondo de tu tienda
        </p>
      </div>

      <div className="space-y-4 p-5">
        <ColorPicker
          etiqueta="Color principal"
          valor={colores.primario}
          alCambiar={cambiarPrimario}
          presets={[
            "#06b6d4",
            "#55C7C9",
            "#0d5c63",
            "#083d42",
            "#4ab8b8",
            "#0a0a0a",
            "#f97316",
            "#e11d48",
          ]}
        />

        <ColorPicker
          etiqueta="Color secundario"
          valor={colores.secundario}
          alCambiar={cambiarSecundario}
          presets={[
            "#ffffff",
            "#f5f5f5",
            "#0a0a0a",
            "#111111",
            "#e0f5f5",
            "#083d42",
          ]}
        />

        <div
          className="flex h-9 items-center justify-center rounded-lg border border-[var(--admin-borde)]"
          style={{ backgroundColor: colores.secundario }}
        >
          <div
            className="rounded-md px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: colores.primario, color: getContrastColor(colores.primario) }}
          >
            Botón
          </div>
        </div>
      </div>
    </section>
  );
}
