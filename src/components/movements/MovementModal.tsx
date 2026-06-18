"use client";

import { useState } from "react";
import { createMovement } from "@/actions/movements";
import { toast } from "sonner";
import { History, X, ArrowUpCircle, ArrowDownCircle, DollarSign, Info } from "lucide-react";

interface Props {
  garments: any[];
  onSuccess?: () => void;
}

export default function MovementModal({ garments, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    variantId: "",
    type: "IN" as "IN" | "OUT",
    quantity: 1,
    priceAtTime: 0,
    note: "",
  });

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
      onSuccess?.(); // Invalidar caché de productos
      setIsOpen(false);
      setForm({ variantId: "", type: "IN", quantity: 1, priceAtTime: 0, note: "" });
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="font-bold uppercase px-4 py-2 transition-all rounded-xl text-[10px] tracking-widest shadow-md shadow-cyan-500/10"
        style={{
          background: "#06b6d4",
          color: "#ffffff",
          border: "none",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#0891b2")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#06b6d4")}
      >
        <History size={16} className="inline mr-1" /> Movimientos
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-4"
          style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-md rounded-[2rem] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
          >
            {/* Barra superior dinámica según tipo */}
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ background: form.type === "IN" ? "#06b6d4" : "#ef4444" }}
            />

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-black italic uppercase tracking-tighter" style={{ color: "#0f172a" }}>
                  Registro de Stock
                </h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{ color: "#94a3b8", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172a")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                >
                  <X size={20} />
                </button>
              </div>

              {/* SELECTOR DE TIPO */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "IN" })}
                  className="p-3 rounded-2xl border font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2"
                  style={{
                    background: form.type === "IN" ? "rgba(6, 182, 212, 0.08)" : "#f8fafc",
                    borderColor: form.type === "IN" ? "#06b6d4" : "#e2e8f0",
                    color: form.type === "IN" ? "#0891b2" : "#64748b",
                  }}
                >
                  <ArrowUpCircle size={14} /> Ingreso
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "OUT" })}
                  className="p-3 rounded-2xl border font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2"
                  style={{
                    background: form.type === "OUT" ? "rgba(239, 68, 68, 0.08)" : "#f8fafc",
                    borderColor: form.type === "OUT" ? "#ef4444" : "#e2e8f0",
                    color: form.type === "OUT" ? "#b91c1c" : "#64748b",
                  }}
                >
                  <ArrowDownCircle size={14} /> Egreso
                </button>
              </div>

              <div className="space-y-4">
                {/* SELECTOR DE PRODUCTO Y VARIANTE */}
                <div className="space-y-1">
                  <label
                    className="text-[10px] font-black uppercase px-1"
                    style={{ color: "#64748b" }}
                  >
                    Producto / Talle
                  </label>
                  <select
                    className="w-full rounded-xl p-3 text-xs border outline-none appearance-none cursor-pointer"
                    style={{
                      background: "#f8fafc",
                      borderColor: "#e2e8f0",
                      color: "#0f172a",
                    }}
                    value={form.variantId}
                    onChange={(e) => {
                      const vId = e.target.value;
                      const parent = garments.find((g) =>
                        g.variants.some((v: any) => v.id === vId)
                      );
                      setForm({
                        ...form,
                        variantId: vId,
                        priceAtTime: parent ? Number(parent.price) : 0,
                      });
                    }}
                  >
                    <option value="">Seleccionar...</option>
                    {garments.map((g) =>
                      g.variants.map((v: any) => (
                        <option key={v.id} value={v.id}>
                          {g.name} - {v.size?.value || (v.attributes as any)?.customSize || "S/T"} (Stock: {v.stock})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* CANTIDAD */}
                  <div className="space-y-1">
                    <label
                      className="text-[10px] font-black uppercase px-1"
                      style={{ color: "#64748b" }}
                    >
                      Unidades
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full rounded-xl p-3 text-sm border outline-none"
                      style={{
                        background: "#f8fafc",
                        borderColor: "#e2e8f0",
                        color: "#0f172a",
                      }}
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  {/* PRECIO */}
                  <div className="space-y-1">
                    <label
                      className="text-[10px] font-black uppercase px-1"
                      style={{ color: "#64748b" }}
                    >
                      Precio Unit.
                    </label>
                    <div className="relative">
                      <DollarSign
                        size={14}
                        className="absolute left-3 top-3.5"
                        style={{ color: "#94a3b8" }}
                      />
                      <input
                        type="number"
                        step="0.01"
                        className="w-full rounded-xl p-3 pl-8 text-sm border outline-none font-mono"
                        style={{
                          background: "#f8fafc",
                          borderColor: "#e2e8f0",
                          color: "#0f172a",
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
                    className="text-[10px] font-black uppercase px-1"
                    style={{ color: "#64748b" }}
                  >
                    Nota / Motivo
                  </label>
                  <input
                    placeholder="Ej: Venta, Ajuste de inventario..."
                    className="w-full rounded-xl p-3 text-sm border outline-none"
                    style={{
                      background: "#f8fafc",
                      borderColor: "#e2e8f0",
                      color: "#0f172a",
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
                  style={{ background: "rgba(6, 182, 212, 0.04)", borderColor: "#c2f3f8" }}
                >
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: "#06b6d4", color: "#ffffff" }}
                  >
                    <Info size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase leading-none" style={{ color: "#64748b" }}>
                      Total Operación
                    </p>
                    <p className="font-mono font-bold text-lg" style={{ color: "#0891b2" }}>
                      ${(form.quantity * form.priceAtTime).toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !form.variantId}
                className="w-full h-12 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-sm"
                style={{
                  background: loading
                    ? "#cbd5e1"
                    : form.type === "IN"
                    ? "#06b6d4"
                    : "#ef4444",
                  color: "#ffffff",
                  cursor: loading || !form.variantId ? "not-allowed" : "pointer",
                  opacity: loading || !form.variantId ? 0.6 : 1,
                  border: "none"
                }}
                onMouseEnter={(e) => {
                  if (!loading && form.variantId) {
                    e.currentTarget.style.background =
                      form.type === "IN" ? "#0891b2" : "#dc2626";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && form.variantId) {
                    e.currentTarget.style.background =
                      form.type === "IN" ? "#06b6d4" : "#ef4444";
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