"use client";

import { Globe, Save } from "lucide-react";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import { updateSocialsConfig } from "@/actions/page-config/socials.actions";

import Input from "@/components/admin/page-config/shared/Input";

interface Props {
  config?: {
    instagram?: string | null;
    facebook?: string | null;
    tiktok?: string | null;
    x?: string | null;
    youtube?: string | null;
    linkedin?: string | null;
  };
  primaryColor?: string;
  secondaryColor?: string;
}

export default function SocialsSection({
  config,
}: Props) {
  const [isPending, startTransition] =
    useTransition();

  const [form, setForm] = useState({
    instagram:
      config?.instagram || "",

    facebook:
      config?.facebook || "",

    tiktok:
      config?.tiktok || "",

    x:
      config?.x || "",

    youtube:
      config?.youtube || "",

    linkedin:
      config?.linkedin || "",
  });

  const handleChange = (
    key: string,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const res =
        await updateSocialsConfig(
          form
        );

      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      toast.success(
        "Redes actualizadas"
      );
    });
  };

  return (

    <section className="overflow-hidden rounded-[2rem] border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] text-[var(--admin-texto)]">
      <div className="flex items-center gap-4 border-b border-[var(--admin-borde)] px-4 py-4 sm:px-8 sm:py-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--admin-primario-suave)] bg-[var(--admin-primario-suave)] text-[var(--admin-primario)]">
          <Globe size={22} />
        </div>

        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tight">
            Redes Sociales
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 sm:p-8">
        <Input
          label="Instagram"
          value={form.instagram}
          onChange={(v) =>
            handleChange(
              "instagram",
              v
            )
          }
        />

        <Input
          label="Facebook"
          value={form.facebook}
          onChange={(v) =>
            handleChange(
              "facebook",
              v
            )
          }
        />

        <Input
          label="TikTok"
          value={form.tiktok}
          onChange={(v) =>
            handleChange(
              "tiktok",
              v
            )
          }
        />

        <Input
          label="X / Twitter"
          value={form.x}
          onChange={(v) =>
            handleChange(
              "x",
              v
            )
          }
        />

        <Input
          label="YouTube"
          value={form.youtube}
          onChange={(v) =>
            handleChange(
              "youtube",
              v
            )
          }
        />

        <Input
          label="Linkedin"
          value={form.linkedin}
          onChange={(v) =>
            handleChange(
              "linkedin",
              v
            )
          }
        />
      </div>

      <div className="px-4 pb-4 sm:px-8 sm:pb-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[var(--admin-primario)] px-8 text-xs font-black uppercase tracking-[0.25em] text-[var(--admin-primario-texto)] opacity-90 transition hover:cursor-pointer hover:opacity-100 disabled:opacity-50 sm:w-auto">
          <Save size={18} />

          {isPending
            ? "Guardando..."
            : "Guardar Redes"}
        </button>
      </div>
    </section>
  );
}
