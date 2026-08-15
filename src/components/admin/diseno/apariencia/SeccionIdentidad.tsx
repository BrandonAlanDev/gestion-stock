"use client";

import { Save, Store } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateBrandingConfig } from "@/actions/page-config/branding.actions";
import ImageUploader from "@/components/admin/page-config/shared/ImageUploader";
import type { ConfigApariencia } from "./tipos-apariencia";

interface FormIdentidad {
  storeName: string;
  slogan: string;
  description: string;
  logo: string;
  favicon: string;
}

const clasesInput =
  "w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-3 py-2 text-sm text-[var(--admin-texto)] placeholder:text-[var(--admin-texto-suave)] focus:border-[var(--admin-primario)] focus:outline-none";

export default function SeccionIdentidad({
  config,
}: {
  config: ConfigApariencia;
}) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormIdentidad>({
    storeName: config.storeName,
    slogan: config.slogan ?? "",
    description: config.description ?? "",
    logo: config.logo ?? "",
    favicon: config.favicon ?? "",
  });

  const actualizar = (campo: keyof FormIdentidad, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const guardar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateBrandingConfig(form);
      if (!res.ok) {
        toast.error(res.error ?? "Error al guardar");
        return;
      }
      toast.success("Cambios guardados");
    });
  };

  return (
    <section className="rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)]">
      <div className="border-b border-[var(--admin-borde)] p-5">
        <div className="flex items-center gap-2">
          <Store size={16} className="text-[var(--admin-primario)]" />
          <h2 className="text-sm font-semibold text-[var(--admin-texto)]">Identidad</h2>
        </div>
        <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
          Nombre y logotipo de tu tienda
        </p>
      </div>

      <form onSubmit={guardar} className="p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="nombre-tienda"
              className="text-xs font-medium text-[var(--admin-texto)]"
            >
              Nombre de la tienda
            </label>
            <input
              id="nombre-tienda"
              value={form.storeName}
              onChange={(e) => actualizar("storeName", e.target.value)}
              placeholder="Nombre de tu tienda"
              className={clasesInput}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="slogan"
              className="text-xs font-medium text-[var(--admin-texto)]"
            >
              Slogan
            </label>
            <input
              id="slogan"
              value={form.slogan}
              onChange={(e) => actualizar("slogan", e.target.value)}
              placeholder="Frase corta de tu tienda"
              className={clasesInput}
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label
              htmlFor="descripcion"
              className="text-xs font-medium text-[var(--admin-texto)]"
            >
              Descripción
            </label>
            <textarea
              id="descripcion"
              rows={3}
              value={form.description}
              onChange={(e) => actualizar("description", e.target.value)}
              placeholder="Descripción breve de tu tienda"
              className={`${clasesInput} resize-none`}
            />
          </div>

          <ImageUploader
            label="Logo"
            value={form.logo}
            onChange={(valor) => actualizar("logo", valor)}
          />

          <ImageUploader
            label="Favicon"
            value={form.favicon}
            onChange={(valor) => actualizar("favicon", valor)}
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-primario)] px-4 py-2 text-sm font-semibold text-[var(--admin-primario-texto)] transition hover:opacity-90 disabled:opacity-50"
          >
            <Save size={16} />
            {isPending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </section>
  );
}
