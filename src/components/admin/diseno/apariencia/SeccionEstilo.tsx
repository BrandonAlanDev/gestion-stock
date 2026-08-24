"use client";

import { Save, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [estilo, setEstilo] = useState<EstadoEstilo>({
    radio: config.borderRadius,
    sombra: config.shadowLevel,
    densidad: config.density,
  });
  const [base, setBase] = useState<EstadoEstilo>({
    radio: config.borderRadius,
    sombra: config.shadowLevel,
    densidad: config.density,
  });

  const tieneCambios =
    estilo.radio !== base.radio ||
    estilo.sombra !== base.sombra ||
    estilo.densidad !== base.densidad;

  const guardar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const resultado = await updateBrandingConfig({
        borderRadius: estilo.radio,
        shadowLevel: estilo.sombra,
        density: estilo.densidad,
      });

      if (!resultado.ok) {
        toast.error(resultado.error);
        return;
      }

      setBase({ radio: estilo.radio, sombra: estilo.sombra, densidad: estilo.densidad });
      toast.success("Cambios guardados");
      router.refresh();
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

      <form onSubmit={guardar} className="space-y-4 p-5">
        <FilaSelector
          etiqueta="Bordes"
          valor={estilo.radio}
          opciones={[
            { valor: "recto", etiqueta: "Recto" },
            { valor: "redondeado", etiqueta: "Redondeado" },
            { valor: "muy-redondeado", etiqueta: "Muy redondeado" },
          ]}
          alCambiar={(valor) =>
            setEstilo((actual) => ({ ...actual, radio: valor }))
          }
        />

        <FilaSelector
          etiqueta="Sombras"
          valor={estilo.sombra}
          opciones={[
            { valor: "sin-sombra", etiqueta: "Sin sombra" },
            { valor: "sutil", etiqueta: "Sutil" },
            { valor: "marcada", etiqueta: "Marcada" },
          ]}
          alCambiar={(valor) =>
            setEstilo((actual) => ({ ...actual, sombra: valor }))
          }
        />

        <FilaSelector
          etiqueta="Densidad"
          valor={estilo.densidad}
          opciones={[
            { valor: "compacta", etiqueta: "Compacta" },
            { valor: "comoda", etiqueta: "Cómoda" },
            { valor: "espaciosa", etiqueta: "Espaciosa" },
          ]}
          alCambiar={(valor) =>
            setEstilo((actual) => ({ ...actual, densidad: valor }))
          }
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || !tieneCambios}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-primario)] px-4 py-2 text-sm font-semibold text-[var(--admin-primario-texto)] transition hover:opacity-90 disabled:opacity-50"
          >
            <Save size={16} />
            {isPending ? "Guardando..." : "Guardar estilo"}
          </button>
        </div>
      </form>
    </section>
  );
}
