"use client";

import {
  MapPin,
  Save,
} from "lucide-react";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import { updateLocationConfig } from "@/actions/page-config/location.actions";

import Input from "@/components/admin/page-config/shared/Input";

import SwitchCard from "@/components/admin/page-config/shared/SwitchCard";

interface Props {
  config?: {
    locationEnabled?: boolean | null;
    address?: string | null;
    city?: string | null;
    province?: string | null;
    country?: string | null;
  };
  primaryColor?: string;
  secondaryColor?: string;
}
export default function LocationSection({
  config,
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
    value: string | boolean
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

    <section className="overflow-hidden rounded-[2rem] border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] text-[var(--admin-texto)]">
      <div className="flex items-center gap-4 border-b border-[var(--admin-borde)] px-4 py-4 sm:px-8 sm:py-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--admin-primario-suave)] bg-[var(--admin-primario-suave)] text-[var(--admin-primario)]">
          <MapPin size={22} />
        </div>

        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tight">
            Ubicación
          </h2>
        </div>
      </div>

      <div className="p-4 sm:p-8 space-y-6">
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

      <div className="px-4 pb-4 sm:px-8 sm:pb-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[var(--admin-primario)] px-8 text-xs font-black uppercase tracking-[0.25em] text-[var(--admin-primario-texto)] opacity-90 transition hover:cursor-pointer hover:opacity-100 disabled:opacity-50 sm:w-auto">
          <Save size={18} />

          {isPending
            ? "Guardando..."
            : "Guardar Ubicación"}
        </button>
      </div>
    </section>
  );
}
