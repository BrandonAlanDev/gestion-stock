"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function GridModal({ isOpen, onClose, onSave, initialData }: any) {
  const [formData, setFormData] = useState(initialData || { title: "", subtitle: "", url: "", image: "" });

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
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          <input 
            placeholder="Subtítulo" 
            className="w-full p-4 border rounded-xl"
            value={formData.subtitle}
            onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
          />
          <input 
            placeholder="URL (Link)" 
            className="w-full p-4 border rounded-xl"
            value={formData.url}
            onChange={(e) => setFormData({...formData, url: e.target.value})}
          />
          <input 
            placeholder="URL de Imagen" 
            className="w-full p-4 border rounded-xl"
            value={formData.image}
            onChange={(e) => setFormData({...formData, image: e.target.value})}
          />
        </div>

        <button 
          onClick={() => onSave(formData)}
          className="mt-8 w-full py-4 bg-black text-white font-black rounded-xl"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}