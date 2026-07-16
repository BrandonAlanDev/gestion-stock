"use client";

import { useState } from "react";
import { Layers, Plus, X, Loader2 } from "lucide-react";
import { createSubCategory, deleteSubCategory } from "@/actions/categories";
import { toast } from "sonner";

export default function SubCategoryManager({
  category,
  sizeTypes,
  isAdmin,
  primaryColor,
  secondaryColor,
  textColor,
  overlayBorder,
  innerBg,
  styles,
}: {
  category: any;
  sizeTypes: any[];
  isAdmin: boolean;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  overlayBorder: string;
  innerBg: string;
  styles: Record<string, any>;
}) {
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
      else { toast.success("Subcategoría añadida"); setSubData({ name: "", sizeTypeId: "" }); }
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
    else { toast.success("Subcategoría removida"); }
  };

  return (
    <div className="space-y-4 pt-6 border-t" style={{ borderColor: typeof styles.dividerColor === 'string' ? styles.dividerColor : overlayBorder }}>
      <h3
        className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isAdmin ? styles.sectionTitleColor as string : ''}`}
        style={!isAdmin ? { color: styles.sectionTitleColor as string } : undefined}
      >
        <Layers size={14} className={isAdmin ? "text-amber-500" : ''} style={!isAdmin ? { color: primaryColor } : undefined} />
        Subcategorías y Curvas de Talles
      </h3>

      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {category.subCategories?.map((sub: any) => (
          <div
            key={sub.id}
            className={`flex justify-between items-center px-4 py-2.5 rounded-[1.0rem] ${isAdmin ? styles.subListBg as string : ''}`}
            style={!isAdmin ? { ...styles.subListBg as React.CSSProperties, borderRadius: "12px" } : undefined}
          >
            <div className="flex flex-col">
              <span
                className={`text-xs font-bold uppercase ${isAdmin ? styles.subTextColor as string : ''}`}
                style={!isAdmin ? { color: styles.subTextColor as string } : undefined}
              >
                {sub.name}
              </span>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider opacity-60 ${isAdmin ? styles.subSizeColor as string : ''}`}
                style={!isAdmin ? { color: styles.subSizeColor as string } : undefined}
              >
                Talles: {sub.sizeType?.name || "Estándar / Único"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleDeleteSub(sub.id)}
              className={isAdmin ? styles.subDeleteColor as string : ''}
              style={!isAdmin ? { color: textColor, opacity: 0.4 } : undefined}
              onMouseEnter={!isAdmin ? e => {
                (e.currentTarget as HTMLButtonElement).style.color = "#e05050";
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              } : undefined}
              onMouseLeave={!isAdmin ? e => {
                (e.currentTarget as HTMLButtonElement).style.color = textColor || '';
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.4";
              } : undefined}
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
        className={`space-y-3 p-4 rounded-[1.0rem] ${isAdmin ? styles.addSubBg as string : ''}`}
        style={!isAdmin ? { ...styles.addSubBg as React.CSSProperties, borderRadius: "16px" } : undefined}
      >
        <span
          className="text-[9px] font-black uppercase tracking-wider"
          style={!isAdmin ? { color: styles.addSubTitle as string } : { color: styles.addSubTitle as string }}
        >
          + Vincular Subgrupo
        </span>

        <div className="grid grid-cols-2 gap-2">
          <input
            className={isAdmin ? styles.addSubInput as string : ''}
            style={!isAdmin ? styles.addSubInput as React.CSSProperties : undefined}
            value={subData.name}
            onChange={e => setSubData({ ...subData, name: e.target.value })}
            placeholder="Nombre (Ej: Adultos)"
            required
            onFocus={!isAdmin ? e => (e.currentTarget.style.borderColor = primaryColor) : undefined}
            onBlur={!isAdmin ? e => (e.currentTarget.style.borderColor = overlayBorder) : undefined}
          />
          <select
            className={isAdmin ? styles.addSubInput as string : ''}
            style={!isAdmin ? { ...styles.addSubInput as React.CSSProperties, cursor: "pointer" } : { cursor: "pointer" }}
            value={subData.sizeTypeId}
            onChange={e => setSubData({ ...subData, sizeTypeId: e.target.value })}
            onFocus={!isAdmin ? e => (e.currentTarget.style.borderColor = primaryColor) : undefined}
            onBlur={!isAdmin ? e => (e.currentTarget.style.borderColor = overlayBorder) : undefined}
          >
            <option value="" style={{ backgroundColor: secondaryColor, color: textColor }}>Curva estándar...</option>
            {sizeTypes.map((st: any) => (
              <option key={st.id} value={st.id} style={{ backgroundColor: secondaryColor, color: textColor }}>{st.name}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={subLoading || !subData.name}
          className={`${isAdmin ? styles.addSubBtn as string : ''} flex items-center justify-center gap-1`}
          style={!isAdmin ? { ...styles.addSubBtn as React.CSSProperties, opacity: subLoading || !subData.name ? 0.6 : 1, cursor: subLoading || !subData.name ? "not-allowed" : "pointer" } : undefined}
          onMouseEnter={!isAdmin && !subLoading && subData.name ? e => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.9") : undefined}
          onMouseLeave={!isAdmin && !subLoading && subData.name ? e => ((e.currentTarget as HTMLButtonElement).style.opacity = "1") : undefined}
        >
          {subLoading
            ? <Loader2 className="animate-spin" size={12} />
            : <><Plus size={12} /> Confirmar Subgrupo</>}
        </button>
      </form>
    </div>
  );
}
