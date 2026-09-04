"use client";

import { useState } from "react";
import { Trash2, Edit3 } from "lucide-react";
import ProductModal from "./ProductModal";
import ProviderModal from "./ProviderModal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { deleteGarment } from "@/actions/garments";
import { toast } from "sonner";
import type {
  CategoriaAdministracion,
  ColorAdministracion,
  ProductoAdministracion,
  ProveedorAdministracion,
  TipoTallaAdministracion,
  VarianteAdministracion,
} from "@/types/productos/administracion-productos";
import { obtenerTallaPersonalizada } from "@/lib/utilidades/obtener-talla-personalizada";

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

export default function QuickViewTable({ garments, categories, sizeTypes, providers, colors, onProductsChanged }: {
  garments: ProductoAdministracion[];
  categories: CategoriaAdministracion[];
  sizeTypes: TipoTallaAdministracion[];
  providers: ProveedorAdministracion[];
  colors: ColorAdministracion[];
  onProductsChanged?: () => void;
}) {
  const pageConfig = usePageConfig();
  const [editingGarment, setEditingGarment] = useState<ProductoAdministracion | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ProveedorAdministracion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Variables dinámicas de color
  const primaryColor = pageConfig?.pageConfig?.primaryColor || "#000000";
  const secondaryColor = pageConfig?.pageConfig?.secondaryColor || "#FFFFFF";

  // Cálculos de legibilidad
  const textColor = getContrastColor(secondaryColor);
  const isDarkBg = textColor === "#ffffff";

  // Transparencias y capas basadas en contraste
  const overlayBorder = isDarkBg ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)";
  const itemRowBorder = isDarkBg ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)";
  const badgeBg = isDarkBg ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)";
  const categoryBadgeBg = isDarkBg ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)";
  
  // Efecto de hover dinámico en las filas
  const rowHoverBg = isDarkBg ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.015)";

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const res = await deleteGarment(deleteTarget.id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Producto eliminado correctamente");
    }
    setDeleteTarget(null);
  };

  return (
    <>
      {/* ── TABLA ── */}
      <div
        className="overflow-x-auto rounded-[1.0rem] shadow-sm border"
        style={{ borderColor: overlayBorder, backgroundColor: secondaryColor }}
      >
        <table className="w-full min-w-[900px] text-left border-collapse">
          <thead>
            <tr
              className="text-[9px] uppercase font-black border-b"
              style={{
                borderColor: overlayBorder,
                color: textColor,
                letterSpacing: "0.3em",
              }}
            >
              <th className="px-8 py-6 opacity-40">Ref. SKU</th>
              <th className="px-8 py-6" style={{ color: textColor }}>Producto</th>
              <th className="px-8 py-6 opacity-60">Talle / Variantes</th>
              <th className="px-8 py-6 text-right" style={{ color: primaryColor }}>Precio Venta</th>
              <th className="px-8 py-6 text-right" style={{ color: primaryColor }}>Precio Máximo</th>
              <th className="px-8 py-6 text-right opacity-60">Stock Total</th>
              <th className="px-8 py-6 text-right opacity-40">Precio Costo</th>
              <th className="px-8 py-6 opacity-60">Categoría</th>
              <th className="px-8 py-6 opacity-60">Proveedor</th>
              <th className="px-8 py-6 text-right opacity-60">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {garments?.map((item) => {
              const totalStock = item.variants?.reduce((acc, v) => acc + (v.stock ?? 0), 0) || 0;
              return (
                <tr
                  key={item.id}
                  className="text-sm transition-all group border-b"
                  style={{ borderColor: itemRowBorder }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = rowHoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {/* SKU */}
                  <td className="px-8 py-5 font-mono text-[10px] opacity-50" style={{ color: textColor }}>
                    {item.variants?.[0]?.sku || "---"}
                  </td>

                  {/* Nombre */}
                  <td className="px-8 py-5">
                    <div
                      className="font-bold uppercase tracking-tighter italic text-base leading-none"
                      style={{ color: textColor }}
                    >
                      {item.name}
                    </div>
                  </td>

                  {/* Variantes */}
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-2">
                      {item.variants?.map((v: VarianteAdministracion) => (
                        <div
                          key={v.id}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg border"
                          style={{ backgroundColor: badgeBg, borderColor: overlayBorder }}
                        >
                          <span className="text-[9px] font-black uppercase" style={{ color: textColor }}>
                            {v.size?.value || obtenerTallaPersonalizada(v.attributes) || "S/T"}
                          </span>
                          {v.color && (
                            <div
                              className="flex items-center gap-1 pl-1.5 ml-0.5 border-l"
                              style={{ borderColor: overlayBorder }}
                            >
                              <span className="text-[8px] font-bold uppercase tracking-tighter opacity-60" style={{ color: textColor }}>
                                {v.color.name}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Precio venta */}
                  <td className="px-8 py-5 text-right font-mono font-bold" style={{ color: primaryColor }}>
                    ${Number(item.price).toLocaleString("es-AR")}
                  </td>
                  
                  {/* Precio máximo */}
                  <td className="px-8 py-5 text-right font-mono font-bold" style={{ color: primaryColor }}>
                    ${Number(item.maxPrice || 0).toLocaleString("es-AR")}
                  </td>

                  {/* Stock */}
                  <td className="px-8 py-5 text-right font-mono font-bold">
                    <span style={{ color: totalStock <= 0 ? "#ef4444" : textColor }}>
                      {totalStock}
                    </span>
                  </td>

                  {/* Precio costo */}
                  <td className="px-8 py-5 text-right font-mono font-bold opacity-50" style={{ color: textColor }}>
                    ${Number(item.cost || 0).toLocaleString("es-AR")}
                  </td>

                  {/* Categoría */}
                  <td className="px-8 py-5">
                    <span
                      className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                      style={{
                        backgroundColor: categoryBadgeBg,
                        borderColor: overlayBorder,
                        color: textColor,
                      }}
                    >
                      {item.category?.name || "Gral"}
                    </span>
                  </td>

                  {/* Proveedor */}
                  <td className="px-8 py-5">
                    {item.supplier ? (
                      <button
                        onClick={() => item.supplier && setSelectedProvider(item.supplier)}
                        className="text-[11px] font-black uppercase italic tracking-tight transition-all hover:underline underline-offset-4 cursor-pointer"
                        style={{ color: primaryColor }}
                      >
                        {item.supplier.name}
                      </button>
                    ) : (
                      <span className="text-[10px] uppercase font-bold italic opacity-30" style={{ color: textColor }}>
                        Sin Asignar
                      </span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={() => setEditingGarment(item)}
                        className="transition-colors cursor-pointer opacity-40 hover:opacity-100"
                        style={{ color: textColor }}
                        title="Editar producto"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: item.id, name: item.name || "Producto" })}
                        className="transition-colors cursor-pointer opacity-40 hover:opacity-100"
                        style={{ color: textColor }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#ef4444")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = textColor)}
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

      {/* ── MODAL PRODUCTO (uno solo, on-demand) ── */}
      {editingGarment && (
        <ProductModal
          garment={editingGarment}
          categories={categories}
          sizes={sizeTypes}
          providers={providers}
          colors={colors || []}
          open={!!editingGarment}
          onClose={() => setEditingGarment(null)}
          onSuccess={() => {
            onProductsChanged?.();
          }}
        />
      )}

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
