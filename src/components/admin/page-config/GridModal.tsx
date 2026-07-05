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
}

export default function GridModal({ isOpen, onClose, onSave, initialData, products, categories }: Props) {

  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      subtitle: "",
      image: "",
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
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black uppercase">Configurar Sección</h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        <div className="space-y-4">
          <input
            placeholder="Título"
            className="w-full p-4 border rounded-xl"

            value={formData.title || ""}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <input
            placeholder="Subtítulo"
            className="w-full p-4 border rounded-xl"

            value={formData.subtitle || ""}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          />
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
              <label className="flex-1 border-2 border-dashed rounded-xl p-4 flex items-center justify-center cursor-pointer hover:bg-neutral-50">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <span className="flex items-center gap-2 text-neutral-500">
                  <Upload size={20} /> Seleccionar archivo
                </span>
              </label>

              {formData.image && (
                <div className="relative inline-block">
                  <div className="w-16 h-16 overflow-hidden select-none rounded">
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

        <button
          onClick={() => onSave(formData)}
          className="mt-8 w-full py-4 bg-black text-white font-black rounded-xl hover:opacity-90 transition-opacity"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}