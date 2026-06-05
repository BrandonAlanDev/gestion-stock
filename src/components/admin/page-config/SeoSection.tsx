"use client";

import { Globe, Save } from "lucide-react";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import { updateSeoConfig } from "@/actions/page-config/seo.actions";

import Input from "./shared/Input";
import Textarea from "./shared/Textarea";

interface Props {
  config: any;
}

export default function SeoSection({
  config,
}: Props) {
  const [isPending, startTransition] =
    useTransition();

  const [form, setForm] = useState({
    metaTitle:
      config?.metaTitle ||
      "GestionOK",

    metaDescription:
      config?.metaDescription ||
      "",
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
        await updateSeoConfig(form);

      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      toast.success(
        "SEO actualizado"
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
            SEO
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-8">
        <Input
          label="Meta Title"
          value={form.metaTitle}
          onChange={(v) =>
            handleChange(
              "metaTitle",
              v
            )
          }
        />

        <Textarea
          label="Meta Description"
          value={
            form.metaDescription
          }
          onChange={(v) =>
            handleChange(
              "metaDescription",
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
            : "Guardar SEO"}
        </button>
      </div>
    </section>
  );
}