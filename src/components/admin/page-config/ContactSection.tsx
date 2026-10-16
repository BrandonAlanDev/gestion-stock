"use client";

import { Phone, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateContactConfig } from "@/actions/page-config/contact.actions";
import Input from "@/components/admin/page-config/shared/Input";

interface Props {
  config?: {
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
  };
  primaryColor?: string;
  secondaryColor?: string;
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

    <section className="overflow-hidden rounded-[2rem] border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] text-[var(--admin-texto)]">
      <div className="flex items-center gap-4 border-b border-[var(--admin-borde)] px-4 py-4 sm:px-8 sm:py-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--admin-primario-suave)] bg-[var(--admin-primario-suave)] text-[var(--admin-primario)]">
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
          className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[var(--admin-primario)] px-8 text-xs font-black uppercase tracking-[0.25em] text-[var(--admin-primario-texto)] opacity-90 transition hover:cursor-pointer hover:opacity-100 disabled:opacity-50 sm:w-auto">
          <Save size={18} />
          {isPending ? "Guardando..." : "Guardar Contacto"}
        </button>
      </div>
    </section>
  );
}
