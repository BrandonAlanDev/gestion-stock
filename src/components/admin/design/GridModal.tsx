"use client";

import { X, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { Destination, SelectItem } from "@/components/admin/destination-picker/types";
import DestinationPicker from "@/components/admin/destination-picker/DestinationPicker";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: any;
  products: SelectItem[];
  categories: SelectItem[];
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

export default function GridModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  products, 
  categories,
  primaryColor = "#06b6d4",
  secondaryColor = "#ffffff"
}: Props) {

  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      subtitle: "",
      image: "",
      order: 0,
      subtitleNeon: false,
      subtitleDim: false,
      linkStyle: "IMAGE",
      buttonVariant: "DEFAULT",
      buttonText: "",
      buttonBgColor: "",
      buttonTextColor: "",
      destination: {
        type: "none",
        value: "",
      },
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: "",
        subtitle: "",
        image: "",
        order: 0,
        subtitleNeon: false,
        subtitleDim: false,
        linkStyle: "IMAGE",
        buttonVariant: "DEFAULT",
        buttonText: "",
        buttonBgColor: "",
        buttonTextColor: "",
        destination: { type: "none", value: "" },
      });
    }
  }, [initialData, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div 
        className="w-full max-w-lg rounded-3xl shadow-2xl border flex flex-col"
        style={{
          backgroundColor: secondaryColor,
          color: getContrastColor(secondaryColor),
          borderColor: getContrastColor(secondaryColor).concat("22")
        }}
      >
        <div className="flex justify-between items-center p-8 pb-0">
          <h3 className="text-lg font-black uppercase">Configurar Sección</h3>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 pt-4 max-h-[60vh] md:max-h-[50vh] overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
          <input
            placeholder="Título"
            className="w-full p-4 border rounded-xl bg-transparent"
            style={{ borderColor: getContrastColor(secondaryColor).concat("44") }}
            value={formData.title || ""}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <input
            placeholder="Subtítulo"
            className="w-full p-4 border rounded-xl bg-transparent"
            style={{ borderColor: getContrastColor(secondaryColor).concat("44") }}
            value={formData.subtitle || ""}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          />
          
          {/* Efecto neón en subtítulo */}
          <div className="flex items-center justify-between p-4 border rounded-xl" style={{ borderColor: getContrastColor(secondaryColor).concat("22") }}>
            <label className="font-bold text-sm">Subtítulo con efecto neón</label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, subtitleNeon: !formData.subtitleNeon })}
              className="w-12 h-6 rounded-full transition-colors relative"
              style={{
                backgroundColor: formData.subtitleNeon ? primaryColor : getContrastColor(secondaryColor).concat("33"),
              }}
            >
              <div
                className="w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-sm"
                style={{ left: formData.subtitleNeon ? "calc(100% - 20px)" : "4px" }}
              />
            </button>
          </div>

          {/* Subtítulo opaco/gris */}
          <div className="flex items-center justify-between p-4 border rounded-xl" style={{ borderColor: getContrastColor(secondaryColor).concat("22") }}>
            <label className="font-bold text-sm">Subtítulo opaco (gris)</label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, subtitleDim: !formData.subtitleDim })}
              className="w-12 h-6 rounded-full transition-colors relative"
              style={{
                backgroundColor: formData.subtitleDim ? primaryColor : getContrastColor(secondaryColor).concat("33"),
              }}
            >
              <div
                className="w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-sm"
                style={{ left: formData.subtitleDim ? "calc(100% - 20px)" : "4px" }}
              />
            </button>
          </div>

          {/* Tipo de enlace */}
          <div>
            <label className="text-xs font-black uppercase tracking-[0.2em] mb-2 block" style={{ color: getContrastColor(secondaryColor) + "aa" }}>
              Click en
            </label>
            <div className="flex gap-2">
              {[
                { value: "IMAGE", label: "Imagen" },
                { value: "BUTTON", label: "Botón" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, linkStyle: opt.value })}
                  className="flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all"
                  style={{
                    borderColor: formData.linkStyle === opt.value ? primaryColor : getContrastColor(secondaryColor).concat("22"),
                    backgroundColor: formData.linkStyle === opt.value ? primaryColor.concat("15") : "transparent",
                    color: formData.linkStyle === opt.value ? primaryColor : getContrastColor(secondaryColor),
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Variante de botón (solo visible si linkStyle === BUTTON) */}
          {formData.linkStyle === "BUTTON" && (
            <div>
              <label className="text-xs font-black uppercase tracking-[0.2em] mb-2 block" style={{ color: getContrastColor(secondaryColor) + "aa" }}>
                Estilo del botón
              </label>
              <div className="flex gap-2">
                {[
                  { value: "DEFAULT", label: "Predeterminado" },
                  { value: "STRAIGHT", label: "Recto" },
                  { value: "TRANSPARENT", label: "Transparente" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, buttonVariant: opt.value })}
                    className="flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all"
                    style={{
                      borderColor: formData.buttonVariant === opt.value ? primaryColor : getContrastColor(secondaryColor).concat("22"),
                      backgroundColor: formData.buttonVariant === opt.value ? primaryColor.concat("15") : "transparent",
                      color: formData.buttonVariant === opt.value ? primaryColor : getContrastColor(secondaryColor),
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Texto del botón */}
              <input
                placeholder="Texto del botón (ej: Ver más)"
                className="w-full p-4 border rounded-xl bg-transparent mt-4"
                style={{ borderColor: getContrastColor(secondaryColor).concat("44") }}
                value={formData.buttonText || ""}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
              />

              {/* Color de fondo del botón */}
              <div className="mt-4">
                <label className="text-xs font-black uppercase tracking-[0.2em] mb-2 block" style={{ color: getContrastColor(secondaryColor) + "aa" }}>
                  Color de fondo del botón
                </label>
                <input
                  type="color"
                  value={formData.buttonBgColor || "#000000"}
                  onChange={(e) => setFormData({ ...formData, buttonBgColor: e.target.value })}
                  className="w-full h-14 rounded-2xl cursor-pointer"
                />
              </div>

              {/* Color del texto del botón */}
              <div className="mt-4">
                <label className="text-xs font-black uppercase tracking-[0.2em] mb-2 block" style={{ color: getContrastColor(secondaryColor) + "aa" }}>
                  Color del texto del botón
                </label>
                <input
                  type="color"
                  value={formData.buttonTextColor || "#ffffff"}
                  onChange={(e) => setFormData({ ...formData, buttonTextColor: e.target.value })}
                  className="w-full h-14 rounded-2xl cursor-pointer"
                />
              </div>
            </div>
          )}

          <DestinationPicker
            value={formData.destination}
            products={products}
            categories={categories}
            onChange={(destination: Destination) =>
              setFormData({
                ...formData,
                destination,
              })
            }
          />

          <div className="mt-4">
            <label className="block text-sm font-bold mb-2">Imagen de la sección</label>
            <div className="flex items-center gap-4">
              <label 
                className="flex-1 border-2 border-dashed rounded-xl p-4 flex items-center justify-center cursor-pointer transition-colors"
                style={{ 
                  borderColor: getContrastColor(secondaryColor).concat("44"),
                  backgroundColor: getContrastColor(secondaryColor).concat("05")
                }}
              >
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <span className="flex items-center gap-2 opacity-80">
                  <Upload size={20} /> Seleccionar archivo
                </span>
              </label>

              {formData.image && (
                <div className="relative inline-block">
                  <div className="w-16 h-16 overflow-hidden select-none rounded border" style={{ borderColor: getContrastColor(secondaryColor).concat("22") }}>
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: "" })}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors shadow-md border border-white"
                    title="Quitar imagen"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 pt-0">
        <button
          onClick={() => onSave(formData)}
          className="w-full py-4 font-black rounded-xl hover:opacity-90 transition-opacity uppercase tracking-wider"
          style={{
            backgroundColor: primaryColor,
            color: getContrastColor(primaryColor)
          }}
        >
          Guardar Cambios
        </button>
      </div>
    </div>
    </div>
  );
}
