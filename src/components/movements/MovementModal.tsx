"use client";

import { useState } from "react";
import { createMovement } from "@/actions/movimientos/crear-movimiento";
import { toast } from "sonner";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { History, X, ArrowUpCircle, ArrowDownCircle, DollarSign, Info, ChevronDown } from "lucide-react";
import { obtenerTallaPersonalizada } from "@/lib/utilidades/obtener-talla-personalizada";
import { nombreCombinacion } from "@/lib/productos/nombre-combinacion";

interface Props {
  garments: ProductoMovimiento[];
  onSuccess?: () => void;
}

interface VarianteMovimiento {
  id: string;
  stock: number;
  size?: { value?: string | null } | null;
  attributes?: unknown;
  optionValues?: Array<{ optionValue: { value: string; option: { name: string } } }>;
}

interface ProductoMovimiento {
  name: string;
  price: string | number | { toString(): string };
  variants: VarianteMovimiento[];
}

// --- UTILIDAD PARA CALCULAR EL CONTRASTE ---
function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function MovementModal({ garments, onSuccess }: Props) {
  const pageConfig = usePageConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    variantId: "",
    type: "IN" as "IN" | "OUT",
    quantity: 1,
    priceAtTime: 0,
    note: "",
  });

  // Variables dinámicas de color
  const primaryColor = pageConfig?.pageConfig?.primaryColor || "#000000";
  const secondaryColor = pageConfig?.pageConfig?.secondaryColor || "#FFFFFF";

  // Cálculos de legibilidad y contraste
  const textColor = getContrastColor(secondaryColor);
  const primaryTextColor = getContrastColor(primaryColor);
  const isDarkBg = textColor === "#ffffff";

  // Diseños de componentes basados en opacidad y contrastes dinámicos
  const overlayBorder = isDarkBg ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)";
  const inputBg = isDarkBg ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.02)";
  const backdropBg = isDarkBg ? "rgba(0, 0, 0, 0.7)" : "rgba(15, 23, 42, 0.5)";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.variantId) return toast.error("Seleccioná un producto");
    if (form.quantity <= 0) return toast.error("La cantidad debe ser mayor a 0");

    setLoading(true);
    const res = await createMovement(form);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Movimiento registrado con éxito");
      onSuccess?.(); 
      setIsOpen(false);
      setForm({ variantId: "", type: "IN", quantity: 1, priceAtTime: 0, note: "" });
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="font-bold uppercase px-4 py-2 transition-all rounded-xl text-[10px] tracking-widest shadow-md cursor-pointer"
        style={{
          backgroundColor: primaryColor,
          color: primaryTextColor,
          border: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.9)")}
        onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
      >
        <History size={16} className="inline mr-1" /> Movimientos
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-4"
          style={{ backgroundColor: backdropBg, backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-md rounded-[2rem] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{ backgroundColor: secondaryColor, border: `1px solid ${overlayBorder}` }}
          >
            {/* Barra superior dinámica según tipo */}
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: form.type === "IN" ? primaryColor : "#ef4444" }}
            />

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-black italic uppercase tracking-tighter" style={{ color: textColor }}>
                  Registro de Stock
                </h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
                  style={{ color: textColor }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* SELECTOR DE TIPO */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "IN" })}
                  className="p-3 rounded-2xl border font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    backgroundColor: form.type === "IN" ? "rgba(255, 255, 255, 0.08)" : inputBg,
                    borderColor: form.type === "IN" ? primaryColor : overlayBorder,
                    color: form.type === "IN" ? primaryColor : textColor,
                    opacity: form.type === "IN" ? 1 : 0.5,
                  }}
                >
                  <ArrowUpCircle size={14} /> Ingreso
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "OUT" })}
                  className="p-3 rounded-2xl border font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    backgroundColor: form.type === "OUT" ? "rgba(239, 68, 68, 0.08)" : inputBg,
                    borderColor: form.type === "OUT" ? "#ef4444" : overlayBorder,
                    color: form.type === "OUT" ? "#ef4444" : textColor,
                    opacity: form.type === "OUT" ? 1 : 0.5,
                  }}
                >
                  <ArrowDownCircle size={14} /> Egreso
                </button>
              </div>

              <div className="space-y-4">
                {/* SELECTOR DE PRODUCTO Y VARIANTE */}
                <div className="space-y-1">
                  <label
                    className="text-[10px] font-black uppercase px-1 opacity-50"
                    style={{ color: textColor }}
                  >
                    Producto / Talle
                  </label>
                  <div className="relative">
                    <select
                      className="w-full rounded-xl p-3 pr-8 text-xs border outline-none appearance-none cursor-pointer"
                      style={{
                        backgroundColor: inputBg,
                        borderColor: overlayBorder,
                        color: textColor,
                      }}
                      value={form.variantId}
                      onChange={(e) => {
                        const vId = e.target.value;
                        const parent = garments.find((g) =>
                          g.variants.some((v) => v.id === vId)
                        );
                        setForm({
                          ...form,
                          variantId: vId,
                          priceAtTime: parent ? Number(parent.price) : 0,
                        });
                      }}
                    >
                      <option value="" style={{ backgroundColor: secondaryColor }}>Seleccionar...</option>
                      {garments.map((g) =>
                        g.variants.map((v) => (
                          <option key={v.id} value={v.id} style={{ backgroundColor: secondaryColor }}>
                            {g.name} - {nombreCombinacion(v.optionValues) || v.size?.value || obtenerTallaPersonalizada(v.attributes) || "S/T"} (Stock: {v.stock})
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
                      style={{ color: textColor }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* CANTIDAD */}
                  <div className="space-y-1">
                    <label
                      className="text-[10px] font-black uppercase px-1 opacity-50"
                      style={{ color: textColor }}
                    >
                      Unidades
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full rounded-xl p-3 text-sm border outline-none"
                      style={{
                        backgroundColor: inputBg,
                        borderColor: overlayBorder,
                        color: textColor,
                      }}
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  {/* PRECIO */}
                  <div className="space-y-1">
                    <label
                      className="text-[10px] font-black uppercase px-1 opacity-50"
                      style={{ color: textColor }}
                    >
                      Precio Unit.
                    </label>
                    <div className="relative">
                      <DollarSign
                        size={14}
                        className="absolute left-3 top-3.5 opacity-40"
                        style={{ color: textColor }}
                      />
                      <input
                        type="number"
                        step="0.01"
                        className="w-full rounded-xl p-3 pl-8 text-sm border outline-none font-mono"
                        style={{
                          backgroundColor: inputBg,
                          borderColor: overlayBorder,
                          color: textColor,
                        }}
                        value={form.priceAtTime}
                        onChange={(e) => setForm({ ...form, priceAtTime: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>

                {/* NOTA */}
                <div className="space-y-1">
                  <label
                    className="text-[10px] font-black uppercase px-1 opacity-50"
                    style={{ color: textColor }}
                  >
                    Nota / Motivo
                  </label>
                  <input
                    placeholder="Ej: Venta, Ajuste de inventario..."
                    className="w-full rounded-xl p-3 text-sm border outline-none"
                    style={{
                      backgroundColor: inputBg,
                      borderColor: overlayBorder,
                      color: textColor,
                    }}
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </div>
              </div>

              {/* RESUMEN VISUAL */}
              {form.variantId && (
                <div
                  className="p-4 rounded-2xl flex items-center gap-3 border animate-in fade-in slide-in-from-top-2 duration-200"
                  style={{ backgroundColor: inputBg, borderColor: overlayBorder }}
                >
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                  >
                    <Info size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase leading-none opacity-50" style={{ color: textColor }}>
                      Total Operación
                    </p>
                    <p className="font-mono font-bold text-lg mt-1" style={{ color: form.type === "IN" ? primaryColor : "#ef4444" }}>
                      ${(form.quantity * form.priceAtTime).toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !form.variantId}
                className="w-full h-12 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-sm cursor-pointer"
                style={{
                  backgroundColor: loading
                    ? overlayBorder
                    : !form.variantId
                    ? overlayBorder
                    : form.type === "IN"
                    ? primaryColor
                    : "#ef4444",
                  color: loading || !form.variantId ? textColor : form.type === "IN" ? primaryTextColor : "#ffffff",
                  opacity: loading || !form.variantId ? 0.4 : 1,
                  border: "none"
                }}
                onMouseEnter={(e) => {
                  if (!loading && form.variantId) {
                    e.currentTarget.style.filter = "brightness(0.9)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && form.variantId) {
                    e.currentTarget.style.filter = "none";
                  }
                }}
              >
                {loading ? "Procesando..." : `Confirmar ${form.type === "IN" ? "Ingreso" : "Egreso"}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
