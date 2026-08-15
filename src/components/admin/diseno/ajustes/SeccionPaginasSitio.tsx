"use client";

import { FileStack } from "lucide-react";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { updatePageFlags } from "@/actions/page-config/flags.actions";
import Switch from "@/components/ui/switch";

import type { ConfigAjustes } from "./tipos-ajustes";

interface EstadoPaginas {
  escuelaEnabled: boolean;
  arreglosEnabled: boolean;
  personalizadoEnabled: boolean;
}

type CampoPagina = keyof EstadoPaginas;

export default function SeccionPaginasSitio({
  config,
}: {
  config: ConfigAjustes;
}) {
  const [estado, setEstado] = useState<EstadoPaginas>({
    escuelaEnabled: config.escuelaEnabled,
    arreglosEnabled: config.arreglosEnabled,
    personalizadoEnabled: config.personalizadoEnabled,
  });

  const cambiar = (campo: CampoPagina, valor: boolean) => {
    setEstado((previo) => ({ ...previo, [campo]: valor }));

    startTransition(async () => {
      const resultado = await updatePageFlags({ [campo]: valor });

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
          <FileStack size={16} className="text-[var(--admin-primario)]" />
          <h2 className="text-sm font-semibold text-[var(--admin-texto)]">Páginas del sitio</h2>
        </div>
        <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
          Mostrá u ocultá secciones especiales
        </p>
      </div>

      <div className="divide-y divide-[var(--admin-borde)] px-5">
        <Switch
          activo={estado.escuelaEnabled}
          alCambiar={(valor) => cambiar("escuelaEnabled", valor)}
          etiqueta="Escuela"
          descripcion="Página de cursos de surf"
        />
        <Switch
          activo={estado.arreglosEnabled}
          alCambiar={(valor) => cambiar("arreglosEnabled", valor)}
          etiqueta="Arreglos"
          descripcion="Página de reparaciones"
        />
        <Switch
          activo={estado.personalizadoEnabled}
          alCambiar={(valor) => cambiar("personalizadoEnabled", valor)}
          etiqueta="Tablas personalizadas"
          descripcion="Constructor de tablas a medida"
        />
      </div>
    </section>
  );
}
