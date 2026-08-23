"use client";

import { PanelBottom, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateFooterConfig } from "@/actions/page-config/footer.actions";
import Switch from "@/components/ui/switch";

interface ConfigFooterSeccion {
  footerAboutText: string | null;
  footerCopyrightText: string | null;
  footerShowSobre: boolean;
  footerShowNavegacion: boolean;
  footerShowContacto: boolean;
  footerShowUbicacion: boolean;
  footerShowRedes: boolean;
  footerShowLegales: boolean;
}

const clasesCampo =
  "w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-3 py-2 text-sm text-[var(--admin-texto)] focus:border-[var(--admin-primario)] focus:outline-none";

export default function FooterSection({ config }: { config: ConfigFooterSeccion }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sobre, setSobre] = useState(config.footerAboutText ?? "");
  const [copyright, setCopyright] = useState(config.footerCopyrightText ?? "");
  const [mostrarSobre, setMostrarSobre] = useState(config.footerShowSobre);
  const [mostrarNavegacion, setMostrarNavegacion] = useState(config.footerShowNavegacion);
  const [mostrarContacto, setMostrarContacto] = useState(config.footerShowContacto);
  const [mostrarUbicacion, setMostrarUbicacion] = useState(config.footerShowUbicacion);
  const [mostrarRedes, setMostrarRedes] = useState(config.footerShowRedes);
  const [mostrarLegales, setMostrarLegales] = useState(config.footerShowLegales);

  const guardar = () => {
    startTransition(async () => {
      const resultado = await updateFooterConfig({
        footerAboutText: sobre,
        footerCopyrightText: copyright,
        footerShowSobre: mostrarSobre,
        footerShowNavegacion: mostrarNavegacion,
        footerShowContacto: mostrarContacto,
        footerShowUbicacion: mostrarUbicacion,
        footerShowRedes: mostrarRedes,
        footerShowLegales: mostrarLegales,
      });

      if (!resultado.ok) {
        toast.error(resultado.error);
        return;
      }

      toast.success("Cambios guardados");
      router.refresh();
    });
  };

  return (
    <section className="rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)]">
      <div className="border-b border-[var(--admin-borde)] p-5">
        <div className="flex items-center gap-2">
          <PanelBottom size={16} className="text-[var(--admin-primario)]" />
          <h2 className="text-sm font-semibold text-[var(--admin-texto)]">Footer</h2>
        </div>
        <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
          Textos y visibilidad del pie de página
        </p>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-1.5">
          <label
            htmlFor="footer-sobre"
            className="text-xs font-medium text-[var(--admin-texto)]"
          >
            Texto sobre la tienda
          </label>
          <textarea
            id="footer-sobre"
            rows={3}
            maxLength={300}
            value={sobre}
            onChange={(evento) => setSobre(evento.target.value)}
            className={clasesCampo}
          />
          <p className="text-right text-[10px] text-[var(--admin-texto-suave)]">
            {sobre.length}/300
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="footer-copyright"
            className="text-xs font-medium text-[var(--admin-texto)]"
          >
            Texto de copyright
          </label>
          <input
            id="footer-copyright"
            maxLength={150}
            value={copyright}
            onChange={(evento) => setCopyright(evento.target.value)}
            className={clasesCampo}
          />
          <p className="text-right text-[10px] text-[var(--admin-texto-suave)]">
            {copyright.length}/150
          </p>
        </div>

        <div className="divide-y divide-[var(--admin-borde)] rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-4">
          <Switch
            activo={mostrarSobre}
            alCambiar={setMostrarSobre}
            etiqueta="Mostrar columna Sobre la tienda"
          />
          <Switch
            activo={mostrarNavegacion}
            alCambiar={setMostrarNavegacion}
            etiqueta="Mostrar navegación"
          />
          <Switch
            activo={mostrarContacto}
            alCambiar={setMostrarContacto}
            etiqueta="Mostrar contacto"
          />
          <Switch
            activo={mostrarUbicacion}
            alCambiar={setMostrarUbicacion}
            etiqueta="Mostrar ubicación"
          />
          <Switch
            activo={mostrarRedes}
            alCambiar={setMostrarRedes}
            etiqueta="Mostrar redes"
          />
          <Switch
            activo={mostrarLegales}
            alCambiar={setMostrarLegales}
            etiqueta="Mostrar legales"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={guardar}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-primario)] px-4 py-2 text-sm font-semibold text-[var(--admin-primario-texto)] transition hover:opacity-90 disabled:opacity-50"
          >
            <Save size={16} />
            {isPending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </section>
  );
}
