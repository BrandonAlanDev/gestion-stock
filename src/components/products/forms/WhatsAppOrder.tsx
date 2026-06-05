// components/product/WhatsAppOrderForm.tsx
"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WS_NUMBER = "2235644043";
const QUILLA_OPTIONS = ["Single", "Twin", "Tri (Thruster)", "Quad", "2+1", "5 quillas"];
const COLA_OPTIONS = ["Squash", "Round", "Pin", "Swallow", "Bat tail", "Moon tail"];
const MATERIAL_OPTIONS = ["Poliéster", "Epoxi"];

interface FormProps {
  product: any;
  onClose: () => void;
}

export default function WhatsAppOrderForm({ product, onClose }: FormProps) {
  const [form, setForm] = useState({
    largo: "", ancho: "", espesor: "", volumen: "",
    sistemaQuillas: "", tipoCola: "", material: "", colorDiseno: "", notasExtra: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSend = () => {
    const lines = [
      `🏄 *Pedido personalizado — NewSurfBoard*`,
      ``,
      `*Producto:* ${product.name}`,
      `*Precio base:* $${Number(product.price).toLocaleString("es-AR")}`,
      ``,
      `📐 *Medidas*`,
      form.largo    ? `• Largo: ${form.largo}`          : null,
      form.ancho    ? `• Ancho: ${form.ancho}`          : null,
      form.espesor  ? `• Espesor: ${form.espesor}`      : null,
      form.volumen  ? `• Volumen: ${form.volumen} L`     : null,
      ``,
      form.sistemaQuillas ? `🔩 *Sistema de quillas:* ${form.sistemaQuillas}` : null,
      form.tipoCola       ? `🔻 *Tipo de cola:* ${form.tipoCola}`             : null,
      form.material       ? `🧪 *Material / Resina:* ${form.material}`        : null,
      form.colorDiseno    ? `🎨 *Color / Diseño:* ${form.colorDiseno}`        : null,
      form.notasExtra     ? `📝 *Notes:* ${form.notasExtra}`                  : null,
      ``,
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/${WS_NUMBER}?text=${encodeURIComponent(lines)}`, "_blank");
    onClose();
  };

  const inputCls = "w-full border border-gray-200 bg-gray-50/50 rounded-lg px-3 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:border-black focus:bg-white outline-none transition-all";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[85vh] overflow-y-auto pointer-events-auto border border-gray-100">
          
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div>
              <h3 className="font-medium text-gray-900 text-lg uppercase tracking-wider">Custom Order</h3>
              <p className="text-xs text-gray-400 mt-1">Configurá las especificaciones de tu tabla</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* Medidas */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-black mb-4">Dimensiones sugeridas</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Largo", field: "largo", placeholder: '6\'2"' },
                  { label: "Ancho", field: "ancho", placeholder: '19 1/2"' },
                  { label: "Espesor", field: "espesor", placeholder: '2 3/8"' },
                  { label: "Volumen (L)", field: "volumen", placeholder: "32.5" },
                ].map(({ label, field, placeholder }) => (
                  <div key={field} className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">{label}</label>
                    <input
                      type="text"
                      value={form[field as keyof typeof form]}
                      onChange={(e) => set(field, e.target.value)}
                      placeholder={placeholder}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Quillas */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-black mb-3">Fin Setup</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {QUILLA_OPTIONS.map((opt) => (
                  <button
                    key={opt} type="button"
                    onClick={() => set("sistemaQuillas", form.sistemaQuillas === opt ? "" : opt)}
                    className={`py-3 rounded-lg text-xs font-medium uppercase tracking-wider border transition-all ${
                      form.sistemaQuillas === opt ? "border-black bg-black text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >{opt}</button>
                ))}
              </div>
            </div>

            {/* Cola */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-black mb-3">Tail Options</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COLA_OPTIONS.map((opt) => (
                  <button
                    key={opt} type="button"
                    onClick={() => set("tipoCola", form.tipoCola === opt ? "" : opt)}
                    className={`py-3 rounded-lg text-xs font-medium uppercase tracking-wider border transition-all ${
                      form.tipoCola === opt ? "border-black bg-black text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >{opt}</button>
                ))}
              </div>
            </div>

            {/* Material */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest  text-black mb-3">Material</p>
              <div className="grid grid-cols-2 gap-2">
                {MATERIAL_OPTIONS.map((opt) => (
                  <button
                    key={opt} type="button"
                    onClick={() => set("material", form.material === opt ? "" : opt)}
                    className={`py-3 rounded-lg text-xs font-medium uppercase tracking-wider border transition-all ${
                      form.material === opt ? "border-black bg-black text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >{opt}</button>
                ))}
              </div>
            </div>

            {/* Artwork */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-black mb-3">Diseño / Color</p>
              <textarea
                value={form.colorDiseno}
                onChange={(e) => set("colorDiseno", e.target.value)}
                placeholder="Resina teñida, opaca, detalles especiales..."
                rows={2}
                className={`${inputCls} resize-none rounded-lg`}
              />
            </div>

            {/* Notas */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-black mb-3">Notas adicionales</p>
              <textarea
                value={form.notasExtra}
                onChange={(e) => set("notasExtra", e.target.value)}
                placeholder="Tu peso, nivel de surf o requerimientos específicos..."
                rows={2}
                className={`${inputCls} resize-none rounded-lg`}
              />
            </div>
          </div>

          <div className="px-8 pb-8">
            <button
              onClick={handleSend}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-4 rounded-lg font-medium text-xs uppercase tracking-widest transition-colors"
            >
              <Send size={14} />
              Enviar especificaciones por WhatsApp
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}