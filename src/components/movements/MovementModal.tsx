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
        className="font-bold uppercase px-4 py-2 transition-all rounded-xl text-[10px] tracking-widest"
        style={{
          background: "#0d5c63",
          color: "#ffffff",
          border: "none",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#083d42")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#0d5c63")}
      >
        <History size={16} className="inline mr-1" /> Movimientos
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-4"
          style={{ background: "rgba(7,26,24,0.75)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            style={{ background: "#ffffff", border: "1px solid #b2dede" }}
          >
            {/* Barra superior según tipo */}
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ background: form.type === "IN" ? "#4ab8b8" : "#e05050" }}
            />

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-black italic uppercase tracking-tighter" style={{ color: "#083d42" }}>
                  Registro de Stock
                </h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{ color: "#4a7c80" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#083d42")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#4a7c80")}
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
                    background: form.type === "IN" ? "#e0f5f5" : "#f0fafa",
                    border: form.type === "IN" ? "1px solid #0d5c63" : "1px solid #b2dede",
                    color: form.type === "IN" ? "#0d5c63" : "#4a7c80",
                  }}
                >
                  <ArrowUpCircle size={14} /> Ingreso
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "OUT" })}
                  className="p-3 rounded-2xl border font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2"
                  style={{
                    background: form.type === "OUT" ? "#fce4e4" : "#f0fafa",
                    border: form.type === "OUT" ? "1px solid #e05050" : "1px solid #b2dede",
                    color: form.type === "OUT" ? "#e05050" : "#4a7c80",
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
                    style={{ color: "#4a7c80" }}
                  >
                    Producto / Talle
                  </label>
                  <select
                    className="w-full rounded-xl p-3 text-xs outline-none appearance-none cursor-pointer"
                    style={{
                      background: "#f0fafa",
                      border: "1px solid #b2dede",
                      color: "#0d2b2e",
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
                      style={{ color: "#4a7c80" }}
                    >
                      Unidades
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full rounded-xl p-3 text-sm outline-none"
                      style={{
                        background: "#f0fafa",
                        border: "1px solid #b2dede",
                        color: "#0d2b2e",
                      }}
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  {/* PRECIO */}
                  <div className="space-y-1">
                    <label
                      className="text-[10px] font-black uppercase px-1"
                      style={{ color: "#4a7c80" }}
                    >
                      Precio Unit.
                    </label>
                    <div className="relative">
                      <DollarSign
                        size={14}
                        className="absolute left-3 top-3.5"
                        style={{ color: "#4a7c80" }}
                      />
                      <input
                        type="number"
                        step="0.01"
                        className="w-full rounded-xl p-3 pl-8 text-sm outline-none"
                        style={{
                          background: "#f0fafa",
                          border: "1px solid #b2dede",
                          color: "#0d2b2e",
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
                    style={{ color: "#4a7c80" }}
                  >
                    Nota / Motivo
                  </label>
                  <input
                    placeholder="Ej: Venta, Ajuste de inventario..."
                    className="w-full rounded-xl p-3 text-sm outline-none"
                    style={{
                      background: "#f0fafa",
                      border: "1px solid #b2dede",
                      color: "#0d2b2e",
                    }}
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </div>
              </div>

              {/* RESUMEN VISUAL */}
              {form.variantId && (
                <div
                  className="p-4 rounded-2xl flex items-center gap-3"
                  style={{ background: "#e0f5f5", border: "1px solid #b2dede" }}
                >
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: "#0d5c63", color: "#ffffff" }}
                  >
                    <Info size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase leading-none" style={{ color: "#4a7c80" }}>
                      Total Operación
                    </p>
                    <p className="font-mono font-bold text-lg" style={{ color: "#083d42" }}>
                      ${(form.quantity * form.priceAtTime).toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !form.variantId}
                className="w-full h-12 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                style={{
                  background: loading
                    ? "#b2dede"
                    : form.type === "IN"
                    ? "#0d5c63"
                    : "#e05050",
                  color: "#ffffff",
                  cursor: loading || !form.variantId ? "not-allowed" : "pointer",
                  opacity: loading || !form.variantId ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading && form.variantId) {
                    e.currentTarget.style.background =
                      form.type === "IN" ? "#083d42" : "#c04040";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && form.variantId) {
                    e.currentTarget.style.background =
                      form.type === "IN" ? "#0d5c63" : "#e05050";
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