"use client";

import { Phone, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateContactConfig } from "@/actions/page-config/contact.actions";
import Input from "./shared/Input";

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

export default function ContactSection({ config, primaryColor, secondaryColor }: Props) {
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    phone: config?.phone || "",
    whatsapp: config?.whatsapp || "",
    email: config?.email || "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateContactConfig(form);

      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      toast.success("Contacto actualizado");
    });
  };

  return (

    <section className="rounded-[2rem] border overflow-hidden"
      style={{
        backgroundColor:secondaryColor || "black",
        color:getContrastColor(secondaryColor || "black"),
        borderColor:getContrastColor(secondaryColor || "black")
      }}
    >
      <div className="border-b border-neutral-900 px-4 py-4 sm:px-8 sm:py-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400"
          style={{
            backgroundColor:primaryColor?.concat("33"),
            color:primaryColor || "black",
            borderColor:primaryColor || "black"
          }}
        >
          <Phone size={22} />
        </div>

        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tight">
            Contacto
          </h2>
          <p className="text-xs uppercase tracking-[0.3em] font-bold">
            Teléfonos · Email · WhatsApp
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 sm:p-8">
        <Input
          label="Teléfono"
          value={form.phone}
          onChange={(v) => handleChange("phone", v)}
        />

        <Input
          label="WhatsApp"
          value={form.whatsapp}
          onChange={(v) => handleChange("whatsapp", v)}
        />

        <Input
          label="Email"
          value={form.email}
          onChange={(v) => handleChange("email", v)}
        />
      </div>

      <div className="px-4 pb-4 sm:px-8 sm:pb-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full sm:w-auto justify-center h-14 px-8 rounded-2xl font-black uppercase tracking-[0.25em] text-xs flex items-center gap-3 hover:cursor-pointer opacity-90 hover:opacity-100 transition"
          style={{
            backgroundColor: primaryColor || "black",
            color: getContrastColor(primaryColor || "black"),
          }}>
          <Save size={18} />
          {isPending ? "Guardando..." : "Guardar Contacto"}
        </button>
      </div>
    </section>
  );
}