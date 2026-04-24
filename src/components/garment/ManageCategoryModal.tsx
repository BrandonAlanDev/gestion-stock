"use client";

import { useState } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/actions/garments";
import { Button } from "@/components/ui/button";
import { X, Edit2, Trash2, Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ManageCategoryModalProps {
  sizeTypes: any[];
  category?: any; // Si existe, es modo edición
}

export default function ManageCategoryModal({ sizeTypes, category }: ManageCategoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!category;

  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    sizeTypeId: category?.sizeTypeId || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
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
        setIsOpen(false);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar esta categoría? No podrá borrarse si tiene productos vinculados.")) return;
    
    setLoading(true);
    const res = await deleteCategory(category.id);
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Categoría eliminada correctamente");
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Botón disparador: Cambia según si es edición o creación */}
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in duration-200">
            <div className={`absolute top-0 left-0 w-full h-1 ${isEdit ? 'bg-blue-500' : 'bg-amber-500'}`} />

            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white uppercase italic flex items-center gap-3 tracking-tighter">
                  <Tag className={isEdit ? "text-blue-500" : "text-amber-500"} size={24} />
                  {isEdit ? "Editar Categoría" : "Crear Categoría"}
                </h2>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-neutral-500 ml-1 tracking-[0.2em]">Nombre</label>
                  <input 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-white outline-none focus:border-amber-500/50 transition-all font-medium" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="Ej: Pantalones de Jean"
                    required
                  />
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-neutral-500 ml-1 tracking-[0.2em]">Descripción</label>
                  <textarea 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-white outline-none focus:border-amber-500/50 transition-all font-medium h-24 resize-none" 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    placeholder="Breve detalle de la categoría..."
                  />
                </div>

                {/* Grupo de Talles */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-neutral-500 ml-1 tracking-[0.2em]">Grupo de Talles</label>
                  <select 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-white outline-none focus:border-amber-500/50 transition-all font-medium appearance-none cursor-pointer" 
                    value={formData.sizeTypeId} 
                    onChange={e => setFormData({...formData, sizeTypeId: e.target.value})}
                  >
                    <option value="" className="bg-neutral-950">Sin talles asociados</option>
                    {sizeTypes.map((st: any) => (
                      <option key={st.id} value={st.id} className="bg-neutral-950">
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Acciones */}
                <div className="flex gap-3 pt-4">
                  {isEdit && (
                    <button 
                      type="button" 
                      disabled={loading}
                      onClick={handleDelete}
                      className="px-4 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all disabled:opacity-50"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    variant="amarillo" 
                    className="flex-1 font-black uppercase italic rounded-2xl h-14"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      isEdit ? "Guardar Cambios" : "Crear Categoría"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}