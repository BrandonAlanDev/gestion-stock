"use client";

import { ImageIcon, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateBrandingConfig } from "@/actions/page-config/branding.actions";

import ImageUploader from "./shared/ImageUploader";
import Input from "./shared/Input";
import Textarea from "./shared/Textarea";

interface Props {
  config: any;
}

export default function BrandingSection({
  config,
}: Props) {
  const [isPending, startTransition] =
    useTransition();

  const [form, setForm] = useState({
    storeName:
      config?.storeName || "GestionOK",

    slogan:
      config?.slogan || "",

    description:
      config?.description || "",

    logo:
      config?.logo || "",

    banner:
      config?.banner || "",

    favicon:
      config?.favicon || "",

    primaryColor:
      config?.primaryColor || "#06b6d4",

    secondaryColor:
      config?.secondaryColor || "#ffffff",
  });

  const handleChange = (
    key: string,
    value: any
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const res =
        await updateBrandingConfig(
          form
        );

      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      toast.success(
        "Branding actualizado"
      );
    });
  };

  return (
    <section className="rounded-[2rem] border border-neutral-900 bg-black/40 backdrop-blur-xl overflow-hidden">
      <div className="border-b border-neutral-900 px-8 py-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <ImageIcon size={22} />
        </div>

        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tight">
            Branding
          </h2>

          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-bold">
            Logos · Colores · Apariencia
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
        <Input
          label="Nombre"
          value={form.storeName}
          onChange={(v) =>
            handleChange(
              "storeName",
              v
            )
          }
        />

        <Input
          label="Slogan"
          value={form.slogan}
          onChange={(v) =>
            handleChange(
              "slogan",
              v
            )
          }
        />

        <div className="md:col-span-2">
          <Textarea
            label="Descripción"
            value={form.description}
            onChange={(v) =>
              handleChange(
                "description",
                v
              )
            }
          />
        </div>

        <ImageUploader
          label="Logo"
          value={form.logo}
          onChange={(v) =>
            handleChange(
              "logo",
              v
            )
          }
        />

        <ImageUploader
          label="Banner"
          value={form.banner}
          onChange={(v) =>
            handleChange(
              "banner",
              v
            )
          }
        />

        <ImageUploader
          label="Favicon"
          value={form.favicon}
          onChange={(v) =>
            handleChange(
              "favicon",
              v
            )
          }
        />

        <div>
          <label className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500 mb-3 block">
            Color Principal
          </label>

          <input
            type="color"
            value={form.primaryColor}
            onChange={(e) =>
              handleChange(
                "primaryColor",
                e.target.value
              )
            }
            className="w-full h-14 rounded-2xl"
          />
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500 mb-3 block">
            Color Secundario
          </label>

          <input
            type="color"
            value={form.secondaryColor}
            onChange={(e) =>
              handleChange(
                "secondaryColor",
                e.target.value
              )
            }
            className="w-full h-14 rounded-2xl"
          />
        </div>
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
            : "Guardar Branding"}
        </button>
      </div>
    </section>
  );
}