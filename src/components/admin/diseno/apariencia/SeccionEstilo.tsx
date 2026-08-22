"use client";

import { Sparkles } from "lucide-react";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { updateBrandingConfig } from "@/actions/page-config/branding.actions";
import SelectorSegmentado from "@/components/ui/selector-segmentado";

import { ConfigApariencia } from "./tipos-apariencia";

interface EstadoEstilo {
  radio: string;
  sombra: string;
  densidad: string;
}

interface FilaEstilo {
  etiqueta: string;
  opciones: { valor: string; etiqueta: string }[];
  valor: string;
  alCambiar: (valor: string) => void;
}

function FilaSelector({ etiqueta, opciones, valor, alCambiar }: FilaEstilo) {
  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs font-medium text-[var(--admin-texto)]">{etiqueta}</span>
      <SelectorSegmentado
        opciones={opciones}
        valor={valor}
        alCambiar={alCambiar}
      />
    </div>
  );
}

export default function SeccionEstilo({
  config,
}: {
  config: ConfigApariencia;
}) {
  const [estilo, setEstilo] = useState<EstadoEstilo>({
    radio: config.borderRadius,
    sombra: config.shadowLevel,
    densidad: config.density,
  });

  const guardar = (nuevoEstilo: EstadoEstilo) => {
    startTransition(async () => {
      const resultado = await updateBrandingConfig({
        borderRadius: nuevoEstilo.radio,
        shadowLevel: nuevoEstilo.sombra,
        density: nuevoEstilo.densidad,
      });

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
          <Sparkles size={16} className="text-[var(--admin-primario)]" />
          <h2 className="text-sm font-semibold text-[var(--admin-texto)]">Estilo</h2>
        </div>
        <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
          Bordes, sombras y densidad de los componentes
        </p>
      </div>

      <div className="space-y-4 p-5">
        <FilaSelector
          etiqueta="Bordes"
          valor={estilo.radio}
          opciones={[
            { valor: "recto", etiqueta: "Recto" },
            { valor: "redondeado", etiqueta: "Redondeado" },
            { valor: "muy-redondeado", etiqueta: "Muy redondeado" },
          ]}
          alCambiar={(valor) => {
            const nuevo = { ...estilo, radio: valor };
            setEstilo(nuevo);
            guardar(nuevo);
          }}
        />

        <FilaSelector
          etiqueta="Sombras"
          valor={estilo.sombra}
          opciones={[
            { valor: "sin-sombra", etiqueta: "Sin sombra" },
            { valor: "sutil", etiqueta: "Sutil" },
            { valor: "marcada", etiqueta: "Marcada" },
          ]}
          alCambiar={(valor) => {
            const nuevo = { ...estilo, sombra: valor };
            setEstilo(nuevo);
            guardar(nuevo);
          }}
        />

        <FilaSelector
          etiqueta="Densidad"
          valor={estilo.densidad}
          opciones={[
            { valor: "compacta", etiqueta: "Compacta" },
            { valor: "comoda", etiqueta: "Cómoda" },
            { valor: "espaciosa", etiqueta: "Espaciosa" },
          ]}
          alCambiar={(valor) => {
            const nuevo = { ...estilo, densidad: valor };
            setEstilo(nuevo);
            guardar(nuevo);
          }}
        />
      </div>
    </section>
  );
}
