"use client";

import { useState } from "react";
import { Layers, Plus, X, Loader2 } from "lucide-react";
import { createSubCategory, deleteSubCategory } from "@/actions/categories";
import { toast } from "sonner";
import { getContrastColor } from "@/lib/utils";
import type { CategoriaConSubs, TalleTipoConSizes } from "@/types/catalogos";

interface SubCategoryManagerProps {
  category: CategoriaConSubs;
  sizeTypes: TalleTipoConSizes[];
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  overlayBorder: string;
  innerBg: string;
  onCategoryChange?: () => void;
}

export default function SubCategoryManager({
  category,
  sizeTypes,
  primaryColor,
  secondaryColor,
  textColor,
  overlayBorder,
  innerBg,
  onCategoryChange,
}: SubCategoryManagerProps) {
  const [subLoading, setSubLoading] = useState(false);
  const [subData, setSubData] = useState({ name: "", sizeTypeId: "" });

  const handleAddSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subData.name.trim()) return;
    setSubLoading(true);
    try {
      const res = await createSubCategory({
        name: subData.name,
        sizeTypeId: subData.sizeTypeId || null,
        categoryId: category.id,
      });
      if (res?.error) { toast.error(res.error); }
      else { toast.success("Subcategoría añadida"); setSubData({ name: "", sizeTypeId: "" }); onCategoryChange?.(); }
    } catch {
      toast.error("Error al crear subcategoría");
    } finally {
      setSubLoading(false);
    }
  };

  const handleDeleteSub = async (subId: string) => {
    if (!confirm("¿Eliminar esta subcategoría de forma permanente?")) return;
    const res = await deleteSubCategory(subId);
    if (res?.error) { toast.error(res.error); }
    else { toast.success("Subcategoría removida"); onCategoryChange?.(); }
  };

  return (
    <div className="space-y-4 pt-6 border-t" style={{ borderColor: overlayBorder }}>
      <h3
        className="text-xs font-black uppercase tracking-widest flex items-center gap-2"
        style={{ color: textColor }}
      >
        <Layers size={14} style={{ color: primaryColor }} />
        Subcategorías y Curvas de Talles
      </h3>

      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {category.subCategories?.map((sub) => (
          <div
            key={sub.id}
            className="flex justify-between items-center px-4 py-2.5"
            style={{
              backgroundColor: innerBg,
              border: `1px solid ${overlayBorder}`,
              borderRadius: "12px",
            }}
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase" style={{ color: textColor }}>
                {sub.name}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-60" style={{ color: textColor }}>
                Talles: {sub.sizeType?.name || "Estándar / Único"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleDeleteSub(sub.id)}
              style={{ color: textColor, opacity: 0.4 }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.color = "#e05050";
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.color = textColor;
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.4";
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {(!category.subCategories || category.subCategories.length === 0) && (
          <p className="text-[11px] italic pl-1 opacity-50" style={{ color: textColor }}>
            No hay subcategorías en este grupo.
          </p>
        )}
      </div>

      <form
        onSubmit={handleAddSubCategory}
        className="space-y-3 p-4"
        style={{
          backgroundColor: innerBg,
          border: `1px solid ${overlayBorder}`,
          borderRadius: "16px",
        }}
      >
        <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: primaryColor }}>
          + Vincular Subgrupo
        </span>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className="w-full"
            style={{
              backgroundColor: innerBg,
              border: `1px solid ${overlayBorder}`,
              borderRadius: "12px",
              padding: "14px 16px",
              color: textColor,
              fontSize: "14px",
              fontWeight: 500,
              outline: "none",
            }}
            value={subData.name}
            onChange={e => setSubData({ ...subData, name: e.target.value })}
            placeholder="Nombre (Ej: Adultos)"
            required
            onFocus={e => (e.currentTarget.style.borderColor = primaryColor)}
            onBlur={e => (e.currentTarget.style.borderColor = overlayBorder)}
          />
          <select
            className="w-full"
            style={{
              backgroundColor: secondaryColor,
              border: `1px solid ${overlayBorder}`,
              borderRadius: "12px",
              padding: "14px 16px",
              color: textColor,
              fontSize: "14px",
              fontWeight: 500,
              outline: "none",
              cursor: "pointer",
            }}
            value={subData.sizeTypeId}
            onChange={e => setSubData({ ...subData, sizeTypeId: e.target.value })}
            onFocus={e => (e.currentTarget.style.borderColor = primaryColor)}
            onBlur={e => (e.currentTarget.style.borderColor = overlayBorder)}
          >
            <option value="" style={{ backgroundColor: secondaryColor, color: textColor }}>Curva estándar...</option>
            {sizeTypes.map((st) => (
              <option key={st.id} value={st.id} style={{ backgroundColor: secondaryColor, color: textColor }}>{st.name}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={subLoading || !subData.name}
          className="flex items-center justify-center gap-1"
          style={{
            backgroundColor: primaryColor,
            color: getContrastColor(primaryColor),
            borderRadius: "10px",
            border: "none",
            cursor: subLoading || !subData.name ? "not-allowed" : "pointer",
            fontSize: "10px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "8px 0",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            opacity: subLoading || !subData.name ? 0.6 : 1,
          }}
          onMouseEnter={!subLoading && subData.name ? e => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.9") : undefined}
          onMouseLeave={!subLoading && subData.name ? e => ((e.currentTarget as HTMLButtonElement).style.opacity = "1") : undefined}
        >
          {subLoading && <Loader2 className="animate-spin" size={12} />}
          <Plus size={12} /> Confirmar Subgrupo
        </button>
      </form>
    </div>
  );
}
