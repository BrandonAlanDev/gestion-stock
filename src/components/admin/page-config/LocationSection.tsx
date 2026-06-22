"use client";

import {
  MapPin,
  Save,
} from "lucide-react";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import { updateLocationConfig } from "@/actions/page-config/location.actions";

import Input from "./shared/Input";

import SwitchCard from "./shared/SwitchCard";

interface Props {
  config: any;
  primaryColor?: string;
  secondaryColor?: string;
}
function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function LocationSection({
  config,
  primaryColor,
  secondaryColor
}: Props) {
  const [isPending, startTransition] =
    useTransition();

  const [form, setForm] = useState({
    locationEnabled:
      config?.locationEnabled ??
      false,

    address:
      config?.address || "",

    city:
      config?.city || "",

    province:
      config?.province || "",

    country:
      config?.country || "",
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
        await updateLocationConfig(
          form
        );

      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      toast.success(
        "Ubicación actualizada"
      );
    });
  };

  return (
    <section className="rounded-[2rem] border border-neutral-900 bg-black/40 overflow-hidden"
      style={{
          backgroundColor:secondaryColor || "black",
          color:getContrastColor(secondaryColor || "black"),
          borderColor:getContrastColor(secondaryColor || "black")
        }}
    >
      <div className="border-b border-neutral-900 px-8 py-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400"
          style={{
            backgroundColor:primaryColor?.concat("33"),
            color:primaryColor || "black",
            borderColor:primaryColor || "black"
          }}
        >
          <MapPin size={22} />
        </div>

        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tight">
            Ubicación
          </h2>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <SwitchCard
          title="Ubicación Activada"
          checked={
            form.locationEnabled
          }
          onChange={(v) =>
            handleChange(
              "locationEnabled",
              v
            )
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Dirección"
            value={form.address}
            onChange={(v) =>
              handleChange(
                "address",
                v
              )
            }
          />

          <Input
            label="Ciudad"
            value={form.city}
            onChange={(v) =>
              handleChange(
                "city",
                v
              )
            }
          />

          <Input
            label="Provincia"
            value={form.province}
            onChange={(v) =>
              handleChange(
                "province",
                v
              )
            }
          />

          <Input
            label="País"
            value={form.country}
            onChange={(v) =>
              handleChange(
                "country",
                v
              )
            }
          />
        </div>
      </div>

      <div className="px-8 pb-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="h-14 px-8 rounded-2xl font-black uppercase tracking-[0.25em] text-xs flex items-center gap-3 hover:cursor-pointer opacity-90 hover:opacity-100 transition"
          style={{
            backgroundColor: primaryColor || "black",
            color: getContrastColor(primaryColor || "black"),
          }}>
          <Save size={18} />

          {isPending
            ? "Guardando..."
            : "Guardar Ubicación"}
        </button>
      </div>
    </section>
  );
}