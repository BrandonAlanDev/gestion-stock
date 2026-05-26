"use client";

import { useState } from "react";
import { X, Phone, Mail, Truck, Trash2 } from "lucide-react";
import ProductModal from "./productModal";
import { deleteGarment } from "@/actions/garments";
import { toast } from "sonner";

/* ── Paleta ────────────────────────────────────────────────────────────
   #f0fafa  fondo suave (cyan muy claro)
   #e0f5f5  cyan claro (hero / modales)
   #4ab8b8  cyan acento principal
   #0d5c63  verde marino — detalles, iconos, bordes
   #083d42  verde marino oscuro — títulos
   #0d2b2e  texto principal
   #4a7c80  texto secundario
   #ffffff  blanco
──────────────────────────────────────────────────────────────────────── */

export default function QuickViewTable({ garments, categories, sizeTypes, providers, colors }: any) {
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);

  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = confirm(`¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`);
    if (confirmDelete) {
      const res = await deleteGarment(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Producto eliminado correctamente");
      }
    }
  };

  return (
    <>
      {/* ── TABLA ── */}
      <div
        className="overflow-x-auto rounded-[2.5rem] shadow-lg"
        style={{ border: "1px solid #b2dede", background: "#ffffff" }}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              className="text-[9px] uppercase font-black"
              style={{
                borderBottom: "1px solid #b2dede",
                color: "#4a7c80",
                letterSpacing: "0.3em",
              }}
            >
              <th className="px-8 py-6">Ref. SKU</th>
              <th className="px-8 py-6" style={{ color: "#083d42" }}>Producto</th>
              <th className="px-8 py-6">Talle / Variantes</th>
              <th className="px-8 py-6 text-right" style={{ color: "#0d5c63" }}>Precio Venta</th>
              <th className="px-8 py-6 text-right">Stock Total</th>
              <th className="px-8 py-6 text-right" style={{ color: "#4a7c80" }}>Precio Costo</th>
              <th className="px-8 py-6">Categoría</th>
              <th className="px-8 py-6">Proveedor</th>
              <th className="px-8 py-6 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {garments?.map((item: any) => {
              const totalStock = item.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0;
              return (
                <tr
                  key={item.id}
                  className="text-sm transition-all group"
                  style={{ borderBottom: "1px solid #e0f5f5" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0fafa")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {/* SKU */}
                  <td className="px-8 py-5 font-mono text-[10px]" style={{ color: "#4a7c80" }}>
                    {item.variants?.[0]?.sku || "---"}
                  </td>

                  {/* Nombre */}
                  <td className="px-8 py-5">
                    <div
                      className="font-bold uppercase tracking-tighter italic text-base leading-none"
                      style={{ color: "#083d42" }}
                    >
                      {item.name}
                    </div>
                  </td>

                  {/* Variantes */}
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-2">
                      {item.variants?.map((v: any) => (
                        <div
                          key={v.id}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                          style={{ background: "#e0f5f5", border: "1px solid #b2dede" }}
                        >
                          <span className="text-[9px] font-black uppercase" style={{ color: "#083d42" }}>
                            {v.size?.value || (v.attributes as any)?.customSize || "S/T"}
                          </span>
                          {v.color && (
                            <div
                              className="flex items-center gap-1 pl-1.5 ml-0.5"
                              style={{ borderLeft: "1px solid #b2dede" }}
                            >
                              <span className="text-[8px] font-bold uppercase tracking-tighter" style={{ color: "#4a7c80" }}>
                                {v.color.name}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Precio venta */}
                  <td className="px-8 py-5 text-right font-mono font-bold" style={{ color: "#0d5c63" }}>
                    ${Number(item.price).toLocaleString("es-AR")}
                  </td>

                  {/* Stock */}
                  <td className="px-8 py-5 text-right font-mono font-bold">
                    <span style={{ color: totalStock <= 0 ? "#e05050" : "#083d42" }}>
                      {totalStock}
                    </span>
                  </td>

                  {/* Precio costo */}
                  <td className="px-8 py-5 text-right font-mono font-bold" style={{ color: "#4a7c80" }}>
                    ${Number(item.cost || 0).toLocaleString("es-AR")}
                  </td>

                  {/* Categoría */}
                  <td className="px-8 py-5">
                    <span
                      className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                      style={{
                        background: "#e0f5f5",
                        border: "1px solid #b2dede",
                        color: "#0d5c63",
                      }}
                    >
                      {item.category?.name || "Gral"}
                    </span>
                  </td>

                  {/* Proveedor */}
                  <td className="px-8 py-5">
                    {item.supplier ? (
                      <button
                        onClick={() => setSelectedProvider(item.supplier)}
                        className="text-[11px] font-black uppercase italic tracking-tight transition-all hover:underline underline-offset-4"
                        style={{ color: "#4ab8b8" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#0d5c63")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#4ab8b8")}
                      >
                        {item.supplier.name}
                      </button>
                    ) : (
                      <span className="text-[10px] uppercase font-bold italic" style={{ color: "#b2dede" }}>
                        Sin Asignar
                      </span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-4">
                      <ProductModal
                        garment={item}
                        categories={categories}
                        sizes={sizeTypes}
                        providers={providers}
                        colors={colors || []}
                      />
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="transition-colors"
                        style={{ color: "#b2dede" }}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#e05050")}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#b2dede")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── MODAL PROVEEDOR ── */}
      {selectedProvider && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-4"
          style={{ background: "rgba(7,26,24,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative"
            style={{ background: "#ffffff", border: "1px solid #b2dede" }}
          >
            {/* Barra superior verde marino */}
            <div
              className="absolute top-0 left-0 w-full h-1 rounded-t-[2.5rem]"
              style={{ background: "#0d5c63" }}
            />

            {/* Botón cerrar */}
            <button
              onClick={() => setSelectedProvider(null)}
              className="absolute top-6 right-6 transition-colors"
              style={{ color: "#4a7c80" }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#083d42")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#4a7c80")}
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="mb-6">
              <Truck style={{ color: "#0d5c63", marginBottom: 8 }} size={20} />
              <h2
                className="text-2xl font-black italic uppercase tracking-tighter"
                style={{ color: "#083d42" }}
              >
                {selectedProvider.name}
              </h2>
            </div>

            {/* Detalles */}
            <div className="space-y-4">
              <div
                className="p-4 rounded-2xl text-[11px] font-bold italic uppercase"
                style={{
                  background: "#f0fafa",
                  border: "1px solid #b2dede",
                  color: "#4a7c80",
                }}
              >
                {selectedProvider.details || "Sin descripción disponible."}
              </div>

              <div className="grid gap-2">
                {selectedProvider.contacts?.map((c: any) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "#e0f5f5", border: "1px solid #b2dede" }}
                  >
                    <div style={{ color: "#0d5c63" }}>
                      {c.type === "EMAIL" ? <Mail size={14} /> : <Phone size={14} />}
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: "#083d42" }}>
                      {c.contact}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={() => setSelectedProvider(null)}
              className="w-full mt-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              style={{ background: "#f0fafa", border: "1px solid #b2dede", color: "#4a7c80" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "#e0f5f5";
                (e.currentTarget as HTMLButtonElement).style.color = "#083d42";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "#f0fafa";
                (e.currentTarget as HTMLButtonElement).style.color = "#4a7c80";
              }}
            >
              Cerrar Vista
            </button>
          </div>
        </div>
      )}
    </>
  );
}