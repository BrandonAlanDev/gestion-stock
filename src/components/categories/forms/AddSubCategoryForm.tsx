"use client";

import { useState } from "react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { createSubCategory } from "@/actions/categories";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  categoryId: string;
  sizeTypes: any[];
  onSuccess?: () => void;
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

export default function AddSubCategoryForm({ categoryId, sizeTypes, onSuccess }: Props) {
  const pageConfig = usePageConfig();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [sizeTypeId, setSizeTypeId] = useState("");

  // Variables dinámicas desde el Provider
  const primaryColor = pageConfig?.pageConfig?.primaryColor || "#0d5c63";
  const secondaryColor = pageConfig?.pageConfig?.secondaryColor || "#FFFFFF";
  const textColor = getContrastColor(secondaryColor);
  const isDarkBg = textColor === "#ffffff";

  // Tokens de estilo reactivos
  const overlayBorder = isDarkBg ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)";
  const fieldBg = isDarkBg ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)";

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const res = await createSubCategory({
      name,
      categoryId,
      sizeTypeId: sizeTypeId || null,
    });
    setLoading(true); // Se mantiene consistente con tu renderizado
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Subcategoría vinculada");
      setName("");
      setSizeTypeId("");
      onSuccess?.();
    }
  };

  const fieldStyle: React.CSSProperties = {
    backgroundColor: fieldBg,
    border: `1px solid ${overlayBorder}`,
    borderRadius: "12px",
    padding: "10px 12px",
    fontSize: "12px",
    color: textColor,
    outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <form
      onSubmit={handleAdd}
      className="space-y-3"
      style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: `1px solid ${overlayBorder}` }}
    >
      <p
        className="text-[9px] font-black uppercase tracking-widest mb-2"
        style={{ color: primaryColor }}
      >
        + Nuevo Subgrupo
      </p>

      <div className="flex flex-col gap-2">
        <input
          style={fieldStyle}
          placeholder="Nombre (ej: Neoprenes)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          onFocus={e => (e.currentTarget.style.borderColor = primaryColor)}
          onBlur={e => (e.currentTarget.style.borderColor = overlayBorder)}
        />

        <div className="flex gap-2">
          <select
            style={{ 
              ...fieldStyle, 
              flex: 1, 
              cursor: "pointer", 
              color: textColor,
              opacity: sizeTypeId ? 1 : 0.6 
            }}
            value={sizeTypeId}
            onChange={(e) => setSizeTypeId(e.target.value)}
            onFocus={e => (e.currentTarget.style.borderColor = primaryColor)}
            onBlur={e => (e.currentTarget.style.borderColor = overlayBorder)}
          >
            <option value="" style={{ backgroundColor: secondaryColor, color: textColor }}>Talle estándar...</option>
            {sizeTypes.map((st) => (
              <option key={st.id} value={st.id} style={{ backgroundColor: secondaryColor, color: textColor }}>
                {st.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading || !name}
            className="transition-all"
            style={{
              backgroundColor: loading || !name ? fieldBg : primaryColor,
              color: loading || !name ? textColor : getContrastColor(primaryColor),
              padding: "10px",
              borderRadius: "12px",
              border: "none",
              cursor: loading || !name ? "not-allowed" : "pointer",
              opacity: loading || !name ? 0.4 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={e => {
              if (!loading && name)
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
            }}
            onMouseLeave={e => {
              if (!loading && name)
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </form>
  );
}