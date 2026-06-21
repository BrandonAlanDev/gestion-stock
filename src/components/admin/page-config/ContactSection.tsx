"use client";

import { Phone, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateContactConfig } from "@/actions/page-config/contact.actions";
import Input from "./shared/Input";

interface Props {
  config: any;
}

export default function ContactSection({ config }: Props) {
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
    <section className="rounded-[1.0rem] border border-neutral-900 bg-black/40 overflow-hidden">
      <div className="border-b border-neutral-900 px-8 py-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-[1.0rem] bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <Phone size={22} />
        </div>

        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tight">
            Contacto
          </h2>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-bold">
            Teléfonos · Email · WhatsApp
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
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

      <div className="px-8 pb-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="h-14 px-8 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-[0.25em] text-xs flex items-center gap-3"
        >
          <Save size={18} />
          {isPending ? "Guardando..." : "Guardar Contacto"}
        </button>
      </div>
    </section>
  );
}