"use client";

import { useState, useEffect } from "react";
import { createCategory, updateCategory, deleteCategory, createSubCategory, deleteSubCategory } from "@/actions/garments";
import { X, Edit2, Trash2, Tag, Loader2, Layers, Plus } from "lucide-react";
import { toast } from "sonner";

interface ManageCategoryModalProps {
  sizeTypes: any[];
  category?: any;
}

const inputStyle: React.CSSProperties = {
  background: "#f0fafa",
  border: "1px solid #b2dede",
  borderRadius: "16px",
  padding: "14px 16px",
  color: "#0d2b2e",
  fontSize: "14px",
  fontWeight: 500,
  outline: "none",
  width: "100%",
  transition: "border-color 0.15s",
};

const smallInputStyle: React.CSSProperties = {
  background: "#f0fafa",
  border: "1px solid #b2dede",
  borderRadius: "12px",
  padding: "10px 12px",
  color: "#0d2b2e",
  fontSize: "12px",
  outline: "none",
  width: "100%",
};

export default function ManageCategoryModal({ sizeTypes, category }: ManageCategoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const isEdit = !!category;

  const [formData, setFormData] = useState({ name: category?.name || "" });
  const [subData, setSubData] = useState({ name: "", sizeTypeId: "" });

  useEffect(() => {
    if (category) setFormData({ name: category.name || "" });
  }, [category]);

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = isEdit
        ? await updateCategory(category.id, formData)
        : await createCategory(formData);
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

  return (
    <>
      {/* ── TRIGGER ── */}
      {isEdit ? (
        <button
          onClick={() => setIsOpen(true)}
          className="transition-all"
          style={{
            padding: "10px",
            background: "#f0fafa",
            border: "1px solid #b2dede",
            borderRadius: "12px",
            color: "#4a7c80",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#0d5c63";
            (e.currentTarget as HTMLButtonElement).style.color = "#0d5c63";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#b2dede";
            (e.currentTarget as HTMLButtonElement).style.color = "#4a7c80";
          }}
        >
          <Edit2 size={16} />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="font-black uppercase italic tracking-tighter transition-all"
          style={{
            background: "#0d5c63",
            color: "#ffffff",
            borderRadius: "12px",
            padding: "10px 20px",
            fontSize: "13px",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "#083d42")}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "#0d5c63")}
        >
          + Nueva Categoría
        </button>
      )}

      {/* ── MODAL ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(7,26,24,0.75)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-lg my-auto relative overflow-hidden shadow-2xl"
            style={{
              background: "#ffffff",
              border: "1px solid #b2dede",
              borderRadius: "2.5rem",
            }}
          >
            {/* Barra superior */}
            <div
              className="absolute top-0 left-0 w-full"
              style={{ height: "4px", background: isEdit ? "#4ab8b8" : "#0d5c63" }}
            />

            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h2
                  className="text-2xl font-black uppercase italic flex items-center gap-3 tracking-tighter"
                  style={{ color: "#083d42" }}
                >
                  <Tag style={{ color: isEdit ? "#4ab8b8" : "#0d5c63" }} size={24} />
                  {isEdit ? "Gestionar Estructura" : "Crear Categoría"}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{ color: "#4a7c80" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#083d42")}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#4a7c80")}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form categoría principal */}
              <form onSubmit={handleSubmitCategory} className="space-y-4">
                <div className="space-y-2">
                  <label
                    className="text-[10px] font-black uppercase ml-1"
                    style={{ color: "#4a7c80", letterSpacing: "0.2em" }}
                  >
                    Categoría Principal
                  </label>
                  <div className="flex gap-2">
                    <input
                      style={inputStyle}
                      value={formData.name}
                      onChange={e => setFormData({ name: e.target.value })}
                      placeholder="Ej: Wetsuits, Tablas, Accesorios"
                      required
                      onFocus={e => (e.currentTarget.style.borderColor = "#4ab8b8")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#b2dede")}
                    />
                    {isEdit && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleDeleteCategory}
                        className="px-4 transition-all"
                        style={{
                          background: "rgba(224,80,80,0.08)",
                          border: "1px solid rgba(224,80,80,0.25)",
                          color: "#e05050",
                          borderRadius: "16px",
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = "#e05050";
                          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = "rgba(224,80,80,0.08)";
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
                  className="w-full font-black uppercase italic transition-all"
                  style={{
                    height: "48px",
                    borderRadius: "16px",
                    fontSize: "13px",
                    border: isEdit ? "1px solid #b2dede" : "none",
                    background: isEdit ? "#f0fafa" : "#0d5c63",
                    color: isEdit ? "#083d42" : "#ffffff",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={e => {
                    if (!loading) {
                      (e.currentTarget as HTMLButtonElement).style.background = isEdit ? "#e0f5f5" : "#083d42";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!loading) {
                      (e.currentTarget as HTMLButtonElement).style.background = isEdit ? "#f0fafa" : "#0d5c63";
                    }
                  }}
                >
                  {loading
                    ? <Loader2 className="animate-spin" size={18} />
                    : isEdit ? "Actualizar Nombre Principal" : "Crear Categoría Madre"}
                </button>
              </form>

              {/* Subcategorías — solo en edición */}
              {isEdit && (
                <div
                  className="space-y-4 pt-6"
                  style={{ borderTop: "1px solid #e0f5f5" }}
                >
                  <h3
                    className="text-xs font-black uppercase tracking-widest flex items-center gap-2"
                    style={{ color: "#4a7c80" }}
                  >
                    <Layers size={14} style={{ color: "#4ab8b8" }} />
                    Subcategorías y Curvas de Talles
                  </h3>

                  {/* Lista subcategorías */}
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {category.subCategories?.map((sub: any) => (
                      <div
                        key={sub.id}
                        className="flex justify-between items-center px-4 py-2.5"
                        style={{
                          background: "#f0fafa",
                          border: "1px solid #b2dede",
                          borderRadius: "12px",
                        }}
                      >
                        <div className="flex flex-col">
                          <span
                            className="text-xs font-bold uppercase"
                            style={{ color: "#083d42" }}
                          >
                            {sub.name}
                          </span>
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider"
                            style={{ color: "#4a7c80" }}
                          >
                            Talles: {sub.sizeType?.name || "Estándar / Único"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSub(sub.id)}
                          style={{ color: "#b2dede" }}
                          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#e05050")}
                          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#b2dede")}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {(!category.subCategories || category.subCategories.length === 0) && (
                      <p className="text-[11px] italic pl-1" style={{ color: "#b2dede" }}>
                        No hay subcategorías en este grupo.
                      </p>
                    )}
                  </div>

                  {/* Form agregar subcategoría */}
                  <form
                    onSubmit={handleAddSubCategory}
                    className="space-y-3 p-4"
                    style={{
                      background: "#f0fafa",
                      border: "1px solid #b2dede",
                      borderRadius: "16px",
                    }}
                  >
                    <span
                      className="text-[9px] font-black uppercase tracking-wider"
                      style={{ color: "#0d5c63" }}
                    >
                      + Vincular Subgrupo
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        style={smallInputStyle}
                        value={subData.name}
                        onChange={e => setSubData({ ...subData, name: e.target.value })}
                        placeholder="Nombre (Ej: Adultos)"
                        required
                        onFocus={e => (e.currentTarget.style.borderColor = "#4ab8b8")}
                        onBlur={e => (e.currentTarget.style.borderColor = "#b2dede")}
                      />
                      <select
                        style={{ ...smallInputStyle, cursor: "pointer" }}
                        value={subData.sizeTypeId}
                        onChange={e => setSubData({ ...subData, sizeTypeId: e.target.value })}
                        onFocus={e => (e.currentTarget.style.borderColor = "#4ab8b8")}
                        onBlur={e => (e.currentTarget.style.borderColor = "#b2dede")}
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
                      className="w-full text-[10px] font-black uppercase tracking-widest py-2 transition-all flex items-center justify-center gap-1"
                      style={{
                        background: subLoading || !subData.name ? "#e0f5f5" : "#0d5c63",
                        color: subLoading || !subData.name ? "#4a7c80" : "#ffffff",
                        borderRadius: "10px",
                        border: "none",
                        cursor: subLoading || !subData.name ? "not-allowed" : "pointer",
                        opacity: subLoading || !subData.name ? 0.6 : 1,
                      }}
                      onMouseEnter={e => {
                        if (!subLoading && subData.name)
                          (e.currentTarget as HTMLButtonElement).style.background = "#083d42";
                      }}
                      onMouseLeave={e => {
                        if (!subLoading && subData.name)
                          (e.currentTarget as HTMLButtonElement).style.background = "#0d5c63";
                      }}
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