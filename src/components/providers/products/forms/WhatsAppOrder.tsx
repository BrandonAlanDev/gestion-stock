"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { useBloqueoScroll } from "@/hooks/use-bloqueo-scroll";

const QUILLA_OPTIONS = ["Single", "Twin", "Tri (Thruster)", "Quad", "2+1", "5 quillas"];
const COLA_OPTIONS = ["Squash", "Round", "Pin", "Swallow", "Bat tail", "Moon tail"];
const MATERIAL_OPTIONS = ["Poliéster", "Epoxi"];

interface FormProps {
  item: ItemPedidoWhatsApp;
  onClose: () => void;
  onSave: (itemId: string | number, specs: FormState) => void;
}

interface ItemPedidoWhatsApp {
  id: string | number;
  name: string;
  specs?: Record<string, unknown>;
}

interface FormState {
  [campo: string]: string;
  largo: string;
  ancho: string;
  espesor: string;
  volumen: string;
  sistemaQuillas: string;
  tipoCola: string;
  material: string;
  colorDiseno: string;
  notasExtra: string;
}

export default function WhatsAppOrderForm({ item, onClose, onSave }: FormProps) {
  const { pageConfig } = usePageConfig();

  useBloqueoScroll(true);
  
  // Inicializamos el estado. Si item.specs existe, lo carga, si no, inicia vacío.
  const construirFormulario = (specs?: Record<string, unknown>): FormState => ({
    largo: typeof specs?.largo === "string" ? specs.largo : "",
    ancho: typeof specs?.ancho === "string" ? specs.ancho : "",
    espesor: typeof specs?.espesor === "string" ? specs.espesor : "",
    volumen: typeof specs?.volumen === "string" ? specs.volumen : "",
    sistemaQuillas: typeof specs?.sistemaQuillas === "string" ? specs.sistemaQuillas : "",
    tipoCola: typeof specs?.tipoCola === "string" ? specs.tipoCola : "",
    material: typeof specs?.material === "string" ? specs.material : "",
    colorDiseno: typeof specs?.colorDiseno === "string" ? specs.colorDiseno : "",
    notasExtra: typeof specs?.notasExtra === "string" ? specs.notasExtra : "",
  });

  const [form, setForm] = useState<FormState>(() => construirFormulario(item.specs));

  // Este useEffect asegura que si el item que llega cambia, el form se actualice.
  useEffect(() => {
    if (item.specs) {
      setForm(construirFormulario(item.specs));
    }
  }, [item.specs]);

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const inputCls = "w-full border border-[var(--color-secundario)] bg-[var(--color-fondo-sitio)]/5 rounded-lg px-3 py-3 text-sm text-[var(--texto-sobre-secundario)] placeholder:text-[var(--texto-sobre-secundario)]/40 focus:border-[var(--color-primario)] focus:bg-[var(--color-fondo-sitio)]/10 outline-none transition-all";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-[var(--color-secundario)] rounded-xl shadow-xl w-full max-w-xl max-h-[85vh] overflow-y-auto pointer-events-auto border border-[var(--color-fondo-sitio)]/10">
          <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--color-fondo-sitio)]/10 sticky top-0 bg-[var(--color-secundario)] z-10">
            <div>
              <h3 className="font-medium text-[var(--texto-sobre-secundario)] text-lg uppercase tracking-wider">{item.name}</h3>
              <p className="text-xs text-[var(--texto-sobre-secundario)] opacity-70 mt-1">Configurá las medidas de esta tabla</p>
            </div>
            <button onClick={onClose} className="text-[var(--texto-sobre-secundario)] opacity-60 hover:opacity-100"><X size={20} /></button>
          </div>

          <div className="p-8 space-y-8">
            {/* Dimensiones */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--texto-sobre-secundario)] mb-4">Dimensiones</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Largo", field: "largo", placeholder: '6\'2"' },
                  { label: "Ancho", field: "ancho", placeholder: '19 1/2"' },
                  { label: "Espesor", field: "espesor", placeholder: '2 3/8"' },
                  { label: "Volumen (L)", field: "volumen", placeholder: "32.5" },
                ].map(({ label, field, placeholder }) => (
                  <div key={field} className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--texto-sobre-secundario)] opacity-70">{label}</label>
                    <input
                      type="text"
                      value={form[field as keyof FormState]}
                      onChange={(e) => set(field as keyof FormState, e.target.value)}
                      placeholder={placeholder}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Opciones de quillas, cola y material */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--texto-sobre-secundario)] mb-3">Fin Setup</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {QUILLA_OPTIONS.map((opt) => (
                  <button key={opt} type="button" onClick={() => set("sistemaQuillas", form.sistemaQuillas === opt ? "" : opt)} className={`py-3 rounded-lg text-xs font-medium uppercase tracking-wider border transition-all ${form.sistemaQuillas === opt ? "border-[var(--color-primario)] bg-[var(--color-primario)] text-[var(--texto-sobre-primario)]" : "border-[var(--color-secundario)] text-[var(--texto-sobre-secundario)] opacity-70 hover:opacity-100"}`}>{opt}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--texto-sobre-secundario)] mb-3">Tail Options</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COLA_OPTIONS.map((opt) => (
                  <button key={opt} type="button" onClick={() => set("tipoCola", form.tipoCola === opt ? "" : opt)} className={`py-3 rounded-lg text-xs font-medium uppercase tracking-wider border transition-all ${form.tipoCola === opt ? "border-[var(--color-primario)] bg-[var(--color-primario)] text-[var(--texto-sobre-primario)]" : "border-[var(--color-secundario)] text-[var(--texto-sobre-secundario)] opacity-70 hover:opacity-100"}`}>{opt}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--texto-sobre-secundario)] mb-3">Material</p>
              <div className="grid grid-cols-2 gap-2">
                {MATERIAL_OPTIONS.map((opt) => (
                  <button key={opt} type="button" onClick={() => set("material", form.material === opt ? "" : opt)} className={`py-3 rounded-lg text-xs font-medium uppercase tracking-wider border transition-all ${form.material === opt ? "border-[var(--color-primario)] bg-[var(--color-primario)] text-[var(--texto-sobre-primario)]" : "border-[var(--color-secundario)] text-[var(--texto-sobre-secundario)] opacity-70 hover:opacity-100"}`}>{opt}</button>
                ))}
              </div>
            </div>

            <textarea
              value={form.notasExtra}
              onChange={(e) => set("notasExtra", e.target.value)}
              placeholder="Notas adicionales..."
              rows={2}
              className={`${inputCls} rounded-lg`}
            />
          </div>

          <div className="px-8 pb-8">
            <button
              onClick={() => { onSave(item.id, form); onClose(); }}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-primario)] text-[var(--texto-sobre-primario)] py-4 rounded-lg font-medium text-xs uppercase tracking-widest hover:opacity-90 transition-all"
            >
              <Check size={14} /> 
              {pageConfig?.cartEnabled ? "Guardar especificaciones" : "Consultar por WhatsApp"}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
