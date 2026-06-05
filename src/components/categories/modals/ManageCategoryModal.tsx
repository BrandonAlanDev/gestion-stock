"use client";

import { useState, useEffect } from "react";
import { createCategory, updateCategory, deleteCategory, createSubCategory, deleteSubCategory } from "@/actions/categories";
import { X, Edit2, Trash2, Tag, Loader2, Layers, Plus } from "lucide-react";
import { toast } from "sonner";

interface ManageCategoryModalProps {
  sizeTypes: any[];
  category?: any;
  variant?: "admin" | "tienda";
}

export default function ManageCategoryModal({ sizeTypes, category, variant = "tienda" }: ManageCategoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const isEdit = !!category;

  const [formData, setFormData] = useState({ name: category?.name || "" });
  const [subData, setSubData] = useState({ name: "", sizeTypeId: "" });

  const isAdmin = variant === "admin";

  useEffect(() => {
    if (category) setFormData({ name: category.name || "" });
  }, [category]);

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
        if (!isEdit) { setIsOpen(false); setFormData({ name: "" }); }
      }
    } catch {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!confirm("¿Estás seguro de eliminar esta categoría y sus subgrupos asociados?")) return;
    setLoading(true);
    const res = await deleteCategory(category.id);
    setLoading(false);
    if (res?.error) { toast.error(res.error); }
    else { toast.success("Categoría eliminada"); setIsOpen(false); }
  };

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

  // ── ESTILOS POR VARIANTE ────────────────────────────────
  const styles = {
    overlay: isAdmin
      ? "bg-black/90 backdrop-blur-md"
      : { background: "rgba(7,26,24,0.75)", backdropFilter: "blur(6px)" },
    card: isAdmin
      ? "bg-neutral-950 border border-neutral-800"
      : { background: "#ffffff", border: "1px solid #b2dede" },
    cardRounded: "rounded-[2.5rem]",
    barColor: isEdit ? (isAdmin ? "bg-blue-500" : "#4ab8b8") : (isAdmin ? "bg-amber-500" : "#0d5c63"),
    titleColor: isAdmin ? "text-white" : "#083d42",
    titleIconColor: isEdit ? (isAdmin ? "text-blue-500" : "#4ab8b8") : (isAdmin ? "text-amber-500" : "#0d5c63"),
    closeColor: isAdmin ? "text-neutral-500 hover:text-white" : "#4a7c80",
    labelColor: isAdmin ? "text-neutral-500" : "#4a7c80",
    labelLetterSpacing: "0.2em",
    input: isAdmin
      ? "bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-white outline-none focus:border-neutral-700 transition-all font-medium"
      : { background: "#f0fafa", border: "1px solid #b2dede", borderRadius: "16px", padding: "14px 16px", color: "#0d2b2e", fontSize: "14px", fontWeight: 500, outline: "none", width: "100%" },
    deleteBtn: isAdmin
      ? "px-4 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all"
      : { background: "rgba(224,80,80,0.08)", border: "1px solid rgba(224,80,80,0.25)", color: "#e05050", borderRadius: "16px", padding: "0 16px", transition: "all" },
    submitBtn: isEdit
      ? (isAdmin
          ? "border-neutral-800 text-white hover:bg-neutral-900 w-full font-black uppercase italic rounded-2xl h-12"
          : { height: "48px", borderRadius: "16px", fontSize: "13px", border: "1px solid #b2dede", background: "#f0fafa", color: "#083d42", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" })
      : (isAdmin
          ? "w-full font-black uppercase italic rounded-2xl h-12 bg-amber-500 text-black"
          : { height: "48px", borderRadius: "16px", fontSize: "13px", border: "none", background: "#0d5c63", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }),
    subListBg: isAdmin ? "bg-neutral-900/50 border-neutral-800/60" : { background: "#f0fafa", border: "1px solid #b2dede" },
    subTextColor: isAdmin ? "text-white" : "#083d42",
    subSizeColor: isAdmin ? "text-neutral-500" : "#4a7c80",
    subDeleteColor: isAdmin ? "text-neutral-600 hover:text-red-500" : "#b2dede",
    addSubBg: isAdmin ? "bg-neutral-900/30 border-neutral-800/80" : { background: "#f0fafa", border: "1px solid #b2dede" },
    addSubTitle: isAdmin ? "text-amber-500" : "#0d5c63",
    addSubInput: isAdmin
      ? "bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-neutral-700"
      : { background: "#f0fafa", border: "1px solid #b2dede", borderRadius: "12px", padding: "10px 12px", color: "#0d2b2e", fontSize: "12px", outline: "none", width: "100%" },
    addSubBtn: isAdmin
      ? "w-full bg-neutral-800 hover:bg-amber-500 hover:text-black text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-xl transition-all flex items-center justify-center gap-1 disabled:opacity-40"
      : { background: "#0d5c63", color: "#ffffff", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", padding: "8px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" },
    dividerColor: isAdmin ? "border-neutral-900" : "#e0f5f5",
    emptyTextColor: isAdmin ? "text-neutral-600" : "#b2dede",
    sectionTitleColor: isAdmin ? "text-neutral-400" : "#4a7c80",
  };

  return (
    <>
      {/* ── TRIGGER ── */}
      {isEdit ? (
        <button
          onClick={() => setIsOpen(true)}
          className={isAdmin
            ? "p-2.5 bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 hover:text-amber-500 text-neutral-400 rounded-xl transition-all shadow-xl"
            : "transition-all"
          }
          style={!isAdmin ? {
            padding: "10px",
            background: "#f0fafa",
            border: "1px solid #b2dede",
            borderRadius: "12px",
            color: "#4a7c80",
          } : undefined}
          onMouseEnter={!isAdmin ? e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#0d5c63";
            (e.currentTarget as HTMLButtonElement).style.color = "#0d5c63";
          } : undefined}
          onMouseLeave={!isAdmin ? e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#b2dede";
            (e.currentTarget as HTMLButtonElement).style.color = "#4a7c80";
          } : undefined}
        >
          <Edit2 size={16} />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className={isAdmin
            ? "font-black uppercase italic tracking-tighter rounded-xl bg-amber-500 text-black px-5 py-2.5"
            : "font-black uppercase italic tracking-tighter transition-all"
          }
          style={!isAdmin ? {
            background: "#0d5c63",
            color: "#ffffff",
            borderRadius: "12px",
            padding: "10px 20px",
            fontSize: "13px",
            border: "none",
            cursor: "pointer",
          } : undefined}
          onMouseEnter={!isAdmin ? e => ((e.currentTarget as HTMLButtonElement).style.background = "#083d42") : undefined}
          onMouseLeave={!isAdmin ? e => ((e.currentTarget as HTMLButtonElement).style.background = "#0d5c63") : undefined}
        >
          + Nueva Categoría
        </button>
      )}

      {/* ── MODAL ── */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto ${isAdmin ? styles.overlay as string : ''}`}
          style={!isAdmin ? styles.overlay as React.CSSProperties : undefined}
        >
          <div
            className={`w-full max-w-lg my-auto relative overflow-hidden shadow-2xl ${isAdmin ? (styles.card as string) : ''} ${styles.cardRounded}`}
            style={!isAdmin ? styles.card as React.CSSProperties : undefined}
          >
            {/* Barra superior */}
            <div
              className={`absolute top-0 left-0 w-full h-1 ${isAdmin ? styles.barColor as string : ''}`}
              style={!isAdmin ? { height: "4px", background: styles.barColor as string } : undefined}
            />

            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h2
                  className={`text-2xl font-black uppercase italic flex items-center gap-3 tracking-tighter ${isAdmin ? styles.titleColor as string : ''}`}
                  style={!isAdmin ? { color: styles.titleColor as string } : undefined}
                >
                  <Tag className={isAdmin ? styles.titleIconColor as string : ''} style={!isAdmin ? { color: styles.titleIconColor as string } : undefined} size={24} />
                  {isEdit ? "Gestionar Estructura" : "Crear Categoría"}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className={isAdmin ? styles.closeColor as string : ''}
                  style={!isAdmin ? { color: styles.closeColor as string } : undefined}
                  onMouseEnter={!isAdmin ? e => ((e.currentTarget as HTMLButtonElement).style.color = "#083d42") : undefined}
                  onMouseLeave={!isAdmin ? e => ((e.currentTarget as HTMLButtonElement).style.color = styles.closeColor as string) : undefined}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form categoría principal */}
              <form onSubmit={handleSubmitCategory} className="space-y-4">
                <div className="space-y-2">
                  <label
                    className={`text-[10px] font-black uppercase ml-1 ${isAdmin ? styles.labelColor as string : ''}`}
                    style={!isAdmin ? { color: styles.labelColor as string, letterSpacing: styles.labelLetterSpacing } : { letterSpacing: styles.labelLetterSpacing }}
                  >
                    Categoría Principal
                  </label>
                  <div className="flex gap-2">
                    <input
                      className={isAdmin ? styles.input as string : ''}
                      style={!isAdmin ? styles.input as React.CSSProperties : undefined}
                      value={formData.name}
                      onChange={e => setFormData({ name: e.target.value })}
                      placeholder="Ej: Wetsuits, Tablas, Accesorios"
                      required
                      onFocus={!isAdmin ? e => (e.currentTarget.style.borderColor = "#4ab8b8") : undefined}
                      onBlur={!isAdmin ? e => (e.currentTarget.style.borderColor = "#b2dede") : undefined}
                    />
                    {isEdit && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleDeleteCategory}
                        className={isAdmin ? styles.deleteBtn as string : ''}
                        style={!isAdmin ? styles.deleteBtn as React.CSSProperties : undefined}
                        onMouseEnter={!isAdmin ? e => {
                          (e.currentTarget as HTMLButtonElement).style.background = "#e05050";
                          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                        } : undefined}
                        onMouseLeave={!isAdmin ? e => {
                          (e.currentTarget as HTMLButtonElement).style.background = "rgba(224,80,80,0.08)";
                          (e.currentTarget as HTMLButtonElement).style.color = "#e05050";
                        } : undefined}
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={isAdmin ? (styles.submitBtn as string) + ' flex items-center justify-center gap-2' : ''}
                  style={!isAdmin ? styles.submitBtn as React.CSSProperties : undefined}
                  onMouseEnter={!isAdmin && !loading ? e => {
                    const btn = e.currentTarget as HTMLButtonElement;
                    btn.style.background = isEdit ? "#e0f5f5" : "#083d42";
                  } : undefined}
                  onMouseLeave={!isAdmin && !loading ? e => {
                    const btn = e.currentTarget as HTMLButtonElement;
                    btn.style.background = isEdit ? "#f0fafa" : "#0d5c63";
                  } : undefined}
                >
                  {loading
                    ? <Loader2 className="animate-spin" size={18} />
                    : isEdit ? "Actualizar Nombre Principal" : "Crear Categoría Madre"}
                </button>
              </form>

              {/* Subcategorías — solo en edición */}
              {isEdit && (
                <div
                  className={`space-y-4 pt-6 ${isAdmin ? 'border-t ' + styles.dividerColor : ''}`}
                  style={!isAdmin ? { borderTop: `1px solid ${styles.dividerColor}` } : undefined}
                >
                  <h3
                    className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isAdmin ? styles.sectionTitleColor as string : ''}`}
                    style={!isAdmin ? { color: styles.sectionTitleColor as string } : undefined}
                  >
                    <Layers size={14} className={isAdmin ? "text-amber-500" : ''} style={!isAdmin ? { color: "#4ab8b8" } : undefined} />
                    Subcategorías y Curvas de Talles
                  </h3>

                  {/* Lista subcategorías */}
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {category.subCategories?.map((sub: any) => (
                      <div
                        key={sub.id}
                        className={`flex justify-between items-center px-4 py-2.5 rounded-xl ${isAdmin ? styles.subListBg as string : ''}`}
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
                            className={`text-[9px] font-bold uppercase tracking-wider ${isAdmin ? styles.subSizeColor as string : ''}`}
                            style={!isAdmin ? { color: styles.subSizeColor as string } : undefined}
                          >
                            Talles: {sub.sizeType?.name || "Estándar / Único"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSub(sub.id)}
                          className={isAdmin ? styles.subDeleteColor as string : ''}
                          style={!isAdmin ? { color: styles.subDeleteColor as string } : undefined}
                          onMouseEnter={!isAdmin ? e => ((e.currentTarget as HTMLButtonElement).style.color = "#e05050") : undefined}
                          onMouseLeave={!isAdmin ? e => ((e.currentTarget as HTMLButtonElement).style.color = styles.subDeleteColor as string) : undefined}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {(!category.subCategories || category.subCategories.length === 0) && (
                      <p className={`text-[11px] italic pl-1 ${isAdmin ? styles.emptyTextColor as string : ''}`} style={!isAdmin ? { color: styles.emptyTextColor as string } : undefined}>
                        No hay subcategorías en este grupo.
                      </p>
                    )}
                  </div>

                  {/* Form agregar subcategoría */}
                  <form
                    onSubmit={handleAddSubCategory}
                    className={`space-y-3 p-4 rounded-2xl ${isAdmin ? styles.addSubBg as string : ''}`}
                    style={!isAdmin ? { ...styles.addSubBg as React.CSSProperties, borderRadius: "16px" } : undefined}
                  >
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider ${isAdmin ? styles.addSubTitle as string : ''}`}
                      style={!isAdmin ? { color: styles.addSubTitle as string } : undefined}
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
                        onFocus={!isAdmin ? e => (e.currentTarget.style.borderColor = "#4ab8b8") : undefined}
                        onBlur={!isAdmin ? e => (e.currentTarget.style.borderColor = "#b2dede") : undefined}
                      />
                      <select
                        className={isAdmin ? styles.addSubInput as string : ''}
                        style={!isAdmin ? { ...styles.addSubInput as React.CSSProperties, cursor: "pointer" } : { cursor: "pointer" }}
                        value={subData.sizeTypeId}
                        onChange={e => setSubData({ ...subData, sizeTypeId: e.target.value })}
                        onFocus={!isAdmin ? e => (e.currentTarget.style.borderColor = "#4ab8b8") : undefined}
                        onBlur={!isAdmin ? e => (e.currentTarget.style.borderColor = "#b2dede") : undefined}
                      >
                        <option value="">Curva estándar...</option>
                        {sizeTypes.map((st: any) => (
                          <option key={st.id} value={st.id}>{st.name}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={subLoading || !subData.name}
                      className={`${isAdmin ? styles.addSubBtn as string : ''} flex items-center justify-center gap-1`}
                      style={!isAdmin ? { ...styles.addSubBtn as React.CSSProperties, opacity: subLoading || !subData.name ? 0.6 : 1, cursor: subLoading || !subData.name ? "not-allowed" : "pointer" } : undefined}
                      onMouseEnter={!isAdmin && !subLoading && subData.name ? e => ((e.currentTarget as HTMLButtonElement).style.background = "#083d42") : undefined}
                      onMouseLeave={!isAdmin && !subLoading && subData.name ? e => ((e.currentTarget as HTMLButtonElement).style.background = "#0d5c63") : undefined}
                    >
                      {subLoading
                        ? <Loader2 className="animate-spin" size={12} />
                        : <><Plus size={12} /> Confirmar Subgrupo</>}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}