"use client";

import { useState, useEffect } from "react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { createCategory, updateCategory, deleteCategory } from "@/actions/categories";
import { X, Tag, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import CategoryTriggerButton from "./CategoryTriggerButton";
import SubCategoryManager from "./SubCategoryManager";
import { getContrastColor } from "@/lib/utils";
import type { CategoriaConSubs, TalleTipoConSizes } from "@/types/catalogos";

interface ManageCategoryModalProps {
  sizeTypes: TalleTipoConSizes[];
  category?: CategoriaConSubs;
  variant?: "admin" | "tienda";
  onCategoryChange?: () => void;
}

export default function ManageCategoryModal({ sizeTypes, category, variant = "tienda", onCategoryChange }: ManageCategoryModalProps) {
  const { pageConfig } = usePageConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!category;

  const [formData, setFormData] = useState({ name: category?.name || "" });

  const isAdmin = variant === "admin";

  useEffect(() => {
    if (category) setFormData({ name: category.name || "" });
  }, [category]);

  const background = (pageConfig?.secondaryColor as string) || "#00b4d8";
  const accent = (pageConfig?.primaryColor as string) || "#FFFFFF";
  const textColor = getContrastColor(background);
  const accentTextColor = getContrastColor(accent);
  const isDarkBg = textColor === "#ffffff";

  const overlayBorder = isDarkBg ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.08)";
  const innerBg = isDarkBg ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)";

  const styles = {
    overlay: isAdmin
      ? { background: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(6px)" }
      : { background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(6px)" },
    card: {
      backgroundColor: background,
      border: `1px solid ${overlayBorder}`,
      borderRadius: "1rem",
    },
    barColor: accent,
    titleColor: textColor,
    titleIconColor: accent,
    closeColor: textColor,
    labelColor: textColor,
    labelLetterSpacing: "0.2em",
    input: {
      backgroundColor: innerBg,
      border: `1px solid ${overlayBorder}`,
      borderRadius: "12px",
      padding: "14px 16px",
      color: textColor,
      fontSize: "14px",
      fontWeight: 500,
      outline: "none",
      width: "100%",
    },
    deleteBtn: {
      background: "rgba(224, 80, 80, 0.08)",
      border: "1px solid rgba(224, 80, 80, 0.25)",
      color: "#e05050",
      borderRadius: "12px",
      padding: "0 16px",
      transition: "all",
    },
    submitBtn: {
      height: "48px",
      width: "100%",
      borderRadius: "12px",
      fontSize: "13px",
      border: isEdit ? `1px solid ${overlayBorder}` : "none",
      backgroundColor: isEdit ? innerBg : accent,
      color: isEdit ? textColor : accentTextColor,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      textTransform: "uppercase",
      fontStyle: "italic",
      fontWeight: 900,
    },
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = isEdit
        ? await updateCategory(category.id, { name: formData.name })
        : await createCategory({ name: formData.name });
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(isEdit ? "Categoría actualizada" : "Categoría creada");
        onCategoryChange?.();
        if (!isEdit) { setIsOpen(false); setFormData({ name: "" }); }
      }
    } catch {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!category) return;
    if (!confirm("¿Estás seguro de eliminar esta categoría y sus subgrupos asociados?")) return;
    setLoading(true);
    const res = await deleteCategory(category.id);
    setLoading(false);
    if (res?.error) { toast.error(res.error); }
    else { toast.success("Categoría eliminada"); setIsOpen(false); onCategoryChange?.(); }
  };

  return (
    <>
      <CategoryTriggerButton
        isEdit={isEdit}
        primaryColor={accent}
        innerBg={innerBg}
        overlayBorder={overlayBorder}
        textColor={textColor}
        onOpen={() => setIsOpen(true)}
      />

      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto"
          style={styles.overlay}
        >
          <div
            className="w-full max-w-lg my-auto relative overflow-hidden shadow-2xl"
            style={styles.card}
          >
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ height: "4px", backgroundColor: styles.barColor }}
            />

            <div className="p-4 space-y-6 sm:p-8">
              <div className="flex justify-between items-center gap-3">
                <h2
                  className="text-2xl font-black uppercase italic flex items-center gap-3 tracking-tighter min-w-0"
                  style={{ color: styles.titleColor }}
                >
                  <Tag style={{ color: styles.titleIconColor }} size={24} />
                  {isEdit ? "Gestionar Estructura" : "Crear Categoría"}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="shrink-0"
                  style={{ color: styles.closeColor }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.7")}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmitCategory} className="space-y-4">
                <div className="space-y-2">
                  <label
                    className="text-[10px] font-black uppercase ml-1 opacity-70"
                    style={{ color: styles.labelColor, letterSpacing: styles.labelLetterSpacing }}
                  >
                    Categoría Principal
                  </label>
                  <div className="flex gap-2">
                    <input
                      style={styles.input}
                      value={formData.name}
                      onChange={e => setFormData({ name: e.target.value })}
                      placeholder="Ej: Ropa, Accesorios, Calzado"
                      required
                      onFocus={e => (e.currentTarget.style.borderColor = accent)}
                      onBlur={e => (e.currentTarget.style.borderColor = overlayBorder)}
                    />
                    {isEdit && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleDeleteCategory}
                        style={styles.deleteBtn}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#e05050";
                          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(224, 80, 80, 0.08)";
                          (e.currentTarget as HTMLButtonElement).style.color = "#e05050";
                        }}
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2"
                  style={styles.submitBtn}
                  onMouseEnter={!loading ? e => {
                    (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
                  } : undefined}
                  onMouseLeave={!loading ? e => {
                    (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                  } : undefined}
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  {isEdit ? "Actualizar Nombre Principal" : "Crear Categoría Madre"}
                </button>
              </form>

              {isEdit && (
                <SubCategoryManager
                  category={category}
                  sizeTypes={sizeTypes}
                  primaryColor={accent}
                  secondaryColor={background}
                  textColor={textColor}
                  overlayBorder={overlayBorder}
                  innerBg={innerBg}
                  onCategoryChange={onCategoryChange}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
