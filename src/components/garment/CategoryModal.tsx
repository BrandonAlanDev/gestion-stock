"use client";

import { useState, useEffect } from "react";
import { createCategory, updateCategory, deleteCategory, createSubCategory, deleteSubCategory } from "@/actions/garments"; 
import { Button } from "@/components/ui/button";
import { X, Edit2, Trash2, Tag, Loader2, Layers, Plus } from "lucide-react";
import { toast } from "sonner";

interface ManageCategoryModalProps {
  sizeTypes: any[];
  category?: any; 
}

export default function ManageCategoryModal({ sizeTypes, category }: ManageCategoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const isEdit = !!category;

  // Estado exclusivo para el nombre de la Categoría Madre
  const [formData, setFormData] = useState({
    name: category?.name || "",
  });

  // Estado para el formulario de la Subcategoría
  const [subData, setSubData] = useState({
    name: "",
    sizeTypeId: "",
  });

  useEffect(() => {
    if (category) {
      setFormData({ name: category.name || "" });
    }
  }, [category]);

  // Manejo de guardado de la Categoría Madre
  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mandamos explícitamente solo las propiedades conocidas por la Server Action
      const cleanData = { name: formData.name };

      const res = isEdit 
        ? await updateCategory(category.id, cleanData) 
        : await createCategory(cleanData);
      
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(isEdit ? "Categoría actualizada" : "Categoría creada");
        if (!isEdit) {
          setIsOpen(false);
          setFormData({ name: "" }); // Reset del input
        }
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar Categoría Madre
  const handleDeleteCategory = async () => {
    if (!confirm("¿Estás seguro de eliminar esta categoría y sus subgrupos asociados?")) return;
    
    setLoading(true);
    const res = await deleteCategory(category.id);
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Categoría eliminada perfectamente");
      setIsOpen(false);
    }
  };

  // Agregar Subcategoría
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

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Subcategoría añadida");
        setSubData({ name: "", sizeTypeId: "" }); // Reset del formulario hijo
      }
    } catch (error) {
      toast.error("Error al crear subcategoría");
    } finally {
      setSubLoading(false);
    }
  };

  // Eliminar Subcategoría
  const handleDeleteSub = async (subId: string) => {
    if (!confirm("¿Eliminar esta subcategoría de forma permanente?")) return;
    
    const res = await deleteSubCategory(subId);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Subcategoría removida");
    }
  };

  return (
    <>
      {/* Botón Disparador */}
      {isEdit ? (
        <button 
          onClick={() => setIsOpen(true)} 
          className="p-2.5 bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 hover:text-amber-500 text-neutral-400 rounded-xl transition-all shadow-xl"
        >
          <Edit2 size={16} />
        </button>
      ) : (
        <Button 
          onClick={() => setIsOpen(true)} 
          variant="amarillo" 
          className="font-black uppercase italic tracking-tighter rounded-xl"
        >
          + Nueva Categoría
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-lg my-auto rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in duration-200">
            <div className={`absolute top-0 left-0 w-full h-1 ${isEdit ? 'bg-blue-500' : 'bg-amber-500'}`} />

            <div className="p-8 space-y-6">
              {/* Encabezado */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white uppercase italic flex items-center gap-3 tracking-tighter">
                  <Tag className={isEdit ? "text-blue-500" : "text-amber-500"} size={24} />
                  {isEdit ? "Gestionar Estructura" : "Crear Categoría"}
                </h2>
                <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* FORMULARIO 1: CATEGORÍA MADRE */}
              <form onSubmit={handleSubmitCategory} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-neutral-500 ml-1 tracking-[0.2em]">Categoría Principal</label>
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-white outline-none focus:border-neutral-700 transition-all font-medium" 
                      value={formData.name} 
                      onChange={e => setFormData({ name: e.target.value })} 
                      placeholder="Ej: Wetsuits, Tablas, Accesorios"
                      required
                    />
                    {isEdit && (
                      <button 
                        type="button" 
                        disabled={loading}
                        onClick={handleDeleteCategory}
                        className="px-4 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  variant={isEdit ? "outline" : "amarillo"} 
                  className={`w-full font-black uppercase italic rounded-2xl h-12 ${isEdit ? 'border-neutral-800 text-white hover:bg-neutral-900' : ''}`}
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : (isEdit ? "Actualizar Nombre Principal" : "Crear Categoría Madre")}
                </Button>
              </form>

              {/* SECCIÓN 2: SUBCATEGORÍAS (Solo visible en modo edición) */}
              {isEdit && (
                <div className="border-t border-neutral-900 pt-6 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                    <Layers size={14} className="text-amber-500" />
                    Subcategorías y Curvas de Talles
                  </h3>

                  {/* Listado */}
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {category.subCategories?.map((sub: any) => (
                      <div key={sub.id} className="flex justify-between items-center bg-neutral-900/50 border border-neutral-800/60 rounded-xl px-4 py-2.5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white uppercase">{sub.name}</span>
                          <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">
                            Talles: {sub.sizeType?.name || "Estándar / Único"}
                          </span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleDeleteSub(sub.id)} 
                          className="text-neutral-600 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {(!category.subCategories || category.subCategories.length === 0) && (
                      <p className="text-[11px] text-neutral-600 italic pl-1">No hay subcategorías en este grupo.</p>
                    )}
                  </div>

                  {/* Carga rápida */}
                  <form onSubmit={handleAddSubCategory} className="bg-neutral-900/30 border border-neutral-800/80 p-4 rounded-2xl space-y-3">
                    <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider">+ Vincular Subgrupo</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-neutral-700" 
                        value={subData.name}
                        onChange={e => setSubData({ ...subData, name: e.target.value })}
                        placeholder="Nombre (Ej: Adultos)"
                        required
                      />
                      <select 
                        className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none cursor-pointer"
                        value={subData.sizeTypeId}
                        onChange={e => setSubData({ ...subData, sizeTypeId: e.target.value })}
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
                      className="w-full bg-neutral-800 hover:bg-amber-500 hover:text-black text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-xl transition-all flex items-center justify-center gap-1 disabled:opacity-40"
                    >
                      {subLoading ? <Loader2 className="animate-spin" size={12} /> : <><Plus size={12} /> Confirmar Subgrupo</>}
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