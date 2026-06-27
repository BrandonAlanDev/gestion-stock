"use client";

import { ImageIcon, Save } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
    updateBrandingConfig,
    createBanner,
    deleteBanner,
} from "@/actions/page-config/branding.actions";
import ImageUploader from "./shared/ImageUploader";
import Input from "./shared/Input";
import Textarea from "./shared/Textarea";

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

export default function BrandingSection({
  config,primaryColor,secondaryColor
}: Props) {
  const [isPending, startTransition] =
    useTransition();

  const [form, setForm] = useState({
    storeName: "",
    slogan: "",
    description: "",
    logo: "",
    favicon: "",
    primaryColor: "#06b6d4",
    secondaryColor: "#ffffff",

    banners: [
        {
            id: 0,
            image: "",
            title: "",
            subtitle: "",
            text: "",
            url: "",
        },
        {
            id: 1,
            image: "",
            title: "",
            subtitle: "",
            text: "",
            url: "",
        },
        {
            id: 2,
            image: "",
            title: "",
            subtitle: "",
            text: "",
            url: "",
        },
        {
            id: 3,
            image: "",
            title: "",
            subtitle: "",
            text: "",
            url: "",
        },
    ],
});

  useEffect(() => {
    setForm({
      storeName:
        config?.storeName || "GestionOK",
      slogan:
        config?.slogan || "",

      description:
        config?.description || "",

      logo:
        config?.logo || "",

      banners:
        config?.banners || [
          {
            image: "",
            title: "",
            subtitle: "",
            text: "",
            url: "",
          },
          {
            image: "",
            title: "",
            subtitle: "",
            text: "",
            url: "",
          },
          {
            image: "",
            title: "",
            subtitle: "",
            text: "",
            url: "",
          },
          {
            image: "",
            title: "",
            subtitle: "",
            text: "",
            url: "",
          },
        ],

      favicon:
        config?.favicon || "",

      primaryColor:
        config?.primaryColor || "#06b6d4",

      secondaryColor:
        config?.secondaryColor || "#ffffff",
    });
  }, [config]);

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
    console.log("FORM", form);
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

    <section className="rounded-[2rem] border  overflow-hidden"
      style={{
        backgroundColor:secondaryColor || "black",
        color:getContrastColor(secondaryColor || "black"),
        borderColor:getContrastColor(secondaryColor || "black")
      }}
    >
      <div className="border-b border-neutral-900 px-8 py-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border flex items-center justify-center"
          style={{
            backgroundColor:primaryColor?.concat("33"),
            color:primaryColor || "black",
            borderColor:primaryColor || "black"
          }}
        >
          <ImageIcon size={22}/>
        </div>

        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tight">
            Branding
          </h2>

          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-bold"
          style={{ color: getContrastColor(secondaryColor || "black")}}
          >
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
          label="Favicon"
          value={form.favicon}
          onChange={(v) =>
            handleChange(
              "favicon",
              v
            )
          }
        />
        {form.banners.map((banner, index) => (
          <div key={index} className="space-y-4 rounded-xl border p-5">

              <div
                  style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 20,
                  }}
              >
                  <h3
                      style={{
                          fontWeight: 900,
                          color: getContrastColor(
                              form.secondaryColor
                          ),
                      }}
                  >
                      Banner {index + 1}
                  </h3>

                  <button
                      onClick={async () => {
                          if (
                              !confirm(
                                  "¿Estás seguro que deseas eliminar este banner?"
                              )
                          )
                              return;

                          if (!banner.id) return;

                          const res = await deleteBanner(
                              banner.id
                          );

                          if (!res.ok) {
                              toast.error(res.error);
                              return;
                          }

                          setForm(prev => ({
                              ...prev,
                              banners: prev.banners.filter(
                                  (_, i) => i !== index
                              ),
                          }));

                          toast.success(
                              "Banner eliminado"
                          );
                      }}
                      style={{
                          backgroundColor: "#dc2626",
                          color: "#fff",
                          border: `2px solid #dc2626`,
                          borderRadius: 14,
                          padding: "10px 18px",
                          fontWeight: 800,
                          cursor: "pointer",
                      }}
                  >
                      Eliminar
                  </button>
              </div>

              <ImageUploader
                  label="Imagen"
                  value={banner.image}
                  onChange={(v) => {
                      const copy = [...form.banners];
                      copy[index].image = v;
                      setForm({ ...form, banners: copy });
                  }}
              />

              <Input
                  label="Título"
                  value={banner.title}
                  onChange={(v) => {
                      const copy = [...form.banners];
                      copy[index].title = v;
                      setForm({ ...form, banners: copy });
                  }}
              />

              <Input
                  label="Subtítulo"
                  value={banner.subtitle}
                  onChange={(v) => {
                      const copy = [...form.banners];
                      copy[index].subtitle = v;
                      setForm({ ...form, banners: copy });
                  }}
              />

              <Textarea
                  label="Texto"
                  value={banner.text}
                  onChange={(v) => {
                      const copy = [...form.banners];
                      copy[index].text = v;
                      setForm({ ...form, banners: copy });
                  }}
              />

              <Input
                  label="URL"
                  value={banner.url}
                  onChange={(v) => {
                      const copy = [...form.banners];
                      copy[index].url = v;
                      setForm({ ...form, banners: copy });
                  }}
              />
          </div>
      ))}
      <div className="md:col-span-2 flex justify-center">
        <button
            onClick={() => {
                startTransition(async () => {
                    const res = await createBanner();
                    if (!res.ok) {
                      toast.error(res.error);
                      return;
                    }

                    if (!res.banner) return;

                    setForm(prev => ({
                      ...prev,
                      banners: [
                        ...prev.banners,
                        {
                          id: res.banner.id,
                          image: "",
                          title: "",
                          subtitle: "",
                          text: "",
                          url: "",
                        },
                      ],
                    }));

                    toast.success("Banner agregado");
                });
            }}
            className="h-14 px-8 rounded-2xl font-black uppercase tracking-[0.25em] hover:cursor-pointer transition"
            style={{
                backgroundColor: form.primaryColor,
                color: getContrastColor(form.primaryColor),
                border: `2px solid ${form.primaryColor}`,
            }}
        >
            + Agregar Banner
        </button>
    </div>
        <div>
          <label className="text-xs font-black uppercase tracking-[0.3em] mb-3 block">
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
          <label className="text-xs font-black uppercase tracking-[0.3em] mb-3 block">
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
          className="h-14 px-8 rounded-2xl font-black uppercase tracking-[0.25em] text-xs flex items-center gap-3 hover:cursor-pointer opacity-90 hover:opacity-100 transition"
          style={{
            backgroundColor: form.primaryColor,
            color: getContrastColor(
              form.primaryColor
            ),
          }}
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