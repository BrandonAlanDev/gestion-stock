"use client";

import { Wrench } from "lucide-react";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { updatePageFlags } from "@/actions/page-config/flags.actions";
import Badge from "@/components/ui/badge";
import Switch from "@/components/ui/switch";

import type { ConfigAjustes } from "./tipos-ajustes";

export default function SeccionMantenimiento({
  config,
}: {
  config: ConfigAjustes;
}) {
  const [activo, setActivo] = useState(config.maintenanceMode);

  const cambiar = (valor: boolean) => {
    setActivo(valor);

    startTransition(async () => {
      const resultado = await updatePageFlags({ maintenanceMode: valor });

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
            <Wrench size={16} className="text-[var(--admin-primario)]" />
            <h2 className="text-sm font-semibold text-[var(--admin-texto)]">
              Modo mantenimiento
            </h2>
          </div>
          {activo ? (
            <Badge variante="borrador">Activado</Badge>
          ) : (
            <Badge variante="info">Desactivado</Badge>
          )}
        </div>
        <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
          Mostrá un aviso y ocultá la tienda temporalmente
        </p>
      </div>

      <div className="px-5">
        <Switch
          activo={activo}
          alCambiar={cambiar}
          etiqueta="Modo mantenimiento activo"
          descripcion="Los visitantes ven un aviso en lugar de la tienda"
        />
      </div>
    </section>
  );
}
