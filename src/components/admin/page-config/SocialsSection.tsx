"use client";

import { Globe, Save } from "lucide-react";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import { updateSocialsConfig } from "@/actions/page-config/socials.actions";

import Input from "./shared/Input";

interface Props {
  config: any;
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
    <section className="rounded-[2rem] border border-neutral-900 bg-black/40 overflow-hidden">
      <div className="border-b border-neutral-900 px-8 py-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <Globe size={22} />
        </div>

        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tight">
            Redes Sociales
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
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

      <div className="px-8 pb-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="h-14 px-8 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-[0.25em] text-xs flex items-center gap-3"
        >
          <Save size={18} />

          {isPending
            ? "Guardando..."
            : "Guardar Redes"}
        </button>
      </div>
    </section>
  );
}