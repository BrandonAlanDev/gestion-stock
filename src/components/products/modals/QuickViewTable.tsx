"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import ProductModal from "./ProductModal";
import ProviderModal from "./ProviderModal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { deleteGarment } from "@/actions/garments";
import { toast } from "sonner";

export default function QuickViewTable({ garments, categories, sizeTypes, providers, colors }: any) {
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await deleteGarment(deleteTarget.id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Producto eliminado correctamente");
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <>
      {/* ── TABLA ── */}
      <div
        className="overflow-x-auto rounded-[2rem] shadow-sm border"
        style={{ borderColor: "#e2e8f0", background: "#ffffff" }}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              className="text-[9px] uppercase font-black border-b"
              style={{
                borderColor: "#e2e8f0",
                color: "#64748b",
                letterSpacing: "0.3em",
              }}
            >
              <th className="px-8 py-6">Ref. SKU</th>
              <th className="px-8 py-6" style={{ color: "#0f172a" }}>Producto</th>
              <th className="px-8 py-6">Talle / Variantes</th>
              <th className="px-8 py-6 text-right" style={{ color: "#0891b2" }}>Precio Venta</th>
              <th className="px-8 py-6 text-right" style={{ color: "#0891b2" }}>Precio Máximo</th>
              <th className="px-8 py-6 text-right">Stock Total</th>
              <th className="px-8 py-6 text-right" style={{ color: "#64748b" }}>Precio Costo</th>
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
                  className="text-sm transition-all group border-b"
                  style={{ borderColor: "#f1f5f9" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(6, 182, 212, 0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* SKU */}
                  <td className="px-8 py-5 font-mono text-[10px]" style={{ color: "#64748b" }}>
                    {item.variants?.[0]?.sku || "---"}
                  </td>

                  {/* Nombre */}
                  <td className="px-8 py-5">
                    <div
                      className="font-bold uppercase tracking-tighter italic text-base leading-none"
                      style={{ color: "#0f172a" }}
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
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg border"
                          style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
                        >
                          <span className="text-[9px] font-black uppercase" style={{ color: "#0f172a" }}>
                            {v.size?.value || (v.attributes as any)?.customSize || "S/T"}
                          </span>
                          {v.color && (
                            <div
                              className="flex items-center gap-1 pl-1.5 ml-0.5 border-l"
                              style={{ borderColor: "#e2e8f0" }}
                            >
                              <span className="text-[8px] font-bold uppercase tracking-tighter" style={{ color: "#64748b" }}>
                                {v.color.name}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Precio venta */}
                  <td className="px-8 py-5 text-right font-mono font-bold" style={{ color: "#0891b2" }}>
                    ${Number(item.price).toLocaleString("es-AR")}
                  </td>
                  
                  {/* Precio máximo */}
                  <td className="px-8 py-5 text-right font-mono font-bold" style={{ color: "#0891b2" }}>
                    ${Number(item.maxPrice || 0).toLocaleString("es-AR")}
                  </td>

                  {/* Stock */}
                  <td className="px-8 py-5 text-right font-mono font-bold">
                    <span style={{ color: totalStock <= 0 ? "#ef4444" : "#0f172a" }}>
                      {totalStock}
                    </span>
                  </td>

                  {/* Precio costo */}
                  <td className="px-8 py-5 text-right font-mono font-bold" style={{ color: "#64748b" }}>
                    ${Number(item.cost || 0).toLocaleString("es-AR")}
                  </td>

                  {/* Categoría */}
                  <td className="px-8 py-5">
                    <span
                      className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                      style={{
                        background: "rgba(6, 182, 212, 0.06)",
                        borderColor: "#c2f3f8",
                        color: "#0891b2",
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
                        style={{ color: "#06b6d4" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#0891b2")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#06b6d4")}
                      >
                        {item.supplier.name}
                      </button>
                    ) : (
                      <span className="text-[10px] uppercase font-bold italic" style={{ color: "#cbd5e1" }}>
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
                        onClick={() => setDeleteTarget({ id: item.id, name: item.name })}
                        className="transition-colors"
                        style={{ color: "#cbd5e1" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#ef4444")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#cbd5e1")}
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
        <ProviderModal
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
        />
      )}

      {/* ── DIÁLOGO DE CONFIRMACIÓN ── */}
      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar producto"
          message={`¿Estás seguro de eliminar "${deleteTarget.name}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}