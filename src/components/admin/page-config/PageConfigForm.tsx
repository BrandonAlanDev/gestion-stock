"use client";

import { useState, useTransition } from "react";
import {
  Save,
  Store,
  Globe,
  ImageIcon,
  Phone,
  ShoppingBag,
} from "lucide-react";

import Image from "next/image";

import { toast } from "sonner";

import { updatePageConfig } from "@/actions/page-config.actions";

export default function PageConfigForm({
  config,
}: any) {
  const [isPending, startTransition] =
    useTransition();

  const [form, setForm] = useState({
    storeName:
      config?.storeName || "GestionOK",

    description:
      config?.description || "",

    slogan:
      config?.slogan || "",

    logo:
      config?.logo || "",

    favicon:
      config?.favicon || "",

    banner:
      config?.banner || "",

    primaryColor:
      config?.primaryColor || "#06b6d4",

    secondaryColor:
      config?.secondaryColor || "#ffffff",

    ecommerceEnabled:
      config?.ecommerceEnabled ?? true,

    cartEnabled:
      config?.cartEnabled ?? true,

    checkoutEnabled:
      config?.checkoutEnabled ?? true,

    phone:
      config?.phone || "",

    whatsapp:
      config?.whatsapp || "",

    email:
      config?.email || "",

    locationEnabled:
      config?.locationEnabled ?? false,

    address:
      config?.address || "",

    city:
      config?.city || "",

    province:
      config?.province || "",

    country:
      config?.country || "",

    instagram:
      config?.instagram || "",

    facebook:
      config?.facebook || "",

    tiktok:
      config?.tiktok || "",

    x:
      config?.x || "",

    metaTitle:
      config?.metaTitle || "GestionOK",

    metaDescription:
      config?.metaDescription ||
      "GestionOK",
  });

  const handleChange = (
    key: string,
    value: any
  ) => {
    setForm((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const res =
        await updatePageConfig(form);

      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      toast.success(
        "Configuración actualizada"
      );
    });
  };

  return (
    <div className="space-y-8">
      {/* ===================================== */}
      {/* INFORMACIÓN GENERAL */}
      {/* ===================================== */}

      <section className="rounded-[2rem] border border-neutral-900 bg-black/40 backdrop-blur-xl overflow-hidden">
        <div className="border-b border-neutral-900 px-8 py-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Store size={22} />
          </div>

          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tight">
              Información General
            </h2>

            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-bold">
              Identidad del negocio
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
          <Input
            label="Nombre del Local"
            value={form.storeName}
            onChange={(v: string) =>
              handleChange("storeName", v)
            }
          />

          <Input
            label="Slogan"
            value={form.slogan}
            onChange={(v: string) =>
              handleChange("slogan", v)
            }
          />

          <div className="md:col-span-2">
            <Textarea
              label="Descripción"
              value={form.description}
              onChange={(v: string) =>
                handleChange(
                  "description",
                  v
                )
              }
            />
          </div>
        </div>
      </section>

      {/* ===================================== */}
      {/* BRANDING */}
      {/* ===================================== */}

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
        <ImageUploader
            label="Logo Principal"
            value={form.logo}
            onChange={(v: string) =>
                handleChange("logo", v)
            }
        />

        <ImageUploader
            label="Banner Principal"
            value={form.banner}
            onChange={(v: string) =>
                handleChange("banner", v)
            }
        />

          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500 block mb-3">
              Color Principal
            </label>

            <div className="flex items-center gap-4">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) =>
                  handleChange(
                    "primaryColor",
                    e.target.value
                  )
                }
                className="w-20 h-14 rounded-xl overflow-hidden border border-neutral-800 bg-transparent"
              />

              <div
                className="flex-1 h-14 rounded-xl border border-neutral-800 items-center justify-center flex text-md font-bold"
                style={{
                    color : form.secondaryColor,
                    background: form.primaryColor,
                }}
                > HOLA MUNDO</div>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500 block mb-3">
              Color Secundario
            </label>

            <div className="flex items-center gap-4">
              <input
                type="color"
                value={form.secondaryColor}
                onChange={(e) =>
                  handleChange(
                    "secondaryColor",
                    e.target.value
                  )
                }
                className="w-20 h-14 rounded-xl overflow-hidden border border-neutral-800 bg-transparent"
              />

              <div
                className="flex-1 h-14 rounded-xl border border-neutral-800 items-center justify-center flex text-md font-bold"
                style={{
                    color : form.primaryColor,
                    background: form.secondaryColor,
                }}
                > HOLA MUNDO</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================== */}
      {/* ECOMMERCE */}
      {/* ===================================== */}

      <section className="rounded-[2rem] border border-neutral-900 bg-black/40 backdrop-blur-xl overflow-hidden">
        <div className="border-b border-neutral-900 px-8 py-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <ShoppingBag size={22} />
          </div>

          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tight">
              Ecommerce
            </h2>

            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-bold">
              Carrito · Checkout · Compras
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
          <SwitchCard
            title="Ecommerce"
            checked={
              form.ecommerceEnabled
            }
            onChange={(v: boolean) =>
              handleChange(
                "ecommerceEnabled",
                v
              )
            }
          />

          <SwitchCard
            title="Carrito"
            checked={form.cartEnabled}
            onChange={(v: boolean) =>
              handleChange(
                "cartEnabled",
                v
              )
            }
          />

          <SwitchCard
            title="Checkout"
            checked={
              form.checkoutEnabled
            }
            onChange={(v: boolean) =>
              handleChange(
                "checkoutEnabled",
                v
              )
            }
          />
        </div>
      </section>

      {/* ===================================== */}
      {/* CONTACTO */}
      {/* ===================================== */}

      <section className="rounded-[2rem] border border-neutral-900 bg-black/40 backdrop-blur-xl overflow-hidden">
        <div className="border-b border-neutral-900 px-8 py-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
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
            onChange={(v: string) =>
              handleChange("phone", v)
            }
          />

          <Input
            label="WhatsApp"
            value={form.whatsapp}
            onChange={(v: string) =>
              handleChange(
                "whatsapp",
                v
              )
            }
          />

          <Input
            label="Email"
            value={form.email}
            onChange={(v: string) =>
              handleChange("email", v)
            }
          />
        </div>
      </section>

      {/* ===================================== */}
      {/* REDES */}
      {/* ===================================== */}

      <section className="rounded-[2rem] border border-neutral-900 bg-black/40 backdrop-blur-xl overflow-hidden">
        <div className="border-b border-neutral-900 px-8 py-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Globe size={22} />
          </div>

          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tight">
              Redes Sociales
            </h2>

            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-bold">
              Instagram · Facebook · TikTok
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
          <Input
            label="Instagram"
            value={form.instagram}
            onChange={(v: string) =>
              handleChange(
                "instagram",
                v
              )
            }
          />

          <Input
            label="Facebook"
            value={form.facebook}
            onChange={(v: string) =>
              handleChange(
                "facebook",
                v
              )
            }
          />

          <Input
            label="TikTok"
            value={form.tiktok}
            onChange={(v: string) =>
              handleChange(
                "tiktok",
                v
              )
            }
          />

          <Input
            label="X / Twitter"
            value={form.x}
            onChange={(v: string) =>
              handleChange("x", v)
            }
          />
        </div>
      </section>

      {/* ===================================== */}
      {/* SEO */}
      {/* ===================================== */}

      <section className="rounded-[2rem] border border-neutral-900 bg-black/40 backdrop-blur-xl overflow-hidden">
        <div className="border-b border-neutral-900 px-8 py-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Globe size={22} />
          </div>

          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tight">
              SEO
            </h2>

            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-bold">
              Metadata · Google ·
              Buscadores
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-8">
          <Input
            label="Meta Title"
            value={form.metaTitle}
            onChange={(v: string) =>
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
            onChange={(v: string) =>
              handleChange(
                "metaDescription",
                v
              )
            }
          />
        </div>
      </section>

      {/* ===================================== */}
      {/* SAVE */}
      {/* ===================================== */}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="h-14 px-8 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-[0.25em] text-xs hover:scale-[1.02] transition-all flex items-center gap-3 disabled:opacity-50"
        >
          <Save size={18} />

          {isPending
            ? "Guardando..."
            : "Guardar Configuración"}
        </button>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: any) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500 block mb-3">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full h-14 px-5 rounded-2xl bg-neutral-950 border border-neutral-800 text-sm font-bold outline-none focus:border-cyan-500 transition-all"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: any) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500 block mb-3">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        rows={5}
        className="w-full p-5 rounded-2xl bg-neutral-950 border border-neutral-800 text-sm font-bold outline-none focus:border-cyan-500 transition-all resize-none"
      />
    </div>
  );
}

function SwitchCard({
  title,
  checked,
  onChange,
}: any) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`
        h-32 rounded-[2rem] border transition-all p-6 text-left
        ${
          checked
            ? "bg-cyan-500/10 border-cyan-500/30"
            : "bg-neutral-950 border-neutral-800"
        }
      `}
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] font-black text-neutral-500">
            Estado
          </p>

          <h3 className="mt-2 text-xl font-black uppercase italic tracking-tight text-white">
            {title}
          </h3>
        </div>

        <div
          className={`
            w-14 h-8 rounded-full p-1 transition-all
            ${
              checked
                ? "bg-cyan-500"
                : "bg-neutral-700"
            }
          `}
        >
          <div
            className={`
              w-6 h-6 rounded-full bg-white transition-all
              ${
                checked
                  ? "translate-x-6"
                  : "translate-x-0"
              }
            `}
          />
        </div>
      </div>
    </button>
  );
}

function ImageUploader({
  label,
  value,
  onChange,
}: any) {
  const [uploading, setUploading] =
    useState(false);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    try {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onloadend = async () => {
        const base64 =
          reader.result as string;

        onChange(base64);

        setUploading(false);
      };
    } catch (error) {
      console.error(error);

      toast.error(
        "Error al subir imagen"
      );

      setUploading(false);
    }
  };

  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500 block mb-3">
        {label}
      </label>

      <div className="rounded-[2rem] border border-neutral-800 bg-neutral-950 overflow-hidden">
        <div className="aspect-video relative bg-black flex items-center justify-center">
          {value ? (
            <Image
              src={value}
              alt={label}
              fill
              className="object-cover"
            />
          ) : (
            <div className="text-center">
              <ImageIcon
                size={42}
                className="mx-auto text-neutral-700 mb-3"
              />

              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-600">
                Sin Imagen
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-neutral-900">
          <label className="h-12 rounded-2xl bg-cyan-500 text-black text-[10px] uppercase tracking-[0.3em] font-black flex items-center justify-center cursor-pointer hover:scale-[1.02] transition-all">
            {uploading
              ? "Procesando..."
              : "Subir Imagen"}

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleUpload}
            />
          </label>
        </div>
      </div>
    </div>
  );
}