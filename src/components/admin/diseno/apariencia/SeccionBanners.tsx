"use client";

import { Images, Plus, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createBanner,
  updateBrandingConfig,
} from "@/actions/page-config/branding.actions";
import BannerCard from "@/components/admin/design/BannerCard";
import type { ConfigApariencia } from "./tipos-apariencia";

interface BannerForm {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  text: string;
  url: string;
}

export default function SeccionBanners({
  config,
}: {
  config: ConfigApariencia;
}) {
  const [isPending, startTransition] = useTransition();
  const [banners, setBanners] = useState<BannerForm[]>(
    (config.banners ?? []).map((banner) => ({
      id: banner.id,
      image: banner.image ?? "",
      title: banner.title ?? "",
      subtitle: banner.subtitle ?? "",
      text: banner.text ?? "",
      url: banner.url ?? "",
    }))
  );

  const cambiarBanner = (
    index: number,
    campo: string,
    valor: string
  ) => {
    setBanners((prev) =>
      prev.map((banner, i) =>
        i === index ? { ...banner, [campo]: valor } : banner
      )
    );
  };

  const quitarBanner = (index: number) => {
    setBanners((prev) => prev.filter((_, i) => i !== index));
  };

  const agregarBanner = () => {
    startTransition(async () => {
      const res = await createBanner();
      if (!res.ok) {
        toast.error(res.error ?? "Error al agregar banner");
        return;
      }
      if (!res.banner) return;
      setBanners((prev) => [
        ...prev,
        {
          id: res.banner.id,
          image: "",
          title: "",
          subtitle: "",
          text: "",
          url: "",
        },
      ]);
      toast.success("Banner agregado");
    });
  };

  const guardar = () => {
    startTransition(async () => {
      const res = await updateBrandingConfig({
        banners: banners.map((banner) => ({
          image: banner.image,
          title: banner.title,
          subtitle: banner.subtitle,
          text: banner.text,
          url: banner.url,
        })),
      });
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
          <Images size={16} className="text-[var(--admin-primario)]" />
          <h2 className="text-sm font-semibold text-[var(--admin-texto)]">Banners</h2>
        </div>
        <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
          Franjas con imagen y texto para tu tienda
        </p>
      </div>

      <div className="space-y-5 p-5">
        {banners.length === 0 ? (
          <p className="text-sm text-[var(--admin-texto-suave)]">
            Todavía no hay banners. Agregá uno con el botón de abajo.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {banners.map((banner, index) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                index={index}
                onChange={cambiarBanner}
                onRemove={quitarBanner}
                primaryColor={config.primaryColor}
                secondaryColor={config.secondaryColor}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={agregarBanner}
            disabled={isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--admin-borde)] px-4 py-2 text-sm font-semibold text-[var(--admin-texto)] transition hover:bg-[var(--admin-fondo-hover)] disabled:opacity-50"
          >
            <Plus size={16} />
            Agregar banner
          </button>

          <button
            type="button"
            onClick={guardar}
            disabled={isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--admin-primario)] px-4 py-2 text-sm font-semibold text-[var(--admin-primario-texto)] transition hover:opacity-90 disabled:opacity-50"
          >
            <Save size={16} />
            {isPending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </section>
  );
}
